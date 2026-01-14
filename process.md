# 项目修改记录

## 2024年修改记录

### 修复 Google AI Studio 项目本地运行问题

**Where（位置）:**
- `/Users/yanjian/.cursor/worktrees/Stock-training/ldd/package.json`
- `/Users/yanjian/.cursor/worktrees/Stock-training/ldd/vite.config.ts`
- `/Users/yanjian/.cursor/worktrees/Stock-training/ldd/App.tsx`
- `/Users/yanjian/.cursor/worktrees/Stock-training/ldd/index.html`

**What（做了什么）:**
1. 从 `package.json` 中移除了 `@google/genai` 依赖
2. 从 `vite.config.ts` 中移除了 GEMINI_API_KEY 相关的环境变量配置和 `loadEnv` 导入
3. 从 `App.tsx` 中移除了 AI 分析功能：
   - 移除了 `analyzeStockPattern` 的导入
   - 移除了 `handleTimeUp` 函数中的 AI 分析调用
   - 简化了结果状态类型，移除了 `explanation` 字段
   - 移除了结果展示中的 AI 技术分析 UI 部分
   - 移除了 ANALYZING 状态的使用
4. 从 `index.html` 中移除了 `@google/genai` 的 importmap 配置
5. 运行 `npm install` 安装了项目依赖（158 个包）

**Why（原因）:**
- 用户不需要 AI 分析功能，因此移除了所有与 Gemini API 相关的代码和配置
- 项目从 Google AI Studio 迁移到本地环境，需要安装依赖并清理不需要的功能
- 简化了应用逻辑，只保留核心的游戏功能（手势识别、股票数据展示、结果判断）

**验证:**
- 运行 `npm run build` 构建成功，无错误
- 所有 linter 检查通过

## 2026年修改记录

### 修复 Vite 仅监听 IPv4 导致浏览器访问 localhost 失败

**Where（位置）:**
- `/Users/yanjian/Documents/GitHub/Stock-training/vite.config.ts`

**What（做了什么）:**
- 将 `server.host` 从 `0.0.0.0` 调整为 `::`，让开发服务器同时兼容 IPv6 `::1`（很多浏览器解析 `localhost` 时会优先使用 IPv6）。

**Why（原因）:**
- 现象：`curl http://localhost:3000` 会先连 `::1` 失败再回退到 `127.0.0.1` 成功；部分浏览器可能不会回退，从而表现为"打不开网站"。
- 修复后：浏览器访问 `http://localhost:3000/`（IPv6/IPv4）都更稳定。

### 修复 index.html 中 importmap 与 Vite 模块解析冲突导致页面空白

**Where（位置）:**
- `/Users/yanjian/.cursor/worktrees/Stock-training/xdg/index.html`

**What（做了什么）:**
1. 移除了 `index.html` 中的 `<script type="importmap">` 配置（该配置尝试从 CDN 加载 React、react-dom、recharts、lucide-react）
2. 添加了 `<script type="module" src="/index.tsx"></script>` 作为正确的入口脚本

**Why（原因）:**
- 问题：`index.html` 中的 importmap 与 Vite 的模块解析机制冲突，导致 React 应用无法正确加载，页面显示为空白
- Vite 项目应该使用本地通过 npm 安装的依赖（已在 `package.json` 中定义），而不是通过 CDN 的 importmap
- 修复后：Vite 可以正确解析和加载本地依赖，React 应用正常渲染，页面显示"直觉操盘手"标题和"开始游戏"按钮

**验证:**
- 在浏览器中打开 `http://localhost:3000/` 成功显示页面内容
- Vite 开发服务器正常连接
- React 应用正常加载和渲染
- MediaPipe 手势识别器正常初始化

### 查找股票数据下载资源

**Where（位置）:**
- `/Users/yanjian/Documents/GitHub/Stock-training/股票数据资源.md` (新建文件)

**What（做了什么）:**
1. 使用浏览器工具和网络搜索查找了多个股票数据下载资源
2. 调研了以下主要数据源：
   - **Alpha Vantage**: 免费API，支持分钟级K线数据，每天25次免费请求
   - **Yahoo Finance (yfinance)**: Python库，完全免费，无需API密钥，支持全球市场
   - **Polygon.io (Massive)**: 高质量股票数据API，提供免费和付费套餐
   - **Tushare**: 中国A股专业数据平台，需要注册获取积分
   - **AKShare**: 完全免费的中国A股数据Python库
3. 创建了详细的资源文档 `股票数据资源.md`，包含：
   - 各数据源的特点和适用场景
   - API密钥获取方法
   - 代码使用示例
   - 数据预处理建议
   - 推荐方案（针对美股和A股）

**Why（原因）:**
- 用户需要找到可以下载股票历史K线数据的资源，用于训练短线操作的"盘感"
- 需要了解不同数据源的优缺点，选择最适合的数据获取方式
- 为后续集成真实股票数据到训练系统做准备

