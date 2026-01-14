#!/usr/bin/env python3
"""
尝试其他方法获取股票数据
包括：直接访问公开API、使用其他数据源等
"""

import sys
import json
import requests
from datetime import datetime, timedelta

def test_method_1_polygon_free():
    """方法1: 尝试 Polygon.io 的免费端点（如果有）"""
    print("="*60)
    print("【方法1】尝试 Polygon.io 免费数据")
    print("="*60)
    print("⚠ Polygon.io 需要 API 密钥，免费版本有限制")
    print("  访问: https://polygon.io/ 注册获取密钥")
    return False

def test_method_2_finnhub():
    """方法2: 尝试 Finnhub API（有免费额度）"""
    print("\n" + "="*60)
    print("【方法2】尝试 Finnhub API")
    print("="*60)
    print("Finnhub 提供免费 API（每分钟60次请求）")
    print("注册: https://finnhub.io/register")
    print("\n示例代码:")
    print("""
import requests

api_key = "YOUR_FINNHUB_API_KEY"
url = f"https://finnhub.io/api/v1/quote?symbol=AAPL&token={api_key}"
response = requests.get(url)
data = response.json()
print(data)
    """)
    return False

def test_method_3_iex_cloud():
    """方法3: IEX Cloud（有免费层）"""
    print("\n" + "="*60)
    print("【方法3】IEX Cloud")
    print("="*60)
    print("IEX Cloud 提供免费层（每月50万次请求）")
    print("注册: https://iexcloud.io/cloud-login#/register/")
    return False

def test_method_4_web_scraping():
    """方法4: 网页爬取（不推荐，但可以作为备选）"""
    print("\n" + "="*60)
    print("【方法4】网页爬取（不推荐）")
    print("="*60)
    print("⚠ 网页爬取可能违反网站服务条款")
    print("⚠ 网站结构变化会导致爬取失败")
    print("⚠ 建议使用官方 API")
    return False

def test_method_5_local_data():
    """方法5: 使用本地数据文件或已有数据集"""
    print("\n" + "="*60)
    print("【方法5】使用本地数据文件")
    print("="*60)
    print("可以:")
    print("1. 从其他数据源下载 CSV/JSON 文件")
    print("2. 使用已有的历史数据集")
    print("3. 从量化交易平台导出数据")
    print("\n推荐的数据集来源:")
    print("- Kaggle: https://www.kaggle.com/datasets")
    print("- Quandl (现为 Nasdaq Data Link)")
    print("- 各大交易所官网的历史数据下载")
    return False

def main():
    print("\n" + "="*60)
    print("其他股票数据获取方法")
    print("="*60)
    
    methods = [
        test_method_1_polygon_free,
        test_method_2_finnhub,
        test_method_3_iex_cloud,
        test_method_4_web_scraping,
        test_method_5_local_data,
    ]
    
    for method in methods:
        method()
    
    print("\n" + "="*60)
    print("推荐方案:")
    print("="*60)
    print("1. 【首选】Alpha Vantage - 免费，每天25次请求，稳定")
    print("2. 【备选】Finnhub - 免费，每分钟60次请求")
    print("3. 【备选】IEX Cloud - 免费层每月50万次请求")
    print("4. 【备选】使用本地数据集 - 无需API，但需要手动下载")
    print("\n建议:")
    print("- 先尝试 Alpha Vantage（最简单）")
    print("- 如果需要更多请求，考虑 Finnhub 或 IEX Cloud")
    print("- 对于训练数据，可以一次性下载大量历史数据保存为本地文件")
    print("="*60)

if __name__ == "__main__":
    main()
