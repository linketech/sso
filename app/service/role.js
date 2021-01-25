const { Service } = require('egg')

const uuid = require('../util/uuid')

module.exports = class UserService extends Service {
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
}