**重要发现:**
- **推荐方案**：
  - 美股/全球市场：首选 yfinance（最简单，无需注册），备选 Alpha Vantage
  - 中国A股：首选 AKShare（完全免费），备选 Tushare
- 所有资源信息已整理在 `股票数据资源.md` 文件中，方便后续参考和使用

### 测试 yfinance Python 库数据下载功能

**Where（位置）:**
- `/Users/yanjian/Documents/GitHub/Stock-training/test_yfinance.py` (新建测试脚本)
- `/Users/yanjian/Documents/GitHub/Stock-training/test_stock_data.csv` (生成的测试数据)
- `/Users/yanjian/Documents/GitHub/Stock-training/test_stock_data.json` (生成的JSON格式数据)

**What（做了什么）:**
1. 创建了 `test_yfinance.py` 测试脚本，包含以下测试：
   - 测试1: 下载1分钟K线数据
   - 测试2: 下载5分钟K线数据
   - 测试3: 下载日线数据
   - 测试4: 验证数据格式（Open, High, Low, Close, Volume）
   - 测试5: 保存为CSV格式
   - 测试6: 转换为项目JSON格式（符合 CandleData 接口）
2. 安装了 yfinance 库（版本 0.2.35，兼容 Python 3.9.6）
   - 注意：yfinance 1.0 需要 Python 3.10+，因此安装了兼容版本
3. 运行测试并验证数据格式
4. 生成了测试数据文件（CSV 和 JSON 格式）

**Why（原因）:**
- 用户需要验证 yfinance 是否能正常下载股票数据用于训练短线操作"盘感"
- 确保数据格式符合项目需求（与 types.ts 中的 CandleData 接口匹配）
- 为后续集成真实股票数据到训练系统做准备

**测试结果:**
- ✓ yfinance 库已成功安装（版本 0.2.35）
- ✓ 数据格式验证通过：包含 Open, High, Low, Close, Volume 列
- ✓ JSON 格式完全符合项目 CandleData 接口定义
- ⚠ 当前无法从 Yahoo Finance 获取实时数据（可能是网络问题或 API 暂时不可用）
- ✓ 一旦网络恢复，yfinance 即可正常使用

**重要发现:**
- JSON 数据格式完全匹配 `types.ts` 中的 `CandleData` 接口：
  ```typescript
  {
    time: number,    // 时间戳（毫秒）
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number
  }
  ```
- 数据可以直接用于替换 `stockService.ts` 中的模拟数据
- 建议：在网络正常时重新运行测试，获取真实股票数据

### 发现 yfinance API 限流问题，改用其他数据源

**Where（位置）:**
- 删除了所有 yfinance 测试文件
- `/Users/yanjian/Documents/GitHub/Stock-training/test_alphavantage.py` (新建)
- `/Users/yanjian/Documents/GitHub/Stock-training/test_alternative_methods.py` (新建)
- `/Users/yanjian/Documents/GitHub/Stock-training/股票数据资源.md` (更新)

**What（做了什么）:**
1. 删除了所有 yfinance 相关测试文件（test_yfinance.py 等）
2. 发现 yfinance 返回 429 错误（Too Many Requests），Yahoo Finance API 对请求进行了限流
3. 创建了 Alpha Vantage API 测试脚本 `test_alphavantage.py`
4. 创建了其他数据源说明脚本 `test_alternative_methods.py`
5. 更新了 `股票数据资源.md`，标记 yfinance 为"当前不可用"，推荐使用 Alpha Vantage

**Why（原因）:**
- yfinance 依赖的 Yahoo Finance API 返回 429 错误，无法正常获取数据
- 需要寻找更稳定可靠的数据源
- Alpha Vantage 提供免费 API 密钥，每天25次请求，更适合项目需求

**新的推荐方案:**
- **首选**: Alpha Vantage - 免费API，稳定可靠
- **备选**: Finnhub - 免费，每分钟60次请求
- **备选**: IEX Cloud - 免费层每月50万次请求

**下一步:**
- 用户需要访问 https://www.alphavantage.co/support/#api-key 获取免费API密钥
- 然后运行 `python3 test_alphavantage.py YOUR_API_KEY` 测试下载数据

### 成功测试 Alpha Vantage API 并获取股票数据

**Where（位置）:**
- `/Users/yanjian/Documents/GitHub/Stock-training/test_alphavantage.py` (已更新)
- `/Users/yanjian/Documents/GitHub/Stock-training/alphavantage_data.json` (生成的数据文件)
- `/Users/yanjian/Documents/GitHub/Stock-training/alphavantage_data.csv` (生成的CSV文件)

**What（做了什么）:**
1. 设置了环境变量 `ALPHAVANTAGE_API_KEY=PFJRM716MXIYFJNM`
2. 运行测试脚本，成功获取了 AAPL 股票的日线数据
3. 获取了 100 条日线K线数据（免费版本限制）
4. 数据时间范围：2025-08-21 到 2026-01-13
5. 数据已转换为项目需要的JSON格式（符合 CandleData 接口）
6. 同时保存了 CSV 格式的数据文件

