// Coreografía de los obstáculos largos (15 caracteres o más): cómo se mueve quien los pasa.
// Cada obstáculo es una lista de puntos clave sobre su recorrido (x, de start a end, en px):
//   h: altura de los pies sobre el suelo · f: cuadro ('run' = sigue corriendo, 'balance' alterna
//   los dos pasos de equilibrio) · wx: dónde va de verdad (si no avanza al mismo paso, p. ej. al
//   rebotar entre paredes) · flip: mira hacia atrás · spin: grados que gira hasta el siguiente punto
//   (sobre el centro de su cuerpo) · arc: cuánto sube de más a la mitad del tramo.
// Las paradas de los obstáculos por etapas (holds de runner.js) tienen su punto clave propio, con
// la pose en la que espera mientras se escribe el siguiente tramo.
import { OBSTACLE_TYPES } from '../game/runner.js';
import { frameMeta } from '../art/rig.js';
import { STAGE_KEYS } from '../art/sofia.js';

// Pixeles de pantalla por pixel de arte (el SCALE de common.js; aquí aparte para no cargar Phaser
// en las pruebas). Las alturas de TOP ya están medidas a esta escala.
const SCALE = 3;

export const LONG_TYPES = new Set(['container', 'alley', 'highwall', 'rail', 'bus', 'stalls']);

// Alturas de las superficies en pantalla (px sobre los pies), medidas del arte de props.js.
const TOP = { container: 97, gate: 130, alleyWalls: 190, highwall: 196, rail: 64, hood: 70, roof: 130, stalls: [100, 124, 112] };

// Para el texto del obstáculo: h = lo más alto del obstáculo; clear = espacio para quien va encima.
export const LONG_PROPS = {
  container: { key: 'container', y: 2, h: TOP.container },
  alley: { key: 'alley', y: 2, h: TOP.alleyWalls },
  highwall: { key: 'highwall', y: 2, h: TOP.highwall, clear: 120 },
  rail: { key: 'rail', y: 2, h: TOP.rail, clear: 120 },
  bus: { key: 'bus', y: 2, h: TOP.roof, clear: 120 },
  stalls: { key: 'stalls', y: 2, h: TOP.stalls[1], clear: 150 },
};

const STAGE_OF = Object.fromEntries(Object.entries(STAGE_KEYS).map(([stage, key]) => [key, stage]));

function span(type) {
  const t = OBSTACLE_TYPES[type];
  return { pre: t.pre, w: t.w, end: t.pre + t.w + t.post, holds: (t.holds || []).map(f => f * (t.pre + t.w + t.post)) };
}

