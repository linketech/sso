module.exports = () => async (ctx, next) => {
	const { request: { url, method }, response } = ctx

	if (/\/session/.test(url) && method === 'POST') {
		await next()
		return
	}
	if (/\/session\/frontend_salt/.test(url) && method === 'GET') {
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
