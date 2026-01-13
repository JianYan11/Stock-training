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