// Niveles con caracteres de teclado numérico (< >, código Alt): en el calentamiento y en la carrera
//  · con «Cuento con teclado numérico» en sí: el teclado numérico se ve junto al teclado (si cabe) y
//    debajo del juego sale «¿No cuentas con teclado numérico?…» hasta que se escribe uno de esos
//    caracteres (entonces ya se sabe que sí hay; no vuelve a salir en esta visita).
//  · en no: el nivel ya viene sin esos caracteres (chapters.js) y debajo del juego se explica por qué.
// Si la opción cambia a medio nivel, la escena vuelve a empezar con el nivel ajustado.
import { Panel } from '../ui/panel.js';
import { Numpad, needsNumpad } from '../core/numpad.js';

const ASK = '¿No cuentas con teclado numérico? Cambia la configuración en el menú (tecla M) y este nivel se ajustará a tu configuración.';
const without = keys => `Las teclas ${keys.join(' ')} solo se pueden jugar con teclado numérico: este nivel no las usa (Configuración, tecla M).`;

// Devuelve typed(ch): llamarla con cada carácter bien escrito.
export function watchNumpad(scene, level) {
  const keys = level.numpadKeys;
  if (!keys) {
    Panel.setNumpadNote('');
    Panel.keyboard.showNumpad(false);
    return () => {};
  }
  const refresh = () => Panel.setNumpadNote(!Numpad.has ? without(keys) : Numpad.proven ? '' : ASK);
  Panel.keyboard.showNumpad(Numpad.has);
  refresh();
  const off = Numpad.onChange(() => scene.scene.restart());
  scene.events.once('shutdown', () => {
    off();
    Panel.setNumpadNote('');
    Panel.keyboard.showNumpad(false);
  });
  return ch => {
    if (!needsNumpad(ch) || Numpad.proven) return;
    Numpad.markProven();
    refresh();
  };
}
