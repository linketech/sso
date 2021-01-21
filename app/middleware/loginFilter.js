const IGNORE_REQUEST = [
	['/session', 'POST'],
	['/session/frontend_salt/', 'GET'],
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
