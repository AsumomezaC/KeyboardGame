// Teclado físico ANSI (EE. UU.) dibujado en el DOM. Cada tecla muestra en gris lo que viene
// impreso en ella y, en color, lo que escribe la distribución latina cuando es distinto.
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
const SPECIAL = {
  Backspace: '⌫', Tab: 'Tab', CapsLock: 'Bloq Mayús', Enter: 'Enter',
  ShiftLeft: 'Shift', ShiftRight: 'Shift', ControlLeft: 'Ctrl', ControlRight: 'Ctrl',
  MetaLeft: 'Win', MetaRight: 'Win', AltLeft: 'Alt', AltRight: 'AltGr', ContextMenu: 'Menú', Space: '',
};
const HOME_KEYS = ['KeyF', 'KeyJ'];

export function escapeHTML(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

export function createKeyboard(container) {
  const keys = {};
  container.classList.add('keyboard');
  container.innerHTML = '';
  for (const row of ROWS) {
    const rowEl = document.createElement('div');
    rowEl.className = 'kb-row';
    for (const entry of row) {
      const [code, width] = Array.isArray(entry) ? entry : [entry, 1];
      const key = document.createElement('div');
      const finger = fingerOf(code);
      key.className = 'kb-key' + (code in SPECIAL ? ' special' : '') + (HOME_KEYS.includes(code) ? ' home' : '') +
        (finger ? ' f-' + finger.finger : '');
      key.style.flexGrow = width;
      key.dataset.code = code;
      rowEl.appendChild(key);
      keys[code] = key;
    }
    container.appendChild(rowEl);
  }
  const broken = document.createElement('div');
  broken.className = 'kb-broken';
  broken.innerHTML = '<svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">' +
    '<polyline points="18,0 26,14 21,19 34,40"/><polyline points="62,0 57,11 68,22 61,40"/>' +
    '<polyline points="26,14 44,17 57,11"/><polyline points="68,22 86,26 100,21"/></svg>' +
    '<span>Teclado bloqueado… Sofía se está levantando</span>';
  container.appendChild(broken);
  const note = document.createElement('div');
  note.className = 'kb-note';
  container.appendChild(note);
  const legend = document.createElement('div');
  legend.className = 'kb-legend';
  legend.innerHTML =
    '<span class="cap">Gris</span>: lo impreso en tu tecla · ' +
    '<span class="out">Naranja</span>: lo que escribe en latino si es distinto (arriba con Shift) · ' +
    '<span class="alt">Azul</span>: con AltGr';
  container.appendChild(legend);

  for (const [code, key] of Object.entries(keys)) {
    if (code in SPECIAL) {
      key.textContent = SPECIAL[code];
      continue;
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

  function clear() {
    for (const key of Object.values(keys)) {
      key.classList.remove('hl', 'hl-alt');
      delete key.dataset.step;
    }
    note.textContent = '';
  }

  function mark(code, step, cls = 'hl') {
    const key = keys[code];
    if (!key) return;
    key.classList.add(cls);
    if (step) key.dataset.step = key.dataset.step ? key.dataset.step + ',' + step : step;
  }

  return {
    clear,

    // Resalta la combinación para escribir ch; las mayúsculas usan el Shift de la mano contraria.
    highlight(ch, { capsLock = false } = {}) {
      clear();
      const combo = Layout.comboFor(ch);
      if (!combo) return;
      if (combo.altCode) {
        mark('AltLeft');
        note.textContent = `Alt + ${combo.altCode.split('').join(' ')} (teclado numérico)`;
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
      const key = keys[code];
      if (!key) return;
      key.classList.remove('pressed');
      void key.offsetWidth; // reinicia la animación
      key.classList.add('pressed');
    },

    showFingers(on) {
      container.classList.toggle('fingers', on);
    },

    setBroken(on) {
      container.classList.toggle('broken', on);
    },
  };
}
