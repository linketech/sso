const { Service } = require('egg')

const uuid = require('../util/uuid')

module.exports = class WebsiteService extends Service {
	async list() {
		const { knex } = this.app
		const websites = await knex
			.select()
			.column('id')
			.column('name')
			.column('origin_url')
			.column('login_path')
			.column('create_time')
			.from('website')
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
			.column('website.name')
			.from('website')
			.leftJoin('role_has_website', 'website.id', 'role_has_website.website_id')
			.leftJoin('role', 'role_has_website.role_id', 'role.id')
			.where({ 'role.id': role_id })

		return websites
	}

	async create({ name, origin_url, login_path }) {
		const { knex } = this.app
		const id = uuid.v4()

		await knex.transaction(async (trx) => {
			await knex
				.insert({
					id,
					name,
					origin_url,
					login_path,
					create_time: Date.now(),
				})
				.into('website')

			// 添加的新网站分配给Admin权限组
			const role = await trx
				.select()
				.column('id')
				.from('role')
				.where({ name: 'admin' })
				.first()

			await trx
				.insert({
					role_id: role.id,
					website_id: id,
				})
				.into('role_has_website')
		})
		return { id }
	}

	async destroy(id) {
		const { knex } = this.app

		await knex('website')
			.where({ id })
			.del()
	}

	async update(id, { name, origin_url, login_path, redirect_path }) {
		const { knex } = this.app
		await knex
			.update({
				name,
				origin_url,
				login_path,
				redirect_path,
			})
			.table('website')
			.where({ id })
	}
}
