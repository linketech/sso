const { Service } = require('egg')

const uuid = require('../util/uuid')

module.exports = class PermissionService extends Service {
	async list(idList) {
		const { knex } = this.app
		const roles = await knex
			.select()
			.column('id')
			.column('path')
			.column('method')
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
					.insert(addList.map(({ id, path, regexp, method }) => ({
						id,
						path,
						regexp,
						method,
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
				subList.forEach(async ({ id }) => {
					await trx('role_has_permission').where({ permission_id: id }).del()
					await trx('permission').where({ id }).del()
				})
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
			.from('role_has_permission')
			.join('permission', 'role_has_permission.permission_id', 'permission.id')
			.where({
				'role_has_permission.role_id': role_id,
			})
		return permissions
	}
}
