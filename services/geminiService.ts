import { GoogleGenAI, Type } from "@google/genai";
import { CandleData } from "../types";

// In a real app, never expose API keys on the client. 
// Since this is a demo/prototype request, we rely on the process.env.API_KEY injection pattern provided in instructions.

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