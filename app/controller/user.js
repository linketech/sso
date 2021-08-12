const { Controller } = require('egg')

const { USER: { DISABLED } } = require('../constant')

module.exports = class UserController extends Controller {
	async index() {
		const { ctx } = this
		const { response } = ctx

		response.body = await ctx.service.user.list()
	}

	async getDetail() {
		const { ctx } = this
		const { response } = ctx

		ctx.validate({
			params: {
				type: 'object',
				properties: {
					user_name: {
						type: 'string',
						maxLength: 45,
					},
				},
				required: ['user_name'],
			},
		})

		const { user_name } = ctx.params

		response.body = await ctx.service.user.getDetailByName(user_name)
	}

	async update() {
		const { ctx } = this
		const { request, response } = ctx

		ctx.validate({
			body: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						pattern: '^[0-9A-Fa-f]{32}$',
					},
					role_id: {
						type: 'string',
						pattern: '^[0-9A-Fa-f]{32}$',
					},
					disabled: {
						type: 'integer',
						enum: Object.values(DISABLED),
					},
				},
				required: ['id'],
			},
		})

		const id = Buffer.from(request.body.id, 'hex')
		const roleId = request.body.role_id && Buffer.from(request.body.role_id, 'hex')
		const { disabled } = request.body

		const newRole = {}

		if (roleId) {
			const role = await ctx.service.role.getById(roleId)
			if (!role) {
				response.body = { message: '权限组不存在' }
				response.status = 400
				return
			}
			newRole.role_id = roleId
		}

		if (disabled !== undefined) {
			newRole.disabled = disabled
		}

		await ctx.service.user.updateRole(id, newRole)

		response.status = 200
	}

	async resetPassword() {
		const { ctx } = this
		const { request, response } = ctx

		ctx.validate({
			body: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						pattern: '^[0-9A-Fa-f]{32}$',
					},
				},
				required: ['id'],
			},
		})

		const id = Buffer.from(request.body.id, 'hex')

		await ctx.service.user.resetPassword(id)

		response.status = 200
	}

	async updateWebSite() {
		const { ctx } = this
		const { request, response } = ctx

		ctx.validate({
			params: {
				type: 'object',
				properties: {
					user_name: {
						type: 'string',
						maxLength: 45,
					},
				},
				required: ['user_name'],
			},
			body: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						name: {
							type: 'string',
						},
						role_name: {
							type: 'string',
						},
					},
					required: ['name'],
				},
				minItems: 1,
			},
		})

		const { user_name } = ctx.params
		const websites = request.body

		await ctx.service.user.updateWebSite(user_name, websites)

		response.status = 200
	}

	async destroy() {
		const { ctx } = this
		const { request, response } = ctx

		ctx.validate({
			query: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						pattern: '^[0-9A-Fa-f]{32}$',
					},
				},
				required: ['id'],
			},
		})

		await ctx.service.user.destroy(Buffer.from(request.query.id, 'hex'))

		response.status = 200
	}
}
