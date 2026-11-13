// Capítulos: 10 niveles cada uno (jefes en el 7 y el 10) más un nivel secreto.
// Cada nivel dice qué teclas se enseñan, si es de práctica («solo d k») y el largo máximo de los
// obstáculos; el texto de los obstáculos lo genera levelgen.js.
//
// Dificultad: los ritmos (ppm) y tiempos de reacción salen del avance global (30 niveles en total).
// ppm.pass: ritmo para no quedarse sin tiempo (null = no se puede perder por tiempo).
// ppm.fast: ritmo para la estrella de velocidad. Los primeros niveles piden menos (ver rules.js).
//
// Jefes: además del límite de tiempo, tienen un máximo de traspiés (teclas equivocadas) y de caídas.
// crew: quién corre con Sofía. follow = la acompaña (lead > 0 adelante, < 0 atrás; clumsy = se cae
// a veces), chase = la persigue, rival = compite (factor del tiempo límite), pace = va adelante y
// hay que alcanzarlo, leaveAt = se va corriendo al llegar a esa fracción del recorrido.

import { buildObstacles } from './levelgen.js';
import { rng } from './rng.js';
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

const TOTAL = SPECS.length * 10 - 1;
const round = (n, d = 0) => Math.round(n * 10 ** d) / 10 ** d;

// Curva de dificultad: sube despacio al principio y cada vez más rápido (no en línea recta).
// 0 en el primer nivel del juego, 1 en el último.
export const DIFFICULTY_CURVE = 1.6;
const curve = g => (Math.max(0, g) / TOTAL) ** DIFFICULTY_CURVE;

// Ritmos y reacción según el avance global g (0 = primer nivel del juego).
// Los niveles con teclas recién aprendidas piden un 15 % menos: todavía se buscan con la vista.
// windowPpm y react: tiempo de la barra de cada obstáculo (reacción + caracteres a ese ritmo).
function tuning(g, { canLose, boss, newKeys }) {
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
  const levels = spec.levels.map((l, i) => {
    const warmup = l.keys ? null : warmupFor(groups, `c${ci + 1}-${i + 1}`);
    if (l.keys) letters.push(...l.keys);
    if (l.keys && l.keys.trim()) groups.push(Array.from(l.keys));
    const g = ci * 10 + i;
    const canLose = !(ci === 0 && i < 3);
    const t = tuning(g, { canLose, boss: l.boss, newKeys: !!l.keys });
    const prev = spec.levels.slice(0, i).reverse().find(p => p.keys)?.keys || '';
    return {
      id: `c${ci + 1}-${i + 1}`, label: String(i + 1), chapterIndex: ci,
      kind: l.boss ? 'boss' : 'normal', theme: l.theme, boss: l.boss || null, crew: l.crew || [],
      hero: 'sofia', newKeys: l.keys ? Array.from(l.keys) : [], getupMs: l.getupMs,
      requiresStars: i === 6 ? 10 : i === 9 ? 20 : undefined,
      maxLen: l.maxLen, letters: [...letters], only: l.only || null, warmup,
      ppm: t.ppm, windowPpm: t.windowPpm, react: t.react, step: t.step,
      // Desde que se aprende el espacio, los niveles de práctica también lo usan.
      obstacles: buildObstacles({
        letters, only: l.only && letters.includes(' ') ? `${l.only} ` : l.only, maxLen: l.maxLen, count: t.count, seed: `c${ci + 1}-${i + 1}`,
        focus: l.only ? '' : l.keys || prev,
      }),
    };
  });
  const s = spec.secret;
  const g = ci * 10 + s.after - 0.5;
  const t = tuning(g + 1, { canLose: true, newKeys: !!s.keys });
  const secretLetters = [...letters, ...(s.keys ? Array.from(s.keys) : [])];
  const secret = {
    id: `c${ci + 1}-s`, label: '★', chapterIndex: ci, kind: 'secret', theme: s.theme, boss: null, crew: [],
    hero: s.hero || 'sofia', newKeys: s.keys ? Array.from(s.keys) : [], requiresStars: 30, allowCaps: true,
    after: s.after, maxLen: s.maxLen, letters: secretLetters, only: null,
    warmup: s.keys ? null : warmupFor(groups, `c${ci + 1}-s`),
    ppm: t.ppm, windowPpm: t.windowPpm, react: t.react, step: curve(g),
    obstacles: buildObstacles({ letters: secretLetters, maxLen: s.maxLen, count: t.count, seed: `c${ci + 1}-s`, caps: true, focus: s.keys || '' }),
  };
  return { id: spec.id, title: spec.title, subtitle: spec.subtitle, age: spec.age, map: spec.map, index: ci, story: spec.story, levels, secret };
}
buildChapter.letters = [];
buildChapter.groups = []; // pares de teclas en el orden en que se aprenden

export const PLAYABLE = SPECS.map(buildChapter);
export const [CHAPTER1, CHAPTER2, CHAPTER3] = PLAYABLE;

// Menú de capítulos: los que aún no existen aparecen en construcción.
export const CHAPTERS = [
  ...PLAYABLE.map(c => ({ id: c.id, title: c.title, subtitle: c.subtitle, age: c.age, data: c })),
  ...[4, 5, 6, 7, 8, 9, 10].map(n => ({ id: `cap${n}`, title: `Capítulo ${n}`, subtitle: null, data: null })),
];

export function levelName(level) {
  if (level.kind === 'secret') return 'Nivel secreto';
  return `Nivel ${level.label}`;
}

export function allLevels(chapter) {
  return [...chapter.levels, chapter.secret];
}
