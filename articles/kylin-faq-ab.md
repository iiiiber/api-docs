---
id: kylin-faq-ab
title: ab (ApacheBench) 在银河麒麟上的安装与基本使用
cat: tech-2
date: 2026-05-29
level: 入门
tags: ["麒麟", "ab", "压测", "HTTP", "ApacheBench"]
---

## 使用场景

ApacheBench 性能测试工具，用于测试 HTTP 服务器吞吐量和对并发请求的处理能力。

## 操作步骤

### 步骤 1：安装

```
sudo apt-get install apache2-utils
ab -V
```

### 步骤 2：基础并发测试

```
ab -n 10000 -c 100 http://localhost/index.html
```

### 步骤 3：POST 请求测试

```
ab -n 1000 -c 50 -p data.json -T application/json http://localhost/api
```

### 步骤 4：使用 Cookies

```
ab -n 1000 -c 50 -C "session=abc123" http://localhost/profile
```

### 步骤 5：KeepAlive 模式

```
ab -k -n 10000 -c 500 http://localhost/
```

## 提示

- 关注 Requests per second（QPS）和 Time per request
- -k 参数启用 HTTP KeepAlive
- 动态请求建议用 wrk 或 JMeter 替代 ab

## socket: Too many open files 排查

**问题**：ab 测试报错「socket: Too many open files」
**原因**：

- 系统文件描述符上限过低（默认 ulimit -n = 1024）
- HTTP 短连接过多导致 TIME_WAIT 积压
- 防火墙连接跟踪表打满
**解决**：

- 增大文件描述符：ulimit -n 65536，并修改 /etc/security/limits.conf
- 启用 KeepAlive：ab -k -n 10000 -c 500 http://localhost/
- 调整内核：sysctl -w net.ipv4.tcp_tw_reuse=1 + net.netfilter.nf_conntrack_max=1048576
