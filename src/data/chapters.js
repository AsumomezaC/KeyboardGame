// Capítulos: 10 niveles cada uno (jefes en el 7 y el 10) más un nivel secreto.
// Cada nivel dice qué teclas se enseñan, si es de práctica («solo d k») y el largo máximo de los
// obstáculos; el texto de los obstáculos lo genera levelgen.js.
//
// Dificultad: los ritmos (ppm) y tiempos de reacción salen del avance global (la curva de los
// capítulos 1-3 está fija; los capítulos en construcción siguen subiendo a partir de ahí).
// ppm.pass: ritmo para no quedarse sin tiempo (null = no se puede perder por tiempo).
// ppm.fast: ritmo para la estrella de velocidad. Los primeros niveles piden menos (ver rules.js).
//
// Jefes: además del límite de tiempo, tienen un máximo de traspiés (teclas equivocadas) y de caídas.
// crew: quién corre con Sofía. follow = la acompaña (lead > 0 adelante, < 0 atrás; clumsy = se cae
// a veces), chase = la persigue, rival = compite (factor del tiempo límite), pace = va adelante y
// hay que alcanzarlo, leaveAt = se va corriendo al llegar a esa fracción del recorrido.

import { buildObstacles } from './levelgen.js';
import { buildRichObstacles } from './frases.js';
import { rng } from './rng.js';
import { Numpad, needsNumpad } from '../core/numpad.js';
import { STORY1 } from './story1.js';
import { STORY2 } from './story2.js';
import { STORY3 } from './story3.js';

const DANI = { id: 'dani', mode: 'follow', lead: -85, clumsy: true };

const SPECS = [
  {
    id: 'cap1', title: 'Capítulo 1', subtitle: 'Me llamo Sofía', age: 8, story: STORY1, map: 'barrio',
    levels: [
      { keys: 'fj', only: 'fj', maxLen: 2, theme: 'barrio' },
      { keys: 'dk', only: 'dk', maxLen: 3, theme: 'barrio' },
      { only: 'dfjk', maxLen: 2, theme: 'barrio' },
      { only: 'dfjk', maxLen: 4, theme: 'barrio', crew: [DANI] },
      { keys: 'sl', only: 'sl', maxLen: 3, theme: 'barrio' },
      { maxLen: 3, theme: 'barrio' },
      { maxLen: 5, theme: 'carrera', boss: { type: 'race', maxErrors: 14, maxFalls: 5 },
        crew: [{ id: 'rivalA', mode: 'rival', factor: 1 }, { id: 'rivalB', mode: 'rival', factor: 1.07 }, { id: 'rivalC', mode: 'rival', factor: 1.16 }] },
      { keys: 'añ', only: 'añ', maxLen: 2, theme: 'barrio' },
      { maxLen: 4, theme: 'noche' },
      { maxLen: 6, theme: 'parque', boss: { type: 'chase', maxErrors: 12, maxFalls: 4 },
        crew: [{ ...DANI, lead: -75 }, { id: 'tata', mode: 'chase', gap: 175 }, { id: 'leticia', mode: 'chase', gap: 215 }] },
    ],
    // Entre el 6 y el 7: entrena para la carrera de la escuela.
    secret: { after: 6, keys: ' ', maxLen: 6, theme: 'barrio' },
  },
  {
    id: 'cap2', title: 'Capítulo 2', subtitle: 'Los gatos', age: 10, story: STORY2, map: 'prohibida',
    levels: [
      { keys: ' ', maxLen: 6, theme: 'prohibida' },
      { maxLen: 8, theme: 'parque', crew: [DANI] },
      { keys: 'gh', only: 'gh', maxLen: 4, theme: 'prohibida', crew: [{ id: 'kevin', mode: 'follow', lead: 130 }] },
      { maxLen: 4, theme: 'prohibida', crew: [{ id: 'kevin', mode: 'follow', lead: 150 }, { id: 'yesi', mode: 'follow', lead: 90 }] },
      { maxLen: 8, theme: 'barrio' },
      { keys: 'ru', only: 'ru', maxLen: 5, theme: 'noche', crew: [{ id: 'kevin', mode: 'follow', lead: 120 }] },
      { maxLen: 9, theme: 'prohibida', boss: { type: 'chase', maxErrors: 10, maxFalls: 4 },
        crew: [
          { id: 'kevin', mode: 'follow', lead: 170, leaveAt: 0.2 }, { id: 'yesi', mode: 'follow', lead: 120, leaveAt: 0.2 },
          { id: 'chuy', mode: 'follow', lead: 80, leaveAt: 0.22 }, { id: 'perro', mode: 'chase', gap: 200 },
        ] },
      { keys: 'ie', only: 'ie', maxLen: 5, theme: 'barrio' },
      { maxLen: 9, theme: 'prohibida' },
      { maxLen: 10, theme: 'noche', boss: { type: 'chase', maxErrors: 9, maxFalls: 3 }, crew: [{ id: 'kevin', mode: 'chase', gap: 195 }] },
    ],
    // Entre el 4 y el 5: Dani espera a Sofía en el parque y corre solo.
    secret: { after: 4, maxLen: 10, theme: 'parque', hero: 'dani' },
  },
  {
    id: 'cap3', title: 'Capítulo 3', subtitle: 'El día de mi suerte', age: 12, story: STORY3, map: 'barrio',
    levels: [
      { keys: 'ow', only: 'ow', maxLen: 6, theme: 'barrio' },
      { maxLen: 5, theme: 'barrio' },
      { maxLen: 8, theme: 'barrio' },
      { keys: 'pq', only: 'pq', maxLen: 10, theme: 'prohibida' },
      { maxLen: 5, theme: 'noche' },
      { maxLen: 8, theme: 'barrio' },
      { maxLen: 12, theme: 'parque', boss: { type: 'catch', maxErrors: 8, maxFalls: 3 }, crew: [{ id: 'dani', mode: 'pace', factor: 1 }] },
      { keys: 'ty', only: 'ty', maxLen: 12, theme: 'barrio' },
      { maxLen: 6, theme: 'parque', crew: [DANI] },
      { maxLen: 13, theme: 'carrera', getupMs: 1600, boss: { type: 'race', maxErrors: 6, maxFalls: 2 },
        crew: [{ id: 'kevin', mode: 'rival', factor: 1 }, { id: 'rivalA', mode: 'rival', factor: 1.06 }, { id: 'rivalB', mode: 'rival', factor: 1.14 }] },
    ],
    // Entre el 8 y el 9: su mamá la sacó de la casa y roba un pan en el mercado.
    secret: { after: 8, maxLen: 13, theme: 'mercado' },
  },
];

