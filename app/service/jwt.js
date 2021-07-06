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
		const { knex } = this.app

		const user = await knex
			.select()
			.column('name')
			.column('role_id')
			.from('user')
			.where({
				id,
			})
			.first()

		const payload = {
			user: {
				name: user.name,
			},
		}

		if (user.role_id) {
			const role = await knex
				.select()
				.column('name')
				.from('role')
				.where({
					id: user.role_id,
				})
				.first()
			if (role) {
				payload.role = {
					name: role.name,
				}
			}
		}

		const websites = await knex
			.select()
			.column({
				name: 'website.name',
				role_name: 'website_role.name',
			})
			.from('user_has_website')
			.leftJoin('website', 'website.id', 'user_has_website.website_id')
			.leftJoin('website_role', 'website_role.id', 'user_has_website.website_role_id')
			.where({
				'user_has_website.user_id': id,
			})
		if (websites && websites.length > 0) {
			payload.websites = websites
		}
		return payload
	}

	async getByUserId(id) {
		return this.sign(await this.getPayloadByUserId(id))
	}
}
