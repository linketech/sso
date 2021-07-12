const { Controller } = require('egg')
const { USER: { PASSWORD } } = require('../constant')

module.exports = class SessionController extends Controller {
	async getfrontendSaltByUsername() {
		const { ctx } = this
		const { params, response } = ctx

		ctx.validate({
			params: {
				type: 'object',
				properties: {
					username: {
						type: 'string',
						maxLength: 45,
					},
				},
				required: ['username'],
			},
		})

		const { username } = params

		const frontend_salt = await ctx.service.user.getfrontendSaltByUsername(username)

		response.status = 200
		response.body = {
			frontend_salt: frontend_salt.toString('hex'),
		}
	}

	async create() {
		const { ctx } = this
		const { request, response } = ctx

		ctx.validate({
			body: {
				type: 'object',
				properties: {
					username: {
						type: 'string',
						maxLength: 45,
					},
					type: {
						type: 'integer',
						enum: Object.values(PASSWORD),
					},
				},
				required: ['username'],
			},
		})

		const { username, type = PASSWORD.HASHED } = request.body

		ctx.validate(type === PASSWORD.HASHED ? {
			body: {
				type: 'object',
				properties: {
					password: {
						type: 'string',
						pattern: '^[0-9a-fA-F]{64}$',
					},
				},
				required: ['password'],
			},
		} : {
			body: {
				type: 'object',
				properties: {
					password: {
						type: 'string',
						pattern: '^\\w{1,32}$',
					},
				},
				required: ['password'],
			},
		})

		const { password } = request.body

		const user = await ctx.service.user.get(username, password, type)

		if (!user) {
			ctx.response.body = { message: '账号或密码错误' }
			ctx.response.status = 400
			return
		}

		if (user.disabled !== 0) {
			ctx.response.body = { message: '账号已被停用' }
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
		const { ctx } = this
		const { request, response } = ctx

		ctx.validate({
			body: {
				type: 'object',
				properties: {
					username: {
						type: 'string',
						maxLength: 45,
					},
					type: {
						type: 'integer',
						enum: Object.values(PASSWORD),
					},
				},
				required: ['username'],
			},
		})

		const { username, type = PASSWORD.HASHED } = request.body

		ctx.validate(type === PASSWORD.HASHED ? {
			body: {
				type: 'object',
				properties: {
					password: {
						type: 'string',
						pattern: '^[0-9a-fA-F]{64}$',
					},
					frontendSalt: {
						type: 'string',
						pattern: '^[0-9a-fA-F]{32}$',
					},
				},
				required: ['password', 'frontendSalt'],
			},
		} : {
			body: {
				type: 'object',
				properties: {
					password: {
						type: 'string',
						pattern: '^\\w{1,32}$',
					},
				},
				required: ['password'],
			},
		})

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
