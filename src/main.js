// Entrada ligera de la página: solo decide qué mostrar en el recuadro del juego. El juego (Phaser,
// unos 380 kB comprimidos) se descarga aparte con import(), así la página abre al instante.
import '@fontsource/vt323/400.css';
import './styles.css';
import { isPhone, showPhoneNotice } from './ui/phone-notice.js';
import { showLoader } from './ui/loader.js';

if (isPhone()) showPhoneNotice();
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
