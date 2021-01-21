const knex = require('knex')

module.exports = {
	get knex() {
		return knex(this.config.knex.client)
	},
}