// ---- Capítulos 4 a 10: en construcción, solo con el modo desarrollador ----
// Niveles base para probar teclas, obstáculos y los modelos de Sofía de cada etapa: fondo neutro,
// sin historia (ni cinemáticas ni detalles en el fondo), solo la lección o el calentamiento y la
// carrera. Los jefes son contrarreloj (trial) mientras se decide quién corre en ellos; sus traspiés
// permitidos son una fracción de los caracteres del nivel (errorRate).
const TRIAL = (errorRate, maxFalls) => ({ type: 'trial', errorRate, maxFalls });
const N = 'neutro';
const lv = (maxLen, extra = {}) => ({ maxLen, theme: N, ...extra });

const DEV_SPECS = [
  {
    id: 'cap4', stage: 'teen', levels: [
      lv(6, { keys: 'vm', only: 'vm' }), lv(10), lv(14), lv(8, { keys: 'bn', only: 'bn' }), lv(15), lv(12),
      lv(16, { boss: TRIAL(0.045, 3) }), lv(8, { keys: 'c,' }), lv(13), lv(17, { boss: TRIAL(0.04, 3) }),
    ],
    secret: { after: 5, maxLen: 17, theme: N },
  },
  {
    id: 'cap5', stage: 'teen', levels: [
      lv(8, { keys: 'x.' }), lv(14), lv(17), lv(8, { keys: 'z-' }), lv(18), lv(15),
      lv(19, { boss: TRIAL(0.04, 3) }), lv(12, { keys: 'FJ', capsLesson: true }), lv(16), lv(20, { boss: TRIAL(0.038, 3) }),
    ],
    secret: { after: 7, maxLen: 20, theme: N },
  },
  {
    id: 'cap6', stage: 'teen', levels: [
      lv(10, { keys: 'áéíóú' }), lv(16), lv(20), lv(14, { keys: '¿?' }), lv(21), lv(18),
      lv(22, { boss: TRIAL(0.038, 3) }), lv(16, { keys: '¡!' }), lv(20), lv(24, { boss: TRIAL(0.035, 2) }),
    ],
    secret: { after: 3, maxLen: 24, theme: N },
  },
  {
    id: 'cap7', stage: 'joven', levels: [
      lv(8, { keys: '47', only: '47' }), lv(18), lv(24), lv(10, { keys: '38', only: '38' }), lv(25), lv(20),
      lv(26, { boss: TRIAL(0.035, 3) }), lv(10, { keys: '56', only: '56' }), lv(22), lv(28, { boss: TRIAL(0.033, 2) }),
    ],
    secret: { after: 6, maxLen: 28, theme: N },
  },
  {
    id: 'cap8', stage: 'joven', levels: [
      lv(10, { keys: '29', only: '29' }), lv(24), lv(10, { keys: '10', only: '10' }), lv(29), lv(22),
      lv(14, { keys: '"#$%&/()=' }), lv(30, { boss: TRIAL(0.033, 3) }), lv(26), lv(31), lv(33, { boss: TRIAL(0.03, 2) }),
    ],
    secret: { after: 5, maxLen: 33, theme: N },
  },
  {
    id: 'cap9', stage: 'adulta', levels: [
      lv(12, { keys: ';:_' }), lv(28), lv(14, { keys: "'+*{}[]" }), lv(34), lv(30), lv(16, { keys: 'ü' }),
      lv(36, { boss: TRIAL(0.03, 2) }), lv(32), lv(38), lv(40, { boss: TRIAL(0.028, 2) }),
    ],
    secret: { after: 8, maxLen: 40, theme: N },
  },
  {
    id: 'cap10', stage: 'adulta', levels: [
      lv(14, { keys: '@\\~^`¬' }), lv(30), lv(14, { keys: '|°' }), lv(36), lv(14, { keys: '<>' }), lv(38),
      lv(40, { boss: TRIAL(0.028, 2) }), lv(34), lv(40), lv(40, { boss: TRIAL(0.025, 2) }),
    ],
    secret: { after: 4, maxLen: 40, theme: N },
  },
];

