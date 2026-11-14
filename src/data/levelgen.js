// Generador de obstáculos: elige palabras y frases reales que solo usan las letras ya enseñadas
// y, en los niveles de práctica («solo d k»), combinaciones de esas letras. Siempre genera lo
// mismo para el mismo nivel (semilla fija), así los tiempos objetivo no cambian entre partidas.
//
// Todas las palabras evitan acentos (requieren tecla muerta) y las letras de la fila inferior,
// que todavía no se enseñan en estos capítulos.

import { rng } from './rng.js';

// Palabras y frases cortas. El generador filtra las que se pueden escribir en cada nivel.
const BANK = `
la las sal sala salas salsa salsas da das ja ala alas falda faldas falsa falsas jala jalas faja fajas
daña dañas añada añadas falla fallas salda saldas saña lasaña salada saladas jalada jaladas dañada
gafa gafas alga algas ha ah haga hagas hada hadas gala galas daga dagas saga sagas halla hallas llaga
llagas alhaja alhajas halaga halagas halagada hallada halladas gasa gasas gas
rasa ruda rudas sur dura duras durar jurar juras fuga fugas fugar hurra garra garras guarda guardas
guardar lugar jarra jarras raja rajar aguja agujas jaula jaulas suda sudar usar usa larga largas
sagrada jugar jugadas saludar saludas ladra ladrar grasa grasas rara raras hurgar jaguar jaguares
dile fiel fieles seguir sigue siga juega deja dejar deje desde aire aires leer ser el ella ellas
silla sillas girar gira giras llegar llega llegas llegue fuera sueles regla reglas duele hija hijas
hilera idea ideas dije fresa fresas rueda ruedas huida huir salir seda agua aguas ligera ligeras liga
ligas risa risas frase frases guerra sierra helada heladas sigues jefe jefes jefa esa ese es di
dejas salud rugir gris grises aullar huella huellas desea deseas seria serias real reales red redes
sed hielera
solo sola olor lodo oso osos ojo ojos hoja hojas lejos fuego juego juegos lago algo dolor dolores
rojo rojos gordo sordo rodar rodilla rodillas sudor hogar orgullo orgullosa hielo helado lado lados
seguro segura suelo duelo dueño sueño sueños lloro lloras llora llorar gorra gorras kilo kilos wifi
kiwi kiwis oro loro olas ola hola soledad
pared paredes pierde pies pie pelo pelea peleas pelear perder perro perros pesa peso pesos piso pisa
pila pura puro puede puedo puedes paso pasos paga pagar pago padre padres porque que quiero quieres
quiere queso quedo queda quedar queja quejas querida querido pequeña pequeño pequeños esperar espera
espero papel papeles parque parques
todo todos toda todas tata tu tus te ti tal tarde tarea tareas tesoro trepar salto saltos saltar
fuerte suerte puerta puertas gatos gato gata gatas pista pistas otra otro hoy ya yo ayer ayuda ayudar
playa rayo rayos joya joyas tuya suya leyes reyes deporte hasta patio fiesta tierra tejado triste
tristes estoy estas esta esto estar quieta quieto quita quitar pelota patada partida atleta atletas
ruta rutas tortilla tortillas tostada taquito taquitos torta tortas plata fruta frutas
`.trim().split(/\s+/);

const PHRASES = [
  'la sal', 'da sal', 'ja ja', 'ja ja ja', 'la sala', 'las alas', 'la daga', 'la gala', 'la falda',
  'las hadas', 'da la sal', 'a la sala', 'la gasa', 'las algas', 'la saga', 'la lasaña', 'las gafas',
  'da gas', 'a las', 'la garra', 'las jarras', 'a jugar', 'la jaula', 'sal a jugar', 'la aguja',
  'a sudar', 'el aire', 'la rueda', 'las ruedas', 'el agua', 'la silla', 'la seda', 'la fresa',
  'es la jefa', 'el jefe', 'de la sala', 'el lugar', 'la guerra', 'las reglas', 'ella sigue',
  'es fiel', 'la sierra', 'la idea', 'ella es', 'el oso', 'la hoja',
  'el juego', 'el dolor', 'los ojos', 'de oro', 'el lodo', 'el hogar', 'a solas', 'el parque', 'quiero ser', 'la pared', 'el perro', 'quiero jugar',
  'el paso', 'pierde la fe', 'lo que puedo', 'quedo sola', 'paso a paso', 'eres pequeña',
  'la pequeña', 'ella quiere', 'a toda prisa', 'quiero salir', 'eres fuerte', 'sigue tu ruta',
  'salta la reja', 'por la tata', 'quiero ser yo', 'los gatos', 'yo puedo',
  'estoy lista', 'la pista', 'salta ya', 'estoy sola', 'tus pasos', 'tus sueños', 'soy fuerte',
  'otra pelea', 'la puerta', 'la tarea', 'que sea hoy', 'hay que irse', 'salta y sigue',
  'hoy es hoy', 'sigue y sigue', 'ya es hora',
];

