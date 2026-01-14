/**
 * 文件功能：React 应用入口文件
 * 
 * 主要职责：
 * - 初始化 React 应用的 DOM 挂载点
 * - 使用 React 18 的 createRoot API 渲染主应用组件
 * - 启用 React.StrictMode 进行开发模式检查
 * 
 * 关键功能：
 * - 查找并验证 DOM 根元素 (#root)
 * - 创建 React Root 并渲染 App 组件
 * 
 * 依赖关系：
 * - 依赖 App.tsx 主应用组件
 * - 需要 index.html 中存在 id="root" 的 DOM 元素
 */

// React 是用于构建用户界面的 JavaScript 库，主要负责 UI 组件的声明式开发。
// 下面分别说明这三个包的作用：
// 1. react：核心库，提供创建组件和管理组件状态的能力。
// 2. react-dom/client：用于将 React 组件渲染到 DOM 上。自 React 18 起，推荐使用 createRoot API 进行挂载。
// 3. ./App：应用的主组件，作为整个应用的入口。

import React from 'react'; // 引入 React 核心库
import ReactDOM from 'react-dom/client'; // 引入用于在浏览器端操作 DOM 的 React DOM 客户端 API
import App from './App'; // 引入主应用组件


// 获取页面中的 id="root" 的 DOM 元素作为 React 挂载点
const rootElement = document.getElementById('root');
// 如果未找到 root 挂载点则抛出错误，阻止应用继续加载
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
// 使用 React 18 的 createRoot API 创建根节点，并渲染主应用组件 App，
// 外部包裹 React.StrictMode 以辅助捕捉潜在开发问题，仅在开发环境生效。
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);