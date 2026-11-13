// El juego necesita un teclado físico: el de la pantalla no sirve (no muestra todas las teclas y
// tapa el juego). En celulares y tablets no se carga de inmediato: aparece un aviso amable, con un
// botón para copiar o compartir el enlace, y el juego arranca en cuanto se presiona una tecla de un
// teclado físico conectado (Bluetooth o USB).

// El navegador no dice si hay un teclado conectado. Lo que sí sabe es si el puntero principal es
// táctil: ahí se pide el teclado. Las computadoras (y las tablets con ratón o trackpad, que casi
// siempre traen teclado) juegan directo.
export function needsKeyboardCheck() {
  try {
    return window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(any-pointer: fine)').matches;
  } catch {
    return false;
  }
}

// Una tecla llegó de un teclado físico. Mientras el aviso está en pantalla no hay ningún campo de
// texto activo, así que el teclado de la pantalla ni siquiera se abre; y si llegara a mandar algo,
// llega como «Unidentified» o «Process» (código 229).
function isPhysicalKey(e) {
  return e.isTrusted && e.keyCode !== 229 && e.key && e.key !== 'Unidentified' && e.key !== 'Process';
}

// Laptop y tablet con teclado en pixel art.
const ICON = `<svg viewBox="0 0 32 16" aria-hidden="true" shape-rendering="crispEdges">
  <rect x="1" y="2" width="16" height="10" fill="#2b1d2e"/><rect x="2" y="3" width="14" height="8" fill="#8ecae6"/>
  <rect x="5" y="6" width="2" height="4" fill="#e94f64"/><rect x="5" y="4" width="2" height="2" fill="#f2c29b"/>
  <rect x="9" y="8" width="6" height="2" fill="#fff7e0"/>
  <rect x="0" y="12" width="18" height="2" fill="#c9a66b"/>
  <rect x="21" y="3" width="10" height="12" fill="#2b1d2e"/><rect x="22" y="4" width="8" height="9" fill="#fff7e0"/>
  <rect x="23" y="6" width="6" height="1" fill="#e94f64"/><rect x="23" y="8" width="4" height="1" fill="#e94f64"/>
  <rect x="25" y="13" width="2" height="1" fill="#c9a66b"/>
</svg>`;

// onKeyboard: se llama una sola vez, cuando llega la primera tecla física (el aviso ya se quitó).
export function showKeyboardNotice(onKeyboard) {
  document.body.classList.add('no-keyboard');
  const game = document.getElementById('game');
  game.insertAdjacentHTML('beforeend', `
    <div class="keyboard-notice" role="status">
      ${ICON}
      <h2>Este juego necesita un teclado físico</h2>
      <p>Sofía corre cuando escribes, y para eso necesitas un teclado de verdad: el de la pantalla no sirve.</p>
      <p class="keyboard-ready">No se detectó un teclado físico. ¿Sí tienes uno?
        <strong>Presiona cualquier tecla</strong> para comenzar a jugar.</p>
      <button type="button" class="keyboard-share">Copiar enlace para después</button>
      <p class="keyboard-done" hidden>¡Listo! Ábrelo en tu computadora o en un dispositivo con teclado físico.</p>
    </div>`);
  const notice = game.querySelector('.keyboard-notice');
  const btn = notice.querySelector('.keyboard-share');
  const done = notice.querySelector('.keyboard-done');
  const url = 'https://teclea-con-sofia.vercel.app/';
  if (navigator.share) btn.textContent = 'Compartir enlace para después';
  btn.addEventListener('click', async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'La Historia de Sofía', text: 'Juego de mecanografía para jugar con teclado físico', url });
      else await navigator.clipboard.writeText(url);
      done.hidden = false;
    } catch { /* la persona canceló o el navegador no lo permite */ }
  });

  const onKey = e => {
    if (!isPhysicalKey(e)) return;
    window.removeEventListener('keydown', onKey, true);
    notice.remove();
    document.body.classList.remove('no-keyboard');
    onKeyboard();
  };
  window.addEventListener('keydown', onKey, true);
}
