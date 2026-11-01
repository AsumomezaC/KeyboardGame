// Piezas compartidas por las escenas: textos con contorno, fondo con paralaje y cajas de diálogo.
import Phaser from 'phaser';
import { THEMES, FAR, MID, GROUND } from '../art/backgrounds.js';
import { Music } from '../audio/music.js';

export const W = 960;
export const H = 540;
export const SCALE = 3;
export const GROUND_TOP = 444; // donde empieza el suelo en pantalla
export const FEET_Y = 458;     // donde pisan los personajes
export const FONT = '"Pixelify Sans", monospace';
export const INK = '#2b1d2e';
export const CREAM = '#fff7e0';

export function text(scene, x, y, str, size = 20, color = '#ffffff', opts = {}) {
  return scene.add.text(x, y, str, {
    fontFamily: FONT,
    fontSize: `${size}px`,
    fontStyle: opts.bold === false ? 'normal' : 'bold',
    color,
    stroke: opts.stroke ?? INK,
    strokeThickness: opts.strokeThickness ?? Math.max(3, Math.round(size / 5)),
    align: opts.align || 'left',
    wordWrap: opts.wrap ? { width: opts.wrap } : undefined,
    lineSpacing: opts.lineSpacing ?? 4,
  }).setOrigin(opts.ox ?? 0, opts.oy ?? 0);
}

// Caja estilo consola portátil: borde oscuro, borde interior dorado y fondo crema.
export function box(scene, x, y, w, h, { fill = CREAM, alpha = 1 } = {}) {
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.25).fillRoundedRect(x + 4, y + 5, w, h, 10);
  g.fillStyle(Phaser.Display.Color.HexStringToColor(INK).color, 1).fillRoundedRect(x, y, w, h, 10);
  g.fillStyle(0xc9a66b, 1).fillRoundedRect(x + 4, y + 4, w - 8, h - 8, 8);
  g.fillStyle(Phaser.Display.Color.HexStringToColor(fill).color, alpha).fillRoundedRect(x + 7, y + 7, w - 14, h - 14, 6);
  return g;
}

// Cielo, capa lejana, capa media y suelo. scroll(x) mueve las capas con paralaje.
export function backdrop(scene, theme) {
  const t = THEMES[theme];
  const sky = scene.add.graphics();
  const top = Phaser.Display.Color.HexStringToColor(t.sky[0]).color;
  const bottom = Phaser.Display.Color.HexStringToColor(t.sky[1]).color;
  sky.fillGradientStyle(top, top, bottom, bottom, 1).fillRect(0, 0, W, GROUND_TOP);
  if (t.stars) {
    const r = new Phaser.Math.RandomDataGenerator(['estrellas']);
    for (let i = 0; i < 70; i++) sky.fillStyle(0xffffff, r.realInRange(0.3, 1)).fillRect(r.between(0, W), r.between(0, 260), 2, 2);
  }
  const far = scene.add.tileSprite(0, GROUND_TOP - FAR.h * SCALE + 30, W / SCALE, FAR.h, `far-${theme}`).setOrigin(0).setScale(SCALE);
  const mid = scene.add.tileSprite(0, GROUND_TOP - MID.h * SCALE, W / SCALE, MID.h, `mid-${theme}`).setOrigin(0).setScale(SCALE);
  const ground = scene.add.tileSprite(0, GROUND_TOP, W / SCALE, GROUND.h, `ground-${theme}`).setOrigin(0).setScale(SCALE);
  return {
    scroll(x) {
      far.tilePositionX = (x * 0.15) / SCALE;
      mid.tilePositionX = (x * 0.45) / SCALE;
      ground.tilePositionX = x / SCALE;
    },
  };
}

// Atajos de teclado para menús, sin capturar teclas (no interfieren con el texto).
// La M prende o apaga la música en cualquier menú.
export function onKeys(scene, map) {
  scene.input.keyboard.on('keydown', e => {
    const fn = map[e.key];
    if (fn) fn(e);
    else if (e.key === 'm' || e.key === 'M') Music.toggleMute();
  });
}

// Barra inferior con las teclas disponibles: cada tecla en su propia tapa, seguida de lo que hace.
// items: [['Enter', 'jugar'], ['Esc', 'volver'], ...]
export function keyLegend(scene, items) {
  const BAR_H = 40;
  const y = H - BAR_H / 2;
  const bar = scene.add.rectangle(0, H - BAR_H, W, BAR_H, 0x000000, 0.55).setOrigin(0).setScrollFactor(0).setDepth(100);
  const parts = items.map(([key, label]) => {
    const cap = scene.add.text(0, y, key, {
      fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: INK,
      backgroundColor: CREAM, padding: { x: 8, y: 3 },
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    const desc = text(scene, 0, y, label, 16, '#ffffff', { oy: 0.5, bold: false, strokeThickness: 0 }).setScrollFactor(0).setDepth(100);
    return { cap, desc, w: cap.width + 8 + desc.width };
  });
  const GAP = 28;
  let x = (W - parts.reduce((n, p) => n + p.w, 0) - GAP * (parts.length - 1)) / 2;
  for (const p of parts) {
    p.cap.x = x;
    p.desc.x = x + p.cap.width + 8;
    x += p.w + GAP;
  }
  return bar;
}

export function stars(scene, x, y, count, { gap = 30, scale = 3 } = {}) {
  return [0, 1, 2].map(i =>
    scene.add.image(x + (i - 1) * gap, y, i < count ? 'star-on' : 'star-off').setScale(scale));
}

export function formatTime(ms) {
  return `${(ms / 1000).toFixed(1)} s`;
}
