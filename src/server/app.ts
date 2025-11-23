import Koa from 'koa';
import Router from 'koa-router';
import type { Context, Next } from 'koa';
import type { RouteConfig } from '../types/index.js';

/**
 * 创建 Koa 应用实例
 */
export function createApp(): Koa {
  const app = new Koa();

  // 错误处理中间件
  const errorMiddleware = async (ctx: Context, next: Next): Promise<void> => {
    try {
      await next();
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      console.error('Error:', error);
      ctx.status = err.status || 500;
      ctx.body = {
        error: err.message || 'Internal Server Error',
      };
    }
  };

  // 日志中间件
  const logMiddleware = async (ctx: Context, next: Next): Promise<void> => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    console.log(`${ctx.method} ${ctx.path} - ${ctx.status} - ${duration}ms`);
  };

  // 添加中间件
  app.use(errorMiddleware);
  app.use(logMiddleware);

  // 请求体解析中间件（手动实现以避免 CommonJS 兼容性问题）
  app.use(async (ctx: Context, next: Next): Promise<void> => {
    if (ctx.method === 'GET' || ctx.method === 'HEAD' || ctx.method === 'DELETE') {
      await next();
      return;
    }

    const contentType = ctx.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        let rawBody = '';
        await new Promise<void>((resolve, reject) => {
          ctx.req.on('data', (chunk: Buffer) => {
            rawBody += chunk.toString();
          });
          ctx.req.on('end', () => {
            resolve();
          });
          ctx.req.on('error', reject);
        });

        (ctx.request as { body?: unknown }).body = rawBody ? JSON.parse(rawBody) : {};
      } catch (error) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid JSON' };
        return;
      }
    }

    await next();
  });

  return app;
}

/**
 * 注册 API 路由
 * @param app Koa 应用实例
 * @param routes 路由配置数组
 * @param existingRouter 已存在的路由实例（用于热更新）
 * @returns Router 实例
 */
export function registerApiRoutes(
  app: Koa,
  routes: RouteConfig[],
  existingRouter?: Router
): Router {
  const router = existingRouter || new Router();

  // 如果是热更新，清除现有路由
  if (existingRouter) {
    router.stack = [];
    console.log('🔄 Clearing existing routes...');
  }

  // 注册所有路由
  for (const route of routes) {
    // 构建路由注册方法名称
    const method = route.method.toLowerCase() as Lowercase<RouteConfig['method']>;

    // 组合中间件和处理函数
    const handlers = [
      ...route.middleware,
      route.handler,
    ];

    // 注册路由
    router[method](route.path, ...handlers);

    console.log(`✓ ${route.method.padEnd(6)} ${route.path}`);
  }

  // 只在第一次注册时添加到 app
  if (!existingRouter) {
    app.use(router.routes());
    app.use(router.allowedMethods());
  }

  return router;
}

/**
 * 提供静态文件服务
 */
let staticMiddleware: Koa.Middleware | null = null;

export async function initStaticMiddleware(
  staticDir: string,
  options?: Record<string, unknown>
): Promise<Koa.Middleware | null> {
  if (!staticMiddleware) {
    try {
      const { default: serve } = await import('koa-static');
      staticMiddleware = serve(staticDir, options);
    } catch (error) {
      console.warn('Warning: koa-static not available, static files will be served by SPA fallback');
      return null;
    }
  }
  return staticMiddleware;
}

export function serveStatic(app: Koa, middleware: Koa.Middleware | null): void {
  if (middleware) {
    app.use(middleware);
  }
}

/**
 * 注册 SPA 回退路由（非 API 请求返回 index.html）
 */
export function registerSpaFallback(app: Koa, indexPath: string): void {
  app.use(async (ctx: Context, next: Next): Promise<void> => {
    // 先执行后续中间件
    await next();

    // 执行后续中间件后，如果状态是 404 且不是 API 请求，则提供 SPA 回退
    if (ctx.status === 404 && !ctx.path.startsWith('/api')) {
      try {
        const fs = await import('fs');
        const { promises } = fs;
        ctx.type = 'text/html';
        ctx.body = await promises.readFile(indexPath, 'utf-8');
        ctx.status = 200;
      } catch (error) {
        console.error('Error serving SPA fallback:', error);
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
      }
    }
  });
}

