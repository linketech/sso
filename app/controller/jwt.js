const { Controller } = require('egg')

module.exports = class JwtController extends Controller {
	async get() {
		const { ctx } = this
		const { response } = ctx
		const token = await ctx.service.jwt.getByUserId(Buffer.from(ctx.session.user.id, 'hex'))

		response.body = {
			token,
		}
	}

	async auth() {
		const { ctx } = this
		const { request, response } = ctx

		const { return_to } = request.query

		if (ctx.session.user) {
			const token = await ctx.service.jwt.getByUserId(Buffer.from(ctx.session.user.id, 'hex'))
			response.redirect(`${return_to}?token=${token}`)
		} else {
			const path = this.config.sso.address + this.config.sso.authPath
			response.redirect(`${path}?return_to=${return_to}`)
		}
	}

	async verify() {
		const { ctx, app } = this
		const { params, response } = ctx

		const errors = app.validator.validate({
			token: {
				type: 'string',
			},
		}, params)

		if (errors) {
			ctx.response.body = { message: '无效请求参数', errors }
			ctx.response.status = 400
			return
		}

		const { token } = params

		response.body = await ctx.service.jwt.verify(token)
	}
}
