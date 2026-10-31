// Cada obstáculo: [texto a escribir, tipo]. Tipos: muro (bajo), hueco (en el suelo), pared (alta).
const LEVELS = [
  {
    id: 'simbolos-1',
    name: 'Ruta de los símbolos',
    items: [
      ['año', 'muro'],
      ['canción', 'muro'],
      ['¿listo?', 'hueco'],
      ['¡corre!', 'hueco'],
      ['pingüino', 'muro'],
      ['hola@mx', 'pared'],
      ['[1, 2]', 'muro'],
      ['{ x: 1 }', 'pared'],
      ['a | b', 'hueco'],
      ['#tag', 'muro'],
      ['C:\\dir', 'muro'],
      ['~/home', 'hueco'],
      ['<', 'pared'],
      ['>', 'pared'],
      ['a > b', 'hueco'],
      ['() => 1', 'pared'],
      ['<div>', 'pared'],
    ],
  },
];
