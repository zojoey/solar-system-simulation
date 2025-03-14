# 太阳系行星运动模拟

这是一个使用Three.js实现的太阳系行星运动模拟项目，可以展示太阳系八大行星的运动轨迹和基本信息。

## 部署到GitHub Pages的步骤

要生成一个可以在微信上打开的链接，您可以按照以下步骤将项目部署到GitHub Pages：

1. 在GitHub上创建一个新的仓库
2. 将本地项目文件上传到该仓库
3. 在仓库设置中启用GitHub Pages功能

### 详细步骤

1. 登录您的GitHub账户
2. 点击右上角的"+"按钮，选择"New repository"
3. 输入仓库名称，例如"solar-system-simulation"
4. 选择公开(Public)仓库
5. 点击"Create repository"创建仓库
6. 在本地项目目录中执行以下Git命令：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/您的用户名/solar-system-simulation.git
git push -u origin main
```

7. 在GitHub仓库页面，点击"Settings"选项卡
8. 在左侧菜单中找到"Pages"选项
9. 在"Source"部分，选择"main"分支和"/(root)"文件夹
10. 点击"Save"按钮
11. 等待几分钟后，GitHub会提供一个可访问的URL，格式为：`https://您的用户名.github.io/solar-system-simulation/`

这个URL就是可以在微信中打开的链接。

## 注意事项

- 项目中使用的纹理图片需要确保能够正常加载，可能需要调整路径
- 如果项目中有其他外部资源，也需要确保能够正常访问
- 部署完成后，建议在不同设备上测试，确保兼容性

## 其他部署选项

除了GitHub Pages，您还可以考虑以下免费托管服务：

1. Netlify: https://www.netlify.com/
2. Vercel: https://vercel.com/
3. Cloudflare Pages: https://pages.cloudflare.com/

这些服务都提供免费的静态网站托管，并且可以生成可在微信中访问的链接。