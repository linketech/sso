const uuid = require('uuid')

function v4() {
	return uuid.v4({}, Buffer.alloc(16))
}

module.exports = {
	v4,
}
