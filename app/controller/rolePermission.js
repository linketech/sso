const { Controller } = require('egg')

module.exports = class RolePermissionController extends Controller {
	async index() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			role_id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
				required: false,
			},
			permission_id: {
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
		const permission_id = request.query.permission_id && Buffer.from(request.query.permission_id, 'hex')

		const permissions = await ctx.service.rolePermission.list({
			role_id,
			permission_id,
		})
		response.body = permissions.map((permission) => ({
			role_id: permission.role_id.toString('hex'),
			role_name: permission.role_name,
			permission_id: permission.permission_id.toString('hex'),
			permission_path: permission.permission_path,
			permission_method: permission.permission_method,
		}))
	}

	async update() {
		const { ctx, app } = this
		const { request, response } = ctx

		const errors = app.validator.validate({
			role_id: {
				type: 'string',
				format: /^[0-9A-Fa-f]{32}$/,
			},
			permission_id_list: {
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
		const permission_id_list = request.body.permission_id_list.map((id) => Buffer.from(id, 'hex'))

		const role = await ctx.service.role.getById(role_id)
		if (!role) {
			ctx.response.body = { message: '权限组不存在' }
			ctx.response.status = 400
			return
		}

		const permissions = await ctx.service.permission.list(permission_id_list)
		const notExistPermissions = permission_id_list
			.filter((id) => !permissions.find((permission) => permission.id.equals(id)))
		if (notExistPermissions && notExistPermissions.length > 0) {
			ctx.response.body = { message: '权限ID不存在', values: notExistPermissions }
			ctx.response.status = 400
			return
		}

		await ctx.service.rolePermission.update(role.id, permission_id_list)
		response.status = 200
	}
}
