---
id: kylin-faq-jmeter
title: JMeter 在银河麒麟上的安装与基本使用
cat: tech-2
date: 2026-05-29
level: 入门
tags: ["麒麟", "JMeter", "性能测试", "压测", "Java"]
---

## 使用场景

需要进行性能测试、压力测试、负载测试时，使用 JMeter 对 Web 应用、API 接口、数据库等进行测试。

## 操作步骤

### 步骤 1：安装 JDK 环境

JMeter 基于 Java 开发，需先安装 JDK。

```
sudo apt-get install openjdk-11-jdk
java -version
```

### 步骤 2：下载 JMeter

```
wget https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-5.5.tgz
tar -xzf apache-jmeter-5.5.tgz -C /opt/
```

### 步骤 3：配置环境变量

```
export JMETER_HOME=/opt/jmeter
export PATH=$JMETER_HOME/bin:$PATH
source ~/.bashrc
```

### 步骤 4：启动图形界面

```
jmeter
```

### 步骤 5：命令行无界面模式（推荐压测用）

```
jmeter -n -t testplan.jmx -l result.jtl -e -o output
```

- -n 无界面模式
- -t 指定测试计划
- -l 输出结果
- -e 生成 HTML 报告

## 提示

- JMeter 5.x 要求 JDK 8 以上，银河麒麟 V10SP2/3 建议 OpenJDK 11
- 内存不足时修改 bin/jmeter 启动脚本调整 HEAP 参数
- 聚合报告关注：Throughput、Avg Response Time、Error%
- 压测时禁用「查看结果树」监听器，避免内存溢出
