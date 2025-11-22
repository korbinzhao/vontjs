# Vont 框架 - 工程代码抽象方案

## 📋 项目概述

将开发、构建、预览等工程代码抽象为独立的 npm 包 `@vont/core`，放置在项目根目录的 `vont/` 目录下。

## 🎯 目标

1. **代码复用** - 其他项目可以直接使用 vont 包
2. **职责分离** - 业务代码与工程代码分离
3. **维护性** - 集中管理工程工具代码
4. **可扩展** - 便于功能迭代和升级

## 📂 目录结构

```
/Users/joebon/Downloads/vontjs/
├── vont/                           # Vont 框架核心包
│   ├── package.json                # 包配置
│   ├── tsconfig.json               # TS 配置
│   ├── README.md                   # 包文档
│   ├── bin/
│   │   └── vont.js                 # CLI 可执行文件
│   ├── src/
│   │   ├── cli/
│   │   │   ├── index.ts            # CLI 入口
│   │   │   ├── dev.ts              # dev 命令实现
│   │   │   ├── build.ts            # build 命令实现
│   │   │   └── start.ts            # start 命令实现
│   │   ├── server/
│   │   │   ├── dev-server.ts       # 开发服务器逻辑
│   │   │   ├── prod-server.ts      # 生产服务器逻辑
│   │   │   ├── app.ts              # Koa 应用创建
│   │   │   ├── route-registry.ts   # 路由注册表 ✅
│   │   │   └── router-generator.ts # 路由生成器 ✅
│   │   ├── config/
│   │   │   ├── vite.ts             # Vite 配置工厂
│   │   │   ├── nodemon.ts          # Nodemon 配置
│   │   │   └── index.ts            # 配置导出
│   │   ├── utils/
│   │   │   ├── logger.ts           # 日志工具
│   │   │   ├── paths.ts            # 路径工具
│   │   │   └── index.ts            # 工具导出
│   │   ├── types/
│   │   │   └── index.ts            # 类型定义 ✅
│   │   └── index.ts                # 主入口
│   └── dist/                       # 编译输出（.gitignore）
│
├── src/                            # 业务代码（项目代码）
│   ├── api/                        # API 路由
│   ├── pages/                      # 前端页面
│   ├── lib/                        # 业务工具
│   └── types/                      # 业务类型
│
├── package.json                    # 项目配置（依赖 vont）
├── vite.config.ts                  # Vite 配置（使用 vont）
└── tsconfig.json                   # TS 配置

✅ = 已创建
```

## 🔧 实施步骤

### 步骤 1: 完成 vont 包核心文件（进行中）

#### 已完成 ✅
- [x] `vont/package.json` - 包配置
- [x] `vont/tsconfig.json` - TypeScript 配置
- [x] `vont/bin/vont.js` - CLI 可执行文件
- [x] `vont/src/types/index.ts` - 类型定义
- [x] `vont/src/server/router-generator.ts` - 路由生成器
- [x] `vont/src/server/route-registry.ts` - 路由注册表

#### 待完成 ⬜
- [ ] `vont/src/server/app.ts` - Koa 应用创建
- [ ] `vont/src/server/dev-server.ts` - 开发服务器
- [ ] `vont/src/server/prod-server.ts` - 生产服务器
- [ ] `vont/src/cli/dev.ts` - dev 命令
- [ ] `vont/src/cli/build.ts` - build 命令
- [ ] `vont/src/cli/start.ts` - start 命令
- [ ] `vont/src/config/vite.ts` - Vite 配置工厂
- [ ] `vont/src/index.ts` - 主入口文件

### 步骤 2: 迁移现有代码

需要迁移的文件映射：

| 源文件 | 目标文件 | 说明 |
|--------|---------|------|
| `src/server/app.ts` | `vont/src/server/app.ts` | Koa 应用创建逻辑 |
| `src/server/dev.ts` | `vont/src/server/dev-server.ts` | 开发服务器逻辑 |
| `src/server/index.ts` | `vont/src/server/prod-server.ts` | 生产服务器逻辑 |
| `scripts/build.js` | `vont/src/cli/build.ts` | 构建命令 |
| `nodemon.json` | `vont/src/config/nodemon.ts` | Nodemon 配置 |
| `vite.config.ts` | `vont/src/config/vite.ts` | Vite 配置工厂 |

### 步骤 3: 更新项目配置

#### 3.1 更新 `package.json`

```json
{
  "name": "my-vont-project",
  "scripts": {
    "dev": "vont dev",
    "build": "vont build",
    "start": "vont start"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.2"
  },
  "devDependencies": {
    "@vont/core": "file:./vont"
  }
}
```

#### 3.2 更新 `vite.config.ts`

```typescript
import { defineVontConfig } from '@vont/core/config';

export default defineVontConfig({
  // 自定义配置（可选）
});
```

#### 3.3 清理不再需要的文件

```bash
# 删除已迁移到 vont 包的文件
rm -rf scripts/
rm -f nodemon.json
```

### 步骤 4: 构建和链接 vont 包

```bash
# 进入 vont 目录
cd vont

# 安装依赖
npm install

# 构建包
npm run build

# 返回项目根目录
cd ..

# 安装 vont 包（通过 file: 协议）
npm install

# 测试 CLI
npx vont --help
```

## 📦 vont 包使用方式

### 方式1: 本地文件协议（开发推荐）

```json
{
  "devDependencies": {
    "@vont/core": "file:./vont"
  }
}
```

优点：
- 实时更新，修改 vont 代码后重新构建即可
- 不需要发布到 npm

缺点：
- 每次修改需要重新构建

### 方式2: npm workspaces（推荐）

在根目录 `package.json` 添加：

