(() => {
  'use strict';
  const portrait = document.querySelector('#portrait');
  const descriptions = {
    front: 'Retrato ASCII frontal: máscara negra facetada, gorra y capucha en la oscuridad',
    profile: 'Figura ASCII de tres cuartos: la máscara y el borde de la capucha emergen de la sombra',
    signal: 'Detalle ASCII de la máscara geométrica negra bajo la gorra y la capucha',
  };
  document.querySelectorAll('[data-portrait]').forEach(button => {
    button.addEventListener('click', () => {
      const name = button.dataset.portrait;
      if (!descriptions[name]) return;
      portrait.src = `assets/identity/${name}.svg`;
      portrait.alt = descriptions[name];
      document.querySelectorAll('[data-portrait]').forEach(option => {
        option.classList.toggle('selected', option === button);
        option.setAttribute('aria-pressed', String(option === button));
      });
    });
  });
  const dialog = document.querySelector('#signal-dialog');
  const answer = document.querySelector('#signal-answer');
  const form = document.querySelector('#signal-form');
  const status = document.querySelector('#signal-status');
  const challenges = window.OBSIDIAN_SIGNALS || [];
  let stage = 0;
  let checking = false;
  const storageKey = 'co.signal.v2';
  try { stage = Math.min(challenges.length, Math.max(0, Math.floor(Number(localStorage.getItem(storageKey))) || 0)); } catch { /* Private browsing still works. */ }
  function showStage() {
    document.querySelector('#signal-stage').textContent = String(stage).padStart(2, '0');
    document.querySelector('#signal-cipher').textContent = stage < challenges.length ? challenges[stage].cipher : 'NADIE DETRÁS DE LA MÁSCARA.';
    form.hidden = stage >= challenges.length;
    document.querySelector('#signal-reset').hidden = stage < challenges.length;
    status.textContent = '';
    answer.value = '';
  }
  function openSignal() { showStage(); dialog.showModal(); if (!form.hidden) answer.focus(); }
  document.querySelector('#signal-trigger').addEventListener('click', openSignal);
  document.querySelector('#signal-close').addEventListener('click', () => dialog.close());
  document.querySelector('#signal-reset').addEventListener('click', () => {
    stage = 0;
    try { localStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
    showStage();
    answer.focus();
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === '?' && !dialog.open && !event.target.closest('input,textarea,[contenteditable]')) openSignal();
  });
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (checking || stage >= challenges.length) return;
    checking = true;
    try {
      const bytes = new TextEncoder().encode(normalize(answer.value));
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      const hex = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
      if (hex === challenges[stage].hash) {
        stage++;
        try { localStorage.setItem(storageKey, String(stage)); } catch { /* Storage is optional. */ }
        showStage();
        if (!form.hidden) answer.focus();
      } else { status.textContent = '∅'; answer.select(); }
    } catch { status.textContent = '∅'; }
    finally { checking = false; }
  });
})();
