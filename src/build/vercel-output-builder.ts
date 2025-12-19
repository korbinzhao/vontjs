import { promises as fs } from 'fs';
import path from 'path';

/**
 * Vercel Build Output API v3 配置类型
 * @see https://vercel.com/docs/build-output-api/v3
 */

export interface BuildOutputConfig {
  version: 3;
  routes?: OutputRoute[];
  images?: ImageConfig;
  wildcard?: WildcardConfig;
  overrides?: Record<string, Override>;
  framework?: {
    version: string;
  };
}

export interface OutputRoute {
  src?: string;
  dest?: string;
  headers?: Record<string, string>;
  methods?: string[];
  continue?: boolean;
  check?: boolean;
  status?: number;
  handle?: string;
}

export interface ImageConfig {
  sizes: number[];
  domains: string[];
  minimumCacheTTL?: number;
  formats?: string[];
}

export interface WildcardConfig {
  domain: string;
}

export interface Override {
  path?: string;
  contentType?: string;
}

export interface FunctionConfig {
  runtime: string;
  handler?: string;
  launcherType?: string;
  shouldAddHelpers?: boolean;
  memory?: number;
  maxDuration?: number;
  environment?: Record<string, string>;
  regions?: string[];
}

export interface ApiRouteInfo {
  /** API 文件路径 */
  filePath: string;
  /** 路由路径（如 /api/users） */
  routePath: string;
  /** 是否是动态路由 */
  isDynamic: boolean;
  /** 路由模式（如 /api/users/:id） */
  routePattern: string;
  /** 函数输出目录 */
  funcDir: string;
  /** HTTP 方法 */
  methods: string[];
}

/**
 * Vercel Build Output 生成器
 */
export class VercelOutputBuilder {
  private outputDir: string;
  private apiRoutes: ApiRouteInfo[] = [];

  constructor(outputDir: string) {
    this.outputDir = path.join(outputDir, '.vercel', 'output');
  }

  /**
   * 初始化输出目录结构
   */
  async initialize(): Promise<void> {
    // 创建主目录
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // 创建 static 目录
    await fs.mkdir(path.join(this.outputDir, 'static'), { recursive: true });
    
    // 创建 functions 目录
    await fs.mkdir(path.join(this.outputDir, 'functions'), { recursive: true });
  }

  /**
   * 注册 API 路由
   */
  registerApiRoute(route: ApiRouteInfo): void {
    this.apiRoutes.push(route);
  }

