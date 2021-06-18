module.exports = (description, group_name) => {
	/**
	 * 数据库权限表初始化时，需要router.stack能读取到permissionFitler方法名
	 * @param {*} ctx
	 * @param {*} next
	 */
	const permissionFilter = async (ctx, next) => {
		const { path } = ctx.matched[0]
		const { method } = ctx.request
		const userId = Buffer.from(ctx.session.user.id, 'hex')

		const role = await ctx.service.role.getByUserId(userId)

		if (role && role.id) {
			const hasPermission = await ctx.service.permission.hasPermission(role.id, { path, method })
			if (hasPermission) {
				await next()
				return
			}
		}

		ctx.response.status = 403
		ctx.response.body = { message: '权限不足' }
	}

	permissionFilter.description = description
	permissionFilter.group_name = group_name

	return permissionFilter
}
