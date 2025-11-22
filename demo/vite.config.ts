import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// ========================================
// 调试插件 - 仅用于开发环境
// ========================================
// 以下插件仅用于开发环境调试，生产环境不会被打包
// 功能说明：
// - sourceMappingInjectorAdapter: 源码映射注入，用于调试时定位源码位置
// - errorCaptureAdapter: 错误捕获，用于收集和上报运行时错误
// - domInspectorAdapter: DOM审查器，用于调试时检查DOM结构
// ========================================
import { viteAdapter as errorCaptureAdapter } from "@ali/aone-super-error-capture";
import { viteAdapter as domInspectorAdapter } from "@ali/aone-super-dom-inspector-injector";
import { viteAdapter as sourceMappingInjectorAdapter } from "@ali/aone-super-source-mapping-injector";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sourceMappingInjectorAdapter(),
    errorCaptureAdapter(),
    domInspectorAdapter(),
    react()
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false, // 允许使用其他端口（避免端口冲突）
    middlewareMode: true, // 中间件模式，集成到 Koa
    hmr: {
      overlay: true, // 显示错误覆盖层
      port: 3001, // HMR 使用独立端口
    },
    watch: {
      // 监听配置
      usePolling: false,
      interval: 100,
    },
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: false,
    rollupOptions: {
      input: 'index.html',
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    },
    sourcemap: true, // 生成 source map 便于调试
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    // 预构建依赖
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});