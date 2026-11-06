// Pantalla de carga del recuadro del juego: Sofía corre sobre la barra mientras se descarga el
// juego. El navegador no dice cuánto falta de un import(), así que la barra avanza por tiempo
// (cada vez más lento, sin llegar al final) y salta cuando de verdad termina cada parte.
import { PALETTES, runFrames } from '../art/kid.js';

const FRAME_MS = 90;
const TAU_MS = 2500; // a los 2.5 s la barra va en ~57 %

export function showLoader() {
  const game = document.getElementById('game');
  game.insertAdjacentHTML('beforeend', `
    <div class="loader" role="progressbar" aria-label="Cargando el juego" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <p class="loader-title">La Historia de Sofía</p>
      <div class="loader-track">
        <canvas class="loader-sofia" width="24" height="32"></canvas>
        <div class="loader-bar"><div class="loader-fill"></div></div>
      </div>
      <p class="loader-text">Cargando… 0 %</p>
      <button type="button" class="loader-retry" hidden>Volver a intentar</button>
    </div>`);
  const el = game.querySelector('.loader');
  const fill = el.querySelector('.loader-fill');
  const sofia = el.querySelector('.loader-sofia');
  const label = el.querySelector('.loader-text');
  const retry = el.querySelector('.loader-retry');
  retry.addEventListener('click', () => location.reload());

  let frames = [];
  try { frames = runFrames(PALETTES.sofia); } catch { sofia.hidden = true; }
  const ctx = sofia.getContext('2d');

  const start = performance.now();
  let floor = 0;      // lo mínimo que debe marcar (sube con cada parte que termina)
  let ceiling = 0.9;  // hasta dónde puede llegar adivinando
  let shown = 0;
  let stopped = false;

  function tick(now) {
    if (stopped) return;
    const guess = ceiling * (1 - Math.exp(-(now - start) / TAU_MS));
    const target = Math.max(floor, guess);
    shown += (target - shown) * 0.2;
    const pct = Math.round(shown * 100);
    fill.style.width = `${shown * 100}%`;
    sofia.style.left = `calc((100% - 72px) * ${shown})`; // Sofía corre sin salirse de la barra
    label.textContent = `Cargando… ${pct} %`;
    el.setAttribute('aria-valuenow', pct);
    if (frames.length) {
      ctx.clearRect(0, 0, 24, 32);
      ctx.drawImage(frames[Math.floor(now / FRAME_MS) % frames.length], 0, 0);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  return {
    // Ya llegó el código; falta dibujar el arte del juego.
    downloaded() {
      floor = 0.85;
      ceiling = 0.97;
    },
    // El título ya está en pantalla: la barra se llena y la pantalla de carga se desvanece.
    done() {
      floor = 1;
      ceiling = 1;
      setTimeout(() => {
        el.classList.add('leaving');
        setTimeout(() => { stopped = true; el.remove(); }, 350);
      }, 250);
    },
    failed() {
      stopped = true;
      label.textContent = 'No se pudo cargar el juego. Revisa tu conexión.';
      retry.hidden = false;
      el.classList.add('error');
    },
  };
}
