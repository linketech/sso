const { Service } = require('egg')

const ServiceError = require('../../util/ServiceError')

module.exports = class WebstieBaseService extends Service {
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
}
