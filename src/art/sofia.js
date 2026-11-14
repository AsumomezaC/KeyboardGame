// Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
// Sofía de adolescente, joven y adulta (modelos en construcción). Usan el esqueleto de rig.js y
// la misma cabeza de pixeles que la niña (kid.js), para que se reconozca: pelo castaño que tapa
// la frente, rojo-rosa en la ropa y el amarillo del listón.
//   teen:   trenza más larga con listón, playera con mangas, mallas a media pierna.
//   joven:  coleta alta con liga amarilla y banda, top sin mangas, pants con franja, manos vendadas.
//   adulta: trenza larga con listón, manga larga, pants cargo, manos vendadas.
import { makeCanvas, outline, addSheet } from './pixel.js';
import { drawHead } from './kid.js';
import { RIG_W, RIG_H, STAGE_BUILDS, RUN_STYLES, stagePoses, solvePose } from './rig.js';

export const STAGE_LOOKS = {
  teen: {
    skin: '#f2c29b', skinDark: '#d9946c', hair: '#4a2a1f', hairLight: '#7a4a32',
    shirt: '#e94f64', shirtDark: '#b83350', shorts: '#2f3f7a', shortsDark: '#222f5c',
    shoe: '#f5f5f5', shoeAccent: '#e23d3d', accent: '#ffd23f', eye: '#2b1d2e', blush: '#f08a8a',
    outline: '#2b1d2e', hairStyle: 'braid', braidLen: 9,
    sleeve: 0.5, pants: 'capri', stripe: null, tape: null,
  },
  joven: {
    skin: '#f2c29b', skinDark: '#d9946c', hair: '#4a2a1f', hairLight: '#7a4a32',
    shirt: '#ff5d73', shirtDark: '#c93f56', shorts: '#2b2d42', shortsDark: '#1d1e2e',
    shoe: '#f5f5f5', shoeAccent: '#ff5d73', accent: '#ffd23f', eye: '#2b1d2e', blush: '#f08a8a',
    outline: '#2b1d2e', hairStyle: 'ponyHigh', band: '#ffd23f', lash: true,
    sleeve: 0, pants: 'long', stripe: '#ff5d73', tape: '#f4f1e8',
  },
  adulta: {
    skin: '#f2c29b', skinDark: '#d9946c', hair: '#4a2a1f', hairLight: '#7a4a32',
    shirt: '#d63a55', shirtDark: '#a32a42', shorts: '#55603f', shortsDark: '#3f4830',
    shoe: '#2b2b2b', shoeAccent: '#ffd23f', accent: '#ffd23f', eye: '#2b1d2e', blush: '#e88a8a',
    outline: '#2b1d2e', hairStyle: 'braid', braidLen: 12, lash: true,
    sleeve: 1, pants: 'long', pocket: '#3f4830', cuff: '#ffd23f', tape: '#f4f1e8',
  },
};

// Llave de la hoja de cada etapa (la de niña es 'sofia').
export const STAGE_KEYS = { teen: 'sofia-teen', joven: 'sofia-joven', adulta: 'sofia-adulta' };

const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

function drawLeg(p, hip, knee, foot, look, b, back) {
  const skin = back ? look.skinDark : look.skin;
  const pants = back ? look.shortsDark : look.shorts;
  if (look.pants === 'capri') {
    // mallas hasta media espinilla
    const end = lerp(knee, foot, 0.55);
    p.line(end.x, end.y, foot.x, foot.y, skin, b.limb);
    p.line(knee.x, knee.y, end.x, end.y, pants, b.limb);
  } else {
    p.line(knee.x, knee.y, foot.x, foot.y, pants, b.limb);
    if (look.cuff && !back) { const c = lerp(knee, foot, 0.85); p.px(c.x, c.y, look.shortsDark); }
  }
  p.line(hip.x, hip.y, knee.x, knee.y, pants, b.thighW);
  if (!back && look.stripe) p.line(hip.x, hip.y, knee.x, knee.y, look.stripe, 1);
  if (!back && look.pocket) { const m = lerp(hip, knee, 0.55); p.rect(m.x, m.y, 2, 2, look.pocket); }
  p.rect(foot.x - 1, foot.y - 1, b.shoe, 2, back ? look.shoeAccent : look.shoe);
  p.px(foot.x + 1, foot.y - 1, look.shoeAccent);
}

