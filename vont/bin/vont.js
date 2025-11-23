#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const command = args[0] || 'dev';

console.log(`🚀 Vont Framework CLI v1.0.0\n`);

switch (command) {
  case 'create':
    console.log('Creating new project...');
    import('../dist/cli/create.js');
    break;
  
  case 'dev':
    console.log('Starting development server...');
    // 使用 tsx 加载器启动开发服务器以支持 TypeScript
    import('tsx/esm/api').then(tsx => {
      tsx.register();
      import('../dist/cli/dev.js');
    }).catch(() => {
      // tsx 不可用，直接导入
      import('../dist/cli/dev.js');
    });
    break;
  
  case 'build':
    console.log('Building project...');
    import('../dist/cli/build.js');
    break;
  
  case 'start':
    console.log('Starting production server...');
    import('../dist/cli/start.js');
    break;
  
  case '--version':
  case '-v':
    console.log('v1.0.0');
    break;
  
  case '--help':
  case '-h':
    console.log(`
Usage: vont [command] [options]

Commands:
  create <name>  Create a new Vont project
  dev            Start development server with hot reload
  build          Build project for production
  start          Start production server

Options:
  --version, -v   Show version
  --help, -h      Show help

Examples:
  $ vont create my-app
  $ vont dev
  $ vont build
  $ vont start
  $ PORT=4000 vont dev
`);
    break;
  
  default:
    console.error(`❌ Unknown command: ${command}`);
    console.log('Run "vont --help" for usage information.');
    process.exit(1);
}