  /**
   * 生成函数配置文件 (.vc-config.json)
   */
  async generateFunctionConfig(
    funcDir: string,
    options?: Partial<FunctionConfig>
  ): Promise<void> {
    const config: FunctionConfig = {
      runtime: 'nodejs18.x',
      handler: 'index.js',
      launcherType: 'Nodejs',
      shouldAddHelpers: true,
      memory: options?.memory || 1024,
      maxDuration: options?.maxDuration || 10,
      ...options,
    };

    const configPath = path.join(funcDir, '.vc-config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  /**
   * 生成路由配置
   */
  private generateRoutes(): OutputRoute[] {
    const routes: OutputRoute[] = [];

    // 1. 静态资源缓存策略
    routes.push({
      src: '^/assets/(.*)$',
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
      },
      continue: true,
    });

    // 2. API 路由（按优先级排序：动态路由在前）
    const sortedRoutes = [...this.apiRoutes].sort((a, b) => {
      // 动态路由优先级更高
      if (a.isDynamic && !b.isDynamic) return -1;
      if (!a.isDynamic && b.isDynamic) return 1;
      // 路径段数多的优先
      return b.routePath.split('/').length - a.routePath.split('/').length;
    });

    for (const route of sortedRoutes) {
      if (route.isDynamic) {
        // 动态路由：将 :param 转换为正则捕获组
        const regexSrc = route.routePattern
          .replace(/\//g, '\\/')
          .replace(/:([^/]+)/g, '([^/]+)');
        
        routes.push({
          src: `^${regexSrc}$`,
          dest: route.routePath.replace(/:([^/]+)/g, '$$$1'),
        });
      } else {
        // 静态路由
        routes.push({
          src: `^${route.routePath}$`,
          dest: route.routePath,
        });
      }
    }

    // 3. SPA Fallback（必须放在最后）
    routes.push({
      handle: 'filesystem',
    });
    
    routes.push({
      src: '^/(.*)$',
      dest: '/index.html',
    });

    return routes;
  }

  /**
   * 生成 config.json
   */
  async generateConfig(options?: {
    images?: ImageConfig;
    wildcard?: WildcardConfig;
    overrides?: Record<string, Override>;
  }): Promise<void> {
    const config: BuildOutputConfig = {
      version: 3,
      routes: this.generateRoutes(),
      framework: {
        version: '1.0.0',
      },
      ...options,
    };

    const configPath = path.join(this.outputDir, 'config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  /**
   * 获取输出目录
   */
  getOutputDir(): string {
    return this.outputDir;
  }

  /**
   * 获取 static 目录
   */
  getStaticDir(): string {
    return path.join(this.outputDir, 'static');
  }

  /**
   * 获取 functions 目录
   */
  getFunctionsDir(): string {
    return path.join(this.outputDir, 'functions');
  }

  /**
   * 验证构建产物
   */
  async validate(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查必需的目录
    const requiredDirs = [
      this.outputDir,
      this.getStaticDir(),
      this.getFunctionsDir(),
    ];

    for (const dir of requiredDirs) {
      try {
        await fs.access(dir);
      } catch {
        errors.push(`Missing required directory: ${dir}`);
      }
    }

    // 检查 config.json
    const configPath = path.join(this.outputDir, 'config.json');
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      
      if (config.version !== 3) {
        errors.push('config.json must have version 3');
      }
    } catch {
      errors.push('Missing or invalid config.json');
    }

    // 检查静态文件
    const indexHtmlPath = path.join(this.getStaticDir(), 'index.html');
    try {
      await fs.access(indexHtmlPath);
    } catch {
      warnings.push('Missing index.html in static directory');
    }

    // 检查函数配置
    for (const route of this.apiRoutes) {
      const vcConfigPath = path.join(route.funcDir, '.vc-config.json');
      try {
        await fs.access(vcConfigPath);
      } catch {
        errors.push(`Missing .vc-config.json for ${route.routePath}`);
      }

      const indexPath = path.join(route.funcDir, 'index.js');
      try {
        await fs.access(indexPath);
      } catch {
        errors.push(`Missing index.js for ${route.routePath}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 生成构建报告
   */
  generateReport(): string {
    const lines: string[] = [];
    
    lines.push('');
    lines.push('📦 Vercel Build Output API v3 Structure');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');
    lines.push(`📁 Output Directory: ${this.outputDir}`);
    lines.push('');
    
    lines.push('📄 Static Files:');
    lines.push(`   └── ${this.getStaticDir()}/`);
    lines.push('       ├── index.html');
    lines.push('       └── assets/');
    lines.push('');
    
    if (this.apiRoutes.length > 0) {
      lines.push('⚡ Serverless Functions:');
      for (const route of this.apiRoutes) {
        const icon = route.isDynamic ? '🔗' : '📌';
        lines.push(`   ${icon} ${route.routePath}`);
        lines.push(`      └── ${path.relative(this.outputDir, route.funcDir)}/`);
        lines.push(`          ├── .vc-config.json`);
        lines.push(`          └── index.js`);
      }
      lines.push('');
    }
    
    lines.push('🔀 Routes:');
    const routes = this.generateRoutes();
    for (const route of routes) {
      if (route.handle === 'filesystem') {
        lines.push(`   └── [filesystem]`);
      } else if (route.dest) {
        lines.push(`   └── ${route.src} → ${route.dest}`);
      } else if (route.continue) {
        lines.push(`   └── ${route.src} (headers)`);
      }
    }
    lines.push('');
    
    return lines.join('\n');
  }
}

/**
 * 将文件路径转换为路由路径和模式
 */
export function filePathToRouteInfo(
  filePath: string,
  apiDir: string,
  apiPrefix: string
): Pick<ApiRouteInfo, 'routePath' | 'isDynamic' | 'routePattern'> {
  const relativePath = path.relative(apiDir, filePath);
  const pathWithoutExt = relativePath.replace(/\.(ts|js)$/, '');
  
  // 处理 index 文件
  const normalizedPath = pathWithoutExt.replace(/\/index$/, '') || '/';
  
  // 检查是否包含动态段
  const isDynamic = normalizedPath.includes('[');
  
  // 生成路由路径（保留 [id] 格式用于目录结构）
  let routePath = path.join(apiPrefix, normalizedPath).replace(/\\/g, '/');
  if (routePath === apiPrefix) {
    routePath = apiPrefix + '/';
  }
  
  // 生成路由模式（转换为 :id 格式用于匹配）
  const routePattern = routePath.replace(/\[([^\]]+)\]/g, ':$1');
  
  return {
    routePath,
    isDynamic,
    routePattern,
  };
}
