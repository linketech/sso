const { Controller } = require('egg')

module.exports = class UserController extends Controller {
	async index() {
		const { ctx } = this
		const { response } = ctx

		const roles = await ctx.service.role.list()

		response.status = 200
		response.body = roles
	}

	async create() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			name: {
				type: 'string',
				max: 45,
			},
		}, request.body)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const { name } = request.body

		const role = await ctx.service.role.getByName(name)
		if (role) {
			ctx.response.body = { message: '权限组名已经存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.role.create(name)

		response.status = 200
	}
}
