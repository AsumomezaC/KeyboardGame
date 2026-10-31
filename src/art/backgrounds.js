// Fondos en tres capas que se repiten (lejana, media y suelo), uno por ambiente.
// Todo se dibuja para repetirse sin costuras: lo que cruza el borde se dibuja "dando la vuelta".
import { makeCanvas, rng } from './pixel.js';

export const FAR = { w: 160, h: 80 };
export const MID = { w: 192, h: 90 };
export const GROUND = { w: 64, h: 32 };

export const THEMES = {
  barrio: {
    sky: ['#7ec8f5', '#fde8c8'], far: '#a7c4d9', farDark: '#8fb0c8',
    houses: ['#f4a261', '#e9c46a', '#8ecae6', '#f28482', '#90be6d', '#cdb4db'],
    window: '#3d5a80', windowLit: null, door: '#6d4c41',
    walk: '#c9b79c', walkLine: '#b3a185', curb: '#9c8b75', street: '#5b5b66', streetLine: '#e9c46a',
  },
  prohibida: {
    sky: ['#43294d', '#f29e6d'], far: '#3b2f4a', farDark: '#2c2238',
    walk: '#7a6048', walkLine: '#6a523c', curb: '#5e4a37', street: '#4a3b2d', streetLine: null,
  },
  noche: {
    sky: ['#0f1630', '#2b3a67'], far: '#1d2747', farDark: '#151c36', stars: true,
    houses: ['#5c4a72', '#3f5e74', '#6b4f4f', '#4f6b58', '#5a5470'],
    window: '#1b2236', windowLit: '#ffd166', door: '#2e2433',
    walk: '#6f6680', walkLine: '#5e566e', curb: '#544c63', street: '#2c2a38', streetLine: '#8c7a3e',
  },
  carrera: {
    sky: ['#5ec2ff', '#e0f7ff'], far: '#9fd3c7', farDark: '#7fbfb0',
    walk: '#c8553d', walkLine: '#f4f1e8', curb: '#a8442f', street: '#c8553d', streetLine: '#f4f1e8',
  },
  mercado: {
    sky: ['#ffb38a', '#ffe8c2'], far: '#d9a07b', farDark: '#c48a66',
    walk: '#a39182', walkLine: '#8c7b6d', curb: '#7d6d60', street: '#8c7b6d', streetLine: null,
  },
};

const wrap = (x, w) => ((x % w) + w) % w;

function far(theme) {
  const t = THEMES[theme];
  const { c, p } = makeCanvas(FAR.w, FAR.h);
  const r = rng(theme.length * 97);
  if (theme === 'prohibida') {
    // Fábricas con chimeneas.
    for (let x = 0; x < FAR.w; x += 40) {
      const h = 30 + Math.floor(r() * 18);
      p.rect(x + 2, FAR.h - h, 34, h, t.far);
      p.rect(x + 8, FAR.h - h - 16, 5, 16, t.farDark);
      for (let k = 0; k < 4; k++) p.rect(x + 6 + k * 7, FAR.h - h + 6, 4, 3, '#f29e6d');
    }
  } else if (theme === 'noche') {
    for (let x = 0; x < FAR.w; x += 20) {
      const h = 25 + Math.floor(r() * 35);
      p.rect(x, FAR.h - h, 18, h, t.far);
      for (let wy = FAR.h - h + 4; wy < FAR.h - 4; wy += 6) {
        for (let wx = x + 3; wx < x + 15; wx += 5) if (r() < 0.35) p.px(wx, wy, '#ffd166');
      }
    }
  } else if (theme === 'carrera') {
    // Gradas lejanas con banderines.
    for (let x = 0; x < FAR.w; x++) {
      const h = 30 + Math.round(4 * Math.sin((x / FAR.w) * Math.PI * 4));
      p.rect(x, FAR.h - h, 1, h, t.far);
    }
    for (let x = 6; x < FAR.w; x += 32) {
      p.rect(x, FAR.h - 52, 1, 14, '#5b5b66');
      p.rect(x + 1, FAR.h - 52, 6, 4, ['#e94f64', '#ffd23f', '#3d5aa8'][(x / 32) % 3 | 0]);
    }
  } else {
    // Cerros con ondas que cierran en el borde.
    for (let x = 0; x < FAR.w; x++) {
      const k = (x / FAR.w) * Math.PI * 2;
      const h = 36 + 8 * Math.sin(k) + 5 * Math.sin(3 * k + 1);
      p.rect(x, FAR.h - h, 1, h, t.far);
      const h2 = 20 + 6 * Math.sin(2 * k + 2);
      p.rect(x, FAR.h - h2, 1, h2, t.farDark);
    }
    if (theme === 'mercado') {
      // Cúpula de iglesia a lo lejos.
      p.disc(110, 42, 9, t.farDark);
      p.rect(101, 42, 19, 38, t.farDark);
      p.rect(109, 28, 3, 6, t.farDark);
    }
  }
  return c;
}

