![Node.js CI](https://github.com/linketech/sso/workflows/Node.js%20CI/badge.svg)

# sso

## 网站接入

* 创建网站
  ![image](https://user-images.githubusercontent.com/7960859/124877520-be752400-dffd-11eb-8fc7-3f4c4623a6a9.png)
* 给网站分配密钥或公钥
  ![image](https://user-images.githubusercontent.com/7960859/124877593-cfbe3080-dffd-11eb-9105-815606951a0e.png)
* 网站使用密钥私钥签发JWT，在payload中指定type（值为`website`）和name（值为创建时指定的网站名）
  ![image](https://user-images.githubusercontent.com/7960859/124876868-10697a00-dffd-11eb-99e0-89283edd0840.png)
* （可选）通过`{{hostname}}/api/website_api/init/role/permission`，发送需要管理的权限集到SSO
  ![image](https://user-images.githubusercontent.com/7960859/124875448-7f45d380-dffb-11eb-9ef1-723394d1e4c4.png)
* 给SSO用户分配网站角色，给网站角色分配网站权限
  ![image](https://user-images.githubusercontent.com/7960859/124877708-e9f80e80-dffd-11eb-831e-8f454e770882.png)
  ![image](https://user-images.githubusercontent.com/7960859/124877750-f8462a80-dffd-11eb-8d75-80f92b4372a9.png)
* 之后，用户通过登录SSO获取JWT，然后拿着JWT访问网站，网站解出用户名或角色名，通过`{{hostname}}/api/website_api/user/admin/permission`或`{{hostname}}/api/website_api/role/admin/permission`获取权限集
  ![image](https://user-images.githubusercontent.com/7960859/124876242-5d008580-dffc-11eb-84b0-4b74248f63e0.png)
