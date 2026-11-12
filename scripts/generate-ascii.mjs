import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Original vector geometry, sampled into real ASCII characters. No source image.
// Regenerate with: node scripts/generate-ascii.mjs
const output = fileURLToPath(new URL('../assets/identity/', import.meta.url));
await mkdir(output, { recursive: true });
const polygon = (points, light) => ({ points, light });
const shapes = [
  // Hood and shoulders.
  polygon([[81,744],[103,599],[169,462],[180,304],[207,161],[258,77],[316,44],[381,62],[433,125],[467,245],[464,426],[523,527],[563,744]], 0.20),
  polygon([[81,744],[103,599],[169,462],[180,304],[207,161],[258,77],[316,44],[273,114],[236,220],[213,418],[246,515],[190,674],[173,744]], 0.38),
  polygon([[180,304],[207,161],[258,77],[316,44],[273,114],[236,220],[213,418],[230,481],[205,454]], 0.60),
  polygon([[316,44],[381,62],[433,125],[467,245],[464,426],[523,527],[563,744],[498,744],[451,539],[420,423],[427,237],[393,138]], 0.24),
  polygon([[316,44],[381,62],[433,125],[467,245],[449,209],[412,127],[371,87]], 0.43),
  polygon([[236,220],[273,114],[316,75],[362,104],[406,179],[427,237],[420,423],[378,493],[276,491],[225,418]], 0.055),
  // Low, black baseball cap under the hood.
  polygon([[248,187],[265,146],[305,125],[350,129],[387,155],[401,192],[323,205]], 0.28),
  polygon([[248,187],[265,146],[305,125],[318,129],[279,154],[267,187]], 0.47),
  polygon([[239,193],[297,182],[364,183],[408,201],[420,213],[352,217],[283,209],[234,205]], 0.45),
  polygon([[239,199],[314,205],[420,213],[352,222],[283,213],[234,205]], 0.11),
  // A faceted, impassive obsidian mask.
  polygon([[243,220],[283,214],[350,220],[395,218],[410,272],[393,368],[355,417],[315,438],[278,418],[240,369],[222,288]], 0.32),
  polygon([[243,220],[283,214],[315,269],[271,261],[222,288]], 0.68),
  polygon([[283,214],[350,220],[315,269]], 0.46),
  polygon([[350,220],[395,218],[410,272],[360,264],[315,269]], 0.27),
  polygon([[222,288],[271,261],[261,311],[240,369]], 0.46),
  polygon([[410,272],[360,264],[372,310],[393,368]], 0.16),
  polygon([[271,261],[315,269],[298,314],[261,311]], 0.18),
  polygon([[315,269],[360,264],[372,310],[330,315]], 0.10),
  polygon([[315,269],[298,314],[313,334],[330,315]], 0.62),
  polygon([[298,314],[313,334],[291,347],[261,311]], 0.37),
  polygon([[330,315],[372,310],[342,348],[313,334]], 0.24),
  polygon([[240,369],[261,311],[291,347],[278,418]], 0.63),
  polygon([[393,368],[372,310],[342,348],[355,417]], 0.29),
  polygon([[291,347],[313,334],[342,348],[315,363]], 0.17),
  polygon([[291,347],[315,363],[342,348],[355,417],[315,438],[278,418]], 0.40),
  polygon([[278,418],[291,347],[315,387],[315,438]], 0.52),
  polygon([[315,387],[342,348],[355,417],[315,438]], 0.21),
  // Eye slits and the mouth sit in the deepest shadow.
  polygon([[243,279],[267,274],[289,283],[278,293],[251,289]], 0.015),
  polygon([[339,284],[360,277],[386,281],[377,291],[352,295]], 0.01),
  polygon([[291,369],[315,375],[338,369],[329,381],[304,382]], 0.055),
  // Neck, seams, zipper, and folds of the hoodie.
  polygon([[243,422],[278,446],[315,462],[359,443],[397,411],[394,462],[349,510],[294,508],[253,477]], 0.12),
  polygon([[213,418],[253,477],[294,508],[302,744],[242,744],[255,553],[207,494],[169,462]], 0.31),
  polygon([[397,411],[420,423],[451,539],[498,744],[356,744],[349,510],[394,462]], 0.15),
  polygon([[169,462],[207,494],[192,557],[153,616],[125,744],[81,744],[103,599]], 0.32),
  polygon([[207,494],[255,553],[242,744],[190,744],[207,630],[192,557]], 0.22),
  polygon([[294,508],[309,517],[317,744],[302,744]], 0.49),
  polygon([[349,510],[359,557],[356,744],[331,744],[329,544]], 0.18),
  polygon([[254,500],[261,511],[246,608],[242,615],[242,597]], 0.64),
  polygon([[387,485],[392,490],[408,588],[402,584]], 0.25),
];

function inside(x, y, points) {
  let result = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i], [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
  }
  return result;
}

function mapPoint(x, y, variant) {
  if (variant === 'profile') {
    // Turn the silhouette, shorten the far side, and project the nose.
    const center = 316 + Math.max(0, 430 - y) * 0.095;
    return [(x - center) / (x < center ? 0.92 : 0.60) + 316, y];
  }
  if (variant === 'signal') return [632 - (316 + (x - 316) / 1.45), y / 1.45 + 66];
  return [x, y];
}