function drawArm(p, shoulder, elbow, hand, look, b, back) {
  const skin = back ? look.skinDark : look.skin;
  const shirt = back ? look.shirtDark : look.shirt;
  if (look.sleeve >= 1) {
    p.line(shoulder.x, shoulder.y, elbow.x, elbow.y, shirt, b.limb);
    p.line(elbow.x, elbow.y, hand.x, hand.y, shirt, b.limb);
    p.rect(hand.x, hand.y, 2, 2, skin);
    if (look.cuff) { const c = lerp(elbow, hand, 0.75); p.px(c.x, c.y, look.cuff); }
  } else {
    p.line(elbow.x, elbow.y, hand.x, hand.y, skin, b.limb);
    p.line(shoulder.x, shoulder.y, elbow.x, elbow.y, skin, b.limb);
    if (look.sleeve > 0) {
      const s = lerp(shoulder, elbow, look.sleeve);
      p.line(shoulder.x, shoulder.y, s.x, s.y, shirt, b.limb);
    }
  }
  if (look.tape) { const t = lerp(elbow, hand, 0.8); p.px(t.x, t.y, look.tape); }
}

function drawAthlete(p, j, look, b) {
  drawArm(p, j.shoulder, j.elbowB, j.handB, look, b, true);
  drawLeg(p, j.hip, j.kneeB, j.footB, look, b, true);
  p.line(j.shoulder.x, j.shoulder.y, j.hip.x, j.hip.y, look.shirt, b.body);
  const band = lerp(j.hip, j.shoulder, 0.2);
  p.line(j.hip.x, j.hip.y, band.x, band.y, look.shorts, b.body);
  drawLeg(p, j.hip, j.kneeF, j.footF, look, b, false);
  drawHead(p, j.head, look, j.face, j.swing, j.blink);
  drawArm(p, j.shoulder, j.elbowF, j.handF, look, b, false);
}

// Gestos que tienen un cuadro «_b» con los ojos cerrados (igual que la niña).
const BLINKABLE = ['idle0', 'idle1', 'talk', 'sad', 'angry', 'cheer0', 'shock'];

function frame(name, pose, stage) {
  const { c, p } = makeCanvas(RIG_W, RIG_H);
  drawAthlete(p, solvePose(pose, STAGE_BUILDS[stage]), STAGE_LOOKS[stage], STAGE_BUILDS[stage]);
  outline(c, STAGE_LOOKS[stage].outline);
  return { name, canvas: c };
}

function buildStageHead(scene, key, look) {
  const { c, p } = makeCanvas(16, 16);
  drawHead(p, { x: 8, y: 8 }, { ...look, braidLen: 5 }, 'smile', 0);
  outline(c, look.outline);
  scene.textures.addCanvas(key, c);
}

// Hojas de las tres etapas, sus retratos para el mapa (sofia-teen-head…) y sus animaciones
// (sofia-teen-run, -idle, -cheer), con el ritmo de carrera de cada edad.
export function buildStageSheets(scene) {
  for (const [stage, key] of Object.entries(STAGE_KEYS)) {
    const poses = stagePoses(stage);
    const frames = poses.map(([name, pose]) => frame(name, pose, stage));
    for (const [name, pose] of poses) if (BLINKABLE.includes(name)) frames.push(frame(`${name}_b`, { ...pose, blink: true }, stage));
    addSheet(scene, key, frames, RIG_W, RIG_H);
    buildStageHead(scene, `${key}-head`, STAGE_LOOKS[stage]);
    const style = RUN_STYLES[stage];
    const seq = names => names.map(f => ({ key, frame: f }));
    scene.anims.create({ key: `${key}-idle`, frames: seq(['idle0', 'idle1']), frameRate: 2, repeat: -1 });
    scene.anims.create({ key: `${key}-cheer`, frames: seq(['cheer0', 'cheer1']), frameRate: 4, repeat: -1 });
    scene.anims.create({ key: `${key}-run`, frames: seq(Array.from({ length: style.frames }, (_, i) => `run${i}`)), frameRate: style.fps, repeat: -1 });
  }
}
