// Personajes como "marionetas" de pixeles: las poses se definen por articulaciones
// y el contorno se agrega al final. Una paleta define ropa, peinado y accesorios; una
// complexión (niño, adolescente, adulto, niño pequeño) estira o encoge el cuerpo sin cambiar la cabeza.
import { makeCanvas, outline, addSheet } from './pixel.js';

export const FRAME_W = 24;
export const FRAME_H = 32;

export const PALETTES = {
  sofia: {
    skin: '#f2c29b', skinDark: '#d9946c', hair: '#4a2a1f', hairLight: '#7a4a32',
    shirt: '#e94f64', shirtDark: '#b83350', shorts: '#3d5aa8', shortsDark: '#2c4280',
    shoe: '#f5f5f5', shoeAccent: '#e23d3d', accent: '#ffd23f', eye: '#2b1d2e', blush: '#f08a8a',
    outline: '#2b1d2e', hairStyle: 'pony',
  },
  rivalA: {
    skin: '#c98d62', skinDark: '#a8704a', hair: '#1f1a17', hairLight: '#3a302a',
    shirt: '#4cc9f0', shirtDark: '#2a8fb5', shorts: '#2b2d42', shortsDark: '#1b1c2b',
    shoe: '#f5f5f5', shoeAccent: '#2a8fb5', accent: '#ffffff', eye: '#1f1a17', blush: '#d97a6a',
    outline: '#1b1424', hairStyle: 'short',
  },
  rivalB: {
    skin: '#f5d0b0', skinDark: '#dba985', hair: '#c46a2b', hairLight: '#e08a45',
    shirt: '#80ed99', shirtDark: '#4fb86b', shorts: '#6a4c93', shortsDark: '#4e3670',
    shoe: '#f5f5f5', shoeAccent: '#6a4c93', accent: '#80ed99', eye: '#2b1d2e', blush: '#f08a8a',
    outline: '#2b1d2e', hairStyle: 'pony',
  },
  rivalC: {
    skin: '#8d5a3b', skinDark: '#6e4329', hair: '#120d0b', hairLight: '#2e2420',
    shirt: '#b388ff', shirtDark: '#8058cc', shorts: '#1d3557', shortsDark: '#132640',
    shoe: '#f5f5f5', shoeAccent: '#ffd23f', accent: '#ffd23f', eye: '#120d0b', blush: '#b5654a',
    outline: '#140d12', hairStyle: 'short',
  },
  // ---- Familia ----
  ramiro: {
    skin: '#d9a37a', skinDark: '#b8825a', hair: '#2e2724', hairLight: '#5a4d47',
    shirt: '#e8e2d0', shirtDark: '#c9c0a8', shorts: '#5b4a3a', shortsDark: '#45372b',
    shoe: '#3a2a20', shoeAccent: '#3a2a20', accent: '#2e2724', eye: '#2b1d2e', blush: '#e0605a',
    outline: '#2b1d2e', hairStyle: 'short', longPants: true, mustache: true, stubble: true, prop: 'bottle',
  },
  leticia: {
    skin: '#e8b48f', skinDark: '#c98f6a', hair: '#3a2018', hairLight: '#6a3a2a',
    shirt: '#4fb3a9', shirtDark: '#33877f', shorts: '#4fb3a9', shortsDark: '#33877f',
    shoe: '#f5f5f5', shoeAccent: '#dddddd', accent: '#f5f5f5', eye: '#2b1d2e', blush: '#e89a8a',
    outline: '#2b1d2e', hairStyle: 'bun', longPants: true,
  },
  tomasito: {
    skin: '#f0c09a', skinDark: '#d39a72', hair: '#5a3424', hairLight: '#7d4a33',
    shirt: '#7cc65a', shirtDark: '#57a03a', shorts: '#e9c46a', shortsDark: '#c9a44a',
    shoe: '#e94f64', shoeAccent: '#ffffff', accent: '#3d7a28', eye: '#2b1d2e', blush: '#f08a8a',
    outline: '#2b1d2e', hairStyle: 'messy', dino: true,
  },
  // Tomás a los 8 años (capítulo 3).
  tomas: {
    skin: '#f0c09a', skinDark: '#d39a72', hair: '#5a3424', hairLight: '#7d4a33',
    shirt: '#7cc65a', shirtDark: '#57a03a', shorts: '#3d5aa8', shortsDark: '#2c4280',
    shoe: '#e94f64', shoeAccent: '#ffffff', accent: '#3d7a28', eye: '#2b1d2e', blush: '#f08a8a',
    outline: '#2b1d2e', hairStyle: 'messy', dino: true,
  },
  // ---- Vecindario ----
  // Tata: la abuela de Dani, dueña de Abarrotes La Esperanza.
  tata: {
    skin: '#d7a985', skinDark: '#b88a66', hair: '#d9d9d9', hairLight: '#ffffff',
    shirt: '#a05195', shirtDark: '#7a3a72', shorts: '#3d405b', shortsDark: '#2c2e42',
    shoe: '#3a2a20', shoeAccent: '#3a2a20', accent: '#f4f1e8', eye: '#2b1d2e', blush: '#e0907a',
    outline: '#2b1d2e', hairStyle: 'bun', longPants: true, glasses: '#6d4c41', apron: '#f4f1e8',
  },
  dani: {
    skin: '#d6a07a', skinDark: '#b5805a', hair: '#2a1d1a', hairLight: '#4e3a33',
    shirt: '#f4a261', shirtDark: '#d0803f', shorts: '#4a6fa5', shortsDark: '#36557f',
    shoe: '#f5f5f5', shoeAccent: '#4a6fa5', accent: '#f4a261', eye: '#2b1d2e', blush: '#e08a7a',
    outline: '#2b1d2e', hairStyle: 'messy', glasses: '#2b1d2e',
  },
  // ---- Los Gatos ----
  kevin: {
    skin: '#c48a60', skinDark: '#a26c45', hair: '#1a1412', hairLight: '#3a2e28',
    shirt: '#2b2d42', shirtDark: '#1d1e2e', shorts: '#4a4e69', shortsDark: '#363a52',
    shoe: '#f5f5f5', shoeAccent: '#e94f64', accent: '#e94f64', eye: '#1a1412', blush: '#c97a62',
    outline: '#140d12', hairStyle: 'cap', longPants: true,
  },
  yesi: {
    skin: '#e3ab84', skinDark: '#c48b64', hair: '#2a1410', hairLight: '#5a2e22',
    shirt: '#9b5de5', shirtDark: '#7440b8', shorts: '#2b2d42', shortsDark: '#1d1e2e',
    shoe: '#f5f5f5', shoeAccent: '#9b5de5', accent: '#ffd23f', eye: '#2b1d2e', blush: '#e88a8a',
    outline: '#2b1d2e', hairStyle: 'pony', longPants: true, earrings: true,
  },
  chuy: {
    skin: '#a8714c', skinDark: '#875636', hair: '#16100e', hairLight: '#2e2420',
    shirt: '#c1121f', shirtDark: '#8f0d17', shorts: '#3d405b', shortsDark: '#2c2e42',
    shoe: '#f5f5f5', shoeAccent: '#c1121f', accent: '#ffffff', eye: '#16100e', blush: '#b8664a',
    outline: '#140d12', hairStyle: 'buzz', longPants: true,
  },
  brayan: {
    skin: '#f0c8a8', skinDark: '#d2a686', hair: '#c9a227', hairLight: '#e8c547',
    shirt: '#118ab2', shirtDark: '#0b6585', shorts: '#2b2d42', shortsDark: '#1d1e2e',
    shoe: '#f5f5f5', shoeAccent: '#118ab2', accent: '#ffffff', eye: '#2b1d2e', blush: '#f08a8a',
    outline: '#2b1d2e', hairStyle: 'messy', longPants: true,
  },
  memo: {
    skin: '#8d5a3b', skinDark: '#6e4329', hair: '#120d0b', hairLight: '#2e2420',
    shirt: '#f4f1e8', shirtDark: '#cfc9b8', shorts: '#606c38', shortsDark: '#454f27',
    shoe: '#2b2b2b', shoeAccent: '#f4f1e8', accent: '#606c38', eye: '#120d0b', blush: '#b5654a',
    outline: '#140d12', hairStyle: 'cap', longPants: true,
  },
  // ---- Mercado ----
  panadero: {
    skin: '#e0a882', skinDark: '#bf8862', hair: '#f4f1e8', hairLight: '#ffffff',
    shirt: '#f4f1e8', shirtDark: '#d8d2c0', shorts: '#6d4c41', shortsDark: '#523830',
    shoe: '#3a2a20', shoeAccent: '#3a2a20', accent: '#f4f1e8', eye: '#2b1d2e', blush: '#e0605a',
    outline: '#2b1d2e', hairStyle: 'chef', longPants: true, mustache: true,
  },
};

