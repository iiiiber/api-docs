---
id: linux-dd
title: Linux dd 命令详解
cat: tech-1
date: 2026-05-29
level: 中级
tags: ["Linux", "dd", "磁盘", "命令行"]
---

## 概述

dd 是 Linux 下最底层的磁盘数据复制工具，作用于字节流层面，可直接读写设备的原始数据而不经过文件系统。这使得 dd 既能用于数据复制，也能用于数据填充、磁盘基准测试、启动盘制作、数据粉碎等场景。

## 基本语法

```
dd if=源文件 of=目标文件 [选项]
```

dd 没有标准输入输出，所有操作通过参数传递。if 和 of 是最核心的两个参数。

### 参数速查

| 参数 | 含义 |
| --- | --- |
| `if=文件` | 输入源 |
| `of=文件` | 输出目标 |
| `bs=bytes` | 每次读写字节数 |
| `count=n` | 块数量 |
| `iflag=direct` | 绕过缓存读 |
| `oflag=direct` | 绕过缓存写 |
| `conv=fsync` | 强制落盘 |

## 实战：磁盘读写测速

### 测顺序写入

```
dd if=/dev/zero of=/tmp/test bs=1M count=1024 oflag=direct
```

### 测顺序读取

```
dd if=/tmp/test of=/dev/null bs=1M iflag=direct
```

## 常见错误

- **权限不足**：操作 /dev/sd* 需要 root 权限
- **目标路径错误**：/dev/sdb 是整盘，/dev/sdb1 是第一个分区
- **conv=fsync**：制作启动盘时必须加，确保数据真正落盘

## 总结

dd 是 Linux 最强大的底层工具之一，掌握 bs/count/skip/seek 这几个参数就能完成大多数日常任务。
