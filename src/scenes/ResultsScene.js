// Resultado de una carrera: estrellas, datos, gráfica del nivel y teclas a practicar.
import Phaser from 'phaser';
import { Save } from '../core/save.js';
import * as Layout from '../core/layout.js';
import { starsFor, starBreakdown, levelRules, levelStatus, nextLevel, canFail, accuracyTarget } from '../game/rules.js';
import { Panel } from '../ui/panel.js';
import { escapeHTML } from '../ui/keyboard-view.js';
import { levelName } from '../data/chapters.js';
import { goalLines } from './LevelMapScene.js';
import { startLevel, storyFor } from './flow.js';
import { Music } from '../audio/music.js';
import { W, SCALE, FEET_Y, text, box, backdrop, onKeys, formatTime, button, buttonRow } from './common.js';

// Por qué no se superó el nivel, según el tipo de jefe.
function failText(level, rules, reason) {
  const type = level.boss?.type;
  if (reason === 'errors') return `Más de ${rules.maxErrors} traspiés. Escribe con calma: en los jefes cada error cuenta.`;
  if (reason === 'falls') {
    return type === 'chase'
      ? `Te caíste más de ${rules.maxFalls} veces y te alcanzaron. Cada caída los acerca.`
      : `Te caíste más de ${rules.maxFalls} veces. Termina cada obstáculo antes de que se acabe su barra.`;
  }
  if (type === 'race') return 'Otro corredor llegó primero. Solo el 1.er lugar avanza.';
  if (type === 'chase') return 'Te alcanzaron. Necesitas ser más rápida para escapar.';
  if (type === 'catch') return 'No lo alcanzaste a tiempo. Necesitas ser más rápida.';
  return 'Se acabó el tiempo. Necesitas ser más rápida para avanzar.';
}

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
    const hero = level.hero || 'sofia';
    const kid = this.add.sprite(160, FEET_Y, hero, 'sad').setOrigin(0.5, 1).setScale(SCALE);
    if (result.passed) kid.play(`${hero}-cheer`);

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

    const reason = result.passed ? null : result.failReason;
    const lines = [
      `Tiempo: ${formatTime(result.timeMs)}${prev.bestTimeMs && result.passed && result.timeMs < prev.bestTimeMs ? '  ¡récord!' : ''}`,
      `PPM: ${Math.round(result.wpm)}   ·   Precisión: ${(result.accuracy * 100).toFixed(1)} %`,
      `Caídas: ${result.falls}   ·   Traspiés: ${result.errors}${result.place ? `   ·   Lugar: ${result.place}°` : ''}`,
    ];
    if (reason) lines.push(failText(level, rules, reason));
    else if (starsWon > prev.stars) lines.push(`¡Nueva marca de estrellas en este nivel!`);
    const secretNow = level.kind !== 'secret' && levelStatus(chapter, chapter.secret, Save).visible &&
      !Save.level(chapter.secret.id).passed;
    if (secretNow) lines.push('¡Apareció un nivel secreto en el mapa!');
    text(this, 590, 230, lines.join('\n'), 20, '#2b1d2e', { ox: 0.5, align: 'center', stroke: '#fff7e0', strokeThickness: 2, wrap: 560, lineSpacing: 10 });

    const next = nextLevel(chapter, level);
    this.next = next && levelStatus(chapter, next, Save).unlocked ? next : null;
    // Si un nivel ya está superado se puede jugar con historia o sin ella: este y el siguiente.
    const replay = Save.level(level.id).passed && storyFor(chapter, level);
    const nextReplay = this.next && Save.level(this.next.id).passed && storyFor(chapter, this.next);
    // Cada acción funciona con su tecla o con un clic en su botón.
    const actions = {
      retry: () => this.scene.start('Run', { chapter, level, story: false }),
      retryStory: () => replay && startLevel(this, chapter, level, { story: true }),
      next: () => this.next && startLevel(this, chapter, this.next, nextReplay ? { story: false } : undefined),
      nextStory: () => nextReplay && startLevel(this, chapter, this.next, { story: true }),
      map: () => this.scene.start('LevelMap', { chapter, select: (result.passed && this.next ? this.next : level).id }),
    };
    const CX = 595;
    buttonRow(this, CX, 432, [
      { key: 'Enter', label: 'Reintentar', onClick: actions.retry, primary: !result.passed },
      ...(replay ? [{ key: 'H', label: 'Reintentar con historia', onClick: actions.retryStory }] : []),
    ]);
    buttonRow(this, CX, 484, [
      ...(this.next ? [{ key: '→', label: nextReplay ? 'Siguiente' : 'Siguiente nivel', onClick: actions.next, primary: result.passed }] : []),
      ...(nextReplay ? [{ key: 'Mayús →', label: 'Siguiente con historia', onClick: actions.nextStory }] : []),
      { key: 'Esc', label: 'Mapa', onClick: actions.map },
    ]);
    button(this, W - 132, 8, { key: 'M', label: 'Música', onClick: () => Music.toggleMute() });

    const weak = Object.entries(result.errByChar).sort((a, b) => b[1] - a[1]);
    const weakHtml = '<h3>Teclas a practicar</h3>' + (weak.length
      ? `<table class="log"><tr><th>Carácter</th><th>Traspiés</th><th>Cómo se escribe</th></tr>${weak.map(([c, n]) =>
        `<tr><td class="mono big">${c === ' ' ? '␣' : escapeHTML(c)}</td><td>${n}</td><td>${escapeHTML(Layout.describe(c))}</td></tr>`).join('')}</table>`
      : '<p>Sin traspiés. ¡Recorrido limpio!</p>');
    Panel.show('results');
    Music.play('mapa');
    Panel.setResults(Save.history(level.id), goalLines(level), `Historial · ${levelName(level)}`, weakHtml);

    onKeys(this, {
      Enter: actions.retry,
      h: actions.retryStory,
      H: actions.retryStory,
      ArrowRight: e => (e.shiftKey ? actions.nextStory() : actions.next()),
      Escape: actions.map,
    });
  }
}
