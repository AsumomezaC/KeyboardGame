// Arranque, pantalla de título, selección de modo y selección de capítulo.
import Phaser from 'phaser';
import { generateArt } from '../art/index.js';
import { Save } from '../core/save.js';
import { chapterStars, chapterMaxStars, chapterUnlocked } from '../game/rules.js';
import { Panel } from '../ui/panel.js';
import { CHAPTERS, PLAYABLE } from '../data/chapters.js';
import { W, SCALE, FEET_Y, text, box, backdrop, onKeys, keyLegend } from './common.js';
import { Music } from '../audio/music.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  async create() {
    try {
      await document.fonts.load('20px "VT323"');
    } catch { /* si la fuente falla se usa la de respaldo */ }
    generateArt(this);
    this.game.events.emit('art-ready');
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
    const title = text(this, W / 2, 120, 'LA HISTORIA DE SOFÍA', 64, '#ffd23f', { ox: 0.5, oy: 0.5, strokeThickness: 12 });
    this.tweens.add({ targets: title, y: 128, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    text(this, W / 2, 190, 'Mecanografía para teclado en inglés con distribución latina', 22, '#ffffff', { ox: 0.5 });
    const press = text(this, W / 2, 260, 'Presiona Enter', 30, '#ffffff', { ox: 0.5 });
    this.tweens.add({ targets: press, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
    Panel.show('none');
    Music.play('titulo');
    const go = () => this.scene.start('Modes');
    keyLegend(this, [['Enter', 'empezar', go], ['M', 'música']]);
    onKeys(this, { Enter: go, ' ': go });
    this.input.on('pointerdown', go);
  }

  update(_, delta) {
    this.scrollX += delta * 0.15;
    this.bg.scroll(this.scrollX);
  }
}

// Menú de tarjetas grandes (selección de modo y opciones del Modo Libre). Cada tarjeta:
// { title, ready, art(scene, cx, y), desc?, go? }. Las que no están listas se ven en gris con el
// letrero «EN CONSTRUCCIÓN» y solo tiemblan al intentar entrar. Si la tarjeta tiene desc, aparece
// debajo al pasar el ratón sobre ella o al elegirla con las flechas.
const CARD_MENU_W = 300;
const CARD_MENU_H = 300;
const CARD_MENU_GAP = 60;
const CARD_MENU_Y = 104;
const DESC_Y = 438;

class CardMenuScene extends Phaser.Scene {
  init(data) {
    this.startIndex = data?.select ?? 0;
  }

  // heading: título de la pantalla; back: [texto de Esc, acción].
  buildMenu(heading, cards, [backLabel, back]) {
    backdrop(this, 'barrio').scroll(400);
    this.add.rectangle(0, 0, W, 540, 0x1d1b33, 0.4).setOrigin(0);
    text(this, W / 2, 26, heading, 34, '#ffd23f', { ox: 0.5 });
    this.drawDescription();
    const left = (W - cards.length * CARD_MENU_W - (cards.length - 1) * CARD_MENU_GAP) / 2;
    this.cards = cards.map((card, i) => this.drawCard(card, left + i * (CARD_MENU_W + CARD_MENU_GAP), i));
    this.select(Math.min(this.startIndex, this.cards.length - 1), false);
    // Si el ratón sale del juego directo desde una tarjeta, la tarjeta no recibe pointerout.
    this.input.on('gameout', () => this.showDescription(null));
    keyLegend(this, [['← →', 'elegir'], ['Enter', 'entrar', () => this.enter()], ['Esc', backLabel, back], ['M', 'música']]);
    onKeys(this, {
      ArrowRight: () => this.select(Math.min(this.cards.length - 1, this.index + 1)),
      ArrowLeft: () => this.select(Math.max(0, this.index - 1)),
      Enter: () => this.enter(),
      ' ': () => this.enter(),
      Escape: back,
    });
    Panel.show('none');
  }

  // Placa oscura debajo de las tarjetas para la descripción; oculta hasta que haga falta.
  drawDescription() {
    this.descPlate = this.add.graphics().setVisible(false);
    this.descText = text(this, W / 2, DESC_Y, '', 20, '#ffffff', { ox: 0.5, oy: 0.5, strokeThickness: 0 }).setVisible(false);
  }

  showDescription(card) {
    const desc = card?.spec.desc;
    this.descPlate.setVisible(!!desc);
    this.descText.setVisible(!!desc);
    if (!desc) return;
    this.descText.setText(desc);
    const w = this.descText.width + 36;
    const h = this.descText.height + 14;
    this.descPlate.clear().fillStyle(0x000000, 0.6).fillRoundedRect(W / 2 - w / 2, DESC_Y - h / 2, w, h, 8)
      .lineStyle(2, 0xc9a66b, 1).strokeRoundedRect(W / 2 - w / 2, DESC_Y - h / 2, w, h, 8);
  }

  drawCard(spec, x, i) {
    const y = CARD_MENU_Y;
    const cx = x + CARD_MENU_W / 2;
    box(this, x, y, CARD_MENU_W, CARD_MENU_H, { fill: spec.ready ? '#fff7e0' : '#d9d4c7' });
    const frame = this.add.rectangle(x - 6, y - 6, CARD_MENU_W + 12, CARD_MENU_H + 12).setOrigin(0).setStrokeStyle(6, 0xffd23f).setVisible(false);
    text(this, cx, y + 26, spec.title, 30, '#2b1d2e', { ox: 0.5, stroke: '#fff7e0', strokeThickness: 2 });
    if (spec.ready) {
      spec.art(this, cx, y);
    } else {
      this.add.image(cx, y + 170, 'sign').setScale(SCALE);
      text(this, cx, y + 150, 'EN\nCONSTRUCCIÓN', 18, '#2b1d2e', { ox: 0.5, oy: 0.5, align: 'center', stroke: '#c8955c', strokeThickness: 2 });
    }
    // Un clic en la tarjeta seleccionada entra; en la otra, solo la selecciona.
    const hit = this.add.zone(x, y, CARD_MENU_W, CARD_MENU_H).setOrigin(0).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => (i === this.index ? this.enter() : this.select(i)));
    hit.on('pointerover', () => this.showDescription(this.cards[i]));
    hit.on('pointerout', () => this.showDescription(null));
    return { spec, frame };
  }

  // describe: con las flechas también se muestra la descripción (el teclado no tiene «hover»).
  select(i, describe = true) {
    this.index = i;
    this.cards.forEach((c, k) => c.frame.setVisible(k === i));
    if (describe) this.showDescription(this.cards[i]);
  }

  enter() {
    const { spec } = this.cards[this.index];
    if (!spec.ready) {
      this.cameras.main.shake(150, 0.004);
      return;
    }
    spec.go(this);
  }
}

// Selección del tipo de juego: Modo Historia (los capítulos) y Modo Libre.
export class ModesScene extends CardMenuScene {
  constructor() {
    super('Modes');
  }

  create() {
    this.buildMenu('Elige cómo jugar', [
      {
        title: 'Modo Historia',
        ready: true,
        art: (scene, cx, y) => {
          scene.add.sprite(cx, y + 226, 'sofia', 'idle0').setOrigin(0.5, 1).setScale(SCALE).play('sofia-run');
          const total = PLAYABLE.reduce((n, chap) => n + chapterStars(chap, Save, { includeSecret: true }), 0);
          text(scene, cx, y + 244, `★ ${total}`, 24, '#e8a400', { ox: 0.5 });
        },
        go: scene => scene.scene.start('Chapters'),
      },
      {
        title: 'Modo Libre',
        ready: true,
        art: (scene, cx, y) => {
          scene.add.sprite(cx, y + 240, 'sofia', 'idle0').setOrigin(0.5, 1).setScale(SCALE).play('sofia-cheer');
        },
        go: scene => scene.scene.start('Free'),
      },
    ], ['título', () => this.scene.start('Title')]);
    Music.play('titulo');
  }
}

// Modo Libre: con todo el contenido del juego o solo con las teclas ya desbloqueadas.
export class FreeScene extends CardMenuScene {
  constructor() {
    super('Free');
  }

  create() {
    this.buildMenu('Modo Libre', [
      { title: 'Todo el Juego', ready: false, desc: 'Todos los niveles y teclas, aunque no los hayas desbloqueado.' },
      { title: 'Mis Teclas', ready: false, desc: 'Solo las teclas que ya desbloqueaste en el Modo Historia.' },
    ], ['modos', () => this.scene.start('Modes', { select: 1 })]);
    Music.play('titulo');
  }
}

// Selección de capítulo: tarjetas en una fila que se desliza. Se ven tres a la vez; las flechas
// del teclado, las de pantalla, la rueda del ratón, la barra deslizable, los puntos y el clic
// llevan a cualquier capítulo, y el seleccionado siempre queda a la vista.
const CARD_W = 240;
const CARD_STEP = 270;
const VISIBLE = 3;
const ROW_X = 90;
const CARD_Y = 104;
const AGE_SCALE = { 8: 2.7, 10: 3, 12: 3.25 };

export class ChaptersScene extends Phaser.Scene {
  constructor() {
    super('Chapters');
  }

  init(data) {
    this.startIndex = data?.select ?? 0;
  }

  create() {
    backdrop(this, 'barrio').scroll(400);
    this.add.rectangle(0, 0, W, 540, 0x1d1b33, 0.4).setOrigin(0);
    text(this, W / 2, 26, 'Elige un capítulo', 34, '#ffd23f', { ox: 0.5 });
    this.row = this.add.container(ROW_X, 0);
    const maskShape = this.make.graphics({ add: false }).fillRect(ROW_X - 14, CARD_Y - 14, VISIBLE * CARD_STEP - 2, 330);
    this.row.setMask(maskShape.createGeometryMask());
    this.index = 0;
    this.first = 0;
    this.cards = CHAPTERS.map((chap, i) => this.drawCard(chap, i));
    this.drawArrows();
    this.drawSlider();
    keyLegend(this, [['← →', 'elegir'], ['Enter', 'entrar', () => this.enter()], ['Esc', 'modos', () => this.scene.start('Modes')], ['M', 'música']]);
    Music.play('mapa');
    this.select(Math.min(this.startIndex, this.cards.length - 1), false);
    onKeys(this, {
      ArrowRight: () => this.select(Math.min(this.cards.length - 1, this.index + 1)),
      ArrowLeft: () => this.select(Math.max(0, this.index - 1)),
      Enter: () => this.enter(),
      Escape: () => this.scene.start('Modes'),
    });
    this.input.on('wheel', (_p, _o, dx, dy) => this.scrollTo(this.first + Math.sign(dy || dx), true));
    Panel.show('none');
  }

  drawCard(chap, i) {
    const x = i * CARD_STEP;
    const y = CARD_Y;
    const unlocked = !!chap.data && chapterUnlocked(PLAYABLE, i, Save);
    const items = [];
    items.push(box(this, x, y, CARD_W, 300, { fill: unlocked ? '#fff7e0' : '#d9d4c7' }));
    const frame = this.add.rectangle(x - 6, y - 6, CARD_W + 12, 312).setOrigin(0).setStrokeStyle(6, 0xffd23f).setVisible(false);
    items.push(frame);
    items.push(text(this, x + 120, y + 26, chap.title, 28, '#2b1d2e', { ox: 0.5, stroke: '#fff7e0', strokeThickness: 2 }));
    if (chap.data) {
      items.push(text(this, x + 120, y + 64, chap.subtitle, 22, '#b83350', { ox: 0.5, stroke: '#fff7e0', strokeThickness: 2, align: 'center', wrap: 220 }));
      const kid = this.add.sprite(x + 120, y + 214, 'sofia', 'idle0').setOrigin(0.5, 1).setScale(AGE_SCALE[chap.age] || SCALE);
      items.push(kid);
      if (unlocked) {
        kid.play('sofia-idle');
        const total = chapterStars(chap.data, Save, { includeSecret: true });
        items.push(text(this, x + 120, y + 240, `★ ${total} / ${chapterMaxStars(chap.data, Save)}`, 24, '#e8a400', { ox: 0.5 }));
      } else {
        kid.setTint(0x555566).setFrame('sad');
        items.push(this.add.image(x + 200, y + 110, 'padlock').setScale(3));
        items.push(text(this, x + 120, y + 236, `Supera el capítulo ${i}`, 18, '#5a4a3a', { ox: 0.5, stroke: '#d9d4c7', strokeThickness: 2 }));
      }
    } else {
      items.push(this.add.image(x + 120, y + 170, 'sign').setScale(SCALE));
      items.push(text(this, x + 120, y + 150, 'EN\nCONSTRUCCIÓN', 18, '#2b1d2e', { ox: 0.5, oy: 0.5, align: 'center', stroke: '#c8955c', strokeThickness: 2 }));
    }
    const hit = this.add.zone(x, y, CARD_W, 300).setOrigin(0).setInteractive({ useHandCursor: true });
    items.push(hit);
    // Un clic en una tarjeta a medio ver solo la selecciona (y la desliza a la vista).
    hit.on('pointerdown', () => {
      if (i === this.index && this.isVisible(i)) this.enter();
      else this.select(i);
    });
    this.row.add(items);
    return { chap, frame, unlocked };
  }

  drawArrows() {
    const make = (x, label, d) => {
      const t = text(this, x, CARD_Y + 150, label, 40, '#ffd23f', { ox: 0.5, oy: 0.5 });
      t.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.select(Phaser.Math.Clamp(this.index + d, 0, this.cards.length - 1)));
      return t;
    };
    this.arrowL = make(44, '◀', -1);
    this.arrowR = make(W - 44, '▶', 1);
  }

  // Barra deslizable: el tramo dorado muestra qué capítulos se ven; se puede arrastrar o tocar la barra.
  drawSlider() {
    const n = this.cards.length;
    this.track = { x: W / 2 - 160, y: 448, w: 320 };
    const { x, y, w } = this.track;
    const bar = this.add.rectangle(x, y, w, 12, 0x000000, 0.5).setOrigin(0, 0.5).setStrokeStyle(2, 0xc9a66b);
    bar.setInteractive({ useHandCursor: true }).on('pointerdown', p => this.scrollTo(Math.round(((p.x - x) / w) * (n - VISIBLE)), true));
    this.thumbW = (w * VISIBLE) / n;
    this.thumb = this.add.rectangle(x, y, this.thumbW, 16, 0xffd23f).setOrigin(0, 0.5).setStrokeStyle(2, 0x2b1d2e);
    this.thumb.setInteractive({ useHandCursor: true, draggable: true });
    this.thumb.on('drag', p => {
      const frac = Phaser.Math.Clamp((p.x - x - this.thumbW / 2) / (w - this.thumbW), 0, 1);
      this.scrollTo(Math.round(frac * (n - VISIBLE)), true, false);
    });
    this.dots = CHAPTERS.map((_, i) => {
      const d = this.add.circle(x + ((i + 0.5) * w) / n, y + 22, 6, 0xffffff, 0.5);
      d.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.select(i));
      return d;
    });
  }

  isVisible(i) {
    return i >= this.first && i < this.first + VISIBLE;
  }

  // Desliza la fila. keepSelection: si el seleccionado queda fuera, se elige el más cercano visible.
  scrollTo(first, keepSelection, animate = true) {
    this.first = Phaser.Math.Clamp(first, 0, this.cards.length - VISIBLE);
    this.tweens.killTweensOf(this.row);
    const x = ROW_X - this.first * CARD_STEP;
    if (animate) this.tweens.add({ targets: this.row, x, duration: 220, ease: 'Quad.out' });
    else this.row.x = x;
    const { x: tx, w } = this.track;
    this.thumb.x = tx + ((w - this.thumbW) * this.first) / (this.cards.length - VISIBLE);
    if (keepSelection && !this.isVisible(this.index)) {
      this.select(Phaser.Math.Clamp(this.index, this.first, this.first + VISIBLE - 1), animate);
      return;
    }
    this.arrowL.setAlpha(this.index > 0 ? 1 : 0.3);
    this.arrowR.setAlpha(this.index < this.cards.length - 1 ? 1 : 0.3);
  }

  select(i, animate = true) {
    this.index = i;
    this.cards.forEach((c, k) => c.frame.setVisible(k === i));
    this.dots.forEach((d, k) => d.setFillStyle(k === i ? 0xffd23f : 0xffffff, k === i ? 1 : 0.5));
    let first = this.first;
    if (i < first) first = i;
    if (i >= first + VISIBLE) first = i - VISIBLE + 1;
    this.scrollTo(first, false, animate);
  }

  enter() {
    const card = this.cards[this.index];
    if (!card.unlocked) {
      this.cameras.main.shake(150, 0.004);
      return;
    }
    this.scene.start('LevelMap', { chapter: card.chap.data });
  }
}
