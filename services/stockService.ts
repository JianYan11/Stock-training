/**
 * 文件功能：股票数据生成服务
 * 
 * 主要职责：
 * - 生成模拟股票K线数据用于游戏训练
 * - 使用随机游走模型（类似几何布朗运动）模拟价格波动
 * - 将完整数据分割为历史可见数据和未来隐藏数据
 * - 计算价格变化百分比和涨跌方向
 * 
 * 关键功能：
 * - generateStockData: 生成指定长度的K线数据序列
 *   - 使用随机游走算法模拟价格变化
 *   - 生成开盘价、收盘价、最高价、最低价和成交量
 *   - 支持可配置的波动率参数
 * - splitDataForGame: 将完整数据分割为游戏用数据
 *   - 隐藏最后10根K线作为"未来"数据
 *   - 计算价格变化百分比
 *   - 判断最终走势是上涨还是下跌
 * 
 * 依赖关系：
 * - 使用 types.ts 中的 CandleData 接口
 * - 被 App.tsx 调用生成游戏数据
 */

import { CandleData } from '../types';

/**
 * Generates a random walk geometric brownian motion-like series of candles.
 * @param length Total number of candles to generate
 * @returns Array of CandleData
 */
export const generateStockData = (length: number = 60): CandleData[] => {
  const data: CandleData[] = [];
  let currentPrice = 100 + Math.random() * 50;
  let volatility = 0.02; // 2% daily volatility roughly

  const now = Date.now();
  const timeStep = 60 * 60 * 1000; // 1 hour candles

  for (let i = 0; i < length; i++) {
    const changePercent = (Math.random() - 0.5) * volatility * 2;
    const open = currentPrice;
    const close = open * (1 + changePercent);
    
    // Wicks
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    // Volume
    const volume = Math.floor(Math.random() * 10000) + 1000;

    data.push({
      time: now - (length - i) * timeStep,
      open,
      high,
      low,
      close,
      volume
    });

    currentPrice = close;
  }

  return data;
};

export const splitDataForGame = (fullData: CandleData[]) => {
  const cutoff = fullData.length - 10; // Hide last 10 candles
  const visibleData = fullData.slice(0, cutoff);
  const futureData = fullData.slice(cutoff);
  
  const lastKnownPrice = visibleData[visibleData.length - 1].close;
  const finalPrice = futureData[futureData.length - 1].close;
  const percentChange = ((finalPrice - lastKnownPrice) / lastKnownPrice) * 100;

  return {
    visibleData,
    futureData,
    percentChange,
    isRise: finalPrice > lastKnownPrice
  };
};