// «Cuento con teclado numérico» (Configuración). Los caracteres con código Alt (< y >) solo se
// pueden escribir con el teclado numérico: Windows no acepta el código con los números de arriba.
// Sin teclado numérico, los niveles que los usan se ajustan solos (ver chapters.js) y no se enseñan.
// Se guarda en localStorage (parkourTecla.numpad); por omisión, sí.
import { comboFor } from './layout.js';

const KEY = 'parkourTecla.numpad';
const listeners = new Set();

function read() {
  try {
    return localStorage.getItem(KEY) !== 'no';
  } catch {
    return true;
  }
}

let has = read();
// En esta visita ya se escribió un carácter de teclado numérico: el aviso «¿No cuentas con teclado
// numérico?» ya no hace falta.
let proven = false;

export const Numpad = {
  get has() {
    return has;
  },

  set(on) {
    if (on === has) return;
    has = on;
    try {
      if (on) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, 'no');
    } catch { /* sin localStorage (pruebas, modo privado estricto): solo en memoria */ }
    for (const fn of listeners) fn(on);
  },

  // fn(on) al cambiar la opción; devuelve la función para dejar de escuchar.
  onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  get proven() {
    return proven;
  },

  markProven() {
    proven = true;
  },
};

// ¿Este carácter solo se escribe con el teclado numérico (código Alt)?
export function needsNumpad(ch) {
  return !!comboFor(ch)?.altCode;
}