// Complexiones: tamaño del cuadro y cuánto se estiran piernas y torso respecto al niño.
export const BUILDS = {
  kid: { w: 24, h: 32, legs: 1, torso: 1, dx: 0, body: 5, limb: 2 },
  teen: { w: 24, h: 36, legs: 1.3, torso: 1.2, dx: 0, body: 5, limb: 2 },
  adult: { w: 28, h: 46, legs: 1.75, torso: 1.55, dx: 2, body: 7, limb: 3 },
  toddler: { w: 20, h: 26, legs: 0.6, torso: 0.75, dx: -2, body: 5, limb: 2 },
};

const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const add = (a, dx, dy) => ({ x: a.x + dx, y: a.y + dy });

function polar(origin, len, ang) {
  return { x: origin.x + Math.sin(ang) * len, y: origin.y + Math.cos(ang) * len };
}

function drawLeg(p, hip, knee, foot, pal, back, limb = 2) {
  const skin = back ? pal.skinDark : pal.skin;
  const shorts = back ? pal.shortsDark : pal.shorts;
  if (pal.longPants) {
    p.line(knee.x, knee.y, foot.x, foot.y, shorts, limb);
    p.line(hip.x, hip.y, knee.x, knee.y, shorts, limb);
  } else {
    p.line(knee.x, knee.y, foot.x, foot.y, skin, limb);
    p.line(hip.x, hip.y, knee.x, knee.y, skin, limb);
    const mid = lerp(hip, knee, 0.55);
    p.line(hip.x, hip.y, mid.x, mid.y, shorts, limb + 1);
  }
  p.rect(foot.x - 1, foot.y - 1, 4, 2, pal.shoe);
  p.px(foot.x + 1, foot.y - 1, pal.shoeAccent);
}

