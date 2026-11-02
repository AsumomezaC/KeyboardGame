import Phaser from 'phaser';
import '@fontsource/vt323/400.css';
import './styles.css';
import { TypeInput } from './core/input.js';
import { Panel } from './ui/panel.js';
import { BootScene, TitleScene, ChaptersScene } from './scenes/MenuScenes.js';
import { LevelMapScene } from './scenes/LevelMapScene.js';
import { LessonScene } from './scenes/LessonScene.js';
import { RunScene } from './scenes/RunScene.js';
import { ResultsScene } from './scenes/ResultsScene.js';
import { DialogueScene } from './scenes/DialogueScene.js';
import { Music } from './audio/music.js';
import { showMusicToast } from './ui/music-toast.js';

TypeInput.init();

// El navegador solo deja sonar audio después de la primera tecla o clic.
for (const ev of ['keydown', 'pointerdown']) window.addEventListener(ev, () => Music.unlock(), true);
Music.onMuteChange(showMusicToast);

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

// Solo en desarrollo: acceso desde la consola para depurar.
if (import.meta.env.DEV) window.__game = game;

TypeInput.onCaps(on => {
  Panel.setCapsState(on);
  game.events.emit('caps', on);
});
