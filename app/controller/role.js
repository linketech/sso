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

		response.body = await ctx.service.role.create(name)
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

		await ctx.service.role.destroy(request.query.id)

		response.status = 200
	}
}
