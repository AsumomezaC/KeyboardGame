// Avisos breves sobre el juego (esquina superior derecha) con un ícono en pixel art y texto.
// Hoy solo los usa el modo desarrollador (estrella); la música tiene su propio selector de volumen.
const TOAST_MS = 1600;
let timer = 0;

// Cuadrícula de 16×16: cada [x, y, ancho, alto] es un bloque.
const STAR = [[7, 1, 2, 3], [6, 4, 4, 2], [1, 6, 14, 2], [3, 8, 10, 2], [4, 10, 8, 2], [3, 12, 3, 2], [10, 12, 3, 2], [2, 14, 2, 1], [12, 14, 2, 1]];

const rects = (list, color) => list.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`).join('');

export function showDevToast(text) {
  showToast(`<svg viewBox="0 0 16 16" aria-hidden="true">${rects(STAR, '#e8a400')}</svg>`, text);
}

function showToast(iconHtml, text) {
  const el = document.getElementById('music-toast');
  if (!el) return;
  clearTimeout(timer);
  el.innerHTML = `${iconHtml}<span>${text}</span>`;
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
