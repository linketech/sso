const { Controller } = require('egg')

module.exports = class SessionController extends Controller {
	async getfrontendSaltByUsername() {
		const { ctx } = this
		const { params, response } = ctx
		const { username } = params

		const frontendSalt = await ctx.service.user.getfrontendSaltByUsername(username)

		response.status = 200
		response.body = frontendSalt
	}

	async create() {
		const { ctx } = this
		const { request, response } = ctx
		const { username, password } = request.body

		const user = await ctx.service.user.get(username, password)

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
