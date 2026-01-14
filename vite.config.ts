/**
 * 文件功能：Vite 构建工具配置文件
 * 
 * 主要职责：
 * - 配置 Vite 开发服务器和构建选项
 * - 设置 React 插件支持 JSX/TSX 编译
 * - 注入环境变量到客户端代码
 * - 配置路径别名和模块解析
 * 
 * 关键配置：
 * - 开发服务器：端口 3000，监听所有网络接口（0.0.0.0）
 * - React 插件：支持 React 组件的热更新和编译
 * - 环境变量：从 .env 文件加载 GEMINI_API_KEY 并注入到 process.env
 * - 路径别名：配置 @ 指向项目根目录，方便导入
 * 
 * 依赖关系：
 * - 依赖 @vitejs/plugin-react 插件
 * - 需要 .env 或 .env.local 文件提供 GEMINI_API_KEY
 * - 被 Vite 构建工具自动读取
 */

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
