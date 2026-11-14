// Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
// Esqueleto de Sofía de adolescente, joven y adulta: las poses se escriben con ángulos y cada
// complexión pone el largo de los huesos. Así la misma pose sirve para las tres edades sin
// deformarse (la de niña, en kid.js, usa posiciones fijas). Es matemática pura: no dibuja nada,
// para poder probarla sin navegador (tests/rig.test.js).
//
// Ángulos en radianes. Piernas y brazos: 0 = hacia abajo, positivo = hacia adelante (Sofía mira a
// la derecha), π = hacia arriba. knee: cuánto se dobla la rodilla (la espinilla va hacia atrás).
// elbow: cuánto se dobla el codo (el antebrazo va hacia adelante). lean: inclinación del torso
// (0 = derecho, positivo = hacia adelante, negativo = hacia atrás).

// Cuadro común de las tres etapas (en px de arte; en pantalla se ve ×3). Ancho de sobra para
// las poses horizontales (clavado, salto largo).
export const RIG_W = 48;
export const RIG_H = 52;
export const RIG_FOOT = RIG_H - 2; // donde pisan

// Huesos de cada etapa. headUp: del hombro al centro de la cabeza. limb/thigh: grosor de brazos
// y muslos; body: grosor del torso.
export const STAGE_BUILDS = {
  teen: { thigh: 6, shin: 6, torso: 9, upper: 4, fore: 4, headUp: 5, limb: 2, thighW: 2, body: 5, shoe: 4 },
  joven: { thigh: 7, shin: 7, torso: 10, upper: 5, fore: 4, headUp: 5, limb: 2, thighW: 3, body: 5, shoe: 5 },
  adulta: { thigh: 8, shin: 7, torso: 11, upper: 5, fore: 5, headUp: 5, limb: 2, thighW: 3, body: 6, shoe: 5 },
};

// Radio aproximado de la cabeza con el pelo (para que nada se salga del cuadro).
export const HEAD_R = 6;

const polar = (o, len, ang) => ({ x: o.x + Math.sin(ang) * len, y: o.y + Math.cos(ang) * len });

