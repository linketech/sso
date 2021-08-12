const { Controller } = require('egg')

module.exports = class RolePermissionController extends Controller {
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
					role_name: {
						type: 'string',
						maxLength: 45,
					},
				},
				required: ['website_name', 'role_name'],
			},
		})

		const { website_name, role_name } = ctx.params

		response.body = await ctx.service.website.rolePermission.index(website_name, role_name)
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
					role_name: {
						type: 'string',
						maxLength: 45,
					},
				},
				required: ['website_name', 'role_name'],
			},
			body: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							pattern: '^[0-9a-zA-Z]{32}$',
						},
					},
					required: ['id'],
				},
			},
		})

		const { website_name, role_name } = ctx.params
		const permissionList = request.body

		await ctx.service.website.rolePermission.update(website_name, role_name, permissionList)
		response.status = 200
	}
}
