// Piezas compartidas por las escenas: textos con contorno, fondo con paralaje y cajas de diálogo.
import Phaser from 'phaser';
import { THEMES, FAR, MID, GROUND } from '../art/backgrounds.js';
import { THEME_DETAILS } from '../art/details.js';
import { Music } from '../audio/music.js';
import { Save } from '../core/save.js';
import { PLAYABLE, allLevels } from '../data/chapters.js';
import { showDevToast } from '../ui/music-toast.js';
import { Dev, setDevOption } from '../core/dev.js';
import { toggleSettings } from '../ui/settings-panel.js';

export const W = 960;
export const H = 540;
export const SCALE = 3;
export const GROUND_TOP = 444; // donde empieza el suelo en pantalla
export const FEET_Y = 458;     // donde pisan los personajes
// VT323 (licencia OFL): pixelada pero suave, de terminal; distingue bien l, I, 1 y |, y tiene
// acentos, ñ y ¡¿. Es angosta, así que todos los tamaños se multiplican por FONT_SCALE. Solo tiene
// un grosor: nunca se pide negrita (el navegador la inventaría y se vería borrosa).
export const FONT = '"VT323", monospace';
export const FONT_SCALE = 1.3;
export const px = size => `${Math.round(size * FONT_SCALE)}px`;
export const INK = '#2b1d2e';
export const CREAM = '#fff7e0';

