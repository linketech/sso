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

	subRouter.get('/jwt', loginFilter, controller.jwt.get)
	subRouter.get('/jwt/auth', controller.jwt.auth)
	subRouter.get('/jwt/verify/:token', controller.jwt.verify)

	subRouter.get('/user', loginFilter, permissionFilter('查看所有', '用户'), controller.user.index)
	subRouter.put('/user', loginFilter, permissionFilter('修改', '用户'), controller.user.update)
	subRouter.delete('/user', loginFilter, permissionFilter('删除', '用户'), controller.user.destroy)

	subRouter.get('/role', loginFilter, permissionFilter('查看所有', '权限组'), controller.role.index)
	subRouter.post('/role', loginFilter, permissionFilter('创建', '权限组'), controller.role.create)
	subRouter.delete('/role', loginFilter, permissionFilter('删除', '权限组'), controller.role.destroy)

	subRouter.get('/permission', loginFilter, permissionFilter('查看所有', '权限'), controller.permission.index)
	subRouter.put('/permission', loginFilter, permissionFilter('修改', '权限'), controller.permission.update)

	subRouter.get('/role/permission', loginFilter, permissionFilter('查看所有', '权限组与权限的关系'), controller.rolePermission.index)
	subRouter.put('/role/permission', loginFilter, permissionFilter('更新', '权限组与权限的关系'), controller.rolePermission.update)

	subRouter.get('/website', loginFilter, permissionFilter('查看所有', '网站'), controller.website.index)
	subRouter.post('/website', loginFilter, permissionFilter('创建', '网站'), controller.website.create)
	subRouter.delete('/website', loginFilter, permissionFilter('删除', '网站'), controller.website.destroy)
	subRouter.put('/website', loginFilter, permissionFilter('更新', '网站'), controller.website.update)

	subRouter.get('/role/website', loginFilter, permissionFilter('查看所有', '权限组与网站的关系'), controller.roleWebsite.index)
	subRouter.put('/role/website', loginFilter, permissionFilter('更新', '权限组与网站的关系'), controller.roleWebsite.update)
}
