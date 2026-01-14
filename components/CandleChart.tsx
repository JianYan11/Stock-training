/**
 * 文件功能：K线图可视化组件
 * 
 * 主要职责：
 * - 使用 SVG 绘制股票K线图（蜡烛图）
 * - 支持历史数据和未来数据的展示切换
 * - 自动计算价格范围和坐标转换
 * - 响应式布局，自适应容器大小
 * - 提供价格标签和网格线辅助阅读
 * 
 * 关键功能：
 * - K线绘制：根据 OHLC 数据绘制蜡烛图（实体+影线）
 * - 数据合并：将历史数据和未来数据合并显示
 * - 坐标转换：将价格转换为屏幕坐标（Y轴），时间转换为X轴位置
 * - 自适应布局：使用 ResizeObserver 监听容器大小变化
 * - 视觉区分：未来数据使用半透明显示，历史数据正常显示
 * 
 * 依赖关系：
 * - 接收 CandleData 数组作为输入
 * - 使用 types.ts 中的 COLORS 常量
 * - 通过 showFuture 属性控制是否显示未来数据
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { CandleData, COLORS } from '../types';

interface CandleChartProps {
  data: CandleData[];
  futureData?: CandleData[];
  showFuture?: boolean;
}

export const CandleChart: React.FC<CandleChartProps> = ({ data, futureData, showFuture }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 监听容器大小变化，确保 SVG 自适应
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    // 初始化大小
    updateSize();
    
    // 使用 ResizeObserver 监听更准确
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, []);

  const { width, height } = dimensions;

  // 合并数据
  const allData = useMemo(() => {
    const historical = data.map(d => ({ ...d, isFuture: false }));
    const future = (showFuture && futureData) ? futureData.map(d => ({ ...d, isFuture: true })) : [];
    return [...historical, ...future];
  }, [data, futureData, showFuture]);

  // 如果没有数据或容器没有尺寸，不渲染
  if (allData.length === 0 || width === 0 || height === 0) {
    return <div ref={containerRef} className="w-full h-full flex items-center justify-center text-slate-600">Loading Chart...</div>;
  }

  // 计算价格范围 (Y轴)
  const minPrice = Math.min(...allData.map(d => d.low));
  const maxPrice = Math.max(...allData.map(d => d.high));
  const priceRange = maxPrice - minPrice || 1; // 防止除以0
  
  // 增加 10% 上下内边距
  const paddingY = priceRange * 0.1; 
  const safeMin = minPrice - paddingY;
  const safeMax = maxPrice + paddingY;
  const safeRange = safeMax - safeMin;

  // X轴计算
  // 每个蜡烛占据的宽度，留出空隙
  const candleCount = allData.length;
  // 限制最大宽度，防止只有几根K线时巨宽
  const candleWidth = Math.min(width / candleCount * 0.7, 20); 
  const stepX = width / candleCount;

  // 坐标转换辅助函数
  const getY = (price: number) => {
    // 价格越高 Y越小(顶部)
    return height - ((price - safeMin) / safeRange) * height;
  };

  const getX = (index: number) => {
    return index * stepX + stepX / 2;
  };

  return (
    <div ref={containerRef} className="w-full h-full relative select-none">
      <svg width={width} height={height} className="overflow-visible block">
        {/* 背景网格线 */}
        <line x1={0} y1={getY(minPrice)} x2={width} y2={getY(minPrice)} stroke="#334155" strokeDasharray="4 4" opacity={0.3} strokeWidth={1} />
        <line x1={0} y1={getY(maxPrice)} x2={width} y2={getY(maxPrice)} stroke="#334155" strokeDasharray="4 4" opacity={0.3} strokeWidth={1} />
        <line x1={0} y1={getY((minPrice+maxPrice)/2)} x2={width} y2={getY((minPrice+maxPrice)/2)} stroke="#334155" strokeDasharray="4 4" opacity={0.3} strokeWidth={1} />

        {/* 绘制 K 线 */}
        {allData.map((d, i) => {
          const x = getX(i);
          const yOpen = getY(d.open);
          const yClose = getY(d.close);
          const yHigh = getY(d.high);
          const yLow = getY(d.low);

          const isUp = d.close >= d.open;
          const color = isUp ? COLORS.UP : COLORS.DOWN;
          const opacity = d.isFuture ? 0.4 : 1;
          
          // 确保 Body 至少有 1px 高度
          const barHeight = Math.max(1, Math.abs(yClose - yOpen));
          const barY = Math.min(yOpen, yClose);

          return (
            <g key={i} opacity={opacity}>
              {/* 影线 (Wick) */}
              <line 
                x1={x} y1={yHigh} 
                x2={x} y2={yLow} 
                stroke={color} 
                strokeWidth={1.5} 
              />
              {/* 实体 (Body) */}
              <rect 
                x={x - candleWidth / 2} 
                y={barY} 
                width={candleWidth} 
                height={barHeight} 
                fill={color} 
                stroke={color} // 防止SVG抗锯齿导致的缝隙
              />
            </g>
          );
        })}

        {/* 历史与未来的分隔线 */}
        {showFuture && (
           <line 
             x1={getX(data.length - 0.5)} 
             y1={0} 
             x2={getX(data.length - 0.5)} 
             y2={height} 
             stroke="white" 
             strokeDasharray="4 4" 
             strokeOpacity={0.5} 
             strokeWidth={1}
           />
        )}
      </svg>
      
      {/* 简单的 Y 轴价格标签 */}
      <div className="absolute right-0 top-0 bottom-0 pointer-events-none w-12 border-l border-slate-800/50 bg-slate-900/20 text-[10px] text-slate-500 font-mono flex flex-col justify-between py-2 items-end pr-1">
        <span style={{ position: 'absolute', top: getY(maxPrice) - 6 }}>{maxPrice.toFixed(0)}</span>
        <span style={{ position: 'absolute', top: getY((maxPrice + minPrice) / 2) - 6 }}>{((maxPrice + minPrice) / 2).toFixed(0)}</span>
        <span style={{ position: 'absolute', top: getY(minPrice) - 6 }}>{minPrice.toFixed(0)}</span>
      </div>
    </div>
  );
};