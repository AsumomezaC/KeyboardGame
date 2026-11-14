// Teclado físico ANSI (EE. UU.) dibujado en el DOM. Cada tecla muestra en gris lo que viene
// impreso en ella y, en color, lo que escribe la distribución latina cuando es distinto.
// Se dibuja dos veces: completo (pantallas angostas) y partido en mitad izquierda y derecha (a
// los lados del texto en pantallas normales). El CSS muestra uno u otro; resaltar una tecla
// marca todas sus copias. En los niveles con códigos Alt (< >) se agrega el teclado numérico a la
// derecha, si cabe (showNumpad).
import * as Layout from '../core/layout.js';
import { fingerOf, oppositeShift } from '../core/fingers.js';

// [código, ancho en unidades de tecla]
const ROWS = [
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', ['Backspace', 2]],
  [['Tab', 1.5], 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', ['Backslash', 1.5]],
  [['CapsLock', 1.75], 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', ['Enter', 2.25]],
  [['ShiftLeft', 2.25], 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', ['ShiftRight', 2.75]],
  [['ControlLeft', 1.25], ['MetaLeft', 1.25], ['AltLeft', 1.25], ['Space', 6.25], ['AltRight', 1.25], ['MetaRight', 1.25], ['ContextMenu', 1.25], ['ControlRight', 1.25]],
];
// Mitades para el teclado partido (como los teclados ergonómicos): la barra espaciadora se divide.
const LEFT_ROWS = [
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'],
  [['Tab', 1.5], 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT'],
  [['CapsLock', 1.75], 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG'],
  [['ShiftLeft', 2.25], 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB'],
  [['ControlLeft', 1.25], ['MetaLeft', 1.25], ['AltLeft', 1.25], ['Space', 3]],
];
const RIGHT_ROWS = [
  ['Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', ['Backspace', 2]],
  ['KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', ['Backslash', 1.5]],
  ['KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', ['Enter', 2.25]],
  ['KeyN', 'KeyM', 'Comma', 'Period', 'Slash', ['ShiftRight', 2.75]],
  [['Space', 3.25], ['AltRight', 1.25], ['MetaRight', 1.25], ['ContextMenu', 1.25], ['ControlRight', 1.25]],
];
const SPECIAL = {
  Backspace: '⌫', Tab: 'Tab', CapsLock: 'Bloq Mayús', Enter: 'Enter',
  ShiftLeft: 'Shift', ShiftRight: 'Shift', ControlLeft: 'Ctrl', ControlRight: 'Ctrl',
  MetaLeft: 'Win', MetaRight: 'Win', AltLeft: 'Alt', AltRight: 'AltGr', ContextMenu: 'Menú', Space: '',
};
const HOME_KEYS = ['KeyF', 'KeyJ'];
// Teclado numérico: [código, texto, columna, fila, columnas, filas].
const NUMPAD = [
  ['NumLock', 'Bloq Num', 1, 1], ['NumpadDivide', '/', 2, 1], ['NumpadMultiply', '*', 3, 1], ['NumpadSubtract', '-', 4, 1],
  ['Numpad7', '7', 1, 2], ['Numpad8', '8', 2, 2], ['Numpad9', '9', 3, 2], ['NumpadAdd', '+', 4, 2, 1, 2],
  ['Numpad4', '4', 1, 3], ['Numpad5', '5', 2, 3], ['Numpad6', '6', 3, 3],
  ['Numpad1', '1', 1, 4], ['Numpad2', '2', 2, 4], ['Numpad3', '3', 3, 4], ['NumpadEnter', 'Enter', 4, 4, 1, 2],
  ['Numpad0', '0', 1, 5, 2, 1], ['NumpadDecimal', '.', 3, 5],
];
const BROKEN_HTML = '<svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">' +
  '<polyline points="18,0 26,14 21,19 34,40"/><polyline points="62,0 57,11 68,22 61,40"/>' +
  '<polyline points="26,14 44,17 57,11"/><polyline points="68,22 86,26 100,21"/></svg>' +
  '<span>Teclado bloqueado… Sofía se está levantando</span>';

export function escapeHTML(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function fillKey(code, key) {
  if (code in SPECIAL) {
    key.textContent = SPECIAL[code];
    return;
  }
  const [capNormal, capShift] = Layout.keycap(code);
  const [normal = '', shift = '', altGr = ''] = Layout.labels(code);
  const isLetter = code.startsWith('Key');
  // Solo se resalta lo que cambia respecto a lo impreso.
  const outNormal = isLetter ? (normal === capNormal.toLowerCase() ? '' : normal) : (normal === capNormal ? '' : normal);
  const outShift = isLetter ? (shift === capNormal ? '' : shift) : (shift === capShift ? '' : shift);
  key.classList.toggle('letter', isLetter);
  key.innerHTML =
    `<span class="cap-shift">${escapeHTML(capShift)}</span>` +
    `<span class="cap-normal">${escapeHTML(capNormal)}</span>` +
    `<span class="out-shift">${escapeHTML(outShift)}</span>` +
    `<span class="out-normal">${escapeHTML(outNormal)}</span>` +
    `<span class="out-altgr">${escapeHTML(altGr)}</span>`;
}

// Dibuja filas de teclas en un contenedor y registra cada tecla en keys[code] (lista de copias).
// En el teclado completo las teclas crecen para llenar la fila; en las mitades miden su ancho real.
function buildRows(container, rows, keys, split) {
  container.innerHTML = '';
  container.classList.add('keyboard');
  for (const row of rows) {
    const rowEl = document.createElement('div');
    rowEl.className = 'kb-row';
    for (const entry of row) {
      const [code, width] = Array.isArray(entry) ? entry : [entry, 1];
      const key = document.createElement('div');
      const finger = fingerOf(code);
      key.className = 'kb-key' + (code in SPECIAL ? ' special' : '') + (HOME_KEYS.includes(code) ? ' home' : '') +
        (finger ? ' f-' + finger.finger : '');
      if (split) key.style.setProperty('--w', width);
      else key.style.flexGrow = width;
      key.dataset.code = code;
      fillKey(code, key);
      rowEl.appendChild(key);
      (keys[code] ||= []).push(key);
    }
    container.appendChild(rowEl);
  }
  const broken = document.createElement('div');
  broken.className = 'kb-broken';
  broken.innerHTML = BROKEN_HTML;
  container.appendChild(broken);
}

function buildNumpad(container, keys) {
  container.innerHTML = '';
  container.classList.add('keyboard', 'kb-numpad');
  const title = document.createElement('div');
  title.className = 'np-title';
  title.textContent = 'Teclado numérico';
  container.appendChild(title);
  for (const [code, label, col, row, cols = 1, rows = 1] of NUMPAD) {
    const key = document.createElement('div');
    key.className = 'kb-key' + (/^Num(Lock|padEnter)/.test(code) ? ' special' : '');
    key.style.gridColumn = `${col} / span ${cols}`;
    key.style.gridRow = `${row + 1} / span ${rows}`;
    key.dataset.code = code;
    key.textContent = label;
    container.appendChild(key);
    (keys[code] ||= []).push(key);
  }
}

// containers: { full, left, right, info, numpads }. info recibe la nota (códigos Alt) y la leyenda
// de colores; numpads, los lugares del teclado numérico (junto al completo y junto a la mitad derecha).
export function createKeyboard({ full, left, right, info, numpads = [] }) {
  const keys = {};
  const boards = [full, left, right, ...numpads];
  buildRows(full, ROWS, keys, false);
  buildRows(left, LEFT_ROWS, keys, true);
  buildRows(right, RIGHT_ROWS, keys, true);
  for (const np of numpads) buildNumpad(np, keys);
  numpads[0]?.classList.add('np-full');
  numpads[1]?.classList.add('np-side');
  full.classList.add('kb-full');
  left.classList.add('kb-side', 'left');
  right.classList.add('kb-side', 'right');

  info.innerHTML = '';
  const note = document.createElement('div');
  note.className = 'kb-note';
  info.appendChild(note);
  const legend = document.createElement('div');
  legend.className = 'kb-legend';
  legend.innerHTML =
    '<span class="cap">Gris</span>: lo impreso en tu tecla · ' +
    '<span class="out">Naranja</span>: lo que escribe en latino si es distinto (arriba con Shift) · ' +
    '<span class="alt">Azul</span>: con AltGr';
  info.appendChild(legend);

  const allKeys = () => Object.values(keys).flat();

  function clear() {
    for (const key of allKeys()) {
      key.classList.remove('hl', 'hl-alt');
      delete key.dataset.step;
    }
    note.textContent = '';
  }

  function mark(code, step, cls = 'hl') {
    for (const key of keys[code] || []) {
      key.classList.add(cls);
      if (step) key.dataset.step = key.dataset.step ? key.dataset.step + ',' + step : step;
    }
  }

  return {
    clear,

    // Resalta la combinación para escribir ch; las mayúsculas usan el Shift de la mano contraria.
    highlight(ch, { capsLock = false } = {}) {
      clear();
      const combo = Layout.comboFor(ch);
      if (!combo) return;
      if (combo.altCode) {
        // En el teclado solo Alt (los números de arriba no sirven para el código); los números se
        // marcan en orden (1, 2…) en el teclado numérico, si se ve.
        mark('AltLeft');
        Array.from(combo.altCode).forEach((d, i) => mark(`Numpad${d}`, String(i + 1)));
        note.textContent = `Mantén Alt izquierdo, teclea ${combo.altCode.split('').join(' ')} en el teclado numérico y suelta Alt`;
        return;
      }
      const multi = combo.steps.length > 1;
      combo.steps.forEach((s, i) => {
        const step = multi ? String(i + 1) : null;
        mark(s.code, step);
        if (s.shift && !capsLock) mark(oppositeShift(s.code), step);
        if (s.altGr) mark('AltRight', step);
      });
    },

    // Resaltado secundario (camino alternativo), en otro color.
    highlightAlt(codes) {
      for (const code of codes) mark(code, null, 'hl-alt');
    },

    highlightCodes(codes) {
      for (const code of codes) mark(code);
    },

    press(code) {
      for (const key of keys[code] || []) {
        key.classList.remove('pressed');
        void key.offsetWidth; // reinicia la animación
        key.classList.add('pressed');
      }
    },

    // Muestra el teclado numérico (si cabe en la pantalla) en los niveles con códigos Alt.
    showNumpad(on) {
      for (const np of numpads) np.classList.toggle('np-on', on);
    },

    showFingers(on) {
      for (const b of boards) b.classList.toggle('fingers', on);
    },

    setBroken(on) {
      for (const b of boards) b.classList.toggle('broken', on);
    },
  };
}
