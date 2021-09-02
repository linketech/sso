const { Service } = require('egg')
const crypto = require('crypto')

const argon2 = require('argon2')
const { sha256, md5 } = require('../util/crypto')
const uuid = require('../util/uuid')
const ServiceError = require('../util/ServiceError')
const { USER: { DEFAULT_PASSWORD, PASSWORD } } = require('../constant')

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
	async getDetailById(id) {
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
			name: user.name,
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

				const permissions = await this.service.permission.getByRoleId(user.role_id)
				if (permissions && permissions.length > 0) {
					payload.role.permissions = permissions.map((permission) => ({
						id: permission.id.toString('hex'),
						path: permission.path,
						method: permission.method,
						description: permission.description,
						group_name: permission.group_name,
					}))
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

	/**
	 * 检查用户名是否存在
	 * @param {*} name
	 */
	async getByName(name) {
		const { knex } = this.app

		const user = await knex
			.select()
			.from('user')
			.where({ name })
			.first()

		if (!user) {
			throw new ServiceError({ message: '用户名不存在' })
		}

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
			.from('user')
			.where({ id })
			.first()

		if (!user) {
			throw new ServiceError({ message: '用户ID不存在' })
		}

		return user
	}

	async checkExistById(id) {
		const { knex } = this.app

		const user = await knex
			.select()
			.column(knex.raw('1'))
			.from('user')
			.where({ id })
			.first()

		return !!user
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

		if (await this.checkIfExistByName(name)) {
			throw new ServiceError({ message: '用户名已经存在' })
		}

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

		const exists = this.checkExistById(id)
		if (!exists) {
			throw new ServiceError({ message: '用户ID不存在' })
		}

		await knex.transaction(async (trx) => {
			await trx('user_has_website').where({ user_id: id }).del()
			await trx('user').where({ id }).del()
		})
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
		return md5(name).toString('hex')
	}

	async updateRole(id, { role_id: roleId, disabled }) {
		const { knex } = this.app

		await this.getById(id)

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

		const hash_password = await genPassword(PASSWORD.NO_HASHED, DEFAULT_PASSWORD, user.frontend_salt)

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

		return roles.map(({ id, name, disabled, role_id, role_name }) => ({
			id: id.toString('hex'),
			name,
			disabled,
			role_id: role_id && role_id.toString('hex'),
			role_name,
		}))
	}

	async getDetailByName(name) {
		const { knex } = this.app

		const user = await this.getByName(name)

		let role
		if (user.role_id) {
			role = await this.service.role.getById(user.role_id)
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
				'user_has_website.user_id': user.id,
			})

		return {
			name,
			disabled: user.disabled,
			role_name: role && role.name,
			websites,
		}
	}

	async listWebSite(name) {
		const { knex } = this.app

		const user = await this.getByName(name)

		const websites = await knex
			.select()
			.column({
				name: 'w.name',
				role_name: 'wr.name',
			})
			.from('user_has_website as uhw')
			.leftJoin('website as w', 'uhw.website_id', 'w.id')
			.leftJoin('website_role as wr', 'uhw.website_role_id', 'wr.id')
			.where({
				'uhw.user_id': user.id,
			})

		return websites
	}

	async updateWebSite(name, websites) {
		const { knex } = this.app

		const user = await this.getByName(name)

		const newWebsites = []
		for (let i = 0; i < websites.length; i += 1) {
			const website = websites[0]

			if (website.role_name !== null || website.role_name !== undefined) {
				// eslint-disable-next-line no-await-in-loop
				const websiteRole = await knex
					.select()
					.column({
						website_id: 'website.id',
						website_role_id: 'website_role.id',
					})
					.from('website')
					.leftJoin('website_role', 'website.id', 'website_role.website_id')
					.where({
						'website.name': website.name,
						'website_role.name': website.role_name,
					})
					.first()
				if (!websiteRole) {
					throw new ServiceError({ message: '网站名或网站内的角色名不存在', value: website })
				}
				newWebsites.push(websiteRole)
			} else {
				// eslint-disable-next-line no-await-in-loop
				const websiteRole = await knex
					.select()
					.column({
						website_id: 'id',
					})
					.from('website')
					.where({
						name: website.name,
					})
					.first()
				if (!websiteRole) {
					throw new ServiceError({ message: '网站名不存在', value: website })
				}
				newWebsites.push({
					...websiteRole,
					website_role_id: null,
				})
			}
		}

		await knex.transaction(async (trx) => {
			await trx('user_has_website').where({
				user_id: user.id,
			}).del()
			if (newWebsites && newWebsites.length > 0) {
				await trx('user_has_website').insert(newWebsites.map(({ website_id, website_role_id }) => ({
					user_id: user.id,
					website_id,
					website_role_id,
				})))
			}
		})
	}
}
