const { Controller } = require('egg')
const { USER: { PASSWORD } } = require('../constant')

module.exports = class UserController extends Controller {
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

		}, ctx.request.body)

		if (errors) {
			ctx.response.body = { message: '无效请求参数', errors }
			ctx.response.status = 400
			return
		}

		const { username, type = PASSWORD.HASHED } = request.body
		errors = app.validator.validate(type === PASSWORD.HASHED ? {
			password: {
				type: 'string',
				format: /^[0-9a-fA-F]{64}$/,
			},
			frontendSalt: {
				type: 'string',
				format: /^[0-9a-fA-F]{32}$/,
			},
		} : {
			password: {
				type: 'string',
				format: /^\w{1,32}$/,
			},
		}, request.body)
		if (errors) {
			ctx.response.body = { message: '无效请求参数', errors }
			ctx.response.status = 400
			return
		}

		const { password, frontendSalt } = request.body

		const exixt = await ctx.service.user.checkIfExistByName(username)

		if (exixt) {
			ctx.response.body = { message: '用户名已经存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.user.create(username, password, frontendSalt)

		response.status = 200
	}

	async destroy() {
		const { ctx, app } = this
		const { response, params } = ctx

		const errors = app.validator.validate({
			username: {
				type: 'string',
				max: 45,
			},

		}, params)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const { username } = params

		const exixt = await ctx.service.user.checkIfExistByName(username)

		if (!exixt) {
			ctx.response.body = { message: '用户名不存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.user.destroy(username)

		response.status = 200
	}
}