// Sofía de cada etapa (hojas de src/art/sofia.js) y cómo se llama la etapa en el menú.
export const STAGES = {
  teen: { hero: 'sofia-teen', name: 'Adolescencia' },
  joven: { hero: 'sofia-joven', name: 'Juventud' },
  adulta: { hero: 'sofia-adulta', name: 'Adultez' },
};

// Curva de los capítulos 1-3: fija, aunque se agreguen capítulos (así no se vuelven más fáciles).
const TOTAL = 3 * 10 - 1;
// Después del capítulo 3 la dificultad sigue subiendo hasta el último nivel del capítulo 10:
// de 28 PPM para no perder hasta LATE_PPM (provisional, se ajustará al probarlos).
const LATE_LAST = 10 * 10 - 1;
const LATE_PPM = 40;
const LATE_CURVE = 1.3;
const round = (n, d = 0) => Math.round(n * 10 ** d) / 10 ** d;

// Curva de dificultad: sube despacio al principio y cada vez más rápido (no en línea recta).
// 0 en el primer nivel del juego, 1 en el último.
export const DIFFICULTY_CURVE = 1.6;
const curve = g => (Math.max(0, g) / TOTAL) ** DIFFICULTY_CURVE;

// Ritmos y reacción según el avance global g (0 = primer nivel del juego).
// Los niveles con teclas recién aprendidas piden un 15 % menos: todavía se buscan con la vista.
// windowPpm y react: tiempo de la barra de cada obstáculo (reacción + caracteres a ese ritmo).
function tuning(g, { canLose, boss, newKeys }) {
  if (g > TOTAL) return lateTuning(g, { boss, newKeys });
  const c = curve(g);
  const ease = newKeys ? 0.85 : 1;
  const pass = canLose ? round((10 + 18 * c) * ease, 1) : null;
  const fast = pass ? round(pass + 4 + 2 * c, 1) : 9 + g;
  return {
    ppm: { pass, fast },
    windowPpm: round((pass ?? fast) * 0.55, 1),
    react: round(1.9 - 0.95 * c, 2),
    count: 14 + Math.round(8 * c) + (boss ? 2 : 0),
    step: c,
  };
}

// Capítulos 4 a 10: ritmo completo y 97 % de precisión (step 1); sube el PPM, la reacción se acorta
// y hay un poco menos de obstáculos porque son más largos.
function lateTuning(g, { boss, newKeys }) {
  const k = Math.min(1, (g - TOTAL) / (LATE_LAST - TOTAL)) ** LATE_CURVE;
  const pass = round((28 + (LATE_PPM - 28) * k) * (newKeys ? 0.85 : 1), 1);
  return {
    ppm: { pass, fast: round(pass + 6, 1) },
    windowPpm: round(pass * 0.55, 1),
    react: round(0.95 - 0.15 * k, 2),
    count: Math.round(20 - 4 * k) + (boss ? 2 : 0),
    step: 1,
  };
}