export const WORDS = [...new Set([...BANK, ...PHRASES])];

const fits = (w, set, maxLen) => Array.from(w).length <= maxLen && Array.from(w).every(ch => set.has(ch));

export function wordsFor(letters, maxLen) {
  const set = new Set(letters);
  return WORDS.filter(w => fits(w, set, maxLen));
}

// Combinación de teclas sin tres iguales seguidas (alterna las manos y los dedos). Si el espacio
// está permitido, a veces separa grupos («dk kd»), nunca al principio, al final ni doble.
export function drill(letters, len, rand) {
  const keys = letters.filter(ch => ch !== ' ');
  const space = letters.includes(' ');
  let s = '';
  for (let i = 0; i < len; i++) {
    if (space && i > 0 && i < len - 1 && s[i - 1] !== ' ' && rand() < 0.18) {
      s += ' ';
      continue;
    }
    let ch = keys[Math.floor(rand() * keys.length)];
    if (keys.length > 1 && i >= 2 && s[i - 1] === ch && s[i - 2] === ch) ch = keys.find(k => k !== ch);
    s += ch;
  }
  return s;
}

// Mayúsculas para los secretos: algunas palabras con inicial, otras completas, otras igual.
function withCaps(text, rand) {
  const r = rand();
  if (r < 0.4) return text.replace(/(^|\s)(\S)/g, (_, sp, ch) => sp + ch.toUpperCase());
  if (r < 0.6) return text.toUpperCase();
  return text;
}

// Largos a pedir: siempre hay obstáculos cortos (1-3 caracteres) para que el nivel tenga ritmo,
// algunos al máximo y el resto en medio.
export function lengthPlan(count, maxLen, rand) {
  const plan = [];
  const shortMax = Math.min(3, maxLen);
  const nShort = maxLen <= 3 ? count : Math.max(3, Math.round(count * 0.3));
  const nMax = maxLen <= 3 ? 0 : Math.max(2, Math.round(count * 0.2));
  for (let i = 0; i < nShort; i++) plan.push(1 + Math.floor(rand() * shortMax));
  for (let i = 0; i < nMax && plan.length < count; i++) plan.push(maxLen);
  const lo = Math.min(maxLen, Math.max(2, Math.ceil(maxLen / 2)));
  while (plan.length < count) plan.push(lo + Math.floor(rand() * (maxLen - lo + 1)));
  // mezcla conservando que el primero sea corto (para empezar tranquilo)
  for (let i = plan.length - 1; i > 1; i--) {
    const j = 1 + Math.floor(rand() * i);
    [plan[i], plan[j]] = [plan[j], plan[i]];
  }
  plan[0] = Math.min(plan[0], shortMax);
  return plan;
}

// spec: { letters, only?, maxLen, count, seed, focus?, caps? }
// letters: todo lo enseñado hasta ahora; only: el nivel es de práctica solo con esas teclas;
// focus: letras recién aprendidas que conviene repetir más.
export function buildObstacles({ letters, only, maxLen, count, seed, focus = '', caps = false }) {
  const rand = rng(seed);
  const keys = Array.from(only || letters);
  const pool = only ? [] : wordsFor(keys, maxLen);
  const focusSet = new Set(focus);
  const out = [];
  for (const len of lengthPlan(count, maxLen, rand)) {
    let text = null;
    if (pool.length) {
      // la palabra del largo pedido o la más cercana por debajo; prefiere las de letras nuevas
      for (let L = len; L >= 1 && !text; L--) {
        let options = pool.filter(w => Array.from(w).length === L && w !== out[out.length - 1]);
        const focused = options.filter(w => Array.from(w).some(ch => focusSet.has(ch)));
        if (focused.length && rand() < 0.65) options = focused;
        if (options.length) text = options[Math.floor(rand() * options.length)];
      }
    }
    // Sin palabras de ese largo (o nivel de práctica): combinación de las teclas.
    if (!text || (!only && Array.from(text).length < len - 2 && rand() < 0.5)) text = drill(keys, len, rand);
    if (caps) text = withCaps(text, rand);
    out.push(text);
  }
  return out;
}
