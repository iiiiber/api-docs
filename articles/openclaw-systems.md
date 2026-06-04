---
id: openclaw-systems
title: OpenClaw 系统架构与已部署项目
cat: tech-3
date: 2026-05-24
level: 中级
tags: ["OpenClaw", "Agent", "Cron", "架构"]
---

## 系统概述

OpenClaw 是鹏飞自建的多 Agent 自动化系统，基于 2026.4.2 版本，运行在 VM-4-3-ubuntu 主机上。

## Agent 列表（9 个）

| # | Agent | 说明 |
| --- | --- | --- |
| 1 | main | 主 Agent |
| 2 | creator | 创作 |
| 3 | canmou | 蝉亩（订单抓取） |
| 4 | yunving | 运营 |
| 5 | jinhua | 金华 |
| 6 | jiaoyi | 交易 |
| 7 | shequ | 社区 |
| 8 | kylin | 麒麟（适配测试） |
| 9 | ceo | CEO（战略） |

## cron 任务体系

采用「任务队列 + 心跳 Agent」混合模式：

- cron 任务只做轻量级调度（< 5 秒）
- 写入任务到 /tmp/openclaw-task-queue.json
- 系统 cron 每分钟运行 task-queue-worker.js 处理队列
- worker 调用外部 API（飞书/七牛/WordPress）直接发消息

### 9 个改造任务

- 西瓜猪订单推送（10:00, 18:00）
- 每日热榜推送（20:00）
- 鹏飞晚间复盘提醒（21:30）
- 每日简报推送（22:00）
- 每日反思文章发布（23:00）
- OpenClaw 每日备份（02:00）
- 每日对话记录（03:00）
- AI 出海情报推送（06:00）
- 支付宝基金操作提醒（14:00）

## 已部署项目

### 主业（麒麟适配测试）

- 每月上传问题到内部知识库（kb.kylinos.cn）
- 每月月度考试、每周周报

### 个人网站矩阵（*.imoons.cn）

| 域名 | 用途 | 部署 |
| --- | --- | --- |
| api.imoons.cn | Big Admin 大后台 + 多个前端 | 宝塔 43.139.124.235 |
| tools.imoons.cn | 工具集合 | 宝塔 42.192.112.148 |
| page.imoons.cn | 个人工具集合 | Cloudflare |
| blog.imoons.cn | Typecho 博客 | 宝塔 |
| read.imoons.cn | WordPress 反思文章 | 宝塔 |
| funds.imoons.cn | 基金分析 | Cloudflare |

## 技术栈

- Node.js v22.22.2 + Express
- Vue 3 + Vite + TypeScript
- PostgreSQL（云）+ MySQL（本地）
- Prisma
