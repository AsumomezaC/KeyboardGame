// Capítulos en construcción (solo con el modo desarrollador), obstáculos por etapas y modelos de Sofía.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLAYABLE, DEV_CHAPTERS, STORY_CHAPTERS, CHAPTERS, STAGES, allLevels } from '../src/data/chapters.js';
import { chapterUnlocked, levelStatus, effectivePpm, levelRules } from '../src/game/rules.js';
import { Runner, simulate, stageMarks, holdX, OBSTACLE_TYPES, obstacleType } from '../src/game/runner.js';
import { RIG_W, RIG_H, STAGE_BUILDS, stagePoses, solvePose, poseBounds } from '../src/art/rig.js';
import { longPose, LONG_TYPES } from '../src/scenes/choreo.js';
import { Dev } from '../src/core/dev.js';

const len = s => Array.from(s).length;
const devLevels = DEV_CHAPTERS.flatMap(allLevels);
const fakeSave = { level: () => ({ stars: 0, passed: false }) };

test('los capítulos en construcción van después de los jugables y solo se abren en modo desarrollador', () => {
  assert.equal(STORY_CHAPTERS.length, CHAPTERS.length);
  assert.deepEqual(STORY_CHAPTERS.slice(0, PLAYABLE.length), PLAYABLE);
  const first = PLAYABLE.length;
  const before = Dev.enabled;
  try {
    Dev.enabled = false;
    for (let i = first; i < CHAPTERS.length; i++) assert.equal(chapterUnlocked(CHAPTERS, i, fakeSave), false);
    Dev.enabled = true;
    for (let i = first; i < CHAPTERS.length; i++) assert.equal(chapterUnlocked(CHAPTERS, i, fakeSave), true);
  } finally { Dev.enabled = before; }
  for (const ch of DEV_CHAPTERS) {
    assert.equal(ch.dev, true);
    assert.equal(ch.story, null, `${ch.id}: sin cinemáticas`);
    assert.ok(Object.values(STAGES).some(s => s.hero === ch.hero), `${ch.id}: usa un modelo de Sofía`);
    for (const level of allLevels(ch)) {
      assert.equal(level.theme, 'neutro', `${level.id}: fondo neutro`);
      assert.equal(levelStatus(ch, level, fakeSave).unlocked, true, `${level.id}: abierto en modo desarrollador`);
    }
  }
});

test('los niveles en construcción usan solo lo ya enseñado y cada tecla nueva sale', () => {
  for (const level of devLevels) {
    const allowed = new Set(level.only ? [...level.only, ' '] : level.letters);
    for (const t of level.obstacles) {
      assert.ok(len(t) <= level.maxLen, `${level.id}: «${t}» mide más de ${level.maxLen}`);
      for (const c of t) {
        const ok = allowed.has(c) || (level.allowCaps && !level.only && allowed.has(c.toLowerCase()));
        assert.ok(ok, `${level.id}: «${c}» en «${t}» no está permitida`);
      }
    }
    for (const k of level.newKeys || []) assert.ok(level.obstacles.join('').includes(k), `${level.id}: debe salir la tecla ${k}`);
    assert.ok(Math.max(...level.obstacles.map(len)) >= level.maxLen - 4, `${level.id}: faltan obstáculos largos`);
  }
});

test('los niveles en construcción se pasan sin caer a ritmo de aprobar', () => {
  for (const level of devLevels) {
    const ppm = effectivePpm(level, level.ppm.pass ?? level.ppm.fast);
    const { falls } = simulate(level, ppm, { getupMs: levelRules(level).getupMs });
    assert.equal(falls, 0, `${level.id} a ${ppm.toFixed(1)} PPM se cae ${falls} veces`);
  }
});

test('cada largo tiene su obstáculo y los de 21 o más se pasan por etapas', () => {
  for (let n = 15; n <= 40; n++) assert.ok(LONG_TYPES.has(obstacleType(n)), `${n} caracteres`);
  for (const [type, t] of Object.entries(OBSTACLE_TYPES)) {
    if (!t.stages) continue;
    assert.equal(t.holds.length, t.stages - 1, `${type}: una parada entre etapas`);
    assert.ok(t.holds.every((h, i) => h > 0 && h < 1 && (i === 0 || h > t.holds[i - 1])), `${type}: paradas en orden`);
  }
  const chars = Array.from('los puestos del tianguis del domingo');
  const marks = stageMarks(chars, 4);
  assert.equal(marks.length, 3);
  assert.ok(marks.every((m, i) => m > 0 && m < chars.length && (i === 0 || m > marks[i - 1])));
});