function drawArm(p, shoulder, elbow, hand, pal, back, limb = 2) {
  const skin = back ? pal.skinDark : pal.skin;
  p.line(elbow.x, elbow.y, hand.x, hand.y, skin, limb);
  p.line(shoulder.x, shoulder.y, elbow.x, elbow.y, skin, limb);
  const sleeve = lerp(shoulder, elbow, 0.45);
  p.line(shoulder.x, shoulder.y, sleeve.x, sleeve.y, back ? pal.shirtDark : pal.shirt, limb);
  if (!back && pal.prop === 'bottle') {
    p.rect(hand.x, hand.y - 4, 2, 5, '#4f7a35');
    p.px(hand.x, hand.y - 5, '#6fa04a');
    p.px(hand.x + 1, hand.y - 2, '#e9c46a');
  }
}

function drawHead(p, h, pal, face, swing, blink = false) {
  // Cabello atrás, cara adelante (mira a la derecha).
  if (pal.hairStyle === 'pony') {
    p.line(h.x - 4, h.y - 3, h.x - 8, h.y - 1 + swing, pal.hair, 2);
    p.line(h.x - 8, h.y - 1 + swing, h.x - 9, h.y + 2 + swing * 2, pal.hair, 2);
    p.px(h.x - 4, h.y - 3, pal.accent);
    p.px(h.x - 4, h.y - 2, pal.accent);
  }
  if (pal.hairStyle === 'bun') p.disc(h.x - 5, h.y - 4, 2, pal.hair);
  p.disc(h.x - 1, h.y - 1, pal.hairStyle === 'buzz' ? 4 : 5, pal.hair);
  p.disc(h.x + 1, h.y + 1, 4, pal.skin);
  if (pal.hairStyle !== 'buzz') {
    p.rect(h.x - 1, h.y - 4, 5, 2, pal.hair); // fleco
    p.px(h.x - 2, h.y - 4, pal.hairLight);
  }
  if (pal.hairStyle === 'messy') {
    p.px(h.x - 3, h.y - 6, pal.hair); p.px(h.x, h.y - 6, pal.hair); p.px(h.x + 3, h.y - 5, pal.hair);
  }
  if (pal.hairStyle === 'cap') {
    // gorra al revés: la visera queda atrás
    p.rect(h.x - 5, h.y - 6, 10, 3, pal.accent);
    p.rect(h.x - 9, h.y - 4, 4, 2, pal.accent);
    p.px(h.x - 1, h.y - 6, '#ffffff');
  }
  if (pal.hairStyle === 'chef') {
    p.rect(h.x - 5, h.y - 9, 10, 5, pal.hair);
    p.rect(h.x - 4, h.y - 10, 8, 1, pal.hair);
  }
  p.px(h.x - 1, h.y + 1, pal.skinDark); // oreja
  if (pal.earrings) p.px(h.x - 1, h.y + 3, pal.accent);
  const ex = h.x + 3, ey = h.y;
  if (pal.stubble) { p.px(h.x + 1, h.y + 4, pal.skinDark); p.px(h.x + 3, h.y + 4, pal.skinDark); }
  if (face === 'cry') {
    p.px(ex - 1, ey + 1, pal.eye); p.px(ex, ey + 1, pal.eye); p.px(ex + 1, ey + 1, pal.eye);
    p.px(ex, ey + 2, '#6fb1f2'); p.px(ex, ey + 3, '#6fb1f2');
    p.px(ex + 1, ey + 4, pal.eye); p.px(ex + 2, ey + 3, pal.eye);
  } else if (face === 'angry') {
    p.px(ex - 1, ey - 2, pal.eye); p.px(ex, ey - 1, pal.eye);
    p.px(ex, ey, pal.eye); p.px(ex, ey + 1, pal.eye);
    p.px(ex, ey + 3, pal.eye); p.px(ex + 1, ey + 3, pal.eye); p.px(ex + 2, ey + 3, pal.eye);
  } else if (face === 'shock') {
    p.rect(ex, ey - 1, 2, 2, pal.eye);
    p.rect(ex + 1, ey + 3, 2, 2, pal.eye);
  } else if (face === 'ouch') {
    p.px(ex - 1, ey, pal.eye); p.px(ex, ey + 1, pal.eye); p.px(ex + 1, ey, pal.eye);
    p.px(ex + 1, ey + 3, pal.eye); p.px(ex + 2, ey + 3, pal.eye);
  } else if (face === 'happy') {
    p.px(ex - 1, ey + 1, pal.eye); p.px(ex, ey, pal.eye); p.px(ex + 1, ey + 1, pal.eye);
    p.px(ex + 1, ey + 3, pal.eye); p.px(ex + 2, ey + 3, '#c0392b');
  } else {
    p.px(ex, ey, pal.eye); p.px(ex, ey + 1, pal.eye);
    if (face === 'open') { p.px(ex + 1, ey + 3, pal.eye); p.px(ex + 1, ey + 4, pal.eye); }
    else if (face === 'grit') { p.px(ex, ey + 3, pal.eye); p.px(ex + 1, ey + 3, pal.eye); p.px(ex + 2, ey + 3, pal.eye); }
    else if (face === 'sad') { p.px(ex, ey + 4, pal.eye); p.px(ex + 1, ey + 3, pal.eye); }
    else { p.px(ex + 1, ey + 3, pal.eye); p.px(ex + 2, ey + 3, pal.eye); }
  }
  // Parpadeo: el ojo se vuelve una rayita (la boca del gesto se queda igual).
  if (blink) {
    p.rect(ex - 1, ey - 1, 3, 3, pal.skin);
    p.rect(ex - 1, ey + 1, 3, 1, pal.eye);
  }
  p.px(h.x + 2, h.y + 2, pal.blush);
  if (pal.mustache) p.rect(ex, ey + 2, 3, 1, pal.hair);
  if (pal.glasses) {
    const g = pal.glasses;
    p.px(ex - 1, ey - 1, g); p.px(ex, ey - 1, g); p.px(ex + 1, ey - 1, g);
    p.px(ex + 1, ey + 1, g); p.px(ex - 1, ey + 1, g); p.px(ex, ey + 2, g);
    p.line(h.x - 1, ey - 1, ex - 2, ey - 1, g);
  }
}

