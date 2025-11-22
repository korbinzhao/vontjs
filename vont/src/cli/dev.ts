import { createDevServer } from '../server/dev-server.js';

// 启动开发服务器
createDevServer().catch((error) => {
  console.error('Failed to start dev server:', error);
  process.exit(1);
});

