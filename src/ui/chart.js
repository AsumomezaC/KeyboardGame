// Gráfica del historial de un nivel: tiempo de cada carrera (más arriba = más rápido),
// con el límite del nivel como línea punteada. Funciona con 0, 1 o hasta 10 carreras.
import { escapeHTML } from './keyboard-view.js';

const W = 600, H = 210;
const PAD = { l: 46, r: 64, t: 18, b: 30 };
const STAR_COLORS = { 1: '#c98b45', 2: '#4f9fd1', 3: '#e8a400' };

const fmt = ms => (ms / 1000).toFixed(1);

export function renderChart(container, history, lines, title) {
  if (!history.length) {
    container.innerHTML = `<h3>${escapeHTML(title)}</h3><p class="muted">Aún no hay carreras en este nivel.</p>`;
    return;
  }
  const values = [...history.map(h => h.timeMs), ...lines.map(l => l.ms)];
  let yMin = Math.min(...values) * 0.92;
  let yMax = Math.max(...values) * 1.05;
  if (yMax - yMin < 2000) { yMin -= 1000; yMax += 1000; }
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const n = history.length;
  const x = i => (n === 1 ? PAD.l + plotW / 2 : PAD.l + (i * plotW) / (n - 1));
  const y = ms => PAD.t + ((ms - yMin) / (yMax - yMin)) * plotH;

  const parts = [];
  for (let k = 0; k <= 4; k++) {
    const ms = yMin + ((yMax - yMin) * k) / 4;
    parts.push(`<line class="grid" x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(ms)}" y2="${y(ms)}"/>`);
    parts.push(`<text class="axis" x="${PAD.l - 6}" y="${y(ms) + 4}" text-anchor="end">${fmt(ms)} s</text>`);
  }
  for (const l of lines) {
    parts.push(`<line class="goal" style="stroke:${l.color}" x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(l.ms)}" y2="${y(l.ms)}"/>`);
    parts.push(`<text class="goal-label" style="fill:${l.color}" x="${W - PAD.r + 6}" y="${y(l.ms) + 4}">${escapeHTML(l.label)}</text>`);
  }
  const passed = history.map((h, i) => ({ h, i })).filter(p => p.h.passed);
  if (passed.length > 1) {
    parts.push(`<polyline class="trend" points="${passed.map(p => `${x(p.i)},${y(p.h.timeMs)}`).join(' ')}"/>`);
  }
  history.forEach((h, i) => {
    const date = new Date(h.at).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    const earned = ['meta', h.speedStar && 'velocidad', h.accuracyStar && 'precisión'].filter(Boolean).join(', ');
    const detail = h.speedStar !== undefined ? ` (${earned})` : '';
    const tip = `${date} · ${fmt(h.timeMs)} s · ${Math.round(h.wpm)} PPM · ${(h.accuracy * 100).toFixed(0)} % · ` +
      (h.passed ? `${'★'.repeat(h.stars)}${detail}` : 'no superado');
    const cx = x(i), cy = y(h.timeMs);
    if (h.passed) {
      parts.push(`<g><title>${escapeHTML(tip)}</title><circle cx="${cx}" cy="${cy}" r="6" style="fill:${STAR_COLORS[h.stars] || STAR_COLORS[1]}"/>` +
        `<text class="pt-stars" x="${cx}" y="${cy - 10}" text-anchor="middle">${'★'.repeat(h.stars)}</text></g>`);
    } else {
      parts.push(`<g class="failed"><title>${escapeHTML(tip)}</title>` +
        `<line x1="${cx - 5}" y1="${cy - 5}" x2="${cx + 5}" y2="${cy + 5}"/><line x1="${cx - 5}" y1="${cy + 5}" x2="${cx + 5}" y2="${cy - 5}"/></g>`);
    }
    parts.push(`<text class="axis" x="${cx}" y="${H - 10}" text-anchor="middle">${i + 1}</text>`);
  });

  container.innerHTML =
    `<h3>${escapeHTML(title)}</h3>` +
    `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHTML(title)}">${parts.join('')}</svg>` +
    `<p class="chart-note">Tiempo por carrera, de la más antigua (1) a la más reciente. Más arriba es más rápido. ` +
    `<span class="x-mark">✕</span> = no superado.</p>`;
}
