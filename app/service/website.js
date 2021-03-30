const { Service } = require('egg')

const uuid = require('../util/uuid')

module.exports = class WebsiteService extends Service {
	async list(idList) {
		const { knex } = this.app
		const websites = await knex
			.select()
			.column('id')
			.column('name')
			.column('url')
			.column('group_name')
			.column('create_time')
			.from('website')
			.where((builder) => {
				if (idList && idList.length > 0) {
					builder.whereIn('id', idList)
				}
				return builder
			})
			.orderBy('create_time', 'desc')
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

	async getByRoleId(role_id) {
		const { knex } = this.app

		const websites = await knex
			.select()
			.column('website.id')
			.column('website.name')
			.column('website.url')
			.column('website.group_name')
			.from('website')
			.leftJoin('role_has_website', 'website.id', 'role_has_website.website_id')
			.where({
				'role_has_website.role_id': role_id,
			})

		return websites
	}

	async create({ name, url, group_name }) {
		const { knex } = this.app
		const id = uuid.v4()

		await knex.transaction(async (trx) => {
			await trx
				.insert({
					id,
					name,
					url,
					group_name,
					create_time: Date.now(),
				})
				.into('website')

			const role = await trx('role')
				.select()
				.column('id')
				.where({ name: 'admin' })
				.first()

			await trx('role_has_website')
				.insert({
					role_id: role.id,
					website_id: id,
				})
		})

		return { id }
	}

	async destroy(id) {
		const { knex } = this.app

		await knex.transaction(async (trx) => {
			await trx('role_has_website')
				.where({
					website_id: id,
				})
				.del()

			await trx('website')
				.where({ id })
				.del()
		})
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
