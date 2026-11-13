// Entrada ligera de la página: solo decide qué mostrar en el recuadro del juego. El juego (Phaser,
// unos 380 kB comprimidos) se descarga aparte con import(), así la página abre al instante.
import '@fontsource/vt323/400.css';
import './styles.css';
import { needsKeyboardCheck, showKeyboardNotice } from './ui/keyboard-notice.js';
import { showLoader } from './ui/loader.js';

// En celulares y tablets el juego espera a que se presione una tecla de un teclado físico.
if (needsKeyboardCheck()) showKeyboardNotice(loadGame);
else loadGame();

function loadGame() {
  const loader = showLoader();
  import('./game.js')
    .then(({ startGame }) => {
      loader.downloaded();
      startGame(() => loader.done());
    })
    .catch(err => {
      console.error(err);
      loader.failed();
    });
}
