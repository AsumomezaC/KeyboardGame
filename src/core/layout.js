// Distribución "Español (Latinoamérica)" de Windows sobre un teclado físico ANSI (EE. UU.).
// Cada código físico (KeyboardEvent.code) -> [normal, Shift, AltGr].
import { oppositeShift } from './fingers.js';

const BASE = {
  Backquote: ['|', '°', '¬'],
  Digit1: ['1', '!'], Digit2: ['2', '"'], Digit3: ['3', '#'], Digit4: ['4', '$'],
  Digit5: ['5', '%'], Digit6: ['6', '&'], Digit7: ['7', '/'], Digit8: ['8', '('],
  Digit9: ['9', ')'], Digit0: ['0', '='],
  Minus: ["'", '?', '\\'],
  Equal: ['¿', '¡'],
  BracketLeft: ['´', '¨'], // teclas muertas
  BracketRight: ['+', '*', '~'],
  Semicolon: ['ñ', 'Ñ'],
  Quote: ['{', '[', '^'],
  Backslash: ['}', ']', '`'],
  Comma: [',', ';'],
  Period: ['.', ':'],
  Slash: ['-', '_'],
  Space: [' '],
};
for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') BASE['Key' + c] = [c.toLowerCase(), c];
BASE.KeyQ[2] = '@';

const DEAD_CODES = new Set(['BracketLeft']);

// Lo que viene impreso en un teclado físico ANSI (EE. UU.): [normal, Shift].
const US_KEYCAP = {
  Backquote: ['`', '~'], Digit1: ['1', '!'], Digit2: ['2', '@'], Digit3: ['3', '#'],
  Digit4: ['4', '$'], Digit5: ['5', '%'], Digit6: ['6', '^'], Digit7: ['7', '&'],
  Digit8: ['8', '*'], Digit9: ['9', '('], Digit0: ['0', ')'], Minus: ['-', '_'],
  Equal: ['=', '+'], BracketLeft: ['[', '{'], BracketRight: [']', '}'], Backslash: ['\\', '|'],
  Semicolon: [';', ':'], Quote: ["'", '"'], Comma: [',', '<'], Period: ['.', '>'], Slash: ['/', '?'],
};
const US_NAMES = { Space: 'Espacio', IntlBackslash: '(tecla < >)' };

const combos = buildCombos();

function buildCombos() {
  const map = {};
  for (const [code, outs] of Object.entries(BASE)) {
    if (DEAD_CODES.has(code)) continue;
    outs.forEach((ch, level) => {
      if (ch && !map[ch]) map[ch] = { steps: [{ code, shift: level === 1, altGr: level === 2 }] };
    });
  }
  // Vocales acentuadas: tecla muerta ´ y luego la vocal.
  for (const v of 'AEIOU') {
    const lower = { A: 'á', E: 'é', I: 'í', O: 'ó', U: 'ú' }[v];
    map[lower] = { steps: [{ code: 'BracketLeft' }, { code: 'Key' + v }] };
    map[lower.toUpperCase()] = { steps: [{ code: 'BracketLeft' }, { code: 'Key' + v, shift: true }] };
  }
  map['ü'] = { steps: [{ code: 'BracketLeft', shift: true }, { code: 'KeyU' }] };
  map['Ü'] = { steps: [{ code: 'BracketLeft', shift: true }, { code: 'KeyU', shift: true }] };
  map['´'] = { steps: [{ code: 'BracketLeft' }, { code: 'Space' }] };
  // < y > viven en una tecla que los teclados ANSI no tienen: código Alt.
  map['<'] = { altCode: '60', missingKey: true };
  map['>'] = { altCode: '62', missingKey: true };
  return map;
}

export function comboFor(ch) {
  return combos[ch] || null;
}

// Caracteres que solo se escriben con código Alt (en el teclado numérico), con su código.
export function altCodeChars() {
  return Object.entries(combos).filter(([, c]) => c.altCode).map(([ch, c]) => ({ ch, code: c.altCode }));
}

export function keycap(code) {
  if (US_KEYCAP[code]) return US_KEYCAP[code];
  if (code.startsWith('Key')) return [code.slice(3), ''];
  return [usLegend(code), ''];
}

export function usLegend(code) {
  if (US_KEYCAP[code]) return US_KEYCAP[code][0];
  if (US_NAMES[code]) return US_NAMES[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  return code;
}

export function labels(code) {
  return [...(BASE[code] || [])];
}

function shiftName(code) {
  return oppositeShift(code) === 'ShiftRight' ? 'Shift derecho' : 'Shift izquierdo';
}

export function describeCombo(combo) {
  if (!combo) return 'Sin pista registrada para este carácter.';
  if (combo.altCode) {
    const digits = combo.altCode.split('').join(' ');
    const note = combo.missingKey
      ? ' (ojo: la tecla que tiene impreso < > en tu teclado escribe , ; y . : en latino)'
      : '';
    return `Mantén Alt izquierdo, teclea ${digits} en el teclado numérico y suelta Alt${note}`;
  }
  return combo.steps
    .map((s, i) => {
      let text = [s.altGr && 'AltGr', s.shift && shiftName(s.code), 'tecla ' + usLegend(s.code)].filter(Boolean).join(' + ');
      // Si Shift sigue presionado en la tecla siguiente, sale mayúscula (p. ej. Ü en vez de ü).
      const next = combo.steps[i + 1];
      if (s.shift && next && !next.shift) text += ' (suelta Shift)';
      return text;
    })
    .join('  →  luego  ');
}

export function describe(ch) {
  return describeCombo(comboFor(ch));
}
