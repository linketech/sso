const chalk = require('chalk')

const MAX = 1024
function tldr(json) {
	if (json !== undefined && json !== null) {
		const string = JSON.stringify(json)
		return string.length > MAX ? `${string.substring(0, MAX)}...` : string
	}
	if (json === undefined || json === null) {
		return ''
	}
	return json
}

module.exports = (options, app) => {
	const isProd = options.env === 'prod'
	const subChalk = new chalk.Instance({ level: isProd ? 0 : 3 })

	return async ({ request, response }, next) => {
		const prefix = [
			request.ip, request.protocol,
			subChalk.black(subChalk.bgBlue(request.method)),
			subChalk.black(subChalk.bgCyan(request.url)),
		]
		app.logger.info(
			...prefix,
			subChalk.gray('>>'),
			request.type,
			subChalk.gray(tldr(request.body)),
		)
		const now = Date.now()
		await next()
		const cost = Date.now() - now
		let statusColor
		if (response.status >= 200 && response.status < 300) {
			statusColor = 'bgGreen'
		} else if (response.status >= 300 && response.status < 400) {
			statusColor = 'bgYellow'
		} else if (response.status >= 400 && response.status < 500) {
			statusColor = 'bgRed'
		} else if (response.status >= 500) {
			statusColor = 'bgMagenta'
		}
		app.logger.info(
			...prefix,
			subChalk.gray('<<'),
			response.type,
			subChalk.black(subChalk[statusColor](response.status)),
			subChalk.gray(tldr(response.body)),
			`(${cost}ms)`,
		)
	}
}
