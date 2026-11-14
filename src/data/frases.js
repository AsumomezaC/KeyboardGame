// Generador de obstáculos largos (niveles en construcción): arma frases de hasta 40 caracteres
// juntando palabras y frases reales que solo usan lo ya enseñado: fila inferior, acentos, signos,
// números y símbolos. Igual que levelgen.js, siempre genera lo mismo para el mismo nivel.
//
// «§» es un número: se cambia por cifras que ya se aprendieron (p. ej. «§ pesos» → «47 pesos»).
// Las frases van en minúsculas; si el nivel ya enseñó mayúsculas, a veces empiezan con mayúscula
// y también salen nombres.

import { rng } from './rng.js';
import { WORDS, drill, lengthPlan } from './levelgen.js';

const NUM = '§';

const BANK = `
vamos ven vas voy va vez veo ver vida vivo viva vivir verde verdes viento vuelo volar vuelta vuelve
nuevo nueva nueve novia novio nave nieve mano manos mundo meta metas miedo mejor menos madre mucho
mucha muchos mira mirar mismo momento malo mala mar mesa mitad mente bien bueno buena barrio banco
bici boca bote botas brinco brincar brazo brazos bajo baja bajar barda baile bola noche nunca nada
nadie nombre nido nos uno una casa cama calle camino comer correr como cuando cuerpo cielo cinco
cien cerca claro clase coche color corre corro corres cuenta busca subo sube subir sombra mochila
voz paz luz cruz azul zona plaza taza pez zapato zapatos mezcla lazo zorro examen taxi texto mixto
sexto boxeo extra experto flexible zigzag
`.trim().split(/\s+/);

