const { Controller } = require('egg')

module.exports = class UserController extends Controller {
	async index() {
		const { ctx } = this
		const { response } = ctx

		const roles = await ctx.service.permission.list()

		response.status = 200
		response.body = roles
	}
}
