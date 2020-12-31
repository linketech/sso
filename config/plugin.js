/** @type Egg.EggPlugin */
module.exports = {
	// had enabled by egg
	// static: {
	//   enable: true,
	// }
	routerPlus: {
		enable: true,
		package: 'egg-router-plus',
	},
	// plugin.js
	redis: {
		enable: true,
		package: 'egg-redis',
	},
	sessionRedis: {
		enable: true,
		package: 'egg-session-redis',
	},
}