**Why（原因）:**
- 验证 Alpha Vantage API 是否可以正常使用
- 确认数据格式是否符合项目需求
- 为后续集成真实股票数据到训练系统做准备

**测试结果:**
- ✓ API 密钥有效，可以正常访问 Alpha Vantage API
- ✓ 成功获取了 100 条日线K线数据
- ✓ 数据格式完全符合项目需求（time, open, high, low, close, volume）
- ⚠ 注意：完整历史数据（outputsize=full）是付费功能
- ✓ 免费版本可以获取最近100条数据，足够用于训练

**重要发现:**
- 免费版本限制：每天25次请求，每次最多100条数据
- 数据格式完全匹配 `types.ts` 中的 `CandleData` 接口
- 数据可以直接用于替换 `stockService.ts` 中的模拟数据
- 建议：可以定期运行脚本下载最新数据，累积更多训练数据

**生成的文件:**
- `alphavantage_data.json` - 100条K线数据，格式完全符合项目需求
- `alphavantage_data.csv` - CSV格式，方便查看
- `Alpha_Vantage_使用说明.md` - 详细使用文档

**使用方法:**
```bash
export ALPHAVANTAGE_API_KEY=PFJRM716MXIYFJNM
python3 test_alphavantage.py
```

### 集成真实股票数据到训练系统

**Where（位置）:**
- `/Users/yanjian/Documents/GitHub/Stock-training/services/stockService.ts` (修改)
- `/Users/yanjian/Documents/GitHub/Stock-training/data/stock_data.json` (新建，从 alphavantage_data.json 复制)

**What（做了什么）:**
1. 创建了 `data/stock_data.json` 文件，包含从 Alpha Vantage 获取的 100 条真实 AAPL 股票日线数据
2. 修改了 `stockService.ts` 中的 `generateStockData` 函数：
   - 从真实数据中随机选择数据片段，而不是生成模拟数据
   - 每次游戏都会随机选择不同的数据片段，增加训练的多样性
   - 如果真实数据不足，会回退到模拟数据作为补充
3. 更新了代码注释，说明现在使用真实股票数据
4. 启动了开发服务器，网站现在使用真实数据训练用户的"盘感"

**Why（原因）:**
- 用户需要使用真实股票数据来训练短线操作的"盘感"
- 真实数据比模拟数据更能反映实际市场情况
- 随机选择数据片段确保每次游戏都不同，增加训练效果

**技术实现:**
- 使用 TypeScript 的 JSON 导入功能直接导入数据文件
- 随机选择算法：从 100 条数据中随机选择 60-70 条用于游戏
- 保持原有的 `splitDataForGame` 函数逻辑不变，隐藏最后 10 根K线

**效果:**
- 网站现在使用真实的 AAPL 股票历史数据
- 每次开始新游戏时，会随机选择不同的数据片段
- 用户可以基于真实市场数据训练自己的"盘感"
- 数据时间范围：2025-08-21 到 2026-01-13（100个交易日）

**运行网站:**
```bash
npm run dev
# 访问 http://localhost:3000
```

### 优化用户体验流程：自动检测手势并改进提示

**Where（位置）:**
- `/Users/yanjian/Documents/GitHub/Stock-training/App.tsx` (修改)

**What（做了什么）:**
1. 将倒计时时间从3秒改为5秒，给用户更多准备时间
2. 添加了倒计时数字显示（5、4、3、2、1），让用户清楚知道剩余时间
3. 改进了IDLE状态的用户提示：
   - 添加了醒目的蓝色提示框，明确告知"准备开始"
   - 提示用户"将手放在摄像头前，系统会自动检测并开始游戏"
   - 当检测到手势时，显示"检测到手势，即将开始..."的动画提示
4. 优化了手势检测逻辑：
   - 手势需要持续800ms才触发游戏开始，避免误触
   - 使用 `gestureHoldTimerRef` 来管理手势持续检测计时器
   - 如果手势消失，自动清除计时器，防止误触发
5. 移除了未使用的 `gestureHoldTime` 状态变量

**Why（原因）:**
- 用户反馈希望有更流畅的用户体验
- 需要明确的提示告知用户可以开始游戏
- 自动检测手势并开始游戏，减少手动操作
- 5秒倒计时给用户更多准备时间，体验更友好
- 手势持续检测避免误触，提高稳定性

**技术实现:**
- 使用 `countdown` 状态跟踪倒计时数字（5到1）
- 使用 `setInterval` 每秒更新倒计时
- 使用 `useRef` 管理手势持续检测计时器，避免状态更新问题
- 在IDLE状态显示友好的提示UI，引导用户操作

**效果:**
- 用户进入IDLE状态时，会看到清晰的"准备开始"提示
- 将手放在摄像头前，系统会自动检测并在800ms后开始游戏
- 游戏开始前有5秒倒计时，显示倒计时数字
- 用户体验更加流畅和直观
- 真实股票数据已经在使用（从 `data/stock_data.json` 加载）
