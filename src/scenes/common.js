// Piezas compartidas por las escenas: textos con contorno, fondo con paralaje y cajas de diálogo.
import Phaser from 'phaser';
import { THEMES, FAR, MID, GROUND } from '../art/backgrounds.js';
import { Music } from '../audio/music.js';
import { Save } from '../core/save.js';
import { PLAYABLE, allLevels } from '../data/chapters.js';
import { showDevToast } from '../ui/music-toast.js';

export const W = 960;
export const H = 540;
export const SCALE = 3;
export const GROUND_TOP = 444; // donde empieza el suelo en pantalla
export const FEET_Y = 458;     // donde pisan los personajes
// Tiny5 (licencia OFL): pixel, de trazo grueso y con buenos acentos, ñ y ¡¿. Solo tiene un
// grosor, así que nunca se pide negrita (el navegador la inventaría y se vería borrosa).
export const FONT = '"Tiny5", monospace';
export const INK = '#2b1d2e';
export const CREAM = '#fff7e0';

export function text(scene, x, y, str, size = 20, color = '#ffffff', opts = {}) {
  return scene.add.text(x, y, str, {
    fontFamily: FONT,
    fontSize: `${size}px`,
    fontStyle: 'normal',
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
// Profundidades del fondo: el cielo y luego el sol o la luna van detrás de todo lo demás
// (casas, clima, obstáculos y personajes, que usan la profundidad normal 0).
export const SKY_DEPTH = -30;
export const CELESTIAL_DEPTH = -20;

export function backdrop(scene, theme) {
  const t = THEMES[theme];
  const sky = scene.add.graphics().setDepth(SKY_DEPTH);
  const top = Phaser.Display.Color.HexStringToColor(t.sky[0]).color;
  const bottom = Phaser.Display.Color.HexStringToColor(t.sky[1]).color;
  sky.fillGradientStyle(top, top, bottom, bottom, 1).fillRect(0, 0, W, GROUND_TOP);
  if (t.stars) {
    const r = new Phaser.Math.RandomDataGenerator(['estrellas']);
    for (let i = 0; i < 70; i++) sky.fillStyle(0xffffff, r.realInRange(0.3, 1)).fillRect(r.between(0, W), r.between(0, 260), 2, 2);
    // Luna fija en el cielo, detrás de las casas.
    const moon = scene.add.graphics().setDepth(CELESTIAL_DEPTH).setScrollFactor(0);
    moon.fillStyle(0xfff6d5, 1).fillCircle(W - 150, 90, 30);
    moon.fillStyle(0xe6dcb8, 1).fillCircle(W - 160, 82, 6).fillCircle(W - 140, 100, 4).fillCircle(W - 136, 78, 3);
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
// La M prende o apaga la música en cualquier menú. «|» (la tecla a la izquierda del 1 en la
// distribución latina) activa el modo desarrollador: solo funciona fuera de los niveles.
export function onKeys(scene, map) {
  scene.input.keyboard.on('keydown', e => {
    const fn = map[e.key];
    if (fn) fn(e);
    else if (e.key === 'm' || e.key === 'M') Music.toggleMute();
    else if (e.key === '|') developerMode(scene);
  });
}

// Desbloquea todos los niveles (también los secretos) con 3 estrellas y vuelve a dibujar el menú.
export function developerMode(scene) {
  Save.unlockAll(PLAYABLE.flatMap(allLevels).map(l => l.id));
  showDevToast('Modo desarrollador: todo desbloqueado con ★★★');
  scene.scene.restart(scene.sys.settings.data);
}

// Barra inferior con las teclas disponibles: cada tecla en su propia tapa, seguida de lo que hace.
// items: [['Enter', 'jugar'], ['Esc', 'volver'], ...]
// items: [tecla, texto, acción?]. Con acción, la tecla y su texto también son un botón que se
// puede pulsar con el ratón (la «M» siempre lo es). El clic no llega al resto de la escena.
export function keyLegend(scene, items) {
  const BAR_H = 40;
  const y = H - BAR_H / 2;
  const bar = scene.add.rectangle(0, H - BAR_H, W, BAR_H, 0x000000, 0.55).setOrigin(0).setScrollFactor(0).setDepth(100);
  const parts = items.map(([key, label, action]) => {
    const cap = scene.add.text(0, y, key, {
      fontFamily: FONT, fontSize: '16px', fontStyle: 'normal', color: INK,
      backgroundColor: CREAM, padding: { x: 8, y: 3 },
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    const desc = text(scene, 0, y, label, 16, '#ffffff', { oy: 0.5, bold: false, strokeThickness: 0 }).setScrollFactor(0).setDepth(100);
    const fn = action || (key === 'M' ? () => Music.toggleMute() : null);
    return { cap, desc, fn, w: cap.width + 8 + desc.width };
  });
  const GAP = 28;
  let x = (W - parts.reduce((n, p) => n + p.w, 0) - GAP * (parts.length - 1)) / 2;
  for (const p of parts) {
    p.cap.x = x;
    p.desc.x = x + p.cap.width + 8;
    if (p.fn) {
      const hit = scene.add.zone(x - 4, H - BAR_H, p.w + 8, BAR_H).setOrigin(0).setScrollFactor(0).setDepth(101)
        .setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => { p.cap.setBackgroundColor('#ffd23f'); p.desc.setColor('#ffd23f'); });
      hit.on('pointerout', () => { p.cap.setBackgroundColor(CREAM); p.desc.setColor('#ffffff'); });
      hit.on('pointerdown', (_pointer, _x, _y, event) => {
        event.stopPropagation();
        p.fn();
      });
    }
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
