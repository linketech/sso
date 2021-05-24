const { Controller } = require('egg')

module.exports = class UserController extends Controller {
	async index() {
		const { ctx } = this
		const { response } = ctx

		const users = await ctx.service.user.list()

		response.body = users.map(({ id, name, disabled, role_id, role_name }) => ({
			id: id.toString('hex'),
			name,
			disabled,
			role_id: role_id && role_id.toString('hex'),
			role_name,
		}))
	}

	async update() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
			},
			role_id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
				required: false,
			},
			disabled: {
				type: 'enum',
				values: [0, 1],
				required: false,
			},
		}, request.body)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const id = Buffer.from(request.body.id, 'hex')
		const roleId = request.body.role_id && Buffer.from(request.body.role_id, 'hex')
		const { disabled } = request.body

		const user = await ctx.service.user.getById(id)
		if (!user) {
			response.body = { message: '用户不存在' }
			response.status = 400
			return
		}

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

		const user = await ctx.service.user.getById(id)
		if (!user) {
			ctx.response.body = { message: '用户不存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.user.destroy(id)

		response.status = 200
	}
}
