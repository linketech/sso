const Bluebird = require('bluebird')
const mysql = require('mysql')
const Connection = require('mysql/lib/Connection')
const Pool = require('mysql/lib/Pool')
const squel = require('squel')

squel.registerValueHandler(Buffer, (buffer) => buffer)

Bluebird.promisifyAll(Connection.prototype)
Bluebird.promisifyAll(Pool.prototype)

Pool.prototype.queryBySquel = function queryBySquel(gen) {
	const { text, values } = gen(squel).toParam()
	return this.queryAsync(text, values)
}

Pool.prototype.queryOneBySquel = function queryOneBySquel(...args) {
	return this.queryBySquel(...args).then((results) => results[0])
}

module.exports = {
	get pool() {
		return mysql.createPool(this.config.mysql.client)
	},
}
