#!/usr/bin/env python3
"""
测试 Alpha Vantage API 下载股票数据
需要先获取免费的 API 密钥: https://www.alphavantage.co/support/#api-key
"""

import sys
import json
import requests
from datetime import datetime

def test_alphavantage(api_key=None):
    """测试 Alpha Vantage API"""
    print("="*60)
    print("测试 Alpha Vantage API")
    print("="*60)
    
    # 如果没有提供 API 密钥，提示用户
    if not api_key:
        print("\n⚠ 需要 API 密钥才能使用 Alpha Vantage")
        print("\n获取免费 API 密钥的步骤:")
        print("1. 访问: https://www.alphavantage.co/support/#api-key")
        print("2. 填写表单（邮箱、组织等）")
        print("3. 免费获取 API 密钥（每天25次请求）")
        print("\n获取密钥后，运行:")
        print("  python3 test_alphavantage.py YOUR_API_KEY")
        print("\n或者设置环境变量:")
        print("  export ALPHAVANTAGE_API_KEY=YOUR_API_KEY")
        print("  python3 test_alphavantage.py")
        return False
    
    # 测试1: 获取日线数据（免费功能）
    print("\n【测试1】下载 AAPL 的日线数据...")
    try:
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": "AAPL",
            "apikey": api_key,
            "outputsize": "full"  # 获取完整历史数据
        }
        
        response = requests.get(url, params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            # 检查是否有错误
            if "Error Message" in data:
                print(f"✗ API 错误: {data['Error Message']}")
                return False
            
            if "Note" in data:
                print(f"⚠ 注意: {data['Note']}")
                print("  可能是请求频率限制，请稍后重试")
                return False
            
            if "Information" in data:
                print(f"⚠ 信息: {data['Information']}")
                # 如果是付费功能提示，继续尝试其他方法
                if "premium" in data["Information"].lower():
                    print("  这是付费功能，尝试使用免费功能...")
                    return None
            
            # 检查数据
            if "Time Series (Daily)" in data:
                time_series = data["Time Series (Daily)"]
                print(f"✓ 成功！获取了 {len(time_series)} 条日线数据")
                
                # 显示前几条数据
                print("\n前5条数据:")
                count = 0
                for timestamp, values in sorted(time_series.items(), reverse=True)[:5]:
                    print(f"  {timestamp}:")
                    print(f"    开盘: {values['1. open']}")
                    print(f"    最高: {values['2. high']}")
                    print(f"    最低: {values['3. low']}")
                    print(f"    收盘: {values['4. close']}")
                    print(f"    成交量: {values['5. volume']}")
                    count += 1
                
                # 转换为项目需要的格式
                json_data = []
                for timestamp, values in sorted(time_series.items()):
                    # 将时间戳转换为毫秒
                    dt = datetime.strptime(timestamp, "%Y-%m-%d")
                    timestamp_ms = int(dt.timestamp() * 1000)
                    
                    json_data.append({
                        "time": timestamp_ms,
                        "open": float(values['1. open']),
                        "high": float(values['2. high']),
                        "low": float(values['3. low']),
                        "close": float(values['4. close']),
                        "volume": int(values['5. volume'])
                    })
                
                # 保存为 JSON
                with open("alphavantage_data.json", 'w', encoding='utf-8') as f:
                    json.dump(json_data, f, indent=2, ensure_ascii=False)
                
                print(f"\n✓ 数据已保存到: alphavantage_data.json")
                print(f"  包含 {len(json_data)} 条K线数据")
                print(f"  时间范围: {json_data[0]['time']} 到 {json_data[-1]['time']}")
                
                return True
            else:
                print("✗ 响应中没有找到时间序列数据")
                print(f"响应内容: {json.dumps(data, indent=2)[:500]}")
                return False
        else:
            print(f"✗ HTTP 错误: {response.status_code}")
            print(f"响应: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"✗ 错误: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_daily_data(api_key):
    """测试日线数据（免费版本，compact模式）"""
    print("\n【测试2】下载 AAPL 的日线数据（免费版本）...")
    try:
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": "AAPL",
            "apikey": api_key,
            "outputsize": "compact"  # 免费版本：最近100条数据
        }
        
        response = requests.get(url, params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            if "Error Message" in data:
                print(f"✗ API 错误: {data['Error Message']}")
                return False
            
            if "Note" in data:
                print(f"⚠ 注意: {data['Note']}")
                return False
            
            if "Time Series (Daily)" in data:
                time_series = data["Time Series (Daily)"]
                print(f"✓ 成功！获取了 {len(time_series)} 条日线数据")
                
                # 显示前几条
                print("\n前5条数据:")
                for timestamp, values in sorted(time_series.items(), reverse=True)[:5]:
                    print(f"  {timestamp}: 开={values['1. open']}, 高={values['2. high']}, "
                          f"低={values['3. low']}, 收={values['4. close']}, 量={values['5. volume']}")
                
                # 转换为项目需要的格式并保存
                json_data = []
                for timestamp, values in sorted(time_series.items()):
                    # 将时间戳转换为毫秒
                    dt = datetime.strptime(timestamp, "%Y-%m-%d")
                    timestamp_ms = int(dt.timestamp() * 1000)
                    
                    json_data.append({
                        "time": timestamp_ms,
                        "open": float(values['1. open']),
                        "high": float(values['2. high']),
                        "low": float(values['3. low']),
                        "close": float(values['4. close']),
                        "volume": int(values['5. volume'])
                    })
                
                # 保存为 JSON
                with open("alphavantage_data.json", 'w', encoding='utf-8') as f:
                    json.dump(json_data, f, indent=2, ensure_ascii=False)
                
                print(f"\n✓ 数据已保存到: alphavantage_data.json")
                print(f"  包含 {len(json_data)} 条K线数据")
                print(f"  时间范围: {datetime.fromtimestamp(json_data[0]['time']/1000).strftime('%Y-%m-%d')} 到 {datetime.fromtimestamp(json_data[-1]['time']/1000).strftime('%Y-%m-%d')}")
                
                # 也保存为 CSV
                import csv
                with open("alphavantage_data.csv", 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow(['时间', '开盘', '最高', '最低', '收盘', '成交量'])
                    for item in json_data:
                        dt_str = datetime.fromtimestamp(item['time']/1000).strftime('%Y-%m-%d')
                        writer.writerow([dt_str, item['open'], item['high'], item['low'], item['close'], item['volume']])
                
                print(f"✓ CSV 数据已保存到: alphavantage_data.csv")
                
                return True
            else:
                print("✗ 响应中没有找到时间序列数据")
                print(f"响应内容: {json.dumps(data, indent=2)[:500]}")
                return False
        else:
            print(f"✗ HTTP 错误: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ 错误: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # 从命令行参数或环境变量获取 API 密钥
    api_key = None
    
    if len(sys.argv) > 1:
        api_key = sys.argv[1]
    else:
        import os
        api_key = os.environ.get("ALPHAVANTAGE_API_KEY")
    
    if api_key:
        result = test_alphavantage(api_key)
        if result is True:
            print("\n" + "="*60)
            print("✓ Alpha Vantage API 测试成功！")
            print("="*60)
        elif result is None:
            # 如果日线数据也失败，尝试其他免费功能
            print("\n尝试其他免费功能...")
            test_daily_data(api_key)
        else:
            print("\n" + "="*60)
            print("✗ 测试失败，请检查 API 密钥是否正确")
            print("="*60)
    else:
        test_alphavantage()  # 显示获取密钥的说明
        sys.exit(1)
