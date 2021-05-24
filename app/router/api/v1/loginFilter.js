module.exports = async function loginFilter(ctx, next) {
	const { response } = ctx

	if (ctx.session && ctx.session.user) {
		await next()
		return
	}

	response.status = 401
	response.body = { message: '需要先登录' }
}
