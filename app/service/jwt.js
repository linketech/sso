const { Service } = require('egg')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

module.exports = class JWTService extends Service {
	constructor(...args) {
		super(...args)

		const jwtConfig = this.config.jwt
		Object.assign(this, {
			PRIVATE_KEY: jwtConfig.key.private,
			PUBLIC_KEY: crypto.createPublicKey(jwtConfig.key.private).export({
				type: 'spki',
				format: 'pem',
			}),
		})
	}

	async sign(payload) {
		return jwt.sign(payload, this.PRIVATE_KEY, {
			algorithm: 'ES256',
			expiresIn: '5m',
		})
	}

	async verify(token) {
		let decoded
		try {
			decoded = jwt.verify(token, this.PUBLIC_KEY, { algorithm: 'ES256' })
		} catch (err) {
			// DO NOTHING
		}
		return decoded
	}

	async getPayloadByUserId(id) {
		const payload = await this.service.user.getDetailById(id)

		// SSO的权限组太大，去掉
		if (payload.role && payload.role.permissions) {
			payload.role.permissions = undefined
		}

		return payload
	}

	async getByUserId(id) {
		return this.sign(await this.getPayloadByUserId(id))
	}
}
