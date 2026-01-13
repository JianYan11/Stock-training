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