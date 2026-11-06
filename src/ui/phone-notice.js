// En celulares no se carga el juego (necesita un teclado físico): en su lugar aparece un aviso
// amable con un botón para copiar o compartir el enlace y abrirlo en una computadora o tablet.

// Celular = pantalla táctil y lado corto menor a 600 px. Las tablets (768 px o más) sí juegan.
export function isPhone() {
  try {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    return coarse && Math.min(window.screen.width, window.screen.height) < 600;
  } catch {
    return false;
  }
}

// Laptop y tablet en pixel art (16×12).
const ICON = `<svg viewBox="0 0 32 16" aria-hidden="true" shape-rendering="crispEdges">
  <rect x="1" y="2" width="16" height="10" fill="#2b1d2e"/><rect x="2" y="3" width="14" height="8" fill="#8ecae6"/>
  <rect x="5" y="6" width="2" height="4" fill="#e94f64"/><rect x="5" y="4" width="2" height="2" fill="#f2c29b"/>
  <rect x="9" y="8" width="6" height="2" fill="#fff7e0"/>
  <rect x="0" y="12" width="18" height="2" fill="#c9a66b"/>
  <rect x="21" y="3" width="10" height="12" fill="#2b1d2e"/><rect x="22" y="4" width="8" height="9" fill="#fff7e0"/>
  <rect x="23" y="6" width="6" height="1" fill="#e94f64"/><rect x="23" y="8" width="4" height="1" fill="#e94f64"/>
  <rect x="25" y="13" width="2" height="1" fill="#c9a66b"/>
</svg>`;

export function showPhoneNotice() {
  document.body.classList.add('phone');
  const game = document.getElementById('game');
  game.insertAdjacentHTML('beforeend', `
    <div class="phone-notice" role="status">
      ${ICON}
      <h2>Este juego fue diseñado para computadoras y tablets</h2>
      <p>¡Pruébalo ahí! Sofía corre cuando escribes, y para eso necesitas un teclado de verdad.</p>
      <button type="button" class="phone-share">Copiar enlace para después</button>
      <p class="phone-done" hidden>¡Listo! Ábrelo en tu computadora o tablet.</p>
    </div>`);
  const btn = game.querySelector('.phone-share');
  const done = game.querySelector('.phone-done');
  const url = 'https://teclea-con-sofia.vercel.app/';
  if (navigator.share) btn.textContent = 'Compartir enlace para después';
  btn.addEventListener('click', async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'La Historia de Sofía', text: 'Juego de mecanografía para jugar en la computadora', url });
      else await navigator.clipboard.writeText(url);
      done.hidden = false;
    } catch { /* la persona canceló o el navegador no lo permite */ }
  });
}
