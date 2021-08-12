const { Controller } = require('egg')

const { PUBLIC_KEY } = require('../../constant')

module.exports = class WebstieKeyController extends Controller {
	async index() {
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

		response.body = await ctx.service.website.key.index(website_name)
	}

	async create() {
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
				required: ['website_name'],
			},
			body: {
				type: 'object',
				properties: {
					algorithm_name: {
						type: 'string',
						enum: Object.keys(PUBLIC_KEY),
					},
					key: {
						type: 'string',
						maxLength: 65535,
					},
				},
				required: ['algorithm_name', 'key'],
			},
		})

		const { website_name } = ctx.params
		const { algorithm_name, key } = request.body

		response.body = await ctx.service.website.key.create(website_name, algorithm_name, key)
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
					algorithm_name: {
						type: 'string',
						enum: Object.keys(PUBLIC_KEY),
					},
				},
				required: ['website_name', 'algorithm_name'],
			},
		})

		const { website_name, algorithm_name } = ctx.params

		await ctx.service.website.key.destroy(website_name, algorithm_name)
		response.status = 200
	}
}
