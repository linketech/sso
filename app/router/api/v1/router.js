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

	const permission = await knex
		.select()
		.column('permission.id')
		.from('permission')
		.join('role_has_permission', 'permission.id', 'role_has_permission.permission_id')
		.join('role', 'role_has_permission.role_id', 'role.id')
		.join('user', 'role.id', 'user.role_id')
		.where({
			'permission.path': path,
			'permission.method': method,
		})
		.where({ 'user.id': userId })
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

	subRouter.delete('/user/:username', loginFilter, permissionFilter, controller.user.destroy)
}
