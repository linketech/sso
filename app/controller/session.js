const { Controller } = require('egg')
const { USER: { PASSWORD } } = require('../constant')

module.exports = class SessionController extends Controller {
	async getfrontendSaltByUsername() {
		const { ctx, app } = this
		const { params, response } = ctx

		const errors = app.validator.validate({
			username: {
				type: 'string',
				max: 45,
			},
		}, params)

		if (errors) {
			ctx.response.body = { message: '无效请求参数', errors }
			ctx.response.status = 400
			return
		}

		const { username } = params

		const frontendSalt = await ctx.service.user.getfrontendSaltByUsername(username)

		response.status = 200
		response.body = { frontendSalt }
	}

	async create() {
		const { ctx, app } = this
		const { request, response } = ctx

		let errors = app.validator.validate({
			username: {
				type: 'string',
				max: 45,
			},
			type: {
				type: 'integer',
				enum: Object.keys(PASSWORD),
				required: false,
			},
		}, request.body)

		if (errors) {
			ctx.response.body = { message: '无效请求参数', errors }
			ctx.response.status = 400
			return
		}
		const { username, type = PASSWORD.HASHED } = request.body

		errors = app.validator.validate({
			password: {
				type: 'string',
				format: type === PASSWORD.HASHED ? /^[0-9a-fA-F]{64}$/ : /^\w{1,32}$/,
			},
		}, request.body)
		if (errors) {
			ctx.response.body = { message: '无效请求参数', errors }
			ctx.response.status = 400
			return
		}

		const { password } = request.body

		const user = await ctx.service.user.get(username, password, type)

		if (!user) {
			ctx.response.body = { message: '账号或密码错误', errors }
			ctx.response.status = 400
			return
		}

		ctx.session.user = {
			id: user.id.toString('hex'),
			name: user.name,
		}

		response.status = 200
	}

	async get() {
		const { ctx } = this
		const { response } = ctx

		response.status = 200
		response.body = {
			user: {
				name: ctx.session.user.name,
			},
		}
	}

	async destroy() {
		const { ctx } = this
		const { response } = ctx

		ctx.session = null
		response.status = 200
	}
}
