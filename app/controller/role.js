const { Controller } = require('egg')

module.exports = class UserController extends Controller {
	async index() {
		const { ctx } = this
		const { response } = ctx

		const roles = await ctx.service.role.list()

		response.body = roles.map(({ id, name }) => ({
			id: id.toString('hex'),
			name,
		}))
	}

	async create() {
		const { ctx } = this
		const { request, response } = ctx

		ctx.validate({
			body: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						maxLength: 45,
					},
				},
				required: ['name'],
			},
		})

		const { name } = request.body

		const role = await ctx.service.role.getByName(name)
		if (role) {
			ctx.response.body = { message: '权限组名已经存在' }
			ctx.response.status = 400
			return
		}

		const { id } = await ctx.service.role.create(name)

		response.body = {
			id: id.toString('hex').toUpperCase(),
		}
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
						maxLength: 45,
					},
				},
				required: ['id'],
			},
		})

		const id = Buffer.from(request.query.id, 'hex')

		const role = await ctx.service.role.getById(id)
		if (!role) {
			ctx.response.body = { message: '权限组不存在' }
			ctx.response.status = 400
			return
		}

		await ctx.service.role.destroy(id)

		response.status = 200
	}
}
