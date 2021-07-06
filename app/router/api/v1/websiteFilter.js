module.exports = async function websiteFilter(ctx, next) {
	ctx.validate({
		query: {
			type: 'object',
			properties: {
				token: {
					type: 'string',
				},
			},
			required: ['token'],
		},
	})

	const { token } = ctx.request.query

	const website = await ctx.service.website.key.verify(token)

	ctx.jwt = {
		website,
	}

	await next()
}
