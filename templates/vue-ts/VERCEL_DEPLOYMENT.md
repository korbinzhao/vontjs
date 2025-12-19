# Vercel 部署指南

本项目已配置好所有必要的 Vercel 部署文件，可以直接部署到 Vercel 平台。

## 📋 前提条件

- Node.js 18+ 
- npm 或 yarn
- Vercel 账号（免费）

## 🚀 快速部署

### 方式 1: 使用 Vercel CLI（推荐）

1. **安装 Vercel CLI**

```bash
npm install -g vercel
```

2. **登录 Vercel**

```bash
vercel login
```

3. **部署项目**

```bash
# 在项目根目录执行
vercel

# 或者直接部署到生产环境
vercel --prod
```

### 方式 2: 通过 Git 集成

1. **将代码推送到 Git 仓库**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **在 Vercel 中导入项目**

- 访问 [Vercel Dashboard](https://vercel.com/new)
- 点击 "Import Project"
- 选择你的 Git 仓库
- Vercel 会自动检测配置并部署

## 📁 构建产物结构

Vercel 构建会生成以下结构：

```
dist/
├── client/              # 前端静态文件
│   ├── index.html
│   └── assets/         # JS/CSS 资源
└── api/                # Serverless Functions
    ├── users.js        # GET/POST /api/users
    └── users/
        └── [id].js     # GET/PUT/DELETE /api/users/:id
```

## ⚙️ 配置文件说明

### vercel.json

主要配置项：

```json
{
  "version": 2,
  "buildCommand": "VONT_BUILD_TARGET=vercel npm run build",
  "outputDirectory": "dist/client",
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x",
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

- **buildCommand**: 使用 Vercel 目标构建
- **outputDirectory**: 前端静态文件目录
- **functions**: Serverless Functions 配置

### .vercelignore

指定不上传到 Vercel 的文件：

```
node_modules
src
.vont
tsconfig.json
vont.config.ts
```

## 🔧 本地测试 Vercel 构建

```bash
# 构建 Vercel 版本
npm run build:vercel

# 检查构建产物
ls -la dist/client
ls -la dist/api
```

## 🌐 环境变量

如需添加环境变量：

### 通过 Vercel Dashboard

1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加所需变量

### 通过 vercel.json

```json
{
  "env": {
    "DATABASE_URL": "@database-url",
    "API_KEY": "@api-key"
  }
}
```

## 🔍 路由配置

Vercel 会自动处理以下路由：

- `/api/*` → Serverless Functions
- `/*` → 前端 SPA（所有其他路由返回 index.html）

静态资源会自动配置缓存：

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 📊 性能优化

### 1. 冷启动优化

Serverless Functions 配置了合理的内存和超时：

```json
{
  "memory": 1024,
  "maxDuration": 10
}
```

### 2. 静态资源缓存

所有静态资源（JS/CSS/图片）都配置了长期缓存（1年）。

### 3. 边缘网络

Vercel 的全球 CDN 会自动分发你的静态资源。

## 🐛 常见问题

### 1. 构建失败

**问题**: `VONT_BUILD_TARGET=vercel` 不生效

**解决**: Windows 用户需要使用：
```bash
# PowerShell
$env:VONT_BUILD_TARGET="vercel"; npm run build

# CMD
set VONT_BUILD_TARGET=vercel && npm run build
```

### 2. API 路由 404

**问题**: API 路由返回 404

**解决**: 
- 确保 API 文件在 `src/api/` 目录
- 检查构建后 `dist/api/` 目录是否有对应文件
- 查看 Vercel 部署日志

### 3. 部署后白屏

**问题**: 部署成功但页面白屏

**解决**:
- 检查浏览器控制台错误
- 确保 `dist/client/index.html` 存在
- 检查 vercel.json 中的 `outputDirectory` 配置

## 📚 更多资源

- [Vercel 文档](https://vercel.com/docs)
- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [Serverless Functions 文档](https://vercel.com/docs/functions)

## 💡 提示

- 首次部署建议使用 `vercel` 命令（预览部署），测试无误后再使用 `vercel --prod`
- Vercel 免费计划已经足够个人项目使用
- 可以配置自定义域名（Settings → Domains）
- 建议开启 Automatic deployments from Git

