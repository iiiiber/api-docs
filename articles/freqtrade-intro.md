---
id: freqtrade-intro
title: freqtrade 量化交易框架入门
cat: ai-3
date: 2026-06-02
level: 入门
tags: ["量化交易", "freqtrade", "加密货币", "Python", "ccxt"]
---

## 为什么选 freqtrade

freqtrade 是 GitHub 上 35k+ Star 的开源加密货币量化框架，特点：

- Python 编写，策略用 Python 即可
- 支持回测、模拟、实盘三种模式
- 插件化设计，扩展性强
- 配套 Telegram 机器人
- 完全免费开源

## 安装

```
git clone https://github.com/freqtrade/freqtrade.git
cd freqtrade
./setup.sh -i
```

## 第一个策略

在 user_data/strategies/ 下创建 MyFirstStrategy.py：

```
class MyFirstStrategy(IStrategy):
    INTERFACE_VERSION = 3
    minimal_roi = {"60": 0.01, "30": 0.02, "0": 0.04}
    stoploss = -0.10
    timeframe = '5m'

    def populate_indicators(self, dataframe, metadata):
        dataframe['sma_fast'] = ta.SMA(dataframe, timeperiod=10)
        dataframe['sma_slow'] = ta.SMA(dataframe, timeperiod=30)
        return dataframe

    def populate_entry_trend(self, dataframe, metadata):
        dataframe.loc[
            (dataframe['sma_fast'] > dataframe['sma_slow']),
            'enter_long'] = 1
        return dataframe
```

## 回测命令

```
freqtrade backtesting \
  --strategy MyFirstStrategy \
  --timerange 20240101-20251231 \
  --timeframe 5m
```

## 实盘前必须看

- **资金风险**：合约爆仓可能亏光本金
- **API Key**：用只读+交易权限，别给提现权限
- **服务器**：VPS 7×24 运行，断电 = 失控
- **测试网**：先用 testnet 跑 1 个月再考虑实盘

## 关联项目

freqtrade 依赖 ccxt 库对接 100+ 交易所。如果做股票/A 股，看 vnpy。