const PHRASES = [
  // fila inferior y coma (también cortas, para los niveles de 8 caracteres)
  'ya, ven', 'no, no', 'va, va', 'uno, dos', 'ven, ya', 'mira, ve', 'ven, ven',
  'vamos al barrio', 'corre, salta', 'ven conmigo', 'nunca te rindas', 'cada paso cuenta',
  'corre como el viento', 'el barrio duerme', 'nadie me para', 'bien, vamos', 'con todo', 'sin miedo',
  'a mi manera', 'el camino es largo', 'subo la barda', 'brinco el bote', 'ven, corre, brinca',
  'uno, dos, tres', 'mano a mano', 'cuerpo y mente', 'con calma, sin miedo', 'el banco del parque',
  'busca tu camino', 'mi barrio, mi casa', 'cada noche corro', 'la luna me mira', 'nubes negras',
  'como un rayo', 'mira bien', 'voy a ganar', 'vamos, vamos', 'nada me detiene', 'cuenta conmigo',
  'a la cuenta de tres', 'brinca y no mires abajo', 'un salto, dos saltos', 'el viento sopla',
  'mi sombra corre conmigo', 'la noche es larga', 'corre, corre, corre',
  // x . z -
  'voy a la plaza.', 'luz verde.', 'fin.', 'ya voy.', 'es la zona', 'tic-tac', 'toc-toc', 'ping-pong',
  'bla-bla-bla', 'zas-zas', 'pum-pum', 'el examen es hoy.', 'la taza azul', 'un taxi', 'corre en zigzag.',
  'texto corto.', 'paso a paso.', 'cruza la calle.', 'zapatos nuevos.', 'la cabeza en alto.', 'norte-sur',
  'este-oeste', 'la luz del barrio.', 'en la zona de juego.', 'boxeo y parkour.',
  // acentos
  'papá', 'mamá', 'está', 'más', 'café', 'también', 'sí', 'qué', 'cómo', 'aquí', 'allá', 'ahí', 'día',
  'río', 'tía', 'mío', 'tú', 'él', 'después', 'atrás', 'jamás', 'difícil', 'fácil', 'rápido', 'rápida',
  'último', 'música', 'público', 'número', 'corazón', 'canción', 'camión', 'campeón', 'razón', 'salió',
  'llegó', 'corrió', 'saltó', 'cayó', 'pasó', 'subió', 'bajó', 'ganó', 'más rápido', 'el último salto',
  'sí se puede', 'mamá no está', 'papá llegó tarde', 'qué día', 'mañana será otro día',
  'corazón de campeona', 'la música del barrio', 'no mires atrás', 'así se hace', 'aquí estoy',
  'fácil, muy fácil', 'nada es difícil', 'el número uno', 'salió el sol', 'corrió sin parar',
  'saltó la barda', 'después de la lluvia', 'también puedo', 'tú puedes', 'el camión pasó',
  'la última vuelta', 'más alto, más lejos', 'el público grita',
  // ¿? ¡!
  '¿qué?', '¿sí?', '¿y tú?', '¿quién?', '¿dónde?', '¿cómo?', '¿por qué?', '¿ya?', '¿qué pasó?',
  '¿dónde estás?', '¿cómo estás?', '¿vienes o no?', '¿ya llegaste?', '¿quién gana?', '¿lista para correr?',
  '¿cuánto falta?', '¿y si me caigo?', '¿me esperas?', '¡ya!', '¡corre!', '¡vamos!', '¡salta!',
  '¡qué miedo!', '¡lo logré!', '¡bravo!', '¡cuidado!', '¡más rápido!', '¡sí se puede!', '¡no te rindas!',
  '¡arriba!', '¡a la meta!', '¡qué salto!', '¿quién dijo que no podía?', '¡nadie me para!',
  // números
  NUM, `${NUM} pesos`, `${NUM} tacos`, `son ${NUM} pesos`, `a las ${NUM}`, `calle ${NUM}`, `nivel ${NUM}`,
  `${NUM} años`, `${NUM} vueltas`, `${NUM} metros`, `km ${NUM}`, `faltan ${NUM} metros`, `el número ${NUM}`,
  `en ${NUM} segundos`, `${NUM} saltos`, `salón ${NUM}`, `ruta ${NUM}`, `corre ${NUM} vueltas más`,
  `el camión ${NUM}`, `casa ${NUM}`, `${NUM} de ${NUM}`,
  // signos con Shift y números
  '"hola"', '"corre"', '"ya voy"', `#${NUM}`, `$${NUM}`, `${NUM} %`, 'tú & yo', `${NUM}/${NUM}`, 'sí/no',
  '(sí)', '(ya)', `(${NUM})`, `${NUM} = ${NUM}`, `x = ${NUM}`, `el #${NUM} del barrio`, `cuesta $${NUM}`,
  `al ${NUM} %`, '"¡corre!"', 'él dijo "ya"', '(con calma)', 'yo & mi sombra', `hoy (${NUM}/${NUM})`,
  // ; : _ ' + * { } [ ] ü
  'hola; adiós', 'corre; salta', 'nota: corre', `hora: ${NUM}`, `meta: ${NUM}`, 'lista: pan, agua',
  'mi_meta', `nivel_${NUM}`, "'sí'", "'ya'", "la 'jefa'", `${NUM} + ${NUM} = ${NUM}`, `${NUM} * ${NUM}`,
  '{ok}', `{${NUM}}`, `[${NUM}]`, '[ok]', '[nota]', 'pingüino', 'agüita', 'cigüeña', 'vergüenza',
  'güero', 'güera', 'bilingüe', 'pingüinos', 'qué vergüenza', 'la cigüeña vuela', `[a, b] + {c}`,
  // AltGr, | ° y < > (código Alt)
  'sofi@barrio.mx', 'meta@barrio.mx', '@gatos', 'c:\\juegos', 'a\\b', '~/casa', `~${NUM}`,
  `${NUM}^${NUM}`, '`ok`', '`x`', '¬a', '¬sí', 'a | b', 'sí | no', `${NUM} °C`, `${NUM}°`,
  `${NUM} < ${NUM}`, `${NUM} > ${NUM}`, '<hola>', '<b>', 'x > y', 'a < b',
];

// Nombres: solo cuando ya se enseñaron las mayúsculas.
const NAMES = [
  'Dani', 'Tata', 'Kevin', 'Yesi', 'Chuy', 'Brayan', 'Memo', 'Don Chema', 'Los Gatos', 'La Esperanza',
  'corre, Dani', 'vamos, Kevin', 'la Tata', 'con Dani', 'Sofía', 'Tomás', '¡vuela, Sofía!', '¡vamos, Sofía!',
];

