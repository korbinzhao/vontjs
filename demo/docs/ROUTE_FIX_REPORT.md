# 路由 404 问题修复报告

## 问题描述

访问首页 `/` 和其他页面路由时，显示 **404 - Page Not Found** 错误，而不是返回正确的 HTML 内容。

## 根本原因分析

### 原始代码问题

在 `src/server/app.ts` 中的 `registerSpaFallback()` 函数有两个关键问题：

```typescript
// ❌ 错误的逻辑
export function registerSpaFallback(app: Koa, indexPath: string): void {
  app.use(async (ctx: Context, next: Next) => {
    // 问题 1：检查 ctx.body，但在这个中间件之前 next() 都还没执行
    // 问题 2：在 next() 之前就检查状态码，逻辑顺序错误
    if (ctx.body || ctx.status !== 404) {
      return;  // ← 总是返回，永远无法进入 SPA 回退逻辑
    }

    if (!ctx.path.startsWith('/api') && ctx.status === 404) {
      // SPA 回退逻辑
    } else {
      await next();  // ← 永远执行不到这里
    }
  });
}
```

### 静态文件中间件问题

`serveStatic()` 函数使用异步 import，导致中间件没有立即初始化：

```typescript
// ❌ 异步初始化，可能导致中间件不能正确运行
app.use(async (ctx: Context, next: Next) => {
  try {
    const { default: serve } = await import('koa-static');  // 每次请求都重新 import
    const middleware = serve(staticDir, options);
    await middleware(ctx, next);
  } catch {
    await next();
  }
});
```

## 修复方案

### 1. 修改 `src/server/app.ts`

#### A. 创建同步初始化的静态文件中间件

```typescript
let staticMiddleware: any = null;

export async function initStaticMiddleware(staticDir: string, options?: any): Promise<any> {
  if (!staticMiddleware) {
    try {
      const { default: serve } = await import('koa-static');
      staticMiddleware = serve(staticDir, options);  // 只初始化一次
    } catch (error) {
      console.warn('Warning: koa-static not available');
      return null;
    }
  }
  return staticMiddleware;
}

export function serveStatic(app: Koa, middleware: any): void {
  if (middleware) {
    app.use(middleware);  // 直接使用预初始化的中间件
  }
}
```

#### B. 修复 SPA 回退中间件的执行顺序

```typescript
// ✅ 正确的逻辑
export function registerSpaFallback(app: Koa, indexPath: string): void {
  app.use(async (ctx: Context, next: Next) => {
    // 1. 先执行后续所有中间件
    await next();

    // 2. 后续中间件执行完成后，检查状态码
    // 3. 如果是 404 且不是 API 请求，提供 SPA 回退
    if (ctx.status === 404 && !ctx.path.startsWith('/api')) {
      try {
        const fs = await import('fs');
        const { promises } = fs;
        ctx.type = 'text/html';
        ctx.body = await promises.readFile(indexPath, 'utf-8');
        ctx.status = 200;  // 返回 200 而不是 404
      } catch (error) {
        console.error('Error serving SPA fallback:', error);
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
      }
    }
  });
}
```

### 2. 修改 `src/server/index.ts`

在服务器启动时预初始化静态文件中间件：

```typescript
// 初始化静态文件中间件
const staticMiddleware = await initStaticMiddleware(clientDir, {
  maxage: 1000 * 60 * 60 * 24 * 365,  // 1 年缓存
  index: false,  // 不自动处理 index.html（由 SPA 回退处理）
});

// 提供静态文件服务
serveStatic(app, staticMiddleware);

// 注册 SPA 回退路由（在静态文件之后）
registerSpaFallback(app, indexPath);
```

## 中间件执行顺序

修复后的正确执行顺序：

```
1. errorMiddleware (错误处理)
   ↓
2. logMiddleware (日志记录)
   ↓
3. JSON 解析中间件
   ↓
4. API 路由 + allowedMethods
   ↓
5. 静态文件中间件 (koa-static)
   ↓
6. SPA 回退中间件 (await next() → 检查 404 → 提供 index.html)
```

## 测试结果

所有路由现在都正常工作：

| 路由 | 方法 | 状态码 | 返回内容 |
|------|------|--------|---------|
| `/` | GET | 200 | index.html |
| `/users` | GET | 200 | index.html (SPA 回退) |
| `/about` | GET | 200 | index.html (SPA 回退) |
| `/nonexistent` | GET | 200 | index.html (SPA 回退) |
| `/api/users` | GET | 200 | JSON 数据 |
| `/api/users/:id` | GET | 200 | JSON 数据 |
| `/api/users` | POST | 201 | JSON 数据 |
| `/api/users/:id` | PUT | 200 | JSON 数据 |

## 关键改进

1. **正确的中间件顺序**：SPA 回退在所有其他中间件之后执行
2. **同步初始化**：静态文件中间件只初始化一次，提高性能
3. **正确的状态码检查**：在 `await next()` 之后检查状态码
4. **API 保护**：非 API 请求才进行 SPA 回退，API 404 返回错误信息

## 文件修改清单

- ✅ `src/server/app.ts` - 修复中间件逻辑和执行顺序
- ✅ `src/server/index.ts` - 预初始化静态文件中间件
- ✅ 构建和测试已验证通过

