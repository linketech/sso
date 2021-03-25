const { Service } = require('egg')

module.exports = class RolePermissionService extends Service {
	async list({ role_id, permission_id } = {}) {
		const { knex } = this.app
		const permissions = await knex
			.select()
			.column({
				role_id: 'role.id',
				role_name: 'role.name',
				permission_id: 'permission.id',
				permission_path: 'permission.path',
				permission_method: 'permission.method',
			})
			.from('role_has_permission')
			.leftJoin('role', 'role_has_permission.role_id', 'role.id')
			.leftJoin('permission', 'role_has_permission.permission_id', 'permission.id')
			.where((builder) => {
				if (role_id !== undefined) {
					builder.where('role_has_permission.role_id', role_id)
				}
				if (permission_id !== undefined) {
					builder.where('role_has_permission.permission_id', permission_id)
				}
				return builder
			})
		return permissions
	}

	async update(roleId, permissionIdList) {
		const { knex } = this.app

		await knex.transaction(async (trx) => {
			await trx('role_has_permission').where({ role_id: roleId }).del()
			if (permissionIdList && permissionIdList.length > 0) {
				await trx('role_has_permission').insert(permissionIdList.map((permissionId) => ({
					role_id: roleId,
					permission_id: permissionId,
				})))
			}
		})
	}
}
