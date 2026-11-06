// Detalles del fondo: objetos pequeños que aparecen al pie de las casas, distintos en cada tramo.
// Se dibujan más chicos y apagados que los obstáculos para que se lean como fondo.
import { makeCanvas, outline, addImage } from './pixel.js';

const INK = '#2b1d2e';

function draw(w, h, fn) {
  const { c, p } = makeCanvas(w, h);
  fn(p);
  outline(c, INK);
  return c;
}

const DETAILS = {
  'bg-cat': () => draw(9, 9, p => {
    p.rect(2, 4, 5, 4, '#3b3b44'); p.rect(5, 1, 3, 3, '#3b3b44'); p.px(5, 0, '#3b3b44'); p.px(7, 0, '#3b3b44');
    p.px(6, 2, '#ffd23f'); p.rect(0, 5, 2, 1, '#3b3b44'); p.px(0, 4, '#3b3b44');
  }),
  'bg-bike': () => draw(15, 9, p => {
    for (const cx of [3, 11]) { p.rect(cx - 2, 5, 5, 1, '#2b2b2b'); p.rect(cx - 2, 7, 5, 1, '#2b2b2b'); p.rect(cx - 2, 5, 1, 3, '#2b2b2b'); p.rect(cx + 2, 5, 1, 3, '#2b2b2b'); }
    p.line(3, 6, 7, 3, '#e94f64'); p.line(7, 3, 11, 6, '#e94f64'); p.line(7, 3, 7, 6, '#e94f64'); p.rect(6, 2, 3, 1, '#2b2b2b'); p.rect(10, 1, 2, 1, '#2b2b2b');
  }),
  'bg-bin': () => draw(7, 10, p => { p.rect(1, 2, 5, 8, '#4f7a35'); p.rect(0, 1, 7, 2, '#3d5f29'); p.rect(2, 4, 1, 5, '#3d5f29'); p.rect(4, 4, 1, 5, '#3d5f29'); }),
  'bg-plant': () => draw(8, 11, p => { p.rect(2, 7, 4, 4, '#b5651d'); p.disc(4, 4, 3, '#4f8a3a'); p.px(2, 2, '#e94f64'); p.px(5, 3, '#ffd23f'); }),
  'bg-garrafon': () => draw(6, 10, p => { p.rect(0, 3, 6, 7, '#8ecae6'); p.rect(1, 4, 1, 5, '#cfeffa'); p.rect(2, 0, 2, 3, '#3d5aa8'); }),
  'bg-cart': () => draw(18, 16, p => {
    p.rect(2, 8, 14, 5, '#f4f1e8'); p.rect(2, 8, 14, 1, '#e9c46a'); p.rect(4, 10, 3, 2, '#ffd23f');
    p.rect(8, 1, 1, 7, '#6d4c41'); p.rect(3, 0, 11, 2, '#e94f64'); p.rect(5, 0, 2, 2, '#f4f1e8'); p.rect(9, 0, 2, 2, '#f4f1e8');
    p.rect(4, 13, 3, 3, '#2b2b2b'); p.rect(12, 13, 3, 3, '#2b2b2b');
  }),
  'bg-dog': () => draw(12, 6, p => { p.rect(1, 2, 8, 4, '#a0765a'); p.rect(8, 1, 3, 3, '#a0765a'); p.px(10, 2, INK); p.rect(0, 3, 1, 2, '#a0765a'); p.px(9, 0, '#7d5a43'); }),
  'bg-sign': () => draw(8, 20, p => { p.rect(3, 6, 2, 14, '#9aa0a6'); p.rect(0, 0, 8, 6, '#2a9d8f'); p.rect(1, 2, 6, 1, '#f4f1e8'); p.rect(1, 4, 4, 1, '#f4f1e8'); }),
  'bg-tire': () => draw(8, 8, p => { p.disc(4, 4, 3, '#2b2b2b'); p.disc(4, 4, 1, '#6b6b7b'); }),
  'bg-barrel': () => draw(7, 10, p => { p.rect(0, 0, 7, 10, '#a0522d'); p.rect(0, 2, 7, 1, '#6d3a1f'); p.rect(0, 7, 7, 1, '#6d3a1f'); p.rect(2, 4, 1, 2, '#c97a4a'); }),
  'bg-cone': () => draw(6, 8, p => { p.rect(2, 0, 2, 2, '#f77f00'); p.rect(1, 2, 4, 2, '#ffffff'); p.rect(1, 4, 4, 2, '#f77f00'); p.rect(0, 6, 6, 2, '#f77f00'); }),
  'bg-crate': () => draw(9, 8, p => { p.rect(0, 0, 9, 8, '#c8955c'); p.rect(0, 0, 9, 1, '#a0723f'); p.rect(0, 4, 9, 1, '#a0723f'); p.line(0, 1, 8, 7, '#a0723f'); }),
  'bg-bush': () => draw(14, 8, p => { p.disc(4, 5, 3, '#3f7d3a'); p.disc(9, 4, 4, '#4f9a45'); p.disc(12, 6, 2, '#3f7d3a'); p.px(8, 2, '#e94f64'); }),
  'bg-flowers': () => draw(11, 6, p => { p.rect(0, 4, 11, 2, '#4f8a3a'); for (const [x, c] of [[1, '#e94f64'], [4, '#ffd23f'], [7, '#b388ff'], [9, '#f4f1e8']]) { p.rect(x, 1, 2, 2, c); p.rect(x, 3, 1, 1, '#4f8a3a'); } }),
  'bg-bench': () => draw(15, 8, p => { p.rect(0, 0, 15, 2, '#a0522d'); p.rect(0, 3, 15, 2, '#a0522d'); p.rect(1, 5, 2, 3, '#3d3d46'); p.rect(12, 5, 2, 3, '#3d3d46'); }),
  'bg-lamp': () => draw(6, 24, p => { p.rect(2, 4, 2, 20, '#3d3d46'); p.rect(0, 0, 6, 4, '#3d3d46'); p.rect(1, 1, 4, 2, '#fff3b0'); }),
  'bg-flag': () => draw(8, 18, p => { p.rect(0, 0, 1, 18, '#5b5b66'); p.rect(1, 1, 7, 5, '#e94f64'); p.rect(1, 3, 7, 1, '#f4f1e8'); }),
  'bg-cooler': () => draw(10, 7, p => { p.rect(0, 1, 10, 6, '#3d5aa8'); p.rect(0, 0, 10, 2, '#f4f1e8'); p.rect(3, 0, 4, 1, '#9aa0a6'); }),
  'bg-sack': () => draw(8, 9, p => { p.ellipse(4, 5, 3, 3, '#d9b47a'); p.rect(2, 0, 4, 2, '#c49a5c'); p.rect(3, 5, 2, 1, '#a0723f'); }),
  'bg-basket': () => draw(11, 7, p => { p.rect(0, 3, 11, 4, '#b5651d'); for (let x = 1; x < 11; x += 2) p.px(x, 4, '#8d4a12'); p.disc(3, 2, 1, '#e94f64'); p.disc(6, 2, 1, '#ffd23f'); p.disc(8, 2, 1, '#80ed99'); }),
};

// Qué detalles salen en cada ambiente.
export const THEME_DETAILS = {
  barrio: ['bg-cat', 'bg-bike', 'bg-bin', 'bg-plant', 'bg-garrafon', 'bg-cart', 'bg-dog', 'bg-sign'],
  noche: ['bg-cat', 'bg-bin', 'bg-bike', 'bg-lamp', 'bg-dog', 'bg-sign'],
  parque: ['bg-bush', 'bg-flowers', 'bg-bench', 'bg-lamp', 'bg-dog', 'bg-plant'],
  prohibida: ['bg-tire', 'bg-barrel', 'bg-cone', 'bg-crate', 'bg-bin'],
  carrera: ['bg-flag', 'bg-cooler', 'bg-bin', 'bg-cone'],
  mercado: ['bg-crate', 'bg-sack', 'bg-basket', 'bg-garrafon', 'bg-cart', 'bg-bin'],
};

export function buildDetails(scene) {
  for (const [key, make] of Object.entries(DETAILS)) addImage(scene, key, make());
}
