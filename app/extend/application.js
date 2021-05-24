const knex = require('knex')

const POOL = Symbol('Application#POOL')

module.exports = {
	get knex() {
		if (!this[POOL]) {
			this[POOL] = knex(this.config.knex.client)
		}
		return this[POOL]
	},
}
