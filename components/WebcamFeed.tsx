/**
 * 文件功能：摄像头视频流和手势识别组件
 * 
 * 主要职责：
 * - 初始化并管理摄像头视频流
 * - 加载 MediaPipe 手势识别模型
 * - 实时检测用户手势（左手/右手位置）
 * - 提供视觉反馈（左右区域划分、手势状态指示）
 * - 处理摄像头和模型加载的错误状态
 * 
 * 关键功能：
 * - 摄像头初始化：请求用户媒体权限，启动视频流
 * - 手势识别循环：使用 requestAnimationFrame 持续检测手势
 * - 区域划分：将视频画面分为左右两个区域（看涨/看跌）
 * - 状态管理：加载中、就绪、错误三种状态
 * 
 * 依赖关系：
 * - 依赖 gestureService 进行手势识别
 * - 接收 gameState 控制显示状态
 * - 通过 onGestureDetected 回调向父组件传递手势结果
 * - 通过 onCameraReady 通知父组件摄像头就绪
 */

import React, { useRef, useEffect, useState } from 'react';
import { initializeGestureRecognizer, predictGesture } from '../services/gestureService';
import { GameState, GestureType } from '../types';
import { AlertCircle, Camera, Loader2 } from 'lucide-react';

interface WebcamFeedProps {
  gameState: GameState;
  onGestureDetected: (gesture: GestureType) => void;
  onCameraReady: () => void;
}

export const WebcamFeed: React.FC<WebcamFeedProps> = ({ gameState, onGestureDetected, onCameraReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const requestRef = useRef<number | null>(null);

  // 1. Load AI Model
  useEffect(() => {
    initializeGestureRecognizer()
      .then(() => setModelStatus('ready'))
      .catch((err) => {
        console.error("Model failed", err);
        // Even if model fails, we let camera run, but maybe show warning
        setModelStatus('error'); 
        setErrorMessage("AI 模型加载失败，请刷新重试");
      });
  }, []);

  // 2. Start Camera
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let isMounted = true;

    const startCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) setErrorMessage("浏览器不支持摄像头");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false 
        });
        
        currentStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          if (isMounted) {
            setIsStreamActive(true);
            onCameraReady();
          }
        }
      } catch (err: any) {
        console.error("Camera Error:", err);
        if (isMounted) setErrorMessage("无法访问摄像头");
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (currentStream) currentStream.getTracks().forEach(t => t.stop());
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // 3. Prediction Loop
  useEffect(() => {
    if (modelStatus === 'ready' && isStreamActive) {
      const loop = () => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          const gesture = predictGesture(videoRef.current);
          onGestureDetected(gesture);
        }
        requestRef.current = requestAnimationFrame(loop);
      };
      loop();
    }
  }, [modelStatus, isStreamActive, onGestureDetected]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl flex items-center justify-center">
      {/* Video Feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
        style={{ display: isStreamActive ? 'block' : 'none' }} 
      />
      
      {/* Loading States */}
      {(!isStreamActive || modelStatus === 'loading') && !errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-20 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-3" />
          <p className="text-blue-200 text-sm font-mono">
            {!isStreamActive ? "启动摄像头..." : "加载 AI 模型..."}
          </p>
        </div>
      )}

      {/* Error State */}
      {errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-30 p-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
          <p className="text-red-400 font-bold">{errorMessage}</p>
        </div>
      )}

      {/* Game Overlay (Split Screen) */}
      {isStreamActive && modelStatus === 'ready' && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Center Divider */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 border-l border-dashed border-white/40"></div>
          
          {/* Zone Labels */}
          <div className="absolute top-4 left-4">
             <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-md flex items-center gap-2">
               <span>👈 看涨 (Buy)</span>
             </div>
          </div>
          <div className="absolute top-4 right-4">
             <div className="bg-green-500/20 border border-green-500/50 text-green-100 px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-md flex items-center gap-2">
               <span>看跌 (Sell) 👉</span>
             </div>
          </div>

          {/* Active Zone Highlight */}
          {gameState === GameState.PLAYING && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-1/2 hover:bg-red-500/10 transition-colors duration-300"></div>
              <div className="absolute right-0 top-0 bottom-0 w-1/2 hover:bg-green-500/10 transition-colors duration-300"></div>
            </>
          )}
        </div>
      )}
    </div>
  );
};