function drawKid(p, j, pal, build = BUILDS.kid) {
  const { body, limb } = build;
  drawArm(p, j.shoulder, j.elbowB, j.handB, pal, true, limb);
  drawLeg(p, j.hip, j.kneeB, j.footB, pal, true, limb);
  p.line(j.shoulder.x, j.shoulder.y, j.hip.x, j.hip.y, pal.shirt, body);
  const band = lerp(j.hip, j.shoulder, 0.2);
  p.line(j.hip.x, j.hip.y, band.x, band.y, pal.shorts, body);
  if (pal.apron) {
    const a = lerp(j.shoulder, j.hip, 0.45);
    p.line(a.x + 1, a.y, j.hip.x + 1, j.hip.y + 3, pal.apron, body - 2);
  }
  if (pal.dino) {
    // dinosaurio en la playera
    p.rect(j.shoulder.x - 1, j.shoulder.y + 2, 3, 2, pal.accent);
    p.px(j.shoulder.x + 2, j.shoulder.y + 1, pal.accent);
  }
  drawLeg(p, j.hip, j.kneeF, j.footF, pal, false, limb);
  drawHead(p, j.head, pal, j.face || 'smile', j.swing || 0, j.blink);
  drawArm(p, j.shoulder, j.elbowF, j.handF, pal, false, limb);
}

