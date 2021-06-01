module.exports = () => async (ctx, next) => {
	try {
		await next()
	} catch (err) {
		if (err.constructor.name === 'AjvError') {
			ctx.response.body = { message: '请求参数无效', ...err.body }
			ctx.response.status = 400
		} else if (err.constructor.name === 'ServiceError') {
			ctx.response.body = err.body
			ctx.response.status = 403
		} else {
			ctx.response.body = { message: '系统异常，请联系管理员' }
			ctx.response.status = 500
			throw err
		}
	}
}
