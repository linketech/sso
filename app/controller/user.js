const { Controller } = require('egg')

module.exports = class UserController extends Controller {
	async create() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			username: {
				type: 'string',
				max: 45,
			},
			password: {
				type: 'string',
				format: /^[0-9a-fA-F]{64}$/,
			},
			frontendSalt: {
				type: 'string',
				format: /^[0-9a-fA-F]{32}$/,
			},
		}, ctx.request.body)

		if (errors) {
			ctx.response.body = { message: '无效请求参数', errors }
			ctx.response.status = 400
			return
		}

		const { username, password, frontendSalt } = request.body

		const exixt = await ctx.service.user.checkIfExistByName(username)

		if (exixt) {
			ctx.response.body = { message: '用户名已经存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.user.create(username, password, frontendSalt)

		response.status = 200
	}

	async createWithNoSalt() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			username: {
				type: 'string',
				max: 45,
			},
			password: {
				type: 'string',
				format: /^\w{1,32}$/,
			},
		}, ctx.request.body)

		if (errors) {
			ctx.response.body = { message: '无效请求参数', errors }
			ctx.response.status = 400
			return
		}

		const { username, password } = request.body

		const exixt = await ctx.service.user.checkIfExistByName(username)

		if (exixt) {
			ctx.response.body = { message: '用户名已经存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.user.createWithNoSalt(username, password)

		response.status = 200
	}
}