// Zancada de carrera: t va de 0 a 1 a lo largo del ciclo.
function runPose(t) {
  const ph = t * Math.PI * 2;
  const bob = Math.abs(Math.sin(ph)) > 0.7 ? 0 : -1;
  const hip = { x: 11, y: 19 + bob };
  const shoulder = { x: 13, y: 12 + bob };
  const head = { x: 15, y: 7 + bob };
  const leg = phase => {
    const a = 0.75 * Math.sin(phase);
    const bend = 0.25 + 1.2 * Math.max(0, Math.sin(phase - 1.2));
    const knee = polar(hip, 5, a);
    return { knee, foot: polar(knee, 5, a - bend) };
  };
  const arm = phase => {
    const c = -0.9 * Math.sin(phase);
    const elbow = polar(shoulder, 4, c);
    return { elbow, hand: polar(elbow, 3, c + 1.5) };
  };
  const f = leg(ph), b = leg(ph + Math.PI), af = arm(ph), ab = arm(ph + Math.PI);
  return {
    hip, shoulder, head, swing: Math.round(Math.sin(ph)),
    kneeF: f.knee, footF: f.foot, kneeB: b.knee, footB: b.foot,
    elbowF: af.elbow, handF: af.hand, elbowB: ab.elbow, handB: ab.hand,
  };
}

const P = (x, y) => ({ x, y });

