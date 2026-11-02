// Obstáculos, íconos y efectos.
import { makeCanvas, outline, addImage } from './pixel.js';

const INK = '#2b1d2e';

function puddle() {
  const { c, p } = makeCanvas(30, 8);
  p.ellipse(15, 4, 13, 3, '#3e7cc9');
  p.ellipse(13, 3, 8, 1, '#6fb1f2');
  p.px(8, 3, '#ffffff'); p.px(9, 3, '#ffffff'); p.px(20, 5, '#cfe8ff');
  outline(c, '#1f4a80');
  return c;
}

// Barrera alta con hueco abajo: Sofía se desliza por debajo.
function fence() {
  const { c, p } = makeCanvas(32, 27);
  p.rect(2, 6, 3, 20, '#8d6e63');
  p.rect(27, 6, 3, 20, '#8d6e63');
  p.rect(3, 6, 1, 20, '#a98274');
  p.rect(28, 6, 1, 20, '#a98274');
  for (let y = 1; y < 8; y++) {
    for (let x = 1; x < 31; x++) p.px(x, y, (x + y) % 8 < 4 ? '#ffd23f' : '#2b2b2b');
  }
  outline(c, INK);
  return c;
}

// Silla de plástico roja vista de lado.
function chair() {
  const { c, p } = makeCanvas(18, 22);
  p.rect(3, 2, 3, 11, '#e5383b');
  p.rect(3, 2, 1, 11, '#ff6b6b');
  p.rect(3, 11, 12, 3, '#e5383b');
  p.rect(4, 11, 10, 1, '#ff6b6b');
  p.line(4, 14, 3, 20, '#c92a2d', 2);
  p.line(13, 14, 14, 20, '#c92a2d', 2);
  p.line(4, 17, 13, 17, '#c92a2d', 1);
  outline(c, INK);
  return c;
}

// Mesa larga de fiesta con mantel de cuadros: Sofía se desliza por encima.
function table() {
  const { c, p } = makeCanvas(46, 20);
  p.rect(1, 4, 44, 3, '#c1121f');
  for (let x = 1; x < 45; x += 4) { p.rect(x, 4, 2, 3, '#f4f1e8'); p.rect(x + 2, 7, 2, 3, '#c1121f'); p.rect(x, 7, 2, 3, '#f4f1e8'); }
  p.rect(4, 10, 2, 10, '#6d4c41'); p.rect(40, 10, 2, 10, '#6d4c41');
  p.line(5, 14, 41, 14, '#5a3d32');
  p.rect(10, 1, 3, 3, '#ffd23f'); p.rect(30, 2, 4, 2, '#80ed99'); // cosas sobre la mesa
  outline(c, INK);
  return c;
}

// Barda de ladrillo alta: Sofía corre por la pared y la salta.
function wall() {
  const { c, p } = makeCanvas(16, 42);
  p.rect(1, 1, 14, 41, '#b5523b');
  for (let y = 1; y < 42; y += 4) {
    p.rect(1, y, 14, 1, '#8c3d2b');
    const off = (y / 4) % 2 ? 0 : 4;
    for (let x = 1 + off; x < 15; x += 8) p.rect(x, y + 1, 1, 3, '#8c3d2b');
  }
  p.rect(0, 0, 16, 2, '#9e9e9e');
  outline(c, INK);
  return c;
}

// Hoyo enorme en la banqueta: se brinca de un lado a otro como si volara.
function hole() {
  const { c, p } = makeCanvas(50, 14);
  p.ellipse(25, 6, 24, 6, '#3b2a20');
  p.ellipse(25, 7, 21, 5, '#1d1410');
  p.ellipse(25, 8, 16, 3, '#0d0907');
  for (const x of [4, 12, 38, 45]) p.rect(x, 1, 3, 2, '#9c8b75'); // piedritas del borde
  p.rect(2, 12, 46, 2, '#7a6a55');
  return c;
}

function chalk() {
  const { c, p } = makeCanvas(14, 5);
  p.rect(0, 2, 9, 1, '#f4f1e8');
  p.line(9, 0, 12, 2, '#f4f1e8');
  p.line(9, 4, 12, 2, '#f4f1e8');
  return c;
}

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
  addImage(scene, 'puddle', puddle());
  addImage(scene, 'fence', fence());
  addImage(scene, 'chair', chair());
  addImage(scene, 'chalk', chalk());
  addImage(scene, 'table', table());
  addImage(scene, 'wall', wall());
  addImage(scene, 'hole', hole());
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
