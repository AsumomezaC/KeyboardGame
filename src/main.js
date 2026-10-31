import Phaser from 'phaser';
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import './styles.css';
import { TypeInput } from './core/input.js';
import { Panel } from './ui/panel.js';
import { BootScene, TitleScene, ChaptersScene } from './scenes/MenuScenes.js';
import { LevelMapScene } from './scenes/LevelMapScene.js';
import { LessonScene } from './scenes/LessonScene.js';
import { RunScene } from './scenes/RunScene.js';
import { ResultsScene } from './scenes/ResultsScene.js';

TypeInput.init();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 540,
  pixelArt: true,
  backgroundColor: '#1d1b33',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
  scene: [BootScene, TitleScene, ChaptersScene, LevelMapScene, LessonScene, RunScene, ResultsScene],
});

// Solo en desarrollo: acceso desde la consola para depurar.
if (import.meta.env.DEV) window.__game = game;

TypeInput.onCaps(on => {
  Panel.setCapsState(on);
  game.events.emit('caps', on);
});
