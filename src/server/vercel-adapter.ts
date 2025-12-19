import type { IncomingMessage, ServerResponse } from 'http';
import type { Context } from 'koa';
import type { RouteHandler } from '../types/index.js';

/**
 * Vercel Serverless Function 请求类型
 */
export interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
  cookies: Record<string, string>;
  body?: unknown;
}

/**
 * Vercel Serverless Function 响应类型
 */
export interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => VercelResponse;
  send: (body: unknown) => VercelResponse;
}

/**
 * 解析 Cookie 字符串
 */
function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    const trimmedName = name?.trim();
    if (trimmedName) {
      cookies[trimmedName] = rest.join('=').trim();
    }
  });

  return cookies;
}

/**
 * 解析 URL 查询参数
 */
function parseQuery(url: string): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {};
  const urlObj = new URL(url, 'http://localhost');
  
  urlObj.searchParams.forEach((value, key) => {
    if (query[key]) {
      // 如果已存在，转换为数组
      if (Array.isArray(query[key])) {
        (query[key] as string[]).push(value);
      } else {
        query[key] = [query[key] as string, value];
      }
    } else {
      query[key] = value;
    }
  });

  return query;
}

/**
 * 创建模拟的 Koa Context 对象
 */
function createMockContext(req: VercelRequest, res: VercelResponse): Context {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  
  // 解析 cookies 和 query
  const cookies = parseCookies(req.headers.cookie);
  const query = parseQuery(req.url || '/');
  
  const ctx = {
    req,
    res,
    request: {
      method: req.method,
      url: req.url,
      header: req.headers,
      headers: req.headers,
      body: req.body,
      query,
      type: req.headers['content-type'] || '',
      length: req.headers['content-length'] ? parseInt(req.headers['content-length'], 10) : undefined,
      get: (field: string) => {
        return req.headers[field.toLowerCase()];
      },
    },
    response: {
      status: 200,
      message: 'OK',
      header: {} as Record<string, string | string[]>,
      headers: {} as Record<string, string | string[]>,
      body: undefined as unknown,
      type: '',
      length: undefined as number | undefined,
      get: (field: string) => {
        return ctx.response.headers[field.toLowerCase()];
      },
      set: (field: string | Record<string, string>, val?: string | string[]) => {
        if (typeof field === 'object') {
          Object.assign(ctx.response.headers, field);
        } else if (val !== undefined) {
          ctx.response.headers[field] = val;
        }
      },
      remove: (field: string) => {
        delete ctx.response.headers[field.toLowerCase()];
      },
    },
    method: req.method,
    url: req.url,
    path: url.pathname,
    query,
    params: {} as Record<string, string>,
    headers: req.headers,
    cookies,
    state: {} as Record<string, unknown>,
    app: {} as any,
    originalUrl: req.url,
    get: (field: string) => {
      return req.headers[field.toLowerCase()];
    },
    set: (field: string | Record<string, string>, val?: string | string[]) => {
      if (typeof field === 'object') {
        Object.assign(ctx.response.headers, field);
      } else if (val !== undefined) {
        ctx.response.headers[field] = val;
      }
    },
    status: 200,
    message: 'OK',
    body: undefined as unknown,
    type: '',
    length: undefined as number | undefined,
    // Cookie 辅助方法
    cookie: {
      get: (name: string) => cookies[name],
      set: (name: string, value: string, options?: {
        maxAge?: number;
        expires?: Date;
        path?: string;
        domain?: string;
        secure?: boolean;
        httpOnly?: boolean;
        sameSite?: 'strict' | 'lax' | 'none';
      }) => {
        let cookie = `${name}=${value}`;
        if (options) {
          if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
          if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`;
          if (options.path) cookie += `; Path=${options.path}`;
          if (options.domain) cookie += `; Domain=${options.domain}`;
          if (options.secure) cookie += '; Secure';
          if (options.httpOnly) cookie += '; HttpOnly';
          if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
        }
        
        const existing = ctx.response.headers['set-cookie'];
        if (existing) {
          const cookies = Array.isArray(existing) ? existing : [existing];
          ctx.response.headers['set-cookie'] = [...cookies, cookie];
        } else {
          ctx.response.headers['set-cookie'] = cookie;
        }
      },
    },
  } as unknown as Context;

  return ctx;
}

/**
 * 将 Koa 路由处理器适配为 Vercel Serverless Function
 */
export function adaptKoaHandler(
  handler: RouteHandler,
  extractParams?: (pathname: string) => Record<string, string>
): (req: VercelRequest, res: VercelResponse) => Promise<void> {
  return async (req: VercelRequest, res: VercelResponse) => {
    const startTime = Date.now();
    
    try {
      // 创建模拟的 Koa Context
      const ctx = createMockContext(req, res);

      // 提取路由参数（如果有）
      if (extractParams) {
        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        ctx.params = extractParams(url.pathname);
      }

      // 调用 Koa 处理器
      await handler(ctx);

      // 如果响应已经发送，直接返回
      if (res.headersSent) {
        return;
      }

      // 设置响应头
      Object.entries(ctx.response.headers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          res.setHeader(key, value);
        } else if (value) {
          res.setHeader(key, String(value));
        }
      });

      // 设置响应状态
      res.statusCode = ctx.status || ctx.response.status || 200;

      // 发送响应体
      if (ctx.body !== undefined && ctx.body !== null) {
        // 设置 Content-Type（如果未设置）
        if (!res.hasHeader('content-type')) {
          if (typeof ctx.body === 'object' && !Buffer.isBuffer(ctx.body)) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(ctx.body));
          } else if (typeof ctx.body === 'string') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(ctx.body);
          } else if (Buffer.isBuffer(ctx.body)) {
            res.setHeader('Content-Type', 'application/octet-stream');
            res.end(ctx.body);
          } else {
            res.end(String(ctx.body));
          }
        } else {
          // 已经设置了 Content-Type
          if (typeof ctx.body === 'object' && !Buffer.isBuffer(ctx.body)) {
            res.end(JSON.stringify(ctx.body));
          } else {
            res.end(ctx.body);
          }
        }
      } else {
        // 没有响应体
        res.end();
      }

      // 记录响应时间
      const duration = Date.now() - startTime;
      if (process.env.VONT_LOG_TIMING === 'true') {
        console.log(`${ctx.method} ${ctx.path} - ${res.statusCode} - ${duration}ms`);
      }
    } catch (error) {
      // 错误处理
      const err = error as Error & { status?: number; expose?: boolean };
      
      console.error('Error in Vercel adapter:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
      });

      // 如果响应已经发送，无法再发送错误响应
      if (res.headersSent) {
        return;
      }

      // 设置错误状态码
      const statusCode = err.status || 500;
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');

      // 构建错误响应
      const errorResponse: Record<string, unknown> = {
        error: statusCode >= 500 ? 'Internal Server Error' : err.message,
      };

      // 开发环境下返回详细错误信息
      if (process.env.NODE_ENV === 'development' || err.expose) {
        errorResponse.message = err.message;
        errorResponse.stack = err.stack?.split('\n');
      }

      res.end(JSON.stringify(errorResponse));
    }
  };
}

/**
 * 解析请求体
 */
export async function parseBody(req: VercelRequest): Promise<unknown> {
  if (req.body !== undefined) {
    return req.body;
  }

  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('application/json') && body) {
          resolve(JSON.parse(body));
        } else {
          resolve(body || {});
        }
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

/**
 * 提取路径参数的工厂函数
 * @param routePattern 路由模式，如 "/api/users/:id"
 * @returns 参数提取函数
 */
export function createParamExtractor(
  routePattern: string
): (pathname: string) => Record<string, string> {
  // 将路由模式转换为正则表达式
  const paramNames: string[] = [];
  const regexPattern = routePattern.replace(/:([^/]+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });
  
  const regex = new RegExp(`^${regexPattern}$`);

  return (pathname: string) => {
    const match = pathname.match(regex);
    if (!match) {
      return {};
    }

    const params: Record<string, string> = {};
    paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });

    return params;
  };
}

