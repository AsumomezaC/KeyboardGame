// Teclado físico ANSI (EE. UU.) dibujado en el DOM, rotulado con lo que produce
// la distribución latina. Sirve para las pistas del juego y para el diagnóstico.
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
        key.className = 'kb-key' + (code in SPECIAL ? ' special' : '');
        key.style.flexGrow = width;
        key.dataset.code = code;
        rowEl.appendChild(key);
        keys[code] = key;
      }
      container.appendChild(rowEl);
    }
    const note = document.createElement('div');
    note.className = 'kb-note';
    container.appendChild(note);

    function refreshLabels() {
      for (const [code, key] of Object.entries(keys)) {
        if (code in SPECIAL) {
          key.textContent = SPECIAL[code];
          continue;
        }
        const [normal = '', shift = '', altGr = ''] = Layout.labels(code);
        const show = c => (c === ' ' ? '' : c);
        // En las letras el rótulo físico y la mayúscula son obvios; solo se muestran si difieren.
        const us = Layout.usLegend(code);
        const isLetter = normal && normal.toUpperCase() === shift;
        key.innerHTML =
          `<span class="us">${escapeHTML(us.toLowerCase() === normal ? '' : us)}</span>` +
          `<span class="out">${escapeHTML(show(normal))}</span>` +
          `<span class="shift">${escapeHTML(isLetter ? '' : shift)}</span>` +
          `<span class="altgr">${escapeHTML(altGr)}</span>`;
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

    refreshLabels();
    return { refreshLabels, highlight, clear, press };
  }

  function escapeHTML(s) {
    return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  return { create, escapeHTML };
})();
