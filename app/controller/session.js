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

		const frontend_salt = await ctx.service.user.getfrontendSaltByUsername(username)

		response.status = 200
		response.body = {
			frontend_salt: frontend_salt.toString('hex'),
		}
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

		if (user.disabled !== 0) {
			ctx.response.body = { message: '账号已被停用', errors }
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

		const { user } = ctx.session

		const info = {
			user: {
				name: user.name,
			},
		}

		const role = await ctx.service.role.getByUserId(Buffer.from(user.id, 'hex'))
		if (role) {
			info.role = {
				name: role.name,
			}
			const permissions = await ctx.service.permission.getByRoleId(role.id)
			if (permissions && permissions.length > 0) {
				info.permissions = permissions.map((permission) => ({
					id: permission.id.toString('hex'),
					path: permission.path,
					method: permission.method,
					description: permission.description,
					group_name: permission.group_name,
				}))
			}
			const websites = await ctx.service.website.getByRoleId(role.id)
			if (websites && websites.length > 0) {
				info.websites = websites.map((website) => ({
					id: website.id.toString('hex'),
					name: website.name,
					url: website.url,
					group_name: website.group_name,
				}))
			}
		}

		response.body = info
	}

	async destroy() {
		const { ctx } = this
		const { response } = ctx

		ctx.session = null
		response.status = 200
	}

	async userCreate() {
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

		const user = await ctx.service.user.getByName(username)
		if (user) {
			ctx.response.body = { message: '用户名已经存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.user.create(username, password, frontendSalt)

		response.status = 200
	}
}
