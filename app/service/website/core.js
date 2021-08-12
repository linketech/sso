const { Service } = require('egg')

const ServiceError = require('../../util/ServiceError')

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

	async destroy(name) {
		const { knex } = this.app

		const website = await knex
			.select()
			.column('id')
			.from('website')
			.where({
				name,
			})
			.first()
		if (!website) {
			throw new ServiceError({ message: '指定的网站名不存在' })
		}

		await knex.transaction(async (trx) => {
			await trx('user_has_website')
				.where({
					website_id: website.id,
				})
				.del()
			await trx('website_role_has_website_permission')
				.whereIn('website_role_id', trx.select('id').from('website_role').where({
					website_id: website.id,
				}))
				.orWhereIn('website_permission_id', trx.select('id').from('website_permission').where({
					website_id: website.id,
				}))
				.del()
			await trx('website_role')
				.where({
					website_id: website.id,
				})
				.del()
			await trx('website_permission')
				.where({
					website_id: website.id,
				})
				.del()
			await trx('website')
				.where({
					id: website.id,
				})
				.del()
		})
	}

	async update(name, newWebsite) {
		const { knex } = this.app

		const website = await knex
			.select()
			.column('id')
			.from('website')
			.where({
				name,
			})
			.first()
		if (!website) {
			throw new ServiceError({ message: '指定的网站名不存在' })
		}

		const sameNameWebsite = await knex
			.select()
			.column('id')
			.from('website')
			.where({
				name,
			})
			.whereNot({
				id: website.id,
			})
			.first()
		if (sameNameWebsite) {
			throw new ServiceError({ message: '指定的网站名已经存在' })
		}

		await knex
			.update({
				name: newWebsite.name,
				url: newWebsite.url,
				group_name: newWebsite.group_name,
			})
			.table('website')
			.where({
				id: website.id,
			})
	}
}
