// Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
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
  parque: {
    sky: ['#8ad1f5', '#eaf7d8'], far: '#8fbf8a', farDark: '#76a872',
    walk: '#c9a36b', walkLine: '#b08d58', curb: '#5f8f4a', street: '#6fa35a', streetLine: null,
  },
  // Fondo neutro de los niveles en construcción: cielo liso, sin casas ni detalles, y un piso
  // con juntas regulares para que se note el avance.
  neutro: {
    sky: ['#b8c2cc', '#e4e8ec'], plain: true,
    walk: '#9ea5ad', walkLine: '#8a9199', curb: '#7f868e', street: '#6f767e', streetLine: null,
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
  if (t.plain) return c;
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

// Parque: árboles redondos, una banca y un farol.
function trees(p, r) {
  for (let x = 6; x < MID.w; x += 48) {
    const h = 30 + Math.floor(r() * 12);
    p.rect(x + 14, MID.h - h, 5, h, '#6d4c41');
    p.disc(x + 16, MID.h - h - 10, 15, '#3f7d3a');
    p.disc(x + 10, MID.h - h - 4, 10, '#4f9a45');
    p.disc(x + 23, MID.h - h - 6, 9, '#5aa84f');
    p.px(x + 12, MID.h - h - 14, '#e9c46a');
  }
  p.rect(120, MID.h - 9, 26, 3, '#a0522d'); p.rect(122, MID.h - 6, 2, 6, '#5a3d32'); p.rect(142, MID.h - 6, 2, 6, '#5a3d32');
  p.rect(120, MID.h - 14, 26, 2, '#a0522d');
  p.rect(176, 30, 2, MID.h - 30, '#3d3d46'); p.rect(173, 28, 8, 3, '#3d3d46'); p.rect(174, 31, 6, 2, '#fff3b0');
}

function mid(theme) {
  const t = THEMES[theme];
  const { c, p } = makeCanvas(MID.w, MID.h);
  if (t.plain) return c;
  const r = rng(theme.length * 131 + 7);
  if (theme === 'prohibida') chainFence(p);
  else if (theme === 'carrera') bleachers(p, r);
  else if (theme === 'mercado') stalls(p);
  else if (theme === 'parque') trees(p, r);
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
  if (theme === 'parque') {
    p.rect(0, 0, GROUND.w, GROUND.h, t.street);
    p.rect(0, 0, GROUND.w, 10, t.walk);
    for (let x = 3; x < GROUND.w; x += 9) p.px(x, 4, t.walkLine);
    p.rect(0, 10, GROUND.w, 2, t.curb);
    for (let x = 2; x < GROUND.w; x += 7) { p.px(x, 16, '#4f8a3a'); p.px(x + 3, 23, '#4f8a3a'); p.px(x + 1, 28, '#5f9a4a'); }
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

// Interior de la casa de Sofía para los diálogos: sala-comedor con la mesa de las botellas.
// 320×144 px: la pared ocupa hasta y=112 y el piso coincide con la banqueta de los exteriores.
export const ROOM = { w: 320, h: 144, floor: 112 };

function room() {
  const { c, p } = makeCanvas(ROOM.w, ROOM.h);
  const F = ROOM.floor;
  p.rect(0, 0, ROOM.w, F, '#e9d8a6');
  for (let x = 0; x < ROOM.w; x += 12) p.rect(x, 0, 5, F, '#e1cc93'); // papel tapiz a rayas
  p.rect(0, F - 10, ROOM.w, 10, '#b08968'); // zoclo
  p.rect(0, F - 11, ROOM.w, 1, '#8d6e53');
  // ventana con cortina
  p.rect(28, 18, 52, 40, '#6d4c41');
  p.rect(31, 21, 46, 34, '#8ecae6');
  p.rect(53, 21, 2, 34, '#6d4c41');
  p.rect(24, 14, 14, 50, '#e76f51'); p.rect(70, 14, 14, 50, '#e76f51');
  for (let y = 14; y < 64; y += 4) { p.rect(26, y, 2, 2, '#c4553a'); p.rect(78, y, 2, 2, '#c4553a'); }
  // cuadro familiar torcido (falta la mamá: siempre trabaja)
  p.rect(110, 22, 30, 22, '#6d4c41');
  p.rect(112, 24, 26, 18, '#f4f1e8');
  p.disc(118, 31, 3, '#d9a37a'); p.disc(128, 33, 2, '#f2c29b'); p.disc(134, 34, 2, '#f0c09a');
  // reloj de pared
  p.disc(170, 24, 7, '#f4f1e8'); p.line(170, 24, 170, 19, '#2b1d2e'); p.line(170, 24, 174, 25, '#2b1d2e');
  // calendario
  p.rect(196, 18, 18, 22, '#ffffff'); p.rect(196, 18, 18, 5, '#c1121f');
  for (let y = 26; y < 38; y += 3) for (let x = 198; x < 212; x += 3) p.px(x, y, '#9a9a9a');
  // refrigerador
  p.rect(268, 30, 34, F - 30, '#dfe7ec'); p.rect(268, 62, 34, 1, '#a9b5bc'); p.rect(296, 38, 2, 14, '#a9b5bc');
  p.rect(272, 40, 8, 6, '#ffd23f'); p.rect(283, 70, 6, 8, '#80ed99'); // dibujos pegados
  // mesa con mantel de plástico y botellas
  p.rect(150, F - 34, 84, 5, '#c1121f');
  for (let x = 150; x < 234; x += 6) p.rect(x, F - 34, 3, 5, '#f4f1e8');
  p.rect(156, F - 29, 4, 29, '#6d4c41'); p.rect(224, F - 29, 4, 29, '#6d4c41');
  for (const [bx, color] of [[178, '#4f7a35'], [186, '#6b3f1d'], [208, '#4f7a35']]) {
    p.rect(bx, F - 44, 4, 10, color); p.rect(bx + 1, F - 47, 2, 3, color);
  }
  p.rect(196, F - 39, 7, 5, '#f4f1e8'); // plato
  // televisor viejo
  p.rect(92, F - 40, 34, 30, '#5a4636'); p.rect(96, F - 36, 22, 20, '#2b3a4a'); p.rect(120, F - 34, 3, 3, '#ffd23f');
  p.rect(92, F - 10, 34, 10, '#8d6e53');
  // piso de mosaico
  for (let y = F; y < ROOM.h; y += 8) {
    for (let x = 0; x < ROOM.w; x += 8) p.rect(x, y, 8, 8, ((x + y) / 8) % 2 ? '#c9b79c' : '#b3a185');
  }
  return c;
}

// Abarrotes La Esperanza por dentro: estantes, mostrador con báscula y el cuaderno del fiado.
function store() {
  const { c, p } = makeCanvas(ROOM.w, ROOM.h);
  const F = ROOM.floor;
  p.rect(0, 0, ROOM.w, F, '#cfe3c2');
  p.rect(0, F - 8, ROOM.w, 8, '#7a9a6a');
  // estantes con latas, botellas y bolsas
  const goods = ['#e94f64', '#ffd23f', '#3d5aa8', '#f4a261', '#2a9d8f', '#f4f1e8', '#c1121f'];
  for (const [x0, w] of [[8, 96], [216, 96]]) {
    for (let y = 18; y < F - 12; y += 22) {
      p.rect(x0, y + 16, w, 3, '#8d6e63');
      for (let x = x0 + 2; x < x0 + w - 6; x += 7) {
        const g = goods[(x + y) % goods.length];
        if ((x + y) % 3) p.rect(x, y + 6, 5, 10, g); else p.rect(x, y + 10, 6, 6, g);
      }
    }
    p.rect(x0, 14, 2, F - 22, '#6d4c41'); p.rect(x0 + w - 2, 14, 2, F - 22, '#6d4c41');
  }
  // letrero de la tienda y el de «hoy no se fía» (sin texto: rayas)
  p.rect(120, 8, 80, 16, '#c1121f'); p.rect(124, 12, 72, 3, '#ffd23f'); p.rect(132, 17, 56, 2, '#ffd23f');
  p.rect(140, 32, 40, 14, '#fff3b0'); p.rect(144, 36, 32, 1, '#2b1d2e'); p.rect(144, 40, 24, 1, '#2b1d2e');
  // mostrador
  p.rect(108, F - 36, 104, 36, '#a1887f'); p.rect(106, F - 38, 108, 4, '#6d4c41');
  p.rect(116, F - 48, 16, 10, '#9aa0a6'); p.rect(118, F - 52, 12, 4, '#dfe7ec'); // báscula
  p.rect(176, F - 42, 18, 4, '#f4f1e8'); p.rect(178, F - 41, 14, 1, '#3d5aa8'); // cuaderno del fiado
  p.rect(150, F - 46, 10, 8, '#e9c46a'); // frasco de dulces
  for (let y = F; y < ROOM.h; y += 8) {
    for (let x = 0; x < ROOM.w; x += 8) p.rect(x, y, 8, 8, ((x + y) / 8) % 2 ? '#d8cfc0' : '#c4baa9');
  }
  return c;
}

export function buildBackgrounds(scene) {
  for (const theme of Object.keys(THEMES)) {
    scene.textures.addCanvas(`far-${theme}`, far(theme));
    scene.textures.addCanvas(`mid-${theme}`, mid(theme));
    scene.textures.addCanvas(`ground-${theme}`, ground(theme));
  }
  scene.textures.addCanvas('room-casa', room());
  scene.textures.addCanvas('room-tienda', store());
}
