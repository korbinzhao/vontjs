# Vont Framework - Vercel 部署支持升级

## 📝 更新概述

Vont 框架现已完全支持 Vercel 平台部署。通过升级，构建产物可以直接部署到 Vercel，利用其 Serverless Functions 和全球 CDN。

## ✨ 新增功能

### 1. Vercel 适配器 (`src/server/vercel-adapter.ts`)

- 将 Koa 路由处理器转换为 Vercel Serverless Functions
- 自动处理请求/响应格式转换
- 支持动态路由参数提取
- 请求体自动解析

### 2. Vercel 构建器 (`src/build/vercel-builder.ts`)

- 自动扫描 API 文件并生成 Serverless Functions
- 支持嵌套路由和动态路由（如 `[id].ts`）
- 优化的构建配置，适配 Node.js 18 运行时
- 生成符合 Vercel 目录结构的构建产物

### 3. 构建流程升级 (`src/build/index.ts`)

- 新增 `VONT_BUILD_TARGET=vercel` 环境变量支持
- 自动检测构建目标并选择对应的构建策略
- 向后兼容，不影响现有构建流程

### 4. 类型定义更新 (`src/types/index.ts`)

- 新增 `target: 'vercel'` 构建配置选项
- 完善的 TypeScript 类型支持

## 📦 模板升级

### React-TS 模板

**新增文件：**
- `vercel.json` - Vercel 部署配置
- `.vercelignore` - 排除不必要的文件
- `VERCEL_DEPLOYMENT.md` - 详细的部署指南

**更新文件：**
- `package.json` - 新增 `build:vercel` 脚本
- `README.md` - 添加 Vercel 部署说明

### Vue-TS 模板

**新增文件：**
- `vercel.json` - Vercel 部署配置
- `.vercelignore` - 排除不必要的文件
- `VERCEL_DEPLOYMENT.md` - 详细的部署指南

**更新文件：**
- `package.json` - 新增 `build:vercel` 脚本
- `README.md` - 添加 Vercel 部署说明

## 🏗️ 构建产物结构

### 标准构建 (`npm run build`)

```
dist/
├── client/         # 前端静态文件
├── api/           # 编译后的 API 模块
└── index.js       # Koa 服务器入口
```

### Vercel 构建 (`npm run build:vercel`)

```
dist/
├── client/         # 前端静态文件（部署到 CDN）
│   ├── index.html
│   └── assets/
└── api/           # Serverless Functions
    ├── users.js
    └── users/
        └── [id].js
```

## 🚀 使用方法

### 1. 本地构建测试

```bash
# React 项目
cd templates/react-ts
npm run build:vercel

# Vue 项目
cd templates/vue-ts
npm run build:vercel
```

### 2. 部署到 Vercel

**方式 A: 使用 Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel
```

**方式 B: Git 集成**

1. 推送代码到 GitHub/GitLab/Bitbucket
2. 在 Vercel Dashboard 导入项目
3. 自动检测配置并部署

## ⚙️ Vercel 配置详解

### vercel.json 核心配置

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

### 路由规则

- `/api/*` → Serverless Functions
- `/*` → SPA Fallback (返回 index.html)
- `/assets/*` → 静态资源 (1年缓存)

## 🔄 向后兼容性

本次升级完全向后兼容：

- ✅ 不影响现有的开发和构建流程
- ✅ 标准构建（`npm run build`）继续生成 Koa 服务器
- ✅ 仅在指定 `VONT_BUILD_TARGET=vercel` 时启用 Vercel 构建
- ✅ 所有现有项目无需修改即可继续使用

## 📊 技术实现

### 适配器模式

使用适配器模式将 Koa Context 转换为 Vercel 的 `(req, res)` 格式：

```typescript
// Koa 处理器
export const get = async (ctx: Context) => {
  ctx.body = { data: users };
};

// 自动转换为 Vercel 函数
export default async function handler(req, res) {
  const adaptedHandler = adaptKoaHandler(koaHandler);
  await adaptedHandler(req, res);
}
```

### 动态路由支持

自动处理文件名到路由的映射：

- `users.ts` → `/api/users`
- `users/[id].ts` → `/api/users/:id` → `/api/users/123`

### 构建优化

- 使用 esbuild 进行快速构建
- Bundle 所有依赖（除了 `vont`）
- 生成 source maps 便于调试
- Node.js 18 运行时优化

## 🧪 测试结果

### React-TS 模板
✅ 构建成功
✅ 生成正确的 Serverless Functions
✅ 静态文件结构正确
✅ API 路由可访问

### Vue-TS 模板
✅ 构建成功
✅ 生成正确的 Serverless Functions
✅ 静态文件结构正确
✅ API 路由可访问

## 📚 文档更新

- ✅ 模板 README 添加 Vercel 部署说明
- ✅ 创建独立的 `VERCEL_DEPLOYMENT.md` 部署指南
- ✅ 添加常见问题解答
- ✅ 提供完整的使用示例

## 🎯 部署最佳实践

1. **首次部署使用预览模式**
   ```bash
   vercel  # 预览部署
   ```

2. **测试通过后再部署到生产**
   ```bash
   vercel --prod
   ```

3. **配置环境变量**
   - 在 Vercel Dashboard 中配置
   - 或在 `vercel.json` 中定义

4. **开启 Git 集成**
   - 自动部署每次提交
   - Preview deployments for PRs

5. **监控和日志**
   - 查看 Vercel Dashboard 中的日志
   - 使用 Analytics 监控性能

## 🔮 未来计划

- [ ] 支持边缘函数（Edge Functions）
- [ ] 添加中间件支持（Vercel Middleware）
- [ ] ISR（Incremental Static Regeneration）支持
- [ ] 多环境部署配置

## 📄 相关文件

### 新增文件
- `src/server/vercel-adapter.ts`
- `src/build/vercel-builder.ts`
- `templates/react-ts/vercel.json`
- `templates/react-ts/.vercelignore`
- `templates/react-ts/VERCEL_DEPLOYMENT.md`
- `templates/vue-ts/vercel.json`
- `templates/vue-ts/.vercelignore`
- `templates/vue-ts/VERCEL_DEPLOYMENT.md`

### 修改文件
- `src/build/index.ts`
- `src/types/index.ts`
- `src/index.ts`
- `templates/react-ts/package.json`
- `templates/react-ts/README.md`
- `templates/vue-ts/package.json`
- `templates/vue-ts/README.md`

## ✅ 升级完成

Vont 框架现在可以无缝部署到 Vercel 平台，享受：

- 🌍 全球 CDN 加速
- ⚡ Serverless 自动扩展
- 🔒 HTTPS 自动配置
- 📊 实时分析和日志
- 💰 慷慨的免费额度

开始你的 Vercel 之旅吧！🚀

