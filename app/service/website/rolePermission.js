const WebstieBaseService = require('./base')

const ServiceError = require('../../util/ServiceError')

module.exports = class RoleService extends WebstieBaseService {
	async getWebsiteRoleByName(website_id, website_role_name) {
		const { knex } = this.app

		const websiteRole = await knex
			.select()
			.column('id')
			.from('website_role')
			.where({
				website_id,
				name: website_role_name,
			})
			.first()
		if (!(websiteRole && websiteRole.id)) {
			throw new ServiceError({ message: '指定网站名的指定角色不存在' })
		}

		return websiteRole
	}

	async listWebsitePermissionByIDList(website_id, permissionIDList) {
		const { knex } = this.app

		const websitePermissionList = await knex
			.select()
			.column('id')
			.from('website_permission')
			.where('website_id', website_id)
			.whereIn('id', permissionIDList.map(({ id }) => Buffer.from(id, 'hex')))

		const permissionMap = websitePermissionList.reduce((previousValue, currentValue) => {
			// eslint-disable-next-line no-param-reassign
			previousValue[currentValue.id.toString('hex')] = currentValue
			return previousValue
		}, {})
		const notInList = permissionIDList.filter(({ id }) => !permissionMap[id])
		if (notInList && notInList.length > 0) {
			throw new ServiceError({ message: '指定网站名的部分权限ID不存在', value: notInList })
		}

		return websitePermissionList
	}

	async index(website_name, role_name) {
		const { knex } = this.app

		const website = await this.getWebsiteByName(website_name)
		const websiteRole = await this.getWebsiteRoleByName(website.id, role_name)

		const websitePermissions = await knex
			.select()
			.column('wp.id')
			.column('wp.pattern')
			.column('wp.create_time')
			.column('wp.group_name')
			.column('wp.description')
			.from('website_role as wr')
			.leftJoin('website_role_has_website_permission as wr_wp', 'wr.id', 'wr_wp.website_role_id')
			.leftJoin('website_permission as wp', 'wr_wp.website_permission_id', 'wp.id')
			.where({
				'wp.website_id': website.id,
				'wr.website_id': website.id,
				'wr.id': websiteRole.id,
			})
			.orderBy('wp.create_time', 'desc')

		return websitePermissions.map((obj) => {
			// eslint-disable-next-line no-param-reassign
			obj.id = obj.id.toString('hex')
			return obj
		})
	}

	async update(website_name, role_name, permissionIDList) {
		const { knex } = this.app

		const website = await this.getWebsiteByName(website_name)
		const websiteRole = await this.getWebsiteRoleByName(website.id, role_name)
		const permissionList = await this.listWebsitePermissionByIDList(website.id, permissionIDList)

		await knex.transaction(async (trx) => {
			await trx('website_role_has_website_permission').where({
				website_role_id: websiteRole.id,
			}).del()
			if (permissionList && permissionList.length > 0) {
				await trx('website_role_has_website_permission').insert(permissionList.map(({ id }) => ({
					website_role_id: websiteRole.id,
					website_permission_id: id,
				})))
			}
		})
	}
}
