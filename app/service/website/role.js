const { Service } = require('egg')

const ServiceError = require('../../util/ServiceError')

const uuid = require('../../util/uuid')

module.exports = class RoleService extends Service {
	async index(website_name) {
		const { knex } = this.app

		const website = await knex
			.select()
			.column('id')
			.from('website')
			.where({
				name: website_name,
			})
			.first()
		if (!(website && website.id)) {
			throw new ServiceError({ message: '网站名不存在' })
		}

		const websiteRoles = await knex
			.select()
			.column('name')
			.column('create_time')
			.from('website_role')
			.where({
				website_id: website.id,
			})
			.orderBy('create_time', 'desc')

		return websiteRoles
	}

	async create(website_name, name) {
		const { knex } = this.app

		const website = await knex
			.select()
			.column('id')
			.from('website')
			.where({
				name: website_name,
			})
			.first()
		if (!(website && website.id)) {
			throw new ServiceError({ message: '网站名不存在' })
		}

		const role = await knex
			.select()
			.column('id')
			.from('website_role')
			.where({
				name,
				website_id: website.id,
			})
			.first()

		if (role) {
			throw new ServiceError({ message: '该网站已经存在该角色名' })
		}

		const id = uuid.v1()
		await knex
			.insert({
				id,
				website_id: website.id,
				name,
				create_time: Date.now(),
			})
			.into('website_role')
		return {
			id: id.toString('hex'),
		}
	}

	async destroy(website_name, role_name) {
		const { knex } = this.app

		const website = await knex
			.select()
			.column('id')
			.from('website')
			.where({
				name: website_name,
			})
			.first()
		if (!(website && website.id)) {
			throw new ServiceError({ message: '网站名不存在' })
		}

		const websiteRole = await knex
			.select()
			.column('id')
			.from('website_role')
			.where({
				website_id: website.id,
				name: role_name,
			})
			.first()
		if (!(websiteRole && websiteRole.id)) {
			throw new ServiceError({ message: '指定网站名的角色名不存在' })
		}

		await knex.transaction(async (trx) => {
			await trx('user_has_website')
				.where({
					website_role_id: websiteRole.id,
				})
				.del()
			await trx('website_role_has_website_permission')
				.where({
					website_role_id: websiteRole.id,
				})
				.del()
			await trx('website_role')
				.where({
					id: websiteRole.id,
				})
				.del()
		})
	}

	async update(website_name, role_name, new_role_name) {
		const { knex } = this.app

		const website = await knex
			.select()
			.column('id')
			.from('website')
			.where({
				name: website_name,
			})
			.first()
		if (!(website && website.id)) {
			throw new ServiceError({ message: '网站名不存在' })
		}

		const websiteRole = await knex
			.select()
			.column('id')
			.from('website_role')
			.where({
				website_id: website.id,
				name: role_name,
			})
			.first()
		if (!(websiteRole && websiteRole.id)) {
			throw new ServiceError({ message: '指定网站名的角色名不存在' })
		}

		const newWebsiteRole = await knex
			.select()
			.column('id')
			.from('website_role')
			.where({
				name: new_role_name,
				website_id: website.id,
			})
			.first()

		if (newWebsiteRole) {
			throw new ServiceError({ message: '该网站已经存在该角色名' })
		}

		await knex('website_role')
			.where({
				id: websiteRole.id,
			})
			.update({
				name: new_role_name,
			})
	}
}
