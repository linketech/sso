const WebstieBaseService = require('./base')

const ServiceError = require('../../util/ServiceError')

const uuid = require('../../util/uuid')

module.exports = class RoleService extends WebstieBaseService {
	async getWebsiteByName(website_name) {
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

		return website
	}

	async index(website_name) {
		const { knex } = this.app

		const website = await this.getWebsiteByName(website_name)

		const websitePermissions = await knex
			.select()
			.column('id')
			.column('pattern')
			.column('create_time')
			.column('update_time')
			.column('group_name')
			.column('description')
			.from('website_permission')
			.where({
				website_id: website.id,
			})
			.orderBy('create_time', 'desc')

		return websitePermissions.map((obj) => {
			// eslint-disable-next-line no-param-reassign
			obj.id = obj.id.toString('hex')
			return obj
		})
	}

	async create(website_name, { pattern, group_name, description }) {
		const { knex } = this.app

		const website = await this.getWebsiteByName(website_name)

		const permission = await knex
			.select()
			.column('id')
			.from('website_permission')
			.where({
				pattern,
				website_id: website.id,
			})
			.first()

		if (permission) {
			throw new ServiceError({ message: '该网站已经存在该Pattern' })
		}

		const id = uuid.v1()
		const now = Date.now()
		await knex
			.insert({
				id,
				website_id: website.id,
				pattern,
				group_name,
				description,
				create_time: now,
				update_time: now,
			})
			.into('website_permission')
		return {
			id: id.toString('hex'),
		}
	}

	async update(website_name, permission_id, { pattern, group_name, description }) {
		const { knex } = this.app

		const website = await this.getWebsiteByName(website_name)

		const websitePermission = await knex
			.select()
			.column('id')
			.from('website_permission')
			.where({
				id: Buffer.from(permission_id, 'hex'),
				website_id: website.id,
			})
			.first()

		if (!websitePermission) {
			throw new ServiceError({ message: '指定网站不存在指定权限ID' })
		}

		const now = Date.now()
		await knex('website_permission')
			.where({
				id: websitePermission.id,
			})
			.update({
				pattern,
				group_name,
				description,
				update_time: now,
			})
	}

	async destroy(website_name, permission_id) {
		const { knex } = this.app

		const website = await this.getWebsiteByName(website_name)

		const websitePermission = await knex
			.select()
			.column('id')
			.from('website_permission')
			.where({
				id: Buffer.from(permission_id, 'hex'),
				website_id: website.id,
			})
			.first()

		if (!websitePermission) {
			throw new ServiceError({ message: '指定网站不存在指定权限ID' })
		}

		await knex('website_permission')
			.where({
				id: websitePermission.id,
			})
			.del()
	}
}
