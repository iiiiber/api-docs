---
id: kylin-faq-stressng
title: stress-ng 在银河麒麟上的安装与基本使用
cat: tech-2
date: 2026-05-29
level: 入门
tags: ["麒麟", "stress-ng", "压力测试", "稳定性"]
---

## 使用场景

系统压力测试工具，可对 CPU、内存、磁盘、网络等施加高负载，用于测试系统稳定性和散热能力。

## 操作步骤

### 步骤 1：安装

```
sudo apt-get install stress-ng
stress-ng --version
```

### 步骤 2：CPU 压力测试

```
stress-ng --cpu 4 --cpu-method=matrixprod --timeout=60s
```

### 步骤 3：内存压力测试

```
stress-ng --mem 2 --mem-method=allot --timeout=60s
```

### 步骤 4：综合压力测试

```
stress-ng --cpu 4 --mem 2 --io 2 --timeout=120s
```

## 提示

- --timeout 指定测试时长
- --metrics 显示详细指标
- --tz 获取 CPU 温度数据
- 建议逐步增加负载，观察温度变化
- 测试完成后 dmesg 检查无硬件错误

## 过热降频排查

**问题**：压力测试导致系统过热降频
**解决**：

- 分阶段施加负载：先用 --cpu 2 --timeout 30s
- 监控温度：watch -n 1 "cat /sys/class/thermal/thermal_zone*/temp"
- 添加 --throttle 选项限制 CPU 功耗
