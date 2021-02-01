const loginFilter = require('./loginFilter')
const permissionFilter = require('./permissionFilter')

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = ({ router, controller }) => {
	const subRouter = router.namespace('/api')

	subRouter.get('', controller.home.index)

	subRouter.get('/session/frontend_salt/:username', controller.session.getfrontendSaltByUsername)
	subRouter.post('/session', controller.session.create)
	subRouter.get('/session', loginFilter, controller.session.get)
	subRouter.delete('/session', loginFilter, controller.session.destroy)
	subRouter.post('/session/user', controller.session.userCreate)

	subRouter.get('/jwt', loginFilter, permissionFilter, controller.jwt.get)
	subRouter.get('/jwt/verify/:token', controller.jwt.verify)

	subRouter.get('/user', loginFilter, permissionFilter, controller.user.index)
	subRouter.put('/user', loginFilter, permissionFilter, controller.user.update)
	subRouter.delete('/user', loginFilter, permissionFilter, controller.user.destroy)

	subRouter.get('/role', loginFilter, permissionFilter, controller.role.index)
	subRouter.post('/role', loginFilter, permissionFilter, controller.role.create)
	subRouter.delete('/role', loginFilter, permissionFilter, controller.role.destroy)

	subRouter.get('/permission', loginFilter, permissionFilter, controller.permission.index)

	subRouter.get('/role/permission', loginFilter, permissionFilter, controller.rolePermission.index)
	subRouter.put('/role/permission/add', loginFilter, permissionFilter, controller.rolePermission.update)
	subRouter.put('/role/permission/subtract', loginFilter, permissionFilter, controller.rolePermission.update)
	subRouter.put('/role/permission', loginFilter, permissionFilter, controller.rolePermission.update)

	subRouter.get('/website', loginFilter, permissionFilter, controller.website.index)
	subRouter.post('/website', loginFilter, permissionFilter, controller.website.create)
	subRouter.delete('/website', loginFilter, permissionFilter, controller.website.destroy)
	subRouter.put('/website', loginFilter, permissionFilter, controller.website.update)

	subRouter.get('/role/website', loginFilter, permissionFilter, controller.roleWebsite.index)
	subRouter.post('/role/website', loginFilter, permissionFilter, controller.roleWebsite.create)
	subRouter.delete('/role/website', loginFilter, permissionFilter, controller.roleWebsite.destroy)
}
