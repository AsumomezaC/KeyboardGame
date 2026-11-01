// Resultado de una carrera: estrellas, datos, gráfica del nivel y teclas a practicar.
import Phaser from 'phaser';
import { Save } from '../core/save.js';
import * as Layout from '../core/layout.js';
import { starsFor, starBreakdown, levelRules, levelStatus, nextLevel, canFail, accuracyTarget } from '../game/rules.js';
import { Panel } from '../ui/panel.js';
import { escapeHTML } from '../ui/keyboard-view.js';
import { levelName } from '../data/chapter1.js';
import { goalLines } from './LevelMapScene.js';
import { startLevel, storyFor } from './flow.js';
import { Music } from '../audio/music.js';
import { W, SCALE, FEET_Y, text, box, backdrop, onKeys, formatTime, keyLegend } from './common.js';

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
    const breakdown = starBreakdown(level, result);
    const { prev } = Save.record(level.id, { ...result, stars: starsWon, breakdown });

    backdrop(this, level.theme).scroll(0);
    const kid = this.add.sprite(160, FEET_Y, 'sofia', 'sad').setOrigin(0.5, 1).setScale(SCALE);
    if (result.passed) kid.play('sofia-cheer');

    box(this, 280, 40, 620, 380);
    const title = result.passed ? '¡Nivel superado!' : 'No lo lograste';
    text(this, 590, 66, `${levelName(level)} · ${title}`, 28, result.passed ? '#2f7d3a' : '#b3261e', { ox: 0.5, stroke: '#fff7e0', strokeThickness: 2 });

    // Cada estrella dice qué mide y si se logró.
    const rules = levelRules(level);
    const starDefs = [
      { won: breakdown.finish, name: 'Meta', goal: canFail(level) ? 'a tiempo' : 'terminar' },
      { won: breakdown.speed, name: 'Velocidad', goal: `≤ ${formatTime(rules.fastMs)}` },
      { won: breakdown.accuracy, name: 'Precisión', goal: `≥ ${Math.round(accuracyTarget(level) * 100)} %` },
    ];
    let lit = 0;
    starDefs.forEach((d, i) => {
      const x = 490 + i * 100;
      const star = this.add.image(x, 136, 'star-off').setScale(6);
      const color = d.won ? '#2f7d3a' : '#8a8799';
      text(this, x, 174, d.name, 16, color, { ox: 0.5, stroke: '#fff7e0', strokeThickness: 2 });
      text(this, x, 194, d.goal, 15, color, { ox: 0.5, stroke: '#fff7e0', strokeThickness: 2 });
      if (d.won) {
        this.time.delayedCall(300 + lit++ * 350, () => {
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
    text(this, 590, 230, lines.join('\n'), 20, '#2b1d2e', { ox: 0.5, align: 'center', stroke: '#fff7e0', strokeThickness: 2, wrap: 560, lineSpacing: 10 });

    const next = nextLevel(chapter, level);
    this.next = next && levelStatus(chapter, next, Save).unlocked ? next : null;
    const secretNow = level.kind !== 'secret' && levelStatus(chapter, chapter.secret, Save).visible &&
      !Save.level(chapter.secret.id).passed;
    // Si el nivel ya está superado puedes repetirlo sin diálogos (Enter) o viéndolos de nuevo (H).
    const replay = Save.level(level.id).passed && storyFor(chapter, level);
    keyLegend(this, [
      ['Enter', replay ? 'reintentar sin diálogos' : 'reintentar'],
      ...(replay ? [['H', 'con diálogos']] : []),
      ...(this.next ? [['→', 'siguiente']] : []),
      ['Esc', 'mapa'],
      ['M', 'música'],
    ]);
    if (secretNow) text(this, W / 2, 470, '¡Apareció un nivel secreto en el mapa!', 24, '#b388ff', { ox: 0.5 });

    const weak = Object.entries(result.errByChar).sort((a, b) => b[1] - a[1]);
    const weakHtml = '<h3>Teclas a practicar</h3>' + (weak.length
      ? `<table class="log"><tr><th>Carácter</th><th>Traspiés</th><th>Cómo se escribe</th></tr>${weak.map(([c, n]) =>
        `<tr><td class="mono big">${c === ' ' ? '␣' : escapeHTML(c)}</td><td>${n}</td><td>${escapeHTML(Layout.describe(c))}</td></tr>`).join('')}</table>`
      : '<p>Sin traspiés. ¡Recorrido limpio!</p>');
    Panel.show('results');
    Music.play('mapa');
    Panel.setResults(Save.history(level.id), goalLines(level), `Historial · ${levelName(level)}`, weakHtml);

    onKeys(this, {
      Enter: () => this.scene.start('Run', { chapter, level, story: false }),
      h: () => replay && startLevel(this, chapter, level, { story: true }),
      H: () => replay && startLevel(this, chapter, level, { story: true }),
      ArrowRight: () => this.next && startLevel(this, chapter, this.next),
      Escape: () => this.scene.start('LevelMap', { chapter, select: (result.passed && this.next ? this.next : level).id }),
    });
  }
}
