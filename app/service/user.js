const { Service } = require('egg')

const crypto = require('../util/crypto')
const uuid = require('../util/uuid')

module.exports = class UserService extends Service {
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
	 * @param {String} password Hex String
	 * @param {String} frontendSalt Hex String
	 */
	async create(name, password, frontendSalt) {
		const { knex } = this.app

		const id = uuid.v4()
		const salt = uuid.v4()

		const hashPassword = crypto.sha256(Buffer.from(password, 'hex'), salt)

		await knex
			.insert({
				id,
				name,
				hash_password: hashPassword,
				salt,
				frontend_salt: Buffer.from(frontendSalt, 'hex'),
				create_time: Date.now(),
			})
			.into('user')
	}

	/**
	 * 创建用户 (密码不使用前端盐Hash)
	 * @param {String} name
	 * @param {String} password Hex String
	 */
	async createWithNoSalt(name, password) {
		const frontendSalt = uuid.v4()
		this.create(name, crypto.sha256(Buffer.from(password, 'ascii'), frontendSalt), frontendSalt)
	}

	/**
	 * 通过用户名和密码获取用户信息（登录）
	 * @param {String} name
	 * @param {String} password Hex String 经过前端盐Hash
	 */
	async get(name, password) {
		const { knex } = this.app

		const user = await knex
			.select()
			.column('id')
			.column('name')
			.column('hash_password')
			.column('salt')
			.from('user')
			.where({ name })
			.first()

		if (user) {
			const hashPassword = crypto.sha256(
				Buffer.from(password, 'hex'),
				user.salt,
			)
			if (hashPassword.equals(user.hash_password)) {
				return {
					id: user.id,
					name: user.name,
				}
			}
		}

		return undefined
	}

	/**
	 * 通过用户名和密码获取用户信息（登录）(密码不使用前端盐Hash)
	 * @param {String} name
	 * @param {String} password Hex String 未经过前端盐Hash，原始密码
	 */
	async getWithNoSalt(name, password) {
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
			const hashPassword = crypto.sha256(
				crypto.sha256(
					Buffer.from(password, 'ascii'),
					user.frontend_salt,
				),
				user.salt,
			)
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
