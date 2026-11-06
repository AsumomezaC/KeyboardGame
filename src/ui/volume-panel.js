// Selector de volumen de la música: se abre con la tecla M o con un clic en el ícono de música.
// Es un panel HTML sobre el juego con una barra deslizante de 0 a 100 %. Mientras está abierto,
// las teclas son suyas (← → o ↑ ↓ ajustan; M, Enter o Esc lo cierran) y no llegan a la escena.
import { Music } from '../audio/music.js';
import { volumeSvg } from './volume-icon.js';

const GAME_W = 960;
const GAME_H = 540;
const STEP = 0.1;

let panel = null; // { el, close }
let closedAt = 0;  // un clic en el ícono cierra el panel: que ese mismo clic no lo vuelva a abrir

export function isVolumePanelOpen() {
  return !!panel;
}

// anchor: centro del botón en coordenadas del juego (960×540). El panel sale arriba del botón
// si está en la mitad de abajo, o debajo si está en la mitad de arriba.
export function toggleVolumePanel(anchor = { x: GAME_W - 80, y: GAME_H - 20 }) {
  if (panel) panel.close();
  else if (performance.now() - closedAt > 300) open(anchor);
}

function open(anchor) {
  const game = document.getElementById('game');
  if (!game) return;
  const el = document.createElement('div');
  el.className = 'volume-panel';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Volumen de la música');
  el.innerHTML = `
    <div class="volume-head"><span class="volume-icon"></span><span class="volume-value"></span></div>
    <input class="volume-range" type="range" min="0" max="100" step="5" aria-label="Volumen de la música">
    <p class="volume-hint">← → ajustar · M cerrar</p>`;
  const below = anchor.y < GAME_H / 2;
  el.style.left = `${Math.min(88, Math.max(12, (anchor.x / GAME_W) * 100))}%`;
  if (below) el.style.top = `calc(${(anchor.y / GAME_H) * 100}% + 26px)`;
  else el.style.bottom = `calc(${100 - (anchor.y / GAME_H) * 100}% + 26px)`;
  game.appendChild(el);

  const range = el.querySelector('.volume-range');
  const icon = el.querySelector('.volume-icon');
  const value = el.querySelector('.volume-value');
  const render = v => {
    const pct = Math.round(v * 100);
    range.value = String(pct);
    range.style.setProperty('--fill', `${pct}%`);
    icon.innerHTML = volumeSvg(v);
    value.textContent = pct ? `Música ${pct} %` : 'Música en silencio';
  };
  render(Music.volume);
  const stopListening = Music.onVolumeChange(render);
  range.addEventListener('input', () => Music.setVolume(Number(range.value) / 100));

  // Las teclas no llegan a Phaser ni a la captura de tecleo mientras el panel está abierto.
  const onKey = e => {
    const k = e.key;
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(k)) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.repeat && !k.startsWith('Arrow')) return;
    if (k === 'ArrowRight' || k === 'ArrowUp') Music.setVolume(Music.volume + STEP);
    else if (k === 'ArrowLeft' || k === 'ArrowDown') Music.setVolume(Music.volume - STEP);
    else if (k === 'Home') Music.setVolume(0);
    else if (k === 'End') Music.setVolume(1);
    else if (k === 'm' || k === 'M' || k === 'Escape' || k === 'Enter' || k === ' ') close();
  };
  const onKeyUp = e => e.stopPropagation();
  // Clic fuera del panel: se cierra (el clic que lo abrió ya pasó).
  const onDown = e => {
    if (el.contains(e.target)) return;
    close();
    closedAt = performance.now();
  };
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('keyup', onKeyUp, true);
  const t = setTimeout(() => document.addEventListener('pointerdown', onDown, true), 0);

  function close() {
    clearTimeout(t);
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('keyup', onKeyUp, true);
    document.removeEventListener('pointerdown', onDown, true);
    stopListening();
    el.remove();
    panel = null;
  }
  panel = { el, close };
}
