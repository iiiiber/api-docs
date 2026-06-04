#!/usr/bin/env python3
"""
HTML → Markdown 转换器（针对 API 知识库文章量身定做）
顺序：先处理特殊结构（pre/table），再处理通用标签，最后清理残余
"""
import re

def html_to_md(html: str) -> str:
    s = html
    code_blocks = []
    tables = []

    # ========== 阶段 1：暂存特殊结构 ==========
    # 1.1 <pre class=code>...</pre> → 占位符
    def stash_pre(m):
        inner = m.group(1)
        m2 = re.search(r'<code[^>]*>([\s\S]*?)</code>', inner)
        if m2:
            inner = m2.group(1)
        inner = (inner.replace('&lt;', '<').replace('&gt;', '>')
                       .replace('&amp;', '&').replace('&quot;', '"').replace('&#39;', "'"))
        code_blocks.append(inner.strip())
        return f'\n\n##PREPH##{len(code_blocks)-1}##PREEND##\n\n'
    s = re.sub(r'<pre[^>]*>([\s\S]*?)</pre>', stash_pre, s)

    # 1.2 <table>...</table> → 暂存
    def stash_table(m):
        table_html = m.group(1)
        thead_match = re.search(r'<thead[^>]*>(.*?)</thead>', table_html, re.S)
        tbody_match = re.search(r'<tbody[^>]*>(.*?)</tbody>', table_html, re.S)

        def cell_to_md(c):
            c = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', c)
            c = re.sub(r'<[^>]+>', '', c)
            c = c.replace('|', '\\|').strip()
            return c

        rows = []
        if thead_match:
            ths = re.findall(r'<th[^>]*>(.*?)</th>', thead_match.group(1), re.S)
            ths = [cell_to_md(c) for c in ths]
            if ths:
                rows.append('| ' + ' | '.join(ths) + ' |')
                rows.append('| ' + ' | '.join(['---'] * len(ths)) + ' |')
        if tbody_match:
            for tr in re.findall(r'<tr[^>]*>(.*?)</tr>', tbody_match.group(1), re.S):
                tds = re.findall(r'<td[^>]*>(.*?)</td>', tr, re.S)
                tds = [cell_to_md(c) for c in tds]
                if tds:
                    rows.append('| ' + ' | '.join(tds) + ' |')
        tables.append('\n\n' + '\n'.join(rows) + '\n\n')
        return f'\n\n##TBLPH##{len(tables)-1}##TBLEND##\n\n'
    s = re.sub(r'<table[^>]*>([\s\S]*?)</table>', stash_table, s)

    # ========== 阶段 2：通用标签 → Markdown ==========
    # 标题
    s = re.sub(r'<h2[^>]*>(.*?)</h2>', r'\n## \1\n\n', s, flags=re.S)
    s = re.sub(r'<h3[^>]*>(.*?)</h3>', r'\n### \1\n\n', s, flags=re.S)

    # 段落
    s = re.sub(r'<p[^>]*>', '', s)
    s = re.sub(r'</p>', '\n\n', s)

    # 强调 + 行内 code
    s = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', s, flags=re.S)
    s = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', s, flags=re.S)
    s = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', s, flags=re.S)
    s = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', s, flags=re.S)
    s = re.sub(r'<br\s*/?>', '\n', s)

    # 列表
    s = re.sub(r'</?ul[^>]*>', '\n', s)
    s = re.sub(r'</?ol[^>]*>', '\n', s)
    s = re.sub(r'<li[^>]*>', '\n- ', s)
    s = re.sub(r'</li>', '', s)

    # ========== 阶段 3：清理残余 HTML 标签（占位符已暂存） ==========
    s = re.sub(r'<[^>]+>', '', s)

    # HTML 实体
    s = (s.replace('&lt;', '<').replace('&gt;', '>')
          .replace('&amp;', '&').replace('&nbsp;', ' ')
          .replace('&quot;', '"').replace('&#39;', "'"))

    # ========== 阶段 4：还原暂存内容 ==========
    for i, code in enumerate(code_blocks):
        s = s.replace(f'##PREPH##{i}##PREEND##', '\n```\n' + code + '\n```\n')
    for i, table in enumerate(tables):
        s = s.replace(f'##TBLPH##{i}##TBLEND##', table)

    # ========== 阶段 5：清理多余空行 ==========
    s = re.sub(r'\n{3,}', '\n\n', s)
    s = s.strip() + '\n'
    return s


if __name__ == '__main__':
    import json
    import sys
    data = json.load(open('/tmp/api-docs-articles.json'))
    if len(sys.argv) > 1:
        idx = int(sys.argv[1])
        a = data['articles'][idx]
    else:
        a = data['articles'][0]

    md = html_to_md(a['content'])
    print(f'=== {a["id"]} ===')
    print(f'HTML: {len(a["content"])} 字符')
    print(f'MD:   {len(md)} 字符')
    print(f'压缩: {(1 - len(md)/len(a["content"]))*100:.1f}%')
    print()
    print(md)
