const { Service } = require('egg')

const uuid = require('../util/uuid')

module.exports = class RoleService extends Service {
	async getByName(name) {
		const { knex } = this.app

		const root = await knex
			.select()
			.column('id')
			.from('role')
			.where({ name })
			.first()

		return root
	}

	async getById(id) {
		const { knex } = this.app

		const root = await knex
			.select()
			.column('id')
			.from('role')
			.where({ id })
			.first()

		return root
	}

	async create(name) {
		const { knex } = this.app
		const id = uuid.v4()
		await knex
			.insert({
				id,
				name,
				create_time: Date.now(),
			})
			.into('role')
		return { id }
	}

	async list() {
		const { knex } = this.app
		const roles = await knex
			.select()
			.column(knex.raw('hex(id) as id'))
			.column('name')
			.from('role')

		return roles
	}

	async destroy(id) {
		const { knex } = this.app

		await knex('role')
			.where({ id })
			.del()
	}
}
