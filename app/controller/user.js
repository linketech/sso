const { Controller } = require('egg')

module.exports = class UserController extends Controller {
	async index() {
		const { ctx } = this
		const { response } = ctx

		const users = await ctx.service.user.list()

		response.body = users
	}

	async update() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
			},
			role_id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
			},
		}, request.body)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const id = Buffer.from(request.body.id, 'hex')
		const roleId = Buffer.from(request.body.role_id, 'hex')

		const user = await ctx.service.user.getById(id)
		if (!user) {
			response.body = { message: '用户不存在' }
			response.status = 400
			return
		}

		const role = await ctx.service.role.getById(roleId)
		if (!role) {
			response.body = { message: '权限组不存在' }
			response.status = 400
			return
		}

		await ctx.service.user.updateRole(id, roleId)

		response.status = 200
	}

	async destroy() {
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

		const id = Buffer.from(request.query.id, 'hex')

		const user = await ctx.service.user.getById(id)
		if (!user) {
			ctx.response.body = { message: '用户不存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.user.destroy(id)

		response.status = 200
	}
}
