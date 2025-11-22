# Koa + React 一体化研发框架 (KoaReact)

## 1. 框架概述

### 1.1 设计目标
- 提供统一的前后端开发体验
- 开发时前后端分离，生产时一体化部署
- 类似 Next.js 的开发体验，但基于 Koa 而非 Next.js 路由
- 零配置启动，约定大于配置

### 1.2 核心特性
- **文件路由系统**：基于文件结构自动生成路由
- **API 路由**：`/api` 目录下的文件自动成为后端接口
- **页面路由**：`/pages` 目录下的文件自动成为前端页面
- **TypeScript 支持**：全栈类型安全
- **HMR 支持**：开发时实时热更新
- **生产构建**：单一服务器既提供 API 又提供静态页面
- **中间件系统**：支持 Koa 风格的中间件

### 1.3 技术栈
- **后端框架**：Koa 2.x
- **前端框架**：React 18.x + React Router
- **构建工具**：Vite
- **语言**：TypeScript
- **包管理**：npm

---

## 2. 目录结构规范

```
project-root/
├── src/
│   ├── api/                    # 后端 API 路由
│   │   ├── users.ts           # GET /api/users, POST /api/users
│   │   ├── posts/
│   │   │   ├── index.ts        # GET /api/posts, POST /api/posts
│   │   │   └── [id].ts         # GET /api/posts/:id, PUT /api/posts/:id
│   │   └── middleware/         # API 中间件
│   │       └── auth.ts         # 认证中间件
│   ├── pages/                  # 前端页面路由
│   │   ├── index.tsx           # GET / (主页)
│   │   ├── about.tsx           # GET /about
│   │   └── posts/
│   │       ├── index.tsx        # GET /posts
│   │       └── [id].tsx         # GET /posts/:id (动态路由)
│   ├── components/             # React 组件库
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   └── ...
│   ├── hooks/                  # React 自定义 hooks
│   │   ├── useAuth.ts
│   │   └── ...
│   ├── lib/                    # 共享工具函数
│   │   ├── api.ts             # API 请求客户端
│   │   ├── http.ts            # HTTP 工具
│   │   └── ...
│   ├── types/                  # 共享类型定义
│   │   ├── api.ts             # API 类型
│   │   ├── models.ts          # 数据模型
│   │   └── ...
│   ├── server/                 # 服务器入口和配置
│   │   ├── index.ts           # Koa 应用入口
│   │   ├── middleware.ts       # 全局中间件
│   │   └── config.ts          # 配置文件
│   └── client.tsx             # React 应用入口
├── dist/
│   ├── server/                 # 编译后的后端代码
│   ├── client/                 # 编译后的前端代码
│   └── assets/                 # 静态资源
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. API 路由规范

### 3.1 基本约定

**文件 → 路由映射：**
- `src/api/users.ts` → `/api/users`
- `src/api/posts/index.ts` → `/api/posts`
- `src/api/posts/[id].ts` → `/api/posts/:id`
- `src/api/posts/[id]/comments.ts` → `/api/posts/:id/comments`

### 3.2 导出函数约定

每个 API 路由文件导出 HTTP 方法对应的函数：

```typescript
// src/api/users.ts
import type { Context } from 'koa';

// GET /api/users
export const get = async (ctx: Context) => {
  ctx.body = { users: [] };
};

// POST /api/users
export const post = async (ctx: Context) => {
  ctx.body = { id: 1, name: ctx.request.body.name };
  ctx.status = 201;
};

// PUT /api/users/:id
export const put = async (ctx: Context) => {
  const { id } = ctx.params;
  ctx.body = { id, updated: true };
};

// DELETE /api/users/:id
export const delete = async (ctx: Context) => {
  const { id } = ctx.params;
  ctx.status = 204;
};

// PATCH /api/users/:id
export const patch = async (ctx: Context) => {
  const { id } = ctx.params;
  ctx.body = { id, patched: true };
};

