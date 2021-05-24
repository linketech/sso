const logger = require('@z-ivan/koa-logger')

module.exports = (options, app) => logger(
	app.logger.info.bind(app.logger),
	{ level: options.env === 'prod' ? 0 : 3 },
)
