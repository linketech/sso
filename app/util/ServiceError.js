module.exports = class ServiceError extends Error {
	constructor(body) {
		super()
		this.name = 'ServiceError'
		this.body = body
	}
}
