/**
 * @param {Egg.Application} app - egg application
 */
module.exports = ({ router, controller }) => {
	const subRouter = router.namespace('/api/v1')

	subRouter.get('/', controller.home.index)

	subRouter.get('/session/frontend_salt', controller.session.frontendSalt)
	subRouter.post('/session', controller.session.create)
	subRouter.get('/session', controller.session.get)
	subRouter.delete('/session', controller.session.destroy)
}
