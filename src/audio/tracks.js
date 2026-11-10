// Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
// Pistas de 8 bits. Cada una: tempo, voces (melodía, arpegio, bajo) y batería, en compases de 16 pasos.
// La melodía se escribe a mano; arpegio y bajo se generan desde la progresión de acordes.
// Batería: k = bombo, s = tarola, h = platillo, . = nada.

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const noteName = m => `${NAMES[m % 12]}${Math.floor(m / 12) - 1}`;

function chordTones(chord, octave) {
  const [, letter, acc, minor] = /^([A-G])([#b]?)(m?)$/.exec(chord);
  const root = 12 * (octave + 1) + SEMI[letter] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0);
  return [root, root + (minor ? 3 : 4), root + 7];
}

// Patrones de bajo por compás: R raíz, F quinta, O octava.
const BASS = {
  drive: 'R . R . O . R . R . R . O . F .',
  walk: 'R - - - F - - - O - - - F - - -',
  long: 'R - - - - - - - - - - - F - - -',
  ostinato: 'R . R R . R . R R . R R . R . .',
};

function bass(chords, style, octave = 2) {
  return chords.map(ch => {
    const [r, , f] = chordTones(ch, octave);
    return BASS[style].split(' ').map(t => ({ R: noteName(r), F: noteName(f), O: noteName(r + 12) }[t] || t)).join(' ');
  });
}

// Arpegio: una nota del acorde cada `every` pasos siguiendo `pattern` (índices 0-2, 3 = raíz arriba).
function arp(chords, { octave = 4, pattern = [0, 1, 2, 1], every = 2 } = {}) {
  return chords.map(ch => {
    const t = chordTones(ch, octave);
    const tones = [...t, t[0] + 12];
    const out = [];
    for (let s = 0, k = 0; s < 16; s += every, k++) {
      out.push(noteName(tones[pattern[k % pattern.length]]));
      for (let i = 1; i < every; i++) out.push('-');
    }
    return out.join(' ');
  });
}

const lead = (bars, extra = {}) => ({ duty: 50, vol: 0.3, bars, ...extra });
const harmony = (bars, extra = {}) => ({ duty: 12, vol: 0.12, bars, ...extra });
const low = bars => ({ wave: 'triangle', vol: 0.5, bars });

function track(bpm, chords, melody, { bassStyle = 'drive', arpOpts, drums = null, leadOpts } = {}) {
  return {
    bpm,
    voices: [lead(melody, leadOpts), harmony(arp(chords, arpOpts)), low(bass(chords, bassStyle))],
    drums: drums ? [drums] : null,
  };
}

export const TRACKS = {
  // Pantalla de título: alegre y con ganas de correr.
  titulo: track(140, ['C', 'Am', 'F', 'G'], [
    'E5 - G5 - C6 - B5 - G5 - E5 - G5 - - -',
    'A5 - C6 - E6 - D6 - C6 - A5 - C6 - - -',
    'F5 - A5 - C6 - A5 - G5 - F5 - E5 - F5 -',
    'G5 - - - B5 - D6 - - - B5 - G5 - - -',
  ], { drums: 'k . h . s . h . k k h . s . h .' }),

  // Mapa y menús: tranquila.
  mapa: track(100, ['F', 'Dm', 'Bb', 'C'], [
    'A4 - - - C5 - - - F5 - - - E5 - C5 -',
    'D5 - - - F5 - - - A5 - - - G5 - F5 -',
    'D5 - - - F5 - - - Bb5 - - - A5 - G5 -',
    'E5 - - - G5 - - - C5 - - - - - - -',
  ], { bassStyle: 'walk', arpOpts: { every: 4 }, drums: 'k . . . h . . . s . . . h . . .', leadOpts: { duty: 25, vol: 0.26 } }),

  // Niveles normales.
  carrera: track(150, ['Am', 'F', 'C', 'G'], [
    'A4 . C5 . E5 . A5 . G5 . E5 . C5 . E5 .',
    'F5 . A5 . C6 . A5 . G5 . F5 . E5 . F5 .',
    'E5 . G5 . C6 . G5 . E5 . G5 . C6 . E6 .',
    'D6 - - . B5 - - . G5 . A5 . B5 . D6 .',
  ], { drums: 'k . h . s . h k k . h . s . h h', leadOpts: { duty: 25 } }),

  // Persecución del perro.
  perro: track(172, ['Em', 'F', 'Em', 'D'], [
    'E5 E5 . E5 . G5 . E5 F5 - E5 - D5 - B4 -',
    'F5 F5 . F5 . A5 . F5 G5 - F5 - E5 - C5 -',
    'E5 E5 . E5 . G5 . E5 F5 - E5 - D5 - B4 -',
    'D5 D5 . D5 . F#5 . A5 B5 - A5 - F#5 - D5 -',
  ], { arpOpts: { every: 1, pattern: [0, 2] }, drums: 'k . h k s . h . k . h k s . s s', leadOpts: { duty: 12, vol: 0.28 } }),

  // Carrera final.
  final: track(160, ['D', 'Bm', 'G', 'A'], [
    'D5 - F#5 - A5 - D6 - - - C#6 - D6 - A5 -',
    'B5 - - - F#5 - B5 - D6 - C#6 - B5 - F#5 -',
    'G5 - B5 - D6 - G6 - - - F#6 - E6 - D6 -',
    'C#6 - - - A5 - - - E6 - - - - - - -',
  ], { drums: 'k . h . s . h . k . h k s . h .' }),

  // Nivel secreto: a escondidas en el mercado.
  secreto: track(128, ['Cm', 'Ab', 'Bb', 'G'], [
    'C5 . . Eb5 . . G5 . F5 . Eb5 . D5 . . .',
    'C5 . . Eb5 . . Ab5 . G5 . F5 . Eb5 . . .',
    'D5 . . F5 . . Bb5 . Ab5 . G5 . F5 . . .',
    'B4 . . D5 . . G5 . F5 . D5 . B4 . . .',
  ], { drums: 'k . h . s . h h k . h . s . h .', leadOpts: { duty: 25 } }),

  // ---- Diálogos ----
  // Telenovela: violines imaginarios.
  drama: track(76, ['Am', 'Dm', 'E', 'Am'], [
    'E5 - - - - - - - D5 - C5 - B4 - C5 -',
    'D5 - - - - - - - F5 - E5 - D5 - C5 -',
    'B4 - - - G#4 - - - B4 - - - E5 - - -',
    'A4 - - - - - - - - - - - . . . .',
  ], { bassStyle: 'long', arpOpts: { every: 4, pattern: [0, 1, 2, 3] }, leadOpts: { duty: 25, vibrato: true } }),

  alegre: track(112, ['G', 'Em', 'C', 'D'], [
    'B4 - D5 - G5 - - - A5 - B5 - A5 - G5 -',
    'G5 - E5 - - - B4 - E5 - G5 - F#5 - E5 -',
    'E5 - G5 - C6 - - - B5 - A5 - G5 - E5 -',
    'F#5 - - - A5 - - - D5 - - - - - - -',
  ], { bassStyle: 'walk', drums: 'k . . . s . . . k . k . s . . .' }),

  tension: track(96, ['Dm', 'Bb', 'Gm', 'A'], [
    'D5 - - - . . . . F5 - E5 - D5 - - -',
    'D5 - - - . . . . F5 - G5 - F5 - - -',
    'Bb4 - - - . . . . D5 - Eb5 - D5 - - -',
    'C#5 - - - - - - - E5 - - - A4 - - -',
  ], { bassStyle: 'ostinato', arpOpts: { every: 4 }, drums: 'k . . . . . . . k . . . s . . .', leadOpts: { duty: 12 } }),

  // ---- Momentos clave de la historia ----
  // Nivel 1: Sofía descubre que correr la hace sentir viva.
  despertar: track(120, ['C', 'G', 'Am', 'F'], [
    'G4 - C5 - E5 - G5 - - - E5 - G5 - C6 -',
    'B5 - - - A5 - G5 - D5 - - - G5 - - -',
    'C6 - - - B5 - A5 - E5 - - - A5 - C6 -',
    'C6 - - - A5 - F5 - G5 - - - - - - -',
  ], { bassStyle: 'walk', drums: 'k . . . s . . . k . h . s . h .' }),

  // La primera fila vacía: cajita musical.
  ausencia: track(84, ['Am', 'F', 'C', 'E'], [
    'E6 - . A5 - . C6 - . E6 - . D6 - C6 -',
    'C6 - . F5 - . A5 - . C6 - . B5 - A5 -',
    'G5 - . C5 - . E5 - . G5 - . A5 - G5 -',
    'G#5 - - - B5 - - - E5 - - - . . . .',
  ], { bassStyle: 'long', arpOpts: { every: 4 }, leadOpts: { duty: 12, vol: 0.24 } }),

  // Los Gatos: calle, gorras al revés y azoteas.
  gatos: track(104, ['Em', 'C', 'D', 'B'], [
    'E5 . . E5 . G5 . . A5 . G5 . E5 . D5 .',
    'E5 . . E5 . G5 . . C6 . B5 . G5 . . .',
    'F#5 . . F#5 . A5 . . D6 . C6 . A5 . F#5 .',
    'D#5 - - - F#5 - - - B5 - A5 - F#5 - D#5 -',
  ], { bassStyle: 'ostinato', drums: 'k . h k s . h . k k h . s . h h', leadOpts: { duty: 25 } }),

  // Corazón roto: «¡LOS ODIO!», la pelea con Dani, el abandono.
  ruptura: track(70, ['Dm', 'Gm', 'Bb', 'A'], [
    'A5 - - - - - - - F5 - - - D5 - - -',
    'G5 - - - - - - - Bb5 - - - A5 - G5 -',
    'F5 - - - - - - - D5 - - - F5 - - -',
    'E5 - - - - - - - C#5 - - - - - - -',
  ], { bassStyle: 'long', arpOpts: { every: 4, pattern: [0, 1, 2, 3] }, leadOpts: { duty: 25, vibrato: true } }),

  // Algo gruñe en la niebla.
  peligro: track(92, ['Cm', 'Cm', 'Ab', 'G'], [
    'C5 . . . C#5 . . . C5 . . . . . G4 .',
    'C5 . . . C#5 . . . D5 . . . Eb5 . . .',
    'Eb5 . . . E5 . . . Eb5 . . . C5 . . .',
    'B4 - - - - - - - D5 - - - G5 - - -',
  ], { bassStyle: 'ostinato', arpOpts: { every: 1, pattern: [0, 1] }, drums: 'k . . . . . . . k . . . . . . .', leadOpts: { duty: 12, vol: 0.26 } }),

  // Sola y con hambre.
  soledad: track(66, ['Fm', 'Db', 'Bbm', 'C'], [
    'C5 - - - Ab4 - - - F4 - - - . . . .',
    'Db5 - - - Ab4 - - - F4 - - - . . . .',
    'Bb4 - - - Db5 - - - F5 - - - Eb5 - - -',
    'E5 - - - - - - - C5 - - - - - - -',
  ], { bassStyle: 'long', arpOpts: { every: 4 }, leadOpts: { duty: 25, vol: 0.24, vibrato: true } }),

  // El paraguas amarillo: Sofía y Dani hacen las paces.
  reencuentro: track(84, ['G', 'D', 'Em', 'C'], [
    'D5 - - - G5 - - - B5 - - - A5 - G5 -',
    'F#5 - - - A5 - - - D6 - - - C6 - B5 -',
    'B5 - - - - - - - G5 - A5 - B5 - - -',
    'C6 - - - B5 - - - A5 - - - G5 - - -',
  ], { bassStyle: 'walk', arpOpts: { every: 2, pattern: [0, 1, 2, 3, 2, 1] }, drums: 'k . . . . . . . s . . . . . . .', leadOpts: { duty: 25, vibrato: true } }),

  // Primer lugar.
  victoria: track(132, ['C', 'F', 'G', 'C'], [
    'C5 . C5 . C5 . G5 - - - - - E5 - G5 -',
    'A5 - - - F5 - A5 - C6 - - - A5 - - -',
    'B5 - - - G5 - B5 - D6 - - - B5 - D6 -',
    'C6 - - - - - - - G5 - E5 - C6 - - -',
  ], { drums: 'k . s . k . s . k k s . k . s s' }),

  // K-drama: el primer amor.
  amor: track(90, ['F', 'Am', 'Bb', 'C'], [
    'C5 - - - F5 - - - A5 - - - G5 - F5 -',
    'E5 - - - - - - - A4 - C5 - E5 - - -',
    'D5 - - - F5 - - - Bb5 - - - A5 - G5 -',
    'G5 - - - - - - - E5 - - - C5 - - -',
  ], { bassStyle: 'long', arpOpts: { every: 2, pattern: [0, 1, 2, 3, 2, 1] }, leadOpts: { duty: 25, vibrato: true } }),
};
