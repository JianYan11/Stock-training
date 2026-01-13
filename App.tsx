import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WebcamFeed } from './components/WebcamFeed';
import { CandleChart } from './components/CandleChart';
import { generateStockData, splitDataForGame } from './services/stockService';
import { analyzeStockPattern } from './services/geminiService';
import { CandleData, GameState, GestureType, COLORS } from './types';
import { Hand, TrendingUp, TrendingDown, Play, RotateCcw } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.INIT);
  const [currentGesture, setCurrentGesture] = useState<GestureType>(GestureType.NONE);
  const [stockData, setStockData] = useState<CandleData[]>([]);
  const [futureData, setFutureData] = useState<CandleData[]>([]);
  const [timer, setTimer] = useState(10);
  const [result, setResult] = useState<{win: boolean, change: number, explanation: string} | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [gestureHoldTime, setGestureHoldTime] = useState(0);

  // 初始化时直接生成数据，这样用户一进来就能看到图
  useEffect(() => {
    initNewRound();
  }, []);

  const initNewRound = useCallback(() => {
    const fullData = generateStockData(60);
    const { visibleData, futureData } = splitDataForGame(fullData);
    setStockData(visibleData);
    setFutureData(futureData);
    setResult(null);
    setTimer(10);
    // 不自动进入倒计时，等待用户准备好（手势触发或点击）
    if (gameState !== GameState.INIT) {
       setGameState(GameState.IDLE);
    }
  }, [gameState]);

  const startGame = useCallback(() => {
    setGameState(GameState.COUNTDOWN);
  }, []);

  // Handle Countdown
  useEffect(() => {
    if (gameState === GameState.COUNTDOWN) {
      const timeout = setTimeout(() => {
        setGameState(GameState.PLAYING);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [gameState]);

  // Handle Game Timer
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      if (timer > 0) {
        const interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
      } else {
        // Time over. Check current gesture for decision.
        handleTimeUp();
      }
    }
  }, [gameState, timer]);

  const handleTimeUp = async () => {
    // Determine action based on last gesture
    let userPredictionUp = false; // Default to sell if unsure? Or Hold?
    let validDecision = false;

    if (currentGesture === GestureType.HAND_LEFT) {
      userPredictionUp = true;
      validDecision = true;
    } else if (currentGesture === GestureType.HAND_RIGHT) {
      userPredictionUp = false;
      validDecision = true;
    }

    setGameState(GameState.ANALYZING);

    const lastPrice = stockData[stockData.length - 1].close;
    const finalPrice = futureData[futureData.length - 1].close;
    const isActuallyUp = finalPrice > lastPrice;
    const changePercent = ((finalPrice - lastPrice) / lastPrice) * 100;
    
    // Fetch AI analysis
    const analysis = await analyzeStockPattern(stockData);

    let isCorrect = false;
    let explanation = analysis;

    if (!validDecision) {
      isCorrect = false;
      explanation = "未检测到明确手势，判定为失败。 " + analysis;
    } else {
      isCorrect = isActuallyUp === userPredictionUp;
    }

    setResult({
      win: isCorrect,
      change: changePercent,
      explanation: explanation
    });
    
    setScore(s => ({ 
      correct: s.correct + (isCorrect ? 1 : 0), 
      total: s.total + 1 
    }));

    setGameState(GameState.RESULT);
  };

  // Gesture Handling Logic
  const handleGesture = useCallback((gesture: GestureType) => {
    setCurrentGesture(gesture);

    // IDLE 状态下，如果检测到任何手势，且持续了一小会儿，可以开始游戏 (这里为了简单，检测到即准备开始)
    if (gameState === GameState.IDLE) {
       if (gesture === GestureType.HAND_LEFT || gesture === GestureType.HAND_RIGHT) {
          // 这里可以加一个延时确认，防止误触，但为了响应快，直接开始
          startGame(); 
       }
    }
    
    // RESULT 状态下，挥手重来
    if (gameState === GameState.RESULT) {
       if (gesture !== GestureType.NONE) {
         // 简单的防抖在组件外层做，或者这里简单处理：需要用户先把手拿开再放回来？
         // 简化：如果结果展示超过2秒，检测到手势就重开
         // 这里我们还是主要依赖按钮重开，手势重开容易误操作，
         // 或者可以设定：检测到手势持续 1s 则重开。
       }
    }

  }, [gameState, startGame]);

  // UI Helper for Gesture Box
  const getGestureStatusColor = () => {
    if (currentGesture === GestureType.HAND_LEFT) return "border-red-500 bg-red-500/20";
    if (currentGesture === GestureType.HAND_RIGHT) return "border-green-500 bg-green-500/20";
    return "border-slate-700 bg-slate-800/50";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row overflow-hidden">
      
      {/* Left Panel: Camera & Controls */}
      <div className="lg:w-1/3 w-full p-6 flex flex-col gap-6 bg-slate-800/50 border-r border-slate-700">
        <header className="mb-2">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            直觉操盘手
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Intuition Trader AI
          </p>
        </header>

        {/* Camera Feed */}
        <div className={`flex-1 min-h-[300px] flex flex-col relative rounded-xl border-4 transition-colors duration-300 ${getGestureStatusColor()}`}>
           <WebcamFeed 
             gameState={gameState} 
             onGestureDetected={handleGesture} 
             onCameraReady={() => { if(gameState === GameState.INIT) setGameState(GameState.IDLE); }} 
           />
           
           {/* Active Gesture Indicator Overlay */}
           {currentGesture !== GestureType.NONE && (
             <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full font-bold backdrop-blur-md shadow-lg z-20 ${currentGesture === GestureType.HAND_LEFT ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                {currentGesture === GestureType.HAND_LEFT ? "检测到: 看涨 (左)" : "检测到: 看跌 (右)"}
             </div>
           )}
        </div>

        {/* Manual Control Fallback */}
        <div className="grid grid-cols-1 gap-3">
          { (gameState === GameState.IDLE || gameState === GameState.RESULT || gameState === GameState.INIT) ? (
             <button 
               onClick={gameState === GameState.RESULT ? initNewRound : startGame} 
               className="bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
             >
               <Play className="w-5 h-5" /> {gameState === GameState.RESULT ? "下一局" : "开始游戏"}
             </button>
          ) : (
             <div className="py-4 text-center">
               <span className="text-slate-400 font-mono text-sm block mb-1">
                 {gameState === GameState.COUNTDOWN ? "准备..." : "请将手放在左侧或右侧区域"}
               </span>
               <div className="flex justify-center gap-2">
                 <span className={`px-2 py-1 rounded text-xs ${currentGesture === GestureType.HAND_LEFT ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-500'}`}>看涨区域</span>
                 <span className={`px-2 py-1 rounded text-xs ${currentGesture === GestureType.HAND_RIGHT ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-500'}`}>看跌区域</span>
               </div>
             </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
             <div className="text-slate-400 text-xs uppercase mb-1">Score</div>
             <div className="text-2xl font-mono font-bold">
               {score.correct} / {score.total}
             </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
             <div className="text-slate-400 text-xs uppercase mb-1">Time</div>
             <div className={`text-4xl font-mono font-bold ${timer <= 3 && gameState === GameState.PLAYING ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
               {gameState === GameState.PLAYING ? timer : '--'}
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Chart */}
      <div className="flex-1 bg-slate-900 p-6 flex flex-col relative">
        {gameState === GameState.COUNTDOWN && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
             <div className="text-9xl font-black text-white animate-ping">
               Ready
             </div>
          </div>
        )}

        <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-inner relative overflow-hidden">
          {stockData.length > 0 ? (
            <CandleChart 
              data={stockData} 
              futureData={futureData} 
              showFuture={gameState === GameState.RESULT} 
            />
          ) : (
             <div className="flex h-full items-center justify-center">
               <span className="text-slate-500">Loading Chart...</span>
             </div>
          )}

          {/* Result Overlay */}
          {(gameState === GameState.RESULT || gameState === GameState.ANALYZING) && (
            <div className="absolute top-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-6 rounded-xl animate-fade-in shadow-2xl z-10">
               <div className="flex items-start justify-between">
                 <div>
                   {gameState === GameState.ANALYZING ? (
                      <h2 className="text-4xl font-bold mb-2 text-blue-400 animate-pulse">
                        正在结算...
                      </h2>
                   ) : result && (
                     <>
                       <h2 className={`text-4xl font-bold mb-2 ${result.win ? 'text-yellow-400' : 'text-slate-400'}`}>
                         {result.win ? '判断正确! 🎉' : '判断错误 ❌'}
                       </h2>
                       <div className="flex items-center gap-4 text-xl">
                          <span className="text-slate-300">实际走势:</span>
                          <span className={`font-mono font-bold ${result.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {result.change >= 0 ? '+' : ''}{result.change.toFixed(2)}%
                          </span>
                       </div>
                     </>
                   )}
                 </div>
                 
                 {gameState === GameState.RESULT && (
                   <button 
                     onClick={initNewRound}
                     className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
                   >
                     <RotateCcw className="w-5 h-5" /> 下一局
                   </button>
                 )}
               </div>

               <div className="mt-6 pt-6 border-t border-slate-700">
                 <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                   <h3 className="text-purple-400 font-semibold text-sm uppercase tracking-wider">AI 技术分析 (Gemini)</h3>
                 </div>
                 <p className="text-slate-200 leading-relaxed text-lg">
                   {gameState === GameState.ANALYZING ? "正在分析 K 线形态..." : result?.explanation}
                 </p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}