// OPTIONS /api/users
export const options = async (ctx: Context) => {
  ctx.body = { methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] };
};
```

### 3.3 动态参数处理

```typescript
// src/api/posts/[id].ts
export const get = async (ctx: Context) => {
  const { id } = ctx.params;
  // id 会自动从 URL 中提取：/api/posts/123 → { id: '123' }
  ctx.body = { id, title: 'Post Title' };
};

// src/api/posts/[id]/comments/[commentId].ts
export const get = async (ctx: Context) => {
  const { id, commentId } = ctx.params;
  ctx.body = { postId: id, commentId, text: 'Comment' };
};
```

### 3.4 Query 参数和请求体

```typescript
// 查询参数：?page=1&limit=10
export const get = async (ctx: Context) => {
  const { page = '1', limit = '10' } = ctx.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  ctx.body = { page: pageNum, limit: limitNum };
};

// 请求体
export const post = async (ctx: Context) => {
  const { name, email } = ctx.request.body; // 自动解析 JSON
  ctx.body = { id: 1, name, email };
};
```

### 3.5 中间件和错误处理

```typescript
// src/api/middleware/auth.ts
import type { Context, Next } from 'koa';

export const auth = async (ctx: Context, next: Next) => {
  const token = ctx.headers.authorization?.split(' ')[1];
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized' };
    return;
  }
  // 验证 token...
  await next();
};

// src/api/users.ts - 使用中间件
import { auth } from './middleware/auth';

export const middleware = [auth]; // 自动应用中间件

export const get = async (ctx: Context) => {
  ctx.body = { users: [] };
};
```

### 3.6 错误处理

```typescript
export const get = async (ctx: Context) => {
  try {
    const data = await fetchData();
    ctx.body = data;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
};
```

---

## 4. 页面路由规范

### 4.1 基本约定

**文件 → 页面映射：**
- `src/pages/index.tsx` → `/` (主页)
- `src/pages/about.tsx` → `/about`
- `src/pages/posts/index.tsx` → `/posts`
- `src/pages/posts/[id].tsx` → `/posts/:id`
- `src/pages/posts/[id]/comments/index.tsx` → `/posts/:id/comments`

### 4.2 页面组件结构

```typescript
// src/pages/index.tsx
import React from 'react';

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  return (
    <div>
      <h1>Welcome Home</h1>
    </div>
  );
};

export default Home;
```

### 4.3 动态路由

```typescript
// src/pages/posts/[id].tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Post {
  id: string;
  title: string;
  content: string;
}

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Not found</div>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
};

export default PostDetail;
```

### 4.4 嵌套路由

```typescript
// src/pages/posts/[id]/comments.tsx
import React from 'react';
import { useParams } from 'react-router-dom';

const PostComments: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h2>Comments for Post {id}</h2>
      {/* 评论列表 */}
    </div>
  );
};

export default PostComments;
```

---

## 5. 开发服务器规范

### 5.1 开发模式 (`npm run dev`)

**运行流程：**
1. 启动 Koa 服务器（端口 3000）
2. 启动 Vite 开发服务器（HMR，WebSocket）
3. 自动扫描 `src/api` 和 `src/pages` 目录
4. 生成路由表
5. API 路由挂载到 `/api` 前缀
6. 静态页面通过 Vite 中间件提供

**功能特性：**
- 前后端代码改动都支持 HMR
- API 改动重新扫描路由表
- 页面改动刷新浏览器
- 完整的 TypeScript 支持和类型检查
- Koa 中间件即时生效

### 5.2 生产构建 (`npm run build`)

**构建流程：**
1. 使用 Vite 编译 TypeScript 和 JSX
2. 分别打包后端和前端代码
3. 后端代码编译为 Node.js 可执行格式
4. 前端代码编译为静态资源（HTML、CSS、JS）
5. 将静态资源注入到后端服务配置

**输出结构：**
```
dist/
├── server/
│   ├── index.js          # 主服务器文件
│   ├── api/              # 编译后的 API 路由
│   └── ...
├── client/
│   ├── index.html        # 入口 HTML
│   ├── assets/           # JS、CSS、图片等
│   └── ...
```

### 5.3 生产服务器 (`npm start`)

**运行流程：**
1. 启动 Koa 服务器（端口 3000）
2. 加载编译后的 API 路由
3. 生成静态资源映射
4. API 请求转发到对应处理函数
5. 非 API 请求返回 React 应用（SPA）

**性能特性：**
- 无 HMR 开销
- 预编译的代码
- 静态资源可通过 CDN 加速
- 支持静态资源版本哈希（cache busting）

---

## 6. 框架 API 规范

### 6.1 路由装饰器（可选增强）

```typescript
// 如果支持装饰器，可以提供更简洁的 API

