const path = require('path')

/** @type Egg.EggPlugin */
module.exports = {
	routerPlus: {
		enable: true,
		package: 'egg-router-plus',
	},
	redis: {
		enable: true,
		package: 'egg-redis',
	},
	sessionRedis: {
		enable: true,
		package: 'egg-session-redis',
	},
	validate: {
		enable: true,
		package: 'egg-validate',
	},
	ivanMysql: {
		enable: true,
		path: 'egg-ivan-mysql',
	},
}
