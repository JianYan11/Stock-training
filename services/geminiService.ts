/**
 * 文件功能：Gemini AI 技术分析服务
 * 
 * 主要职责：
 * - 调用 Google Gemini AI API 进行股票K线形态分析
 * - 将K线数据转换为AI可理解的格式
 * - 生成中文技术分析报告
 * - 处理API调用错误和异常情况
 * 
 * 关键功能：
 * - analyzeStockPattern: 分析K线数据并返回技术分析结果
 *   - 简化K线数据格式以节省API token
 *   - 构建中文提示词，要求AI识别关键形态（吞没、十字星、趋势线突破等）
 *   - 判断短期市场情绪（多头/空头）
 *   - 使用 gemini-3-flash-preview 模型进行快速分析
 *   - 限制输出长度（maxOutputTokens: 100）保持简洁
 * 
 * 依赖关系：
 * - 依赖 @google/genai 库调用 Gemini API
 * - 需要环境变量 GEMINI_API_KEY（通过 vite.config.ts 注入）
 * - 使用 types.ts 中的 CandleData 接口
 * - 被 App.tsx 调用进行结果分析
 * 
 * 安全提示：
 * - 生产环境不应在客户端暴露 API Key
 * - 当前实现仅用于演示/原型开发
 */

import { GoogleGenAI, Type } from "@google/genai";
import { CandleData } from "../types";

export const analyzeStockPattern = async (data: CandleData[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key missing. Cannot generate analysis.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Simplify data to save tokens and focus on shape
  const simpleData = data.map((d, i) => ({
    id: i,
    o: d.open.toFixed(2),
    h: d.high.toFixed(2),
    l: d.low.toFixed(2),
    c: d.close.toFixed(2),
  }));

  const prompt = `
    作为一名资深的短线技术分析师，请根据提供的K线数据（OHLC）分析价格走势。
    
    数据如下 (JSON):
    ${JSON.stringify(simpleData)}
    
    请用中文简要回答（不超过50字）：
    1. 识别关键形态（如吞没、十字星、趋势线突破等）。
    2. 判断短期情绪是多头（看涨）还是空头（看跌）。
    
    不要给出投资建议，只做技术形态分析。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'text/plain',
        maxOutputTokens: 100,
        temperature: 0.7
      }
    });

    return response.text || "无法生成分析。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "分析服务暂时不可用。";
  }
};