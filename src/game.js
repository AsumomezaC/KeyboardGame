// El juego en sí (Phaser y todo lo demás). main.js lo carga aparte, después de mostrar la página,
// para que la página abra rápido y los buscadores no tengan que esperar a Phaser.
import Phaser from 'phaser';
import { TypeInput } from './core/input.js';
import { Panel } from './ui/panel.js';
import { BootScene, TitleScene, ChaptersScene } from './scenes/MenuScenes.js';
import { LevelMapScene } from './scenes/LevelMapScene.js';
import { LessonScene } from './scenes/LessonScene.js';
import { RunScene } from './scenes/RunScene.js';
import { ResultsScene } from './scenes/ResultsScene.js';
import { DialogueScene } from './scenes/DialogueScene.js';
import { Music } from './audio/music.js';

// Espacio, flechas y Re Pág/Av Pág son controles del juego: mientras el juego se ve en pantalla
// no deben desplazar la página (p. ej. el espacio en los diálogos la mandaba hasta abajo).
// Ojo: Phaser descarta las teclas que ya llegan con preventDefault, así que este escucha se
// registra cuando el juego ya está listo, para correr después del de Phaser.
const SCROLL_KEYS = new Set([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown']);

function keepPageStill() {
  let gameVisible = true;
  new IntersectionObserver(([e]) => { gameVisible = e.intersectionRatio >= 0.5; }, { threshold: [0, 0.5, 1] })
    .observe(document.getElementById('game'));
  window.addEventListener('keydown', e => {
    const t = e.target;
    // En un campo de texto (incluida la captura de tecleo) la tecla es para escribir: no se toca.
    const editable = t instanceof HTMLInputElement || t instanceof HTMLSelectElement
      || t instanceof HTMLTextAreaElement || t?.isContentEditable;
    if (gameVisible && !editable && SCROLL_KEYS.has(e.key)) e.preventDefault();
  });
}

// onReady se llama cuando ya está dibujado todo el arte y aparece el título.
export function startGame(onReady) {
  TypeInput.init();

  // El navegador solo deja sonar audio después de la primera tecla o clic.
  for (const ev of ['keydown', 'pointerdown']) window.addEventListener(ev, () => Music.unlock(), true);

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 960,
    height: 540,
    pixelArt: true,
    backgroundColor: '#1d1b33',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
    scene: [BootScene, TitleScene, ChaptersScene, LevelMapScene, DialogueScene, LessonScene, RunScene, ResultsScene],
  });
  game.events.once(Phaser.Core.Events.READY, keepPageStill);
  game.events.once('art-ready', () => onReady?.());

  // Solo en desarrollo: acceso desde la consola para depurar.
  if (import.meta.env.DEV) window.__game = game;

  TypeInput.onCaps(on => {
    Panel.setCapsState(on);
    game.events.emit('caps', on);
  });
}