// Calentamiento de los niveles sin teclas nuevas: WARMUP_STEPS grupos de 3 letras distintas
// (p. ej. «f d j»). Cada grupo trae al menos una del último par aprendido y el resto sale de dos
// pares anteriores, mezcladas al azar (siempre igual para el mismo nivel).
export const WARMUP_STEPS = 4;
export const WARMUP_SIZE = 3;
function warmupFor(groups, seed) {
  if (!groups.length) return null;
  const r = rng(seed);
  const pick = list => list[Math.floor(r() * list.length)];
  const last = groups[groups.length - 1];
  const older = groups.slice(0, -1);
  const extra = [];
  for (let i = 0; i < 2 && older.length; i++) extra.push(...older.splice(Math.floor(r() * older.length), 1)[0]);
  const pool = [...new Set([...last, ...extra])];
  const steps = [];
  while (steps.length < WARMUP_STEPS) {
    const step = [pick(last)];
    const rest = pool.filter(k => !step.includes(k));
    while (step.length < WARMUP_SIZE && rest.length) step.push(...rest.splice(Math.floor(r() * rest.length), 1));
    // si aún hay pocas teclas aprendidas se repite alguna, pero nunca dos iguales seguidas
    while (step.length < WARMUP_SIZE) step.push(pool.find(k => k !== step.at(-1)) ?? step[0]);
    // el orden también se mezcla, y no se repite el grupo anterior tal cual
    step.sort(() => r() - 0.5);
    if (steps.length && steps.at(-1).join('') === step.join('') && pool.length > WARMUP_SIZE) continue;
    steps.push(step);
  }
  return steps;
}

function buildChapter(spec, ci) {
  const { letters, groups } = buildChapter;
  const dev = !!spec.dev;
  const gen = dev ? buildRichObstacles : buildObstacles;
  const hero = spec.hero || 'sofia';
  const levels = spec.levels.map((l, i) => {
    if (l.capsLesson) buildChapter.caps = true;
    const caps = buildChapter.caps;
    const warmup = l.keys ? null : warmupFor(groups, `c${ci + 1}-${i + 1}`);
    if (l.keys) letters.push(...l.keys);
    if (l.keys && l.keys.trim()) groups.push(Array.from(l.keys));
    const g = ci * 10 + i;
    const canLose = !(ci === 0 && i < 3);
    const t = tuning(g, { canLose, boss: l.boss, newKeys: !!l.keys });
    const prev = spec.levels.slice(0, i).reverse().find(p => p.keys)?.keys || '';
    // Desde que se aprende el espacio, los niveles de práctica también lo usan.
    const make = (lt, focus) => gen({
      letters: lt, only: l.only && lt.includes(' ') ? `${l.only} ` : l.only, maxLen: l.maxLen, count: t.count, seed: `c${ci + 1}-${i + 1}`,
      focus: l.only ? '' : focus, ...(dev && caps ? { caps: true } : {}),
    });
    const obstacles = make(letters, l.keys || prev);
    return numpadAware({
      id: `c${ci + 1}-${i + 1}`, label: String(i + 1), chapterIndex: ci,
      kind: l.boss ? 'boss' : 'normal', theme: l.theme, boss: bossRules(l.boss, obstacles), crew: l.crew || [],
      hero, newKeys: l.keys ? Array.from(l.keys) : [], getupMs: l.getupMs,
      requiresStars: i === 6 ? 10 : i === 9 ? 20 : undefined,
      maxLen: l.maxLen, letters: [...letters], only: l.only || null, warmup,
      ppm: t.ppm, windowPpm: t.windowPpm, react: t.react, step: t.step,
      ...(dev && caps ? { allowCaps: true } : {}),
      obstacles,
    }, {
      // sin teclado numérico: lo mismo, sin las teclas de código Alt (y calentamiento si ya no hay nuevas)
      obstacles: lt => make(lt, without(l.keys || prev)), boss: obs => bossRules(l.boss, obs),
      warmup: () => warmupFor(groups.filter(gr => !gr.some(needsNumpad)), `c${ci + 1}-${i + 1}`),
    });
  });
  const s = spec.secret;
  const g = ci * 10 + s.after - 0.5;
  const t = tuning(g + 1, { canLose: true, newKeys: !!s.keys });
  const secretLetters = [...letters, ...(s.keys ? Array.from(s.keys) : [])];
  const secret = numpadAware({
    id: `c${ci + 1}-s`, label: '★', chapterIndex: ci, kind: 'secret', theme: s.theme, boss: null, crew: [],
    hero: s.hero || hero, newKeys: s.keys ? Array.from(s.keys) : [], requiresStars: 30, allowCaps: true,
    after: s.after, maxLen: s.maxLen, letters: secretLetters, only: null,
    warmup: s.keys ? null : warmupFor(groups, `c${ci + 1}-s`),
    ppm: t.ppm, windowPpm: t.windowPpm, react: t.react, step: Math.min(1, curve(g)),
    obstacles: gen({ letters: secretLetters, maxLen: s.maxLen, count: t.count, seed: `c${ci + 1}-s`, caps: true, focus: s.keys || '' }),
  }, {
    obstacles: lt => gen({ letters: lt, maxLen: s.maxLen, count: t.count, seed: `c${ci + 1}-s`, caps: true, focus: without(s.keys || '') }),
    boss: () => null,
    warmup: () => warmupFor(groups.filter(gr => !gr.some(needsNumpad)), `c${ci + 1}-s`),
  });
  return {
    id: spec.id, title: spec.title, subtitle: spec.subtitle, age: spec.age, map: spec.map, index: ci, story: spec.story,
    levels, secret, dev, stage: spec.stage || null, hero,
  };
}
buildChapter.letters = [];
buildChapter.groups = []; // pares de teclas en el orden en que se aprenden
buildChapter.caps = false; // ya se enseñaron las mayúsculas con el Shift contrario

