const { Service } = require('egg')

const crypto = require('../util/crypto')
const uuid = require('../util/uuid')

module.exports = class UserService extends Service {
	async checkIfExistByName(name) {
		const { db } = this.ctx

		const user = await db.queryOneBySquel((squel) => squel
			.select()
			.field('1')
			.from('user')
			.where('name = ?', name))

		return !!user
	}

	/**
	 * 创建用户
	 * @param {String} name
	 * @param {String} password Hex String
	 * @param {String} frontendSalt Hex String
	 */
	async create(name, password, frontendSalt) {
		const { db } = this.ctx

		const id = uuid.v4()
		const salt = uuid.v4()

		const hashPassword = crypto.sha256(Buffer.from(password, 'hex'), salt)

		await db.queryBySquel((squel) => squel
			.insert()
			.into('user')
			.setFields({
				id,
				name,
				hash_password: hashPassword,
				salt,
				frontend_salt: Buffer.from(frontendSalt, 'hex'),
				create_time: Date.now(),
			}))
	}

	/**
	 *
	 * @param {String} name
	 * @param {String} password Hex String
	 * @param {String} frontendSalt Hex String
	 */
	async get(name, password) {
		const { db } = this.ctx

		const user = await db.queryOneBySquel((squel) => squel
			.select()
			.field('id')
			.field('name')
			.field('hash_password')
			.field('salt')
			.from('user')
			.where('name = ?', name))

		if (user) {
			const hashPassword = crypto.sha256(Buffer.from(password, 'hex'), user.salt)
			if (hashPassword.equals(user.hash_password)) {
				return {
					id: user.id,
					name: user.name,
				}
			}
		}

		return undefined
	}

	async getfrontendSaltByUsername(name) {
		const { db } = this.ctx

		const user = await db.queryOneBySquel((squel) => squel
			.select()
			.field('frontend_salt')
			.from('user')
			.where('name = ?', name))

		if (user && user.frontend_salt) {
			return user.frontend_salt.toString('hex')
		}

		return undefined
	}
}
