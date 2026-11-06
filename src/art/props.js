// Obstáculos, íconos y efectos.
import { makeCanvas, outline, addImage } from './pixel.js';

const INK = '#2b1d2e';

// Letras de 3×5 px (M y W de 5, N de 4) para grafitis y carteles.
const GLYPHS = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  C: ['###', '#..', '#..', '#..', '###'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  G: ['###', '#..', '#.#', '#.#', '###'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  O: ['###', '#.#', '#.#', '#.#', '###'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['###', '#..', '###', '..#', '###'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  0: ['###', '#.#', '#.#', '#.#', '###'],
  5: ['###', '#..', '###', '..#', '###'],
};
const ACCENTED = { Á: 'A' };

function textWidth(str) {
  let w = 0;
  for (const ch of str) w += ch === ' ' ? 2 : GLYPHS[ACCENTED[ch] || ch][0].length + 1;
  return w - 1;
}

// Escribe en pixeles, con sombra opcional (para que el grafiti resalte sobre el ladrillo).
function pixelText(p, x, y, str, color, shadow) {
  for (const ch of str) {
    if (ch === ' ') { x += 2; continue; }
    const base = ACCENTED[ch] || ch;
    const rows = GLYPHS[base];
    rows.forEach((row, dy) => [...row].forEach((c, dx) => {
      if (c !== '#') return;
      if (shadow) p.px(x + dx + 1, y + dy + 1, shadow);
      p.px(x + dx, y + dy, color);
    }));
    if (ACCENTED[ch]) p.px(x + rows[0].length - 1, y - 2, color);
    x += rows[0].length + 1;
  }
}

function puddle(v) {
  const [deep, light, rim] = [['#3e7cc9', '#6fb1f2', '#1f4a80'], ['#7a5230', '#a0764a', '#4e331c']][v];
  const { c, p } = makeCanvas(30, 8);
  p.ellipse(15, 4, 13, 3, deep);
  p.ellipse(13, 3, 8, 1, light);
  p.px(8, 3, '#ffffff'); p.px(9, 3, v ? light : '#ffffff'); p.px(20, 5, v ? light : '#cfe8ff');
  if (v === 1) { p.px(18, 2, '#4f8a3a'); p.px(19, 3, '#4f8a3a'); } // una hojita flotando
  outline(c, rim);
  return c;
}

// Barrera alta con hueco abajo: Sofía se desliza por debajo.
function fence(v) {
  const [a, b] = [['#ffd23f', '#2b2b2b'], ['#e94f64', '#f4f1e8'], ['#f77f00', '#f4f1e8']][v];
  const { c, p } = makeCanvas(32, 27);
  p.rect(2, 6, 3, 20, '#8d6e63');
  p.rect(27, 6, 3, 20, '#8d6e63');
  p.rect(3, 6, 1, 20, '#a98274');
  p.rect(28, 6, 1, 20, '#a98274');
  for (let y = 1; y < 8; y++) {
    for (let x = 1; x < 31; x++) p.px(x, y, (x + y) % 8 < 4 ? a : b);
  }
  outline(c, INK);
  return c;
}

// Silla de plástico vista de lado, de distintos colores (como en cualquier fiesta).
const CHAIR_COLORS = [
  ['#e5383b', '#ff6b6b', '#c92a2d'], ['#3a86ff', '#72a7ff', '#2a5fc0'], ['#2a9d8f', '#5cc8b8', '#1f7a6f'],
  ['#f4b400', '#ffd54f', '#c48f00'], ['#dfe7ec', '#ffffff', '#a9b5bc'],
];
function chair(v) {
  const [main, light, dark] = CHAIR_COLORS[v];
  const { c, p } = makeCanvas(18, 22);
  p.rect(3, 2, 3, 11, main);
  p.rect(3, 2, 1, 11, light);
  p.rect(3, 11, 12, 3, main);
  p.rect(4, 11, 10, 1, light);
  p.line(4, 14, 3, 20, dark, 2);
  p.line(13, 14, 14, 20, dark, 2);
  p.line(4, 17, 13, 17, dark, 1);
  outline(c, INK);
  return c;
}

// Mesa larga de fiesta: Sofía se desliza por encima. Cambian el mantel y lo que hay encima.
const CLOTHS = [['#c1121f', '#f4f1e8'], ['#3d5aa8', '#f4f1e8'], ['#2a9d8f', '#fff3b0'], ['#9b5de5', '#f4f1e8']];
function table(v) {
  const [a, b] = CLOTHS[v];
  const { c, p } = makeCanvas(46, 20);
  p.rect(1, 4, 44, 3, a);
  for (let x = 1; x < 45; x += 4) { p.rect(x, 4, 2, 3, b); p.rect(x + 2, 7, 2, 3, a); p.rect(x, 7, 2, 3, b); }
  p.rect(4, 10, 2, 10, '#6d4c41'); p.rect(40, 10, 2, 10, '#6d4c41');
  p.line(5, 14, 41, 14, '#5a3d32');
  if (v === 0) { p.rect(10, 1, 3, 3, '#ffd23f'); p.rect(30, 2, 4, 2, '#80ed99'); }
  if (v === 1) { p.rect(18, 0, 8, 4, '#f4f1e8'); p.rect(18, 0, 8, 1, '#e94f64'); } // pastel
  if (v === 2) { p.rect(8, 1, 6, 3, '#d9a066'); p.rect(30, 1, 6, 3, '#d9a066'); } // pan dulce
  if (v === 3) { for (const x of [12, 20, 28]) { p.rect(x, 1, 3, 3, '#e94f64'); p.px(x + 1, 0, '#4f8a3a'); } } // jarritos
  outline(c, INK);
  return c;
}

// Barda larga de ladrillo con cemento fresco al pie (con conos): por eso Sofía corre por la
// pared. Cada barda tiene su grafiti o cartel: la firma del desarrollador, Los Gatos, el apodo
// que Sofía tendrá en el capítulo 2 y el cartel de la carrera del capítulo 3.
function wall(v) {
  const W = 50, H = 46, BASE = 36;
  const { c, p } = makeCanvas(W, H);
  p.rect(1, 2, W - 2, BASE - 2, '#b5523b');
  for (let y = 2; y < BASE; y += 4) {
    p.rect(1, y, W - 2, 1, '#8c3d2b');
    const off = (y / 4) % 2 ? 0 : 4;
    for (let x = 1 + off; x < W - 1; x += 8) p.rect(x, y + 1, 1, 3, '#8c3d2b');
  }
  p.rect(0, 0, W, 3, '#9e9e9e');
  const center = str => Math.round((W - textWidth(str)) / 2);
  if (v === 0) {
    // gato de Los Gatos
    p.rect(18, 12, 12, 7, '#2a9d8f'); p.rect(18, 9, 2, 3, '#2a9d8f'); p.rect(28, 9, 2, 3, '#2a9d8f');
    p.px(21, 14, '#fff3b0'); p.px(26, 14, '#fff3b0'); p.rect(30, 16, 5, 1, '#2a9d8f');
  } else if (v === 1) {
    pixelText(p, center('LOS GATOS'), 13, 'LOS GATOS', '#2a9d8f', '#1d1b33');
    p.rect(10, 8, 2, 3, '#2a9d8f'); p.rect(14, 8, 2, 3, '#2a9d8f'); // orejitas
  } else if (v === 2) {
    pixelText(p, center('ASUMOMEZAC'), 12, 'ASUMOMEZAC', '#ffd23f', '#1d1b33');
    p.line(6, 21, 44, 19, '#ffd23f'); // subrayado de aerosol
  } else if (v === 3) {
    pixelText(p, center('RÁFAGA') + 3, 13, 'RÁFAGA', '#e94f64', '#1d1b33');
    p.line(9, 9, 6, 15, '#ffd23f'); p.line(6, 15, 10, 15, '#ffd23f'); p.line(10, 15, 7, 21, '#ffd23f'); // rayo
  } else {
    // cartel de la gran carrera (se pega con cinta)
    p.rect(9, 6, 32, 22, '#fff3b0'); p.rect(9, 6, 32, 3, '#e94f64');
    pixelText(p, center('CARRERA'), 11, 'CARRERA', '#2b1d2e');
    pixelText(p, center('5000'), 19, '5000', '#2f7d3a');
    for (const [x, y] of [[8, 5], [39, 5], [8, 26], [39, 26]]) p.rect(x, y, 3, 2, '#d9d4c7');
  }
  p.rect(0, BASE, W, H - BASE, '#9aa0a6');
  p.rect(0, BASE, W, 1, '#c9ced6');
  for (const x of [12, 20, 31]) { p.rect(x, BASE + 4, 2, 2, '#7d838b'); p.px(x + 1, BASE + 7, '#7d838b'); }
  for (const x of [2, W - 7]) {
    p.rect(x + 2, BASE - 6, 1, 2, '#f77f00'); p.rect(x + 1, BASE - 4, 3, 2, '#f77f00');
    p.rect(x + 1, BASE - 2, 3, 1, '#ffffff'); p.rect(x, BASE - 1, 5, 2, '#f77f00');
  }
  outline(c, INK);
  return c;
}

// Hoyo enorme en la banqueta: se brinca como si volara. Uno trae cinta de precaución.
function hole(v) {
  const { c, p } = makeCanvas(50, 14);
  p.ellipse(25, 6, 24, 6, '#3b2a20');
  p.ellipse(25, 7, 21, 5, '#1d1410');
  p.ellipse(25, 8, 16, 3, '#0d0907');
  for (const x of [4, 12, 38, 45]) p.rect(x, 1, 3, 2, '#9c8b75'); // piedritas del borde
  p.rect(2, 12, 46, 2, '#7a6a55');
  if (v === 1) for (let x = 0; x < 50; x++) p.px(x, 0, Math.floor(x / 3) % 2 ? '#2b2b2b' : '#ffd23f');
  return c;
}

function chalk(v) {
  const color = ['#f4f1e8', '#ffd23f', '#f8a5c2'][v];
  const { c, p } = makeCanvas(14, 5);
  p.rect(0, 2, 9, 1, color);
  p.line(9, 0, 12, 2, color);
  p.line(9, 4, 12, 2, color);
  return c;
}

// Cuántas versiones hay de cada obstáculo: la 0 usa la clave simple ('chair'), las demás 'chair-1'…
export const OBSTACLE_VARIANTS = { chalk: 3, puddle: 2, fence: 3, chair: 5, table: 4, wall: 5, hole: 2 };
const OBSTACLE_ART = { chalk, puddle, fence, chair, table, wall, hole };

function finish() {
  const { c, p } = makeCanvas(46, 48);
  p.rect(2, 4, 3, 44, '#9e9e9e');
  p.rect(41, 4, 3, 44, '#9e9e9e');
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 11; x++) p.rect(1 + x * 4, 2 + y * 4, 4, 4, (x + y) % 2 ? '#2b2b2b' : '#ffffff');
  }
  outline(c, INK);
  return c;
}

function star(fill, shade) {
  const { c, p } = makeCanvas(11, 11);
  const rows = ['    #    ', '   ###   ', '#########', ' ####### ', '  #####  ', ' ### ### ', ' ##   ## '];
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '#') p.px(x + 1, y + 2, y > 3 ? shade : fill); }));
  outline(c, INK);
  return c;
}

