import { readFile, writeFile, readdir, mkdir, cp, rm } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
const escape = text => String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const safeURL = value => {
  try { const parsed = new URL(value, 'https://example.invalid/'); return ['http:','https:','mailto:'].includes(parsed.protocol); } catch { return false; }
};
marked.use({ renderer: {
  html({text}) { return escape(text); },
  link({href,title,tokens}) {
    const text = this.parser.parseInline(tokens);
    return safeURL(href) ? `<a href="${escape(href)}"${title ? ` title="${escape(title)}"` : ''} rel="noopener noreferrer">${text}</a>` : text;
  },
  image({href,text}) { return safeURL(href) ? `<img src="${escape(href)}" alt="${escape(text)}" loading="lazy">` : escape(text); },
}});

function parsePost(source, file) {
  const match = source.replace(/^\uFEFF/,'').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing front matter`);
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const part = line.match(/^(title|date|slug|draft):\s*(.*?)\s*$/);
    if (!part) throw new Error(`${file}: unsupported metadata ${line}`);
    meta[part[1]] = part[2].replace(/^(["'])(.*)\1$/, '$2');
  }
  if (!['true','false'].includes(meta.draft)) throw new Error(`${file}: set draft to true or false`);
  if (meta.draft === 'true') return null;
  if (!meta.title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug || '')) throw new Error(`${file}: a title and safe slug are required`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date || '') || !Number.isFinite(Date.parse(meta.date)) || new Date(meta.date).toISOString().slice(0,10) !== meta.date) throw new Error(`${file}: invalid publication date`);
  if (meta.date > new Date().toISOString().slice(0,10)) return null;
  return {...meta, content:marked.parse(match[2])};
}

const postsDir = join(root,'content','posts');
await mkdir(postsDir,{recursive:true});
const posts = [];
for (const name of (await readdir(postsDir)).filter(x=>x.endsWith('.md')).sort()) {
  const post = parsePost(await readFile(join(postsDir,name),'utf8'),name);
  if (post) posts.push(post);
}
posts.sort((a,b)=>b.date.localeCompare(a.date)||a.slug.localeCompare(b.slug));
if (new Set(posts.map(p=>p.slug)).size !== posts.length) throw new Error('Duplicate blog slugs');

// Build in a fixed, verified directory; never ship source, drafts, or owner notes.
if (dirname(out) !== root || !out.endsWith('dist')) throw new Error('Invalid build output');
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for (const name of ['readme.css','site.js','.nojekyll']) await cp(join(root,name),join(out,name));
for (const name of ['identity','fonts']) await cp(join(root,'assets',name),join(out,'assets',name),{recursive:true});
try { await cp(join(root,'assets','uploads'),join(out,'assets','uploads'),{recursive:true}); } catch (error) { if (error.code !== 'ENOENT') throw error; }
await cp(join(root,'signals'),join(out,'signals'),{recursive:true});
await cp(join(root,'robots.txt'),join(out,'robots.txt'));
const home=(await readFile(join(root,'index.html'),'utf8')).replace('>00</span></a></header>',`>${String(posts.length).padStart(2,'0')}</span></a></header>`);
await writeFile(join(out,'index.html'),home);
let archive = await readFile(join(root,'archive.html'),'utf8');
archive = archive.replace('<span id="entry-count">00</span>',`<span id="entry-count">${String(posts.length).padStart(2,'0')}</span>`);
if (posts.length) {
  const list=`<ol class="archive-list">${posts.map(p=>`<li><a href="posts/${p.slug}.html"><span>${escape(p.title)}</span><time datetime="${p.date}">${p.date}</time></a></li>`).join('')}</ol>`;
  archive=archive.replace('<p class="empty-archive" aria-label="Todavía no hay entradas publicadas">∅</p>',list);
}
await writeFile(join(out,'archive.html'),archive);
await mkdir(join(out,'posts'),{recursive:true});
for (const post of posts) {
  const page=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#030303"><title>${escape(post.title)} — Charbel Ochoa</title><link rel="icon" href="../assets/identity/mark.svg"><link rel="stylesheet" href="../readme.css"></head><body class="archive-page"><header class="frame-top"><a class="wordmark" href="../archive.html" aria-label="Volver al archivo">←</a><a class="quiet-link" href="../" aria-label="Inicio de Charbel Ochoa">C / O</a></header><main class="archive-main"><article><p class="post-meta"><time datetime="${post.date}">${post.date}</time></p><h1 class="post-title">${escape(post.title)}</h1><div class="post-content">${post.content}</div></article></main></body></html>`;
  await writeFile(join(out,'posts',`${post.slug}.html`),page);
}
console.log(`Built dist/ — ${posts.length} published posts. Drafts and owner notes excluded.`);
