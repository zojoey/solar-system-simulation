# 太阳系行星运动模拟

这是一个使用Three.js实现的太阳系行星运动模拟项目，可以展示太阳系八大行星的运动轨迹和基本信息。项目已经进行了优化，确保在GitHub Pages环境中能够正确加载，不会出现白屏问题。

## 在线预览

部署完成后，您可以通过以下URL访问太阳系模拟：

```
https://您的用户名.github.io/solar-system-simulation/
```

## 功能特点

- 基于真实天文数据的太阳系模型
- 行星按照真实比例和轨道运行
- 可交互式3D界面，支持缩放和旋转
- 点击行星查看详细信息
- 优化的资源加载机制，防止白屏问题
- 适配移动设备和桌面浏览器

## 部署到GitHub Pages的详细步骤

### 1. 创建GitHub仓库

1. 登录您的GitHub账户
2. 点击右上角的"+"按钮，选择"New repository"
3. 输入仓库名称，例如"solar-system-simulation"
4. 选择公开(Public)仓库
5. 点击"Create repository"创建仓库

### 2. 上传项目文件

**方法一：使用Git命令行**

在本地项目目录中执行以下Git命令：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/您的用户名/solar-system-simulation.git
git push -u origin main
```

**方法二：直接在GitHub网页上传**

1. 进入您创建的仓库页面
2. 点击"Add file"按钮，选择"Upload files"
3. 将项目文件拖拽到上传区域
4. 添加提交信息，如"Initial commit"
5. 点击"Commit changes"按钮

### 3. 启用GitHub Pages

1. 在GitHub仓库页面，点击"Settings"选项卡
2. 在左侧菜单中找到"Pages"选项
3. 在"Source"部分，选择"main"分支和"/(root)"文件夹
4. 点击"Save"按钮
5. 等待几分钟后，GitHub会提供一个可访问的URL

### 4. 验证部署

1. 访问GitHub Pages生成的URL（通常是`https://您的用户名.github.io/solar-system-simulation/`）
2. 确认太阳系模型能够正常加载和运行
3. 测试交互功能，如点击行星查看详情

## 故障排除

如果您在部署或访问过程中遇到问题，请尝试以下解决方法：

1. **白屏问题**：项目已添加加载状态指示器和错误处理机制，如果出现白屏，请查看浏览器控制台的错误信息。

2. **资源加载失败**：确保所有资源（特别是纹理图片）都已正确上传到GitHub仓库。

3. **CORS错误**：项目已添加跨域处理，但如果仍然出现CORS错误，可能需要检查CDN资源的可用性。

4. **浏览器兼容性**：推荐使用最新版本的Chrome、Firefox或Edge浏览器访问。

## 自定义修改

如果您想对太阳系模型进行自定义修改，可以编辑以下文件：

- `js/data.js`：修改行星数据和参数
- `js/app.js`：修改应用程序逻辑和渲染方式
- `styles.css`：修改界面样式

## 其他部署选项

除了GitHub Pages，您还可以考虑以下免费托管服务：

1. Netlify: https://www.netlify.com/
2. Vercel: https://vercel.com/
3. Cloudflare Pages: https://pages.cloudflare.com/

这些服务都提供免费的静态网站托管，并且可以生成可在微信中访问的链接。