/**
 * 数据库权限表初始化时，需要router.stack能读取到permissionFitler方法名
 * @param {*} ctx
 * @param {*} next
 */
module.exports = async function permissionFilter(ctx, next) {
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