import { Get, Post, Put, Delete, Middleware } from '@koa-react/decorators';
import { auth } from './middleware/auth';

@Middleware([auth])
class UserController {
  @Get('/api/users')
  async getUsers(ctx: Context) {
    ctx.body = { users: [] };
  }

  @Post('/api/users')
  async createUser(ctx: Context) {
    ctx.body = { id: 1 };
  }

  @Put('/api/users/:id')
  async updateUser(ctx: Context) {
    const { id } = ctx.params;
    ctx.body = { id };
  }
}
```

### 6.2 插件系统

```typescript
// src/server/config.ts
import type { KoaReactConfig } from '@koa-react/core';

export const config: KoaReactConfig = {
  // 服务器配置
  port: 3000,
  host: '0.0.0.0',

  // API 前缀
  apiPrefix: '/api',

  // 静态资源配置
  staticDir: 'public',
  publicDir: 'static',

  // 中间件配置
  middleware: {
    bodyParser: {
      enableTypes: ['json', 'form'],
      jsonLimit: '1mb',
    },
    cors: {
      origin: '*',
      credentials: true,
    },
  },

  // 插件
  plugins: [
    // 数据库插件
    {
      name: 'database',
      apply: (app) => {
        // 初始化数据库
      },
    },
  ],

  // 开发时的 Vite 配置
  vite: {
    // Vite 选项
  },
};
```

### 6.3 全局中间件

```typescript
// src/server/middleware.ts
import type { Context, Next } from 'koa';

