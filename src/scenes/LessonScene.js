// Antes de un nivel con teclas nuevas: qué dedo usar y una mini práctica de 5 pulsaciones por tecla.
// En niveles sin teclas nuevas es un calentamiento: 4 grupos de 3 letras distintas ya conocidas
// (p. ej. «f d j»), que mezclan el último par aprendido con otros anteriores.
// Mientras practicas, Sofía calienta (estira, hace zancadas y se pone en posición de salida);
// al terminar sale corriendo y arranca la carrera sola, con su cuenta regresiva.
import Phaser from 'phaser';
import { TypeInput } from '../core/input.js';
import { fingerOf, fingerLabel } from '../core/fingers.js';
import * as Layout from '../core/layout.js';
import { Panel } from '../ui/panel.js';
import { levelName } from '../data/chapters.js';
import { fingersFor } from './RunScene.js';
import { W, SCALE, FEET_Y, text, box, backdrop, keyLegend, px } from './common.js';
import { addWeather } from './weather.js';
import { storyFor } from './flow.js';

const REPS = 5;
const START_DELAY_MS = 700;
// Poses de calentamiento según el avance de la práctica.
const WARMUP = ['idle0', 'stretch0', 'stretch1', 'stretch0', 'lunge0', 'lunge1', 'set'];

export class LessonScene extends Phaser.Scene {
  constructor() {
    super('Lesson');
  }

  init(data) {
    this.chapter = data.chapter;
    this.level = data.level;
    this.keyIndex = 0;
    this.count = 0;
    this.finished = false;
    this.story = data.story;
    this.presses = 0;
    this.isWarmup = this.level.newKeys.length === 0;
    // Cada paso es una secuencia: 5 veces la tecla nueva, o un grupo de 3 letras del calentamiento.
    this.steps = this.isWarmup ? (this.level.warmup || []) : this.level.newKeys.map(k => Array(REPS).fill(k));
    this.reps = this.steps[0]?.length || REPS;
  }

  create() {
    backdrop(this, this.level.theme).scroll(0);
    this.weather = addWeather(this, storyFor(this.chapter, this.level)?.weather);
    this.hero = this.level.hero || 'sofia';
    this.kid = this.add.sprite(170, FEET_Y, this.hero, 'idle0').setOrigin(0.5, 1).setScale(SCALE).setDepth(10);
    box(this, 300, 70, 600, 300);
    text(this, 600, 96, `${levelName(this.level)} · ${this.isWarmup ? 'Calentamiento' : 'Teclas nuevas'}`, 24, '#2b1d2e', { ox: 0.5, stroke: '#fff7e0', strokeThickness: 2 });
    this.keyText = text(this, 600, 190, '', 110, '#ff9f1c', { ox: 0.5, oy: 0.5, strokeThickness: 10 });
    // En el calentamiento se ven las 3 letras del grupo; la que toca va en naranja.
    this.stepTexts = this.isWarmup
      ? [0, 1, 2].map(i => text(this, 600 + (i - 1) * 130, 190, '', 96, '#ff9f1c', { ox: 0.5, oy: 0.5, strokeThickness: 10 }))
      : [];
    this.fingerText = text(this, 600, 268, '', 24, '#2b1d2e', { ox: 0.5, stroke: '#fff7e0', strokeThickness: 2 });
    this.pips = Array.from({ length: this.reps }, (_, i) => this.add.circle(600 + (i - (this.reps - 1) / 2) * 34, 320, 11, 0xd8c3a5).setStrokeStyle(3, 0x2b1d2e));
    keyLegend(this, [['Esc', 'volver al mapa', () => this.scene.start('LevelMap', { chapter: this.chapter, select: this.level.id })]]);

    Panel.show('play');
    Panel.setCapsContext(true);
    Panel.setTip('');
    this.showKey();
    TypeInput.start({
      onKey: e => {
        if (e.key === 'Escape') this.scene.start('LevelMap', { chapter: this.chapter, select: this.level.id });
        else Panel.keyboard.press(e.code);
      },
      onChar: ch => this.onChar(ch),
    });
    this.events.once('shutdown', () => {
      TypeInput.stop();
      Panel.setCapsContext(false);
      Panel.showHands(false);
      Panel.keyboard.showFingers(false);
    });
  }

