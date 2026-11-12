// Resultado de una carrera: estrellas, datos, gráfica del nivel y teclas a practicar.
import Phaser from 'phaser';
import { Save } from '../core/save.js';
import * as Layout from '../core/layout.js';
import { starsFor, starBreakdown, levelRules, levelStatus, nextLevel, canFail, accuracyTarget, chapterUnlocked } from '../game/rules.js';
import { Panel } from '../ui/panel.js';
import { escapeHTML } from '../ui/keyboard-view.js';
import { levelName, PLAYABLE } from '../data/chapters.js';
import { goalLines } from './LevelMapScene.js';
import { startLevel, storyFor } from './flow.js';
import { askStory, shouldAsk } from './story-choice.js';
import { Music } from '../audio/music.js';
import { W, SCALE, FEET_Y, text, box, backdrop, onKeys, formatTime, button, buttonRow, openSettings } from './common.js';
import { Dev } from '../core/dev.js';

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

  // { chapter, level, label } o null si no hay a dónde seguir.
  nextTarget() {
    const { chapter, level, result } = this;
    const open = (ch, lv) => lv && levelStatus(ch, lv, Save).unlocked;
    if (level.kind === 'secret') {
      // el secreto está entre el nivel «after» y el siguiente: la historia sigue en ese
      const lv = chapter.levels[chapter.secret.after];
      return open(chapter, lv) ? { chapter, level: lv, label: 'Seguir con la historia' } : null;
    }
    const next = nextLevel(chapter, level);
    if (next) return open(chapter, next) ? { chapter, level: next, label: 'Siguiente nivel' } : null;
    const nextChapter = PLAYABLE[chapter.index + 1];
    if (result.passed && nextChapter && chapterUnlocked(PLAYABLE, nextChapter.index, Save)) {
      return { chapter: nextChapter, level: nextChapter.levels[0], label: 'Siguiente capítulo' };
    }
    return null;
  }

  // El nivel justo antes del secreto (en la historia, el que lleva a él): si el secreto ya está
  // desbloqueado, se puede continuar directo a él.
  secretTarget() {
    const { chapter, level } = this;
    if (level.kind === 'secret' || chapter.levels.indexOf(level) !== chapter.secret.after - 1) return null;
    return levelStatus(chapter, chapter.secret, Save).unlocked ? { chapter, level: chapter.secret } : null;
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

    // Un solo «Siguiente»: al siguiente nivel, al nivel 1 del siguiente capítulo (al terminar el
    // último) o, después de un secreto, al nivel que sigue en la historia. Si ese nivel ya está
    // superado y tiene diálogos, al iniciarlo se pregunta si con historia o sin ella.
    this.target = this.nextTarget();
    const replay = Save.level(level.id).passed && storyFor(chapter, level);
    const target = this.target;
    const secret = this.secretTarget();
    // Ir a un nivel: si ya está superado y tiene diálogos, se pregunta si con historia o sin ella.
    const go = t => {
      if (!t) return;
      if (shouldAsk(t.chapter, t.level)) askStory(this, t.level, story => startLevel(this, t.chapter, t.level, { story }));
      else startLevel(this, t.chapter, t.level);
    };
    // Cada acción funciona con su tecla o con un clic en su botón.
    const actions = {
      // en modo Dios, reintentar también lo supera solo
      retry: () => (Dev.god ? startLevel(this, chapter, level, { story: false }) : this.scene.start('Run', { chapter, level, story: false })),
      retryStory: () => replay && startLevel(this, chapter, level, { story: true }),
      next: () => go(target),
      secret: () => go(secret),
      map: () => this.scene.start('LevelMap', {
        chapter, select: (result.passed && target?.chapter === chapter ? target.level : level).id,
      }),
    };
    const CX = 595;
    buttonRow(this, CX, 432, [
      { key: 'Enter', label: 'Reintentar', onClick: actions.retry, primary: !result.passed },
      ...(replay ? [{ key: 'H', label: 'Reintentar con historia', onClick: actions.retryStory }] : []),
    ]);
    buttonRow(this, CX, 484, [
      ...(target ? [{ key: '→', label: target.label, onClick: actions.next, primary: result.passed }] : []),
      ...(secret ? [{ key: '↑', label: 'Continuar al nivel secreto', onClick: actions.secret }] : []),
      { key: 'Esc', label: 'Mapa', onClick: actions.map },
    ]);
    const settings = button(this, 0, 8, { key: 'M', label: 'Configuración', gearIcon: true, onClick: () => openSettings(this) });
    settings.container.x = W - 16 - settings.width;

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
      ArrowRight: actions.next,
      ArrowUp: actions.secret,
      Escape: actions.map,
    });
  }
}
