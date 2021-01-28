async function loginFilter(ctx, next) {
	const { response } = ctx

	if (ctx.session && ctx.session.user) {
		await next()
		return
	}

	response.status = 401
	response.body = { message: '需要先登录' }
}

async function permissionFilter(ctx, next) {
	const { path } = ctx.matched[0]
	const { method } = ctx.request
	const userId = Buffer.from(ctx.session.user.id, 'hex')

	const { knex } = ctx.app

	const user = await knex
		.select()
		.column({ role_id: 'role.id' })
		.column({ role_name: 'role.name' })
		.from('user')
		.leftJoin('role', 'user.role_id', 'role.id')
		.where({
			'user.id': userId,
		})
		.first()

	if (user && user.role_name === 'admin') {
		await next()
		return
	}

	const permission = await knex
		.select()
		.column({ permission_id: 'permission.id' })
		.from('role_has_permission')
		.leftJoin('permission', 'role_has_permission.permission_id', 'permission.id')
		.where({
			'permission.path': path,
			'permission.method': method,
		})
		.where({
			'role_has_permission.role_id': user.role_id,
		})
		.first()

	if (permission) {
		await next()
		return
	}

	ctx.response.status = 403
	ctx.response.body = { message: '权限不足' }
}

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = ({ router, controller }) => {
	const subRouter = router.namespace('/api')

	subRouter.get('', controller.home.index)

	subRouter.get('/session/frontend_salt/:username', controller.session.getfrontendSaltByUsername)
	subRouter.post('/session', controller.session.create)
	subRouter.get('/session', loginFilter, controller.session.get)
	subRouter.delete('/session', loginFilter, controller.session.destroy)
	subRouter.post('/session/user', controller.session.userCreate)

	subRouter.get('/jwt', loginFilter, permissionFilter, controller.jwt.get)
	subRouter.get('/jwt/verify/:token', controller.jwt.verify)

	subRouter.get('/user', loginFilter, permissionFilter, controller.user.index)
	subRouter.put('/user', loginFilter, permissionFilter, controller.user.update)
	subRouter.delete('/user', loginFilter, permissionFilter, controller.user.destroy)

	subRouter.get('/role', loginFilter, permissionFilter, controller.role.index)
	subRouter.post('/role', loginFilter, permissionFilter, controller.role.create)
	subRouter.delete('/role', loginFilter, permissionFilter, controller.role.destroy)

	subRouter.get('/permission', loginFilter, permissionFilter, controller.permission.index)

	subRouter.get('/role/permission', loginFilter, permissionFilter, controller.rolePermission.index)
	subRouter.put('/role/permission/add', loginFilter, permissionFilter, controller.rolePermission.update)
	subRouter.put('/role/permission/subtract', loginFilter, permissionFilter, controller.rolePermission.update)
	subRouter.put('/role/permission', loginFilter, permissionFilter, controller.rolePermission.update)
}
