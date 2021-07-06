const { Service } = require('egg')

const uuid = require('../util/uuid')

module.exports = class PermissionService extends Service {
	async show() {
		const { knex } = this.app
		const permissions = await knex
			.select()
			.column('id')
			.column('path')
			.column('method')
			.column('description')
			.column('group_name')
			.from('permission')
			.orderBy('group_name')
			.orderByRaw('case when method=\'GET\' then 0 when method=\'POST\' then 1 when method=\'DELETE\' then 2 when method=\'PUT\' then 3 else method end')
		return permissions
	}

	async list(idList) {
		const { knex } = this.app
		const roles = await knex
			.select()
			.column('id')
			.column('path')
			.column('method')
			.column('description')
			.column('group_name')
			.from('permission')
			.where((builder) => {
				if (idList && idList.length > 0) {
					builder.whereIn('id', idList)
				}
				return builder
			})

		return roles
	}

	async hasPermission(role_id, { path, method }) {
		const { knex } = this.app

		const permission = await knex
			.select()
			.column({ permission_id: 'permission.id' })
			.from('role_has_permission')
			.leftJoin('permission', 'role_has_permission.permission_id', 'permission.id')
			.where({
				'permission.path': path,
				'permission.method': method,
			})
			.where({
				'role_has_permission.role_id': role_id,
			})
			.first()

		return !!permission
	}

	async refresh(addList, subList) {
		const { knex } = this.app

		await knex.transaction(async (trx) => {
			if (addList && addList.length > 0) {
				addList.forEach((permission) => {
					Object.assign(permission, { id: uuid.v4() })
				})

				const now = Date.now()
				await trx
					.insert(addList.map(({ id, path, regexp, method, description, group_name }) => ({
						id,
						path,
						regexp,
						method,
						description,
						group_name,
						create_time: now,
					})))
					.into('permission')

				// 添加的新权限分配给Admin权限组
				const role = await trx
					.select()
					.column('id')
					.from('role')
					.where({ name: 'admin' })
					.first()
				await trx
					.insert(addList.map(({ id }) => ({
						role_id: role.id,
						permission_id: id,
					})))
					.into('role_has_permission')
			}

			if (subList && subList.length > 0) {
				const subIdList = subList.map(({ id }) => id)
				await trx('role_has_permission').whereIn('permission_id', subIdList).del()
				await trx('permission').whereIn('id', subIdList).del()
			}
		})
	}

	async getByRoleId(role_id) {
		const { knex } = this.app
		const permissions = await knex
			.select()
			.column('permission.id')
			.column('permission.path')
			.column('permission.method')
			.column('permission.description')
			.column('permission.group_name')
			.from('permission')
			.join('role_has_permission', 'permission.id', 'role_has_permission.permission_id')
			.where({
				'role_has_permission.role_id': role_id,
			})
		return permissions
	}

	async getById(id) {
		const { knex } = this.app

		const permission = await knex
			.select()
			.column('permission.id')
			.column('permission.path')
			.column('permission.method')
			.from('permission')
			.where({ id })
			.first()

		return permission
	}

	async update(id, { description, group_name }) {
		const { knex } = this.app
		await knex
			.update({
				description,
				group_name,
			})
			.table('permission')
			.where({ id })
	}
}
