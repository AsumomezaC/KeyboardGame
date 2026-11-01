// Música de 8 bits generada en el navegador con WebAudio: dos pulsos (melodía y armonía),
// un triángulo (bajo) y ruido (batería), como una consola portátil. No usa archivos de audio.
//
// Cada pista se escribe por compases de 16 pasos (semicorcheas). En las melodías cada paso es
// una nota («E5»), «-» para sostener la anterior o «.» para silencio.
import { TRACKS } from './tracks.js';

const KEY = 'parkourTecla.music';
const LOOKAHEAD_S = 0.15;
const MASTER = 0.16;

let ctx = null;
let master = null;
let noise = null;
let pulses = {};
let timer = 0;
let current = null;   // nombre de la pista sonando (o pedida antes de desbloquear el audio)
let state = null;     // { track, step, nextTime }
let muted = readMuted();

function readMuted() {
  try { return localStorage.getItem(KEY) === 'off'; } catch { return false; }
}

const NOTE_INDEX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export function midi(name) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`Nota inválida: ${name}`);
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return 12 * (Number(m[3]) + 1) + NOTE_INDEX[m[1]] + acc;
}

const freq = n => 440 * 2 ** ((n - 69) / 12);

// Convierte compases de texto en eventos { step, note, len }.
export function parseLine(bars) {
  const tokens = bars.join(' ').trim().split(/\s+/);
  const events = [];
  tokens.forEach((t, i) => {
    if (t === '-') {
      if (events.length && events[events.length - 1].end === i) {
        events[events.length - 1].len++;
        events[events.length - 1].end++;
      }
    } else if (t !== '.') {
      events.push({ step: i, note: midi(t), len: 1, end: i + 1 });
    }
  });
  return { events, length: tokens.length };
}

function pulseWave(duty) {
  const n = 32;
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let k = 1; k < n; k++) imag[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
  return ctx.createPeriodicWave(real, imag);
}

function setup() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : MASTER;
  master.connect(ctx.destination);
  pulses = { 12: pulseWave(0.125), 25: pulseWave(0.25), 50: pulseWave(0.5) };
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}

function tone(voice, note, t, dur) {
  const osc = ctx.createOscillator();
  if (voice.wave === 'triangle') osc.type = 'triangle';
  else osc.setPeriodicWave(pulses[voice.duty || 50]);
  osc.frequency.value = freq(note);
  const g = ctx.createGain();
  const v = voice.vol ?? 0.5;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + 0.005);
  g.gain.setValueAtTime(v * 0.75, t + Math.min(0.06, dur * 0.5));
  g.gain.linearRampToValueAtTime(0, t + dur);
  if (voice.vibrato && dur > 0.3) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 5.5;
    depth.gain.value = freq(note) * 0.012;
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(t + 0.15);
    lfo.stop(t + dur);
  }
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function drum(kind, t) {
  if (kind === 'k') {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + 0.15);
    return;
  }
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  const g = ctx.createGain();
  const dur = kind === 's' ? 0.12 : 0.03;
  filter.type = kind === 's' ? 'bandpass' : 'highpass';
  filter.frequency.value = kind === 's' ? 1800 : 7000;
  g.gain.setValueAtTime(kind === 's' ? 0.45 : 0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.01);
}

function schedule() {
  if (!state) return;
  const { track } = state;
  const stepDur = 60 / track.bpm / 4;
  while (state.nextTime < ctx.currentTime + LOOKAHEAD_S) {
    const s = state.step;
    for (const voice of track.voices) {
      for (const e of voice.byStep[s % voice.length] || []) tone(voice, e.note, state.nextTime, e.len * stepDur * 0.95);
    }
    if (track.drums) {
      const d = track.drums[s % track.drums.length];
      if (d !== '.') drum(d, state.nextTime);
    }
    state.step = (s + 1) % track.length;
    state.nextTime += stepDur;
  }
}

// Precalcula los eventos de cada voz agrupados por paso.
const compiled = {};
function compile(name) {
  if (compiled[name]) return compiled[name];
  const def = TRACKS[name];
  const voices = def.voices.map(v => {
    const { events, length } = parseLine(v.bars);
    const byStep = {};
    for (const e of events) (byStep[e.step] ||= []).push(e);
    return { ...v, byStep, length };
  });
  const drums = def.drums ? def.drums.join(' ').trim().split(/\s+/) : null;
  const length = Math.max(...voices.map(v => v.length), drums ? drums.length : 0);
  compiled[name] = { bpm: def.bpm, voices, drums, length };
  return compiled[name];
}

function start(name) {
  clearInterval(timer);
  state = null;
  if (!name || !TRACKS[name]) return;
  state = { track: compile(name), step: 0, nextTime: ctx.currentTime + 0.08 };
  timer = setInterval(schedule, 25);
  schedule();
}

export const Music = {
  // Los navegadores solo permiten sonido después de que la persona presiona algo.
  unlock() {
    if (!ctx) {
      try { setup(); } catch { return; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    if (current && !state) start(current);
  },

  play(name) {
    if (name === current && state) return;
    current = name;
    if (ctx && ctx.state !== 'closed') start(name);
  },

  stop() {
    current = null;
    clearInterval(timer);
    state = null;
  },

  get muted() {
    return muted;
  },

  toggleMute() {
    muted = !muted;
    try { localStorage.setItem(KEY, muted ? 'off' : 'on'); } catch { /* sin almacenamiento */ }
    if (master) master.gain.setTargetAtTime(muted ? 0 : MASTER, ctx.currentTime, 0.05);
    return muted;
  },
};