function keysFor(type, sheet) {
  const meta = name => (STAGE_OF[sheet] && frameMeta(STAGE_OF[sheet], name)) || { handTop: 30, mid: 12 };
  const { pre, w, end, holds: [h1, h2, h3] } = span(type);
  switch (type) {
    // salto de gato: se clava, apoya las manos arriba y pasa las rodillas entre los brazos
    case 'container': return [
      { x: 0, h: 0, f: 'ready' }, { x: 30, h: 0, f: 'kong0', arc: 10 }, { x: pre + 10, h: TOP.container, f: 'kong1' },
      { x: pre + w - 25, h: TOP.container + 4, f: 'hop', arc: 30 }, { x: pre + w + 35, h: 0, f: 'land' },
      { x: end - 15, h: 0, f: 'run' }, { x: end, h: 0, f: 'run' },
    ];
    // tic-tac: rebota de la pared derecha a la izquierda y otra vez a la derecha, pasa el portón
    case 'alley': {
      const right = pre + 90, left = pre + 66;
      return [
        { x: 0, h: 0, f: 'ready' }, { x: 25, h: 0, f: 'hop' }, { x: 70, wx: right, h: 25, f: 'kick' },
        { x: 95, wx: left, h: 60, f: 'kick', flip: true }, { x: 120, wx: right, h: 95, f: 'kick' },
        { x: 145, wx: left + 8, h: TOP.gate + 5, f: 'tuck' }, { x: 175, wx: pre + w - 30, h: TOP.gate + 15, f: 'hop' },
        { x: pre + w + 20, h: 0, f: 'land' }, { x: end - 15, h: 0, f: 'run' }, { x: end, h: 0, f: 'run' },
      ];
    }
    // barda alta: se cuelga del borde (1), sube y se agacha arriba (2), baja y rueda (3)
    case 'highwall': {
      const hang = TOP.highwall - meta('hang').handTop * SCALE;
      return [
        { x: 0, h: 0, f: 'ready' }, { x: 10, h: 0, f: 'hop', arc: 20 }, { x: h1, wx: pre - 10, h: hang, f: 'hang' },
        { x: h1 + 20, wx: pre, h: TOP.highwall - 20, f: 'climb' }, { x: h1 + 40, wx: pre + 30, h: TOP.highwall, f: 'crouch' },
        { x: h2, h: TOP.highwall, f: 'crouch' }, { x: h2 + 2, h: TOP.highwall, f: 'hop', arc: 25 },
        { x: pre + w + 16, h: 0, f: 'land' }, { x: pre + w + 30, h: 0, f: 'tuck', spin: 360, pivot: true },
        { x: pre + w + 84, h: 0, f: 'run' }, { x: end, h: 0, f: 'run' },
      ];
    }
    // barandal: salto de precisión (1), cruza en equilibrio (2), baja (3)
    case 'rail': return [
      { x: 0, h: 0, f: 'ready' }, { x: 20, h: 0, f: 'hop', arc: 30 }, { x: h1, h: TOP.rail, f: 'land' },
      { x: h1 + 3, h: TOP.rail, f: 'balance' }, { x: h2, h: TOP.rail, f: 'balance' },
      { x: h2 + 3, h: TOP.rail, f: 'hop', arc: 40 }, { x: pre + w + 44, h: 0, f: 'land' },
      { x: end - 10, h: 0, f: 'run' }, { x: end, h: 0, f: 'run' },
    ];
    // microbús: sube al cofre (1), corre por el techo (2), mortal al frente (3)
    case 'bus': return [
      { x: 0, h: 0, f: 'ready' }, { x: 30, h: 0, f: 'hop', arc: 20 }, { x: h1, h: TOP.hood, f: 'crouch' },
      { x: h1 + 3, h: TOP.hood, f: 'hop', arc: 25 }, { x: pre + 80, h: TOP.roof, f: 'land' },
      { x: pre + 92, h: TOP.roof, f: 'run' }, { x: h2, h: TOP.roof, f: 'ready' },
      { x: h2 + 3, h: TOP.roof, f: 'tuck', spin: 360, arc: 70, pivot: true }, { x: pre + w + 80, h: 0, f: 'land' },
      { x: end - 14, h: 0, f: 'run' }, { x: end, h: 0, f: 'run' },
    ];
    // tianguis: de toldo en toldo (1, 2, 3) y cae con doble giro (4)
    case 'stalls': {
      const [t1, t2, t3] = TOP.stalls;
      return [
        { x: 0, h: 0, f: 'ready' }, { x: 40, h: 0, f: 'hop', arc: 30 }, { x: h1, h: t1, f: 'land' },
        { x: h1 + 3, h: t1, f: 'hop', arc: 70 }, { x: h2, h: t2, f: 'land' },
        { x: h2 + 3, h: t2, f: 'hop', arc: 60 }, { x: h3, h: t3, f: 'land' },
        { x: h3 + 3, h: t3, f: 'tuck', spin: 720, arc: 90, pivot: true }, { x: pre + w + 70, h: 0, f: 'land' },
        { x: end - 25, h: 0, f: 'run' }, { x: end, h: 0, f: 'run' },
      ];
    }
    default: return null;
  }
}

const cache = new Map();
function keysCached(type, sheet) {
  const id = `${type}|${sheet}`;
  if (!cache.has(id)) cache.set(id, keysFor(type, sheet));
  return cache.get(id);
}

// Pose en el punto xs del recorrido (px desde o.start). Devuelve lo mismo que obstaclePose de
// RunScene (frame/run, dy, angle) más dx (desfase horizontal), flip y pivot (girar sobre el centro).
export function longPose(type, xs, sheet) {
  const keys = keysCached(type, sheet);
  if (!keys) return null;
  let i = keys.length - 1;
  // con margen: en una parada, el redondeo puede dejarla una fracción de px después del punto clave
  while (i > 0 && keys[i].x > xs + 0.5) i--;
  const k0 = keys[i], k1 = keys[Math.min(i + 1, keys.length - 1)];
  const q = k1 === k0 ? 0 : Math.min(1, Math.max(0, (xs - k0.x) / (k1.x - k0.x)));
  const h = k0.h + (k1.h - k0.h) * q + (k0.arc || 0) * Math.sin(Math.PI * q);
  const wx0 = k0.wx ?? k0.x, wx1 = k1.wx ?? k1.x;
  const pose = { dy: -h, dx: wx0 + (wx1 - wx0) * q - xs, angle: (k0.spin || 0) * q, flip: !!k0.flip };
  if (k0.f === 'run') pose.run = true;
  else if (k0.f === 'balance') pose.frame = `balance${Math.floor(xs / 22) % 2}`;
  else pose.frame = k0.f;
  if (k0.pivot) pose.pivot = (STAGE_OF[sheet] && frameMeta(STAGE_OF[sheet], 'tuck')?.mid) || 12;
  return pose;
}
