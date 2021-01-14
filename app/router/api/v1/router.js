/**
 * @param {Egg.Application} app - egg application
 */
module.exports = ({ router, controller }) => {
	const subRouter = router.namespace('/api')

	subRouter.get('/', controller.home.index)

	subRouter.get('/session/frontend_salt/:username', controller.session.getfrontendSaltByUsername)
	subRouter.post('/session', controller.session.create)
	subRouter.get('/session', controller.session.get)
	subRouter.delete('/session', controller.session.destroy)

	subRouter.get('/jwt', controller.jwt.get)
	subRouter.get('/jwt/verify/:token', controller.jwt.verify)

	subRouter.post('/user', controller.user.create)
}