function padlock() {
  const { c, p } = makeCanvas(11, 12);
  p.rect(3, 1, 5, 1, '#9aa0a6'); p.rect(2, 2, 1, 4, '#9aa0a6'); p.rect(8, 2, 1, 4, '#9aa0a6');
  p.rect(1, 5, 9, 6, '#f2b632');
  p.rect(5, 7, 1, 2, INK);
  outline(c, INK);
  return c;
}

function trophy() {
  const { c, p } = makeCanvas(14, 14);
  p.rect(3, 1, 8, 6, '#ffd23f'); p.rect(4, 7, 6, 1, '#ffd23f'); p.rect(6, 8, 2, 2, '#e8a400');
  p.rect(4, 10, 6, 2, '#8d6e63');
  p.px(2, 2, '#ffd23f'); p.px(1, 3, '#ffd23f'); p.px(2, 4, '#ffd23f');
  p.px(11, 2, '#ffd23f'); p.px(12, 3, '#ffd23f'); p.px(11, 4, '#ffd23f');
  p.px(5, 2, '#fff3b0');
  outline(c, INK);
  return c;
}

function dogHead() {
  const { c, p } = makeCanvas(14, 12);
  p.disc(6, 6, 4, '#3b2f2a'); p.rect(8, 6, 5, 3, '#3b2f2a');
  p.px(4, 1, '#3b2f2a'); p.px(5, 2, '#3b2f2a');
  p.px(7, 4, '#ffdd55'); p.px(12, 6, INK); p.px(10, 8, '#ffffff');
  outline(c, '#140d0b');
  return c;
}

