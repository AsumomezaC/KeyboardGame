// Diálogos de la historia con la estética de los RPG de consola portátil de finales de los 90:
// personajes de pie en el escenario y una caja de texto blanca de doble borde que se escribe
// letra por letra, con ▼ cuando puedes continuar.
import Phaser from 'phaser';
import { Music } from '../audio/music.js';
import { Panel } from '../ui/panel.js';
import { ROOM } from '../art/backgrounds.js';
import { RUNNERS } from '../art/index.js';
import { CAST } from '../data/cast.js';
import { addWeather } from './weather.js';
import { storyFor } from './flow.js';
import { W, SCALE, FEET_Y, GROUND_TOP, FONT, px, backdrop, keyLegend } from './common.js';

const CAM_Y = 110;            // la cámara baja para que los personajes queden sobre la caja de texto
const CHARS_PER_S = 45;
const BOX = { x: 16, y: 372, w: W - 32, h: 120 };
const AGE_SCALE = { 8: 3.6, 9: 3.7, 10: 4, 11: 4.15, 12: 4.3 };
const ROOMS = { casa: 'room-casa', tienda: 'room-tienda' };
const MOOD_FRAME = { idle: null, talk: 'talk', sad: 'sad', angry: 'angry', cry: 'cry', shock: 'shock', happy: 'cheer0', cheer: null };

export class DialogueScene extends Phaser.Scene {
  constructor() {
    super('Dialogue');
  }

  init(data) {
    this.chapter = data.chapter;
    this.level = data.level;
    this.part = data.part;
    this.then = data.then;
    this.canSkip = data.canSkip;
    this.index = -1;
    this.actors = {};
    this.typing = null;
    this.busy = false;
    this.done = false;
  }

  create() {
    const story = storyFor(this.chapter, this.level);
    this.story = story;
    this.sc = story[this.part];
    this.cameras.main.setScroll(0, CAM_Y);

    if (ROOMS[this.sc.place]) {
      this.add.rectangle(0, 0, W, GROUND_TOP, 0x2b1d2e).setOrigin(0);
      this.add.image(0, GROUND_TOP - ROOM.floor * SCALE, ROOMS[this.sc.place]).setOrigin(0).setScale(SCALE);
      this.weather = null;
    } else {
      backdrop(this, this.sc.place).scroll(this.sc.scroll ?? 0);
      this.weather = addWeather(this, this.sc.weather ?? story.weather);
    }
    for (const [id, x, face = 'right', mood = 'idle'] of this.sc.cast) this.spawn(id, x, face, mood);

    this.drawBox();
    const esc = () => this.onKey({ key: 'Escape' });
    keyLegend(this, [
      ['Enter', 'continuar', () => this.advance()],
      this.canSkip ? ['Esc', 'omitir historia', esc] : this.part === 'before' ? ['Esc', 'volver al mapa', esc] : null,
      ['M', 'música'],
    ].filter(Boolean));

    Music.play(this.sc.music || 'drama');
    Panel.show('none');
    this.input.keyboard.on('keydown', e => this.onKey(e));
    this.input.on('pointerdown', () => this.advance());
    this.next();
  }

  // ---------- escenario ----------

