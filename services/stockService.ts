/**
 * 文件功能：股票数据生成服务
 * 
 * 主要职责：
 * - 使用真实股票K线数据用于游戏训练（来自 Alpha Vantage API）
 * - 从真实数据中随机选择片段，增加训练的多样性
 * - 将完整数据分割为历史可见数据和未来隐藏数据
 * - 计算价格变化百分比和涨跌方向
 * 
 * 关键功能：
 * - generateStockData: 从真实数据中随机选择指定长度的K线数据序列
 *   - 使用 Alpha Vantage 获取的真实 AAPL 股票数据
 *   - 随机选择数据片段，确保每次游戏都不同
 *   - 如果真实数据不足，回退到模拟数据
 * - splitDataForGame: 将完整数据分割为游戏用数据
 *   - 隐藏最后10根K线作为"未来"数据
 *   - 计算价格变化百分比
 *   - 判断最终走势是上涨还是下跌
 * 
 * 依赖关系：
 * - 使用 types.ts 中的 CandleData 接口
 * - 被 App.tsx 调用生成游戏数据
 * - 使用 data/stock_data.json 中的真实股票数据
 */

import { CandleData } from '../types';

// 缓存真实股票数据
let cachedRealData: CandleData[] | null = null;

/**
 * 加载真实股票数据
 */
async function loadRealStockData(): Promise<CandleData[]> {
  if (cachedRealData) {
    return cachedRealData;
  }
  
  try {
    const response = await fetch('/data/stock_data.json');
    if (!response.ok) {
      throw new Error('Failed to load stock data');
    }
    cachedRealData = await response.json() as CandleData[];
    return cachedRealData;
  } catch (error) {
    console.warn('Failed to load real stock data, using simulated data:', error);
    return [];
  }
}

/**
 * 从真实股票数据中随机选择指定长度的K线数据
 * @param length 需要的K线数量
 * @returns Array of CandleData
 */
export const generateStockData = async (length: number = 60): Promise<CandleData[]> => {
  // 使用真实股票数据
  const realData = await loadRealStockData();
  
  // 如果真实数据足够，随机选择一段
  if (realData.length >= length + 10) {
    // 随机选择起始位置，确保有足够的未来数据
    const maxStart = realData.length - length - 10;
    const startIndex = Math.floor(Math.random() * maxStart);
    
    // 选择指定长度的数据
    const selectedData = realData.slice(startIndex, startIndex + length + 10);
    
    return selectedData;
  }
  
  // 如果真实数据不足，使用模拟数据作为补充
  console.warn('真实数据不足，使用模拟数据补充');
  const data: CandleData[] = [];
  let currentPrice = realData.length > 0 ? realData[realData.length - 1].close : 100;
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