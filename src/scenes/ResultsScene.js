// Resultado de una carrera: estrellas, datos, gráfica del nivel y teclas a practicar.
import Phaser from 'phaser';
import { Save } from '../core/save.js';
import * as Layout from '../core/layout.js';
import { starsFor, levelStatus, nextLevel } from '../game/rules.js';
import { Panel } from '../ui/panel.js';
import { escapeHTML } from '../ui/keyboard-view.js';
import { levelName } from '../data/chapter1.js';
import { goalLines } from './LevelMapScene.js';
import { W, SCALE, FEET_Y, text, box, backdrop, onKeys, formatTime } from './common.js';

const FAIL_TEXT = {
  time: 'Se acabó el tiempo. Necesitas ser más rápida para avanzar.',
  caught: 'El perro te alcanzó. Evita caerte: cada caída lo acerca.',
  race: 'Otro corredor llegó primero. Solo el 1.er lugar avanza.',
};

export class ResultsScene extends Phaser.Scene {
  constructor() {
    super('Results');
  }

  init(data) {
    this.chapter = data.chapter;
    this.level = data.level;
    this.result = data.result;
  }

  create() {
    const { level, result, chapter } = this;
    const starsWon = starsFor(level, result);
    const { prev } = Save.record(level.id, { ...result, stars: starsWon });

    backdrop(this, level.theme).scroll(0);
    const kid = this.add.sprite(160, FEET_Y, 'sofia', 'sad').setOrigin(0.5, 1).setScale(SCALE);
    if (result.passed) kid.play('sofia-cheer');

    box(this, 280, 40, 620, 380);
    const title = result.passed ? '¡Nivel superado!' : 'No lo lograste';
    text(this, 590, 66, `${levelName(level)} · ${title}`, 28, result.passed ? '#2f7d3a' : '#b3261e', { ox: 0.5, stroke: '#fff7e0', strokeThickness: 2 });

    [0, 1, 2].forEach(i => {
      const star = this.add.image(510 + i * 80, 150, 'star-off').setScale(6);
      if (i < starsWon) {
        this.time.delayedCall(300 + i * 350, () => {
          star.setTexture('star-on').setScale(0.5);
          this.tweens.add({ targets: star, scale: 6, duration: 300, ease: 'Back.out' });
        });
      }
    });

    const reason = result.passed ? null : (level.kind === 'race' && result.failReason === 'time' ? 'race' : result.failReason);
    const lines = [
      `Tiempo: ${formatTime(result.timeMs)}${prev.bestTimeMs && result.passed && result.timeMs < prev.bestTimeMs ? '  ¡récord!' : ''}`,
      `PPM: ${Math.round(result.wpm)}   ·   Precisión: ${(result.accuracy * 100).toFixed(1)} %`,
      `Caídas: ${result.falls}   ·   Traspiés: ${result.errors}${result.place ? `   ·   Lugar: ${result.place}°` : ''}`,
    ];
    if (reason) lines.push(FAIL_TEXT[reason]);
    else if (starsWon > prev.stars) lines.push(`¡Nueva marca de estrellas en este nivel!`);
    text(this, 590, 220, lines.join('\n'), 20, '#2b1d2e', { ox: 0.5, align: 'center', stroke: '#fff7e0', strokeThickness: 2, wrap: 560, lineSpacing: 10 });

    const next = nextLevel(chapter, level);
    this.next = next && levelStatus(chapter, next, Save).unlocked ? next : null;
    const secretNow = level.kind !== 'secret' && levelStatus(chapter, chapter.secret, Save).visible &&
      !Save.level(chapter.secret.id).passed;
    const keys = `Enter reintentar${this.next ? '  ·  → siguiente nivel' : ''}  ·  Esc mapa`;
    text(this, 590, 380, keys, 18, '#5a4a3a', { ox: 0.5, stroke: '#fff7e0', strokeThickness: 2 });
    if (secretNow) text(this, W / 2, 470, '¡Apareció un nivel secreto en el mapa!', 24, '#b388ff', { ox: 0.5 });

    const weak = Object.entries(result.errByChar).sort((a, b) => b[1] - a[1]);
    const weakHtml = '<h3>Teclas a practicar</h3>' + (weak.length
      ? `<table class="log"><tr><th>Carácter</th><th>Traspiés</th><th>Cómo se escribe</th></tr>${weak.map(([c, n]) =>
        `<tr><td class="mono big">${c === ' ' ? '␣' : escapeHTML(c)}</td><td>${n}</td><td>${escapeHTML(Layout.describe(c))}</td></tr>`).join('')}</table>`
      : '<p>Sin traspiés. ¡Recorrido limpio!</p>');
    Panel.show('results');
    Panel.setResults(Save.history(level.id), goalLines(level), `Historial · ${levelName(level)}`, weakHtml);

    onKeys(this, {
      Enter: () => this.scene.start('Run', { chapter, level }),
      ArrowRight: () => this.next && this.scene.start(this.next.newKeys.length && !Save.level(this.next.id).passed ? 'Lesson' : 'Run', { chapter, level: this.next }),
      Escape: () => this.scene.start('LevelMap', { chapter, select: (result.passed && this.next ? this.next : level).id }),
    });
  }
}
