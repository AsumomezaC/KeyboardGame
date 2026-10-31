// Capítulo 1: solo la fila central (a s d f g h j k l ñ), en minúsculas.
// Dos letras nuevas por nivel hasta el 5; el espacio entra en el 6.
// Máximo 8 caracteres por obstáculo (espacios incluidos).
//
// ppm.pass: ritmo mínimo para no quedarse sin tiempo (null = no se puede perder por tiempo).
// ppm.two / ppm.three: ritmo para 2 y 3 estrellas. windowPpm y react definen cuánto
// tiempo tienes para cada obstáculo antes de tropezar. Valores de primera calibración.

export const CHAPTER1 = {
  id: 'cap1',
  title: 'Capítulo 1',
  subtitle: 'Sofía',
  levels: [
    {
      id: 'c1-1', label: '1', kind: 'normal', theme: 'barrio', newKeys: ['f', 'j'],
      ppm: { pass: null, two: 8, three: 12 }, windowPpm: 6, react: 1.5,
      obstacles: ['f', 'j', 'ff', 'jj', 'f', 'fj', 'j', 'jf', 'fj', 'jj', 'jf', 'ff', 'f', 'j'],
    },
    {
      id: 'c1-2', label: '2', kind: 'normal', theme: 'barrio', newKeys: ['d', 'k'],
      ppm: { pass: null, two: 10, three: 14 }, windowPpm: 7, react: 1.4,
      obstacles: ['d', 'k', 'fd', 'jk', 'dk', 'kd', 'fdk', 'jkd', 'df', 'kj', 'dfj', 'kjd', 'fk', 'jd', 'dkf', 'kfd'],
    },
    {
      id: 'c1-3', label: '3', kind: 'normal', theme: 'barrio', newKeys: ['s', 'l'],
      ppm: { pass: null, two: 12, three: 16 }, windowPpm: 8, react: 1.3,
      obstacles: ['s', 'l', 'sd', 'lk', 'sl', 'sdf', 'lkj', 'fsd', 'jlk', 'sdfj', 'lkjf', 'dssl', 'klls', 'fjsl', 'ls', 'sk'],
    },
    {
      id: 'c1-4', label: '4', kind: 'normal', theme: 'barrio', newKeys: ['a', 'ñ'],
      ppm: { pass: 14, two: 17, three: 21 }, windowPpm: 10, react: 1.2,
      obstacles: ['a', 'ñ', 'la', 'da', 'sal', 'ja', 'las', 'sala', 'alas', 'jala', 'faja', 'falda', 'salsa', 'dañas', 'añada', 'fallas', 'saldas', 'añadas'],
    },
    {
      id: 'c1-5', label: '5', kind: 'normal', theme: 'barrio', newKeys: ['g', 'h'],
      ppm: { pass: 16, two: 19, three: 23 }, windowPpm: 11, react: 1.1,
      obstacles: ['g', 'h', 'ha', 'ga', 'haga', 'hada', 'gala', 'daga', 'saga', 'halla', 'llaga', 'hadas', 'galas', 'alhaja', 'llagas', 'halagas', 'jaladas', 'halladas', 'halagada'],
    },
    {
      id: 'c1-6', label: '6', kind: 'normal', theme: 'barrio', newKeys: [' '],
      ppm: { pass: 18, two: 21, three: 25 }, windowPpm: 12, react: 1.0,
      obstacles: ['ah', 'gas', 'hada', 'ja ja', 'da sal', 'halla', 'la sala', 'la daga', 'salsa', 'la gala', 'las alas', 'la falda', 'alhaja', 'ja ja ja', 'la saga', 'da gas'],
    },
    {
      id: 'c1-7', label: '7', kind: 'dog', theme: 'prohibida', newKeys: [], requiresStars: 10, maxFalls: 3,
      ppm: { pass: null, two: 23, three: 27 }, windowPpm: 14, react: 0.9,
      obstacles: ['ah', 'las', 'dañas', 'hada', 'la sala', 'falla', 'halagas', 'sal', 'alhajas', 'la daga', 'gala', 'jaladas', 'las alas', 'daga', 'halladas', 'salsa', 'la falda', 'ja ja ja'],
    },
    {
      id: 'c1-8', label: '8', kind: 'normal', theme: 'noche', newKeys: [],
      ppm: { pass: 20, two: 23, three: 27 }, windowPpm: 15, react: 0.9,
      obstacles: ['gasa', 'la gasa', 'dañada', 'sala', 'halla', 'fallas', 'las alas', 'salsa', 'gasas', 'ja ja ja', 'alhajas', 'hadas', 'la falda', 'da gas', 'halagas', 'llagas', 'la daga', 'añadas'],
    },
    {
      id: 'c1-9', label: '9', kind: 'normal', theme: 'noche', newKeys: [],
      ppm: { pass: 22, two: 25, three: 29 }, windowPpm: 16, react: 0.85,
      obstacles: ['falsa', 'la sala', 'haga', 'dañadas', 'alas', 'falsas', 'saga', 'la gala', 'halla', 'jaladas', 'gas', 'las alas', 'hadas', 'alhaja', 'la saga', 'salsas', 'halladas', 'ja ja'],
    },
    {
      id: 'c1-10', label: '10', kind: 'race', theme: 'carrera', newKeys: [], requiresStars: 20, getupMs: 1700,
      ppm: { pass: 27, two: 30, three: 34 }, windowPpm: 18, react: 0.8,
      obstacles: ['la sala', 'halagada', 'falsas', 'las alas', 'dañadas', 'la falda', 'alhajas', 'salsas', 'ja ja ja', 'halladas', 'la daga', 'fallas', 'la gala', 'jaladas', 'llagadas', 'añadas', 'halagas', 'la gasa', 'saldadas', 'la saga'],
    },
  ],
  secret: {
    id: 'c1-s', label: '★', kind: 'secret', theme: 'mercado', newKeys: [], requiresStars: 30, allowCaps: true,
    ppm: { pass: 24, two: 27, three: 31 }, windowPpm: 16, react: 0.9,
    obstacles: ['Sala', 'SALSA', 'Hada', 'La Gala', 'JAJA', 'Falda', 'LAS ALAS', 'Daga', 'La Saga', 'HALLA', 'Añada', 'Gala', 'Alhaja', 'SAL', 'La Daga', 'FALLAS', 'Ja Ja', 'AÑADAS', 'HADAS', 'La Falda'],
  },
};

export const CHAPTERS = [
  { id: 'cap1', title: 'Capítulo 1', subtitle: 'Sofía', data: CHAPTER1 },
  { id: 'cap2', title: 'Capítulo 2', subtitle: null, data: null },
  { id: 'cap3', title: 'Capítulo 3', subtitle: null, data: null },
];

export function levelName(level) {
  if (level.kind === 'secret') return 'Nivel secreto';
  return `Nivel ${level.label}`;
}

export function allLevels(chapter) {
  return [...chapter.levels, chapter.secret];
}
