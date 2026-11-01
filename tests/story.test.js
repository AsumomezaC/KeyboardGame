import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTER1, allLevels } from '../src/data/chapter1.js';
import { CAST, STORY1 } from '../src/data/story1.js';
import { WEATHER_NAMES } from '../src/data/weathers.js';
import { TRACKS } from '../src/audio/tracks.js';
import { parseLine } from '../src/audio/music.js';

const MOODS = new Set(['idle', 'talk', 'sad', 'angry', 'cry', 'shock', 'happy', 'cheer']);
const FX = new Set(['shake', 'zoom', 'flash']);
const PLACES = new Set(['casa', 'barrio', 'prohibida', 'noche', 'carrera', 'mercado']);

test('cada nivel tiene historia antes y después', () => {
  for (const level of allLevels(CHAPTER1)) {
    const s = STORY1[level.id];
    assert.ok(s, `${level.id} sin historia`);
    assert.ok(s.before?.lines.length && s.after?.lines.length, `${level.id} sin diálogo antes o después`);
    assert.ok(WEATHER_NAMES[s.weather], `${level.id}: clima ${s.weather}`);
    assert.ok(TRACKS[s.music], `${level.id}: música ${s.music}`);
    assert.ok(s.phrases.length >= 3, `${level.id}: pocas frases de carrera`);
    for (const p of s.phrases) assert.ok(p.length <= 30, `${level.id}: frase larga «${p}»`);
  }
});

test('las escenas usan personajes, gestos, efectos, música y lugares que existen', () => {
  for (const [id, s] of Object.entries(STORY1)) {
    for (const part of ['before', 'after']) {
      const sc = s[part];
      const where = `${id}/${part}`;
      assert.ok(PLACES.has(sc.place), `${where}: lugar ${sc.place}`);
      assert.ok(TRACKS[sc.music], `${where}: música ${sc.music}`);
      if (sc.weather) assert.ok(WEATHER_NAMES[sc.weather], `${where}: clima ${sc.weather}`);
      const onStage = new Set(sc.cast.map(c => c[0]));
      for (const [who, , , mood] of sc.cast) {
        assert.ok(CAST[who], `${where}: ${who} no está en el reparto`);
        if (mood) assert.ok(MOODS.has(mood), `${where}: gesto ${mood}`);
      }
      for (const line of sc.lines) {
        if (line.enter) onStage.add(line.enter);
        if (line.exit) assert.ok(onStage.delete(line.exit), `${where}: ${line.exit} sale sin estar`);
        if (line.music) assert.ok(TRACKS[line.music], `${where}: música ${line.music}`);
        if (line.s) {
          assert.ok(onStage.has(line.s), `${where}: habla ${line.s} sin estar en escena`);
          if (line.m) assert.ok(MOODS.has(line.m), `${where}: gesto ${line.m}`);
        }
        if (line.fx) assert.ok(FX.has(line.fx), `${where}: efecto ${line.fx}`);
        if (line.t) assert.ok(line.t.length <= 115, `${where}: línea demasiado larga para la caja (${line.t.length})`);
      }
    }
  }
});

test('las pistas de música tienen compases completos de 16 pasos', () => {
  for (const [name, track] of Object.entries(TRACKS)) {
    for (const v of track.voices) {
      v.bars.forEach((bar, i) => assert.equal(bar.trim().split(/\s+/).length, 16, `${name}: compás ${i + 1} de una voz`));
      assert.ok(parseLine(v.bars).events.length > 0);
    }
    for (const d of track.drums || []) assert.equal(d.trim().split(/\s+/).length, 16, `${name}: batería`);
  }
});

test('primera vez: historia antes y después; al repetir se omite', async () => {
  const { startLevel, finishLevel } = await import('../src/scenes/flow.js');
  const calls = [];
  const scene = { scene: { start: (key, data) => calls.push({ key, data }) } };
  const level = CHAPTER1.levels[0];

  startLevel(scene, CHAPTER1, level);
  assert.equal(calls[0].key, 'Dialogue');
  assert.equal(calls[0].data.part, 'before');
  assert.equal(calls[0].data.then.key, 'Lesson');

  finishLevel(scene, CHAPTER1, level, { passed: true }, { story: false });
  assert.equal(calls[1].key, 'Dialogue', 'al superar por primera vez sale el diálogo final');
  assert.equal(calls[1].data.part, 'after');

  finishLevel(scene, CHAPTER1, level, { passed: false }, { story: true });
  assert.equal(calls[2].key, 'Results', 'si no lo superas no hay diálogo final');

  startLevel(scene, CHAPTER1, level, { story: false });
  assert.equal(calls[3].key, 'Lesson', 'sin historia va directo a jugar');
});
