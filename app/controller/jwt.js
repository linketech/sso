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

		response.body = {
			token: jwt.sign({
				user: {
					name: ctx.session.user.name,
				},
			}, this.PRIVATE_KEY, { algorithm: 'ES256' }),
		}
	}

	async verify() {
		const { ctx } = this
		const { request, response } = ctx

		let decoded
		try {
			decoded = jwt.verify(request.query.token, this.PUBLIC_KEY, { algorithm: 'ES256' })
		} catch (err) {
			// DO NOTHING
		}

		response.body = decoded
	}
}
