const { Controller } = require('egg')

module.exports = class WebstieController extends Controller {
	async index() {
		const { ctx } = this
		const { response } = ctx

		const websites = await ctx.service.website.list()

		response.body = websites.map(({ id, ...rest }) => ({
			id: id.toString('hex'),
			...rest,
		}))
	}

	async create() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			name: {
				type: 'string',
				max: 45,
			},
			url: {
				type: 'url',
				max: 45,
			},
		}, request.body)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const { name, url } = request.body

		const website = await ctx.service.website.getByName(name)
		if (website) {
			ctx.response.body = { message: '网站名已经存在' }
			ctx.response.status = 400
			return
		}

		const { id } = await ctx.service.website.create({
			name,
			url,
		})

		response.body = { id: id.toString('hex') }
	}

	async destroy() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
			},
		}, request.query)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const id = Buffer.from(request.query.id, 'hex')

		const website = await ctx.service.website.getById(id)
		if (!website) {
			ctx.response.body = { message: '网站不存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.website.destroy(id)

		response.status = 200
	}

	async update() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
			},
		}, request.query)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const bodyErrors = app.validator.validate({
			name: {
				type: 'string',
				max: 45,
			},
			url: {
				type: 'url',
				max: 45,
			},
		}, request.body)

		if (bodyErrors) {
			response.body = { message: '无效请求参数', errors: bodyErrors }
			response.status = 400
			return
		}

		const id = Buffer.from(request.query.id, 'hex')
		const { name, url } = request.body

		const website = await ctx.service.website.getById(id)
		if (!website) {
			ctx.response.body = { message: '网站不存在' }
			ctx.response.status = 400
			return
		}

		const sameNameWebsite = await ctx.service.website.getByName(name)
		if (sameNameWebsite && !id.equals(sameNameWebsite.id)) {
			ctx.response.body = { message: '网站名已经存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.website.update(id, {
			name,
			url,
		})

		response.status = 200
	}
}
