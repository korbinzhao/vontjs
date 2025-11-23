import path from 'path';
import { fileURLToPath } from 'url';
import { createApp, registerApiRoutes, serveStatic, registerSpaFallback, initStaticMiddleware } from './app.js';
import { RouteRegistry } from './route-registry.js';
import type { VontConfig } from '../types/index.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __dirname = path.dirname(__filename);

/**
 * 创建生产服务器
 */
export async function createProdServer(options?: VontConfig): Promise<void> {
  try {
    // 确定工作目录
    const rootDir = options?.root || process.cwd();
    const PORT = options?.port || parseInt(process.env.PORT || '3000', 10);
    const HOST = options?.host || process.env.HOST || '0.0.0.0';

    // 检查是否运行生产版本（dist 目录存在）
    const distDir = path.join(rootDir, 'dist');
    const isProduction = await (async (): Promise<boolean> => {
      try {
        const { promises: fs } = await import('fs');
        await fs.access(distDir);
        return true;
      } catch {
        return false;
      }
    })();

    // 根据环境选择 API 目录
    let apiDir: string;
    if (isProduction) {
      // 生产环境：使用编译的 API 模块
      apiDir = options?.apiDir || path.join(distDir, 'api');
    } else {
      // 开发环境：使用源文件
      apiDir = options?.apiDir || path.join(rootDir, 'src', 'api');
    }

    const pagesDir = options?.pagesDir || path.join(rootDir, 'src', 'pages');
    const clientDir = path.join(rootDir, 'dist', 'client');
    // 注意：Vite 将 index.html 输出到 dist/client/src/index.html
    let indexPath = path.join(clientDir, 'src', 'index.html');

    // 检查 index.html 是否存在
    try {
      const { promises: fs } = await import('fs');
      await fs.access(indexPath);
    } catch {
      // 尝试其他可能的位置
      indexPath = path.join(clientDir, 'index.html');
    }

    // 创建应用
    const app = createApp();

    // 初始化路由注册表
    const registry = new RouteRegistry(apiDir, pagesDir, options?.apiPrefix);
    await registry.scan();

    // 注册 API 路由
    const apiRoutes = registry.getApiRoutes();
    registerApiRoutes(app, apiRoutes);

    // 初始化静态文件中间件
    const staticMiddleware = await initStaticMiddleware(clientDir, {
      maxage: 1000 * 60 * 60 * 24 * 365, // 1 年
      index: false,
    });

    // 提供静态文件服务
    serveStatic(app, staticMiddleware);

    // 注册 SPA 回退路由
    registerSpaFallback(app, indexPath);

    // 启动服务器
    app.listen(PORT, HOST, () => {
      console.log(`\n✨ Server running at http://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

