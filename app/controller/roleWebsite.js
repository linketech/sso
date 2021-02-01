const { Controller } = require('egg')

module.exports = class RoleWebstieController extends Controller {
	async index() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			role_id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
				required: false,
			},
			website_id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
				required: false,
			},
		}, request.query)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const role_id = request.query.role_id && Buffer.from(request.query.role_id, 'hex')
		const website_id = request.query.website_id && Buffer.from(request.query.website_id, 'hex')

		const websites = await ctx.service.roleWebsite.list({
			role_id,
			website_id,
		})

		response.body = websites
	}

	async create() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			role_id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
			},
			website_id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
			},
		}, request.body)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const role_id = Buffer.from(request.body.role_id, 'hex')
		const website_id = Buffer.from(request.body.website_id, 'hex')

		const role = await ctx.service.role.getById(role_id)
		if (!role) {
			ctx.response.body = { message: '权限组不存在' }
			ctx.response.status = 400
			return
		}
		if (role.name === 'admin') {
			ctx.response.body = { message: '不能操作Admin权限组' }
			ctx.response.status = 400
			return
		}

		const website = await ctx.service.website.getById(website_id)
		if (!website) {
			ctx.response.body = { message: '网站不存在' }
			ctx.response.status = 400
			return
		}

		const roleWebsite = await ctx.service.roleWebsite.getById({ role_id, website_id })
		if (roleWebsite) {
			ctx.response.body = { message: '权限组与网站关系已经存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.roleWebsite.create({ role_id, website_id })

		response.status = 200
	}

	async destroy() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			role_id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
			},
			website_id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
			},
		}, request.body)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const role_id = Buffer.from(request.body.role_id, 'hex')
		const website_id = Buffer.from(request.body.website_id, 'hex')

		const role = await ctx.service.role.getById(role_id)
		if (!role) {
			ctx.response.body = { message: '权限组不存在' }
			ctx.response.status = 400
			return
		}
		if (role.name === 'admin') {
			ctx.response.body = { message: '不能操作Admin权限组' }
			ctx.response.status = 400
			return
		}

		const website = await ctx.service.website.getById(website_id)
		if (!website) {
			ctx.response.body = { message: '网站不存在' }
			ctx.response.status = 400
			return
		}

		const roleWebsite = await ctx.service.roleWebsite.getById({ role_id, website_id })
		if (!roleWebsite) {
			ctx.response.body = { message: '权限组与网站关系不存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.roleWebsite.destroy({ role_id, website_id })

		response.status = 200
	}
}
