/**
 * @param {Egg.EggAppInfo} appInfo app info
 * https://github.com/eggjs/egg/blob/master/config/config.default.js
 */

const fs = require('fs')

const { env } = process

module.exports = (appInfo) => ({
	keys: `${appInfo.name}_1608715601779_9499`,
	session: {
		key: 'SSO_SESSION',
		maxAge: 7 * 24 * 60 * 60 * 1000,
		renew: true,
	},
	middleware: [
		'cors',
		'logger',
		'errorHandler',
	],
	cluster: {
		listen: {
			port: env.PORT || 80,
		},
	},
	knex: {
		client: {
			client: 'mysql',
			connection: {
				host: env.MYSQL_HOST || 'localhost',
				port: env.MYSQL_PORT || 3306,
				user: env.MYSQL_USER || 'root',
				password: env.MYSQL_PASSWORD || 'root',
				database: 'sso',
			},
		},
	},
	redis: {
		clients: {
			// https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options
			session: {
				host: env.REDIS_HOST || 'localhost',
				port: env.REDIS_PORT || 6379,
				password: env.REDIS_PASSWORD || '',
				db: env.REDIS_DB || 0,
				keyPrefix: 'sso:session:',
			},
		},
		agent: true,
	},
	sessionRedis: {
		name: 'session',
	},
	jwt: {
		key: {
			private: fs.readFileSync(`${__dirname}/jwt/es256/private.key`),
		},
	},
	logger: {
		level: 'NONE',
		disableConsoleAfterReady: false,
	},
	sso: {
		address: env.SSO_ADDRESS || 'https://cloud-production-alpha.leaf.linketech.cn',
		authPath: '/user/auth',
	},
})
