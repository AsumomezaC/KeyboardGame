// Aviso que aparece sobre el juego al prender o apagar la música: bocina en pixel art con
// ondas (sonando) o con una X roja (silenciada), más el texto para quien no distinga el ícono.
const TOAST_MS = 1600;
let timer = 0;

// Cuadrícula de 16×16: cada [x, y, ancho, alto] es un bloque.
const SPEAKER = [[2, 6, 3, 4], [5, 5, 1, 6], [6, 4, 1, 8], [7, 3, 1, 10], [8, 2, 1, 12]];
const WAVES = [[10, 6, 1, 4], [11, 5, 1, 1], [11, 10, 1, 1], [12, 3, 1, 2], [13, 5, 1, 6], [12, 11, 1, 2]];
const CROSS = [0, 1, 2, 3, 4].flatMap(k => [[10 + k, 5 + k, 2, 2], [14 - k, 5 + k, 2, 2]]);

const rects = (list, color) => list.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`).join('');

function icon(muted) {
  return `<svg viewBox="0 0 16 16" aria-hidden="true">${rects(SPEAKER, '#2b1d2e')}` +
    `${muted ? rects(CROSS, '#c1121f') : rects(WAVES, '#2f7d3a')}</svg>`;
}

export function showMusicToast(muted) {
  const el = document.getElementById('music-toast');
  if (!el) return;
  clearTimeout(timer);
  el.innerHTML = `${icon(muted)}<span>${muted ? 'Música apagada' : 'Música encendida'}</span>`;
  el.classList.remove('leaving');
  el.hidden = false;
  // reinicia la animación de entrada
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
  timer = setTimeout(() => {
    el.classList.add('leaving');
    timer = setTimeout(() => { el.hidden = true; }, 300);
  }, TOAST_MS);
}
