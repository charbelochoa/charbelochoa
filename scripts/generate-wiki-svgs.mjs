import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.argv[2] || process.cwd();
const outDir = join(root, 'assets', 'wiki');
await mkdir(outDir, { recursive: true });

const faviconBase64 = (await readFile(join(root, 'favicon.png'))).toString('base64');
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

// 1. top-bar.svg
const topBar = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="76" viewBox="0 0 1080 76" role="img" aria-label="Pavarotti — Wiki personal">
  <style>
    @keyframes blink { 0%, 48% { opacity: 1; } 50%, 100% { opacity: 0; } }
    .cursor { animation: blink 1.15s infinite; }
  </style>
  <rect width="1080" height="76" fill="#0d1014"/>
  <line x1="0" y1="75.5" x2="1080" y2="75.5" stroke="#27292d" stroke-width="1"/>
  <text x="40" y="46" fill="#eaecf0" font-family="Arial, Helvetica, sans-serif" font-size="22">☰</text>
  <image href="data:image/png;base64,${faviconBase64}" x="86" y="17" width="42" height="42"/>
  <text x="139" y="38" fill="#eaecf0" font-family="Georgia, 'Times New Roman', serif" font-size="31" font-variant="small-caps" letter-spacing="0.8">Pavarotti</text>
  <text x="140" y="55" fill="#eaecf0" font-family="Georgia, 'Times New Roman', serif" font-size="12" letter-spacing="1.1">Wiki personal</text>
  <rect x="686" y="20" width="286" height="36" rx="2" fill="#000000" stroke="#54595d" stroke-width="1"/>
  <text x="698" y="43" fill="#a2a9b1" font-family="Arial, Helvetica, sans-serif" font-size="14">Buscar</text>
  <line class="cursor" x1="745" y1="29" x2="745" y2="47" stroke="#6b9eff" stroke-width="1.4"/>
  <rect x="972" y="20" width="74" height="36" rx="2" fill="#101418" stroke="#54595d" stroke-width="1"/>
  <text x="1009" y="43" fill="#eaecf0" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Buscar</text>
</svg>`;
await writeFile(join(outDir, 'top-bar.svg'), topBar);

// 2. title-portada.svg
const titlePortada = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="68" viewBox="0 0 1080 68" role="img" aria-label="Portada — 8 artículos">
  <rect width="1080" height="68" fill="#000000"/>
  <text x="34" y="45" fill="#eaecf0" font-family="Georgia, 'Times New Roman', serif" font-size="38" font-weight="400">Portada</text>
  <text x="1046" y="45" fill="#a2a9b1" font-family="Arial, Helvetica, sans-serif" font-size="14" text-anchor="end">8 artículos</text>
  <line x1="34" y1="58.5" x2="1046" y2="58.5" stroke="#54595d" stroke-width="1"/>
</svg>`;
await writeFile(join(outDir, 'title-portada.svg'), titlePortada);

// 3. Category h2 headers
const sections = [
  ['h2-proyectos.svg', 'Proyectos'],
  ['h2-investigaciones.svg', 'Investigaciones'],
  ['h2-repositorios.svg', 'Repositorios'],
  ['h2-documentos.svg', 'Documentos'],
  ['h2-bitacora.svg', 'Bitácora'],
];
for (const [file, label] of sections) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="46" viewBox="0 0 760 46" role="img" aria-label="${esc(label)}">
  <rect width="760" height="46" fill="#000000"/>
  <text x="10" y="31" fill="#eaecf0" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-weight="400">${esc(label)}</text>
  <line x1="10" y1="40.5" x2="750" y2="40.5" stroke="#27292d" stroke-width="1"/>
</svg>`;
  await writeFile(join(outDir, file), svg);
}

// 4. Sidebar Contenido header
const asideContenido = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="38" viewBox="0 0 240 38" role="img" aria-label="Contenido">
  <rect width="240" height="38" fill="#101418"/>
  <text x="12" y="23" fill="#eaecf0" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold">Contenido</text>
  <line x1="12" y1="31.5" x2="228" y2="31.5" stroke="#27292d" stroke-width="1"/>
</svg>`;
await writeFile(join(outDir, 'aside-contenido.svg'), asideContenido);

// 5. Article headers for inline expandable articles
const articles = [
  ['article-node-panda.svg', 'Proyectos', ['Node-Panda'], 26],
  ['article-orbit.svg', 'Proyectos', ['Orbit'], 26],
  ['article-clients-model.svg', 'Repositorios', ['Clients-Model'], 26],
  ['article-dsp-005.svg', 'Investigaciones', ['Navegacion Optica Relativa al Terreno:', 'Acoplando Parches ViT 16x16 con Filtros GNC'], 23],
  ['article-dsp-004.svg', 'Investigaciones', ['Arquitecturas Hibridas Conv-Stem + Vision Transformer', 'para Percepcion Espacial en Tiempo Real'], 23],
  ['article-dsp-003.svg', 'Investigaciones', ['Grafos de Memoria Asociativa en C++20:', 'Recuperacion Sub-Milisegundo en Agentes'], 23],
  ['article-dsp-002.svg', 'Investigaciones', ['Flujo de Varianza Pre-Norm y Autoatencion', 'Derivados desde Calculo Matricial Puro'], 23],
  ['article-dsp-001.svg', 'Investigaciones', ['Entorno Determinista Kali y Arch Linux', 'para Investigacion Neuronal y Telemetria'], 23],
];
for (const [file, cat, lines, size] of articles) {
  const isTwo = lines.length > 1;
  const h = isTwo ? 90 : 64;
  const lineY = isTwo ? 83.5 : 57.5;
  const titleNodes = isTwo
    ? `<text x="12" y="45" fill="#eaecf0" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" font-weight="400">${esc(lines[0])}</text>
  <text x="12" y="72" fill="#eaecf0" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" font-weight="400">${esc(lines[1])}</text>`
    : `<text x="12" y="46" fill="#eaecf0" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" font-weight="400">${esc(lines[0])}</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="${h}" viewBox="0 0 760 ${h}" role="img" aria-label="${esc(lines.join(' '))}">
  <rect width="760" height="${h}" fill="#000000"/>
  <text x="12" y="19" font-family="Arial, Helvetica, sans-serif" font-size="13"><tspan fill="#6b9eff">Portada</tspan><tspan fill="#a2a9b1">  ›  </tspan><tspan fill="#6b9eff">${esc(cat)}</tspan></text>
  ${titleNodes}
  <line x1="12" y1="${lineY}" x2="748" y2="${lineY}" stroke="#54595d" stroke-width="1"/>
</svg>`;
  await writeFile(join(outDir, file), svg);
}

// 6. Footer bar
const footerBar = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="52" viewBox="0 0 1080 52" role="img" aria-label="Pavarotti Wiki — Pie de página">
  <rect width="1080" height="52" fill="#101418"/>
  <line x1="0" y1="0.5" x2="1080" y2="0.5" stroke="#27292d" stroke-width="1"/>
  <text x="34" y="31" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#6b9eff">
    <tspan font-weight="bold">Pavarotti Wiki</tspan>
    <tspan dx="24" font-weight="normal">Acceso del autor</tspan>
    <tspan dx="24" font-weight="normal">Pavarotti</tspan>
  </text>
</svg>`;
await writeFile(join(outDir, 'footer-bar.svg'), footerBar);

console.log('Regenerated dark Wikipedia SVG assets.');
