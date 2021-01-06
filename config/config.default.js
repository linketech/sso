/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 * https://github.com/eggjs/egg/blob/master/config/config.default.js
 */

const fs = require('fs')

module.exports = (appInfo) => ({
	keys: `${appInfo.name}_1608715601779_9499`,
	middleware: ['login'],
	userConfig: {
		// myAppName: 'egg',
	},
	security: {
		csrf: {
			enable: false,
		},
	},
	cluster: {
		listen: {
			port: 80,
		},
	},
	mysql: {
		client: {
			host: 'localhost',
			port: '3306',
			user: 'root',
			password: 'root',
			database: 'sso',
		},
		app: true,
	},
	redis: {
		clients: {
			session: {
				host: 'localhost',
				port: 6379,
				password: '',
				db: 0,
			},
		},
		agent: true,
	},
	sessionRedis: {
		name: 'session',
	},
	jwt: {
		key: {
			public: fs.readFileSync(`${__dirname}/jwt/es256/public.key`),
			private: fs.readFileSync(`${__dirname}/jwt/es256/private.key`),
		},
	},
})
