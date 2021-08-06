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

function md5(data) {
	return crypto.createHash('md5')
		.update(data)
		.digest()
}

module.exports = {
	sha256,
	md5,
}
