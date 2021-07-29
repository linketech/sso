const { Controller } = require('egg')

module.exports = class WebstieController extends Controller {
	async index() {
		const { ctx } = this
		const { response } = ctx

		const websites = await ctx.service.website.core.show()

		response.body = websites.map((website) => ({
			id: website.id.toString('hex'),
			name: website.name,
			url: website.url,
			group_name: website.group_name,
			create_time: website.create_time,
		}))
	}

	async create() {
		const { ctx } = this
		const { request, response } = ctx

		ctx.validate({
			body: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						maxLength: 45,
					},
					url: {
						type: 'string',
						maxLength: 90,
					},
					group_name: {
						type: 'string',
						maxLength: 45,
					},
				},
				required: ['name', 'url', 'group_name'],
			},
		})

		const { name, url, group_name } = request.body

		const website = await ctx.service.website.core.getByName(name)
		if (website) {
			ctx.response.body = { message: '网站名已经存在' }
			ctx.response.status = 400
			return
		}

		const { id } = await ctx.service.website.core.create({
			name,
			url,
			group_name,
		})

		response.body = { id: id.toString('hex') }
	}

	async destroy() {
		const { ctx } = this
		const { response } = ctx

		ctx.validate({
			params: {
				type: 'object',
				properties: {
					website_name: {
						type: 'string',
						maxLength: 45,
					},
				},
			},
		})

		const { website_name } = ctx.params

		await ctx.service.website.core.destroy(website_name)

		response.status = 200
	}

	async update() {
		const { ctx } = this
		const { request, response } = ctx

		ctx.validate({
			params: {
				type: 'object',
				properties: {
					website_name: {
						type: 'string',
						maxLength: 45,
					},
				},
			},
			body: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						maxLength: 45,
					},
					url: {
						type: 'string',
						maxLength: 90,
					},
					group_name: {
						type: 'string',
						maxLength: 45,
					},
				},
			},
		})

		const { website_name } = ctx.params
		const { name, url, group_name } = request.body

		await ctx.service.website.core.update(website_name, {
			name,
			url,
			group_name,
		})

		response.status = 200
	}
}
