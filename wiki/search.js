const input = document.querySelector('[name="q"]');
const sections = [...document.querySelectorAll('[data-category]')];
const status = document.querySelector('#result-count');
const simplify = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
function filter() {
  const words = simplify(input.value.trim()).split(/\s+/);
  let count = 0;
  for (const section of sections) {
    const rows = [...section.querySelectorAll('li')];
    for (const row of rows) {
      const text = simplify(row.textContent + ' ' + section.querySelector('h2').textContent);
      row.hidden = !words.every((word) => text.includes(word));
      if (!row.hidden) count++;
    }
    section.hidden = Boolean(input.value.trim()) && rows.every((row) => row.hidden);
  }
  status.textContent = input.value.trim()
    ? count
      ? `${count} resultado${count === 1 ? '' : 's'}`
      : 'No se encontraron artículos.'
    : '';
}
if (!input.value) input.value = new URLSearchParams(location.search).get('q') || '';
input.addEventListener('input', filter);
filter();

document.querySelectorAll('nav a[href^="/wiki/#"]').forEach((link) => {
  link.addEventListener('click', () => {
    input.value = '';
    filter();
    document.querySelector('.menu').open = false;
  });
});
