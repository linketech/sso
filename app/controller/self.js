const { Controller } = require('egg')

const { USER: { PASSWORD } } = require('../constant')

/**
 * 管理登录用户的个人信息
 */
module.exports = class SelfController extends Controller {
	async updatePassword() {
		const { ctx } = this
		const { response } = ctx

		ctx.validate({
			body: {
				type: 'object',
				properties: {
					type: {
						type: 'integer',
						enum: Object.values(PASSWORD),
					},
				},
			},
		})

		const { type } = ctx.request.body

		ctx.validate({
			body: {
				type: 'object',
				properties: {
					oldPassword: {
						type: 'string',
						pattern: type === PASSWORD.NO_HASHED ? '^\\w{1,32}$' : '^[0-9A-Fa-f]{64}$',
					},
					newPassword: {
						type: 'string',
						pattern: type === PASSWORD.NO_HASHED ? '^\\w{1,32}$' : '^[0-9A-Fa-f]{64}$',
					},
				},
				required: ['oldPassword', 'newPassword'],
			},
		})

		const { oldPassword, newPassword } = ctx.request.body
		await ctx.service.user.updatePassword(Buffer.from(ctx.session.user.id, 'hex'), type, oldPassword, newPassword)

		response.status = 200
	}
}
