// Menú de Configuración (tecla M o el engrane de la barra de teclas): volúmenes y modo desarrollador.
//  · Volumen general, de la música y de los diálogos (el general multiplica a los otros dos).
//  · Modo desarrollador: pide confirmación (desbloquea todo con ★★★ en la partida guardada). Ya
//    activo, muestra sus opciones: jugar sin diálogos, solo cinemáticas y modo Dios.
// Es un panel HTML sobre el juego. Mientras está abierto, las teclas son suyas y no llegan a la escena:
// ↑ ↓ eligen opción, ← → ajustan (o prenden y apagan), Enter cambia, M o Esc cierran.
import { Music } from '../audio/music.js';
import { Dev, disableDev, setDevOption } from '../core/dev.js';
import { volumeSvg } from './volume-icon.js';
import { gearSvg } from './gear-icon.js';
import { showDevToast } from './music-toast.js';

const STEP = 0.1;
const DEV_URL = 'https://hello.adriancuevas.workers.dev/';

const VOLUMES = [
  { id: 'general', label: 'Volumen general', hint: 'Afecta a la música y a los diálogos.' },
  { id: 'music', label: 'Música' },
  { id: 'voice', label: 'Diálogos', hint: 'Las voces de los personajes al hablar.' },
];
const DEV_OPTIONS = [
  { id: 'noDialogues', label: 'Jugar sin diálogos', hint: 'Los niveles empiezan y terminan sin escenas.' },
  { id: 'cinematics', label: 'Solo cinemáticas', hint: 'Al entrar a un nivel solo ves sus escenas (también con Tab).' },
  { id: 'god', label: 'Modo Dios', hint: 'Al entrar a un nivel lo superas solo con ★★★.' },
];

let panel = null; // { close }

export function isSettingsOpen() {
  return !!panel;
}

// enableDev: activa el modo desarrollador en la escena actual (desbloquea todo y la redibuja).
// confirmDev: abrir directo en la advertencia del modo desarrollador (atajo «|»).
export function toggleSettings({ enableDev, confirmDev = false } = {}) {
  if (panel) panel.close();
  else open({ enableDev, confirmDev });
}

