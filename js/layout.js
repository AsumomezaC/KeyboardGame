// Distribución "Español (Latinoamérica)" de Windows sobre un teclado físico ANSI (EE. UU.).
// Cada código físico (KeyboardEvent.code) -> [normal, Shift, AltGr].
// Los valores por defecto se pueden corregir con lo que registra el modo diagnóstico.
const Layout = (() => {
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
  const IGNORED_CODES = new Set(['Backspace', 'Enter', 'NumpadEnter', 'Escape', 'Tab']);
  const STORAGE_KEY = 'parkour.learnedLayout';

  // Lo que viene impreso en un teclado físico ANSI (EE. UU.): [normal, Shift].
  const US_KEYCAP = {
    Backquote: ['`', '~'], Digit1: ['1', '!'], Digit2: ['2', '@'], Digit3: ['3', '#'],
    Digit4: ['4', '$'], Digit5: ['5', '%'], Digit6: ['6', '^'], Digit7: ['7', '&'],
    Digit8: ['8', '*'], Digit9: ['9', '('], Digit0: ['0', ')'], Minus: ['-', '_'],
    Equal: ['=', '+'], BracketLeft: ['[', '{'], BracketRight: [']', '}'], Backslash: ['\\', '|'],
    Semicolon: [';', ':'], Quote: ["'", '"'], Comma: [',', '<'], Period: ['.', '>'], Slash: ['/', '?'],
  };
  const US_NAMES = { Space: 'Espacio', IntlBackslash: '(tecla < >)' };

  const defaults = buildDefaults();
  let learned = load();

  function buildDefaults() {
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

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(learned));
    } catch { /* sin almacenamiento: el mapa dura solo esta sesión */ }
  }

  // Convierte las pulsaciones que produjeron un carácter en una "combinación" reutilizable.
  function comboFromStrokes(strokes) {
    const keys = strokes.filter(s => !IGNORED_CODES.has(s.code));
    if (!keys.length) return null;
    if (keys.every(s => s.code.startsWith('Numpad') && s.alt)) {
      return { altCode: keys.map(s => s.code.slice(6)).join('') };
    }
    if (keys.length > 2) return null;
    return { steps: keys.map(s => ({ code: s.code, shift: s.shift, altGr: s.altGr })) };
  }

  function learn(ch, strokes) {
    const combo = comboFromStrokes(strokes);
    if (!combo) return null;
    learned[ch] = combo;
    save();
    return combo;
  }

  function comboFor(ch) {
    return learned[ch] || defaults[ch] || null;
  }

  function keycap(code) {
    if (US_KEYCAP[code]) return US_KEYCAP[code];
    if (code.startsWith('Key')) return [code.slice(3), ''];
    return [usLegend(code), ''];
  }

  function usLegend(code) {
    if (US_KEYCAP[code]) return US_KEYCAP[code][0];
    if (US_NAMES[code]) return US_NAMES[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Numpad')) return 'Num ' + code.slice(6);
    return code;
  }

  function describeCombo(combo) {
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
        let text = [s.altGr && 'AltGr', s.shift && 'Shift', 'tecla ' + usLegend(s.code)].filter(Boolean).join(' + ');
        // Si Shift sigue presionado en la tecla siguiente, sale mayúscula (p. ej. Ü en vez de ü).
        const next = combo.steps[i + 1];
        if (s.shift && next && !next.shift) text += ' (suelta Shift)';
        return text;
      })
      .join('  →  luego  ');
  }

  function describe(ch) {
    return describeCombo(comboFor(ch));
  }

  // Lo que produce una tecla física: [normal, Shift, AltGr], con lo aprendido encima.
  function labels(code) {
    const out = [...(BASE[code] || [])];
    for (const [ch, combo] of Object.entries(learned)) {
      if (!combo.steps || combo.steps.length !== 1 || combo.steps[0].code !== code) continue;
      const s = combo.steps[0];
      out[s.altGr ? 2 : s.shift ? 1 : 0] = ch;
    }
    return out;
  }

  function learnedCount() {
    return Object.keys(learned).length;
  }

  function reset() {
    learned = {};
    save();
  }

  function exportJSON() {
    return JSON.stringify({ layout: 'es-419 sobre ANSI', learned }, null, 2);
  }

  return { comboFor, comboFromStrokes, learn, describe, describeCombo, labels, keycap, usLegend, learnedCount, reset, exportJSON };
})();
