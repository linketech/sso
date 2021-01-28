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

		const role = await ctx.service.role.getById(id)
		if (!role) {
			ctx.response.body = { message: '权限组不存在' }
			ctx.response.status = 400
			return
		}

		if (role.name === 'admin') {
			ctx.response.body = { message: '不能删除Admin权限组' }
			ctx.response.status = 400
			return
		}

		await ctx.service.role.destroy(id)

		response.status = 200
	}
}
