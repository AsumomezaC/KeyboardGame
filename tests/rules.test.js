import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTER1, allLevels } from '../src/data/chapter1.js';
import { levelRules, starsFor, starBreakdown, levelStatus, chapterMaxStars } from '../src/game/rules.js';
import { Runner, simulate } from '../src/game/runner.js';

const levels = allLevels(CHAPTER1);

test('los obstáculos solo usan las letras ya enseñadas y miden 8 o menos', () => {
  const allowed = new Set();
  for (const level of CHAPTER1.levels) {
    level.newKeys.forEach(k => allowed.add(k));
    for (const text of level.obstacles) {
      assert.ok(Array.from(text).length <= 8, `${level.id}: "${text}" mide más de 8`);
      for (const ch of text) assert.ok(allowed.has(ch), `${level.id}: "${ch}" en "${text}" aún no se enseña`);
    }
  }
  for (const text of CHAPTER1.secret.obstacles) {
    assert.ok(Array.from(text).length <= 8);
    for (const ch of text) assert.ok(allowed.has(ch.toLowerCase()), `secreto: "${ch}" en "${text}"`);
  }
});

test('el tiempo de la estrella de velocidad es menor que el límite', () => {
  for (const level of levels) {
    const r = levelRules(level);
    if (r.limitMs != null) assert.ok(r.fastMs < r.limitMs, `${level.id}: velocidad debe ser menor que el límite`);
  }
});

test('el nivel 2 solo usa d y k; el 3 combina d f j k', () => {
  const [, l2, l3] = CHAPTER1.levels;
  assert.ok(l2.obstacles.every(t => /^[dk]+$/.test(t)));
  assert.deepEqual(new Set(l3.obstacles.join('')), new Set('dfjk'));
});

test('a ritmo de aprobar no se tropieza', () => {
  for (const level of levels) {
    const ppm = level.ppm.pass ?? level.ppm.fast;
    const { falls } = simulate(level, ppm, { getupMs: levelRules(level).getupMs });
    assert.equal(falls, 0, `${level.id} a ${ppm} PPM se cae ${falls} veces`);
  }
});

test('si no escribes, tropiezas, te levantas y el obstáculo se reinicia', () => {
  const level = CHAPTER1.levels[0];
  const r = new Runner(level, { getupMs: 1000 });
  const o = r.obstacles[0];
  for (let t = 0; t < o.windowMs + 20; t += 10) r.update(10);
  assert.equal(r.phase, 'fallen');
  assert.equal(r.falls, 1);
  assert.equal(r.type('f').ignored, true, 'no se puede escribir en el suelo');
  for (let t = 0; t < 1020; t += 10) r.update(10);
  assert.equal(r.phase, 'run');
  assert.ok(o.timerStart >= o.windowMs + 1000, 'el temporizador se reinicia al levantarse');
  assert.equal(r.type('f').ok, true);
});

test('solo se escribe el obstáculo actual; el siguiente espera a que lo superes', () => {
  const level = CHAPTER1.levels[0];
  const r = new Runner(level);
  const [first, second] = r.obstacles;
  assert.equal(r.type(first.text).ok, true);
  assert.equal(r.mustRun, true);
  assert.equal(r.type(second.chars[0]).ignored, true, 'aún no se puede escribir el siguiente');
  assert.equal(second.typed, 0);
  for (let i = 0; i < 1000 && !first.passed; i++) r.update(10);
  assert.equal(r.mustRun, false);
  assert.equal(r.type(second.chars[0]).ok, true);
});

test('el jefe del perro termina al caer 3 veces', () => {
  const level = CHAPTER1.levels[6];
  const r = new Runner(level, { getupMs: 500, maxFalls: 3 });
  for (let i = 0; i < 100000 && r.phase !== 'failed'; i++) r.update(10);
  assert.equal(r.failReason, 'caught');
  assert.equal(r.falls, 3);
});

test('estrellas y desbloqueos', () => {
  const l4 = CHAPTER1.levels[3];
  const rules = levelRules(l4);
  assert.equal(starsFor(l4, { passed: false, timeMs: 1, accuracy: 1, falls: 0 }), 0);
  assert.equal(starsFor(l4, { passed: true, timeMs: rules.limitMs, accuracy: 0.9, falls: 0 }), 1);
  assert.deepEqual(starBreakdown(l4, { passed: true, timeMs: rules.fastMs, accuracy: 0.9 }), { finish: true, speed: true, accuracy: false });
  assert.deepEqual(starBreakdown(l4, { passed: true, timeMs: rules.limitMs, accuracy: 0.95 }), { finish: true, speed: false, accuracy: true });
  assert.equal(starsFor(l4, { passed: true, timeMs: rules.fastMs, accuracy: 0.95, falls: 2 }), 3);

  const fake = progress => ({ level: id => progress[id] || { stars: 0, passed: false } });
  assert.equal(levelStatus(CHAPTER1, CHAPTER1.levels[0], fake({})).unlocked, true);
  assert.equal(levelStatus(CHAPTER1, CHAPTER1.levels[1], fake({})).unlocked, false);
  const sixPassed = Object.fromEntries(CHAPTER1.levels.slice(0, 6).map(l => [l.id, { stars: 1, passed: true }]));
  assert.match(levelStatus(CHAPTER1, CHAPTER1.levels[6], fake(sixPassed)).reason, /10 ★/);
  assert.equal(levelStatus(CHAPTER1, CHAPTER1.secret, fake(sixPassed)).visible, false);
  assert.equal(chapterMaxStars(CHAPTER1, fake(sixPassed)), 30);
  const allThree = Object.fromEntries(CHAPTER1.levels.map(l => [l.id, { stars: 3, passed: true }]));
  assert.equal(chapterMaxStars(CHAPTER1, fake(allThree)), 33);
});

test('tabla de tiempos (informativa)', () => {
  for (const level of levels) {
    const r = levelRules(level);
    const s = ms => (ms == null ? '—' : (ms / 1000).toFixed(1) + ' s');
    console.log(`${level.id.padEnd(6)} límite ${s(r.limitMs).padStart(8)}  velocidad ${s(r.fastMs).padStart(8)}`);
  }
});
