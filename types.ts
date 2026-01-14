/**
 * 文件功能：TypeScript 类型定义文件
 * 
 * 主要职责：
 * - 定义应用中使用的所有 TypeScript 接口、枚举和常量
 * - 提供类型安全保障，确保数据类型一致性
 * 
 * 关键导出：
 * - CandleData: K线数据接口（开盘价、收盘价、最高价、最低价、成交量、时间）
 * - GameState: 游戏状态枚举（初始化、空闲、倒计时、游戏中、分析中、结果显示）
 * - GestureType: 手势类型枚举（无手势、左手、右手）
 * - AnalysisResult: AI 分析结果接口
 * - COLORS: 颜色常量（中国股市配色：红涨绿跌）
 * 
 * 依赖关系：
 * - 被 App.tsx、组件和服务文件广泛引用
 */

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export enum GameState {
  INIT = 'INIT',           // Loading models
  IDLE = 'IDLE',           // Waiting for user to position hand
  COUNTDOWN = 'COUNTDOWN', // 3-2-1 Start
  PLAYING = 'PLAYING',     // Chart shown, 10s timer active
  ANALYZING = 'ANALYZING', // Locking in choice
  RESULT = 'RESULT',       // Show win/loss and AI analysis
}

export enum GestureType {
  NONE = 'NONE',
  HAND_LEFT = 'HAND_LEFT',   // Visual Left (Used for Rise/Buy)
  HAND_RIGHT = 'HAND_RIGHT'  // Visual Right (Used for Fall/Sell)
}

export interface AnalysisResult {
  correct: boolean;
  actualChange: number;
  aiExplanation: string;
}

// Color constants for Chinese Market (Red = Up/Good, Green = Down/Bad)
export const COLORS = {
  UP: '#ef4444',   // Red-500
  DOWN: '#22c55e', // Green-500
  NEUTRAL: '#94a3b8', // Slate-400
  BG: '#0f172a'
};