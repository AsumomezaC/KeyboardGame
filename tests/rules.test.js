import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLAYABLE, CHAPTERS, CHAPTER1, allLevels } from '../src/data/chapters.js';
import { levelRules, starsFor, starBreakdown, levelStatus, chapterMaxStars, chapterUnlocked, effectivePpm, accuracyTarget } from '../src/game/rules.js';
import { Runner, simulate, obstacleType } from '../src/game/runner.js';

const everyLevel = PLAYABLE.flatMap(allLevels);
const len = s => Array.from(s).length;

// Lo que pidió el diseño, nivel por nivel: [solo estas teclas | null, largo máximo].
const SPEC = {
  cap1: [['fj', 2], ['dk', 3], ['dfjk', 2], ['dfjk', 4], ['sl', 3], [null, 3], [null, 5], ['añ', 2], [null, 4], [null, 6]],
  cap2: [[null, 6], [null, 8], ['gh', 4], [null, 4], [null, 8], ['ru', 5], [null, 9], ['ie', 5], [null, 9], [null, 10]],
  cap3: [['ow', 6], [null, 5], [null, 8], ['pq', 10], [null, 5], [null, 8], [null, 12], ['ty', 12], [null, 6], [null, 13]],
};
const SECRET_MAX = { cap1: 6, cap2: 10, cap3: 13 };

test('hay 6 capítulos: 3 jugables y 3 en construcción', () => {
  assert.equal(CHAPTERS.length, 6);
  assert.deepEqual(CHAPTERS.map(c => c.subtitle), ['Me llamo Sofía', 'Los gatos', 'El día de mi suerte', null, null, null]);
  for (const ch of PLAYABLE) assert.equal(ch.levels.length, 10);
});

test('cada nivel usa solo las teclas y el largo que le tocan', () => {
  for (const ch of PLAYABLE) {
    ch.levels.forEach((level, i) => {
      const [only, maxLen] = SPEC[ch.id][i];
      assert.equal(level.maxLen, maxLen, `${level.id}: largo máximo`);
      const allowed = new Set(only ? [...only, ...(level.letters.includes(' ') ? ' ' : '')] : level.letters);
      for (const t of level.obstacles) {
        assert.ok(len(t) <= maxLen, `${level.id}: «${t}» mide más de ${maxLen}`);
        for (const c of t) assert.ok(allowed.has(c), `${level.id}: «${c}» en «${t}» no está permitida`);
      }
      if (only) for (const k of only) assert.ok(level.obstacles.join('').includes(k), `${level.id}: debe salir la tecla ${k}`);
      if (only && level.letters.includes(' ')) assert.ok(level.obstacles.some(t => t.includes(' ')), `${level.id}: después de aprender el espacio también se usa`);
      assert.ok(Math.max(...level.obstacles.map(len)) >= maxLen - 2, `${level.id}: faltan obstáculos largos`);
    });
    const s = ch.secret;
    assert.equal(s.maxLen, SECRET_MAX[ch.id]);
    for (const t of s.obstacles) {
      assert.ok(len(t) <= s.maxLen);
      for (const c of t) assert.ok(s.letters.includes(c.toLowerCase()), `${s.id}: «${c}» en «${t}»`);
    }
    assert.ok(s.obstacles.some(t => t !== t.toLowerCase()), `${s.id}: debe tener mayúsculas`);
  }
  assert.ok(CHAPTER1.secret.obstacles.some(t => t.includes(' ')), 'el secreto del capítulo 1 agrega el espacio');
  assert.equal(PLAYABLE[1].secret.hero, 'dani', 'en el secreto del capítulo 2 corre Dani');
});

test('los niveles avanzados siguen teniendo obstáculos cortos', () => {
  for (const level of everyLevel.filter(l => l.maxLen >= 6)) {
    assert.ok(level.obstacles.filter(t => len(t) <= 3).length >= 3, `${level.id}: pocos obstáculos cortos`);
  }
});

test('los obstáculos largos usan mesa, pared y hoyo', () => {
  assert.equal(obstacleType(9), 'table');
  assert.equal(obstacleType(12), 'wall');
  assert.equal(obstacleType(13), 'hole');
  const types = new Set(PLAYABLE[2].levels.flatMap(l => l.obstacles.map(t => obstacleType(len(t)))));
  for (const t of ['table', 'wall', 'hole']) assert.ok(types.has(t), `el capítulo 3 debe usar ${t}`);
});

