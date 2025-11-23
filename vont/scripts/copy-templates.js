#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excludeDirs = ['node_modules', 'dist', '.DS_Store', '.git'];
const excludeFiles = ['package-lock.json', 'npm-debug.log', '.npmrc'];

/**
 * 递归复制目录，排除指定目录
 */
async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    // 跳过排除的目录和文件
    if (excludeDirs.includes(entry.name)) {
      continue;
    }
    
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      // 跳过排除的文件
      if (excludeFiles.includes(entry.name)) {
        continue;
      }
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * 主函数
 */
async function main() {
  const rootDir = path.join(__dirname, '..');
  const templatesDir = path.join(rootDir, 'templates');
  const distTemplatesDir = path.join(rootDir, 'dist', 'templates');
  
  try {
    console.log('📦 Copying templates to dist...');
    
    // 删除旧的 dist/templates
    try {
      await fs.rm(distTemplatesDir, { recursive: true, force: true });
    } catch (err) {
      // 目录可能不存在，忽略错误
    }
    
    // 复制模板
    await copyDir(templatesDir, distTemplatesDir);
    
    console.log('✅ Templates copied successfully');
  } catch (error) {
    console.error('❌ Failed to copy templates:', error);
    process.exit(1);
  }
}

main();

