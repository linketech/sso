const { Service } = require('egg')

const uuid = require('../util/uuid')

module.exports = class RoleService extends Service {
	async getByName(name) {
		const { knex } = this.app

		const role = await knex
			.select()
			.column('id')
			.from('role')
			.where({ name })
			.first()

		return role
	}

	async getById(id) {
		const { knex } = this.app

		const root = await knex
			.select()
			.column('id')
			.column('name')
			.from('role')
			.where({ id })
			.first()

		return root
	}

	async getByUserId(user_id) {
		const { knex } = this.app

		const role = await knex
			.select()
			.column('role.id')
			.column('role.name')
			.from('role')
			.leftJoin('user', 'role.id', 'user.role_id')
			.where({ 'user.id': user_id })
			.first()

		return role
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
			.column('id')
			.column('name')
			.from('role')

		return roles
	}

	async destroy(id) {
		const { knex } = this.app

		await knex.transaction(async (trx) => {
			await trx('user').where({ role_id: id }).update({ role_id: null })
			await trx('role_has_permission').where({ role_id: id }).del()
			await trx('role').where({ id }).del()
		})
	}
}
