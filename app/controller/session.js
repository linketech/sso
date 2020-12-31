const { Controller } = require('egg')

class HomeController extends Controller {
	async frontendSalt() {
		const { ctx } = this
		const { request, response } = ctx
		const { username } = request.body

		const frontendSalt = await ctx.service.user.getFrontendSalt(username)

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
			username: user.username,
		}

		response.status = 200
	}

	async get() {
		const { ctx } = this
		const { response } = ctx

		response.status = 200
		response.body = {
			user: {
				username: ctx.session.user.username,
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

module.exports = HomeController
