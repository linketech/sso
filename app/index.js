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
			adminRole = await ctx.service.role.create('admin')
			logger.info('增加角色：admin')
		}

		let adminUser = await ctx.service.user.getByName('admin')
		if (!adminUser) {
			adminUser = await ctx.service.user.create('admin', 'admin', null, adminRole.id)
			logger.info('增加用户：admin')
		}
	}

	async updatePermissions() {
		const { router, logger } = this.app

		const ctx = await this.app.createAnonymousContext()

		const dbPermissions = await ctx.service.permission.list()

		const codePermissions = router.stack
			.filter((s) => !!s.stack.find((ss) => ss.name === 'permissionFilter'))
			.map((a) => {
				const permissionFilter = a.stack.find((ss) => ss.name === 'permissionFilter') || {}
				return a.methods
					.filter((method) => ['POST', 'DELETE', 'PUT', 'GET'].includes(method))
					.map((method) => ({
						path: a.path,
						method,
						regexp: a.regexp.toString(),
						description: permissionFilter.description,
						group_name: permissionFilter.group_name,
					}))
			}).flat()

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
				throw new Error('inCode和inDb不可能同时为空')
			}
		})

		if (addList.length > 0 || subList.length > 0) {
			await ctx.service.permission.refresh(addList, subList)
			logger.info(`增加${addList.length}条权限`)
			logger.info(`删除${subList.length}条权限`)
		}
	}

	// 文件加载完成
	async didLoad() {
		await this.init()
		await this.updatePermissions()
	}
}

module.exports = AppBootHook
