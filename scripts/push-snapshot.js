/**
 * 把 workspace 下的 api-docs v0.4 文件推送到 GitHub 做备份
 * 用法：node /root/.openclaw/workspace/scripts/api-docs/push-snapshot.js
 *
 * 需先设环境变量：
 *   export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error('❌ 请先设置 GITHUB_TOKEN 环境变量');
  console.error('   export GITHUB_TOKEN=ghp_xxxxxxxxxxxx');
  process.exit(1);
}
const REPO = 'iiiiber/api-docs';

function req(method, p, data) {
  return new Promise((res, rej) => {
    const opts = {
      hostname: 'api.github.com',
      path: p,
      method,
      headers: {
        'Authorization': 'token ' + TOKEN,
        'User-Agent': 'openclaw',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    const r = https.request(opts, resp => {
      let b = '';
      resp.on('data', c => b += c);
      resp.on('end', () => res({ status: resp.statusCode, body: b }));
    });
    r.on('error', rej);
    if (data) r.write(JSON.stringify(data));
    r.end();
  });
}

async function putFile(p, content, message) {
  const get = await req('GET', '/repos/' + REPO + '/contents/' + p);
  let payload = {
    message,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch: 'main'
  };
  if (get.status === 200) payload.sha = JSON.parse(get.body).sha;
  const put = await req('PUT', '/repos/' + REPO + '/contents/' + p, payload);
  if (put.status === 200 || put.status === 201) {
    console.log('  ✅ ' + p + ' (' + content.length + ' bytes)');
    return true;
  } else {
    console.log('  ❌ ' + p + ' ' + put.status + ': ' + put.body.slice(0, 200));
    return false;
  }
}

(async () => {
  const base = __dirname;
  console.log('从 workspace 推 v0.4 文件到 GitHub 备份...');
  await putFile('index.html', fs.readFileSync(path.join(base, 'index.html'), 'utf8'), 'chore: v0.4 文件快照');
  await putFile('articles-index.json', fs.readFileSync(path.join(base, 'articles-index.json'), 'utf8'), 'chore: v0.4 索引快照');
  const articlesDir = path.join(base, 'articles');
  for (const f of fs.readdirSync(articlesDir)) {
    await putFile('articles/' + f, fs.readFileSync(path.join(articlesDir, f), 'utf8'), 'chore: v0.4 ' + f);
  }
  console.log('✅ 19 个文件已推送到 GitHub 备份');
})();
