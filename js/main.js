// Navegación entre pantallas y conexión de la captura de teclado con cada modo.
(() => {
  const $ = id => document.getElementById(id);
  const SCREENS = ['menu', 'diagnostic', 'game', 'results'];
  const BEST_KEY = 'parkour.best.';
  const HISTORY_KEY = 'parkour.history';
  const HISTORY_SIZE = 10;
  const esc = KeyboardView.escapeHTML;
  let current = 'menu';
  let currentLevel = LEVELS[0];
  let capsOn = false;
  let tipTimer = 0;

  TypeInput.init();
  const diagKeyboard = KeyboardView.create($('diag-keyboard'));
  const gameKeyboard = KeyboardView.create($('game-keyboard'));

  function show(name) {
    for (const n of SCREENS) $('screen-' + n).hidden = n !== name;
    current = name;
    TypeInput.setActive(name === 'diagnostic' || name === 'game');
    updateCapsWarning();
    if (name === 'menu') renderMenu();
  }

  // ---------- Almacenamiento ----------

  function readJSON(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { /* sin almacenamiento: no se guarda */ }
  }

  const readBest = id => readJSON(BEST_KEY + id, null);
  const readHistory = () => readJSON(HISTORY_KEY, []);

  function addToHistory(r) {
    const history = readHistory();
    history.unshift({
      at: Date.now(),
      levelId: r.levelId,
      levelName: r.levelName,
      timeMs: r.timeMs,
      wpm: r.wpm,
      accuracy: r.accuracy,
      errors: r.errors,
    });
    writeJSON(HISTORY_KEY, history.slice(0, HISTORY_SIZE));
  }

  // Tabla de historial; compara cada partida con la anterior del mismo nivel.
  function renderHistory(tbody) {
    const history = readHistory();
    const trend = (now, before, lowerIsBetter) => {
      if (before == null || now === before) return '';
      const better = lowerIsBetter ? now < before : now > before;
      return better ? ' <span class="up">▲</span>' : ' <span class="down">▼</span>';
    };
    tbody.innerHTML = history
      .map((h, i) => {
        const prev = history.slice(i + 1).find(p => p.levelId === h.levelId);
        const date = new Date(h.at).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        return '<tr>' +
          `<td>${esc(date)}</td>` +
          `<td>${esc(h.levelName)}</td>` +
          `<td>${(h.timeMs / 1000).toFixed(2)} s${trend(h.timeMs, prev?.timeMs, true)}</td>` +
          `<td>${h.wpm.toFixed(0)}${trend(Math.round(h.wpm), prev && Math.round(prev.wpm), false)}</td>` +
          `<td>${(h.accuracy * 100).toFixed(1)} %${trend(h.accuracy, prev?.accuracy, false)}</td>` +
          `<td>${h.errors}</td>` +
          '</tr>';
      })
      .join('');
    return history.length;
  }

  // ---------- Menú ----------

  function renderMenu() {
    const list = $('level-list');
    list.innerHTML = '';
    LEVELS.forEach((level, i) => {
      const best = readBest(level.id);
      const card = document.createElement('button');
      card.className = 'level-card';
      card.innerHTML =
        `<span class="level-num">${i + 1}</span>` +
        `<strong>${esc(level.name)}</strong>` +
        `<span>${esc(level.description)}</span>` +
        `<span class="muted small">${best ? `Mejor tiempo: ${(best / 1000).toFixed(2)} s` : 'Sin jugar'}</span>`;
      card.onclick = () => {
        currentLevel = level;
        startGame();
      };
      list.appendChild(card);
    });
    const n = Layout.learnedCount();
    $('menu-learned').textContent = n
      ? `Mapa de teclado aprendido: ${n} caracteres.`
      : 'Aún no haces el diagnóstico; las pistas usan el mapa latino por defecto.';
    $('menu-history-wrap').hidden = renderHistory($('menu-history')) === 0;
  }

  $('btn-diagnostic').onclick = () => {
    diagKeyboard.refreshLabels();
    show('diagnostic');
  };

  // ---------- Bloq Mayús ----------

  function updateCapsWarning() {
    $('caps-warning').hidden = !(capsOn && (current === 'game' || current === 'diagnostic'));
  }

  // ---------- Diagnóstico ----------

  function diagKey(e) {
    if (e.key === 'Escape') return show('menu');
    diagKeyboard.press(e.code);
    const mods = [e.shiftKey && 'Shift', e.getModifierState('AltGraph') && 'AltGr', e.altKey && 'Alt', e.ctrlKey && 'Ctrl']
      .filter(Boolean).join('+');
    $('diag-last').textContent = `Última tecla → code: ${e.code}   key: ${JSON.stringify(e.key)}${mods ? '   mods: ' + mods : ''}`;
  }

  function diagChar(ch, strokes) {
    const combo = Layout.learn(ch, strokes);
    diagKeyboard.refreshLabels();
    diagKeyboard.highlight(ch);
    const row = document.createElement('tr');
    row.innerHTML =
      `<td class="mono big">${ch === ' ' ? '␣' : esc(ch)}</td>` +
      `<td>${esc(Layout.describeCombo(combo))}</td>` +
      `<td class="mono">${esc(strokes.map(s => s.code).join(', '))}</td>`;
    const log = $('diag-log');
    log.prepend(row);
    while (log.children.length > 40) log.lastChild.remove();
  }

  $('btn-diag-back').onclick = () => show('menu');
  $('btn-diag-reset').onclick = () => {
    Layout.reset();
    diagKeyboard.refreshLabels();
    diagKeyboard.clear();
    $('diag-log').innerHTML = '';
  };
  $('btn-diag-export').onclick = () => {
    const blob = new Blob([Layout.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mapa-teclado.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ---------- Juego ----------

  function startGame() {
    gameKeyboard.refreshLabels();
    setHandsGuide(true);
    showTip('');
    show('game');
    Game.start($('game-canvas'), currentLevel, {
      onStart: () => setHandsGuide(false),
      onTarget: renderTarget,
      onError: onGameError,
      onFinish: showResults,
    });
  }

  // Durante la cuenta regresiva se muestran las manos y el color de dedo de cada tecla.
  function setHandsGuide(on) {
    $('hands').hidden = !on;
    gameKeyboard.showFingers(on);
  }

  function renderTarget(t) {
    const line = $('target-line');
    if (!t) {
      line.innerHTML = '<span class="done">¡Corre a la meta!</span>';
      $('hint-text').textContent = '';
      gameKeyboard.clear();
      return;
    }
    line.innerHTML = t.chars
      .map((c, i) => {
        const cls = i < t.typed ? 'done' : i === t.typed ? 'current' : 'rest';
        return `<span class="${cls}">${c === ' ' ? '␣' : esc(c)}</span>`;
      })
      .join('');
    const next = t.chars[t.typed];
    gameKeyboard.highlight(next);
    $('hint-text').textContent = `Siguiente: ${next === ' ' ? 'espacio' : next}  —  ${Layout.describe(next)}`;
  }

  // Explica los errores de mayúscula/minúscula, que suelen venir de Shift o Bloq Mayús.
  function onGameError(expected, got) {
    if (got === expected || got.toLowerCase() !== expected.toLowerCase()) return;
    if (capsOn) {
      showTip('Salió en mayúscula porque Bloq Mayús está activo.');
      return;
    }
    const combo = Layout.comboFor(expected);
    const deadKey = combo && combo.steps && combo.steps.length > 1;
    showTip(deadKey
      ? `Salió "${got}": suelta Shift después de la primera tecla y antes de la segunda.`
      : `Salió "${got}": revisa Shift.`);
  }

  function showTip(text) {
    clearTimeout(tipTimer);
    $('game-tip').textContent = text;
    if (text) tipTimer = setTimeout(() => { $('game-tip').textContent = ''; }, 3500);
  }

  function gameKey(e) {
    if (e.key === 'Escape') {
      Game.stop();
      show('menu');
      return;
    }
    gameKeyboard.press(e.code);
  }

  // ---------- Resultados ----------

  function showResults(r) {
    const best = readBest(r.levelId);
    const isRecord = !best || r.timeMs < best;
    if (isRecord) writeJSON(BEST_KEY + r.levelId, r.timeMs);
    addToHistory(r);
    $('results-title').textContent = `¡Meta! — Nivel ${r.levelName}`;
    const stat = (label, value) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`;
    $('results-stats').innerHTML =
      stat('Tiempo', `${(r.timeMs / 1000).toFixed(2)} s${isRecord ? ' 🏆' : ''}`) +
      stat('Mejor', `${((isRecord ? r.timeMs : best) / 1000).toFixed(2)} s`) +
      stat('PPM', r.wpm.toFixed(0)) +
      stat('Precisión', `${(r.accuracy * 100).toFixed(1)} %`) +
      stat('Errores', r.errors) +
      stat('Mejor racha', r.bestCombo);
    $('results-weak').innerHTML = r.weak.length
      ? r.weak
          .map(([ch, n]) =>
            `<tr><td class="mono big">${ch === ' ' ? '␣' : esc(ch)}</td><td>${n}</td><td>${esc(Layout.describe(ch))}</td></tr>`)
          .join('')
      : '<tr><td colspan="3">Sin errores. ¡Recorrido perfecto!</td></tr>';
    renderHistory($('results-history'));
    show('results');
  }

  $('btn-retry').onclick = () => startGame();
  $('btn-menu').onclick = () => show('menu');
  document.addEventListener('keydown', e => {
    if (current === 'results' && e.key === 'Enter') {
      e.preventDefault();
      startGame();
    }
  });

  TypeInput.on({
    onKey: e => (current === 'diagnostic' ? diagKey(e) : current === 'game' ? gameKey(e) : null),
    onChar: (ch, strokes) => (current === 'diagnostic' ? diagChar(ch, strokes) : current === 'game' ? Game.onChar(ch) : null),
    onCaps: on => {
      capsOn = on;
      updateCapsWarning();
    },
  });

  show('menu');
})();