test('en un obstáculo por etapas avanza al terminar cada tramo y al caer vuelve al inicio', () => {
  const level = { ...DEV_CHAPTERS[0].levels[1], obstacles: ['la barda alta de aqui'] };
  const r = new Runner(level, { getupMs: 500 });
  const o = r.obstacles[0];
  assert.ok(o.marks, 'tiene etapas');
  assert.equal(holdX(o), o.start);
  for (let i = 0; i < o.marks[0]; i++) assert.equal(r.type(o.chars[i]).ok, true);
  const hold = holdX(o);
  assert.ok(hold > o.start && hold < o.end, 'la primera parada está dentro del obstáculo');
  for (let i = 0; i < 2000 && r.x < hold - 0.01; i++) r.update(10);
  assert.ok(Math.abs(r.x - hold) < 0.5, 'llega a la parada');
  for (let i = 0; i < 50; i++) r.update(10);
  assert.ok(Math.abs(r.x - hold) < 0.5, 'y espera ahí al siguiente tramo');
  for (let t = 0; t < o.windowMs + 50 && r.phase !== 'fallen'; t += 10) r.update(10);
  assert.equal(r.phase, 'fallen');
  assert.equal(o.typed, 0, 'el texto se reinicia');
  assert.ok(r.x <= o.start + 0.01, 'vuelve al inicio del obstáculo');
});

test('las poses de las tres etapas caben en su cuadro', () => {
  for (const stage of Object.keys(STAGE_BUILDS)) {
    for (const [name, pose] of stagePoses(stage)) {
      const b = poseBounds(solvePose(pose, STAGE_BUILDS[stage]));
      assert.ok(b.x0 >= 0 && b.x1 <= RIG_W && b.y0 >= 0 && b.y1 <= RIG_H, `${stage}/${name}: ${JSON.stringify(b)}`);
    }
  }
});

test('cada obstáculo largo tiene coreografía de principio a fin, y en tierra al terminar', () => {
  for (const type of LONG_TYPES) {
    const t = OBSTACLE_TYPES[type];
    const end = t.pre + t.w + t.post;
    for (const hero of Object.values(STAGES).map(s => s.hero)) {
      for (let x = 0; x <= end; x += 5) {
        const p = longPose(type, x, hero);
        assert.ok(p && Number.isFinite(p.dy) && Number.isFinite(p.dx), `${type} en ${x}`);
        assert.ok(p.run || typeof p.frame === 'string', `${type} en ${x}: cuadro`);
      }
      const last = longPose(type, end, hero);
      assert.ok(last.dy === 0, `${type}: termina en el suelo`);
      assert.equal(last.run, true, `${type}: termina corriendo`);
    }
  }
});

test('sin teclado numérico, los niveles con < > se ajustan: ni se enseñan ni salen', async () => {
  const { Numpad, needsNumpad } = await import('../src/core/numpad.js');
  const withPad = devLevels.filter(l => l.numpadKeys);
  assert.ok(withPad.length > 0, 'hay niveles con teclas de teclado numérico');
  assert.equal(Numpad.has, true, 'por omisión, sí hay teclado numérico');
  try {
    Numpad.set(false);
    for (const level of withPad) {
      assert.ok(!level.newKeys.some(needsNumpad), `${level.id}: no se enseñan`);
      assert.ok(!level.letters.some(needsNumpad), `${level.id}: no están entre las teclas`);
      assert.ok(!level.obstacles.join('').split('').some(needsNumpad), `${level.id}: no salen en los obstáculos`);
      assert.ok(!(level.warmup || []).flat().some(needsNumpad), `${level.id}: ni en el calentamiento`);
      assert.ok(level.newKeys.length || level.warmup, `${level.id}: sigue teniendo lección o calentamiento`);
      const ppm = effectivePpm(level, level.ppm.pass ?? level.ppm.fast);
      assert.equal(simulate(level, ppm, { getupMs: levelRules(level).getupMs }).falls, 0, `${level.id}: se pasa sin caer`);
    }
  } finally { Numpad.set(true); }
  for (const level of withPad) {
    assert.ok([...level.newKeys, ...level.obstacles.join('')].some(needsNumpad), `${level.id}: con teclado numérico vuelven`);
  }
  for (const level of PLAYABLE.flatMap(allLevels)) assert.equal(level.numpadKeys, undefined, `${level.id}: no cambia`);
});