// 日志中间件
export const logger = async (ctx: Context, next: Next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${ctx.method} ${ctx.path} - ${ctx.status} - ${duration}ms`);
};

// 错误处理中间件
export const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (error: any) {
    ctx.status = error.status || 500;
    ctx.body = { error: error.message };
  }
};
```

---

## 7. 类型系统规范

### 7.1 API 类型定义

```typescript
// src/types/api.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
```

### 7.2 共享类型导入

```typescript
// src/api/users.ts
import type { User, ApiResponse } from '../types/api';

export const get = async (ctx: Context): Promise<void> => {
  const users: User[] = [];
  ctx.body = { data: users } as ApiResponse<User[]>;
};

// src/pages/users.tsx
import type { User } from '../types/api';

interface UsersPageState {
  users: User[];
  loading: boolean;
}
```

---

## 8. 开发工作流规范

### 8.1 创建新 API 端点

1. 在 `src/api` 目录创建文件，如 `src/api/todos.ts`
2. 导出对应的 HTTP 方法处理函数：

```typescript
import type { Context } from 'koa';

export const get = async (ctx: Context) => {
  ctx.body = { todos: [] };
};

export const post = async (ctx: Context) => {
  const { title } = ctx.request.body;
  ctx.body = { id: 1, title, completed: false };
  ctx.status = 201;
};
```

3. 框架自动扫描并挂载路由，立即可用

### 8.2 创建新页面

1. 在 `src/pages` 目录创建文件，如 `src/pages/todos.tsx`
2. 导出默认 React 组件：

```typescript
import React from 'react';

const TodosPage: React.FC = () => {
  return <div>Todos Page</div>;
};

export default TodosPage;
```

3. 框架自动生成路由，访问 `/todos` 加载页面

### 8.3 调用 API

```typescript
// src/lib/api.ts - API 客户端工具
import type { ApiResponse } from '../types/api';

export async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${window.location.origin}/api${path}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// 在页面中使用
import { fetchApi } from '../lib/api';

const TodosPage: React.FC = () => {
  const [todos, setTodos] = React.useState([]);

  React.useEffect(() => {
    fetchApi('/todos').then(setTodos);
  }, []);

  return <div>{/* render todos */}</div>;
};
```

---

## 9. 构建配置规范

### 9.1 vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import koa from 'vite-plugin-koa'; // 自定义 Koa 插件

export default defineConfig({
  plugins: [
    react(),
    koa({
      apiDir: 'src/api',
      pagesDir: 'src/pages',
      isDev: true,
    }),
  ],
  server: {
    middlewareMode: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
```

### 9.2 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 10. 生命周期钩子规范

### 10.1 应用启动钩子

```typescript
// src/server/index.ts
import { createApp } from '@koa-react/core';

const app = createApp();

// 启动前钩子
app.hooks.on('before:start', async () => {
  console.log('Initializing application...');
});

// 启动后钩子
app.hooks.on('after:start', async () => {
  console.log('Application started');
});

// 路由加载完成钩子
app.hooks.on('routes:loaded', (routes) => {
  console.log('Routes loaded:', routes);
});

export default app;
```

### 10.2 路由级别钩子

```typescript
// src/api/users.ts
export const middleware = [
  async (ctx, next) => {
    console.log('Before handler');
    await next();
    console.log('After handler');
  },
];

export const get = async (ctx: Context) => {
  ctx.body = { users: [] };
};
```

---

## 11. 环境变量规范

### 11.1 环境变量文件

```
.env                 # 所有环境通用
.env.local          # 本地覆盖（不提交）
.env.development    # 开发环境
.env.production     # 生产环境
```

### 11.2 使用方式

```typescript
// 后端代码
const dbUrl = process.env.DATABASE_URL;
const apiKey = process.env.API_KEY;

// 前端代码（需要通过 import.meta.env 访问）
// vite 自动将 VITE_ 前缀的变量暴露给客户端
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## 12. 测试规范

### 12.1 API 测试

```typescript
// src/api/users.test.ts
import { describe, it, expect } from 'vitest';
import { MockContext } from '@koa-react/testing';
import { get as getUsersHandler } from './users';

describe('GET /api/users', () => {
  it('should return users list', async () => {
    const ctx = new MockContext();
    await getUsersHandler(ctx);
    expect(ctx.body).toEqual({ users: [] });
  });
});
```

### 12.2 页面测试

```typescript
// src/pages/index.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './index';

describe('Home Page', () => {
  it('should render home page', () => {
    render(<Home />);
    expect(screen.getByText('Welcome Home')).toBeTruthy();
  });
});
```

---

## 13. 性能优化规范

### 13.1 代码分割

- 页面级代码分割：自动（基于页面文件）
- 组件级代码分割：使用 React.lazy + Suspense
- API 路由：自动分离后端和前端

### 13.2 缓存策略

```typescript
// API 响应缓存中间件
export const cache = (ttl: number) => async (ctx: Context, next: Next) => {
  const cacheKey = `${ctx.method}:${ctx.path}`;
  // 实现缓存逻辑
  await next();
};

// 在路由中使用
export const middleware = [cache(3600)]; // 1 小时缓存
export const get = async (ctx: Context) => {
  ctx.body = { data: 'cached' };
};
```

### 13.3 静态资源优化

- CSS 提取和最小化
- JavaScript 压缩
- 图片优化
- 静态资源 CDN 部署

---

## 14. 部署规范

### 14.1 Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY dist ./dist

EXPOSE 3000
CMD ["node", "dist/server/index.js"]
```

### 14.2 环境配置

**开发环境：**
```bash
npm run dev
```

**生产构建：**
```bash
npm run build
```

**生产运行：**
```bash
npm start
```

---

## 15. 最佳实践

### 15.1 目录组织

- 保持 API 和页面文件扁平，使用目录只在必要时
- API 中间件集中在 `src/api/middleware` 目录
- 共享代码放在 `src/lib` 和 `src/components`
- 类型定义集中在 `src/types`

### 15.2 代码质量

- 启用 TypeScript strict 模式
- 使用 ESLint + Prettier 统一代码风格
- 编写单元测试和集成测试
- API 返回统一的响应格式

### 15.3 安全性

- 验证所有用户输入
- 使用 CORS 限制跨域请求
- 实现认证和授权机制
- 不在前端代码中存储敏感信息
- 使用 HTTPS（生产环境）

### 15.4 错误处理

- API 统一的错误响应格式
- 页面级错误边界（Error Boundary）
- 服务端异常日志记录
- 用户友好的错误消息

---

## 16. 配置示例

### 16.1 完整的 package.json

```json
{
  "name": "koa-react-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "koa-react dev",
    "build": "koa-react build",
    "start": "node dist/server/index.js",
    "test": "vitest",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "koa": "^2.14.0",
    "koa-router": "^12.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

### 16.2 框架初始化配置

```typescript
// src/server/index.ts
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';

const app = new Koa();
const router = new Router();

// 全局中间件
app.use(bodyParser());
app.use(logger);
app.use(errorHandler);

// 应用路由
app.use(router.routes());

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
```

---

## 17. 框架核心模块

### 17.1 路由生成器

**功能：**
- 扫描 `src/api` 和 `src/pages` 目录
- 自动生成路由表
- 支持动态路由和嵌套路由

**API：**
```typescript
interface RouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handler: (ctx: Context) => Promise<void>;
  middleware?: Array<(ctx: Context, next: Next) => Promise<void>>;
}

function generateRoutes(apiDir: string): RouteConfig[];
```

### 17.2 Vite 插件

**功能：**
- 集成 Vite 开发服务器
- HMR 支持
- 路由热更新

### 17.3 开发服务器

**功能：**
- 同时运行 Koa 和 Vite
- 自动路由注册
- 错误处理和日志

### 17.4 构建工具

**功能：**
- 后端代码编译
- 前端代码打包
- 静态资源优化

---

## 18. 高级特性（可选）

### 18.1 中间件自动加载

```typescript
// src/api/middleware/ 目录下的文件自动作为全局中间件
export const middleware = [
  async (ctx, next) => {
    await next();
  },
];
```

### 18.2 自动 API 文档生成

基于 API 文件和 JSDoc 自动生成 OpenAPI 文档。

### 18.3 请求日志和追踪

集成链路追踪系统，记录每个请求的完整执行过程。

### 18.4 性能监控

集成性能监控工具，跟踪 API 响应时间、数据库查询等。

### 18.5 热模块替换（HMR）

- API 代码改动时自动重新扫描路由
- 页面代码改动时浏览器自动刷新
- 状态保持（如果可能）

---

## 总结

这个框架规范提供了：

1. **清晰的文件结构**：一致的组织方式
2. **自动化路由生成**：基于文件系统的约定
3. **类型安全**：全栈 TypeScript 支持
4. **开发体验**：HMR、自动重载、即时反馈
5. **生产就绪**：优化的构建和部署
6. **可扩展性**：插件系统和中间件支持
7. **最佳实践**：指导开发工作流和代码组织

框架的核心理念是**约定大于配置**，让开发者专注于业务逻辑，而不是繁琐的配置。
