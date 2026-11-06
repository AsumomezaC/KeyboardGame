// Ícono de música en pixel art (16×16): una bocina con 0 a 3 ondas según el volumen, o con una
// X cuando está en silencio. Lo usan el panel HTML (SVG) y las texturas del juego (canvas).

// Cada [x, y, ancho, alto] es un bloque.
export const SPEAKER = [[1, 6, 3, 4], [4, 5, 1, 6], [5, 4, 1, 8], [6, 3, 1, 10], [7, 2, 1, 12]];
const WAVES = [
  [[9, 6, 1, 4], [10, 7, 1, 2]],
  [[11, 4, 1, 1], [12, 5, 1, 6], [11, 11, 1, 1]],
  [[13, 2, 1, 1], [14, 3, 1, 10], [13, 13, 1, 1]],
];
export const CROSS = [0, 1, 2, 3, 4].flatMap(k => [[9 + k, 5 + k, 2, 2], [13 - k, 5 + k, 2, 2]]);

// 0 = silencio, 1-3 = cuántas ondas.
export function volumeLevel(v) {
  if (v <= 0) return 0;
  if (v < 0.34) return 1;
  if (v < 0.67) return 2;
  return 3;
}

// Bloques del ícono para un nivel: { speaker, extra, muted }.
export function volumeIcon(level) {
  return level === 0
    ? { speaker: SPEAKER, extra: CROSS, muted: true }
    : { speaker: SPEAKER, extra: WAVES.slice(0, level).flat(), muted: false };
}

const rects = (list, color) => list.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`).join('');

export function volumeSvg(v, { ink = '#2b1d2e', wave = '#2f7d3a', cross = '#c1121f' } = {}) {
  const { speaker, extra, muted } = volumeIcon(volumeLevel(v));
  return `<svg viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges">${rects(speaker, ink)}${rects(extra, muted ? cross : wave)}</svg>`;
}
