// Lógica de la carrera sin Phaser: posiciones en px del mundo y tiempos en ms.
//
// Cada obstáculo tiene un temporizador que arranca cuando Sofía termina de superar el anterior.
// Solo se puede escribir ese obstáculo: el siguiente se desbloquea al superarlo.
// El hueco hasta él mide BASE_SPEED × ventana, así que corriendo a velocidad base llega justo
// cuando se acaba el tiempo. Si no terminaste de escribirlo, tropieza, se levanta y lo vuelves
// a escribir con el temporizador reiniciado. Si lo escribes rápido, Sofía acelera hacia él.

export const BASE_SPEED = 150;
export const MAX_SPRINT = 4.5;
const SPRINT_S = 0.45;
const STUMBLE_MS = 350;
const FINISH_GAP = 360;
const FINISH_SPEED = 2.2;

// w: ancho del obstáculo; pre/post: distancia del movimiento antes y después de él.
// Obstáculos por etapas (stages): Sofía avanza por ellos mientras se escribe. Al terminar cada
// tramo del texto llega a la siguiente parada (holds: fracción del recorrido, de start a end);
// con un traspié se queda donde iba, y si se acaba el tiempo se cae y vuelve al principio.
export const OBSTACLE_TYPES = {
  flat: { w: 30, pre: 12, post: 12 },
  puddle: { w: 84, pre: 45, post: 30 },
  fence: { w: 90, pre: 60, post: 24 },
  chair: { w: 48, pre: 80, post: 70 },
  table: { w: 138, pre: 50, post: 40 },  // 9-10: se desliza sobre una mesa larga
  wall: { w: 150, pre: 50, post: 60 },   // 11-12: corre a lo largo de la pared (el piso tiene cemento fresco)
  hole: { w: 150, pre: 80, post: 50 },   // 13-14: brinca un hoyo enorme
  container: { w: 138, pre: 90, post: 70 }, // 15-17: salto de gato sobre un contenedor alto
  alley: { w: 156, pre: 60, post: 70 },     // 18-20: tic-tac entre las paredes de un callejón
  highwall: { w: 156, pre: 50, post: 110, stages: 3, holds: [0.13, 0.36] },          // 21-24: barda alta
  rail: { w: 306, pre: 70, post: 70, stages: 3, holds: [0.2, 0.74] },                // 25-28: barandal largo
  bus: { w: 366, pre: 50, post: 120, stages: 3, holds: [0.17, 0.72] },               // 29-33: microbús
  stalls: { w: 456, pre: 50, post: 120, stages: 4, holds: [0.2, 0.44, 0.67] },       // 34-40: tianguis
};

export function obstacleType(len) {
  if (len <= 2) return 'flat';
  if (len <= 4) return 'puddle';
  if (len <= 6) return 'fence';
  if (len <= 8) return 'chair';
  if (len <= 10) return 'table';
  if (len <= 12) return 'wall';
  if (len <= 14) return 'hole';
  if (len <= 17) return 'container';
  if (len <= 20) return 'alley';
  if (len <= 24) return 'highwall';
  if (len <= 28) return 'rail';
  if (len <= 33) return 'bus';
  return 'stalls';
}

// Dónde termina cada tramo de un obstáculo por etapas (índices de carácter, sin contar el último,
// que es el final del texto). Se cortan en partes casi iguales, de preferencia después de un espacio.
export function stageMarks(chars, stages) {
  const marks = [];
  for (let k = 1; k < stages; k++) {
    let m = Math.round((k * chars.length) / stages);
    for (let d = 0; d <= 3; d++) {
      if (chars[m + d - 1] === ' ') { m += d; break; }
      if (chars[m - d - 1] === ' ') { m -= d; break; }
    }
    marks.push(Math.max(marks.at(-1) + 1 || 1, Math.min(chars.length - 1, m)));
  }
  return marks;
}

// Hasta dónde puede avanzar Sofía en un obstáculo que aún no termina de escribir.
export function holdX(o) {
  if (!o.marks) return o.start;
  const k = o.marks.filter(m => o.typed >= m).length;
  return k ? o.start + (o.end - o.start) * o.holds[k - 1] : o.start;
}

