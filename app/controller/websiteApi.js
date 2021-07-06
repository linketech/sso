const { Controller } = require('egg')

module.exports = class WebstieApiController extends Controller {
	async updateRolePermission() {
		const { ctx } = this
		const { request, response } = ctx

		ctx.validate({
			body: {
				type: 'array',
				items: {
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
			},
		})
		const { website } = ctx.jwt
		const permissions = request.body

		await ctx.service.websiteApi.updateRolePermission(website.name, permissions)

		response.status = 200
	}

	async getPermissionsByUserName() {
		const { ctx } = this
		const { response } = ctx

		ctx.validate({
			params: {
				type: 'object',
				properties: {
					user_name: {
						type: 'string',
						maxLength: 45,
					},
				},
				required: ['user_name'],
			},
		})

		const { website } = ctx.jwt
		const { user_name } = ctx.params

		response.body = await ctx.service.websiteApi.listPermissionByUsername(website.name, user_name)
		response.status = 200
	}

	async getPermissionsByRoleName() {
		const { ctx } = this
		const { response } = ctx

		ctx.validate({
			params: {
				type: 'object',
				properties: {
					role_name: {
						type: 'string',
						maxLength: 45,
					},
				},
				required: ['role_name'],
			},
		})

		const { website } = ctx.jwt
		const { role_name } = ctx.params

		response.body = await ctx.service.websiteApi.listPermissionByRolename(website.name, role_name)
		response.status = 200

		response.status = 200
	}
}
