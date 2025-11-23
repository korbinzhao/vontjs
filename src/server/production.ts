/**
 * Vont 生产服务器默认入口
 * 用户可以在项目的 server/index.ts 中使用这个函数快速启动服务器
 */
import { createProdServer } from './prod-server.js';
import type { VontConfig } from '../types/index.js';

/**
 * 启动生产服务器（使用默认配置）
 */
export async function startProductionServer(config?: Partial<VontConfig>) {
  const defaultConfig: VontConfig = {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0',
    root: process.cwd(),
    apiPrefix: '/api',
    ...config,
  };

  await createProdServer(defaultConfig);
}

/**
 * 默认导出，可以直接运行
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  startProductionServer();
}