function mystery() {
  const { c, p } = makeCanvas(12, 12);
  p.disc(6, 6, 5, '#7b2cbf');
  const q = ['###', '  #', ' # ', '   ', ' # '];
  q.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '#') p.px(x + 5, y + 4, '#ffffff'); }));
  outline(c, INK);
  return c;
}

// Letrero de madera con cinta de precaución para los capítulos en construcción.
function constructionSign() {
  const { c, p } = makeCanvas(70, 44);
  p.rect(10, 26, 3, 18, '#6d4c41'); p.rect(57, 26, 3, 18, '#6d4c41');
  p.rect(2, 4, 66, 26, '#c8955c');
  for (let x = 2; x < 68; x += 6) p.rect(x, 4, 1, 26, '#b07d48');
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 70; x++) {
      const yy = 42 - Math.round(x * 0.28) + y; // cinta en la parte baja: el texto queda libre
      if (yy > 0 && yy < 44) p.px(x, yy, (x + y) % 10 < 5 ? '#ffd23f' : '#222222');
    }
  }
  outline(c, INK);
  return c;
}

function dot(color, size) {
  const { c, p } = makeCanvas(size, size);
  p.rect(0, 0, size, size, color);
  return c;
}

export function buildProps(scene) {
  for (const [key, n] of Object.entries(OBSTACLE_VARIANTS)) {
    for (let v = 0; v < n; v++) addImage(scene, v ? `${key}-${v}` : key, OBSTACLE_ART[key](v));
  }
  addImage(scene, 'finish', finish());
  addImage(scene, 'star-on', star('#ffd23f', '#e8a400'));
  addImage(scene, 'star-off', star('#5a5878', '#4a4866'));
  addImage(scene, 'padlock', padlock());
  addImage(scene, 'trophy', trophy());
  addImage(scene, 'dog-head', dogHead());
  addImage(scene, 'mystery', mystery());
  addImage(scene, 'sign', constructionSign());
  addImage(scene, 'drop', dot('#6fb1f2', 2));
  addImage(scene, 'dust', dot('#d8c3a5', 2));
  addImage(scene, 'spark', dot('#fff3b0', 2));
}
