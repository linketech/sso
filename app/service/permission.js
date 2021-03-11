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
			const promiseList = []

			if (addList && addList.length > 0) {
				const now = Date.now()
				promiseList.push(trx
					.insert(addList.map((permission) => ({
						id: uuid.v4(),
						path: permission.path,
						regexp: permission.regexp,
						method: permission.method,
						create_time: now,
					})))
					.into('permission'))
			}

			if (subList && subList.length > 0) {
				subList.forEach((permission) => {
					promiseList.push(trx('role_has_permission').where({ permission_id: permission.id }).del())
					promiseList.push(trx('permission').where({ id: permission.id }).del())
				})
			}

			if (promiseList && promiseList.length > 0) {
				await Promise.all(promiseList)
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