const POSES = {
  idle0: { hip: P(12, 20), shoulder: P(12, 13), head: P(13, 8), kneeF: P(13, 25), footF: P(13, 30), kneeB: P(11, 25), footB: P(10, 30), elbowF: P(13, 17), handF: P(14, 20), elbowB: P(11, 17), handB: P(10, 20) },
  idle1: { hip: P(12, 20), shoulder: P(12, 14), head: P(13, 9), kneeF: P(13, 25), footF: P(13, 30), kneeB: P(11, 25), footB: P(10, 30), elbowF: P(13, 18), handF: P(14, 21), elbowB: P(11, 18), handB: P(10, 21), swing: 1 },
  ready: { hip: P(11, 21), shoulder: P(14, 14), head: P(16, 9), kneeF: P(15, 25), footF: P(15, 30), kneeB: P(9, 25), footB: P(7, 30), elbowF: P(17, 17), handF: P(19, 15), elbowB: P(12, 18), handB: P(15, 19), face: 'grit' },
  slide: { hip: P(11, 27), shoulder: P(6, 22), head: P(5, 17), kneeF: P(16, 27), footF: P(21, 28), kneeB: P(15, 24), footB: P(18, 29), elbowF: P(10, 19), handF: P(13, 17), elbowB: P(4, 26), handB: P(3, 29), face: 'open', swing: 1 },
  tuck: { hip: P(11, 19), shoulder: P(14, 13), head: P(15, 8), kneeF: P(16, 16), footF: P(12, 21), kneeB: P(15, 18), footB: P(11, 23), elbowF: P(16, 16), handF: P(17, 18), elbowB: P(14, 17), handB: P(15, 19), face: 'grit' },
  hop: { hip: P(11, 18), shoulder: P(14, 11), head: P(15, 6), kneeF: P(16, 18), footF: P(20, 21), kneeB: P(8, 21), footB: P(4, 23), elbowF: P(17, 13), handF: P(20, 10), elbowB: P(10, 14), handB: P(7, 13), face: 'open', swing: -1 },
  trip: { hip: P(10, 21), shoulder: P(15, 17), head: P(19, 14), kneeF: P(9, 25), footF: P(6, 29), kneeB: P(7, 22), footB: P(3, 20), elbowF: P(18, 21), handF: P(21, 24), elbowB: P(14, 21), handB: P(17, 24), face: 'ouch', swing: -1 },
  down: { hip: P(9, 27), shoulder: P(15, 27), head: P(19, 25), kneeF: P(5, 28), footF: P(2, 27), kneeB: P(5, 29), footB: P(2, 29), elbowF: P(17, 29), handF: P(21, 29), elbowB: P(14, 29), handB: P(12, 29), face: 'ouch', swing: 2 },
  getup: { hip: P(11, 24), shoulder: P(13, 17), head: P(14, 12), kneeF: P(15, 25), footF: P(15, 30), kneeB: P(9, 29), footB: P(5, 30), elbowF: P(15, 21), handF: P(16, 24), elbowB: P(12, 21), handB: P(13, 24), face: 'grit' },
  cheer0: { hip: P(12, 20), shoulder: P(12, 13), head: P(13, 8), kneeF: P(13, 25), footF: P(14, 30), kneeB: P(11, 25), footB: P(10, 30), elbowF: P(16, 10), handF: P(17, 6), elbowB: P(9, 10), handB: P(8, 6), face: 'happy' },
  cheer1: { hip: P(12, 18), shoulder: P(12, 11), head: P(13, 6), kneeF: P(14, 23), footF: P(15, 27), kneeB: P(10, 23), footB: P(9, 27), elbowF: P(16, 8), handF: P(18, 4), elbowB: P(9, 8), handB: P(7, 4), face: 'happy', swing: -1 },
  sad: { hip: P(12, 20), shoulder: P(12, 14), head: P(13, 10), kneeF: P(13, 25), footF: P(13, 30), kneeB: P(11, 25), footB: P(10, 30), elbowF: P(12, 18), handF: P(12, 22), elbowB: P(11, 18), handB: P(11, 22), face: 'sad', swing: 1 },
  // calentamiento antes de correr (lección)
  stretch0: { hip: P(12, 20), shoulder: P(12, 13), head: P(13, 8), kneeF: P(13, 25), footF: P(14, 30), kneeB: P(11, 25), footB: P(10, 30), elbowF: P(14, 9), handF: P(15, 4), elbowB: P(11, 9), handB: P(10, 4) },
  stretch1: { hip: P(12, 20), shoulder: P(11, 13), head: P(11, 8), kneeF: P(13, 25), footF: P(14, 30), kneeB: P(11, 25), footB: P(10, 30), elbowF: P(10, 8), handF: P(7, 4), elbowB: P(9, 9), handB: P(6, 5), swing: -1 },
  lunge0: { hip: P(11, 22), shoulder: P(13, 15), head: P(14, 10), kneeF: P(16, 25), footF: P(17, 30), kneeB: P(7, 26), footB: P(3, 30), elbowF: P(15, 19), handF: P(16, 23), elbowB: P(13, 19), handB: P(15, 22), face: 'grit' },
  lunge1: { hip: P(12, 22), shoulder: P(12, 15), head: P(13, 10), kneeF: P(8, 26), footF: P(4, 30), kneeB: P(16, 25), footB: P(17, 30), elbowF: P(14, 19), handF: P(16, 23), elbowB: P(12, 19), handB: P(15, 22), face: 'grit', swing: 1 },
  set: { hip: P(10, 22), shoulder: P(15, 19), head: P(18, 15), kneeF: P(14, 26), footF: P(13, 30), kneeB: P(9, 29), footB: P(5, 30), elbowF: P(17, 24), handF: P(18, 30), elbowB: P(15, 24), handB: P(16, 30), face: 'grit', swing: 1 },
  // gestos para los diálogos
  angry: { hip: P(12, 20), shoulder: P(12, 13), head: P(13, 8), kneeF: P(14, 25), footF: P(15, 30), kneeB: P(10, 25), footB: P(9, 30), elbowF: P(15, 16), handF: P(13, 19), elbowB: P(9, 16), handB: P(11, 19), face: 'angry' },
  cry: { hip: P(12, 20), shoulder: P(12, 14), head: P(13, 9), kneeF: P(13, 25), footF: P(13, 30), kneeB: P(11, 25), footB: P(10, 30), elbowF: P(15, 16), handF: P(16, 11), elbowB: P(14, 17), handB: P(15, 12), face: 'cry', swing: 1 },
  shock: { hip: P(12, 20), shoulder: P(12, 13), head: P(13, 8), kneeF: P(14, 25), footF: P(15, 30), kneeB: P(10, 25), footB: P(9, 30), elbowF: P(15, 15), handF: P(18, 13), elbowB: P(9, 15), handB: P(6, 13), face: 'shock', swing: -1 },
  fly: { hip: P(10, 19), shoulder: P(15, 15), head: P(19, 12), kneeF: P(6, 18), footF: P(2, 19), kneeB: P(6, 22), footB: P(2, 23), elbowF: P(19, 11), handF: P(23, 9), elbowB: P(12, 11), handB: P(10, 7), face: 'happy', swing: -1 },
  talk: { hip: P(12, 20), shoulder: P(12, 13), head: P(13, 8), kneeF: P(13, 25), footF: P(13, 30), kneeB: P(11, 25), footB: P(10, 30), elbowF: P(14, 16), handF: P(17, 15), elbowB: P(11, 17), handB: P(10, 20), face: 'open' },
};

