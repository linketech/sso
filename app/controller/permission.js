const { Controller } = require('egg')

module.exports = class PermissionController extends Controller {
	async index() {
		const { ctx } = this
		const { response } = ctx
		response.body = await ctx.service.permission.show()
	}

	async update() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
			},
		}, request.query)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const bodyErrors = app.validator.validate({
			description: {
				type: 'string',
				max: 45,
			},
			group_name: {
				type: 'string',
				max: 45,
			},
		}, request.body)

		if (bodyErrors) {
			response.body = { message: '无效请求参数', errors: bodyErrors }
			response.status = 400
			return
		}

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
