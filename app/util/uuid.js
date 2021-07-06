const uuid = require('uuid')

function v1() {
	return uuid.v1({}, Buffer.alloc(16))
}

function v4() {
	return uuid.v4({}, Buffer.alloc(16))
}

module.exports = {
	v1,
	v4,
}
