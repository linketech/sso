const jwt = require('jsonwebtoken')

const WebstieBaseService = require('./base')
const ServiceError = require('../../util/ServiceError')
const uuid = require('../../util/uuid')

const { PUBLIC_KEY } = require('../../constant')

const REVERSE_PUBLIC_KEY = Object.keys(PUBLIC_KEY).reduce((reverse, key) => {
	// eslint-disable-next-line no-param-reassign
	reverse[PUBLIC_KEY[key]] = key
	return reverse
}, {})

module.exports = class RoleService extends WebstieBaseService {
	async index(website_name) {
		const { knex } = this.app

		const website = await this.getWebsiteByName(website_name)

		const publicKeyList = await knex
			.select()
			.column('algorithm')
			.column('key')
			.from('public_key')
			.where({
				owner_id: website.id,
			})
			.orderBy('create_time', 'desc')

		return publicKeyList.map((publicKey) => ({
			algorithm_name: REVERSE_PUBLIC_KEY[publicKey.algorithm],
			key: publicKey.key,
		}))
	}

	async create(website_name, algorithm_name, key) {
		const { knex } = this.app

		const website = await this.getWebsiteByName(website_name)

		if (PUBLIC_KEY[algorithm_name] === undefined) {
			throw new ServiceError({ message: '指定算法不在列表之中' })
		}

		const publicKey = await knex
			.select()
			.column('id')
			.from('public_key')
			.where({
				owner_id: website.id,
				algorithm: PUBLIC_KEY[algorithm_name],
			})
			.first()
		if (publicKey) {
			throw new ServiceError({ message: '指定网站已经分配了指定算法的密钥或公钥' })
		}

		const id = uuid.v1()
		await knex
			.insert({
				id,
				owner_id: website.id,
				algorithm: PUBLIC_KEY[algorithm_name],
				key,
				create_time: Date.now(),
			})
			.into('public_key')
		return {
			algorithm_name,
		}
	}

	async destroy(website_name, algorithm_name) {
		const { knex } = this.app

		const website = await this.getWebsiteByName(website_name)

		if (PUBLIC_KEY[algorithm_name] === undefined) {
			throw new ServiceError({ message: '指定算法不在列表之中' })
		}

		const publicKey = await knex
			.select()
			.column('id')
			.from('public_key')
			.where({
				owner_id: website.id,
				algorithm: PUBLIC_KEY[algorithm_name],
			})
			.first()
		if (!(publicKey && publicKey.id)) {
			throw new ServiceError({ message: '指定网站的指定算法名不存在' })
		}

		await knex('public_key')
			.where({
				id: publicKey.id,
			})
			.del()
	}

	async verify(token) {
		const { header, payload } = jwt.decode(token, { complete: true })
		if (!(header && payload)) {
			throw new ServiceError({ message: 'token无法正常解析' })
		}
		const { alg } = header
		if (!(alg && PUBLIC_KEY[alg] !== undefined)) {
			throw new ServiceError({ message: '指定算法不在列表之中' })
		}

		const { type, name } = payload
		if (!(type && type === 'website' && name)) {
			throw new ServiceError({ message: 'Token中没有正确指定type和name' })
		}

		const { knex } = this.app
		const website = await knex
			.select()
			.column('id')
			.column('name')
			.from('website')
			.where({
				name,
			})
			.first()
		if (!website) {
			throw new ServiceError({ message: '网站名不存在' })
		}

		const publicKey = await knex
			.select()
			.column('key')
			.from('public_key')
			.where({
				owner_id: website.id,
				algorithm: PUBLIC_KEY[alg],
			})
			.first()
		if (!publicKey) {
			throw new ServiceError({ message: '指定网站不存在指定算法的密钥或公钥' })
		}

		let decoded
		try {
			decoded = jwt.verify(token, publicKey.key, { algorithm: alg })
		} catch (err) {
			// DO NOTHING
		}

		if (!decoded) {
			throw new ServiceError({ message: 'JWT验证失败' })
		}

		return website
	}
}
