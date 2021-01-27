const { Controller } = require('egg')

module.exports = class RolePermissionController extends Controller {
	async index() {
		const { ctx, app } = this
		const { params, response } = ctx

		const errors = app.validator.validate({
			name: {
				type: 'string',
				max: 45,
			},
		}, params)

		if (errors) {
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const { name } = params

		const role = await ctx.service.role.getByName(name)
		if (!role) {
			ctx.response.body = { message: '权限组名不存在' }
			ctx.response.status = 400
			return
		}

		const permissions = await ctx.service.rolePermission.getByRoleId(role.id)
		response.body = permissions
	}

	async create() {
		const { ctx, app } = this
		const { params, request, response } = ctx

		const paramsErrors = app.validator.validate({
			name: {
				type: 'string',
				max: 45,
			},
		}, params)

		const bodyErrors = app.validator.validate({
			id_list: {
				type: 'array',
				itemType: 'string',
				rule: {
					format: /^[0-9A-Fa-f]{32}$/,
				},
				min: 1,
			},
		}, request.body)

		if (paramsErrors || bodyErrors) {
			const errors = []
			if (paramsErrors) {
				errors.push(...paramsErrors)
			}
			if (bodyErrors) {
				errors.push(...bodyErrors)
			}
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const { name } = params

		const idList = request.body.id_list
		const bufferIdList = idList.map((id) => Buffer.from(id, 'hex'))

		const role = await ctx.service.role.getByName(name)
		if (!role) {
			ctx.response.body = { message: '权限组名不存在' }
			ctx.response.status = 400
			return
		}

		const permissions = await ctx.service.permission.list(bufferIdList)
		const notExistPermissions = idList
			.filter((id) => !permissions.find((permission) => permission.id.toUpperCase() === id.toUpperCase()))
		if (notExistPermissions && notExistPermissions.length > 0) {
			ctx.response.body = { message: '权限ID不存在', values: notExistPermissions }
			ctx.response.status = 400
			return
		}

		const hasPermissions = await ctx.service.rolePermission.getByRoleId(role.id)
		const alreadyHasPermissions = idList
			.filter((id) => hasPermissions.find((permission) => permission.id.toUpperCase() === id.toUpperCase()))
		if (alreadyHasPermissions && alreadyHasPermissions.length > 0) {
			ctx.response.body = { message: '权限组存在该权限', values: alreadyHasPermissions }
			ctx.response.status = 400
			return
		}

		await ctx.service.rolePermission.create(role.id, bufferIdList)
		response.status = 200
	}

	async destroy() {
		const { ctx, app } = this
		const { params, request, response } = ctx

		const paramsErrors = app.validator.validate({
			name: {
				type: 'string',
				max: 45,
			},
		}, params)

		const bodyErrors = app.validator.validate({
			id_list: {
				type: 'array',
				itemType: 'string',
				rule: {
					format: /^[0-9A-Fa-f]{32}$/,
				},
				min: 1,
			},
		}, request.body)

		if (paramsErrors || bodyErrors) {
			const errors = []
			if (paramsErrors) {
				errors.push(...paramsErrors)
			}
			if (bodyErrors) {
				errors.push(...bodyErrors)
			}
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const { name } = params

		const idList = request.body.id_list
		const bufferIdList = idList.map((id) => Buffer.from(id, 'hex'))

		const role = await ctx.service.role.getByName(name)
		if (!role) {
			ctx.response.body = { message: '权限组名不存在' }
			ctx.response.status = 400
			return
		}

		const permissions = await ctx.service.permission.list(bufferIdList)
		const notExistPermissions = idList
			.filter((id) => !permissions.find((permission) => permission.id.toUpperCase() === id.toUpperCase()))
		if (notExistPermissions && notExistPermissions.length > 0) {
			ctx.response.body = { message: '权限ID不存在', values: notExistPermissions }
			ctx.response.status = 400
			return
		}

		const hasPermissions = await ctx.service.rolePermission.getByRoleId(role.id)
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

	async update() {
		const { ctx, app } = this
		const { params, request, response } = ctx

		const paramsErrors = app.validator.validate({
			name: {
				type: 'string',
				max: 45,
			},
		}, params)

		const bodyErrors = app.validator.validate({
			id_list: {
				type: 'array',
				itemType: 'string',
				rule: {
					format: /^[0-9A-Fa-f]{32}$/,
				},
				min: 1,
			},
		}, request.body)

		if (paramsErrors || bodyErrors) {
			const errors = []
			if (paramsErrors) {
				errors.push(...paramsErrors)
			}
			if (bodyErrors) {
				errors.push(...bodyErrors)
			}
			response.body = { message: '无效请求参数', errors }
			response.status = 400
			return
		}

		const { name } = params

		const idList = request.body.id_list
		const bufferIdList = idList.map((id) => Buffer.from(id, 'hex'))

		const role = await ctx.service.role.getByName(name)
		if (!role) {
			ctx.response.body = { message: '权限组名不存在' }
			ctx.response.status = 400
			return
		}

		const permissions = await ctx.service.permission.list(bufferIdList)
		const notExistPermissions = idList
			.filter((id) => !permissions.find((permission) => permission.id.toUpperCase() === id.toUpperCase()))
		if (notExistPermissions && notExistPermissions.length > 0) {
			ctx.response.body = { message: '权限ID不存在', values: notExistPermissions }
			ctx.response.status = 400
			return
		}

		await ctx.service.rolePermission.update(role.id, bufferIdList)
		response.status = 200
	}
}
