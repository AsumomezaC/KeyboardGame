import { test } from 'node:test';
import assert from 'node:assert/strict';
import { upperRun, hintFor } from '../src/game/hints.js';

const chars = s => Array.from(s);

test('detecta tramos de mayúsculas, con espacios en medio', () => {
  assert.deepEqual(upperRun(chars('LAS ALAS'), 5), { text: 'LAS ALAS', letters: 7 });
  assert.equal(upperRun(chars('La Gala'), 0).letters, 1);
  assert.equal(upperRun(chars('Ja Ja'), 3).letters, 1);
});

test('una mayúscula suelta recomienda Shift contrario; varias, Bloq Mayús', () => {
  const one = hintFor(chars('Sala'), 0, { allowCaps: true });
  assert.match(one.main, /Shift derecho/);
  assert.match(one.alt, /Bloq Mayús/);
  const many = hintFor(chars('SALSA'), 0, { allowCaps: true });
  assert.match(many.main, /Bloq Mayús/);
  assert.match(many.alt, /Shift derecho/);
  const enie = hintFor(chars('AÑADAS'), 1, { allowCaps: true });
  assert.match(enie.alt, /Shift izquierdo/);
});

test('con Bloq Mayús activo pide desactivarlo antes de una minúscula', () => {
  const h = hintFor(chars('Sala'), 1, { allowCaps: true, capsLock: true });
  assert.match(h.main, /Desactiva Bloq Mayús/);
});
