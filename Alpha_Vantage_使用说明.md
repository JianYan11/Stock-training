# Alpha Vantage API 使用说明

## ✅ 测试结果

**API 密钥**: `PFJRM716MXIYFJNM`  
**状态**: ✅ 正常工作  
**数据获取**: ✅ 成功

## 📊 获取的数据

- **股票代码**: AAPL (苹果)
- **数据量**: 100 条日线K线数据
- **时间范围**: 2025-08-21 到 2026-01-13
- **数据格式**: 完全符合项目 `CandleData` 接口要求

## 📁 生成的文件

1. **alphavantage_data.json** - JSON格式，可直接用于项目
2. **alphavantage_data.csv** - CSV格式，方便查看和编辑

## 🔧 使用方法

### 设置环境变量

```bash
export ALPHAVANTAGE_API_KEY=PFJRM716MXIYFJNM
```

### 运行测试脚本

```bash
python3 test_alphavantage.py
```

或者直接传入API密钥：

```bash
python3 test_alphavantage.py PFJRM716MXIYFJNM
```

## 📋 数据格式

生成的JSON数据格式完全符合 `types.ts` 中的 `CandleData` 接口：

```typescript
{
  time: number;    // 时间戳（毫秒）
  open: number;    // 开盘价
  high: number;    // 最高价
  low: number;     // 最低价
  close: number;   // 收盘价
  volume: number;  // 成交量
}
```

## ⚠️ 注意事项

1. **免费版本限制**:
   - 每天最多 25 次 API 请求
   - 每次请求最多返回 100 条数据（使用 `outputsize=compact`）
   - 完整历史数据（`outputsize=full`）需要付费

2. **请求频率**:
   - 建议控制请求频率，避免超过每日限制
   - 可以一次性下载多个股票的数据保存为本地文件

3. **数据更新**:
   - 建议定期运行脚本更新数据
   - 可以累积多个时间段的数据用于训练

## 🚀 下一步

1. **集成到项目**:
   - 可以将 `alphavantage_data.json` 中的数据用于替换 `stockService.ts` 中的模拟数据
   - 或者创建新的服务函数从 Alpha Vantage API 实时获取数据

2. **下载更多数据**:
   - 可以修改脚本下载不同股票的数据
   - 可以定期运行脚本累积更多历史数据

3. **优化数据获取**:
   - 考虑缓存机制，避免重复请求
   - 可以批量下载多个股票的数据

## 📝 示例代码

### 下载不同股票的数据

修改 `test_alphavantage.py` 中的股票代码：

```python
params = {
    "function": "TIME_SERIES_DAILY",
    "symbol": "MSFT",  # 改为其他股票代码
    "apikey": api_key,
    "outputsize": "compact"
}
```

### 在项目中使用数据

```typescript
// 在 stockService.ts 中
import stockData from '../alphavantage_data.json';

export const generateStockData = (): CandleData[] => {
  // 使用真实数据
  return stockData as CandleData[];
};
```

## 🔗 相关资源

- Alpha Vantage 官网: https://www.alphavantage.co/
- API 文档: https://www.alphavantage.co/documentation/
- 获取 API 密钥: https://www.alphavantage.co/support/#api-key