// Poses de pie que también existen para adultos, adolescentes y niños pequeños.
export const STANDING = ['idle0', 'idle1', 'sad', 'angry', 'cry', 'shock', 'talk', 'cheer0', 'cheer1'];

// Estira o encoge una pose de niño a otra complexión (solo sirve para poses de pie).
function reshape(joints, b) {
  if (b === BUILDS.kid) return joints;
  const FOOT = 30, HIP = 20, SH = 13;
  const footN = b.h - 2;
  const hipN = footN - (FOOT - HIP) * b.legs;
  const shN = hipN - (HIP - SH) * b.torso;
  const mapY = y => (y >= HIP ? footN - (FOOT - y) * b.legs : y >= SH ? hipN - (HIP - y) * b.torso : shN - (SH - y));
  const out = {};
  for (const [k, v] of Object.entries(joints)) out[k] = v && typeof v === 'object' ? { x: v.x + b.dx, y: mapY(v.y) } : v;
  return out;
}

export const RUN_FRAMES = 6;

// Gestos que tienen un cuadro «_b» con los ojos cerrados para parpadear en los diálogos.
export const BLINKABLE = ['idle0', 'idle1', 'talk', 'sad', 'angry', 'cheer0', 'shock'];

function frame(name, joints, pal, build = BUILDS.kid) {
  const { c, p } = makeCanvas(build.w, build.h);
  drawKid(p, reshape(joints, build), pal, build);
  outline(c, pal.outline);
  return { name, canvas: c };
}

export function buildKidSheet(scene, key, pal) {
  const frames = [];
  for (let i = 0; i < RUN_FRAMES; i++) frames.push(frame(`run${i}`, runPose(i / RUN_FRAMES), pal));
  for (const [name, joints] of Object.entries(POSES)) frames.push(frame(name, joints, pal));
  for (const name of BLINKABLE) frames.push(frame(`${name}_b`, { ...POSES[name], blink: true }, pal));
  addSheet(scene, key, frames, FRAME_W, FRAME_H);
}

// Adolescentes, adultos y niños pequeños: misma hoja que los niños (correr, saltar, poses de
// diálogo), estirada a su complexión. Las poses de acción quedan aproximadas, pero se ven bien
// de lejos, que es como aparecen en la carrera.
export function buildBuildSheet(scene, key, pal, buildName) {
  const build = BUILDS[buildName];
  if (build === BUILDS.kid) return buildKidSheet(scene, key, pal);
  const frames = [];
  for (let i = 0; i < RUN_FRAMES; i++) frames.push(frame(`run${i}`, runPose(i / RUN_FRAMES), pal, build));
  for (const [name, joints] of Object.entries(POSES)) frames.push(frame(name, joints, pal, build));
  for (const name of BLINKABLE) frames.push(frame(`${name}_b`, { ...POSES[name], blink: true }, pal, build));
  addSheet(scene, key, frames, build.w, build.h);
}

// Retrato pequeño (cabeza) para marcadores del mapa.
export function buildKidHead(scene, key, pal) {
  const { c, p } = makeCanvas(14, 14);
  drawHead(p, add({ x: 6, y: 7 }, 0, 0), { ...pal, hairStyle: 'none' }, 'smile', 0);
  if (pal.hairStyle === 'pony') {
    p.line(2, 4, 0, 7, pal.hair, 2);
    p.px(2, 4, pal.accent);
  }
  outline(c, pal.outline);
  scene.textures.addCanvas(key, c);
}
