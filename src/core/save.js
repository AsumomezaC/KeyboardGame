// Progreso guardado en el navegador: estrellas por nivel y las últimas 10 carreras de cada uno.
const KEY = 'parkourTecla.save.v1';
const HISTORY_SIZE = 10;

let data = load();

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && d.levels && d.history) return d;
  } catch { /* sin almacenamiento o dato dañado */ }
  return { levels: {}, history: {} };
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* sin almacenamiento: el progreso dura solo esta sesión */ }
}

export const Save = {
  level(id) {
    return data.levels[id] || { stars: 0, passed: false, bestTimeMs: null };
  },

  // Del más antiguo al más reciente.
  history(id) {
    return data.history[id] || [];
  },

  record(id, run) {
    const prev = this.level(id);
    const next = {
      stars: Math.max(prev.stars, run.stars),
      passed: prev.passed || run.passed,
      bestTimeMs: run.passed && (prev.bestTimeMs == null || run.timeMs < prev.bestTimeMs) ? run.timeMs : prev.bestTimeMs,
    };
    data.levels[id] = next;
    data.history[id] = [...this.history(id), {
      at: Date.now(),
      timeMs: run.timeMs,
      wpm: run.wpm,
      accuracy: run.accuracy,
      falls: run.falls,
      stars: run.stars,
      passed: run.passed,
      failReason: run.failReason || null,
    }].slice(-HISTORY_SIZE);
    persist();
    return { prev, next };
  },
};
