// La carrera: dibuja lo que calcula Runner y conecta el teclado con él.
import Phaser from 'phaser';
import { Runner, BASE_SPEED } from '../game/runner.js';
import { levelRules } from '../game/rules.js';
import { hintFor } from '../game/hints.js';
import { TypeInput } from '../core/input.js';
import { fingerOf } from '../core/fingers.js';
import * as Layout from '../core/layout.js';
import { Panel } from '../ui/panel.js';
import { levelName } from '../data/chapter1.js';
import { W, SCALE, FEET_Y, FONT, INK, text, backdrop, formatTime } from './common.js';
import { addWeather } from './weather.js';
import { storyFor, finishLevel } from './flow.js';
import { CORRE } from '../data/story1.js';
import { Music } from '../audio/music.js';

const PLAYER_X = 230;
const COUNTDOWN_MS = 3000;
const PROPS = {
  flat: { key: 'chalk', y: 4, h: 0 },
  puddle: { key: 'puddle', y: 6, h: 24 },
  fence: { key: 'fence', y: 2, h: 81 },
  chair: { key: 'chair', y: 2, h: 66 },
};
const LABEL_STYLE = size => ({ fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', stroke: INK, strokeThickness: 5 });

export class RunScene extends Phaser.Scene {
  constructor() {
    super('Run');
  }

  init(data) {
    this.chapter = data.chapter;
    this.level = data.level;
    // Phaser reutiliza la instancia de la escena: limpiar lo que solo existe en ciertos niveles.
    this.dog = null;
    this.rivals = null;
    this.buddy = null;
    this.story = !!data.story;
    this.phraseFor = new Map(); // frase elegida para cada obstáculo ya escrito
  }

  create() {
    const level = this.level;
    this.rules = levelRules(level);
    this.runner = new Runner(level, { getupMs: this.rules.getupMs, limitMs: this.rules.limitMs, maxFalls: this.rules.maxFalls });
    this.bg = backdrop(this, level.theme);
    this.tale = storyFor(this.chapter, level);
    this.weather = addWeather(this, this.tale?.weather);
    Music.play(this.tale?.music || { dog: 'perro', race: 'final', secret: 'secreto' }[level.kind] || 'carrera');
    // Compañía que corre detrás de Sofía (Dani en el nivel 3).
    if (this.tale?.companion) {
      this.buddy = this.add.sprite(PLAYER_X - 70, FEET_Y - 4, this.tale.companion, 'idle0').setOrigin(0.5, 1).setScale(SCALE * 0.95);
    }
    this.countdownLeft = COUNTDOWN_MS;
    this.ended = false;

    this.obstacleViews = this.runner.obstacles.map(o => this.createObstacleView(o));
    this.finish = this.add.image(0, FEET_Y + 4, 'finish').setOrigin(0, 1).setScale(SCALE);

    if (level.kind === 'race') {
      this.rivals = this.rules.rivals.map((r, i) => ({
        ...r,
        sprite: this.add.sprite(0, FEET_Y - 6 - i * 3, `rival${'ABC'[i]}`).setOrigin(0.5, 1).setScale(SCALE * 0.9).play(`rival${'ABC'[i]}-run`).setAlpha(0.9),
      }));
    }
    if (level.kind === 'dog') {
      this.dog = this.add.sprite(PLAYER_X - 260, FEET_Y, 'dog').setOrigin(0.5, 1).setScale(SCALE).play('dog-run');
      this.dogGap = 260;
    }
    this.player = this.add.sprite(PLAYER_X, FEET_Y, 'sofia', 'idle0').setOrigin(0.5, 1).setScale(SCALE);
    this.timerBar = this.add.graphics();
    this.createHud();
    this.fx = this.add.particles(0, 0, 'drop', { lifespan: 500, speed: { min: 80, max: 220 }, angle: { min: 200, max: 340 }, gravityY: 700, scale: 3, emitting: false });
    this.dust = this.add.particles(0, 0, 'dust', { lifespan: 400, speed: { min: 30, max: 90 }, angle: { min: 180, max: 360 }, scale: 3, alpha: { start: 1, end: 0 }, emitting: false });

    this.countText = text(this, W / 2, 200, '3', 110, '#ffd23f', { ox: 0.5, oy: 0.5, strokeThickness: 12 });
    text(this, W / 2, 280, levelName(level), 28, '#ffffff', { ox: 0.5, oy: 0.5 }).setName('title');

    Panel.show('play');
    Panel.setBroken(false);
    Panel.setTip('');
    Panel.setCapsContext(true);
    Panel.showHands(true);
    Panel.keyboard.showFingers(true);
    this.refreshTarget();

    TypeInput.start({
      onKey: e => {
        if (e.key === 'Escape') this.leave();
        else Panel.keyboard.press(e.code);
      },
      onChar: ch => this.onChar(ch),
    });
    this.game.events.on('caps', this.refreshTarget, this);
    this.events.once('shutdown', () => {
      this.game.events.off('caps', this.refreshTarget, this);
      TypeInput.stop();
      Panel.setCapsContext(false);
      Panel.keyboard.showFingers(false);
      Panel.setBroken(false);
    });
  }

  createObstacleView(o) {
    const prop = PROPS[o.type];
    const sprite = this.add.image(0, FEET_Y + prop.y, prop.key).setOrigin(0, 1).setScale(SCALE);
    const label = this.add.container(0, 0);
    // Placa oscura detrás del texto: se lee igual sobre cielo claro, lluvia o niebla.
    const plate = this.add.graphics();
    const parts = [0, 1, 2].map(() => this.add.text(0, 0, '', LABEL_STYLE(20)));
    label.add([plate, ...parts]);
    return { o, sprite, label, plate, parts, prop, key: '' };
  }

  createHud() {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.45).fillRect(0, 0, W, 44);
    this.clockText = text(this, 16, 10, '0.0 s', 22);
    this.rightText = text(this, W - 16, 10, '', 20, '#ffffff', { ox: 1 });
    // mini mapa del recorrido
    this.mapG = this.add.graphics();
    this.mapX0 = 330;
    this.mapX1 = 640;
  }

  // ---------- entrada ----------

  onChar(ch) {
    if (this.countdownLeft > 0 || this.ended) return;
    const res = this.runner.type(ch);
    if (res.ignored) return;
    if (!res.ok) this.onStumble(res.expected, ch);
  }

  onStumble(expected, got) {
    this.cameras.main.shake(120, 0.004);
    if (got !== expected && got.toLowerCase() === expected.toLowerCase()) {
      if (TypeInput.isCapsLock() && !this.level.allowCaps) Panel.setTip('Salió en mayúscula porque Bloq Mayús está activo.');
      else {
        const combo = Layout.comboFor(expected);
        Panel.setTip(combo && combo.steps && combo.steps.length > 1
          ? `Salió «${got}»: suelta Shift después de la primera tecla y antes de la segunda.`
          : `Salió «${got}»: revisa Shift o Bloq Mayús.`);
      }
    } else {
      Panel.setTip(`Escribiste «${got === ' ' ? 'espacio' : got}» en vez de «${expected === ' ' ? 'espacio' : expected}». ¡Traspié!`, 1800);
    }
  }

  refreshTarget() {
    const o = this.runner.targetObstacle;
    if (!o || this.runner.mustRun) {
      Panel.setTarget(null, 0, o ? this.runPhrase(o) : undefined);
      Panel.setHints('');
      Panel.keyboard.clear();
      return;
    }
    Panel.setTarget(o.chars, o.typed);
    const capsLock = TypeInput.isCapsLock();
    const h = hintFor(o.chars, o.typed, { capsLock, allowCaps: !!this.level.allowCaps });
    Panel.setHints(h.main, h.alt);
    Panel.keyboard.highlight(o.chars[o.typed], { capsLock });
    if (h.codes) Panel.keyboard.highlightCodes(h.codes);
    if (h.altCodes.length) Panel.keyboard.highlightAlt(h.altCodes);
  }

  // Al terminar un obstáculo: casi siempre «¡Corre!», a veces una frase del momento de la historia.
  runPhrase(o) {
    if (!this.phraseFor.has(o)) {
      const phrases = this.tale?.phrases || [];
      const rate = this.tale?.correRate ?? 0.5;
      this.phraseFor.set(o, !phrases.length || Math.random() < rate ? CORRE : Phaser.Utils.Array.GetRandom(phrases));
    }
    return this.phraseFor.get(o);
  }

  leave() {
    this.scene.start('LevelMap', { chapter: this.chapter, select: this.level.id });
  }

  // ---------- bucle ----------

  update(_, delta) {
    const dt = Math.min(delta, 50);
    if (this.countdownLeft > 0) {
      this.countdownLeft -= dt;
      const n = Math.ceil(this.countdownLeft / 1000);
      this.countText.setText(n > 0 ? String(n) : '¡YA!');
      if (this.countdownLeft <= 0) this.startRun();
      this.draw(0);
      return;
    }
    if (this.countText.visible && this.runner.clock > 600) this.countText.setVisible(false);
    if (!this.ended) {
      this.runner.update(dt);
      for (const e of this.runner.drainEvents()) this.handleEvent(e);
    }
    this.draw(dt);
  }

  startRun() {
    this.countdownLeft = 0;
    this.children.getByName('title').destroy();
    Panel.showHands(false);
    Panel.keyboard.showFingers(false);
    this.refreshTarget();
  }

  handleEvent(e) {
    switch (e.type) {
      case 'char':
      case 'passed':
        this.refreshTarget();
        break;
      case 'trip':
        this.onTrip(e.obstacle);
        break;
      case 'getup':
        Panel.setBroken(false);
        this.refreshTarget();
        break;
      case 'finish':
      case 'fail':
        this.end();
        break;
    }
  }

  onTrip(o) {
    Panel.setBroken(true);
    Panel.setTip('');
    this.refreshTarget();
    const view = this.obstacleViews.find(v => v.o === o);
    const x = PLAYER_X + 40;
    if (o.type === 'puddle') this.fx.explode(18, x, FEET_Y);
    else this.dust.explode(12, x, FEET_Y);
    if (o.type === 'chair' && view) {
      this.tweens.add({ targets: view.sprite, angle: 75, duration: 250, yoyo: true, hold: Math.max(0, this.rules.getupMs - 600) });
    }
    this.cameras.main.shake(200, 0.008);
    if (this.dog) {
      const bark = text(this, this.dog.x, FEET_Y - 90, '¡GUAU!', 22, '#ffd23f', { ox: 0.5 });
      this.tweens.add({ targets: bark, y: bark.y - 30, alpha: 0, duration: 900, onComplete: () => bark.destroy() });
    }
  }

  end() {
    this.ended = true;
    Panel.setBroken(false);
    TypeInput.stop();
    const result = this.runner.result();
    if (this.rivals) result.place = 1 + this.rivals.filter(r => r.timeMs < result.timeMs).length;
    let msg = '¡META!';
    if (!result.passed) msg = { time: this.level.kind === 'race' ? '¡Te ganaron!' : '¡Se acabó el tiempo!', caught: '¡El perro te alcanzó!' }[result.failReason];
    const banner = text(this, W / 2, 210, msg, 60, result.passed ? '#ffd23f' : '#ff6b6b', { ox: 0.5, oy: 0.5, strokeThickness: 10 });
    banner.setScale(0.2);
    this.tweens.add({ targets: banner, scale: 1, duration: 300, ease: 'Back.out' });
    if (result.passed) this.player.play('sofia-cheer');
    else this.player.setTexture('sofia', result.failReason === 'caught' ? 'down' : 'sad');
    if (this.buddy) this.buddy.play(result.passed ? 'dani-cheer' : 'dani-idle');
    this.time.delayedCall(1800, () => finishLevel(this, this.chapter, this.level, result, { story: this.story }));
  }

  // ---------- dibujo ----------

  screenX(worldX) {
    return PLAYER_X + (worldX - this.runner.x);
  }

  draw(dt) {
    const r = this.runner;
    this.bg.scroll(r.x);
    for (const v of this.obstacleViews) this.drawObstacle(v);
    this.finish.x = this.screenX(r.finishX + 20);
    this.drawTimerBar();
    if (!this.ended) this.drawPlayer();
    if (this.rivals) {
      for (const rv of this.rivals) {
        const wx = r.finishX * Math.min(1, r.clock / rv.timeMs);
        rv.sprite.x = this.screenX(wx);
        rv.sprite.setVisible(rv.sprite.x > -60 && rv.sprite.x < W + 60);
        if (wx >= r.finishX) rv.sprite.anims.stop();
      }
    }
    if (this.dog) this.drawDog(dt);
    if (this.buddy && !this.ended) this.drawBuddy(dt);
    this.weather.update(dt);
    this.drawHud();
  }

  drawObstacle(v) {
    const { o, sprite, label, parts } = v;
    const sx = this.screenX(o.x);
    const visible = sx > -200 && sx < W + 200;
    sprite.setVisible(visible);
    label.setVisible(visible && !(o.done && this.runner.x >= o.start));
    if (!visible) return;
    sprite.x = sx;
    const isTarget = this.runner.targetObstacle === o && !this.runner.mustRun;
    const key = `${o.typed}|${isTarget}|${o.done}`;
    if (key !== v.key) {
      v.key = key;
      const shown = o.chars.map(c => (c === ' ' ? '·' : c));
      const size = isTarget ? 26 : 20;
      const segs = o.done
        ? [[shown.join(''), '#9be7a8'], ['', '#fff'], ['', '#fff']]
        : [[shown.slice(0, o.typed).join(''), '#7bd389'], [shown[o.typed] || '', isTarget ? '#ffd23f' : '#ffffff'], [shown.slice(o.typed + 1).join(''), '#ffffff']];
      let x = 0;
      segs.forEach(([str, color], i) => {
        parts[i].setStyle(LABEL_STYLE(size)).setColor(color).setText(str).setX(x);
        x += parts[i].width - (str ? 5 : 0);
      });
      v.labelW = x;
      const h = parts[0].height || size * 1.4;
      v.plate.clear().fillStyle(0x1d1b33, 0.55).fillRoundedRect(-8, -2, x + 16, h + 4, 8);
    }
    label.x = sx + (o.w - v.labelW) / 2;
    label.y = FEET_Y - v.prop.h - 54;
  }

  drawTimerBar() {
    const g = this.timerBar;
    g.clear();
    const r = this.runner;
    const o = r.timedObstacle;
    const left = r.timeLeftMs(o);
    if (left == null || r.phase !== 'run') return;
    const frac = left / o.windowMs;
    const x = this.screenX(o.x) + o.w / 2 - 40;
    const y = FEET_Y - PROPS[o.type].h - 16;
    const color = frac > 0.5 ? 0x7bd389 : frac > 0.25 ? 0xffd23f : 0xff6b6b;
    g.fillStyle(0x2b1d2e, 0.8).fillRect(x - 2, y - 2, 84, 10);
    g.fillStyle(color, 1).fillRect(x, y, 80 * frac, 6);
  }

  drawPlayer() {
    const r = this.runner;
    const p = this.player;
    p.y = FEET_Y;
    p.angle = 0;
    if (r.phase === 'fallen') {
      p.anims.stop();
      const t = r.clock - r.trippedAt;
      const up = r.getupMs;
      p.setFrame(t < 250 ? 'trip' : t < up - 450 ? 'down' : t < up - 200 ? 'getup' : 'ready');
      return;
    }
    const o = r.timedObstacle;
    if (o && o.done && r.x >= o.start) {
      const prog = Phaser.Math.Clamp((r.x - o.start) / (o.end - o.start), 0, 1);
      if (o.type === 'puddle') {
        p.anims.stop();
        p.setFrame('hop');
        p.y = FEET_Y - Math.sin(Math.PI * prog) * 48;
        return;
      }
      if (o.type === 'fence') {
        p.anims.stop();
        p.setFrame(prog > 0.1 && prog < 0.9 ? 'slide' : 'ready');
        if (Math.random() < 0.3) this.dust.explode(1, PLAYER_X - 20, FEET_Y);
        return;
      }
      if (o.type === 'chair') {
        p.anims.stop();
        p.setFrame(prog > 0.15 && prog < 0.85 ? 'tuck' : 'hop');
        p.y = FEET_Y - Math.sin(Math.PI * prog) * 150;
        p.angle = 360 * Phaser.Math.Clamp((prog - 0.15) / 0.7, 0, 1);
        return;
      }
    }
    if (r.holding) {
      p.anims.stop();
      p.setFrame('ready');
      return;
    }
    if (p.anims.currentAnim?.key !== 'sofia-run' || !p.anims.isPlaying) p.play('sofia-run');
    p.anims.timeScale = Phaser.Math.Clamp(r.v / BASE_SPEED, 0.5, 2.5);
  }

  // Dani corre un poco detrás y se detiene cuando Sofía se detiene.
  drawBuddy(dt) {
    const r = this.runner;
    const b = this.buddy;
    const moving = r.phase === 'run' && r.v > 30 && this.countdownLeft <= 0;
    const targetX = PLAYER_X - 70 - (r.phase === 'fallen' ? -40 : 0) + Math.sin(r.clock / 700) * 10;
    b.x += (targetX - b.x) * Math.min(1, dt / 300);
    const key = `${b.texture.key}-run`;
    if (moving) {
      if (b.anims.currentAnim?.key !== key || !b.anims.isPlaying) b.play(key);
      b.anims.timeScale = Phaser.Math.Clamp(r.v / BASE_SPEED, 0.6, 2.2);
    } else {
      b.anims.stop();
      b.setFrame(r.phase === 'fallen' ? 'shock' : 'ready');
    }
  }

  drawDog(dt) {
    const target = 260 - this.runner.falls * 60;
    const caught = this.runner.failReason === 'caught';
    this.dogGap += ((caught ? 30 : target) - this.dogGap) * Math.min(1, dt / 400);
    this.dog.x = PLAYER_X - this.dogGap;
    if (this.runner.phase === 'fallen' || caught) {
      this.dog.anims.stop();
      this.dog.setFrame('bark');
    } else if (!this.dog.anims.isPlaying) this.dog.play('dog-run');
  }

  drawHud() {
    const r = this.runner;
    const clock = this.countdownLeft > 0 ? 0 : r.clock;
    let left = formatTime(clock);
    if (this.rules.limitMs && this.level.kind !== 'race') left += ` / ${formatTime(this.rules.limitMs)}`;
    this.clockText.setText(left);
    this.clockText.setColor(this.rules.limitMs && this.level.kind !== 'race' && this.rules.limitMs - clock < 10000 ? '#ff6b6b' : '#ffffff');
    let right = this.dog ? `Caídas ${r.falls}/${this.rules.maxFalls}` : `Caídas ${r.falls}`;
    if (this.rivals) {
      const place = 1 + this.rivals.filter(rv => r.finishX * Math.min(1, r.clock / rv.timeMs) > r.x).length;
      right = `Lugar ${place}°   ` + right;
    }
    this.rightText.setText(right);

    const g = this.mapG;
    g.clear();
    const span = this.mapX1 - this.mapX0;
    const mx = wx => this.mapX0 + span * Phaser.Math.Clamp(wx / r.finishX, 0, 1);
    g.fillStyle(0xffffff, 0.35).fillRect(this.mapX0, 21, span, 3);
    for (const o of r.obstacles) g.fillStyle(o.passed ? 0x7bd389 : 0xffffff, 0.8).fillRect(mx(o.x), 18, 2, 9);
    g.fillStyle(0xffffff, 1).fillRect(this.mapX1 - 2, 12, 4, 18);
    if (this.rivals) {
      const colors = [0x4cc9f0, 0x80ed99, 0xb388ff];
      this.rivals.forEach((rv, i) => g.fillStyle(colors[i], 1).fillCircle(mx(r.finishX * Math.min(1, r.clock / rv.timeMs)), 22, 5));
    }
    if (this.dog) g.fillStyle(0x3b2f2a, 1).fillCircle(mx(Math.max(0, r.x - this.dogGap)), 22, 5);
    g.fillStyle(0xe94f64, 1).fillCircle(mx(r.x), 22, 7);
    g.lineStyle(2, 0x2b1d2e, 1).strokeCircle(mx(r.x), 22, 7);
  }
}

// Dedos a resaltar para un carácter (para lecciones).
export function fingersFor(ch) {
  if (ch === ' ') return ['L-thumb', 'R-thumb'];
  const combo = Layout.comboFor(ch);
  if (!combo || !combo.steps) return [];
  const f = fingerOf(combo.steps[combo.steps.length - 1].code);
  return f ? [`${f.hand}-${f.finger}`] : [];
}
