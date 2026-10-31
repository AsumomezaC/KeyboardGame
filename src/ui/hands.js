// Diagrama de las dos manos sobre la fila central; cada dedo se puede resaltar.
import { FINGER_COLORS } from '../core/fingers.js';

const FINGERS = [
  { finger: 'pinky', x: 20, y: 48, h: 46, key: 'A' },
  { finger: 'ring', x: 48, y: 34, h: 60, key: 'S' },
  { finger: 'middle', x: 76, y: 28, h: 66, key: 'D' },
  { finger: 'index', x: 104, y: 38, h: 56, key: 'F' },
];
const RIGHT_KEYS = { pinky: 'Ñ', ring: 'L', middle: 'K', index: 'J' };
const W = 420;

export function createHands(container) {
  const parts = [];
  for (const hand of ['L', 'R']) {
    const mirror = x => (hand === 'L' ? x : W - x);
    for (const f of FINGERS) {
      const x = hand === 'L' ? f.x : W - f.x - 22;
      parts.push(`<rect data-f="${hand}-${f.finger}" x="${x}" y="${f.y}" width="22" height="${f.h}" rx="11" fill="${FINGER_COLORS[f.finger]}"/>`);
      const key = hand === 'L' ? f.key : RIGHT_KEYS[f.finger];
      parts.push(`<text data-k="${hand}-${f.finger}" x="${mirror(f.x + 11)}" y="22">${key}</text>`);
    }
    const tx = hand === 'L' ? 124 : W - 124 - 44;
    const rot = hand === 'L' ? `rotate(-25 124 106)` : `rotate(25 ${W - 124} 106)`;
    parts.push(`<rect data-f="${hand}-thumb" x="${tx}" y="96" width="44" height="20" rx="10" transform="${rot}" fill="${FINGER_COLORS.thumb}"/>`);
    parts.push(`<rect class="palm" x="${hand === 'L' ? 18 : W - 18 - 110}" y="86" width="110" height="44" rx="16"/>`);
  }
  container.innerHTML =
    `<svg class="hands" viewBox="0 0 ${W} 150" role="img" aria-label="Posición de las manos: índices sobre F y J">` +
    parts.join('') +
    `<text class="hands-title" x="${W / 2}" y="46">Índices sobre F y J</text>` +
    `<text class="hands-sub" x="${W / 2}" y="64">(tienen un relieve)</text>` +
    `<text class="hands-sub" x="${W / 2}" y="142">Pulgares: Espacio</text>` +
    '</svg>';
  const svg = container.querySelector('svg');

  return {
    // fingers: lista como ['L-index'] o ['L-thumb', 'R-thumb']; vacía = todos normales.
    highlight(fingers = []) {
      svg.classList.toggle('focus', fingers.length > 0);
      for (const el of svg.querySelectorAll('[data-f], [data-k]')) {
        const id = el.dataset.f || el.dataset.k;
        el.classList.toggle('on', fingers.includes(id));
      }
    },
  };
}
