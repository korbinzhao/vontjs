import { createProdServer } from '../server/prod-server.js';

// 启动生产服务器
createProdServer().catch((error) => {
  console.error('Failed to start prod server:', error);
  process.exit(1);
});

