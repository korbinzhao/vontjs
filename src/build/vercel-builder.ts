import { build as esbuild } from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';
import type { VontConfig } from '../types/index.js';
import { 
  VercelOutputBuilder, 
  filePathToRouteInfo,
  type ApiRouteInfo 
} from './vercel-output-builder.js';

interface ApiRoute {
  filePath: string;
  routePath: string;
  methods: string[];
}

/**
 * 递归查找所有 API 文件
 */
async function findApiFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await findApiFiles(fullPath));
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // 目录不存在
  }

  return files;
}

/**
 * 将文件路径转换为路由路径
 */
function filePathToRoute(relativePath: string): string {
  let routePath = relativePath
    .replace(/\\/g, '/')
    .replace(/\.(ts|tsx|js|jsx)$/, '')
    .replace(/\/index$/, '');

  if (!routePath) {
    routePath = '/';
  }

  return routePath;
}

/**
 * 生成 Vercel Serverless Function 入口文件（新版本）
 */
async function generateVercelFunctionV3(
  routeInfo: ApiRouteInfo,
  apiDir: string,
  tempDir: string,
  apiPrefix: string
): Promise<string> {
  const fileName = routeInfo.routePath
    .replace(apiPrefix, '')
    .replace(/\//g, '_')
    .replace(/^\/_/, '');
  
  const outputPath = path.join(tempDir, `${fileName || 'index'}.ts`);
  
  // 计算相对导入路径
  const relativeImport = path.relative(
    path.dirname(outputPath),
    routeInfo.filePath
  ).replace(/\\/g, '/').replace(/\.ts$/, '');

  const functionCode = `
import { adaptKoaHandler, parseBody, createParamExtractor } from 'vont';
import * as apiModule from '${relativeImport.startsWith('.') ? relativeImport : `./${relativeImport}`}';

${routeInfo.isDynamic ? `const extractParams = createParamExtractor('${routeInfo.routePattern}');` : ''}

export default async function handler(req, res) {
  try {
    // 解析请求体
    if (!req.body && ['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
      try {
        req.body = await parseBody(req);
      } catch (error) {
        console.error('Failed to parse request body:', error);
      }
    }

    // 获取请求方法对应的处理器
    const method = (req.method || 'GET').toLowerCase();
    const handler = apiModule[method];

    if (!handler) {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Allow', Object.keys(apiModule).filter(k => !k.startsWith('_')).join(', ').toUpperCase());
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      return;
    }

    // 执行路由级中间件（如果有）
    if (apiModule.middleware && Array.isArray(apiModule.middleware)) {
      // 注意：中间件在 Serverless 环境中的支持有限
      console.warn('Middleware in Serverless Functions: limited support');
    }

    // 使用适配器执行处理器
    const adaptedHandler = adaptKoaHandler(
      handler,
      ${routeInfo.isDynamic ? 'extractParams' : 'undefined'}
    );

    await adaptedHandler(req, res);
  } catch (error) {
    console.error('Function execution error:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }));
    }
  }
}
`;

  await fs.writeFile(outputPath, functionCode, 'utf-8');
  return outputPath;
}

/**
 * 为 Vercel 构建项目（使用 Build Output API v3）
 */
export async function buildForVercel(
  config: VontConfig,
  rootDir: string,
  outDir: string,
  apiDir: string
): Promise<void> {
  const apiPrefix = config.apiPrefix || '/api';

  console.log('🚀 Building for Vercel (Build Output API v3)...\n');

  // 初始化 Output Builder
  const outputBuilder = new VercelOutputBuilder(outDir);
  await outputBuilder.initialize();

  const functionsDir = outputBuilder.getFunctionsDir();

  // 查找所有 API 文件
  const apiFiles = await findApiFiles(apiDir);
  
  if (apiFiles.length === 0) {
    console.log('⚠️  No API files found\n');
    // 仍然生成 config.json，即使没有 API
    await outputBuilder.generateConfig();
    return;
  }

  console.log(`📦 Found ${apiFiles.length} API files\n`);

  // 创建临时目录用于生成 Vercel 函数
  const tempDir = path.join(rootDir, '.vont', 'vercel-functions');
  await fs.mkdir(tempDir, { recursive: true });

  // 为每个 API 文件生成路由信息
  const routeInfos: ApiRouteInfo[] = [];
  
  for (const file of apiFiles) {
    const relativePath = path.relative(apiDir, file);
    const routeInfo = filePathToRouteInfo(file, apiDir, apiPrefix);
    
    // 计算函数目录：.vercel/output/functions/api/users.func/
    const funcName = relativePath
      .replace(/\.(ts|js)$/, '')
      .replace(/\\/g, '/')
      .replace(/\/index$/, '');
    
    const funcDir = path.join(
      functionsDir, 
      'api',
      funcName ? `${funcName}.func` : 'index.func'
    );
    
    routeInfos.push({
      filePath: file,
      routePath: routeInfo.routePath,
      isDynamic: routeInfo.isDynamic,
      routePattern: routeInfo.routePattern,
      funcDir,
      methods: ['get', 'post', 'put', 'delete', 'patch'],
    });
  }

  // 生成并编译每个 Vercel 函数
  for (const routeInfo of routeInfos) {
    try {
      console.log(`  Building ${routeInfo.routePath}...`);
      
      // 创建函数目录
      await fs.mkdir(routeInfo.funcDir, { recursive: true });
      
      // 生成 Vercel 函数入口文件
      const entryFile = await generateVercelFunctionV3(
        routeInfo,
        apiDir,
        tempDir,
        apiPrefix
      );

      // 编译函数
      const outputPath = path.join(routeInfo.funcDir, 'index.js');
      
      await esbuild({
        entryPoints: [entryFile],
        outfile: outputPath,
        bundle: true,
        format: 'esm',
        platform: 'node',
        target: 'node18',
        minify: false,
        sourcemap: true,
        external: ['vont'],
        banner: {
          js: '// Vercel Serverless Function (Build Output API v3) - Generated by Vont',
        },
      });

      // 生成函数配置
      await outputBuilder.generateFunctionConfig(routeInfo.funcDir, {
        memory: config.vercel?.functionMemory || 1024,
        maxDuration: config.vercel?.functionMaxDuration || 10,
      });

      // 注册路由到 output builder
      outputBuilder.registerApiRoute(routeInfo);

      console.log(`  ✅ Built ${routeInfo.routePath}`);
    } catch (error) {
      console.error(`  ❌ Failed to build ${routeInfo.routePath}:`, error);
      throw error;
    }
  }

  // 生成 config.json
  console.log('\n📝 Generating config.json...');
  await outputBuilder.generateConfig();

  // 清理临时目录
  await fs.rm(tempDir, { recursive: true, force: true });

  // 验证构建产物
  console.log('\n🔍 Validating build output...');
  const validation = await outputBuilder.validate();
  
  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    validation.warnings.forEach(w => console.log(`   - ${w}`));
  }
  
  if (!validation.valid) {
    console.log('\n❌ Validation failed:');
    validation.errors.forEach(e => console.log(`   - ${e}`));
    throw new Error('Build validation failed');
  }

  // 生成构建报告
  console.log(outputBuilder.generateReport());
  
  console.log('✨ Vercel build completed successfully!\n');
}

