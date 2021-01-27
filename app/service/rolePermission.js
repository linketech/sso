const { Service } = require('egg')

module.exports = class RolePermissionService extends Service {
	async getByRoleId(roleId) {
		const { knex } = this.app
		const permissions = await knex
			.select()
			.column(knex.raw('hex(permission_id) as id'))
			.column('permission.path')
			.column('permission.method')
			.from('role_has_permission')
			.leftJoin('permission', 'role_has_permission.permission_id', 'permission.id')
			.where({ 'role_has_permission.role_id': roleId })
		return permissions
	}

	async create(roleId, permissionIdList) {
		const { knex } = this.app
		await knex
			.insert(permissionIdList.map((permissionId) => ({
				role_id: roleId,
				permission_id: permissionId,
			})))
			.into('role_has_permission')
	}

	async destroy(roleId, permissionIdList) {
		const { knex } = this.app

		await knex.transaction((trx) => Promise.all(permissionIdList.map((permissionId) => trx('role_has_permission')
			.where({
				role_id: roleId,
				permission_id: permissionId,
			})
			.del())))
	}

	async update(roleId, permissionIdList) {
		const { knex } = this.app

		await knex.transaction((trx) => Promise.all([
			trx('role_has_permission').where({ role_id: roleId }).del(),
			trx('role_has_permission').insert(permissionIdList.map((permissionId) => ({
				role_id: roleId,
				permission_id: permissionId,
			}))),
		]))
	}
}