function houseRow(p, t, r, lit) {
  const widths = [40, 52, 44, 56];
  let x = 0;
  widths.forEach((w, i) => {
    const h = 48 + Math.floor(r() * 22);
    const color = t.houses[i % t.houses.length];
    const top = MID.h - h;
    p.rect(x, top, w, h, color);
    p.rect(x, top, w, 3, 'rgba(0,0,0,0.18)');
    p.rect(x + w - 2, top, 2, h, 'rgba(0,0,0,0.12)');
    // tinaco en algunas azoteas
    if (i % 2 === 0) {
      p.rect(x + w - 14, top - 9, 8, 9, '#2b2b2b');
      p.rect(x + w - 13, top - 10, 6, 1, '#2b2b2b');
    }
    // ventanas y puerta
    const doorX = x + 6 + Math.floor(r() * (w - 20));
    p.rect(doorX, MID.h - 16, 9, 16, t.door);
    p.px(doorX + 7, MID.h - 8, '#ffd23f');
    for (let wx = x + 5; wx + 9 < x + w; wx += 14) {
      if (wx < doorX + 10 && wx + 9 > doorX) continue;
      const glass = lit && r() < 0.6 ? t.windowLit : t.window;
      p.rect(wx, MID.h - 30, 9, 9, '#f4f1e8');
      p.rect(wx + 1, MID.h - 29, 7, 7, glass);
      p.rect(wx + 4, MID.h - 29, 1, 7, '#f4f1e8');
    }
    // macetas
    if (r() < 0.6) {
      p.rect(x + 2, MID.h - 5, 4, 5, '#b5651d');
      p.rect(x + 1, MID.h - 9, 6, 4, '#4f8a3a');
    }
    x += w;
  });
}

function poles(p, lamp) {
  for (const px of [8, 104]) {
    p.rect(px, 8, 3, MID.h - 8, '#6d4c41');
    p.rect(px - 4, 12, 11, 2, '#6d4c41');
    if (lamp) {
      p.rect(px + 3, 20, 6, 2, '#6d4c41');
      p.rect(px + 7, 22, 4, 2, '#ffe9a8');
    }
  }
  // cables con comba, envueltos en el borde para repetirse
  for (const [a, b] of [[9, 105], [105, 201]]) {
    for (let x = a; x <= b; x++) {
      const t = (x - a) / (b - a);
      p.px(wrap(x, MID.w), 14 + Math.round(7 * Math.sin(Math.PI * t)), '#2b2b2b');
    }
  }
}

function chainFence(p) {
  // Bodegas detrás
  p.rect(0, 30, 90, 60, '#6b6b7b');
  p.rect(100, 22, 80, 68, '#5d5d6c');
  p.rect(10, 50, 30, 40, '#4b4b58');
  p.rect(120, 46, 40, 44, '#4b4b58');
  // malla ciclónica
  for (let y = 38; y < MID.h; y++) {
    for (let x = 0; x < MID.w; x++) if ((x + y) % 6 === 0 || wrap(x - y, 6) === 0) p.px(x, y, '#a7adb5');
  }
  for (let x = 0; x < MID.w; x += 48) p.rect(x, 32, 3, MID.h - 32, '#7d838b');
  for (let x = 0; x < MID.w; x++) p.px(x, 34 + (x % 4 === 0 ? -1 : 0), '#7d838b'); // alambre de púas
  // letrero rojo (sin texto)
  p.rect(130, 52, 30, 14, '#c62828');
  p.rect(133, 55, 24, 2, '#ffffff');
  p.rect(133, 60, 24, 2, '#ffffff');
}

