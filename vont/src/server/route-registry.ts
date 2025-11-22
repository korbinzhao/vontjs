import type { RouteConfig } from '../types/index.js';
import { generateApiRoutes, scanPageRoutes, normalizeRoutePath } from './router-generator.js';

/**
 * 路由注册表
 */
export class RouteRegistry {
  private apiRoutes: RouteConfig[] = [];
  private pageRoutes: Map<string, string> = new Map();
  private apiDir: string;
  private pagesDir: string;
  private apiPrefix: string;

  constructor(apiDir: string, pagesDir: string, apiPrefix: string = '/api') {
    this.apiDir = apiDir;
    this.pagesDir = pagesDir;
    this.apiPrefix = apiPrefix;
  }

  /**
   * 扫描并注册所有路由
   */
  async scan(): Promise<void> {
    console.log('\n📍 Scanning routes...\n');

    // 扫描 API 路由
    await this.scanApiRoutes();

    // 扫描页面路由
    await this.scanPageRoutes();

    console.log(`\n✅ Found ${this.apiRoutes.length} API routes`);
  }

  /**
   * 扫描 API 路由
   */
  private async scanApiRoutes(): Promise<void> {
    try {
      const routes = await generateApiRoutes(this.apiDir, this.apiPrefix);
      this.apiRoutes = routes;

      if (routes.length > 0) {
        console.log('📡 API Routes:');
        for (const route of routes) {
          console.log(`   ${route.method.padEnd(6)} ${route.path}`);
        }
      }
    } catch (error) {
      console.error('Error scanning API routes:', error);
    }
  }

  /**
   * 扫描页面路由
   */
  private async scanPageRoutes(): Promise<void> {
    try {
      const routes = await scanPageRoutes(this.pagesDir);

      this.pageRoutes.clear();
      for (const route of routes) {
        const normalizedRoute = normalizeRoutePath(route);
        this.pageRoutes.set(normalizedRoute, normalizedRoute);
      }

      if (this.pageRoutes.size > 0) {
        console.log('📄 Page Routes:');
        for (const route of this.pageRoutes.keys()) {
          console.log(`   ${route}`);
        }
      }
    } catch (error) {
      console.error('Error scanning page routes:', error);
    }
  }

  /**
   * 获取 API 路由
   */
  getApiRoutes(): RouteConfig[] {
    return this.apiRoutes;
  }

  /**
   * 获取页面路由
   */
  getPageRoutes(): Map<string, string> {
    return this.pageRoutes;
  }

  /**
   * 重新扫描路由（用于开发时动态更新）
   */
  async rescan(): Promise<void> {
    this.apiRoutes = [];
    this.pageRoutes.clear();
    await this.scan();
  }
}

