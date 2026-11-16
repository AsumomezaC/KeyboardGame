// Hojas de sprites PNG: cada cuadro debe llamarse como lo piden las escenas y medir lo que su complexión.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PNG_SHEETS, OTHER_SHEETS, OBSTACLE_SHEETS, obstacleSheet, PORTRAITS, PORTRAIT_SIZE, PORTRAIT_MOODS, spriteUrl } from '../src/art/sprites.js';
import { CAST } from '../src/data/cast.js';
import { BUILDS, FRAME_NAMES } from '../src/art/kid.js';
import { CAST_BUILDS } from '../src/art/index.js';
import { OBSTACLE_VARIANTS, OBSTACLE_SIZES } from '../src/art/props.js';

const file = (id, ext) => new URL(`../public/${spriteUrl(id, ext)}`, import.meta.url);

test('las hojas PNG respetan los nombres y el tamaño de cuadro de su personaje', () => {
  for (const id of PNG_SHEETS) {
    const build = BUILDS[CAST_BUILDS[id]];
    assert.ok(build, `${id}: es un personaje del reparto`);
    const atlas = JSON.parse(readFileSync(file(id, 'json'), 'utf8'));
    const png = readFileSync(file(id, 'png'));
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20); // cabecera IHDR
    const names = Object.keys(atlas.frames);
    assert.ok(names.length > 0, `${id}: trae cuadros`);
    for (const name of names) {
      const base = name.replace(/^(run\d)_t$/, '$1'); // «runN_t»: variante de tropiezo de un cuadro de carrera
      assert.ok(FRAME_NAMES.includes(base), `${id}: «${name}» no es un cuadro que pidan las escenas`);
      const { x, y, w, h } = atlas.frames[name].frame;
      assert.deepEqual([w, h], [build.w, build.h], `${id}/${name}: tamaño de cuadro`);
      assert.ok(x >= 0 && y >= 0 && x + w <= width && y + h <= height, `${id}/${name}: cabe en el PNG`);
    }
    // una animación va completa o no va: no se mezclan cuadros nuevos y viejos dentro del mismo ciclo
    for (const group of [['run0', 'run1', 'run2', 'run3', 'run4', 'run5'], ['idle0', 'idle1'], ['cheer0', 'cheer1']]) {
      const have = group.filter(n => names.includes(n)).length;
      assert.ok(have === 0 || have === group.length, `${id}: animación ${group[0]}… incompleta`);
    }
  }
});

test('la hoja PNG del perro trae su galope y su ladrido en cuadros de 32×20', () => {
  assert.deepEqual(OTHER_SHEETS, ['dog']);
  const atlas = JSON.parse(readFileSync(file('dog', 'json'), 'utf8'));
  const png = readFileSync(file('dog', 'png'));
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
  assert.deepEqual(Object.keys(atlas.frames).sort(), ['bark', 'run0', 'run1', 'run2', 'run3']);
  for (const [name, { frame: { x, y, w, h } }] of Object.entries(atlas.frames)) {
    assert.deepEqual([w, h], [32, 20], `dog/${name}: tamaño de cuadro`);
    assert.ok(x >= 0 && y >= 0 && x + w <= width && y + h <= height, `dog/${name}: cabe en el PNG`);
  }
});

test('las hojas PNG de obstáculos traen una variante por cuadro, del tamaño del obstáculo', () => {
  assert.deepEqual(Object.keys(OBSTACLE_SIZES).sort(), Object.keys(OBSTACLE_VARIANTS).sort());
  for (const key of OBSTACLE_SHEETS) {
    assert.ok(OBSTACLE_VARIANTS[key], `${key}: es un obstáculo del juego`);
    const id = obstacleSheet(key);
    const atlas = JSON.parse(readFileSync(file(id, 'json'), 'utf8'));
    const png = readFileSync(file(id, 'png'));
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    const expected = Array.from({ length: OBSTACLE_VARIANTS[key] }, (_, v) => `v${v}`);
    assert.deepEqual(Object.keys(atlas.frames).sort(), expected, `${id}: una variante por cuadro`);
    for (const [name, { frame: { x, y, w, h } }] of Object.entries(atlas.frames)) {
      assert.deepEqual([w, h], OBSTACLE_SIZES[key], `${id}/${name}: tamaño de cuadro`);
      assert.ok(x >= 0 && y >= 0 && x + w <= width && y + h <= height, `${id}/${name}: cabe en el PNG`);
    }
  }
});

test('los retratos traen los 8 gestos con su boca al hablar, en cuadros del tamaño acordado', () => {
  for (const id of PORTRAITS) {
    assert.ok(CAST[id], `${id}: es un personaje del reparto`);
    const atlas = JSON.parse(readFileSync(file(`${id}-retrato`, 'json'), 'utf8'));
    const png = readFileSync(file(`${id}-retrato`, 'png'));
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    for (const mood of PORTRAIT_MOODS) {
      for (const name of [mood, `${mood}_m`]) assert.ok(atlas.frames[name], `${id}: falta el cuadro «${name}»`);
    }
    for (const [name, { frame: { x, y, w, h } }] of Object.entries(atlas.frames)) {
      assert.match(name, new RegExp(`^(${PORTRAIT_MOODS.join('|')})(_m|_b)?$`), `${id}: «${name}» no es un gesto`);
      assert.deepEqual([w, h], [PORTRAIT_SIZE, PORTRAIT_SIZE], `${id}/${name}: tamaño de cuadro`);
      assert.ok(x >= 0 && y >= 0 && x + w <= width && y + h <= height, `${id}/${name}: cabe en el PNG`);
    }
  }
});
