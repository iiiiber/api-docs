---
id: kylin-faq-sysbench
title: Sysbench 在银河麒麟上的安装与基本使用
cat: tech-2
date: 2026-05-29
level: 入门
tags: ["麒麟", "Sysbench", "基准测试", "CPU", "MySQL"]
---

## 使用场景

用于评估 CPU、内存、磁盘 I/O、文件 IO、以及 MySQL/PostgreSQL 等数据库性能。

## 操作步骤

### 步骤 1：安装

```
sudo apt-get install sysbench
```

### 步骤 2：CPU 基准测试

```
sysbench cpu --cpu-max-prime=20000 --time=10 run
```

### 步骤 3：内存基准测试

```
sysbench memory --memory-block-size=1M --memory-total-size=10G --time=10 run
```

### 步骤 4：磁盘 I/O 基准测试

```
sysbench fileio --file-total-size=2G --file-num=4 prepare
sysbench fileio --file-total-size=2G --file-num=4 --file-test-mode=rndrw --time=60 run
sysbench fileio --file-num=4 cleanup
```

## 提示

- CPU 测试关注 events per second，数值越高性能越好
- 内存测试关注 transferred 吞吐量
- 磁盘 I/O 测试建议使用独立分区
- 银河麒麟 ARM 服务器建议从源码编译
