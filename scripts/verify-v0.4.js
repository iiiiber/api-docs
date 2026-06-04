/**
 * v0.4 架构验证（精简单版）
 */
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('/tmp/api-docs-home.html', 'utf8');
const indexJson = fs.readFileSync('/tmp/api-docs-out/articles-index.json', 'utf8');
const articlesDir = '/tmp/api-docs-out/articles';

const vc = new VirtualConsole();
vc.on('jsdomError', () => {});

const articleFiles = {};
fs.readdirSync(articlesDir).forEach(f => {
  articleFiles[f.replace('.md', '')] = fs.readFileSync(path.join(articlesDir, f), 'utf8');
});

const dom = new JSDOM(html, {
  url: 'https://api-docs-51h.pages.dev/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    window.fetch = (url) => {
      const u = String(url);
      if (u.includes('articles-index.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(indexJson)) });
      }
      const m = u.match(/articles\/([\w-]+)\.md/);
      if (m && articleFiles[m[1]]) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(articleFiles[m[1]]) });
      }
      return Promise.reject(new Error('blocked: ' + u));
    };
    window.scrollTo = () => {};
    // 模拟 marked.js
    window.marked = {
      parse: function(md) {
        let s = md;
        s = s.replace(/^### (.*$)/gim, '<h3>$1</h3>\n');
        s = s.replace(/^## (.*$)/gim, '<h2>$1</h2>\n');
        s = s.replace(/```\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>\n');
        s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        // 表格
        s = s.replace(/^(\|[^\n]+\|)\n(\|[-:|\s]+\|)\n((?:\|[^\n]+\|\n?)+)/gim, function(m, hh, sep, body) {
          const head = hh.split('|').slice(1, -1).map(c => '<th>' + c.trim() + '</th>').join('');
          const rows = body.trim().split('\n').map(r => {
            const cells = r.split('|').slice(1, -1).map(c => '<td>' + c.trim() + '</td>').join('');
            return '<tr>' + cells + '</tr>';
          }).join('');
          return '<table><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table>\n';
        });
        // 连续 li 合并为 ul
        s = s.replace(/((?:^- .*\n?)+)/gim, function(m) {
          const items = m.trim().split('\n').map(line => line.replace(/^- /, '<li>') + '</li>').join('');
          return '<ul>' + items + '</ul>\n';
        });
        s = s.split(/\n\n+/).map(function(p) {
          if (p.match(/^<(h\d|ul|ol|li|pre|table|p)/)) return p;
          return '<p>' + p + '</p>';
        }).join('\n');
        return s;
      }
    };
  }
});

const { window } = dom;
const doc = window.document;
const KB = JSON.parse(indexJson);
const issues = [];
const passes = [];

function ok(m) { passes.push(m); console.log('   ✅ ' + m); }
function bad(m) { issues.push(m); console.log('   ❌ ' + m); }

function finalize() {
  console.log('');
  console.log('═'.repeat(60));
  console.log(`   ✅ 通过: ${passes.length}`);
  console.log(`   ❌ 失败: ${issues.length}`);
  if (issues.length === 0) {
    console.log('   🎉 v0.4 架构验证通过！');
  } else {
    console.log('   失败:');
    issues.forEach((m, i) => console.log(`   ${i+1}. ${m}`));
  }
  console.log('═'.repeat(60));
  process.exit(0);
}

setTimeout(async () => {
  // 等首页渲染（说明闭包内 KB_DATA 已就绪）
  let waited = 0;
  const c0 = doc.getElementById('app-content');
  while ((!c0.innerHTML.includes('欢迎') || c0.innerHTML.length < 5000) && waited < 5000) {
    await new Promise(r => setTimeout(r, 50));
    waited += 50;
  }
  console.log(`   ⏱  首页渲染完成 ${waited}ms`);

  const c = doc.getElementById('app-content');
  console.log('═'.repeat(60));
  console.log('   🧪 v0.4 架构验证');
  console.log('═'.repeat(60));

  console.log('\n【1】首屏数据');
  console.log(`   📊 articles-index.json: ${JSON.stringify(KB).length} 字符`);
  console.log(`   📊 文章数: ${KB.articles.length}`);
  ok('index 加载成功');

  console.log('\n【2】首页渲染');
  const h = c.innerHTML;
  ['欢迎来到综合知识库', '技术学习', '最新文章', 'v0.4 · 2026-06-04'].forEach(t => {
    if (h.includes(t)) ok('首页含: ' + t);
    else bad('首页缺: ' + t);
  });

  console.log('\n【3】文章详情（异步加载）');
  window.renderArticle('linux-dd');
  // 立即检查 loading
  const loadingHTML = c.innerHTML;
  if (loadingHTML.includes('正在加载正文')) ok('loading 立即显示');
  else { bad('没显示 loading'); console.log('   ℹ️  current html:', loadingHTML.slice(0, 200)); }
  // 等异步拉 markdown 完成
  await new Promise(r => setTimeout(r, 800));
  if (c.innerHTML.includes('dd 是 Linux')) ok('正文加载完成');
  else { bad('正文没加载'); console.log('   ℹ️  current html:', c.innerHTML.slice(0, 300)); }
  if (c.innerHTML.includes('<h2') && c.innerHTML.includes('概述</h2>')) ok('h2 渲染');
  else bad('h2 缺失');
  if (c.innerHTML.includes('<h3') && c.innerHTML.includes('参数速查</h3>')) ok('h3 渲染');
  else bad('h3 缺失');
  if (c.innerHTML.includes('<table>') && c.innerHTML.includes('输入源')) ok('表格渲染');
  else bad('表格缺失');
  if (c.innerHTML.includes('<pre>') && c.innerHTML.includes('dd if=源文件')) ok('代码块渲染');
  else bad('代码块缺失');
  if (c.innerHTML.includes('<ul>') && c.innerHTML.includes('权限不足')) ok('列表渲染');
  else bad('列表缺失');
  const toc = doc.getElementById('on-this-page');
  if (toc && toc.querySelectorAll('.otp-links a').length > 0) ok('TOC 正常');
  else bad('TOC 异常');

  console.log('\n【4】搜索 debounce + 索引');
  const start = Date.now();
  window.filterDocs('L');
  window.filterDocs('Li');
  window.filterDocs('Lin');
  window.filterDocs('Linux');
  await new Promise(r => setTimeout(r, 300));
  const elapsed = Date.now() - start;
  console.log(`   ⏱  4 次连续输入耗时: ${elapsed}ms`);
  if (elapsed >= 200 && elapsed < 800) ok('debounce 工作');
  else bad(`debounce 异常: ${elapsed}ms`);
  if (c.innerHTML.includes('搜索结果：linux')) ok('搜索结果标题');
  else bad('搜索结果标题缺失');
  if (c.innerHTML.includes('Linux dd')) ok('匹配到 linux-dd');
  else bad('没匹配');

  // 搜索无结果
  window.filterDocs('xyz-9999');
  await new Promise(r => setTimeout(r, 300));
  if (c.innerHTML.includes('没找到')) ok('无结果提示');
  else bad('无结果提示缺失');

  // 清空搜索
  window.filterDocs('');
  await new Promise(r => setTimeout(r, 300));
  const hiddenAfter = Array.from(doc.querySelectorAll('.sidebar-section')).filter(s => s.style.display === 'none');
  const hiddenLi = Array.from(doc.querySelectorAll('.sidebar-nav li')).filter(li => li.style.display === 'none');
  if (hiddenAfter.length === 0 && hiddenLi.length === 0) ok('清空搜索后侧边栏全恢复');
  else bad(`清空后仍折叠 section=${hiddenAfter.length} li=${hiddenLi.length}`);

  console.log('\n【5】所有文章异步加载');
  let okCount = 0, failList = [];
  // 串行加载，每篇等 250ms
  for (const a of KB.articles) {
    window.renderArticle(a.id);
    await new Promise(r => setTimeout(r, 250));
    if (c.innerHTML.includes(a.title)) okCount++;
    else failList.push(a.id + ' (' + a.title + ')');
  }
  console.log(`   📊 成功 ${okCount}/${KB.articles.length}`);
  if (failList.length === 0) ok('全部文章异步加载正常');
  else { failList.forEach(id => bad('加载失败: ' + id)); }

  finalize();
}, 2000);
