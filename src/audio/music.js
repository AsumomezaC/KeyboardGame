// Música de 8 bits generada en el navegador con WebAudio: dos pulsos (melodía y armonía),
// un triángulo (bajo) y ruido (batería), como una consola portátil. No usa archivos de audio.
//
// Cada pista se escribe por compases de 16 pasos (semicorcheas). En las melodías cada paso es
// una nota («E5»), «-» para sostener la anterior o «.» para silencio.
import { TRACKS } from './tracks.js';

const KEY = 'parkourTecla.music';    // versión vieja: 'on' / 'off'
// Volúmenes de 0 a 1. El general multiplica a los otros dos (música y voces de los diálogos).
const VOLUME_KEYS = {
  general: 'parkourTecla.volume',
  music: 'parkourTecla.volume.music',
  voice: 'parkourTecla.volume.voice',
};
const LOOKAHEAD_S = 0.15;
const MASTER = 0.16;

let ctx = null;
let master = null;
let noise = null;
let pulses = {};
let timer = 0;
let current = null;   // nombre de la pista sonando (o pedida antes de desbloquear el audio)
let state = null;     // { track, step, nextTime }
let musicBus = null;   // pistas de música
let voiceBus = null;   // voces de los diálogos
const volumes = {
  general: readVolume('general', () => (localStorage.getItem(KEY) === 'off' ? 0 : 1)),
  music: readVolume('music'),
  voice: readVolume('voice'),
};
const volumeListeners = [];

function readVolume(channel, fallback = () => 1) {
  try {
    const saved = localStorage.getItem(VOLUME_KEYS[channel]);
    if (saved !== null && !Number.isNaN(Number(saved))) return Math.min(1, Math.max(0, Number(saved)));
    return fallback();
  } catch {
    return 1;
  }
}

// Volumen percibido: el oído escucha en escala logarítmica, así que se eleva al cuadrado.
const curve = v => v * v;
const gainOf = channel => (channel === 'general' ? MASTER : 1) * curve(volumes[channel]);
const busOf = channel => ({ general: master, music: musicBus, voice: voiceBus })[channel];

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
  master.gain.value = gainOf('general');
  master.connect(ctx.destination);
  musicBus = ctx.createGain();
  musicBus.gain.value = gainOf('music');
  musicBus.connect(master);
  voiceBus = ctx.createGain();
  voiceBus.gain.value = gainOf('voice');
  voiceBus.connect(master);
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
  osc.connect(g).connect(musicBus);
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
    osc.connect(g).connect(musicBus);
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
  src.connect(filter).connect(g).connect(musicBus);
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

// ---------- Voces de diálogo («balbuceo» como en Animal Crossing) ----------
// Cada letra que aparece en la caja suena como una sílaba corta: un pulso con el tono de la voz,
// un pequeño deslizamiento de tono y un filtro que le da color de vocal. El tono cambia un poco
// según la letra, así cada frase tiene su propia melodía.
const MOOD_VOICE = {
  angry: { semis: 1, vol: 1.3, len: 0.85 },
  shock: { semis: 3, vol: 1.1, len: 0.9 },
  sad: { semis: -2, vol: 0.8, len: 1.2 },
  cry: { semis: -1, vol: 0.85, len: 1.25, wobble: 9 },
  happy: { semis: 2, vol: 1, len: 0.95 },
  cheer: { semis: 3, vol: 1.15, len: 0.9 },
};
const VOWEL_FORMANT = { a: 1, e: 1.25, i: 1.5, o: 0.8, u: 0.65 };

function syllable(v, ch, mood) {
  const t = ctx.currentTime + 0.005;
  const m = MOOD_VOICE[mood] || {};
  const lower = ch.toLowerCase();
  if (v.growl) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 380;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(f).connect(g).connect(voiceBus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + 0.13);
    return;
  }
  // Tono por letra: ±4 semitonos (según la voz), estable para la misma letra.
  const code = lower.codePointAt(0);
  const semis = (((code * 7) % 9) - 4) * (v.range ?? 1) + (m.semis || 0);
  const f0 = v.pitch * 2 ** (semis / 12);
  const len = (v.len ?? 0.07) * (m.len || 1);
  const osc = ctx.createOscillator();
  if (v.wave === 'triangle') osc.type = 'triangle';
  else osc.setPeriodicWave(pulses[v.duty || 50]);
  osc.frequency.setValueAtTime(f0 * (v.slide ?? 1.06), t);
  osc.frequency.exponentialRampToValueAtTime(f0, t + len * 0.6);
  const wobble = v.wobble || m.wobble;
  if (wobble) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = wobble;
    depth.gain.value = f0 * 0.04;
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + len + 0.02);
  }
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = (v.formant ?? 1500) * (VOWEL_FORMANT[lower] || 1.1);
  filter.Q.value = 1.2;
  const g = ctx.createGain();
  const vol = (v.vol ?? 0.55) * (m.vol || 1);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.setValueAtTime(vol * 0.8, t + len * 0.5);
  g.gain.linearRampToValueAtTime(0, t + len);
  osc.connect(filter).connect(g).connect(voiceBus);
  osc.start(t);
  osc.stop(t + len + 0.02);
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

  // Volúmenes de 0 a 1 (se recuerdan entre partidas): { general, music, voice }.
  get volumes() {
    return { ...volumes };
  },

  setVolume(channel, v) {
    v = Math.round(Math.min(1, Math.max(0, v)) * 100) / 100;
    if (v === volumes[channel]) return v;
    volumes[channel] = v;
    try { localStorage.setItem(VOLUME_KEYS[channel], String(v)); } catch { /* sin almacenamiento */ }
    const bus = busOf(channel);
    if (bus) bus.gain.setTargetAtTime(gainOf(channel), ctx.currentTime, 0.05);
    for (const fn of volumeListeners) fn({ ...volumes });
    return v;
  },

  // Avisa cada cambio de volumen. Devuelve una función para dejar de escuchar.
  onVolumeChange(fn) {
    volumeListeners.push(fn);
    return () => {
      const i = volumeListeners.indexOf(fn);
      if (i >= 0) volumeListeners.splice(i, 1);
    };
  },

  // Una sílaba de voz para la letra ch. voice: { pitch, len, duty|wave, formant, range, slide,
  // wobble, vol, growl }. mood: gesto de quien habla (cambia tono, volumen y duración).
  voice(voice, ch, mood) {
    if (!ctx || ctx.state !== 'running' || !volumes.general || !volumes.voice || !voice || !/\p{L}/u.test(ch)) return;
    syllable(voice, ch, mood);
  },
};
