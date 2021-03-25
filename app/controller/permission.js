const { Controller } = require('egg')

module.exports = class PermissionController extends Controller {
	async index() {
		const { ctx } = this
		const { response } = ctx

		const permissions = await ctx.service.permission.list()

		response.status = 200
		response.body = permissions.map((permission) => ({
			...permission,
			id: permission.id.toString('hex'),
		}))
	}
}