function sample(x, y, variant) {
  const [px, py] = mapPoint(x, y, variant);
  let value = 0;
  for (const shape of shapes) if (inside(px, py, shape.points)) value = shape.light;
  if (!value) return 0;
  // Light follows actual fold and facet edges, instead of flat filled regions.
  const noise = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1;
  const onMask = inside(px, py, [[243,220],[283,214],[350,220],[395,218],[410,272],[393,368],[355,417],[315,438],[278,418],[240,369],[222,288]]);
  if (onMask) {
    value *= .76 + (410 - px) / 750;
    value += noise * .012;
    for (const [a,b,strength] of [
      [[243,220],[222,288],.28], [[222,288],[240,369],.36],
      [[240,369],[278,418],.27], [[278,418],[315,438],.14],
      [[315,269],[298,314],.15], [[298,314],[313,334],.19],
      [[243,279],[267,274],.17], [[339,284],[360,277],.07],
    ]) {
      const distance = lineDistance(px,py,a,b);
      if (distance < 2.4) value += strength * (1-distance/2.4);
    }
  } else {
    const fold = Math.sin(px*.083 + py*.018) * Math.sin(py*.014 - px*.009);
    value *= .75 + fold*.23;
    value += noise*.028;
    // A narrow silver rim on one side, with the other side almost disappearing.
    const edge = Math.min(...shapes[0].points.map((a,i,all)=>lineDistance(px,py,a,all[(i+1)%all.length])));
    if (edge < 3 && px < 316) value += .32*(1-edge/3);
    if (py > 500 && Math.abs(px - (294 + (py-508)*.04)) < 1.6) value = .52;
  }
  const sideLight = .62 + .38 * (1 - px / 632);
  const falloff = py > 560 ? Math.max(.08,1 - (py - 560) / 210) : 1;
  return Math.max(.008,Math.min(.86,value*sideLight*falloff));
}

function lineDistance(x,y,a,b) {
  const dx=b[0]-a[0], dy=b[1]-a[1];
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));
  return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}

const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const ramp = '.:;il1tfLCG08@';
function makeArt(variant) {
  const columns = 96, rows = 88, width = 650, height = 780;
  const text = [], svgRows = [];
  for (let row = 0; row < rows; row++) {
    let line = '', spans = [];
    for (let col = 0; col < columns; col++) {
      const x = (col + .5) * 632 / columns, y = (row + .5) * 770 / rows;
      const light = sample(x, y, variant);
      const index = Math.min(ramp.length - 1, Math.floor(light * 19));
      const char = light ? ramp[index] : ' ';
      line += char;
      if (light) {
        const tone = Math.round(17 + Math.pow(light, .82) * 172);
        spans.push(`<tspan x="${(col * width / columns).toFixed(2)}" fill="rgb(${tone},${tone},${tone})">${escape(char)}</tspan>`);
      }
    }
    text.push(line.trimEnd());
    svgRows.push(`<text y="${(row * height/rows + 7).toFixed(1)}">${spans.join('')}</text>`);
  }
  const title = {front: 'The Architect — frontal', profile: 'The Observer — three-quarter portrait', signal: 'The Echo — reverse close-up'}[variant];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title"><title id="title">${title}: original ASCII figure with a black faceted mask, cap and hood</title><!-- 79 67 72 79 65 / signals/00.txt --><g font-family="'Courier New',monospace" font-size="11.2" font-weight="400" xml:space="preserve">${svgRows.join('')}</g></svg>`;
  return {svg, text: text.join('\n').trimEnd() + '\n'};
}

for (const variant of ['front', 'profile', 'signal']) {
  const art = makeArt(variant);
  await writeFile(`${output}/${variant}.svg`, art.svg);
  await writeFile(`${output}/${variant}.txt`, art.text);
}

// Static black banner is compatible with GitHub's sanitized README renderer.
const front = makeArt('front').svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const banner = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600" role="img" aria-label="Charbel Ochoa"><rect width="1200" height="600" fill="#030303"/><g transform="translate(383,20) scale(.67)">${front}</g><text x="600" y="578" text-anchor="middle" fill="#777770" font-family="monospace" font-size="10" letter-spacing="4">CHARBEL OCHOA</text></svg>`;
await writeFile(`${output}/banner.svg`, banner);
const titles = ['EL ARQUITECTO', 'EL OBSERVADOR', 'EL ECO'];
const collection = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600" role="img" aria-label="Three original ASCII studies of Charbel Ochoa’s masked, hooded identity"><rect width="1200" height="600" fill="#080808"/>${['front','profile','signal'].map((variant,i) => `<path d="M${i*400+25} 25h350v500h-350Z" fill="none" stroke="#282828"/><g transform="translate(${i*400+25},37) scale(.538)">${makeArt(variant).svg.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g><text x="${i*400+42}" y="562" fill="#aaa" font-family="monospace" font-size="12" letter-spacing="1">0${i+1} / ${titles[i]}</text>`).join('')}</svg>`;
await writeFile(`${output}/collection.svg`, collection);
await writeFile(`${output}/mark.svg`, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#090909"/><path d="M20 5 31 13 32 25 20 36 8 25 9 13Z" fill="none" stroke="#ddd" stroke-width="1.4"/><path d="m9 13 11 5 11-5M20 18v18M8 25l12-7 12 7M12 21l4 1m8 0 4-1" fill="none" stroke="#777" stroke-width="1.2"/></svg>');
console.log('Generated three original ASCII portraits, text editions, banner, and mark.');
