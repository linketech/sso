const { Service } = require('egg')
const crypto = require('crypto')

const argon2 = require('argon2')
const { sha256 } = require('../util/crypto')
const uuid = require('../util/uuid')
const ServiceError = require('../util/ServiceError')
const { USER: { PASSWORD } } = require('../constant')

async function checkPassword(type, hash_password, password, frontend_salt) {
	const beforeHashedPassword = type === PASSWORD.NO_HASHED
		? sha256(Buffer.from(password, 'ascii'), frontend_salt)
		: Buffer.from(password, 'hex')

	return argon2.verify(hash_password, beforeHashedPassword)
}

async function genPassword(type, password, frontend_salt) {
	let newPassword
	if (type === PASSWORD.NO_HASHED) {
		newPassword = sha256(Buffer.from(password, 'ascii'), frontend_salt)
	} else {
		newPassword = Buffer.from(password, 'hex')
	}

	return argon2.hash(newPassword)
}

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
	 * 根据ID获取用户信息
	 * @param {*} id
	 */
	async getById(id) {
		const { knex } = this.app

		const user = await knex
			.select()
			.column('name')
			.from('user')
			.where({ id })
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

		let type
		let frontend_salt
		if (frontendSalt) {
			frontend_salt = Buffer.from(frontendSalt, 'hex')
			type = PASSWORD.HASHED
		} else {
			frontend_salt = crypto.randomBytes(16)
			type = PASSWORD.NO_HASHED
		}

		const hash_password = await genPassword(type, password, frontend_salt)

		const id = uuid.v4()
		await knex
			.insert({
				id,
				name,
				hash_password,
				frontend_salt,
				role_id,
				create_time: Date.now(),
			})
			.into('user')

		return { id }
	}

	/**
	 *
	 * @param {String} id
	 */
	async destroy(id) {
		const { knex } = this.app

		await knex('user')
			.where({ id })
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
			.column('frontend_salt')
			.column('disabled')
			.from('user')
			.where({ name })
			.first()

		if (user) {
			if (user.disabled !== 0) {
				return {
					disabeld: user.disabled,
				}
			}

			if (await checkPassword(type, user.hash_password, password, user.frontend_salt)) {
				return {
					id: user.id,
					name: user.name,
					disabled: user.disabled,
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

	async updateRole(id, { role_id: roleId, disabled }) {
		const { knex } = this.app
		await knex
			.update({
				role_id: roleId,
				disabled,
			})
			.table('user')
			.where({ id })
	}

	async updatePassword(id, type, oldPassword, newPassword) {
		const { knex } = this.app

		const user = await knex
			.select()
			.column('hash_password')
			.column('frontend_salt')
			.column('disabled')
			.from('user')
			.where({ id })
			.first()

		if (!user) {
			throw new ServiceError({ message: '用户不存在' })
		}

		if (!(await checkPassword(type, user.hash_password, oldPassword, user.frontend_salt))) {
			throw new ServiceError({ message: '旧密码错误' })
		}

		const hash_password = await genPassword(type, newPassword, user.frontend_salt)

		await knex('user')
			.update({
				hash_password,
			})
			.where({ id })
	}

	async resetPassword(id) {
		const { knex } = this.app

		const user = await knex
			.select()
			.column('frontend_salt')
			.from('user')
			.where({ id })
			.first()

		if (!user) {
			throw new ServiceError({ message: '用户不存在' })
		}

		const hash_password = await genPassword(PASSWORD.NO_HASHED, '12345678', user.frontend_salt)

		await knex('user')
			.update({
				hash_password,
			})
			.where({ id })
	}

	async list() {
		const { knex } = this.app
		const roles = await knex
			.select()
			.column('user.id as id')
			.column('user.name')
			.column('user.disabled')
			.column('role.id as role_id')
			.column('role.name as role_name')
			.from('user')
			.leftJoin('role', 'user.role_id', 'role.id')
		return roles
	}
}
