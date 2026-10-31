// Navegación entre pantallas y conexión de la captura de teclado con cada modo.
(() => {
  const $ = id => document.getElementById(id);
  const SCREENS = ['menu', 'diagnostic', 'game', 'results'];
  const BEST_KEY = 'parkour.best.';
  const esc = KeyboardView.escapeHTML;
  let current = 'menu';
  let currentLevel = LEVELS[0];

  TypeInput.init();
  const diagKeyboard = KeyboardView.create($('diag-keyboard'));
  const gameKeyboard = KeyboardView.create($('game-keyboard'));

  function show(name) {
    for (const n of SCREENS) $('screen-' + n).hidden = n !== name;
    current = name;
    TypeInput.setActive(name === 'diagnostic' || name === 'game');
    if (name === 'menu') renderMenu();
  }

  function readBest(id) {
    try {
      return Number(localStorage.getItem(BEST_KEY + id)) || null;
    } catch {
      return null;
    }
  }

  function writeBest(id, ms) {
    try {
      localStorage.setItem(BEST_KEY + id, String(ms));
    } catch { /* sin almacenamiento */ }
  }

  // ---------- Menú ----------

  function renderMenu() {
    const best = readBest(currentLevel.id);
    $('menu-best').textContent = best ? `Mejor tiempo en "${currentLevel.name}": ${(best / 1000).toFixed(2)} s` : '';
    const n = Layout.learnedCount();
    $('menu-learned').textContent = n
      ? `Mapa de teclado aprendido: ${n} caracteres.`
      : 'Aún no haces el diagnóstico; las pistas usan el mapa latino por defecto.';
  }

  $('btn-play').onclick = () => startGame();
  $('btn-diagnostic').onclick = () => {
    diagKeyboard.refreshLabels();
    show('diagnostic');
  };

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
    show('game');
    Game.start($('game-canvas'), currentLevel, {
      onTarget: renderTarget,
      onFinish: showResults,
    });
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
    if (isRecord) writeBest(r.levelId, r.timeMs);
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
  });

  show('menu');
})();