test('jefes en el 7 y el 10: piden 10 y 20 estrellas y cada uno es más estricto', () => {
  const bosses = PLAYABLE.flatMap(ch => {
    ch.levels.forEach((l, i) => assert.equal(!!l.boss, i === 6 || i === 9, `${l.id}: jefe solo en 7 y 10`));
    assert.equal(ch.levels[6].requiresStars, 10);
    assert.equal(ch.levels[9].requiresStars, 20);
    return [ch.levels[6], ch.levels[9]];
  });
  for (let i = 1; i < bosses.length; i++) {
    const [a, b] = [bosses[i - 1].boss, bosses[i].boss];
    assert.ok(b.maxErrors < a.maxErrors, `${bosses[i].id}: menos traspiés permitidos`);
    assert.ok(b.maxFalls <= a.maxFalls, `${bosses[i].id}: no más caídas permitidas`);
    assert.ok(levelRules(bosses[i]).limitMs != null, 'los jefes tienen límite de tiempo');
  }
});

test('el tiempo de la estrella de velocidad es menor que el límite', () => {
  for (const level of everyLevel) {
    const r = levelRules(level);
    if (r.limitMs != null) assert.ok(r.fastMs < r.limitMs, `${level.id}: velocidad debe ser menor que el límite`);
  }
});

test('a ritmo de aprobar no se tropieza', () => {
  for (const level of everyLevel) {
    const ppm = effectivePpm(level, level.ppm.pass ?? level.ppm.fast);
    const { falls } = simulate(level, ppm, { getupMs: levelRules(level).getupMs });
    assert.equal(falls, 0, `${level.id} a ${ppm.toFixed(1)} PPM se cae ${falls} veces`);
  }
});

test('si no escribes, tropiezas, te levantas y el obstáculo se reinicia', () => {
  const level = CHAPTER1.levels[0];
  const r = new Runner(level, { getupMs: 1000 });
  const o = r.obstacles[0];
  for (let t = 0; t < o.windowMs + 20; t += 10) r.update(10);
  assert.equal(r.phase, 'fallen');
  assert.equal(r.falls, 1);
  assert.equal(r.type(o.chars[0]).ignored, true, 'no se puede escribir en el suelo');
  for (let t = 0; t < 1020; t += 10) r.update(10);
  assert.equal(r.phase, 'run');
  assert.ok(o.timerStart >= o.windowMs + 1000, 'el temporizador se reinicia al levantarse');
  assert.equal(r.type(o.chars[0]).ok, true);
});

test('solo se escribe el obstáculo actual; el siguiente espera a que lo superes', () => {
  const level = CHAPTER1.levels[0];
  const r = new Runner(level);
  const [first, second] = r.obstacles;
  for (const ch of first.chars) assert.equal(r.type(ch).ok, true);
  assert.equal(r.mustRun, true);
  assert.equal(r.type(second.chars[0]).ignored, true, 'aún no se puede escribir el siguiente');
  for (let i = 0; i < 1000 && !first.passed; i++) r.update(10);
  assert.equal(r.mustRun, false);
  assert.equal(r.type(second.chars[0]).ok, true);
});

test('las PPM solo cuentan el tiempo en que se puede escribir', () => {
  const r = new Runner(CHAPTER1.levels[8]);
  for (let i = 0; i < 200000 && r.phase !== 'done'; i++) {
    r.update(10);
    const o = r.targetObstacle;
    if (o && r.canType && i % 30 === 0) r.type(o.chars[o.typed]);
  }
  const res = r.result();
  assert.ok(res.typingMs < res.timeMs * 0.9, 'correr entre obstáculos no cuenta');
  assert.ok(Math.abs(res.wpm - r.correct / 5 / (res.typingMs / 60000)) < 1e-9);
});

test('un jefe se pierde con una caída o un traspié de más', () => {
  const level = CHAPTER1.levels[6];
  const byFalls = new Runner(level, { getupMs: 300, maxFalls: 2 });
  for (let i = 0; i < 100000 && byFalls.phase !== 'failed'; i++) byFalls.update(10);
  assert.equal(byFalls.failReason, 'falls');
  assert.equal(byFalls.falls, 3);

  const byErrors = new Runner(level, { maxErrors: 2 });
  const wrong = byErrors.obstacles[0].chars[0] === 'f' ? 'j' : 'f';
  for (let i = 0; i < 3; i++) byErrors.type(wrong);
  assert.equal(byErrors.failReason, 'errors');
});