  warmUp() {
    this.presses++;
    const total = this.steps.reduce((n, st) => n + st.length, 0);
    const i = Math.min(WARMUP.length - 1, Math.floor((this.presses / total) * WARMUP.length));
    this.kid.setFrame(WARMUP[i]);
    this.tweens.killTweensOf(this.kid);
    this.kid.setScale(SCALE * 1.08, SCALE * 0.92);
    this.tweens.add({ targets: this.kid, scaleX: SCALE, scaleY: SCALE, duration: 160, ease: 'Back.out' });
  }

  update(_, delta) {
    this.weather.update(delta);
  }

  get step() {
    return this.steps[this.keyIndex];
  }

  get key() {
    return this.step[this.count];
  }

  // Muestra la tecla que toca (en el calentamiento, el grupo completo con la actual resaltada).
  showKey() {
    const ch = this.key;
    const combo = Layout.comboFor(ch);
    const code = ch === ' ' ? 'Space' : combo.steps[0].code;
    const finger = fingerOf(code);
    if (this.isWarmup) {
      // tal como se escriben: cuando el calentamiento incluya mayúsculas, se distinguirán
      this.stepTexts.forEach((t, i) => t.setText(this.step[i])
        .setColor(i < this.count ? '#7bd389' : i === this.count ? '#ff9f1c' : '#d8c3a5'));
    } else {
      this.keyText.setText(ch === ' ' ? 'ESPACIO' : ch).setFontSize(px(ch === ' ' ? 64 : 110));
    }
    this.fingerText.setText(`Usa el ${fingerLabel(code)}`);
    if (this.count === 0) this.pips.forEach(p => p.setFillStyle(0xd8c3a5));
    Panel.setTarget(this.step, this.count);
    const where = ch === ' ' ? 'la barra espaciadora' : `la tecla ${Layout.usLegend(code)}`;
    const home = finger && finger.finger !== 'thumb' && ['KeyF', 'KeyJ'].includes(code) ? ' Tiene un relieve para encontrarla sin mirar.' : '';
    Panel.setHints(this.isWarmup
      ? `Calienta con teclas que ya conoces: escribe ${this.step.join(' ')}. Ahora ${where} con el ${fingerLabel(code)}.${home}`
      : `Presiona ${where} ${this.reps} veces con el ${fingerLabel(code)}.${home}`,
      'Deja los demás dedos descansando sobre la fila central: A S D F · J K L Ñ.');
    Panel.showHands(true, fingersFor(ch));
    Panel.keyboard.showFingers(true);
    Panel.keyboard.highlight(ch);
  }

  onChar(ch) {
    if (this.finished) return;
    if (ch !== this.key) {
      Panel.setTip(`Esa fue «${ch === ' ' ? 'espacio' : ch}». Busca la tecla resaltada.`, 2000);
      this.cameras.main.shake(100, 0.003);
      return;
    }
    this.pips[this.count].setFillStyle(0x7bd389);
    this.warmUp();
    this.tweens.add({ targets: this.pips[this.count], scale: 1.4, duration: 90, yoyo: true });
    this.count++;
    if (this.count < this.step.length) {
      // calentamiento: la siguiente letra del grupo; teclas nuevas: la misma otra vez
      if (this.isWarmup) this.showKey();
      else Panel.setTarget(this.step, this.count);
      return;
    }
    Panel.setTarget(this.step, this.count);
    if (this.isWarmup) this.stepTexts.forEach(t => t.setColor('#7bd389'));
    this.keyIndex++;
    this.count = 0;
    if (this.keyIndex < this.steps.length) {
      this.time.delayedCall(350, () => this.showKey());
      return;
    }
    this.finished = true;
    Panel.keyboard.clear();
    Panel.showHands(false);
    this.stepTexts.forEach(t => t.setVisible(false));
    this.keyText.setText('¡LISTA!').setFontSize(px(80)).setColor('#7bd389');
    this.fingerText.setText('¡A correr!');
    Panel.setTarget(null, 0, '¡Lista!');
    Panel.setHints('');
    this.time.delayedCall(START_DELAY_MS, () => {
      this.kid.play(`${this.hero}-run`);
      this.tweens.add({
        targets: this.kid, x: W + 60, duration: 900, ease: 'Quad.in',
        onComplete: () => this.scene.start('Run', { chapter: this.chapter, level: this.level, story: this.story }),
      });
    });
  }
}
