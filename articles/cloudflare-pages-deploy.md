---
id: cloudflare-pages-deploy
title: Cloudflare Pages + GitHub 自动化部署
cat: tech-4
date: 2026-05-29
level: 中级
tags: ["Cloudflare", "GitHub", "CI/CD", "DevOps"]
---

## 背景

本文记录如何使用纯静态网站配合 Cloudflare Pages + GitHub webhook 实现代码 push 后自动构建部署到 CDN，整个过程无需登录 Cloudflare Dashboard。

## 架构

整体链路：本地代码 → GitHub 仓库 → GitHub webhook → Cloudflare Pages → CDN 边缘节点。触发方式为在 GitHub 仓库添加 Cloudflare Pages 专用的 webhook，当有 push 或 PR 事件时自动触发构建部署。

## 前置条件

- Cloudflare 账号及 API Token（有 pages 相关权限）
- GitHub 账号及 Personal Access Token（有 repo 和 hooks 权限）
- 目标仓库（可新建）

## Step 1：创建 GitHub 仓库

```
curl -X POST https://api.github.com/user/repos \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"name":"your-repo","description":"描述","private":false}'
```

## Step 2：创建 Cloudflare Pages 项目

```
curl -X POST https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/pages/projects \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "project-name",
    "subdomain": "pages.dev",
    "production_branch": "main",
    "source": {
      "type": "github",
      "config": {
        "owner": "github-username",
        "repo_name": "repo-name",
        "production_branch": "main"
      }
    }
  }'
```

## Step 3：添加 GitHub Webhook

```
WEBHOOK_URL="https://pages.cloudflare.com/api/v1/accounts/ACCOUNT_ID/pages/projects/PROJECT_NAME/github"
curl -X POST https://api.github.com/repos/USER/REPO/hooks \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d "{
    \"name\": \"web\",
    \"active\": true,
    \"events\": [\"push\", \"pull_request\"],
    \"config\": {
        \"url\": \"${WEBHOOK_URL}\",
        \"content_type\": \"json\"
    }
  }"
```

## Step 4：本地开发流程

```
git clone https://github.com/USER/repo.git
cd repo
# 编辑代码
git add .
git commit -m 'update'
git push origin main
# 等待自动部署完成，访问 https://project.pages.dev
```

## 注意事项

- 直接通过 API 创建项目时 source 字段配置与通过 GitHub App 安装效果相同
- wrangler deploy 是 ad_hoc 方式，不会自动设为 production，GitHub push 触发的才是 production
- 如果 GitHub App 未安装，webhook 方式仍能正常工作
- 部署完成后可通过 curl 验证：curl -sI https://project.pages.dev/
