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
		response.body = permissions
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
				min: 1,
			},
		}, request.body)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const role_id = Buffer.from(request.body.role_id, 'hex')
		const idList = request.body.permission_id_list
		const bufferIdList = idList.map((id) => Buffer.from(id, 'hex'))

		const role = await ctx.service.role.getById(role_id)
		if (!role) {
			ctx.response.body = { message: '权限组不存在' }
			ctx.response.status = 400
			return
		}
		if (role.name === 'admin') {
			ctx.response.body = { message: '不能对Admin权限组进行操作' }
			ctx.response.status = 400
			return
		}

		const permissions = await ctx.service.permission.list(bufferIdList)

		const notExistPermissions = bufferIdList
			.filter((id) => !permissions.find((permission) => permission.id.equals(id)))
		if (notExistPermissions && notExistPermissions.length > 0) {
			ctx.response.body = { message: '权限组ID不存在', values: notExistPermissions }
			ctx.response.status = 400
			return
		}

		const { path } = this.ctx.request
		if (path === '/api/role/permission') {
			await ctx.service.rolePermission.update(role.id, bufferIdList)
			response.status = 200
		} else if (path === '/api/role/permission/add') {
			const hasPermissions = await ctx.service.rolePermission.list({ role_id })
			const alreadyHasPermissions = idList
				.filter((id) => hasPermissions.find((permission) => permission.id.toUpperCase() === id.toUpperCase()))
			if (alreadyHasPermissions && alreadyHasPermissions.length > 0) {
				ctx.response.body = { message: '权限组存在该权限', values: alreadyHasPermissions }
				ctx.response.status = 400
				return
			}
			await ctx.service.rolePermission.create(role_id, bufferIdList)
			response.status = 200
		} else if (path === '/api/role/permission/subtract') {
			const hasPermissions = await ctx.service.rolePermission.list({ role_id })
			const notHasPermissions = idList
				.filter((id) => !hasPermissions.find((permission) => permission.id.toUpperCase() === id.toUpperCase()))
			if (notHasPermissions && notHasPermissions.length > 0) {
				ctx.response.body = { message: '权限组不存在该权限', values: notHasPermissions }
				ctx.response.status = 400
				return
			}
			await ctx.service.rolePermission.destroy(role.id, bufferIdList)
			response.status = 200
		}
	}
}