function bleachers(p, r) {
  for (let row = 0; row < 5; row++) {
    const y = 34 + row * 11;
    p.rect(0, y, MID.w, 11, row % 2 ? '#8d99ae' : '#7c879c');
    for (let x = 2; x < MID.w; x += 5) {
      if (r() < 0.8) {
        p.rect(x, y - 4, 3, 4, ['#e94f64', '#ffd23f', '#3d5aa8', '#80ed99', '#f4a261', '#ffffff'][Math.floor(r() * 6)]);
        p.rect(x, y - 7, 3, 3, ['#f2c29b', '#c98d62', '#8d5a3b'][Math.floor(r() * 3)]);
      }
    }
  }
  // papel picado en dos cuerdas
  const colors = ['#e94f64', '#ffd23f', '#4cc9f0', '#80ed99', '#b388ff'];
  for (const base of [8, 20]) {
    for (let x = 0; x < MID.w; x++) {
      const y = base + Math.round(4 * Math.sin((x / MID.w) * Math.PI * 4));
      p.px(x, y, '#2b2b2b');
      if (x % 8 === 0) p.rect(x + 1, y + 1, 6, 6, colors[(x / 8 + base) % colors.length]);
    }
  }
}

function stalls(p) {
  const awnings = [['#e94f64', '#ffffff'], ['#3d5aa8', '#ffffff'], ['#f4a261', '#fff3b0'], ['#2a9d8f', '#ffffff']];
  awnings.forEach(([a, b], i) => {
    const x = i * 48;
    p.rect(x + 3, 30, 2, 60, '#6d4c41');
    p.rect(x + 43, 30, 2, 60, '#6d4c41');
    for (let k = 0; k < 40; k++) p.rect(x + 4 + k, 24, 1, 10, Math.floor(k / 5) % 2 ? a : b);
    for (let k = 0; k < 40; k += 5) p.rect(x + 4 + k, 34, 5, 2, Math.floor(k / 5) % 2 ? a : b);
    p.rect(x + 6, 62, 36, 4, '#8d6e63');
    p.rect(x + 8, 66, 32, 24, '#a1887f');
    // mercancía: panes en un puesto, frutas en otros
    for (let k = 0; k < 5; k++) {
      if (i === 1) p.ellipse(x + 11 + k * 7, 59, 3, 2, '#d9a066');
      else p.disc(x + 11 + k * 7, 59, 2, ['#e94f64', '#ffd23f', '#80ed99', '#f4a261'][(k + i) % 4]);
    }
  });
}

function mid(theme) {
  const t = THEMES[theme];
  const { c, p } = makeCanvas(MID.w, MID.h);
  const r = rng(theme.length * 131 + 7);
  if (theme === 'prohibida') chainFence(p);
  else if (theme === 'carrera') bleachers(p, r);
  else if (theme === 'mercado') stalls(p);
  else {
    houseRow(p, t, r, theme === 'noche');
    poles(p, theme === 'noche');
  }
  return c;
}

function ground(theme) {
  const t = THEMES[theme];
  const { c, p } = makeCanvas(GROUND.w, GROUND.h);
  p.rect(0, 0, GROUND.w, 9, t.walk);
  if (theme === 'carrera') {
    p.rect(0, 0, GROUND.w, GROUND.h, t.walk);
    p.rect(0, 9, GROUND.w, 1, t.walkLine);
    p.rect(0, 21, GROUND.w, 1, t.walkLine);
    return c;
  }
  if (theme === 'mercado' || theme === 'prohibida') {
    p.rect(0, 0, GROUND.w, GROUND.h, t.walk);
    for (let y = 1; y < GROUND.h; y += 5) {
      for (let x = (y % 10 === 1 ? 0 : 4); x < GROUND.w; x += 8) p.rect(x, y, 6, 3, t.walkLine);
    }
    return c;
  }
  for (let x = 0; x < GROUND.w; x += 16) p.rect(x, 0, 1, 9, t.walkLine);
  p.rect(0, 9, GROUND.w, 3, t.curb);
  p.rect(0, 12, GROUND.w, GROUND.h - 12, t.street);
  if (t.streetLine) {
    p.rect(0, 22, 16, 2, t.streetLine);
    p.rect(32, 22, 16, 2, t.streetLine);
  }
  return c;
}

export function buildBackgrounds(scene) {
  for (const theme of Object.keys(THEMES)) {
    scene.textures.addCanvas(`far-${theme}`, far(theme));
    scene.textures.addCanvas(`mid-${theme}`, mid(theme));
    scene.textures.addCanvas(`ground-${theme}`, ground(theme));
  }
}
