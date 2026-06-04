---
id: kylin-faq-fio
title: fio 在银河麒麟上的安装与基本使用
cat: tech-2
date: 2026-05-29
level: 入门
tags: ["麒麟", "fio", "磁盘", "I/O", "性能测试"]
---

## 使用场景

用于测试磁盘 I/O 性能，支持顺序读写、随机读写、混合读写等多种测试模式，是评估存储性能的标准工具。

## 操作步骤

### 步骤 1：安装

```
sudo apt-get install fio
fio --version
```

### 步骤 2：顺序读测试

```
fio --name=seqread --filename=/tmp/testfile --size=1G --rw=read --bs=1m --direct=1 --numjobs=4 --runtime=60
```

### 步骤 3：随机写测试

```
fio --name=randwrite --filename=/tmp/testfile --size=1G --rw=randwrite --bs=4k --direct=1 --ioengine=libaio --iodepth=32
```

### 步骤 4：混合读写测试

```
fio --name=mix --filename=/tmp/testfile --size=1G --rw=rw --bs=4k --rwmixread=70 --direct=1 --runtime=60
```

## 参数速查

| 参数 | 含义 |
| --- | --- |
| --rw=read/write | 顺序读写 |
| --rw=randread/randwrite | 随机读写 |
| --bs=4k/1m | 块大小 |
| --direct=1 | O_DIRECT 绕过缓存 |
| --iodepth=32 | 队列深度（NVMe/SSD 建议 32+） |
| --ioengine=libaio | 异步 I/O 引擎（推荐） |

## 提示

- SSD 建议 libaio + --iodepth=32+
- HDD 建议 sync 或 psync 引擎
- 测试前确认测试分区无重要数据
