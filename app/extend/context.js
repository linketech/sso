const Ajv = require('ajv').default
const localize = require('ajv-i18n')

const ajv = new Ajv()

class AjvError extends Error {
	constructor(body) {
		super()
		this.name = 'AjvError'
		this.body = body
	}
}

module.exports = {
	validate(properties) {
		const v = ajv.compile({
			type: 'object',
			properties,
		})
		const valid = v({
			params: this.params,
			body: this.request.body,
			query: this.request.query,
		})
		if (!valid) {
			localize.zh(v.errors)
			throw new AjvError({ errors: v.errors })
		}
	},
}