function open({ enableDev, confirmDev }) {
  const game = document.getElementById('game');
  if (!game) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'settings-backdrop';
  backdrop.innerHTML = `
    <div class="settings" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div class="settings-head">
        <span class="settings-gear">${gearSvg()}</span>
        <h2 id="settings-title">Configuración</h2>
        <button type="button" class="settings-close" aria-label="Cerrar">✕</button>
      </div>
      <div class="settings-body"></div>
      <p class="settings-more" hidden>▼ Desliza para ver más opciones</p>
      <p class="settings-desc" aria-live="polite"></p>
      <p class="settings-keys"></p>
      <p class="settings-dev-link">¿Te gustó “La Historia de Sofía”?
        <a href="${DEV_URL}" target="_blank" rel="noopener author">Conoce al desarrollador <span aria-hidden="true">→</span></a></p>
    </div>`;
  game.appendChild(backdrop);
  const body = backdrop.querySelector('.settings-body');
  const keysHint = backdrop.querySelector('.settings-keys');
  const desc = backdrop.querySelector('.settings-desc');
  // Si no cabe todo (ventanas angostas), un aviso debajo de las opciones dice que hay más abajo.
  const more = backdrop.querySelector('.settings-more');
  const updateMore = () => { more.hidden = body.scrollTop + body.clientHeight >= body.scrollHeight - 2; };
  body.addEventListener('scroll', updateMore);
  window.addEventListener('resize', updateMore);
  more.addEventListener('click', () => body.scrollBy({ top: body.clientHeight * 0.8, behavior: 'smooth' }));
  // «Conoce al desarrollador» (igual que en la página): también se elige con el teclado (Enter lo abre)
  const devLink = backdrop.querySelector('.settings-dev-link');
  const devAnchor = devLink.querySelector('a');

  let confirming = confirmDev && !Dev.enabled;
  let rows = [];  // [{ el, kind: 'volume' | 'toggle' | 'button', id, act }]
  let focus = 0;

  function build() {
    rows = [];
    body.innerHTML = '';
    devLink.classList.remove('focused');
    devLink.onpointermove = null;
    if (confirming) {
      body.innerHTML = `
        <div class="settings-warning" role="alert">
          <p><strong>⚠ Modo desarrollador</strong></p>
          <p>Este modo podría modificar la progresión con la que fue creado el juego: desbloquea todos los
          capítulos y niveles, incluidos los secretos, y los marca con ★★★ en tu partida guardada.
          Esto no se puede deshacer, salvo borrando los datos del sitio.</p>
        </div>
        <div class="settings-actions"></div>`;
      const actions = body.querySelector('.settings-actions');
      const mk = (label, act, cls) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `settings-btn ${cls}`;
        b.textContent = label;
        b.addEventListener('click', act);
        actions.appendChild(b);
        rows.push({ el: b, kind: 'button', act });
      };
      mk('Cancelar', () => { confirming = false; build(); focusRow(3); }, '');
      mk('Activar', () => {
        confirming = false;
        enableDev?.();
        build();
        focusRow(4);
      }, 'danger');
      keysHint.textContent = '← → elegir · Enter confirmar · Esc cancelar';
      focusRow(0);
      return;
    }

    for (const v of VOLUMES) {
      const row = document.createElement('div');
      row.className = 'settings-row';
      row.innerHTML = `
        <label for="vol-${v.id}"><span class="settings-icon"></span>${v.label}</label>
        <div class="settings-control">
          <input id="vol-${v.id}" class="volume-range" type="range" min="0" max="100" step="5">
          <output></output>
        </div>`;
      const input = row.querySelector('input');
      input.addEventListener('input', () => Music.setVolume(v.id, Number(input.value) / 100));
      addRow(row, { kind: 'volume', id: v.id, hint: v.hint || '' });
    }

    const sep = document.createElement('div');
    sep.className = 'settings-sep';
    body.appendChild(sep);
    addToggle('dev', 'Modo desarrollador', Dev.enabled
      ? 'Activo. Al apagarlo, tu progreso desbloqueado se queda.'
      : 'Para probar el juego: desbloquea todo.', Dev.enabled, () => {
      if (Dev.enabled) {
        disableDev();
        showDevToast('Modo desarrollador desactivado');
        build();
        focusRow(3);
      } else {
        confirming = true;
        build();
      }
    });
    if (Dev.enabled) {
      for (const o of DEV_OPTIONS) {
        addToggle(o.id, o.label, o.hint, Dev[o.id], () => {
          setDevOption(o.id, !Dev[o.id]);
          update();
        }, 'sub');
      }
    }
    keysHint.textContent = '↑ ↓ elegir · ← → ajustar · Enter cambiar · M o Esc cerrar';
    const linkIndex = rows.length;
    devLink.onpointermove = hoverRow(linkIndex);
    rows.push({ el: devLink, kind: 'link', hint: 'Abre su portafolio en otra pestaña.', act: () => devAnchor.click() });
    update();
  }

  function addRow(el, info) {
    body.appendChild(el);
    const i = rows.length;
    el.addEventListener('pointermove', hoverRow(i));
    rows.push({ el, ...info });
  }

  // Pasar el ratón por una opción la elige, pero solo si el ratón de verdad se movió: el panel puede
  // aparecer debajo de un cursor quieto (en ventanas angostas su pie, «Conoce al desarrollador»,
  // llegaba a quedar sobre el engrane con el que se abrió y se elegía solo).
  function hoverRow(i) {
    return e => {
      if ((e.movementX || e.movementY) && focus !== i) focusRow(i, false);
    };
  }

  function addToggle(id, label, hint, on, act, cls = '') {
    const row = document.createElement('div');
    row.className = `settings-row ${cls}`;
    row.innerHTML = `
      <span class="settings-label">${label}</span>
      <button type="button" class="settings-toggle" role="switch" aria-checked="${on}" aria-label="${label}">
        <span>${on ? 'Sí' : 'No'}</span>
      </button>`;
    row.querySelector('button').addEventListener('click', act);
    addRow(row, { kind: 'toggle', id, act, hint });
  }

  // Refleja el estado actual (volúmenes y opciones) sin volver a armar el panel.
  function update() {
    const vols = Music.volumes;
    for (const r of rows) {
      if (r.kind === 'volume') {
        const pct = Math.round(vols[r.id] * 100);
        const input = r.el.querySelector('input');
        if (document.activeElement !== input) input.value = String(pct);
        input.style.setProperty('--fill', `${pct}%`);
        r.el.querySelector('output').textContent = `${pct} %`;
        r.el.querySelector('.settings-icon').innerHTML = volumeSvg(r.id === 'general' ? vols.general : vols.general && vols[r.id]);
      } else if (r.kind === 'toggle' && r.id !== 'dev') {
        const on = !!Dev[r.id];
        const btn = r.el.querySelector('.settings-toggle');
        btn.setAttribute('aria-checked', String(on));
        btn.querySelector('span').textContent = on ? 'Sí' : 'No';
      }
    }
  }

  function focusRow(i, scroll = true) {
    focus = Math.max(0, Math.min(rows.length - 1, i));
    rows.forEach((r, k) => r.el.classList.toggle('focused', k === focus));
    // la explicación de la opción elegida va abajo, en una sola línea (así todo cabe sin desplazar)
    if (!confirming) desc.textContent = rows[focus]?.hint || '';
    desc.hidden = confirming;
    if (scroll) rows[focus]?.el.scrollIntoView({ block: 'nearest' });
    updateMore();
  }

  const stopListening = Music.onVolumeChange(update);

  // Las teclas no llegan a Phaser ni a la captura de tecleo mientras el panel está abierto.
  const onKey = e => {
    const k = e.key;
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(k)) return;
    e.preventDefault();
    e.stopPropagation();
    const r = rows[focus];
    if (confirming) {
      if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Tab') focusRow(focus ? 0 : 1);
      else if ((k === 'Enter' || k === ' ') && !e.repeat) r?.act();
      else if (k === 'Escape') rows[0].act();
      return;
    }
    if (k === 'ArrowUp') focusRow(focus - 1);
    else if (k === 'ArrowDown' || k === 'Tab') focusRow(focus + 1);
    else if (k === 'ArrowLeft' || k === 'ArrowRight') {
      const d = k === 'ArrowRight' ? 1 : -1;
      if (r.kind === 'volume') Music.setVolume(r.id, Music.volumes[r.id] + d * STEP);
      else if (r.kind === 'toggle') {
        const on = r.id === 'dev' ? Dev.enabled : !!Dev[r.id];
        if (on !== (d > 0)) r.act();
      }
    } else if ((k === 'Enter' || k === ' ') && !e.repeat) {
      if (r.kind === 'toggle' || r.kind === 'link') r.act();
    } else if (k === 'Home' && r.kind === 'volume') Music.setVolume(r.id, 0);
    else if (k === 'End' && r.kind === 'volume') Music.setVolume(r.id, 1);
    else if ((k === 'm' || k === 'M' || k === 'Escape') && !e.repeat) close();
  };
  const onKeyUp = e => e.stopPropagation();
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('keyup', onKeyUp, true);
  // Clic fuera de la caja o en ✕: se cierra.
  backdrop.addEventListener('pointerdown', e => { if (e.target === backdrop) close(); });
  backdrop.querySelector('.settings-close').addEventListener('click', close);

  function close() {
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('keyup', onKeyUp, true);
    window.removeEventListener('resize', updateMore);
    stopListening();
    backdrop.remove();
    panel = null;
  }

  panel = { close };
  build();
  focusRow(confirming ? 0 : 0);
}