// Teclas de código Alt (< >): solo se escriben con teclado numérico. Si el nivel las tiene, guarda
// también su versión sin ellas, y obstacles, newKeys, warmup, boss y letters devuelven una u otra
// según la opción «Cuento con teclado numérico» (Numpad.has). numpadKeys: las que usa el nivel.
const without = keys => Array.from(keys).filter(ch => !needsNumpad(ch)).join('');

function numpadAware(level, alt) {
  const numpadKeys = [...new Set([...level.letters].filter(needsNumpad))]
    .filter(ch => level.newKeys.includes(ch) || level.obstacles.some(t => t.includes(ch)));
  if (!numpadKeys.length) return level;
  const full = { letters: level.letters, newKeys: level.newKeys, warmup: level.warmup, boss: level.boss, obstacles: level.obstacles };
  const letters = level.letters.filter(ch => !needsNumpad(ch));
  const newKeys = level.newKeys.filter(ch => !needsNumpad(ch));
  const obstacles = alt.obstacles(letters);
  const lite = {
    letters, newKeys, obstacles, boss: alt.boss(obstacles),
    warmup: newKeys.length ? null : full.warmup && !full.warmup.flat().some(needsNumpad) ? full.warmup : alt.warmup(),
  };
  for (const k of Object.keys(full)) {
    Object.defineProperty(level, k, { get: () => (Numpad.has ? full : lite)[k], enumerable: true, configurable: true });
  }
  level.numpadKeys = numpadKeys;
  return level;
}

// Jefes contrarreloj: los traspiés permitidos salen de cuántos caracteres tiene el nivel.
function bossRules(boss, obstacles) {
  if (!boss?.errorRate) return boss || null;
  const total = obstacles.reduce((n, t) => n + Array.from(t).length, 0);
  return { type: boss.type, maxFalls: boss.maxFalls, maxErrors: Math.max(4, Math.ceil(total * boss.errorRate)) };
}

export const PLAYABLE = SPECS.map(buildChapter);
export const [CHAPTER1, CHAPTER2, CHAPTER3] = PLAYABLE;

// Capítulos en construcción (solo con el modo desarrollador): siguen el orden de las teclas.
export const DEV_CHAPTERS = DEV_SPECS.map((spec, k) => {
  const n = PLAYABLE.length + k + 1;
  return buildChapter({
    ...spec, dev: true, title: `Capítulo ${n}`, subtitle: 'En construcción', map: N, story: null,
    hero: STAGES[spec.stage].hero,
  }, n - 1);
});

// Todos los capítulos en orden (los en construcción solo se abren con el modo desarrollador).
export const STORY_CHAPTERS = [...PLAYABLE, ...DEV_CHAPTERS];

// Menú de capítulos: los que aún no existen aparecen en construcción; con el modo desarrollador
// se puede entrar a sus niveles base (dev).
export const CHAPTERS = [
  ...PLAYABLE.map(c => ({ id: c.id, title: c.title, subtitle: c.subtitle, age: c.age, data: c })),
  ...DEV_CHAPTERS.map(c => ({ id: c.id, title: c.title, subtitle: null, data: null, dev: c })),
];

export function levelName(level) {
  if (level.kind === 'secret') return 'Nivel secreto';
  return `Nivel ${level.label}`;
}

export function allLevels(chapter) {
  return [...chapter.levels, chapter.secret];
}
