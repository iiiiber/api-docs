# 综合知识库 · imoons

> 鹏飞的个人综合知识库，覆盖技术学习、AI 与量化、副业探索、工具箱四大领域。
> 跨领域记录与复盘，所有内容纯静态、GitHub Pages / Cloudflare Pages 一键部署。

🌐 **线上地址**：https://api-docs-51h.pages.dev/

---

## ✨ 项目特点

- **零后端**：纯静态 SPA（HTML + JS + JSON），CF Pages / GitHub Pages 都能跑
- **首屏极快**：~3.6 KB 数据起步，按需加载单篇 Markdown（1-2 KB/篇）
- **搜索优化**：200ms debounce + 预计算索引（不扫全文）
- **MD 友好**：内容用 Markdown 写，加 frontmatter 便于维护
- **架构清爽**：数据 / 视图 / 渲染引擎完全分离

---

## 📊 架构概览（v0.4）

```
┌─────────────────────────────────────────────────┐
│  浏览器                                          │
│                                                  │
│  index.html (75 KB)                              │
│    ├─ SPA 引擎（vanilla JS, 无依赖）              │
│    ├─ 51 个 SVG 图标（Phosphor 风格）             │
│    └─ marked.js (CDN, 12 KB)                     │
│         ↓                                        │
│  fetch('articles-index.json') ← 首屏 3.6 KB     │
│         ↓                                        │
│  渲染首页/分类/搜索                              │
│         ↓                                        │
│  点击文章 → fetch('articles/{id}.md') ← 1-2 KB  │
│         ↓                                        │
│  marked.parse() → 注入到 .article-body            │
└─────────────────────────────────────────────────┘
```

### 数据规模对比

| 指标 | v0.3（旧） | v0.4（现） | 提升 |
|---|---|---|---|
| 首屏数据 | 38 KB | **3.6 KB** | ↓ 91% |
| 单篇访问 | 含在 38KB | **1-2 KB 按需** | ↓ 95% |
| 搜索性能 | O(n) 扫全文 | 预计算索引 | 🚀 |
| 内容格式 | HTML 难编辑 | Markdown + frontmatter | ✓ |

---

## 📁 目录结构

```
api-docs/
├── index.html              # SPA 主页面（75 KB）
├── articles.json           # v0.3 源数据（HTML 格式，保留兼容）
├── articles-index.json     # v0.4 元数据索引（首屏用）
├── articles/               # 17 篇 Markdown 文章
│   ├── linux-dd.md
│   ├── kylin-adapt.md
│   ├── kylin-faq-*.md
│   ├── openclaw-systems.md
│   ├── cloudflare-pages-deploy.md
│   ├── freqtrade-intro.md
│   ├── fund-analyzer.md
│   ├── ai-side-income.md
│   ├── side-income-method.md
│   ├── biz-recycle.md
│   ├── common-commands.md
│   ├── tools-online.md
│   └── ...
└── scripts/                # 管理脚本（备份在 GitHub）
    ├── README.md           # 详细使用说明
    ├── html2md.py          # HTML → Markdown 转换器
    ├── build-v0.4.py       # 一键构建
    ├── verify-v0.4.js      # JSDOM 验证测试
    └── push-snapshot.js    # 推送到 GitHub
```

---

## 🛠️ 本地管理

### 加新文章

```bash
# 1. 编辑 articles.json，加一条新文章
# 2. 重新构建（自动生成 index 和 md）
python3 scripts/build-v0.4.py
# 3. 推送到 GitHub（CF Pages 自动部署）
GITHUB_TOKEN=*** node scripts/push-snapshot.js
```

### 本地验证

```bash
# 用 JSDOM 跑完整测试（19/19 通过）
node scripts/verify-v0.4.js
```

### 数据 → Markdown 转换

```bash
# 单个测试
python3 scripts/html2md.py 0
# 输出：第 0 篇文章的 HTML 转 Markdown 结果
```

---

## 🎯 内容分类

| 分类 | 子分类 | 文章数 | 主题 |
|---|---|---|---|
| 🛠️ 技术学习 | Linux / 麒麟适配 / 前后端 / DevOps | 10 | 主业 + 日常技术 |
| 🤖 AI & 量化 | LLM / Agent / 量化 / AI 副业 | 4 | AI 应用 + 实战 |
| 💼 副业 & 创业 | 选品 / 复盘 / 流量 / 变现 | 2 | 项目探索 |
| 🔧 工具箱 | 命令 / 在线工具 / 效率 / 踩坑 | 1+ | 工具收藏 |

---

## 🔧 技术栈

- **前端**：Vanilla JS（无框架）、CSS 变量、SVG 图标
- **Markdown 解析**：[marked.js](https://marked.js.org/) 12.0.2
- **字体**：Inter + JetBrains Mono（Google Fonts）
- **部署**：Cloudflare Pages（push 触发自动部署，约 30 秒）
- **搜索**：纯 JS 预计算索引（无外部服务）

---

## 🐛 修复记录

### v0.4 · 拆分架构（2026-06-04）
- 首屏数据 38KB → 3.6KB
- 搜索加 debounce + 索引
- 文章页加 loading 占位 + 异步加载
- content 转 Markdown 体积 -30%

### v0.3.1 · BUG 修复（2026-06-04）
- `setActive()` 用 `onclick` 精确匹配（不再误高亮子分类）
- `icon()` 函数支持第三参数 text（27 处丢失文字恢复）
- 搜索框 `type="search"`（浏览器显示清除按钮）
- Theme / GitHub 按钮加 `onclick`
- 版本号统一为 `v0.3`

---

## 📈 未来规划

- [ ] 标签云视图
- [ ] 单文章 URL 分享（hash 路由）
- [ ] 导出 Markdown / PDF
- [ ] 文章访问量统计
- [ ] 深色模式（点击 Theme 按钮提示敬请期待）
- [ ] 继续补充文章（按需添加）

---

## 📄 License

个人项目，仅供学习参考。

---

> Made with ❤️ by 鹏飞 (imoons) · 2026
