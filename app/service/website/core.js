const { Service } = require('egg')

const uuid = require('../../util/uuid')

module.exports = class WebsiteService extends Service {
	async show() {
		const { knex } = this.app
		const websites = await knex
			.select()
			.column('id')
			.column('name')
			.column('url')
			.column('group_name')
			.column('create_time')
			.from('website')
			.orderBy('create_time', 'desc')
		return websites
	}

	async list(idList) {
		const { knex } = this.app
		const websites = await knex
			.select()
			.column('id')
			.from('website')
			.where((builder) => {
				if (idList && idList.length > 0) {
					builder.whereIn('id', idList)
				}
				return builder
			})
		return websites
	}

	async getByName(name) {
		const { knex } = this.app

		const website = await knex
			.select()
			.column('id')
			.from('website')
			.where({ name })
			.first()

		return website
	}

	async getById(id) {
		const { knex } = this.app

		const website = await knex
			.select()
			.column('name')
			.from('website')
			.where({ id })
			.first()

		return website
	}

	async create({ name, url, group_name }) {
		const { knex } = this.app
		const id = uuid.v4()

		await knex
			.insert({
				id,
				name,
				url,
				group_name,
				create_time: Date.now(),
			})
			.into('website')

		return { id }
	}

	async destroy(id) {
		const { knex } = this.app

		await knex('website')
			.where({ id })
			.del()
	}

	async update(id, { name, url, group_name }) {
		const { knex } = this.app
		await knex
			.update({
				name,
				url,
				group_name,
			})
			.table('website')
			.where({ id })
	}
}
