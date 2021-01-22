const IGNORE_REQUEST = [
	['/session', 'POST'], // 登录
	['/session/frontend_salt', 'GET'], // 获取登录需要的盐
	['/session/user', 'POST'], // 注册

	['/jwt/verify/', 'GET'],
]

module.exports = () => async (ctx, next) => {
	const { request: { path, method }, response } = ctx

	const ignore = IGNORE_REQUEST.find(([matchUrl, matchMethod]) => path.startsWith(`/api${matchUrl}`) && method === matchMethod)

	if (ignore) {
		await next()
		return
	}

	if (ctx.session && ctx.session.user) {
		await next()
		return
	}

	response.status = 401
	response.body = { message: 'need to login' }
}
