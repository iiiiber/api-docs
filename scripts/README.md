# api-docs 知识库管理脚本

个人综合知识库：https://api-docs-51h.pages.dev/
GitHub 仓库：https://github.com/iiiiber/api-docs

## 文件清单

| 文件 | 用途 | 位置 |
|---|---|---|
| `index.html` | SPA 主页面（v0.4 含 marked.js / debounce / 异步加载） | 本地 + GitHub |
| `articles.json` | **源数据**（HTML 格式 17 篇文章） | 本地 |
| `articles-index.json` | 元数据索引（自动生成） | 本地 + GitHub |
| `articles/*.md` | 17 篇 Markdown 文章（自动生成） | 本地 + GitHub |
| `html2md.py` | HTML → Markdown 转换器 | 本地 |
| `build-v0.4.py` | 一键构建 index + 17 个 md | 本地 |
| `verify-v0.4.js` | 本地 JSDOM 验证测试 | 本地 |
| `push-snapshot.js` | 把本地文件推 GitHub（备份） | 本地 |

## 加新文章流程

1. 编辑 `articles.json`，加一条文章（content 字段是 HTML 格式）
2. 跑构建：
   ```bash
   cd /root/.openclaw/workspace/scripts/api-docs
   python3 build-v0.4.py
   ```
   自动生成 `articles-index.json` 和 `articles/{new-id}.md`
3. 推送 GitHub：
   ```bash
   node push-snapshot.js
   ```
   会推 19+ 个文件（如果新增了文章，会多几个）
4. 等 30 秒 CF Pages 自动部署

## 验证（修改后）

```bash
node verify-v0.4.js
```

应该看到 19/19 通过。

## 架构

- 首屏：`articles-index.json` (3.6KB) + `index.html`
- 单篇：按需拉 `articles/{id}.md` (1-2KB)
- 搜索：200ms debounce + 预计算索引（仅元数据）
- Markdown 解析：marked.js 12.0.2 (CDN)

## 注意事项

- 仓库根目录还有遗留的 `articles.json`（v0.3 旧版），可以删了但**线上 17 篇 md 已经覆盖它**
- `index.html` 是合并了 v0.3 BUG 修复 + v0.4 拆分架构的最终版
- 之前 v0.3 的 BUG 修复（setActive、icon 函数、版本号统一）已经包含在内
