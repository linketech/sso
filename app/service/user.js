const { Service } = require('egg')

const crypto = require('../util/crypto')
const uuid = require('../util/uuid')
const { USER: { PASSWORD } } = require('../constant')

module.exports = class UserService extends Service {
	/**
	 * 检查用户名是否存在
	 * @param {*} name
	 */
	async getByName(name) {
		const { knex } = this.app

		const user = await knex
			.select()
			.column('id')
			.from('user')
			.where({ name })
			.first()

		return user
	}

	/**
	 * 检查用户名是否存在
	 * @param {*} name
	 */
	async checkIfExistByName(name) {
		const { knex } = this.app

		const user = await knex
			.select()
			.column(knex.raw('1'))
			.from('user')
			.where({ name })
			.first()

		return !!user
	}

	/**
	 * 创建用户
	 * @param {String} name
	 * @param {String} password
	 * @param {String} frontendSalt Hex String
	 */
	async create(name, password, frontendSalt, role_id = null) {
		const { knex } = this.app

		let newPassword
		let newFrontendSalt

		if (frontendSalt) {
			newFrontendSalt = Buffer.from(frontendSalt, 'hex')
			newPassword = Buffer.from(password, 'hex')
		} else {
			newFrontendSalt = uuid.v4()
			newPassword = crypto.sha256(Buffer.from(password, 'ascii'), newFrontendSalt)
		}

		const salt = uuid.v4()
		const hashPassword = crypto.sha256(newPassword, salt)

		const id = uuid.v4()
		await knex
			.insert({
				id,
				name,
				hash_password: hashPassword,
				salt,
				frontend_salt: newFrontendSalt,
				role_id,
				create_time: Date.now(),
			})
			.into('user')

		return { id }
	}

	/**
	 *
	 * @param {String} name
	 */
	async destroy(name) {
		const { knex } = this.app

		await knex('user')
			.where({ name })
			.del()
	}

	/**
	 * 通过用户名和密码获取用户信息（登录）
	 * @param {String} name
	 * @param {String} password
	 * @param {Number} type
	 */
	async get(name, password, type) {
		const { knex } = this.app

		const user = await knex
			.select()
			.column('id')
			.column('name')
			.column('hash_password')
			.column('salt')
			.column('frontend_salt')
			.from('user')
			.where({ name })
			.first()

		if (user) {
			const beforeHashedPassword = type === PASSWORD.HASHED
				? Buffer.from(password, 'hex')
				: crypto.sha256(Buffer.from(password, 'ascii'), user.frontend_salt)
			const hashPassword = crypto.sha256(beforeHashedPassword, user.salt)
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
		const { knex } = this.app

		const user = await knex
			.select()
			.column('frontend_salt')
			.from('user')
			.where({ name })
			.first()

		if (user && user.frontend_salt) {
			return user.frontend_salt.toString('hex')
		}

		return undefined
	}
}