  spawn(id, x, face, mood) {
    const info = CAST[id];
    const key = info.sprite || id;
    let scale = 4;
    if (id === 'sofia' || id === 'dani') scale = AGE_SCALE[this.story.age ?? this.chapter.age] || 4;
    if (id === 'perro') scale = SCALE + 1;
    const sprite = this.add.sprite(x, FEET_Y, key, info.frame || 'idle0').setOrigin(0.5, 1).setScale(scale);
    sprite.setFlipX(face === 'left');
    const actor = { id, sprite, scale, baseY: FEET_Y };
    this.actors[id] = actor;
    // Papá se tambalea un poco.
    if (id === 'ramiro') this.tweens.add({ targets: sprite, angle: { from: -2, to: 2 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.setMood(actor, mood);
    return actor;
  }

  setMood(actor, mood) {
    if (!mood || actor.id === 'perro') return;
    const s = actor.sprite;
    if (mood === 'idle') s.play(`${actor.id}-idle`, true);
    else if (mood === 'cheer') s.play(`${actor.id}-cheer`, true);
    else {
      s.anims.stop();
      s.setFrame(MOOD_FRAME[mood] || 'idle0');
    }
  }

  enter(id, x, face) {
    const fromX = x > W / 2 ? W + 80 : -80;
    this.busy = true;
    const actor = this.spawn(id, fromX, face, 'idle');
    if (RUNNERS.includes(id)) actor.sprite.play(`${id}-run`);
    if (id === 'perro') actor.sprite.play('dog-run');
    this.tweens.add({
      targets: actor.sprite, x, duration: 650, ease: 'Quad.out',
      onComplete: () => {
        if (id === 'perro') actor.sprite.setTexture('dog', 'bark');
        else this.setMood(actor, 'idle');
        this.busy = false;
        this.next();
      },
    });
  }

  exit(id) {
    const actor = this.actors[id];
    if (!actor) return this.next();
    const s = actor.sprite;
    const toX = s.x > W / 2 ? W + 100 : -100;
    s.setFlipX(toX < s.x);
    if (RUNNERS.includes(id)) s.play(`${id}-run`);
    this.tweens.add({ targets: s, x: toX, duration: 450, ease: 'Quad.in', onComplete: () => s.destroy() });
    delete this.actors[id];
    this.busy = true;
    this.time.delayedCall(120, () => {
      this.busy = false;
      this.next();
    });
  }

  // ---------- caja de texto ----------

  drawBox() {
    const fixed = o => o.setScrollFactor(0).setDepth(50);
    const g = fixed(this.add.graphics());
    const { x, y, w, h } = BOX;
    g.fillStyle(0x000000, 0.3).fillRect(x + 4, y + 5, w, h);
    g.fillStyle(0x303048, 1).fillRect(x, y, w, h);
    g.fillStyle(0xf8f8f8, 1).fillRect(x + 4, y + 4, w - 8, h - 8);
    g.lineStyle(2, 0x8890a8, 1).strokeRect(x + 9, y + 9, w - 18, h - 18);
    this.nameG = fixed(this.add.graphics());
    this.nameText = fixed(this.add.text(x + 26, y - 30, '', { fontFamily: FONT, fontSize: px(20), fontStyle: 'normal', color: '#f8f8f8' }));
    this.body = fixed(this.add.text(x + 26, y + 20, '', {
      fontFamily: FONT, fontSize: px(23), color: '#303030', lineSpacing: 2,
      wordWrap: { width: w - 70, useAdvancedWrap: true },
    }));
    this.arrow = fixed(this.add.text(x + w - 40, y + h - 38, '▼', { fontFamily: FONT, fontSize: px(20), color: '#303048' })).setVisible(false);
    this.tweens.add({ targets: this.arrow, y: this.arrow.y + 5, duration: 350, yoyo: true, repeat: -1 });
  }

  showName(name) {
    this.nameG.clear();
    this.nameText.setText(name || '');
    if (!name) return;
    const { x, y } = BOX;
    const w = this.nameText.width + 30;
    this.nameG.fillStyle(0x303048, 1).fillRect(x + 12, y - 36, w, 40);
    this.nameG.fillStyle(0xe94f64, 1).fillRect(x + 15, y - 33, w - 6, 34);
  }

  type(str, narrator) {
    this.arrow.setVisible(false);
    this.body.setColor(narrator ? '#4a4a7a' : '#303030');
    this.body.setText('');
    const chars = Array.from(str);
    let shown = 0;
    this.typing?.remove();
    this.typing = this.time.addEvent({
      delay: 1000 / CHARS_PER_S,
      repeat: chars.length - 1,
      callback: () => {
        shown++;
        this.body.setText(chars.slice(0, shown).join(''));
        if (shown >= chars.length) this.finishTyping(str);
      },
    });
  }

  finishTyping(str) {
    this.typing?.remove();
    this.typing = null;
    this.body.setText(str);
    this.arrow.setVisible(true);
  }

  // ---------- avance ----------

  onKey(e) {
    if (e.key === 'Enter' || e.key === ' ') this.advance();
    else if (e.key === 'Escape') {
      if (this.canSkip) this.end();
      else if (this.part === 'before') this.scene.start('LevelMap', { chapter: this.chapter, select: this.level.id });
    } else if (e.key === 'm' || e.key === 'M') Music.toggleMute();
  }

  advance() {
    if (this.done || this.busy) return;
    if (this.typing) {
      this.finishTyping(this.current.t);
      return;
    }
    this.next();
  }

  next() {
    this.index++;
    const line = this.sc.lines[this.index];
    if (!line) {
      this.end();
      return;
    }
    if (line.music) Music.play(line.music);
    if (line.enter) {
      this.enter(line.enter, line.x, line.face);
      return;
    }
    if (line.exit) {
      this.exit(line.exit);
      return;
    }
    if (!line.t) {
      this.next();
      return;
    }
    this.current = line;
    const speaker = line.s ? this.actors[line.s] : null;
    if (speaker && line.m) this.setMood(speaker, line.m);
    // Quien habla queda al frente y a todo color; los demás se atenúan un poco.
    for (const a of Object.values(this.actors)) a.sprite.setTint(!line.s || a === speaker ? 0xffffff : 0xb8b8c8);
    if (speaker) {
      this.tweens.add({ targets: speaker.sprite, y: speaker.baseY - 8, duration: 110, yoyo: true });
    }
    this.fx(line.fx, speaker);
    this.showName(line.s ? CAST[line.s].name : null);
    this.type(line.t, !line.s);
  }

  // Efectos de telenovela: temblor, flash y el «triple zoom» dramático.
  fx(kind, speaker) {
    const cam = this.cameras.main;
    if (kind === 'shake') cam.shake(280, 0.012);
    else if (kind === 'flash') cam.flash(350, 255, 255, 255);
    else if (kind === 'zoom' && speaker) {
      const s = speaker.sprite;
      this.tweens.chain({
        targets: s,
        tweens: [1.12, 1.24, 1.36, 1].map((k, i) => ({ scale: speaker.scale * k, duration: i < 3 ? 90 : 300, hold: i < 3 ? 140 : 0 })),
      });
      cam.flash(120, 255, 255, 255);
    }
  }

  end() {
    if (this.done) return;
    this.done = true;
    this.typing?.remove();
    this.scene.start(this.then.key, this.then.data);
  }

  update(_, delta) {
    this.weather?.update(delta);
  }
}