const RICH = [...new Set([...WORDS, ...BANK, ...PHRASES])];
const chars = s => Array.from(s);
const isLetter = ch => ch.toLowerCase() !== ch.toUpperCase();

// ¿Se puede escribir? Los números solo si ya hay cifras; las mayúsculas solo si el nivel las usa.
function fits(item, set, digits, caps) {
  if (item.includes(NUM) && !digits.length) return false;
  return chars(item).every(ch => ch === NUM || set.has(ch) || (caps && set.has(ch.toLowerCase())));
}

function fillNumbers(item, digits, rand, most = 3) {
  return item.replace(/§/g, () => {
    const n = 1 + Math.floor(rand() * most);
    let s = '';
    for (let i = 0; i < n; i++) {
      const pool = i === 0 && n > 1 ? digits.filter(d => d !== '0') : digits;
      s += (pool.length ? pool : digits)[Math.floor(rand() * (pool.length || digits.length))];
    }
    return s;
  });
}

// A veces empieza con mayúscula (la primera letra, aunque vaya después de ¿ ¡ " o paréntesis).
function sentenceCase(text, rand) {
  if (rand() < 0.5) return text;
  const i = chars(text).findIndex(isLetter);
  if (i < 0) return text;
  const a = chars(text);
  a[i] = a[i].toUpperCase();
  return a.join('');
}

// Sube a mayúscula la primera vez que sale la letra (mejor si empieza una palabra).
function raise(text, cap) {
  if (text.includes(cap)) return text;
  const a = chars(text), low = cap.toLowerCase();
  let i = a.findIndex((ch, k) => ch === low && (k === 0 || !isLetter(a[k - 1])));
  if (i < 0) i = a.indexOf(low);
  if (i >= 0) a[i] = cap;
  return a.join('');
}

// spec: { letters, only?, maxLen, count, seed, focus?, caps? }. Igual que buildObstacles, pero arma
// frases largas y garantiza que cada tecla de focus salga al menos una vez.
export function buildRichObstacles({ letters, only, maxLen, count, seed, focus = '', caps = false }) {
  const rand = rng(seed);
  const set = new Set(letters);
  const digits = letters.filter(ch => /[0-9]/.test(ch));
  const plan = lengthPlan(count, maxLen, rand);
  if (only) return plan.map(len => drill(chars(only), len, rand));

  const pool = [...RICH, ...(caps ? NAMES : [])].filter(it => fits(it, set, digits, caps));
  // Una mayúscula de focus (lección de mayúsculas) se busca en minúscula y luego se sube.
  const upper = ch => caps && isLetter(ch) && ch !== ch.toLowerCase();
  const base = ch => (upper(ch) ? ch.toLowerCase() : ch);
  const need = chars(focus).filter(ch => ch !== ' ' && pool.some(it => it.includes(base(ch))));
  // first: la primera pieza del obstáculo, la única que prefiere las teclas de focus.
  const pick = (max, must, first) => {
    let options = pool.filter(it => chars(it).length <= max && (!must || it.includes(base(must))));
    if (!options.length) return must ? pick(max, null, first) : null;
    const near = options.filter(it => chars(it).length >= max - 6);
    const focused = options.filter(it => chars(it).some(ch => chars(focus).some(f => base(f) === ch)));
    if (first && focused.length && rand() < 0.55) options = focused;
    else if (near.length && rand() < 0.7) options = near;
    const it = options[Math.floor(rand() * options.length)];
    const text = fillNumbers(it, digits, rand);
    return chars(text).length <= max ? text : fillNumbers(it, digits, rand, 1);
  };

  const out = [];
  for (const len of plan) {
    const parts = [];
    let left = len;
    // primero, una tecla de focus que todavía no ha salido
    const must = need.find(ch => !out.some(t => t.includes(ch)));
    while (left >= 1) {
      const it = pick(left, parts.length ? null : must, !parts.length);
      if (!it || chars(it).length > left) break;
      parts.push(it);
      left -= chars(it).length + 1;
      if (left < 3) break;
    }
    let text = parts.join(' ');
    if (!text) text = drill(letters.filter(ch => /[a-zñ]/.test(ch)), len, rand);
    if (caps) text = sentenceCase(text, rand);
    if (must && upper(must)) text = raise(text, must);
    out.push(text);
  }
  return out;
}
