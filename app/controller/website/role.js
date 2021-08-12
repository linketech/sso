const { Controller } = require('egg')

module.exports = class UserController extends Controller {
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

		response.body = await ctx.service.website.role.index(website_name)
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
			},
			body: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						maxLength: 45,
					},
				},
				required: ['name'],
			},
		})

		const { website_name } = ctx.params
		const { name } = request.body

		response.body = await ctx.service.website.role.create(website_name, name)
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
					role_name: {
						type: 'string',
						maxLength: 45,
					},
				},
			},
		})

		const { website_name, role_name } = ctx.params

		response.body = await ctx.service.website.role.destroy(website_name, role_name)
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
					role_name: {
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
				},
				required: ['name'],
			},
		})

		const { website_name, role_name } = ctx.params
		const new_role_name = request.body.name

		response.body = await ctx.service.website.role.update(website_name, role_name, new_role_name)
	}
}