export const cps = ppm => ppm * 5 / 60;

export function windowMs(level, text) {
  return Math.round((level.react + Array.from(text).length / cps(level.windowPpm)) * 1000);
}

export function buildCourse(level) {
  let prevEnd = 0;
  const obstacles = level.obstacles.map(text => {
    const chars = Array.from(text);
    const type = obstacleType(chars.length);
    const t = OBSTACLE_TYPES[type];
    const win = windowMs(level, text);
    const start = prevEnd + BASE_SPEED * win / 1000;
    const o = {
      text, chars, type, start,
      x: start + t.pre, w: t.w, end: start + t.pre + t.w + t.post,
      windowMs: win, typed: 0, done: false, passed: false, timerStart: null,
    };
    if (t.stages) Object.assign(o, { marks: stageMarks(chars, t.stages), holds: t.holds });
    prevEnd = o.end;
    return o;
  });
  return { obstacles, finishX: prevEnd + FINISH_GAP };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export class Runner {
  // maxFalls / maxErrors: cuántas caídas o traspiés se permiten (null = sin límite); uno más y pierdes.
  constructor(level, { getupMs = 1200, limitMs = null, maxFalls = null, maxErrors = null } = {}) {
    const { obstacles, finishX } = buildCourse(level);
    this.level = level;
    this.obstacles = obstacles;
    this.finishX = finishX;
    this.getupMs = getupMs;
    this.limitMs = limitMs;
    this.maxFalls = maxFalls;
    this.maxErrors = maxErrors;
    this.x = 0;
    this.v = 0;
    this.clock = 0;
    this.phase = 'run'; // run | fallen | done | failed
    this.target = 0;    // obstáculo que se está escribiendo
    this.timed = 0;     // primer obstáculo aún no superado (el que tiene temporizador)
    this.falls = 0;
    this.typingMs = 0;  // tiempo en que se podía escribir (sin contar caídas ni carreras entre obstáculos)
    this.correct = 0;
    this.errors = 0;
    this.errByChar = {};
    this.stumbleUntil = -1;
    this.fallUntil = 0;
    this.trippedAt = 0;
    this.holding = false;
    this.failReason = null;
    this.events = [];
    if (obstacles.length) obstacles[0].timerStart = 0;
  }

  get timedObstacle() {
    return this.obstacles[this.timed] || null;
  }

  get targetObstacle() {
    return this.obstacles[this.target] || null;
  }

  // Solo se escribe el obstáculo que tiene el temporizador: si ya lo escribiste, a correr.
  get mustRun() {
    return this.phase === 'run' && this.target !== this.timed && !!this.targetObstacle;
  }

  get canType() {
    return this.phase === 'run' && this.target === this.timed;
  }

  timeLeftMs(o) {
    if (!o || o.done || o.timerStart == null) return null;
    return Math.max(0, o.windowMs - (this.clock - o.timerStart));
  }

  drainEvents() {
    const e = this.events;
    this.events = [];
    return e;
  }

  update(dt) {
    if (this.phase === 'done' || this.phase === 'failed') return;
    this.clock += dt;
    if (this.canType && this.targetObstacle) this.typingMs += dt;
    if (this.limitMs != null && this.clock > this.limitMs) {
      this.fail('time');
      return;
    }
    const o = this.timedObstacle;
    if (this.phase === 'fallen') {
      this.v = 0;
      if (this.clock < this.fallUntil) return;
      this.phase = 'run';
      if (o) o.timerStart = this.clock;
      this.events.push({ type: 'getup' });
    }
    if (o && !o.done && o.timerStart != null && this.clock - o.timerStart >= o.windowMs) {
      this.trip(o);
      return;
    }

    const s = dt / 1000;
    let desired = BASE_SPEED;
    const hold = o && !o.done ? holdX(o) : null;
    if (!o) desired = BASE_SPEED * FINISH_SPEED;
    else if (o.done) desired = clamp((o.end - this.x) / SPRINT_S, BASE_SPEED, BASE_SPEED * MAX_SPRINT);
    else if (hold > o.start) desired = clamp((hold - this.x) / SPRINT_S, BASE_SPEED, BASE_SPEED * MAX_SPRINT);
    if (this.clock < this.stumbleUntil) desired *= 0.25;
    this.v += (desired - this.v) * Math.min(1, s * 8);

    let nx = this.x + this.v * s;
    this.holding = false;
    if (o && !o.done && nx >= hold) {
      nx = Math.max(this.x, hold);
      this.holding = hold === o.start;
      this.v = 0;
    }
    this.x = nx;

    while (this.timedObstacle && this.timedObstacle.done && this.x >= this.timedObstacle.end) {
      const passed = this.timedObstacle;
      passed.passed = true;
      this.timed++;
      this.events.push({ type: 'passed', obstacle: passed });
      if (this.timedObstacle) this.timedObstacle.timerStart = this.clock;
    }
    if (!this.timedObstacle && this.x >= this.finishX) {
      this.phase = 'done';
      this.events.push({ type: 'finish' });
    }
  }

  type(ch) {
    if (!this.canType) return { ignored: true };
    const o = this.targetObstacle;
    if (!o) return { ignored: true };
    const expected = o.chars[o.typed];
    if (ch === expected) {
      o.typed++;
      this.correct++;
      if (o.typed === o.chars.length) {
        o.done = true;
        this.target++;
      }
      this.events.push({ type: 'char' });
      return { ok: true };
    }
    this.errors++;
    this.errByChar[expected] = (this.errByChar[expected] || 0) + 1;
    this.stumbleUntil = this.clock + STUMBLE_MS;
    this.events.push({ type: 'stumble', expected, got: ch });
    if (this.maxErrors != null && this.errors > this.maxErrors) this.fail('errors');
    return { ok: false, expected };
  }

  trip(o) {
    this.falls++;
    o.typed = 0;
    // en un obstáculo por etapas se cae y vuelve al principio
    if (this.x > o.start) this.x = o.start;
    this.phase = 'fallen';
    this.fallUntil = this.clock + this.getupMs;
    this.trippedAt = this.clock;
    this.v = 0;
    this.events.push({ type: 'trip', obstacle: o });
    if (this.maxFalls != null && this.falls > this.maxFalls) this.fail('falls');
  }

  fail(reason) {
    this.phase = 'failed';
    this.failReason = reason;
    this.events.push({ type: 'fail', reason });
  }

  result() {
    const total = this.correct + this.errors;
    // PPM solo sobre el tiempo en que se podía escribir: no cuentan las caídas, ni correr hacia
    // el siguiente obstáculo después de terminar uno, ni el tramo final a la meta.
    const minutes = this.typingMs / 60000;
    return {
      timeMs: Math.round(this.clock),
      typingMs: Math.round(this.typingMs),
      wpm: minutes > 0 ? this.correct / 5 / minutes : 0,
      accuracy: total ? this.correct / total : 1,
      falls: this.falls,
      errors: this.errors,
      errByChar: { ...this.errByChar },
      passed: this.phase === 'done',
      failReason: this.failReason,
    };
  }
}

// Persona que escribe a ritmo constante, sin errores, para convertir PPM en tiempos objetivo.
// Como una persona real, cuando aparece un obstáculo nuevo tarda en verlo y empezar a escribir.
export const HUMAN_REACT_MS = 750;

export function simulate(level, ppm, { getupMs } = {}) {
  const r = new Runner(level, { getupMs });
  const interval = 1000 / cps(ppm);
  let current = null;
  let nextKeyAt = 0;
  const DT = 10;
  for (let i = 0; i < 100000 && r.phase !== 'done'; i++) {
    r.update(DT);
    const o = r.targetObstacle;
    if (!o || !r.canType) continue;
    if (o !== current) {
      // obstáculo nuevo (o se acaba de levantar): primero lo lee
      current = o;
      nextKeyAt = r.clock + HUMAN_REACT_MS;
    }
    if (r.clock >= nextKeyAt) {
      r.type(o.chars[o.typed]);
      nextKeyAt = r.clock + interval;
    }
  }
  return { timeMs: r.clock, falls: r.falls };
}
