// Panel HTML bajo el canvas: texto a escribir, pistas, manos, teclado, fichas de nivel y gráficas.
import { createKeyboard, escapeHTML } from './keyboard-view.js';
import { createHands } from './hands.js';
import { renderChart } from './chart.js';

const $ = id => document.getElementById(id);
let tipTimer = 0;
let capsContext = false;
let capsOn = false;

const root = $('panel');
root.innerHTML = `
  <section class="pv" data-view="play" hidden>
    <div class="play-grid">
      <div id="kb-left"></div>
      <div class="play-center">
        <div class="box play-box">
          <div id="target-line" class="target"></div>
          <div id="hint" class="hint"></div>
          <div id="hint-alt" class="hint alt"></div>
          <div id="tip" class="tip"></div>
        </div>
        <div id="hands-wrap" class="hands-wrap" hidden></div>
      </div>
      <div id="kb-right"></div>
    </div>
    <div id="kb-wrap"></div>
    <div id="kb-info"></div>
  </section>
  <section class="pv" data-view="info" hidden>
    <div class="box" id="info-box"></div>
    <div class="box" id="info-chart"></div>
  </section>
  <section class="pv" data-view="results" hidden>
    <div class="box" id="res-chart"></div>
    <div class="box" id="res-weak"></div>
  </section>`;

const keyboard = createKeyboard({ full: $('kb-wrap'), left: $('kb-left'), right: $('kb-right'), info: $('kb-info') });
const hands = createHands($('hands-wrap'));

function updateCaps() {
  $('caps-warning').classList.toggle('on', capsContext && capsOn);
}

export const Panel = {
  keyboard,
  hands,

  show(view) {
    for (const s of root.querySelectorAll('.pv')) s.hidden = s.dataset.view !== view;
  },

  // El aviso de Bloq Mayús solo aplica mientras se escribe; su espacio siempre está reservado.
  setCapsContext(on) {
    capsContext = on;
    updateCaps();
  },

  setCapsState(on) {
    capsOn = on;
    updateCaps();
  },

  // Sin caracteres muestra un aviso en lugar del texto a escribir.
  setTarget(chars, typed, message = '¡Corre a la meta!') {
    if (!chars) {
      $('target-line').innerHTML = `<span class="done">${escapeHTML(message)}</span>`;
      return;
    }
    $('target-line').innerHTML = chars
      .map((c, i) => {
        const cls = i < typed ? 'done' : i === typed ? 'current' : 'rest';
        return `<span class="${cls}">${c === ' ' ? '␣' : escapeHTML(c)}</span>`;
      })
      .join('');
  },

  setHints(main, alt = '') {
    $('hint').textContent = main;
    $('hint-alt').textContent = alt;
  },

  setTip(text, ms = 3500) {
    clearTimeout(tipTimer);
    $('tip').textContent = text;
    if (text && ms) tipTimer = setTimeout(() => { $('tip').textContent = ''; }, ms);
  },

  showHands(on, fingers = []) {
    $('hands-wrap').hidden = !on;
    hands.highlight(fingers);
  },

  setBroken(on) {
    keyboard.setBroken(on);
  },

  setInfo(html, history, lines, title) {
    $('info-box').innerHTML = html;
    renderChart($('info-chart'), history, lines, title);
  },

  setResults(history, lines, title, weakHtml) {
    renderChart($('res-chart'), history, lines, title);
    $('res-weak').innerHTML = weakHtml;
  },
};
