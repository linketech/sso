const { Service } = require('egg')

const uuid = require('../util/uuid')
const ServiceError = require('../util/ServiceError')

function isNil(value) {
	return value === undefined || value === null
}

function ifNilThenNull(value) {
	return isNil(value) ? null : value
}

module.exports = class websiteApiService extends Service {
	async updateRolePermission(website_name, permissions) {
		const now = Date.now()

		const { knex } = this.app

		const website = await this.service.website.base.getWebsiteByName(website_name)

		// 如果不存在admin角色，则增加admin角色
		let role = await knex
			.select()
			.column('id')
			.from('website_role')
			.where({
				name: 'admin',
				website_id: website.id,
			})
			.first()
		if (!(role && role.id)) {
			role = {
				id: uuid.v1(),
				website_id: website.id,
				name: 'admin',
				create_time: now,
			}
			await knex
				.insert(role)
				.into('website_role')
		}
		// 查询之前的权限集，算出新增权限集A、删除权限集B、更新权限集C
		const dbWebsitePermissions = await knex
			.select()
			.column('id')
			.column('pattern')
			.column('group_name')
			.column('description')
			.from('website_permission')
			.where({
				website_id: website.id,
			})
		// console.log('permissions', permissions)
		// console.log('dbWebsitePermissions', dbWebsitePermissions)
		const chain = {}
		;[permissions, dbWebsitePermissions].forEach((list, index) => {
			list.forEach((permission) => {
				const key = permission.pattern
				if (!chain[key]) {
					chain[key] = []
				}
				chain[key][index] = permission
			})
		}, {})

		const addList = []
		const subList = []
		const updateList = []
		Object.keys(chain).forEach((key) => {
			const [inCode, inDb] = chain[key]

			if (inCode && !inDb) {
				addList.push(inCode)
			} else if (!inCode && inDb) {
				subList.push(inDb)
			} else if (inCode && inDb) {
				if (ifNilThenNull(inCode.group_name) !== ifNilThenNull(inDb.group_name) || ifNilThenNull(inCode.description) !== ifNilThenNull(inDb.description)) {
					updateList.push({
						id: inDb.id,
						group_name: ifNilThenNull(inCode.group_name),
						description: ifNilThenNull(inCode.description),
					})
				}
			}
		})
		// console.log('subList', subList)
		// console.log('addList', addList)
		// console.log('updateList', updateList)
		if (subList.length + addList.length + updateList.length > 0) {
			await knex.transaction(async (trx) => {
				// 删除A权限集，及权限和角色的关系
				if (subList.length > 0) {
					const subIDList = subList.map(({ id }) => id)
					await trx('website_role_has_website_permission')
						.whereIn('website_permission_id', subIDList) // 注意Permission是要属于website的
						.del()
					await trx('website_permission')
						.whereIn('id', subIDList) // 注意Permission是要属于website的
						.del()
				}
				// 新增B权限集，及将新权限分配给admin角色
				if (addList.length > 0) {
					const newAddList = addList.map((permission) => ({
						id: uuid.v1(),
						...permission,
					}))
					await trx
						.insert(newAddList.map(({ id, pattern, group_name, description }) => ({
							id,
							website_id: website.id,
							pattern,
							create_time: now,
							update_time: now,
							group_name,
							description,
						})))
						.into('website_permission')
					await trx
						.insert(newAddList.map(({ id }) => ({
							website_role_id: role.id,
							website_permission_id: id,
						})))
						.into('website_role_has_website_permission')
				}
				// 更新C权限集，更新关键字外的其它字段(一些备注信息等)
				if (updateList.length > 0) {
					await Promise.all(updateList.map((permission) => knex('website_permission')
						.where({
							pattern: permission.id,
						})
						.update({
							group_name: permission.group_name,
							description: permission.description,
							update_time: now,
						})))
				}
			})
		}
	}

	async listPermissionByUsername(website_name, user_name) {
		const { knex } = this.app

		const website = await this.service.website.base.getWebsiteByName(website_name)

		const user = await knex
			.select()
			.column('id')
			.from('user')
			.where({
				name: user_name,
			})
			.first()
		if (!(user && user.id)) {
			throw new ServiceError({ message: '指定的用户名不存在' })
		}

		const websiteRole = await knex
			.select()
			.column('wr.id')
			.from('website_role as wr')
			.leftJoin('user_has_website as uhw', 'uhw.website_role_id', 'wr.id')
			.where({
				'uhw.website_id': website.id,
				'uhw.user_id': user.id,
			})
			.first()
		if (!(websiteRole && websiteRole.id)) {
			throw new ServiceError({ message: '指定的用户名不存在网站角色' })
		}

		const websitePermissionList = await knex
			.select()
			.column('pattern')
			.from('website_permission as wp')
			.leftJoin('website_role_has_website_permission as wr_wp', 'wp.id', 'wr_wp.website_permission_id')
			.where({
				'wr_wp.website_role_id': websiteRole.id,
			})

		return websitePermissionList.map(({ pattern }) => pattern)
	}

	async listPermissionByRolename(website_name, role_name) {
		const { knex } = this.app

		const website = await this.service.website.base.getWebsiteByName(website_name)

		const websiteRole = await knex
			.select()
			.column('id')
			.from('website_role')
			.where({
				website_id: website.id,
				name: role_name,
			})
			.first()
		if (!(websiteRole && websiteRole.id)) {
			throw new ServiceError({ message: '指定的角色名不存在' })
		}

		const websitePermissionList = await knex
			.select()
			.column('pattern')
			.from('website_permission as wp')
			.leftJoin('website_role_has_website_permission as wr_wp', 'wp.id', 'wr_wp.website_permission_id')
			.where({
				'wr_wp.website_role_id': websiteRole.id,
			})

		return websitePermissionList.map(({ pattern }) => pattern)
	}
}
