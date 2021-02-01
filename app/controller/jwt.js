const { Controller } = require('egg')
const jwt = require('jsonwebtoken')

module.exports = class JwtController extends Controller {
	constructor(...args) {
		super(...args)

		const jwtConfig = this.config.jwt
		Object.assign(this, {
			PUBLIC_KEY: jwtConfig.key.public,
			PRIVATE_KEY: jwtConfig.key.private,
		})
	}

	async get() {
		const { ctx } = this
		const { response } = ctx

		const user_id = Buffer.from(ctx.session.user.id, 'hex')
		const role = await ctx.service.role.getByUserId(user_id)

		let websites = []
		if (role.name === 'admin') {
			websites = await ctx.service.website.getByAdmin()
		} else {
			websites = await ctx.service.website.getByRoleId(role.id)
		}

		response.body = {
			token: jwt.sign({
				user: {
					name: ctx.session.user.name,
				},
				role: {
					name: role.name,
				},
				websites: websites.map(({ name }) => name),
			}, this.PRIVATE_KEY, { algorithm: 'ES256' }),
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

		let decoded
		try {
			decoded = jwt.verify(token, this.PUBLIC_KEY, { algorithm: 'ES256' })
		} catch (err) {
			// DO NOTHING
		}

		response.body = decoded
	}
}
