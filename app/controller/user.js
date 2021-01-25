const { Controller } = require('egg')

module.exports = class UserController extends Controller {
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

		const user = await ctx.service.user.getByName(username)
		if (!user) {
			ctx.response.body = { message: '用户名不存在' }
			ctx.response.status = 400
			return
		}

		// await ctx.service.user.destroy(username)

		response.status = 200
	}
}
