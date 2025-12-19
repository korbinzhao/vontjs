# Vercel 部署指南

本项目使用 Vercel Build Output API v3 标准，可以直接部署到 Vercel 平台。

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
# 预览部署
vercel

# 生产部署
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
- Vercel 会自动检测 `vercel.json` 配置并部署

## 📁 构建产物结构

使用 Build Output API v3，构建会生成以下结构：

```
dist/.vercel/output/
├── config.json              # 路由和缓存配置
├── static/                  # 前端静态文件
│   ├── index.html
│   └── assets/             # JS/CSS 资源
└── functions/              # Serverless Functions
    └── api/
        ├── users.func/     # GET/POST /api/users
        │   ├── .vc-config.json
        │   └── index.js
        └── users/
            └── [id].func/  # GET/PUT/DELETE /api/users/:id
                ├── .vc-config.json
                └── index.js
```

## ⚙️ 配置文件说明

### vercel.json

项目已包含简化的 `vercel.json`：

```json
{
  "buildCommand": "VONT_BUILD_TARGET=vercel npm run build",
  "outputDirectory": "dist/.vercel/output"
}
```

所有路由、缓存、函数配置都通过 Build Output API v3 的 `config.json` 自动生成。

## 🔧 本地测试 Vercel 构建

```bash
# 构建 Vercel 版本
npm run build:vercel

# 检查构建产物
ls -la dist/.vercel/output/
ls -la dist/.vercel/output/static/
ls -la dist/.vercel/output/functions/api/
```

## 🌐 环境变量

### 通过 Vercel Dashboard

1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加所需变量

### 通过 vont.config.ts

```typescript
import { defineConfig } from 'vont';

export default defineConfig({
  vercel: {
    functionMemory: 1024,      // 函数内存（MB）
    functionMaxDuration: 10,    // 最大执行时间（秒）
  },
});
```

## 🔍 Build Output API v3 优势

相比传统的 `vercel.json` 配置：

### ✅ 新方案（Build Output API v3）
- 标准化目录结构
- 自动生成路由配置
- 更好的函数隔离
- 支持高级特性（ISR、Edge Functions）
- 构建时验证
- 更清晰的构建报告

### ❌ 旧方案（vercel.json v2）
- 手动配置路由规则
- 复杂的正则表达式
- 易出错
- 功能受限

## 📊 部署后检查

部署成功后，验证以下功能：

1. **前端页面访问**
   - 访问根路径 `/`
   - 测试页面路由 `/about`、`/users`

2. **API 端点测试**
   ```bash
   # 获取用户列表
   curl https://your-app.vercel.app/api/users
   
   # 获取单个用户
   curl https://your-app.vercel.app/api/users/1
   
   # 创建用户
   curl -X POST https://your-app.vercel.app/api/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Alice","email":"alice@example.com"}'
   ```

3. **静态资源缓存**
   - 检查响应头是否包含 `cache-control: public, max-age=31536000, immutable`

## 🐛 常见问题

### 1. 构建失败

**问题**: 构建命令执行失败

**解决**:
```bash
# 本地测试构建
VONT_BUILD_TARGET=vercel npm run build

# 查看详细错误信息
```

### 2. API 路由 404

**问题**: 部署后 API 返回 404

**解决**:
- 检查 `dist/.vercel/output/functions/api/` 目录是否存在对应的 `.func` 文件夹
- 查看 Vercel 部署日志
- 检查 `config.json` 中的路由配置

### 3. 函数超时

**问题**: Serverless Function 执行超时

**解决**:
```typescript
// vont.config.ts
export default defineConfig({
  vercel: {
    functionMaxDuration: 30, // 增加到 30 秒（需要 Pro 计划）
  },
});
```

### 4. 冷启动慢

**优化方案**:
- 减少依赖打包体积
- 使用 Vercel Edge Functions（未来支持）
- 选择更近的函数区域

## 📚 更多资源

- [Vercel 文档](https://vercel.com/docs)
- [Build Output API v3 规范](https://vercel.com/docs/build-output-api/v3)
- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [Serverless Functions 文档](https://vercel.com/docs/functions)

## 💡 最佳实践

1. **首次部署使用预览模式**
   ```bash
   vercel  # 预览部署，不影响生产
   ```

2. **测试通过后再部署到生产**
   ```bash
   vercel --prod
   ```

3. **使用环境变量管理敏感信息**
   - 不要在代码中硬编码 API 密钥
   - 使用 Vercel Dashboard 配置环境变量

4. **开启 Git 集成**
   - 自动部署每次提交
   - 为 Pull Request 创建预览部署

5. **监控和日志**
   - 查看 Vercel Dashboard 中的实时日志
   - 使用 Vercel Analytics 监控性能

## 🎉 部署成功！

你的 Vont 应用已成功部署到 Vercel！

访问部署 URL 查看你的应用。
