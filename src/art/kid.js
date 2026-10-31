// Personaje infantil como "marioneta" de pixeles: las poses se definen por articulaciones
// y el contorno se agrega al final. Sirve para Sofía y para los rivales (cambiando la paleta).
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
};

const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const add = (a, dx, dy) => ({ x: a.x + dx, y: a.y + dy });

function polar(origin, len, ang) {
  return { x: origin.x + Math.sin(ang) * len, y: origin.y + Math.cos(ang) * len };
}

function drawLeg(p, hip, knee, foot, pal, back) {
  const skin = back ? pal.skinDark : pal.skin;
  const shorts = back ? pal.shortsDark : pal.shorts;
  p.line(knee.x, knee.y, foot.x, foot.y, skin, 2);
  p.line(hip.x, hip.y, knee.x, knee.y, skin, 2);
  const mid = lerp(hip, knee, 0.55);
  p.line(hip.x, hip.y, mid.x, mid.y, shorts, 3);
  p.rect(foot.x - 1, foot.y - 1, 4, 2, pal.shoe);
  p.px(foot.x + 1, foot.y - 1, pal.shoeAccent);
}

function drawArm(p, shoulder, elbow, hand, pal, back) {
  const skin = back ? pal.skinDark : pal.skin;
  p.line(elbow.x, elbow.y, hand.x, hand.y, skin, 2);
  p.line(shoulder.x, shoulder.y, elbow.x, elbow.y, skin, 2);
  const sleeve = lerp(shoulder, elbow, 0.45);
  p.line(shoulder.x, shoulder.y, sleeve.x, sleeve.y, back ? pal.shirtDark : pal.shirt, 2);
}

function drawHead(p, h, pal, face, swing) {
  // Cabello atrás, cara adelante (mira a la derecha).
  if (pal.hairStyle === 'pony') {
    p.line(h.x - 4, h.y - 3, h.x - 8, h.y - 1 + swing, pal.hair, 2);
    p.line(h.x - 8, h.y - 1 + swing, h.x - 9, h.y + 2 + swing * 2, pal.hair, 2);
    p.px(h.x - 4, h.y - 3, pal.accent);
    p.px(h.x - 4, h.y - 2, pal.accent);
  }
  p.disc(h.x - 1, h.y - 1, 5, pal.hair);
  p.disc(h.x + 1, h.y + 1, 4, pal.skin);
  p.rect(h.x - 1, h.y - 4, 5, 2, pal.hair); // fleco
  p.px(h.x - 2, h.y - 4, pal.hairLight);
  p.px(h.x - 1, h.y + 1, pal.skinDark); // oreja
  const ex = h.x + 3, ey = h.y;
  if (face === 'ouch') {
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
  p.px(h.x + 2, h.y + 2, pal.blush);
}

function drawKid(p, j, pal) {
  drawArm(p, j.shoulder, j.elbowB, j.handB, pal, true);
  drawLeg(p, j.hip, j.kneeB, j.footB, pal, true);
  p.line(j.shoulder.x, j.shoulder.y, j.hip.x, j.hip.y, pal.shirt, 5);
  const band = lerp(j.hip, j.shoulder, 0.2);
  p.line(j.hip.x, j.hip.y, band.x, band.y, pal.shorts, 5);
  drawLeg(p, j.hip, j.kneeF, j.footF, pal, false);
  drawHead(p, j.head, pal, j.face || 'smile', j.swing || 0);
  drawArm(p, j.shoulder, j.elbowF, j.handF, pal, false);
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
};

export const RUN_FRAMES = 6;

function frame(name, joints, pal) {
  const { c, p } = makeCanvas(FRAME_W, FRAME_H);
  drawKid(p, joints, pal);
  outline(c, pal.outline);
  return { name, canvas: c };
}

export function buildKidSheet(scene, key, pal) {
  const frames = [];
  for (let i = 0; i < RUN_FRAMES; i++) frames.push(frame(`run${i}`, runPose(i / RUN_FRAMES), pal));
  for (const [name, joints] of Object.entries(POSES)) frames.push(frame(name, joints, pal));
  addSheet(scene, key, frames, FRAME_W, FRAME_H);
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