// Poses fijas. legF/legB: [muslo, rodilla]; armF/armB: [brazo, codo] (F = el de enfrente).
// lift: px que la pose se despega del suelo; torso: px de más o de menos (respirar).
export const RIG_POSES = {
  idle0: { lean: 0.02, legF: [0.07, 0.02], legB: [-0.1, 0.03], armF: [0.14, 0.3], armB: [-0.1, 0.3] },
  idle1: { lean: 0.02, torso: -1, legF: [0.07, 0.02], legB: [-0.1, 0.03], armF: [0.1, 0.25], armB: [-0.12, 0.25], swing: 1 },
  ready: { lean: 0.38, legF: [0.4, 0.45], legB: [-0.35, 0.35], armF: [0.95, 1.45], armB: [0.35, 1.35], face: 'grit' },
  slide: { dx: 3, lean: -1.25, legF: [1.5, 0.05], legB: [1.15, 1.35], armF: [2.0, 0.7], armB: [-0.75, 0.15], face: 'open', swing: 1 },
  tuck: { lean: 0.55, legF: [2.25, 2.6], legB: [2.05, 2.5], armF: [1.4, 1.15], armB: [1.25, 1.2], face: 'grit' },
  hop: { lean: 0.3, legF: [1.25, 1.45], legB: [-0.75, 0.6], armF: [2.35, 0.45], armB: [-1.05, 0.4], face: 'open', swing: -1 },
  trip: { lean: 1.0, legF: [-0.3, 0.5], legB: [-0.95, 0.25], armF: [1.75, 0.35], armB: [1.35, 0.5], face: 'ouch', swing: -1 },
  down: { lean: 1.55, legF: [-1.5, 0.15], legB: [-1.6, 0.1], armF: [1.6, 0.1], armB: [1.45, 0.2], face: 'ouch', swing: 2 },
  getup: { lean: 0.4, legF: [1.45, 1.55], legB: [0.25, 1.95], armF: [0.95, 0.8], armB: [0.5, 0.6], face: 'grit' },
  cheer0: { lean: 0, legF: [0.1, 0.02], legB: [-0.12, 0.02], armF: [2.7, 0.15], armB: [-2.7, -0.15], face: 'happy' },
  cheer1: { lean: 0, lift: 3, legF: [0.45, 0.85], legB: [-0.15, 0.75], armF: [2.85, 0.1], armB: [-2.85, -0.1], face: 'happy', swing: -1 },
  sad: { lean: 0.14, legF: [0.05, 0.02], legB: [-0.06, 0.02], armF: [0.04, 0.05], armB: [-0.02, 0.05], face: 'sad', swing: 1 },
  // calentamiento antes de correr (lección)
  stretch0: { lean: 0, legF: [0.1, 0], legB: [-0.12, 0], armF: [3.0, 0.05], armB: [3.08, 0.05] },
  stretch1: { lean: -0.16, legF: [0.1, 0], legB: [-0.12, 0], armF: [-2.75, 0.2], armB: [-2.6, 0.2], swing: -1 },
  lunge0: { lean: 0.15, legF: [1.05, 1.15], legB: [-0.7, 0.12], armF: [0.65, 0.8], armB: [0.5, 0.9], face: 'grit' },
  lunge1: { lean: 0.12, legF: [-0.7, 0.12], legB: [1.05, 1.15], armF: [0.6, 0.85], armB: [0.45, 0.9], face: 'grit', swing: 1 },
  set: { lean: 1.05, legF: [1.25, 2.05], legB: [0.3, 1.65], armF: [0.05, 0], armB: [-0.05, 0], face: 'grit', swing: 1 },
  // gestos para los diálogos
  angry: { lean: 0.04, legF: [0.16, 0.02], legB: [-0.16, 0.02], armF: [0.45, -1.25], armB: [-0.45, 1.25], face: 'angry' },
  cry: { lean: 0.12, legF: [0.06, 0.02], legB: [-0.08, 0.02], armF: [0.9, 2.05], armB: [0.8, 2.15], face: 'cry', swing: 1 },
  shock: { lean: -0.1, legF: [0.16, 0.02], legB: [-0.16, 0.02], armF: [1.9, 0.4], armB: [-1.9, -0.4], face: 'shock', swing: -1 },
  fly: { lean: 1.35, legF: [-1.2, 0.25], legB: [-1.6, 0.1], armF: [2.4, 0.2], armB: [2.05, 0.35], face: 'happy', swing: -1 },
  talk: { lean: 0.02, legF: [0.07, 0.02], legB: [-0.1, 0.03], armF: [0.95, 1.0], armB: [-0.1, 0.3], face: 'open' },
  // ---- Parkour de las etapas nuevas ----
  // salto de gato (kong): primero se clava hacia adelante con los brazos estirados...
  kong0: { lean: 1.3, legF: [-0.55, 0.6], legB: [-0.95, 0.4], armF: [1.55, 0.08], armB: [1.4, 0.15], face: 'grit', swing: -1 },
  // ...y luego apoya las manos y pasa las rodillas entre los brazos
  kong1: { lean: 1.0, legF: [1.95, 2.45], legB: [1.75, 2.35], armF: [0.25, 0], armB: [0.12, 0], face: 'grit', swing: -1 },
  // patada contra la pared (tic-tac): un pie en la pared y los brazos hacia arriba
  kick: { lean: -0.15, legF: [1.95, 1.25], legB: [-0.3, 0.5], armF: [2.6, 0.2], armB: [2.4, 0.4], face: 'grit', swing: 1 },
  // colgada del borde de una barda (cat leap): manos arriba, pies contra la pared
  hang: { lean: 0.08, legF: [0.9, 0.5], legB: [0.6, 0.65], armF: [2.88, 0.05], armB: [2.78, 0.1], face: 'grit', swing: 1 },
  // subiendo: una rodilla arriba y las manos empujando
  climb: { lean: 0.75, legF: [1.75, 2.0], legB: [0.1, 0.4], armF: [0.3, 0.2], armB: [0.2, 0.2], face: 'grit' },
  // agachada arriba de algo, lista para seguir
  crouch: { lean: 0.6, legF: [1.3, 2.2], legB: [0.9, 2.3], armF: [0.6, 0.5], armB: [0.4, 0.5], face: 'grit' },
  // aterrizaje de precisión: rodillas dobladas y brazos al frente
  land: { lean: 0.5, legF: [1.1, 1.9], legB: [0.8, 1.9], armF: [1.15, 0.6], armB: [0.85, 0.6], face: 'grit' },
  // equilibrio en el barandal (dos pasos)
  balance0: { lean: 0.08, legF: [0.32, 0.12], legB: [-0.28, 0.32], armF: [1.55, 0.1], armB: [-1.55, -0.1] },
  balance1: { lean: 0.08, legF: [-0.08, 0.22], legB: [0.16, 0.05], armF: [1.45, 0.15], armB: [-1.65, -0.15], swing: 1 },
};

// Cómo corre cada etapa: de adolescente, zancada corta y brazos sueltos; de joven, más rodilla y
// braceo; de adulta, zancada larga, inclinada hacia adelante y con los codos a 90°.
export const RUN_STYLES = {
  teen: { frames: 6, fps: 12, stride: 0.82, knee: 0.25, kneeLift: 1.25, arm: 0.95, elbow: 1.4, lean: 0.14 },
  joven: { frames: 8, fps: 16, stride: 0.92, knee: 0.3, kneeLift: 1.4, arm: 1.05, elbow: 1.55, lean: 0.2 },
  adulta: { frames: 8, fps: 16, stride: 1.02, knee: 0.3, kneeLift: 1.55, arm: 1.15, elbow: 1.65, lean: 0.26 },
};

