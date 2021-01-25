const uuid = require('./util/uuid')
/**
 * @param {Egg.Application} app - egg application
 */
class AppBootHook {
	constructor(app) {
		this.app = app
	}

	async init() {
		const { logger } = this.app

		const ctx = await this.app.createAnonymousContext()

		let adminRole = await ctx.service.role.getByName('admin')
		if (!adminRole) {
			adminRole = ctx.service.role.create('admin')
			logger.info('增加角色：admin')
		}

		let adminUser = await ctx.service.user.getByName('admin')
		if (!adminUser) {
			adminUser = ctx.service.user.create('admin', 'admin', null, adminRole.id)
			logger.info('增加用户：admin')
		}
	}

	async updatePermissions() {
		const { router, knex, logger } = this.app

		const dbPermissions = await knex
			.select()
			.column('id')
			.column('path')
			.column('method')
			.from('permission')

		const codePermissions = router.stack
			.filter((s) => !!s.stack.find((ss) => ss.name === 'permissionFilter'))
			.map((a) => a.methods.map((method) => ({
				path: a.path,
				method,
				regexp: a.regexp.toString(),
			}))).flat()

		const chain = {}
		;[codePermissions, dbPermissions].forEach((list, index) => {
			list.forEach((permission) => {
				const key = `${permission.method}#${permission.path}`
				if (!chain[key]) {
					chain[key] = []
				}
				chain[key][index] = permission
			})
		})

		const addList = []
		const subList = []
		Object.keys(chain).forEach((key) => {
			const [inCode, inDb] = chain[key]
			if (inCode && !inDb) {
				addList.push(inCode)
			} else if (!inCode && inDb) {
				subList.push(inDb)
			} else if (!inCode && !inDb) {
				throw new Error('inCode和InDb不可能同时为空')
			}
		})

		if (addList.length > 0 || subList.length > 0) {
			await knex.transaction(async (trx) => {
				const promiseList = []

				if (addList && addList.length > 0) {
					const now = Date.now()
					promiseList.push(trx
						.insert(addList.map((permission) => ({
							id: uuid.v4(),
							path: permission.path,
							regexp: permission.regexp,
							method: permission.method,
							create_time: now,
						})))
						.into('permission'))
				}

				if (subList && subList.length > 0) {
					subList.forEach((permission) => {
						promiseList.push(trx('role_has_permission').where({ permission_id: permission.id }).del())
						promiseList.push(trx('permission').where({ id: permission.id }).del())
					})
				}

				await Promise.all(promiseList)
			})
			logger.info(`增加${addList.length}条权限`)
			logger.info(`删除${subList.length}条权限`)
		}
	}

	// 文件加载完成
	async didLoad() {
		await Promise.all([
			this.init(),
			this.updatePermissions(),
		])
	}
}

module.exports = AppBootHook
