const { Service } = require('egg')

module.exports = class RoleWebsiteService extends Service {
	async list({ role_id, website_id } = {}) {
		const { knex } = this.app
		const websites = await knex
			.select()
			.column(knex.raw('hex(role.id) as role_id'))
			.column({ role_name: 'role.name' })
			.column(knex.raw('hex(website.id) as website_id'))
			.column({ website_name: 'website.name' })
			.from('role_has_website')
			.leftJoin('role', 'role_has_website.role_id', 'role.id')
			.leftJoin('website', 'role_has_website.website_id', 'website.id')
			.where((builder) => {
				if (role_id !== undefined) {
					builder.where('role_has_permission.role_id', role_id)
				}
				if (website_id !== undefined) {
					builder.where('role_has_permission.website_id', website_id)
				}
				return builder
			})
		return websites
	}

	async getById({ role_id, website_id }) {
		const { knex } = this.app

		const website = await knex
			.select()
			.column(knex.raw('1'))
			.from('role_has_website')
			.where({
				role_id,
				website_id,
			})
			.first()

		return website
	}

	async create({ role_id, website_id }) {
		const { knex } = this.app
		await knex
			.insert({
				role_id,
				website_id,
			})
			.into('role_has_website')
	}

	async destroy({ role_id, website_id }) {
		const { knex } = this.app
		await knex('role_has_website')
			.where({
				role_id,
				website_id,
			})
			.del()
	}
}
