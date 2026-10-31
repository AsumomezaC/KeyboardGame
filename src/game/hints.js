// Pistas para el siguiente carácter, incluido el consejo de Shift o Bloq Mayús.
import * as Layout from '../core/layout.js';
import { oppositeShift } from '../core/fingers.js';

const isUpper = c => c !== c.toLowerCase() && c === c.toUpperCase();
const isLower = c => c !== c.toUpperCase() && c === c.toLowerCase();

// Cuántas mayúsculas seguidas hay alrededor de la posición i (los espacios entre ellas no cortan).
export function upperRun(chars, i) {
  const inRun = c => isUpper(c) || c === ' ';
  let a = i, b = i;
  while (a > 0 && inRun(chars[a - 1])) a--;
  while (b < chars.length - 1 && inRun(chars[b + 1])) b++;
  const slice = chars.slice(a, b + 1);
  while (slice.length && slice[slice.length - 1] === ' ') slice.pop();
  while (slice.length && slice[0] === ' ') slice.shift();
  return { text: slice.join(''), letters: slice.filter(isUpper).length };
}

// { main, alt, codes, altCodes }: textos y teclas a resaltar (alt = camino alternativo).
export function hintFor(chars, i, { capsLock = false, allowCaps = false } = {}) {
  const ch = chars[i];
  const name = ch === ' ' ? 'espacio' : ch;
  const base = { main: `Siguiente: ${name}  —  ${Layout.describe(ch)}`, alt: '', altCodes: [] };
  if (!allowCaps) return base;

  const combo = Layout.comboFor(ch.toLowerCase());
  const code = combo && combo.steps ? combo.steps[combo.steps.length - 1].code : null;
  if (capsLock && (isLower(ch) || !isUpper(ch))) {
    if (isLower(ch)) return { main: `Siguiente: ${ch}  —  Desactiva Bloq Mayús y luego tecla ${Layout.usLegend(code)}`, alt: '', altCodes: [] };
    return base;
  }
  if (!isUpper(ch) || !code) return base;

  const shiftName = oppositeShift(code) === 'ShiftRight' ? 'Shift derecho' : 'Shift izquierdo';
  const viaShift = `${shiftName} + tecla ${Layout.usLegend(code)} (Shift de la mano contraria a la letra)`;
  const run = upperRun(chars, i);
  if (capsLock) {
    return { main: `Siguiente: ${ch}  —  tecla ${Layout.usLegend(code)} (Bloq Mayús ya está activo)`, alt: '', altCodes: [] };
  }
  if (run.letters >= 2) {
    return {
      main: `Siguiente: ${ch}  —  Recomendado: activa Bloq Mayús para «${run.text}» y desactívalo al terminar`,
      alt: `Alternativa: ${viaShift} en cada letra`,
      codes: ['CapsLock'],
      altCodes: [oppositeShift(code)],
    };
  }
  return {
    main: `Siguiente: ${ch}  —  Recomendado: ${viaShift}`,
    alt: 'Alternativa: Bloq Mayús, tecla y Bloq Mayús otra vez (más lento para una sola letra)',
    altCodes: ['CapsLock'],
  };
}
