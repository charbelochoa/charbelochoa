import { join } from 'node:path';
import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { categories, validSlug, validateArticle, maxPdf } from '../wiki/schema.mjs';

const esc = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const categoryLinks = () =>
  Object.entries(categories)
    .map(([key, label]) => `<a href="/wiki/#${key}">${label}</a>`)
    .join('');
const articleURL = (a) => `/wiki/${a.slug}/`;
function page(title, url, content, isIndex = false) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'self'">
<title>${esc(title)} — Pavarotti Wiki</title><link rel="icon" href="/favicon.png" sizes="96x96" type="image/png">
<link rel="canonical" href="${esc(url)}"><link rel="stylesheet" href="/wiki/wiki.css">${isIndex ? '<script defer src="/wiki/search.js?v=2"></script>' : ''}</head><body>
<a class="skip" href="#contenido">Saltar al contenido</a>
<header class="top"><div class="top-inner"><details class="menu"><summary aria-label="Abrir menú">☰</summary><nav aria-label="Navegación"><a href="/wiki/">Portada de la wiki</a>${categoryLinks()}<a href="/wiki/autor/">Acceso del autor</a><a href="/">Portada de Pavarotti</a></nav></details>
<a href="/wiki/" class="brand"><img src="/favicon.png" width="42" height="42" alt=""><span>Pavarotti<small>Wiki personal</small></span></a>
<form action="/wiki/" role="search"><label class="sr" for="q">Buscar en Pavarotti Wiki</label><input id="q" type="search" name="q" placeholder="Buscar" maxlength="180"><button type="submit" aria-label="Buscar">Buscar</button></form></div></header>
<main id="contenido">${content}</main><footer><div><a href="/wiki/">Pavarotti Wiki</a><a href="/wiki/autor/">Acceso del autor</a><a href="/">Pavarotti</a></div></footer></body></html>`;
}

export async function buildWiki({ root, out, posts, origin, renderMarkdown }) {
  const target = join(out, 'wiki');
  await mkdir(target, { recursive: true });
  for (const file of ['wiki.css', 'search.js'])
    await cp(join(root, 'wiki', file), join(target, file));
  const articles = posts.filter((p) => /^dsp-\d+$/.test(p.slug)).map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: p.description || '',
    html: p.content,
    category: 'investigacion',
    updated: p.date,
  }));
  const source = join(root, 'content', 'wiki');
  for (const dir of await readdir(source, { withFileTypes: true })) {
    if (!dir.isDirectory() || !validSlug(dir.name))
      throw new Error('Directorio de artículo no válido: ' + dir.name);
    const folder = join(source, dir.name);
    const files = await readdir(folder);
    if (!files.length) continue;
    const data = JSON.parse(await readFile(join(folder, 'article.json'), 'utf8'));
    validateArticle(data);
    const article = { ...data, slug: dir.name, html: renderMarkdown(data.body) };
    if (files.includes('documento.pdf')) {
      const pdf = await readFile(join(folder, 'documento.pdf'));
      if (pdf.length > maxPdf || !pdf.subarray(0, 5).equals(Buffer.from('%PDF-')))
        throw new Error('PDF no válido: ' + dir.name);
      await mkdir(join(target, dir.name), { recursive: true });
      await writeFile(join(target, dir.name, 'documento.pdf'), pdf);
      article.pdf = true;
    }
    articles.push(article);
  }
  articles.sort(
    (a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title, 'es'),
  );
  const groups = Object.entries(categories)
    .map(([key, label]) => {
      const items = articles.filter((a) => a.category === key);
      const rows = items
        .map(
          (a) => `<li><a href="${articleURL(a)}">${esc(a.title)}</a><p>${esc(a.summary)}</p></li>`,
        )
        .join('');
      return `<section id="${key}" data-category><h2>${label}</h2>${rows ? `<ul class="entries">${rows}</ul>` : '<p class="muted">Todavía no hay publicaciones.</p>'}</section>`;
    })
    .join('');
  const cover = `<div class="title"><h1>Portada</h1><span>${articles.length} artículos</span></div><div class="layout"><div><p class="lead">La wiki personal de <strong>Charbel Ochoa</strong> reúne proyectos, investigaciones y documentos publicados por su autor.</p><output id="result-count" aria-live="polite"></output>${groups}</div>
<aside><h2>Contenido</h2><nav aria-label="Índice de la portada">${categoryLinks()}</nav></aside></div>`;
  await writeFile(join(target, 'index.html'), page('Portada', origin + '/wiki/', cover, true));
  for (const a of articles) {
    const headings = [];
    const body = a.html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, text) => {
      const id = 'seccion-' + (headings.length + 1);
      headings.push(`<a href="#${id}">${text.replace(/<[^>]*>/g, '')}</a>`);
      return `<h2 id="${id}">${text}</h2>`;
    });
    const content = `<div class="crumb"><a href="/wiki/">Portada</a> <span>›</span> <a href="/wiki/#${a.category}">${categories[a.category]}</a></div>
<div class="title"><h1>${esc(a.title)}</h1></div><div class="layout"><article class="prose">${body}</article>
<aside><h2>Ficha del artículo</h2><dl><dt>Categoría</dt><dd>${categories[a.category]}</dd><dt>Actualización</dt><dd><time datetime="${a.updated}">${a.updated}</time></dd></dl>
${a.url ? `<a href="${esc(a.url)}" rel="external noopener">Enlace del proyecto ↗</a>` : ''}${a.pdf ? '<a href="documento.pdf" type="application/pdf">Abrir documento PDF</a>' : ''}${headings.length ? `<h2>Contenido</h2><nav>${headings.join('')}</nav>` : ''}</aside></div>`;
    const dir = join(target, a.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), page(a.title, origin + articleURL(a), content));
  }
  await mkdir(join(target, 'autor'), { recursive: true });
  const owner =
    '<div class="title"><h1>Acceso del autor</h1></div><p>Abre la conexión privada desde el equipo autorizado para crear artículos, adjuntar un PDF o actualizar una publicación.</p><p><a href="http://127.0.0.1:4179/wiki/publicar/" rel="noreferrer">Abrir el editor privado</a></p>';
  await writeFile(
    join(target, 'autor', 'index.html'),
    page('Acceso del autor', origin + '/wiki/autor/', owner),
  );
  return ['/wiki/', ...articles.map(articleURL)];
}
