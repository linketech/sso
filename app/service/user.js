const { Service } = require('egg')
const crypto = require('crypto')

const argon2 = require('argon2')
const { sha256 } = require('../util/crypto')
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

		let newPassword
		let newFrontendSalt

		if (frontendSalt) {
			newFrontendSalt = Buffer.from(frontendSalt, 'hex')
			newPassword = Buffer.from(password, 'hex')
		} else {
			newFrontendSalt = crypto.randomBytes(16)
			newPassword = sha256(Buffer.from(password, 'ascii'), newFrontendSalt)
		}

		const hashPassword = await argon2.hash(newPassword)

		const id = uuid.v4()
		await knex
			.insert({
				id,
				name,
				hash_password: hashPassword,
				frontend_salt: newFrontendSalt,
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

			const beforeHashedPassword = type === PASSWORD.HASHED
				? Buffer.from(password, 'hex')
				: sha256(Buffer.from(password, 'ascii'), user.frontend_salt)

			if (await argon2.verify(user.hash_password, beforeHashedPassword)) {
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
