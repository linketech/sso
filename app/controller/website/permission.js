const { Controller } = require('egg')

module.exports = class PermissionController extends Controller {
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
				required: ['website_name'],
			},
		})

		const { website_name } = ctx.params

		response.body = await ctx.service.website.permission.index(website_name)
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
					pattern: {
						type: 'string',
						maxLength: 45,
					},
					group_name: {
						type: 'string',
						maxLength: 45,
					},
					description: {
						type: 'string',
						maxLength: 45,
					},
				},
			},
		})

		const { website_name } = ctx.params
		const { pattern, group_name, description } = request.body

		response.body = await ctx.service.website.permission.create(website_name, { pattern, group_name, description })
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
					permission_id: {
						type: 'string',
						maxLength: 45,
					},
				},
				required: ['website_name', 'permission_id'],
			},
			body: {
				type: 'object',
				properties: {
					pattern: {
						type: 'string',
						maxLength: 45,
					},
					group_name: {
						type: 'string',
						maxLength: 45,
					},
					description: {
						type: 'string',
						maxLength: 45,
					},
				},
				required: ['pattern'],
			},
		})

		const { website_name, permission_id } = ctx.params
		const { pattern, group_name, description } = request.body

		await ctx.service.website.permission.update(website_name, permission_id, { pattern, group_name, description })
		response.status = 200
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
					permission_id: {
						type: 'string',
						maxLength: 45,
					},
				},
				required: ['website_name', 'permission_id'],
			},
		})

		const { website_name, permission_id } = ctx.params

		await ctx.service.website.permission.destroy(website_name, permission_id)
		response.status = 200
	}
}
