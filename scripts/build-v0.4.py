#!/usr/bin/env python3
"""
v0.4 架构：拆分数据 + content 转 Markdown
输出：
  - articles-index.json: 4KB 元数据列表
  - articles/<id>.md: 每篇文章 0.5-2KB Markdown
"""
import json
import os
import sys
import re

sys.path.insert(0, '/tmp')
from html2md import html_to_md

SRC = '/tmp/api-docs-articles.json'
OUT_DIR = '/tmp/api-docs-out'
INDEX_FILE = os.path.join(OUT_DIR, 'articles-index.json')
ARTICLES_DIR = os.path.join(OUT_DIR, 'articles')

os.makedirs(ARTICLES_DIR, exist_ok=True)

data = json.load(open(SRC, encoding='utf-8'))

# 1. 生成 index
index_articles = []
for a in data['articles']:
    # 不含 content
    idx_entry = {k: v for k, v in a.items() if k != 'content'}
    index_articles.append(idx_entry)

index = {
    'version': '0.4',
    'generatedAt': __import__('datetime').datetime.now().isoformat() + 'Z',
    'stats': {
        'totalArticles': len(data['articles']),
        'totalCategories': len(data['categories']),
        'totalContentChars': sum(len(a.get('content', '')) for a in data['articles']),
    },
    'categories': data['categories'],
    'articles': index_articles,
}

with open(INDEX_FILE, 'w', encoding='utf-8') as f:
    json.dump(index, f, ensure_ascii=False, indent=2)

# 2. 生成单篇 Markdown
for a in data['articles']:
    md = html_to_md(a['content'])
    # 加 frontmatter（可选，markdown 渲染器可读）
    fm = '---\n'
    fm += f"id: {a['id']}\n"
    fm += f"title: {a['title']}\n"
    fm += f"cat: {a['cat']}\n"
    fm += f"date: {a['date']}\n"
    if a.get('level'):
        fm += f"level: {a['level']}\n"
    if a.get('tags'):
        fm += f"tags: {json.dumps(a['tags'], ensure_ascii=False)}\n"
    fm += '---\n\n'

    out_path = os.path.join(ARTICLES_DIR, f"{a['id']}.md")
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(fm + md)

# 3. 统计
idx_size = os.path.getsize(INDEX_FILE)
md_files = os.listdir(ARTICLES_DIR)
md_total_size = sum(os.path.getsize(os.path.join(ARTICLES_DIR, f)) for f in md_files)

print(f'✓ 写出 {INDEX_FILE}: {idx_size:,} bytes ({len(data["articles"])} 篇索引)')
print(f'✓ 写出 {len(md_files)} 个 Markdown 文件，共 {md_total_size:,} bytes')
print(f'  平均单篇: {md_total_size // len(md_files):,} bytes')
print()
print('对比原始:')
src_size = os.path.getsize(SRC)
print(f'  原 articles.json: {src_size:,} bytes')
print(f'  v0.4 index:       {idx_size:,} bytes ({idx_size/src_size*100:.1f}%)')
print(f'  v0.4 单篇总和:    {md_total_size:,} bytes')
print(f'  v0.4 首屏只下:   {idx_size:,} bytes（点击文章才下 {md_total_size//len(md_files):,} bytes/篇）')
