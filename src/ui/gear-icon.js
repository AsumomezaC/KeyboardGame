// Engrane en pixel art (16×16) para el botón de Configuración: 4 dientes en los ejes, 4 en las
// diagonales y un hueco al centro. Lo usan las texturas del juego (canvas) y el panel HTML (SVG).
const ROWS = [
  '......####......',
  '..##..####..##..',
  '.###..####..###.',
  '..############..',
  '...##########...',
  '...##########...',
  '######....######',
  '######....######',
  '######....######',
  '######....######',
  '...##########...',
  '...##########...',
  '..############..',
  '.###..####..###.',
  '..##..####..##..',
  '......####......',
];

// Lista de pixeles [x, y] del engrane.
export const GEAR = ROWS.flatMap((row, y) => [...row].flatMap((c, x) => (c === '#' ? [[x, y]] : [])));

export function gearSvg(color = '#2b1d2e') {
  return `<svg viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges">${
    GEAR.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`).join('')}</svg>`;
}
