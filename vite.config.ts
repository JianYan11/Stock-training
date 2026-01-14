/**
 * 文件功能：Vite 构建工具配置文件
 * 
 * 主要职责：
 * - 配置 Vite 开发服务器和构建选项
 * - 设置 React 插件支持 JSX/TSX 编译
 * - 配置路径别名和模块解析
 * 
 * 关键配置：
 * - 开发服务器：端口 3000，监听所有网络接口（0.0.0.0）
 * - React 插件：支持 React 组件的热更新和编译
 * - 路径别名：配置 @ 指向项目根目录，方便导入
 * 
 * 依赖关系：
 * - 依赖 @vitejs/plugin-react 插件
 * - 被 Vite 构建工具自动读取
 */

import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    // Use IPv6 "any" address so browsers resolving localhost -> ::1 work,
    // while still allowing IPv4 via v4-mapped addresses on most OSes.
    // If your OS is configured as IPv6-only, this also avoids localhost failures.
    host: '::',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
