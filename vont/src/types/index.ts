import type { Context, Next } from 'koa';

// 路由处理函数类型
export type RouteHandler = (ctx: Context) => Promise<void>;

// 中间件类型
export type Middleware = (ctx: Context, next: Next) => Promise<void>;

// 路由配置
export interface RouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
  handler: RouteHandler;
  middleware: Middleware[];
}

// 页面路由配置
export interface PageRouteConfig {
  path: string;
  component: React.ComponentType<unknown>;
}

// API 模块导出类型
export interface ApiModule {
  get?: RouteHandler;
  post?: RouteHandler;
  put?: RouteHandler;
  delete?: RouteHandler;
  patch?: RouteHandler;
  options?: RouteHandler;
  middleware?: Middleware[];
}

// Vont 框架配置
export interface VontConfig {
  port?: number;
  host?: string;
  apiPrefix?: string;
  root?: string;
  apiDir?: string;
  pagesDir?: string;
}

// 开发服务器选项
export interface DevServerOptions extends VontConfig {
  hmrPort?: number;
}

// 构建选项
export interface BuildOptions {
  root?: string;
  outDir?: string;
  apiDir?: string;
  serverDir?: string;
}

