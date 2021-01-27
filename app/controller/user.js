const { Controller } = require('egg')

module.exports = class UserController extends Controller {
	async destroy() {
		const { ctx, app } = this
		const { response, params } = ctx

		const errors = app.validator.validate({
			name: {
				type: 'string',
				max: 45,
			},
		}, params)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const { name } = params

		const user = await ctx.service.user.getByName(name)
		if (!user) {
			ctx.response.body = { message: '用户名不存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.user.destroy(name)

		response.status = 200
	}

	async updateRole() {
		const { ctx, app } = this
		const { params, response } = ctx

		const errors = app.validator.validate({
			name: {
				type: 'string',
				max: 45,
			},
			role_name: {
				type: 'string',
				max: 45,
			},
		}, params)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const { name, role_name: roleName } = params

		const user = await ctx.service.user.getByName(name)
		if (!user) {
			response.body = { message: '用户名不存在' }
			response.status = 400
			return
		}

		const role = await ctx.service.role.getByName(roleName)
		if (!role) {
			response.body = { message: '权限组名不存在' }
			response.status = 400
			return
		}

		await ctx.service.user.updateRole(user.id, role.id)

		response.status = 200
	}
}
