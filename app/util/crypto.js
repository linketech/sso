const crypto = require('crypto')

/**
 *
 * @param {Buffer} data
 * @param {Buffer} salt
 */
function sha256(data, salt) {
	return crypto.createHmac('sha256', salt)
		.update(data)
		.digest()
}

module.exports = {
	sha256,
}
