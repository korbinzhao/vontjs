import { promises as fs } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import type { RouteConfig, ApiModule } from '../types/index.js';

/**
 * 将文件路径转换为 API 路由路径
 * 例如: users.ts -> /users
 *       posts/[id].ts -> /posts/:id
 */
function filePathToRoute(filePath: string): string {
  // 规范化路径分隔符
  let normalizedPath = filePath.replace(/\\/g, '/');

  // 移除文件扩展名
  normalizedPath = normalizedPath.replace(/\.(ts|tsx|js|jsx)$/, '');

  // 处理 index 文件
  let routePath = normalizedPath.replace(/\/index$/, '') || '/';

  // 将 [param] 替换为 :param
  routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1');

  // 确保路由以 / 开头
  if (!routePath.startsWith('/')) {
    routePath = '/' + routePath;
  }

  return routePath;
}

/**
 * 递归扫描目录，获取所有模块文件
 */
async function scanDirectory(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // 递归扫描子目录
        const subFiles = await scanDirectory(fullPath);
        files.push(...subFiles);
      } else if (
        entry.isFile() &&
        /\.(ts|tsx|js|jsx)$/.test(entry.name) &&
        !entry.name.endsWith('.test.ts') &&
        !entry.name.endsWith('.test.tsx')
      ) {
        // 添加 TypeScript/JavaScript 文件（排除测试文件）
        files.push(fullPath);
      }
    }
  } catch (error) {
    // 目录不存在或无法访问
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  return files;
}

/**
 * 加载 TypeScript/JavaScript 模块
 * 在开发环境中使用 tsx 加载 TypeScript
 */
async function loadModule(filePath: string): Promise<ApiModule | null> {
  const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
  const isProduction = process.env.NODE_ENV === 'production';

  try {
    if (isTypeScript && !isProduction) {
      // 开发环境：使用 tsx 加载 TypeScript
      // tsx 通过 Node.js loader 注册，支持直接导入 .ts 文件
      const fileUrl = pathToFileURL(filePath).href;
      const module = await import(fileUrl);
      return module as ApiModule;
    } else {
      // 生产环境：加载编译后的 JavaScript
      const jsFile = isTypeScript ? filePath.replace(/\.tsx?$/, '.js') : filePath;
      const module = await import(jsFile);
      return module as ApiModule;
    }
  } catch (error) {
    return null;
  }
}

/**
 * 生成 API 路由
 */
export async function generateApiRoutes(
  apiDir: string,
  apiPrefix: string
): Promise<RouteConfig[]> {
  const routes: RouteConfig[] = [];

  // 扫描 API 目录
  const files = await scanDirectory(apiDir);

  for (const file of files) {
    try {
      // 使用新的模块加载函数
      const module = await loadModule(file);

      if (!module) {
        console.warn(`Warning: Could not load API module: ${file}`);
        continue;
      }

      // 获取文件相对于 API 目录的路径
      const relativePath = path.relative(apiDir, file);
      const routePath = filePathToRoute(relativePath);

      // 获取模块中的中间件和处理函数
      const middleware = module.middleware || [];
      const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'options'] as const;

      // 为每个 HTTP 方法创建路由
      for (const method of httpMethods) {
        const handler = module[method];

        if (handler) {
          routes.push({
            path: apiPrefix + routePath,
            method: method.toUpperCase() as RouteConfig['method'],
            handler,
            middleware,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to load API module: ${file}`, error);
    }
  }

  return routes;
}

/**
 * 生成页面路由（扫描目录结构）
 */
export async function scanPageRoutes(pagesDir: string): Promise<string[]> {
  const files = await scanDirectory(pagesDir);

  return files
    .map((file) => {
      const relativePath = path.relative(pagesDir, file);
      return filePathToRoute(relativePath);
    })
    .filter((route) => route); // 过滤空路由
}

/**
 * 规范化路由路径（处理重复斜杠）
 */
export function normalizeRoutePath(routePath: string): string {
  return '/' + routePath.replace(/^\/+/, '').replace(/\/+/g, '/');
}