test('estrellas, desbloqueos y capítulos', () => {
  const l4 = CHAPTER1.levels[3];
  const rules = levelRules(l4);
  const acc = accuracyTarget(l4);
  assert.equal(starsFor(l4, { passed: false, timeMs: 1, accuracy: 1 }), 0);
  assert.equal(starsFor(l4, { passed: true, timeMs: rules.limitMs, accuracy: acc - 0.02 }), 1);
  assert.deepEqual(starBreakdown(l4, { passed: true, timeMs: rules.fastMs, accuracy: acc - 0.02 }), { finish: true, speed: true, accuracy: false });
  assert.deepEqual(starBreakdown(l4, { passed: true, timeMs: rules.limitMs, accuracy: acc }), { finish: true, speed: false, accuracy: true });

  const fake = progress => ({ level: id => progress[id] || { stars: 0, passed: false } });
  assert.equal(levelStatus(CHAPTER1, CHAPTER1.levels[0], fake({})).unlocked, true);
  assert.equal(levelStatus(CHAPTER1, CHAPTER1.levels[1], fake({})).unlocked, false);
  const sixPassed = Object.fromEntries(CHAPTER1.levels.slice(0, 6).map(l => [l.id, { stars: 1, passed: true }]));
  assert.match(levelStatus(CHAPTER1, CHAPTER1.levels[6], fake(sixPassed)).reason, /10 ★/);
  assert.equal(chapterMaxStars(CHAPTER1, fake(sixPassed)), 30);
  const allThree = Object.fromEntries(CHAPTER1.levels.map(l => [l.id, { stars: 3, passed: true }]));
  assert.equal(chapterMaxStars(CHAPTER1, fake(allThree)), 33);

  assert.equal(chapterUnlocked(PLAYABLE, 0, fake({})), true);
  assert.equal(chapterUnlocked(PLAYABLE, 1, fake({})), false);
  assert.equal(chapterUnlocked(PLAYABLE, 1, fake(allThree)), true, 'el 2 se abre al superar el nivel 10 del 1');
  assert.equal(chapterUnlocked(PLAYABLE, 2, fake(allThree)), false);
});

test('la dificultad sube poco a poco en los tres capítulos', () => {
  const first = CHAPTER1.levels[0];
  const last = PLAYABLE[2].levels.at(-1);
  assert.equal(accuracyTarget(first), 0.9);
  assert.equal(accuracyTarget(last), 0.97);
  assert.ok(effectivePpm(first, 10) < 10);
  assert.equal(effectivePpm(last, 10), 10);
  let prev = 0;
  for (const level of PLAYABLE.flatMap(c => c.levels)) {
    assert.ok(accuracyTarget(level) >= prev, `${level.id}: la precisión no debe bajar`);
    prev = accuracyTarget(level);
  }
});

test('la dificultad sube en curva: más rápido al final que al principio', () => {
  const step = ch => PLAYABLE[ch].levels.at(-1).step - PLAYABLE[ch].levels[0].step;
  assert.ok(step(1) > step(0) && step(2) > step(1), 'cada capítulo sube más que el anterior');
});

test('los niveles sin teclas nuevas calientan con dos pares de teclas ya aprendidas', () => {
  for (const level of PLAYABLE.flatMap(allLevels)) {
    if (level.newKeys.length) {
      assert.equal(level.warmup ?? null, null, `${level.id}: con teclas nuevas no hay calentamiento`);
      continue;
    }
    assert.equal(level.warmup.length, 2, `${level.id}: deben ser dos pares`);
    for (const k of level.warmup.flat()) assert.ok(level.letters.includes(k), `${level.id}: «${k}» aún no se aprende`);
  }
});

test('tabla de niveles (informativa)', () => {
  for (const level of everyLevel) {
    const r = levelRules(level);
    const s = ms => (ms == null ? '—' : (ms / 1000).toFixed(1) + ' s');
    const boss = level.boss ? `  jefe ${level.boss.type} (traspiés ≤${level.boss.maxErrors}, caídas ≤${level.boss.maxFalls})` : '';
    console.log(`${level.id.padEnd(6)} límite ${s(r.limitMs).padStart(7)}  velocidad ${s(r.fastMs).padStart(7)}  ${Math.round(accuracyTarget(level) * 100)} %  ${level.obstacles.slice(0, 6).join(' | ')}${boss}`);
  }
});