export function text(scene, x, y, str, size = 20, color = '#ffffff', opts = {}) {
  return scene.add.text(x, y, str, {
    fontFamily: FONT,
    fontSize: px(size),
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

const LAYER_DEPTH = { far: -16, mid: -15, ground: -14, details: -13 };

// Detalles del fondo (gatos, bicis, carritos…): uno cada DETAIL_SLOT px, decididos con la semilla
// del nivel. Se mueven con un paralaje intermedio, más chicos y apagados que el juego: se notan
// como fondo. Solo existen los que están cerca de la pantalla.
const DETAIL_SLOT = 220;
const DETAIL_PARALLAX = 0.6;
const DETAIL_CHANCE = 0.21;

function hash(seed, k) {
  let h = 2166136261 ^ k;
  for (const ch of seed) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
}

function detailLayer(scene, theme, seed) {
  const keys = THEME_DETAILS[theme];
  const live = new Map(); // slot -> sprite
  if (!keys) return { scroll() {} };
  return {
    scroll(x) {
      const d = x * DETAIL_PARALLAX;
      const first = Math.floor((d - 120) / DETAIL_SLOT);
      const last = Math.floor((d + W + 120) / DETAIL_SLOT);
      for (const [slot, s] of live) {
        if (slot < first || slot > last) { s.destroy(); live.delete(slot); }
      }
      for (let slot = first; slot <= last; slot++) {
        if (!live.has(slot)) {
          if (hash(seed, slot * 3) > DETAIL_CHANCE) { live.set(slot, { destroy() {}, x: 0 }); continue; }
          const key = keys[Math.floor(hash(seed, slot * 3 + 1) * keys.length)];
          const s = scene.add.image(0, GROUND_TOP - 1, key).setOrigin(0.5, 1).setScale(2)
            .setTint(0xd8d4e0).setDepth(LAYER_DEPTH.details).setFlipX(hash(seed, slot * 3 + 2) < 0.5);
          s.slotX = slot * DETAIL_SLOT + 30 + hash(seed, slot * 7 + 5) * (DETAIL_SLOT - 60);
          live.set(slot, s);
        }
        const s = live.get(slot);
        if (s.slotX != null) s.x = s.slotX - d;
      }
    },
  };
}

export function backdrop(scene, theme, { seed = theme } = {}) {
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
  const far = scene.add.tileSprite(0, GROUND_TOP - FAR.h * SCALE + 30, W / SCALE, FAR.h, `far-${theme}`).setOrigin(0).setScale(SCALE).setDepth(LAYER_DEPTH.far);
  const mid = scene.add.tileSprite(0, GROUND_TOP - MID.h * SCALE, W / SCALE, MID.h, `mid-${theme}`).setOrigin(0).setScale(SCALE).setDepth(LAYER_DEPTH.mid);
  const ground = scene.add.tileSprite(0, GROUND_TOP, W / SCALE, GROUND.h, `ground-${theme}`).setOrigin(0).setScale(SCALE).setDepth(LAYER_DEPTH.ground);
  const details = detailLayer(scene, theme, seed);
  return {
    scroll(x) {
      far.tilePositionX = (x * 0.15) / SCALE;
      mid.tilePositionX = (x * 0.45) / SCALE;
      ground.tilePositionX = x / SCALE;
      details.scroll(x);
    },
  };
}

// Atajos de teclado para menús, sin capturar teclas (no interfieren con el texto).
// La M abre Configuración en cualquier menú. «|» (la tecla a la izquierda del 1 en la distribución
// latina) es un atajo a la advertencia del modo desarrollador. Con el modo activo, Tab prende o
// apaga «solo cinemáticas».
export function onKeys(scene, map) {
  scene.input.keyboard.on('keydown', e => {
    const fn = map[e.key];
    if (fn) fn(e);
    else if (e.key === 'm' || e.key === 'M') openSettings(scene);
    else if (e.key === '|') openSettings(scene, { confirmDev: true });
    else if (e.key === 'Tab' && Dev.enabled) {
      e.preventDefault();
      toggleCinematics();
    }
  });
}

// Abre (o cierra) el menú de Configuración.
export function openSettings(scene, { confirmDev = false } = {}) {
  toggleSettings({ enableDev: () => developerMode(scene), confirmDev });
}

// Engrane de Configuración. key: 'gear' (claro, para fondo oscuro) o 'gear-ink' (para botones crema).
function gearImage(scene, x, y, key = 'gear') {
  return scene.add.image(x, y, key).setScale(2);
}

// Desbloquea todos los niveles (también los secretos) con 3 estrellas y vuelve a dibujar el menú.
export function developerMode(scene) {
  Dev.enabled = true;
  Save.unlockAll(PLAYABLE.flatMap(allLevels).map(l => l.id));
  showDevToast('Modo desarrollador: todo desbloqueado con ★★★');
  scene.scene.restart(scene.sys.settings.data);
}

// Modo solo cinemáticas (dentro del modo desarrollador): al entrar a un nivel solo se ven sus diálogos.
function toggleCinematics() {
  setDevOption('cinematics', !Dev.cinematics);
  showDevToast(Dev.cinematics ? 'Solo cinemáticas: activado (Tab para salir)' : 'Solo cinemáticas: desactivado');
}

// Barra inferior con las teclas disponibles: cada tecla en su propia tapa, seguida de lo que hace.
// items: [tecla, texto, acción?]. Con acción, la tecla y su texto también son un botón que se
// puede pulsar con el ratón (la «M» siempre lo es). El clic no llega al resto de la escena.
export function keyLegend(scene, items) {
  const BAR_H = 40;
  const y = H - BAR_H / 2;
  const bar = scene.add.rectangle(0, H - BAR_H, W, BAR_H, 0x000000, 0.55).setOrigin(0).setScrollFactor(0).setDepth(100);
  const parts = items.map(([key, label, action]) => {
    const cap = scene.add.text(0, y, key, {
      fontFamily: FONT, fontSize: px(16), fontStyle: 'normal', color: INK,
      backgroundColor: CREAM, padding: { x: 8, y: 3 },
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    const isSettings = key === 'M';
    const desc = isSettings
      ? gearImage(scene, 0, y).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100)
      : text(scene, 0, y, label, 16, '#ffffff', { oy: 0.5, bold: false, strokeThickness: 0 }).setScrollFactor(0).setDepth(100);
    const fn = action || (isSettings ? () => openSettings(scene) : null);
    return { cap, desc, fn, w: cap.width + 8 + desc.displayWidth };
  });
  const GAP = 28;
  let x = (W - parts.reduce((n, p) => n + p.w, 0) - GAP * (parts.length - 1)) / 2;
  for (const p of parts) {
    p.cap.x = x;
    p.desc.x = x + p.cap.width + 8;
    if (p.fn) {
      const hit = scene.add.zone(x - 4, H - BAR_H, p.w + 8, BAR_H).setOrigin(0).setScrollFactor(0).setDepth(101)
        .setInteractive({ useHandCursor: true });
      // el texto cambia de color; el engrane (imagen) se tiñe
      const lit = on => {
        p.cap.setBackgroundColor(on ? '#ffd23f' : CREAM);
        if (p.desc.setColor) p.desc.setColor(on ? '#ffd23f' : '#ffffff');
        else if (on) p.desc.setTint(0xffd23f);
        else p.desc.clearTint();
      };
      hit.on('pointerover', () => lit(true));
      hit.on('pointerout', () => lit(false));
      hit.on('pointerdown', (_pointer, _x, _y, event) => {
        event.stopPropagation();
        p.fn();
      });
    }
    x += p.w + GAP;
  }
  return bar;
}

// Botón con relieve: borde oscuro, sombra, brillo y la tecla de atajo dibujada a la izquierda.
// Se ilumina al pasar el ratón y se hunde al pulsarlo. Devuelve { container, width }.
const BTN_H = 40;
export function button(scene, x, y, { key, label, onClick, primary = false, gearIcon = false }) {
  const c = scene.add.container(x, y).setDepth(110);
  const g = scene.add.graphics();
  const keyT = scene.add.text(0, 0, key, { fontFamily: FONT, fontSize: px(15), color: CREAM }).setOrigin(0.5);
  const labelT = gearIcon
    ? gearImage(scene, 0, 0, 'gear-ink').setOrigin(0, 0.5)
    : text(scene, 0, 0, label, 18, INK, { oy: 0.5, strokeThickness: 0 });
  const kw = Math.max(26, keyT.width + 12);
  const width = 14 + kw + 10 + labelT.displayWidth + 16;
  const face = primary ? 0xffe680 : Phaser.Display.Color.HexStringToColor(CREAM).color;
  const draw = state => {
    const dy = state === 'down' ? 3 : 0;
    g.clear();
    g.fillStyle(0x000000, 0.35).fillRoundedRect(3, 6, width, BTN_H, 9);
    g.fillStyle(Phaser.Display.Color.HexStringToColor(INK).color, 1).fillRoundedRect(0, dy, width, BTN_H, 9);
    g.fillStyle(state === 'hover' ? 0xffd23f : face, 1).fillRoundedRect(3, dy + 3, width - 6, BTN_H - 6, 7);
    g.fillStyle(0xffffff, 0.55).fillRect(10, dy + 6, width - 20, 2);
    g.fillStyle(0xc9a66b, 1).fillRect(6, dy + BTN_H - 9, width - 12, 3);
    g.fillStyle(Phaser.Display.Color.HexStringToColor(INK).color, 1).fillRoundedRect(10, dy + 8, kw, BTN_H - 16, 4);
    keyT.setPosition(10 + kw / 2, BTN_H / 2 + dy);
    labelT.setPosition(10 + kw + 10, BTN_H / 2 + dy);
  };
  draw('up');
  const hit = scene.add.zone(0, 0, width, BTN_H + 6).setOrigin(0).setInteractive({ useHandCursor: true });
  hit.on('pointerover', () => draw('hover'));
  hit.on('pointerout', () => draw('up'));
  hit.on('pointerdown', (_p, _x, _y, event) => { event.stopPropagation(); draw('down'); });
  hit.on('pointerup', () => { draw('hover'); onClick(); });
  c.add([g, keyT, labelT, hit]);
  return { container: c, width };
}

// Fila de botones centrada en x (cx).
export function buttonRow(scene, cx, y, items, gap = 14) {
  const btns = items.map(it => button(scene, 0, y, it));
  const total = btns.reduce((n, b) => n + b.width, 0) + gap * (btns.length - 1);
  let x = cx - total / 2;
  for (const b of btns) {
    b.container.x = x;
    x += b.width + gap;
  }
  return btns;
}

export function stars(scene, x, y, count, { gap = 30, scale = 3 } = {}) {
  return [0, 1, 2].map(i =>
    scene.add.image(x + (i - 1) * gap, y, i < count ? 'star-on' : 'star-off').setScale(scale));
}

export function formatTime(ms) {
  return `${(ms / 1000).toFixed(1)} s`;
}
