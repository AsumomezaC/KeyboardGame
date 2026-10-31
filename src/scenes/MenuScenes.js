// Arranque, pantalla de título y selección de capítulo.
import Phaser from 'phaser';
import { generateArt } from '../art/index.js';
import { Save } from '../core/save.js';
import { chapterStars } from '../game/rules.js';
import { Panel } from '../ui/panel.js';
import { CHAPTERS } from '../data/chapter1.js';
import { W, SCALE, FEET_Y, text, box, backdrop, onKeys } from './common.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  async create() {
    try {
      await Promise.all([document.fonts.load('bold 20px "Pixelify Sans"'), document.fonts.load('20px "Pixelify Sans"')]);
    } catch { /* si la fuente falla se usa la de respaldo */ }
    generateArt(this);
    this.scene.start('Title');
  }
}

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.bg = backdrop(this, 'barrio');
    this.scrollX = 0;
    this.add.sprite(W / 2, FEET_Y, 'sofia').setOrigin(0.5, 1).setScale(SCALE).play('sofia-run');
    const title = text(this, W / 2, 120, 'PARKOUR TECLA', 84, '#ffd23f', { ox: 0.5, oy: 0.5, strokeThickness: 14 });
    this.tweens.add({ targets: title, y: 128, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    text(this, W / 2, 190, 'Mecanografía para teclado en inglés con distribución latina', 22, '#ffffff', { ox: 0.5 });
    const press = text(this, W / 2, 260, 'Presiona Enter', 30, '#ffffff', { ox: 0.5 });
    this.tweens.add({ targets: press, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
    Panel.show('none');
    const go = () => this.scene.start('Chapters');
    onKeys(this, { Enter: go, ' ': go });
    this.input.on('pointerdown', go);
  }

  update(_, delta) {
    this.scrollX += delta * 0.15;
    this.bg.scroll(this.scrollX);
  }
}

export class ChaptersScene extends Phaser.Scene {
  constructor() {
    super('Chapters');
  }

  create() {
    backdrop(this, 'barrio').scroll(400);
    this.add.rectangle(0, 0, W, 540, 0x1d1b33, 0.4).setOrigin(0);
    text(this, W / 2, 30, 'Elige un capítulo', 34, '#ffd23f', { ox: 0.5 });
    text(this, W / 2, 76, '← → elegir · Enter entrar · Esc título', 16, '#ffffff', { ox: 0.5, bold: false });
    this.cards = CHAPTERS.map((chap, i) => this.drawCard(chap, 90 + i * 270));
    this.select(0);
    onKeys(this, {
      ArrowRight: () => this.select(Math.min(this.cards.length - 1, this.index + 1)),
      ArrowLeft: () => this.select(Math.max(0, this.index - 1)),
      Enter: () => this.enter(),
      Escape: () => this.scene.start('Title'),
    });
    Panel.show('none');
  }

  drawCard(chap, x) {
    const y = 120;
    box(this, x, y, 240, 300, { fill: chap.data ? '#fff7e0' : '#d9d4c7' });
    const frame = this.add.rectangle(x - 6, y - 6, 252, 312).setOrigin(0).setStrokeStyle(6, 0xffd23f).setVisible(false);
    text(this, x + 120, y + 26, chap.title, 28, '#2b1d2e', { ox: 0.5, stroke: '#fff7e0', strokeThickness: 2 });
    if (chap.data) {
      text(this, x + 120, y + 64, chap.subtitle, 24, '#b83350', { ox: 0.5, stroke: '#fff7e0', strokeThickness: 2 });
      this.add.sprite(x + 120, y + 210, 'sofia').setOrigin(0.5, 1).setScale(SCALE).play('sofia-idle');
      const total = chapterStars(chap.data, Save, { includeSecret: true });
      text(this, x + 120, y + 240, `★ ${total} / 33`, 24, '#e8a400', { ox: 0.5 });
    } else {
      this.add.image(x + 120, y + 170, 'sign').setScale(SCALE);
      text(this, x + 120, y + 150, 'EN\nCONSTRUCCIÓN', 18, '#2b1d2e', { ox: 0.5, oy: 0.5, align: 'center', stroke: '#c8955c', strokeThickness: 2 });
    }
    const hit = this.add.zone(x, y, 240, 300).setOrigin(0).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => {
      const i = CHAPTERS.indexOf(chap);
      if (i === this.index) this.enter();
      else this.select(i);
    });
    return { chap, frame };
  }

  select(i) {
    this.index = i;
    this.cards.forEach((c, k) => c.frame.setVisible(k === i));
  }

  enter() {
    const { chap } = this.cards[this.index];
    if (!chap.data) {
      this.cameras.main.shake(150, 0.004);
      return;
    }
    this.scene.start('LevelMap', { chapter: chap.data });
  }
}
