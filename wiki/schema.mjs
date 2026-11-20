export const categories = {
  proyecto: 'Proyectos',
  investigacion: 'Investigaciones',
  repositorio: 'Repositorios',
  documento: 'Documentos',
  bitacora: 'Bitácora',
};
export const maxPdf = 20 * 1024 * 1024;
export function validSlug(slug) {
  return (
    typeof slug === 'string' &&
    slug.length <= 80 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
    !['autor', 'archivos', 'buscar', 'assets'].includes(slug) &&
    !/^dsp-\d+$/.test(slug)
  );
}
export function validateArticle(a) {
  if (!Object.hasOwn(categories, a.category)) throw new Error('Selecciona una categoría válida.');
  for (const [key, max] of [
    ['title', 160],
    ['summary', 500],
    ['body', 200000],
    ['url', 2048],
  ]) {
    if (typeof a[key] !== 'string' || a[key].length > max)
      throw new Error('Revisa la longitud de los campos.');
  }
  if (!a.title.trim() || !a.body.trim())
    throw new Error('Escribe un título y el contenido del artículo.');
  if (a.url) {
    let u;
    try {
      u = new URL(a.url);
    } catch {
      throw new Error('Escribe una URL completa.');
    }
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password)
      throw new Error('Usa un enlace web http o https.');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.updated)) throw new Error('Fecha no válida.');
}