```json
{
  "workspaces": [
    "vont"
  ]
}
```

优点：
- 自动管理依赖
- 共享 node_modules
- 便于同时开发

### 方式3: 发布到 npm（生产推荐）

```bash
cd vont
npm publish --access public
```

然后在项目中：

```json
{
  "devDependencies": {
    "@vont/core": "^1.0.0"
  }
}
```

## 🔌 API 设计

### CLI 命令

```bash
# 开发模式
vont dev [options]
  --port <port>      指定端口（默认: 3000）
  --host <host>      指定主机（默认: 0.0.0.0）
  --open             自动打开浏览器

# 构建
vont build [options]
  --outDir <dir>     输出目录（默认: dist）
  --mode <mode>      构建模式（默认: production）

# 启动生产服务器
vont start [options]
  --port <port>      指定端口（默认: 3000）
  --host <host>      指定主机（默认: 0.0.0.0）
```

### 编程 API

```typescript
import { createDevServer, createProdServer, build } from '@vont/core';

// 创建开发服务器
const devServer = await createDevServer({
  port: 3000,
  host: '0.0.0.0',
  hmrPort: 3001,
});

// 构建项目
await build({
  root: process.cwd(),
  outDir: 'dist',
});

// 创建生产服务器
const prodServer = await createProdServer({
  port: 3000,
  host: '0.0.0.0',
});
```

### 配置文件 API

```typescript
// vite.config.ts
import { defineVontConfig } from '@vont/core/config';

export default defineVontConfig({
  port: 3000,
  host: '0.0.0.0',
  apiPrefix: '/api',
  vite: {
    // 自定义 Vite 配置
    plugins: [],
  },
});
```

## 📝 代码规范

### 单文件行数限制

- ✅ 单个文件不超过 500 行
- ✅ 复杂逻辑拆分到多个文件
- ✅ 使用模块化设计

### TypeScript 规范

- ✅ 不使用 `any` 类型
- ✅ 所有类型必须明确定义
- ✅ 导出的 API 必须有类型声明

### 代码组织

```
模块结构:
├── index.ts          # 导出公共 API
├── types.ts          # 类型定义
├── core.ts           # 核心逻辑（< 500 行）
├── utils.ts          # 工具函数
└── __tests__/        # 单元测试
    └── core.test.ts
```

## 🧪 测试策略

### 单元测试

```typescript
// vont/src/server/__tests__/router-generator.test.ts
import { generateApiRoutes } from '../router-generator';

describe('router-generator', () => {
  it('should generate API routes', async () => {
    const routes = await generateApiRoutes('./test/api', '/api');
    expect(routes.length).toBeGreaterThan(0);
  });
});
```

### 集成测试

```bash
# 在测试项目中验证
cd test-project
npm install
npm run dev
curl http://localhost:3000/api/users
```

## 📖 文档结构

### vont/README.md

```markdown
# @vont/core

Vont 是一个全栈 TypeScript 框架，结合了 Koa 和 React...

## 安装
## 快速开始
## CLI 命令
## API 文档
## 配置
## 示例
## 贡献指南
```

### 项目 README.md

```markdown
# My Vont Project

基于 Vont 框架构建的项目...

## 开发
```bash
npm run dev
```

## 构建
```bash
npm run build
```
```

## 🚀 后续优化

### 短期（1-2周）

- [ ] 完成所有核心文件的创建
- [ ] 编写单元测试
- [ ] 完善 TypeScript 类型定义
- [ ] 添加 CLI 参数解析

### 中期（1个月）

- [ ] 发布到 npm
- [ ] 创建脚手架工具 `create-vont-app`
- [ ] 添加插件系统
- [ ] 支持自定义配置文件

### 长期（3-6个月）

- [ ] 支持多种前端框架（Vue、Svelte）
- [ ] 支持多种后端框架（Express、Fastify）
- [ ] 添加 CLI 交互式命令
- [ ] 构建可视化管理面板

## 💡 实施建议

### 当前状态

已完成 vont 包的基础结构：
- ✅ package.json
- ✅ tsconfig.json
- ✅ CLI 入口文件
- ✅ 类型定义
- ✅ 路由相关代码

### 下一步行动

1. **创建剩余的服务器文件**
   - 复制并改造 `src/server/app.ts` → `vont/src/server/app.ts`
   - 复制并改造 `src/server/dev.ts` → `vont/src/server/dev-server.ts`
   - 复制并改造 `src/server/index.ts` → `vont/src/server/prod-server.ts`

2. **创建 CLI 命令实现**
   - 实现 `vont/src/cli/dev.ts`
   - 实现 `vont/src/cli/build.ts`
   - 实现 `vont/src/cli/start.ts`

3. **创建配置工厂函数**
   - 实现 `vont/src/config/vite.ts`
   - 实现 `vont/src/config/nodemon.ts`

4. **构建和测试**
   - 在 vont 目录运行 `npm run build`
   - 在项目根目录运行 `npm install`
   - 测试 `npx vont dev`

5. **更新项目配置**
   - 修改 `package.json` 使用 vont 命令
   - 修改 `vite.config.ts` 使用 vont 配置
   - 删除旧的 scripts 目录

### 渐进式迁移

不需要一次性完成，可以分阶段迁移：

**阶段1**: 创建基础包结构（已完成 ✅）
**阶段2**: 迁移服务器代码
**阶段3**: 迁移 CLI 命令
**阶段4**: 更新项目配置
**阶段5**: 测试和优化

## 📞 技术支持

如有问题，请参考：
- vont 包 README.md
- 项目文档
- GitHub Issues

---

**文档版本**: v1.0.0  
**创建日期**: 2025-11-22  
**状态**: 🚧 进行中 - 基础结构已完成，待完成代码迁移

