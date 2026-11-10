// Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
// Perro guardián (nivel 7): galope de 4 cuadros y un cuadro ladrando.
import { makeCanvas, outline, addSheet } from './pixel.js';

const W = 32, H = 20;
const PAL = {
  fur: '#3b2f2a', furLight: '#5c4838', belly: '#6b5442', collar: '#d43d3d', spike: '#cfd8dc',
  eye: '#ffdd55', teeth: '#ffffff', mouth: '#7a1f1f', outline: '#140d0b',
};

// [frente lejana, frente cercana, trasera lejana, trasera cercana] como desplazamiento del pie.
const GALLOP = [
  { f: [5, 4], b: [-5, -4], back: 0 },
  { f: [1, 0], b: [2, 3], back: -1 },
  { f: [-3, -2], b: [5, 4], back: 0 },
  { f: [2, 3], b: [-1, 0], back: 1 },
];

function drawDog(p, g, barking) {
  const by = 10 + g.back;
  // cola levantada
  p.line(7, by - 2, 3, by - 6, PAL.fur, 2);
  // patas lejanas (más oscuras)
  p.line(20, by + 2, 20 + g.f[0], 18, PAL.fur, 2);
  p.line(10, by + 2, 10 + g.b[0], 18, PAL.fur, 2);
  // cuerpo
  p.ellipse(15, by, 9, 4, PAL.fur);
  p.ellipse(16, by + 2, 6, 2, PAL.belly);
  p.line(9, by - 3, 20, by - 3, PAL.furLight, 1);
  // patas cercanas
  p.line(21, by + 2, 21 + g.f[1], 18, PAL.furLight, 2);
  p.line(11, by + 2, 11 + g.b[1], 18, PAL.furLight, 2);
  // cabeza y hocico
  p.disc(24, by - 4, 4, PAL.fur);
  p.rect(26, by - 4, 5, 3, PAL.fur);
  p.px(23, by - 9, PAL.fur); p.px(22, by - 8, PAL.fur); p.px(23, by - 8, PAL.fur); // oreja
  p.px(25, by - 6, PAL.eye);
  p.px(30, by - 4, PAL.outline); // nariz
  if (barking) {
    p.rect(27, by - 1, 4, 2, PAL.mouth);
    p.px(28, by - 1, PAL.teeth); p.px(30, by - 1, PAL.teeth);
  } else {
    p.px(28, by - 2, PAL.teeth);
  }
  // collar con picos
  p.line(21, by - 6, 21, by - 1, PAL.collar, 2);
  p.px(23, by - 6, PAL.spike); p.px(23, by - 3, PAL.spike);
}

export function buildDogSheet(scene) {
  const frames = GALLOP.map((g, i) => {
    const { c, p } = makeCanvas(W, H);
    drawDog(p, g, false);
    outline(c, PAL.outline);
    return { name: `run${i}`, canvas: c };
  });
  const { c, p } = makeCanvas(W, H);
  drawDog(p, GALLOP[1], true);
  outline(c, PAL.outline);
  frames.push({ name: 'bark', canvas: c });
  addSheet(scene, 'dog', frames, W, H);
}
