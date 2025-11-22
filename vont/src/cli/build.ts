import { build as esbuild } from 'esbuild';
import { build as viteBuild } from 'vite';
import path from 'path';
import { promises as fs } from 'fs';
import type { BuildOptions } from '../types/index.js';

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

export async function buildProject(options?: BuildOptions): Promise<void> {
  try {
    const rootDir = options?.root || process.cwd();
    const outDir = options?.outDir || path.join(rootDir, 'dist');
    const serverDir = options?.serverDir || path.join(outDir, 'server');
    const apiDir = options?.apiDir || path.join(rootDir, 'src', 'api');

    console.log('🔨 Building project...\n');

    // 0. 生成虚拟 client.tsx（如果不存在）
    const clientPath = path.join(rootDir, 'client.tsx');
    const clientExists = await fs.access(clientPath).then(() => true).catch(() => false);
    
    if (!clientExists) {
      console.log('📝 Generating virtual client.tsx...');
      const virtualClientEntry = `import { renderVontApp } from '@vont/core/client';

// 动态导入样式（如果存在）
const styleModules = import.meta.glob('/src/styles/**/*.css', { eager: true });

// 动态导入所有页面
const pageModules = import.meta.glob('/src/pages/**/*.{tsx,jsx}', { eager: true });

// 渲染应用
renderVontApp({
  pagesGlob: pageModules,
});
`;
      await fs.writeFile(clientPath, virtualClientEntry, 'utf-8');
      console.log('✅ Virtual client.tsx generated\n');
    }

    // 1. 构建前端代码
    console.log('📦 Building frontend...');
    await viteBuild({
      root: rootDir,
    });
    console.log('✅ Frontend built\n');

    // 清理生成的 client.tsx（如果是我们生成的）
    if (!clientExists) {
      await fs.unlink(clientPath).catch(() => {});
    }

    // 2. 构建后端代码（生成虚拟 server）
    console.log('📦 Building backend...');

    // 确保 dist 目录存在
    await fs.mkdir(serverDir, { recursive: true });

    // 生成虚拟 server/index.ts（如果不存在）
    const serverIndexPath = path.join(rootDir, 'server', 'index.ts');
    const serverExists = await fs.access(serverIndexPath).then(() => true).catch(() => false);
    
    let generatedServer = false;
    if (!serverExists) {
      await fs.mkdir(path.join(rootDir, 'server'), { recursive: true });
      const virtualServerEntry = `import { startProductionServer } from '@vont/core';
startProductionServer();
`;
      await fs.writeFile(serverIndexPath, virtualServerEntry, 'utf-8');
      generatedServer = true;
    }

    // 收集所有后端 TypeScript 文件
    const serverFiles = [
      serverIndexPath,
    ];

    await esbuild({
      entryPoints: serverFiles,
      outdir: serverDir,
      bundle: true,
      format: 'esm',
      platform: 'node',
      target: 'es2020',
      external: ['koa', 'koa-router', 'koa-bodyparser', 'koa-static', '@vont/core'],
      logLevel: 'info',
    });

    console.log('✅ Backend built');

    // 清理生成的 server（如果是我们生成的）
    if (generatedServer) {
      await fs.unlink(serverIndexPath).catch(() => {});
      // 如果 server 目录为空，也删除它
      try {
        const serverDirPath = path.join(rootDir, 'server');
        const serverDirFiles = await fs.readdir(serverDirPath);
        if (serverDirFiles.length === 0) {
          await fs.rmdir(serverDirPath);
        }
      } catch {
        // 忽略错误
      }
    }

    // 编译 API 模块
    console.log('\n📦 Compiling API modules...');
    const apiDistDir = path.join(outDir, 'api');

    try {
      const apiFiles = await findApiFiles(apiDir);

      if (apiFiles.length > 0) {
        await esbuild({
          entryPoints: apiFiles,
          outdir: apiDistDir,
          format: 'esm',
          platform: 'node',
          target: 'es2020',
          splitting: false,
          logLevel: 'info',
        });

        console.log('✅ API modules compiled\n');
      }
    } catch (error) {
      const err = error as Error;
      console.error('⚠️  Warning: Could not compile API files:', err.message);
    }

    console.log('✨ Build completed successfully!\n');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// CLI 入口
buildProject().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});

