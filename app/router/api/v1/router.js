const loginFilter = require('./loginFilter')
const websiteFilter = require('./websiteFilter')
const permissionFilter = require('./permissionFilter')

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = ({ router, controller }) => {
	const subRouter = router.namespace('/api')

	subRouter.get('/', controller.home.index)

	subRouter.get('/session/frontend_salt/:username', controller.session.getfrontendSaltByUsername)
	subRouter.post('/session', controller.session.create)
	subRouter.get('/session', loginFilter, controller.session.get)
	subRouter.delete('/session', loginFilter, controller.session.destroy)
	subRouter.post('/session/user', controller.session.userCreate)

	subRouter.get('/jwt', loginFilter, controller.jwt.get)
	subRouter.get('/jwt/auth', controller.jwt.auth)
	subRouter.get('/jwt/verify/:token', controller.jwt.verify)

	subRouter.put('/self/password', loginFilter, controller.self.updatePassword)

	subRouter.get('/user', loginFilter, permissionFilter('查看所有', '用户'), controller.user.index)
	subRouter.get('/user/:user_name', loginFilter, permissionFilter('查看详情', '用户'), controller.user.getDetail)
	subRouter.put('/user', loginFilter, permissionFilter('修改', '用户'), controller.user.update)
	subRouter.put('/user/password/reset', loginFilter, permissionFilter('重置密码', '用户'), controller.user.resetPassword)
	subRouter.put('/user/:user_name/match/website', loginFilter, permissionFilter('分配网站', '用户'), controller.user.updateWebSite)
	subRouter.delete('/user', loginFilter, permissionFilter('删除', '用户'), controller.user.destroy)

	subRouter.get('/role', loginFilter, permissionFilter('查看所有', '权限组'), controller.role.index)
	subRouter.post('/role', loginFilter, permissionFilter('创建', '权限组'), controller.role.create)
	subRouter.delete('/role', loginFilter, permissionFilter('删除', '权限组'), controller.role.destroy)

	subRouter.get('/permission', loginFilter, permissionFilter('查看所有', '权限'), controller.permission.index)
	subRouter.put('/permission', loginFilter, permissionFilter('修改', '权限'), controller.permission.update)

	subRouter.get('/role/permission', loginFilter, permissionFilter('查看所有', '权限组与权限的关系'), controller.rolePermission.index)
	subRouter.put('/role/permission', loginFilter, permissionFilter('更新', '权限组与权限的关系'), controller.rolePermission.update)
	/**
	 * 网站功能
	 */
	subRouter.get('/website', loginFilter, permissionFilter('查看所有', '网站'), controller.website.core.index)
	subRouter.post('/website', loginFilter, permissionFilter('创建', '网站'), controller.website.core.create)
	subRouter.delete('/website/:website_name', loginFilter, permissionFilter('删除', '网站'), controller.website.core.destroy)
	subRouter.put('/website/:website_name', loginFilter, permissionFilter('更新', '网站'), controller.website.core.update)
	subRouter.get('/website/:website_name/key', loginFilter, permissionFilter('查看所有', '网站密钥或公钥'), controller.website.key.index)
	subRouter.post('/website/:website_name/key', loginFilter, permissionFilter('创建', '网站密钥或公钥'), controller.website.key.create)
	subRouter.delete('/website/:website_name/key/:algorithm_name', loginFilter, permissionFilter('删除', '网站密钥或公钥'), controller.website.key.destroy)
	subRouter.get('/website/:website_name/role', loginFilter, permissionFilter('查看所有', '网站角色'), controller.website.role.index)
	subRouter.post('/website/:website_name/role', loginFilter, permissionFilter('创建', '网站角色'), controller.website.role.create)
	subRouter.delete('/website/:website_name/role/:role_name', loginFilter, permissionFilter('删除', '网站角色'), controller.website.role.destroy)
	subRouter.put('/website/:website_name/role/:role_name', loginFilter, permissionFilter('修改', '网站角色'), controller.website.role.update)
	subRouter.get('/website/:website_name/permission', loginFilter, permissionFilter('查看所有', '网站权限'), controller.website.permission.index)
	subRouter.post('/website/:website_name/permission', loginFilter, permissionFilter('创建', '网站权限'), controller.website.permission.create)
	subRouter.delete('/website/:website_name/permission/:permission_id', loginFilter, permissionFilter('删除', '网站权限'), controller.website.permission.destroy)
	subRouter.put('/website/:website_name/permission/:permission_id', loginFilter, permissionFilter('修改', '网站权限'), controller.website.permission.update)
	subRouter.get('/website/:website_name/role/:role_name/permission', loginFilter, permissionFilter('查看所有', '网站角色下的网站权限'), controller.website.rolePermission.index)
	subRouter.put('/website/:website_name/role/:role_name/permission', loginFilter, permissionFilter('更新', '网站角色下的网站权限'), controller.website.rolePermission.update)
	/**
	 * 向网站暴露的功能
	 * 1. 网站告诉SSO有哪些权限需要管理
	 * 2. 网站访问SSO，获取指定用户有哪些权限
	 */
	subRouter.put('/website_api/init/role/permission', websiteFilter, controller.websiteApi.updateRolePermission)
	subRouter.get('/website_api/user/:user_name/permission', websiteFilter, controller.websiteApi.getPermissionsByUserName)
	subRouter.get('/website_api/role/:role_name/permission', websiteFilter, controller.websiteApi.getPermissionsByRoleName)
}
