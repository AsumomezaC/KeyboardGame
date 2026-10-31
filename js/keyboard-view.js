// Teclado físico ANSI (EE. UU.) dibujado en el DOM. Cada tecla muestra en gris lo que viene
// impreso en ella y, en color, lo que escribe la distribución latina cuando es distinto.
// Sirve para las pistas del juego, el diagnóstico y el mapa de dedos.
const KeyboardView = (() => {
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
  // Dedo de mecanografía al tacto para cada tecla.
  const FINGERS = {
    pinky: ['Backquote', 'Digit1', 'Tab', 'KeyQ', 'CapsLock', 'KeyA', 'ShiftLeft', 'KeyZ', 'ControlLeft',
      'Digit0', 'Minus', 'Equal', 'Backspace', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash',
      'Semicolon', 'Quote', 'Enter', 'Slash', 'ShiftRight', 'ControlRight'],
    ring: ['Digit2', 'KeyW', 'KeyS', 'KeyX', 'Digit9', 'KeyO', 'KeyL', 'Period'],
    middle: ['Digit3', 'KeyE', 'KeyD', 'KeyC', 'Digit8', 'KeyI', 'KeyK', 'Comma'],
    index: ['Digit4', 'Digit5', 'KeyR', 'KeyT', 'KeyF', 'KeyG', 'KeyV', 'KeyB',
      'Digit6', 'Digit7', 'KeyY', 'KeyU', 'KeyH', 'KeyJ', 'KeyN', 'KeyM'],
    thumb: ['Space', 'AltLeft', 'AltRight'],
  };
  const HOME_KEYS = ['KeyF', 'KeyJ'];

  function create(container) {
    const keys = {};
    container.classList.add('keyboard');
    container.innerHTML = '';
    for (const row of ROWS) {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row';
      for (const entry of row) {
        const [code, width] = Array.isArray(entry) ? entry : [entry, 1];
        const key = document.createElement('div');
        key.className = 'kb-key' + (code in SPECIAL ? ' special' : '') + (HOME_KEYS.includes(code) ? ' home' : '');
        key.style.flexGrow = width;
        key.dataset.code = code;
        rowEl.appendChild(key);
        keys[code] = key;
      }
      container.appendChild(rowEl);
    }
    for (const [finger, codes] of Object.entries(FINGERS)) {
      for (const code of codes) if (keys[code]) keys[code].classList.add('f-' + finger);
    }
    const note = document.createElement('div');
    note.className = 'kb-note';
    container.appendChild(note);
    const legend = document.createElement('div');
    legend.className = 'kb-legend';
    legend.innerHTML =
      '<span class="cap">Gris</span>: lo impreso en tu tecla · ' +
      '<span class="out">Amarillo</span>: lo que escribe en latino si es distinto (arriba con Shift) · ' +
      '<span class="alt">Azul</span>: con AltGr';
    container.appendChild(legend);

    function refreshLabels() {
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
    }

    function clear() {
      for (const key of Object.values(keys)) {
        key.classList.remove('hl');
        delete key.dataset.step;
      }
      note.textContent = '';
    }

    function mark(code, step) {
      const key = keys[code];
      if (!key) return;
      key.classList.add('hl');
      if (step) key.dataset.step = key.dataset.step ? key.dataset.step + ',' + step : step;
    }

    function highlight(ch) {
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
        if (s.shift) mark('ShiftLeft', step);
        if (s.altGr) mark('AltRight', step);
      });
    }

    function press(code) {
      const key = keys[code];
      if (!key) return;
      key.classList.remove('pressed');
      void key.offsetWidth; // reinicia la animación
      key.classList.add('pressed');
    }

    function showFingers(on) {
      container.classList.toggle('fingers', on);
    }

    refreshLabels();
    return { refreshLabels, highlight, clear, press, showFingers };
  }

  function escapeHTML(s) {
    return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  return { create, escapeHTML };
})();