// Cuadro t (0 a 1) del ciclo de carrera. La cadera se mantiene a la misma altura (con un rebote
// de 1 px): así los pies pasan por el suelo sin que el cuerpo salte en cada cuadro.
export function runPose(style, t) {
  const ph = t * Math.PI * 2;
  const leg = p => [style.stride * Math.sin(p), style.knee + style.kneeLift * Math.max(0, Math.sin(p - 1.2))];
  const arm = p => [-style.arm * Math.sin(p), style.elbow];
  return {
    lean: style.lean + 0.04 * Math.cos(2 * ph),
    hip: Math.abs(Math.sin(ph)) > 0.7 ? 1 : 0,
    legF: leg(ph), legB: leg(ph + Math.PI), armF: arm(ph), armB: arm(ph + Math.PI),
    swing: Math.round(Math.sin(ph)),
  };
}

// Articulaciones de una pose en coordenadas del cuadro. Con pose.hip (carrera) la cadera queda a la
// altura de estar parada; si no, la pose se apoya en el suelo por su punto más bajo.
export function solvePose(pose, build) {
  const torso = build.torso + (pose.torso || 0);
  const hip0 = { x: RIG_W / 2 - 1 + (pose.dx || 0), y: 0 };
  const lean = pose.lean || 0;
  const shoulder = { x: hip0.x + Math.sin(lean) * torso, y: hip0.y - Math.cos(lean) * torso };
  const head = { x: shoulder.x + Math.sin(lean) * build.headUp + 1, y: shoulder.y - Math.cos(lean) * build.headUp };
  const leg = ([a, k]) => {
    const knee = polar(hip0, build.thigh, a);
    return { knee, foot: polar(knee, build.shin, a - k) };
  };
  const arm = ([s, e]) => {
    const elbow = polar(shoulder, build.upper, s);
    return { elbow, hand: polar(elbow, build.fore, s + e) };
  };
  const f = leg(pose.legF), b = leg(pose.legB), af = arm(pose.armF), ab = arm(pose.armB);
  const j = {
    hip: hip0, shoulder, head,
    kneeF: f.knee, footF: f.foot, kneeB: b.knee, footB: b.foot,
    elbowF: af.elbow, handF: af.hand, elbowB: ab.elbow, handB: ab.hand,
  };
  let shift;
  if (pose.hip != null) {
    shift = RIG_FOOT - (build.thigh + build.shin) - pose.hip;
  } else {
    const low = Math.max(...Object.entries(j).map(([k, p]) => (k === 'head' ? p.y + HEAD_R - 1 : p.y)));
    shift = RIG_FOOT - low - (pose.lift || 0);
  }
  const out = { face: pose.face || 'smile', swing: pose.swing || 0, blink: !!pose.blink };
  for (const [k, p] of Object.entries(j)) out[k] = { x: Math.round(p.x), y: Math.round(p.y + shift) };
  return out;
}

// Caja que ocupa la pose (para comprobar que cabe en el cuadro).
export function poseBounds(joints) {
  const pts = Object.entries(joints).filter(([, p]) => p && typeof p === 'object');
  const xs = pts.flatMap(([k, p]) => (k === 'head' ? [p.x - HEAD_R - 5, p.x + HEAD_R] : [p.x - 2, p.x + 3]));
  const ys = pts.flatMap(([k, p]) => (k === 'head' ? [p.y - HEAD_R, p.y + HEAD_R] : [p.y - 2, p.y + 2]));
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

// Todas las poses de una etapa, con nombre de cuadro: run0…runN y las fijas.
export function stagePoses(stage) {
  const style = RUN_STYLES[stage];
  const list = [];
  for (let i = 0; i < style.frames; i++) list.push([`run${i}`, runPose(style, i / style.frames)]);
  for (const [name, pose] of Object.entries(RIG_POSES)) list.push([name, pose]);
  return list;
}

// Datos que la carrera necesita de cada cuadro, en px de arte medidos desde abajo del cuadro:
// handTop = altura de las manos (para colgarse de un borde) y mid = centro del cuerpo (para girar
// sobre él en las volteretas y rodadas).
export function frameMeta(stage, name) {
  const pose = RIG_POSES[name];
  if (!pose) return null;
  const j = solvePose(pose, STAGE_BUILDS[stage]);
  const b = poseBounds(j);
  return {
    handTop: RIG_H - Math.min(j.handF.y, j.handB.y),
    mid: RIG_H - Math.round((b.y0 + b.y1) / 2),
    top: RIG_H - b.y0,
  };
}
