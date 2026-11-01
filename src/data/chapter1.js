// Capítulo 1: solo la fila central (a s d f g h j k l ñ), en minúsculas.
// Una o dos letras nuevas por nivel hasta el 6 (el 3 combina las cuatro primeras); el 7 (perro)
// repasa palabras sin espacios y el espacio entra en el 8. Máximo 8 caracteres por obstáculo.
//
// ppm.pass: ritmo mínimo para no quedarse sin tiempo (null = no se puede perder por tiempo).
// ppm.fast: ritmo para la estrella de velocidad. Ambos son los del último nivel; los primeros
// niveles piden menos (ver effectivePpm en game/rules.js). windowPpm y react definen cuánto
// tiempo tienes para cada obstáculo antes de tropezar. Valores de primera calibración.

import { STORY1 } from './story1.js';

export const CHAPTER1 = {
  id: 'cap1',
  title: 'Capítulo 1',
  subtitle: 'Me llamo Sofía',
  story: STORY1,
  levels: [
    {
      id: 'c1-1', label: '1', kind: 'normal', theme: 'barrio', newKeys: ['f', 'j'],
      ppm: { pass: null, fast: 10 }, windowPpm: 6, react: 1.5,
      obstacles: ['f', 'j', 'ff', 'jj', 'f', 'fj', 'j', 'jf', 'fj', 'jj', 'jf', 'ff', 'f', 'j'],
    },
    {
      id: 'c1-2', label: '2', kind: 'normal', theme: 'barrio', newKeys: ['d', 'k'],
      ppm: { pass: null, fast: 11 }, windowPpm: 6.5, react: 1.45,
      obstacles: ['d', 'k', 'dd', 'kk', 'd', 'dk', 'k', 'kd', 'dk', 'kk', 'kd', 'dd', 'k', 'dkd', 'kdk', 'd'],
    },
    {
      id: 'c1-3', label: '3', kind: 'normal', theme: 'barrio', newKeys: [],
      ppm: { pass: null, fast: 12 }, windowPpm: 7, react: 1.4,
      obstacles: ['fd', 'jk', 'dk', 'kd', 'df', 'kj', 'fdk', 'jkd', 'dfj', 'kjd', 'fk', 'jd', 'dkf', 'kfd', 'dfjk', 'kjfd'],
    },
    {
      id: 'c1-4', label: '4', kind: 'normal', theme: 'barrio', newKeys: ['s', 'l'],
      ppm: { pass: 12, fast: 15 }, windowPpm: 8, react: 1.3,
      obstacles: ['s', 'l', 'sd', 'lk', 'sl', 'sdf', 'lkj', 'fsd', 'jlk', 'sdfj', 'lkjf', 'dssl', 'klls', 'fjsl', 'ls', 'sk'],
    },
    {
      id: 'c1-5', label: '5', kind: 'normal', theme: 'barrio', newKeys: ['a', 'ñ'],
      ppm: { pass: 14, fast: 18 }, windowPpm: 10, react: 1.2,
      obstacles: ['a', 'ñ', 'la', 'da', 'sal', 'ja', 'las', 'sala', 'alas', 'jala', 'faja', 'falda', 'salsa', 'dañas', 'añada', 'fallas', 'saldas', 'añadas'],
    },
    {
      id: 'c1-6', label: '6', kind: 'normal', theme: 'barrio', newKeys: ['g', 'h'],
      ppm: { pass: 16, fast: 20 }, windowPpm: 11, react: 1.1,
      obstacles: ['g', 'h', 'ha', 'ga', 'haga', 'hada', 'gala', 'daga', 'saga', 'halla', 'llaga', 'hadas', 'galas', 'alhaja', 'llagas', 'halagas', 'jaladas', 'halladas', 'halagada'],
    },
    {
      id: 'c1-7', label: '7', kind: 'dog', theme: 'prohibida', newKeys: [], requiresStars: 10, maxFalls: 3,
      ppm: { pass: null, fast: 22 }, windowPpm: 12, react: 1.0,
      obstacles: ['ah', 'las', 'dañas', 'hada', 'salsa', 'falla', 'halagas', 'sal', 'alhajas', 'daga', 'gala', 'jaladas', 'alas', 'haga', 'halladas', 'falda', 'llagas', 'añada'],
    },
    {
      id: 'c1-8', label: '8', kind: 'normal', theme: 'noche', newKeys: [' '],
      ppm: { pass: 18, fast: 23 }, windowPpm: 13, react: 1.0,
      obstacles: ['ah', 'gas', 'hada', 'ja ja', 'da sal', 'halla', 'la sala', 'la daga', 'salsa', 'la gala', 'las alas', 'la falda', 'alhaja', 'ja ja ja', 'la saga', 'da gas', 'la gasa', 'añadas'],
    },
    {
      id: 'c1-9', label: '9', kind: 'normal', theme: 'noche', newKeys: [],
      ppm: { pass: 21, fast: 26 }, windowPpm: 15, react: 0.9,
      obstacles: ['falsa', 'la sala', 'haga', 'dañadas', 'alas', 'falsas', 'saga', 'la gala', 'halla', 'jaladas', 'gas', 'las alas', 'hadas', 'alhaja', 'la saga', 'salsas', 'halladas', 'ja ja'],
    },
    {
      id: 'c1-10', label: '10', kind: 'race', theme: 'carrera', newKeys: [], requiresStars: 20, getupMs: 1700,
      ppm: { pass: 25, fast: 30 }, windowPpm: 17, react: 0.85,
      obstacles: ['la sala', 'halagada', 'falsas', 'las alas', 'dañadas', 'la falda', 'alhajas', 'salsas', 'ja ja ja', 'halladas', 'la daga', 'fallas', 'la gala', 'jaladas', 'llagadas', 'añadas', 'halagas', 'la gasa', 'saldadas', 'la saga'],
    },
  ],
  secret: {
    id: 'c1-s', label: '★', kind: 'secret', theme: 'mercado', newKeys: [], requiresStars: 30, allowCaps: true,
    ppm: { pass: 23, fast: 28 }, windowPpm: 16, react: 0.9,
    obstacles: ['Sala', 'SALSA', 'Hada', 'La Gala', 'JAJA', 'Falda', 'LAS ALAS', 'Daga', 'La Saga', 'HALLA', 'Añada', 'Gala', 'Alhaja', 'SAL', 'La Daga', 'FALLAS', 'Ja Ja', 'AÑADAS', 'HADAS', 'La Falda'],
  },
};

export const CHAPTERS = [
  { id: 'cap1', title: 'Capítulo 1', subtitle: CHAPTER1.subtitle, data: CHAPTER1 },
  { id: 'cap2', title: 'Capítulo 2', subtitle: null, data: null },
  { id: 'cap3', title: 'Capítulo 3', subtitle: null, data: null },
];

// Avance dentro del capítulo para la dificultad progresiva (ver game/rules.js):
// 0 en el nivel 1, 1 en el 10; el secreto ocurre entre el 8 y el 9.
CHAPTER1.levels.forEach((level, i, all) => { level.step = i / (all.length - 1); });
CHAPTER1.secret.step = 7.5 / 9;

export function levelName(level) {
  if (level.kind === 'secret') return 'Nivel secreto';
  return `Nivel ${level.label}`;
}

export function allLevels(chapter) {
  return [...chapter.levels, chapter.secret];
}
