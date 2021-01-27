const { Service } = require('egg')

module.exports = class PermissionService extends Service {
	async list(idList) {
		const { knex } = this.app
		const roles = await knex
			.select()
			.column(knex.raw('hex(id) as id'))
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
}
