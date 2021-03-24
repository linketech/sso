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

	async update() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			role_id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
			},
			website_id_list: {
				type: 'array',
				itemType: 'string',
				rule: {
					format: /^[0-9A-Fa-f]{32}$/,
				},
			},
		}, request.body)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const role_id = Buffer.from(request.body.role_id, 'hex')
		const website_id_list = request.body.website_id_list.map((id) => Buffer.from(id, 'hex'))

		const role = await ctx.service.role.getById(role_id)
		if (!role) {
			ctx.response.body = { message: '权限组不存在' }
			ctx.response.status = 400
			return
		}

		const websites = await ctx.service.website.list(website_id_list)
		const notExistwebsites = website_id_list
			.filter((id) => !websites.find((website) => website.id.equals(id)))
		if (notExistwebsites && notExistwebsites.length > 0) {
			ctx.response.body = { message: '网站ID不存在', values: notExistwebsites }
			ctx.response.status = 400
			return
		}

		await ctx.service.roleWebsite.update(role.id, website_id_list)
		response.status = 200
	}
}
