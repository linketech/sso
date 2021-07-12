const { Controller } = require('egg')

module.exports = class PermissionController extends Controller {
	async index() {
		const { ctx } = this
		const { response } = ctx
		const permissions = await ctx.service.permission.show()
		response.body = permissions.map((permission) => ({
			id: permission.id.toString('hex'),
			path: permission.path,
			method: permission.method,
			description: permission.description,
			group_name: permission.group_name,
		}))
	}

	async update() {
		const { ctx } = this
		const { request, response } = ctx

		ctx.validate({
			query: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						pattern: '^[0-9A-Fa-f]{32}$',
					},
				},
				required: ['id'],
			},
			body: {
				type: 'object',
				properties: {
					description: {
						type: 'string',
						maxLength: 45,
					},
					group_name: {
						type: 'string',
						maxLength: 45,
					},
				},
			},
		})

		const id = Buffer.from(request.query.id, 'hex')
		const { description, group_name } = request.body

		const permission = await ctx.service.permission.getById(id)
		if (!permission) {
			ctx.response.body = { message: '权限不存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.permission.update(id, {
			description,
			group_name,
		})

		response.status = 200
	}
}
