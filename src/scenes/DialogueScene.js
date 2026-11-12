// Diálogos de la historia con la estética de los RPG de consola portátil de finales de los 90:
// personajes de pie en el escenario y una caja de texto blanca de doble borde que se escribe
// letra por letra, con ▼ cuando puedes continuar. Cada personaje «balbucea» con su propia voz,
// marca sus emociones con el cuerpo y, cuando escucha, parpadea y reacciona sin robar atención.
// La cámara solo se mueve en los momentos marcados con fx (temblor, destello, zoom).
import Phaser from 'phaser';
import { Music } from '../audio/music.js';
import { Panel } from '../ui/panel.js';
import { ROOM } from '../art/backgrounds.js';
import { RUNNERS } from '../art/index.js';
import { CAST, NARRATOR_VOICE } from '../data/cast.js';
import { BLINKABLE } from '../art/kid.js';
import { addWeather } from './weather.js';
import { storyFor } from './flow.js';
import { W, SCALE, FEET_Y, GROUND_TOP, FONT, px, backdrop, keyLegend, openSettings } from './common.js';

const CAM_Y = 110;            // la cámara baja para que los personajes queden sobre la caja de texto
const CHARS_PER_S = 45;
const BOX = { x: 16, y: 372, w: W - 32, h: 120 };
const AGE_SCALE = { 8: 3.6, 9: 3.7, 10: 4, 11: 4.15, 12: 4.3 };
const ROOMS = { casa: 'room-casa', tienda: 'room-tienda' };
const MOOD_FRAME = { idle: null, talk: 'talk', sad: 'sad', angry: 'angry', cry: 'cry', shock: 'shock', happy: 'cheer0', cheer: null };
const BLINK_MS = 130;
const BLINK_EVERY = [2200, 5200]; // cada cuánto parpadea alguien que escucha (al azar en este rango)

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
      backdrop(this, this.sc.place, { seed: `${this.level.id}-${this.part}` }).scroll(this.sc.scroll ?? 0);
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
    const actor = { id, sprite, scale, baseY: FEET_Y, mood: 'idle', poseTweens: [], nextBlink: this.time.now + Phaser.Math.Between(...BLINK_EVERY) };
    this.actors[id] = actor;
    // Papá se tambalea un poco.
    if (id === 'ramiro') this.tweens.add({ targets: sprite, angle: { from: -2, to: 2 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.setMood(actor, mood);
    return actor;
  }

  setMood(actor, mood) {
    if (!mood || actor.id === 'perro') return;
    actor.mood = mood;
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

  // Escribe la línea letra por letra con la voz de quien habla: una sílaba cada dos letras
  // (cada tres para el narrador). La velocidad depende de la voz y del gesto.
  type(str, speakerId, mood) {
    this.arrow.setVisible(false);
    this.body.setColor(speakerId ? '#303030' : '#4a4a7a');
    this.body.setText('');
    const voice = speakerId ? CAST[speakerId].voice : NARRATOR_VOICE;
    const every = speakerId ? 2 : 3;
    const moodSpeed = { sad: 0.8, cry: 0.75, angry: 1.15, shock: 1.1 }[mood] || 1;
    const chars = Array.from(str);
    let shown = 0;
    this.typing?.remove();
    this.typing = this.time.addEvent({
      delay: 1000 / (CHARS_PER_S * (voice?.speed || 1) * moodSpeed),
      repeat: chars.length - 1,
      callback: () => {
        const ch = chars[shown];
        shown++;
        this.body.setText(chars.slice(0, shown).join(''));
        if (shown % every === 1) Music.voice(voice, ch, mood);
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
    } else if (e.key === 'm' || e.key === 'M') openSettings(this);
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
    this.speaker = speaker;
    // Quien habla queda al frente y a todo color; los demás se atenúan un poco.
    for (const a of Object.values(this.actors)) a.sprite.setTint(!line.s || a === speaker ? 0xffffff : 0xb8b8c8);
    if (speaker) this.emote(speaker, line.m || speaker.mood);
    this.fx(line.fx, speaker);
    this.react(line, speaker);
    this.showName(line.s ? CAST[line.s].name : null);
    this.type(line.t, line.s, speaker ? speaker.mood : null);
  }

  // Detiene el gesto anterior de un personaje y lo deja en su postura normal (sin tocar el
  // tambaleo de papá, que es otra animación).
  resetPose(actor) {
    for (const t of actor.poseTweens || []) t.stop();
    actor.poseTweens = [];
    const s = actor.sprite;
    actor.baseX ??= s.x;
    s.x = actor.baseX;
    s.y = actor.baseY;
    s.setScale(actor.scale);
  }

  pose(actor, tween) {
    actor.poseTweens.push(tween);
    return tween;
  }

  // Movimiento del cuerpo según la emoción de quien habla (la cámara no se mueve).
  emote(actor, mood) {
    const s = actor.sprite;
    const flip = s.flipX ? -1 : 1;
    this.resetPose(actor);
    const sc = actor.scale;
    const add = cfg => this.pose(actor, this.tweens.add({ targets: s, ...cfg }));
    const chain = tweens => this.pose(actor, this.tweens.chain({ targets: s, tweens }));
    switch (mood) {
      case 'angry':
        // pisotón y sacudida corta
        chain([
          { scaleY: sc * 0.9, scaleX: sc * 1.06, duration: 70 },
          { scaleY: sc, scaleX: sc, duration: 90 },
          { x: actor.baseX + 3, duration: 40, yoyo: true, repeat: 2 },
        ]);
        break;
      case 'shock':
        // brinco hacia atrás
        chain([
          { y: actor.baseY - 16, x: actor.baseX - 8 * flip, duration: 110, ease: 'Quad.out' },
          { y: actor.baseY, duration: 140, ease: 'Quad.in' },
          { x: actor.baseX, duration: 260, ease: 'Sine.inOut' },
        ]);
        break;
      case 'sad':
        // se encoge un poco y se queda así
        add({ scaleY: sc * 0.95, y: actor.baseY + 2, duration: 420, ease: 'Sine.out' });
        break;
      case 'cry':
        // tiembla mientras llora
        add({ x: actor.baseX + 1.5, duration: 60, yoyo: true, repeat: 7 });
        add({ scaleY: sc * 0.96, duration: 300 });
        break;
      case 'happy':
        add({ y: actor.baseY - 10, duration: 120, yoyo: true, repeat: 1, ease: 'Quad.out' });
        break;
      case 'cheer':
        add({ y: actor.baseY - 14, duration: 140, yoyo: true, repeat: 2, ease: 'Quad.out' });
        break;
      default:
        // hablar normal: un pequeño rebote al empezar
        add({ y: actor.baseY - 8, duration: 110, yoyo: true });
    }
  }

  // Quien escucha reacciona sin resaltarse: se sobresalta con un grito o un golpe dramático y
  // parpadea de sorpresa con una revelación.
  react(line, speaker) {
    const listeners = Object.values(this.actors).filter(a => a !== speaker && a.id !== 'perro');
    if (line.fx === 'shake' || line.fx === 'zoom') {
      for (const a of listeners) {
        const s = a.sprite;
        const away = speaker ? Math.sign(s.x - speaker.sprite.x) || 1 : 0;
        // conserva la postura (p. ej. encogido de tristeza) pero sin gestos a medias
        const y0 = s.y;
        this.resetPose(a);
        s.y = y0;
        this.pose(a, this.tweens.chain({ targets: s, tweens: [
          { x: a.baseX + 6 * away, y: y0 - 5, duration: 90, ease: 'Quad.out' },
          { x: a.baseX, y: y0, duration: 240, ease: 'Sine.inOut', delay: 120 },
        ] }));
      }
    } else if (line.fx === 'flash') {
      for (const a of listeners) this.blink(a, 2);
    }
  }

  // Parpadeo: cambia un momento al cuadro con ojos cerrados del gesto actual.
  blink(actor, times = 1) {
    const s = actor.sprite;
    const name = s.frame?.name;
    if (!name || !BLINKABLE.includes(name) || actor.blinking) return;
    actor.blinking = true;
    const playing = s.anims.isPlaying;
    if (playing) s.anims.pause();
    const close = () => s.active && s.setFrame(`${name}_b`);
    const open = () => s.active && s.setFrame(name);
    close();
    this.time.delayedCall(BLINK_MS, () => {
      open();
      if (times > 1) {
        this.time.delayedCall(110, () => {
          close();
          this.time.delayedCall(BLINK_MS, () => { open(); this.endBlink(actor, playing); });
        });
      } else this.endBlink(actor, playing);
    });
  }

  endBlink(actor, playing) {
    actor.blinking = false;
    if (playing && actor.sprite.active) actor.sprite.anims.resume();
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

  update(time, delta) {
    this.weather?.update(delta);
    // Quien no está hablando parpadea de vez en cuando.
    for (const a of Object.values(this.actors)) {
      if (a === this.speaker || a.id === 'perro' || time < a.nextBlink) continue;
      a.nextBlink = time + Phaser.Math.Between(...BLINK_EVERY);
      this.blink(a);
    }
  }
}
