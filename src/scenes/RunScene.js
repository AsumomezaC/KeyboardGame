// La carrera: dibuja lo que calcula Runner y conecta el teclado con él.
// También mueve a quien corre con Sofía (crew): quien la acompaña, quien la persigue, los rivales
// y a quien hay que alcanzar. Todos saltan los mismos obstáculos al pasar por ellos.
import Phaser from 'phaser';
import { Runner, BASE_SPEED } from '../game/runner.js';
import { levelRules, scheduledMs } from '../game/rules.js';
import { hintFor } from '../game/hints.js';
import { TypeInput } from '../core/input.js';
import { fingerOf } from '../core/fingers.js';
import * as Layout from '../core/layout.js';
import { Panel } from '../ui/panel.js';
import { levelName } from '../data/chapters.js';
import { CORRE, CAST } from '../data/cast.js';
import { rng } from '../data/rng.js';
import { W, SCALE, FEET_Y, FONT, INK, px, text, backdrop, formatTime } from './common.js';
import { addWeather } from './weather.js';
import { storyFor, finishLevel } from './flow.js';
import { Music } from '../audio/music.js';

const PLAYER_X = 230;
const COUNTDOWN_MS = 3000;
const CREW_SPEED = 720;       // px/s máximos para alcanzar su lugar
const LEAVE_SPEED = 950;      // px/s cuando alguien abandona a Sofía
const CLUMSY_CHANCE = 0.3;
const CLUMSY_DOWN_MS = 900;
const PACE_HEAD = 300;        // ventaja inicial de quien hay que alcanzar
const PACE_LEAD = 160;        // distancia mínima que mantiene adelante...
const PACE_TIRED_AT = 0.85;   // ...hasta esta fracción del recorrido
const PACE_TIRED_SPEED = 0.7; // después corre al 70 % de la velocidad de Sofía
const PROPS = {
  flat: { key: 'chalk', y: 4, h: 0 },
  puddle: { key: 'puddle', y: 6, h: 24 },
  fence: { key: 'fence', y: 2, h: 81 },
  chair: { key: 'chair', y: 2, h: 66 },
  table: { key: 'table', y: 2, h: 60 },
  wall: { key: 'wall', y: 8, h: 130 },
  hole: { key: 'hole', y: 30, h: 0 },
};
const LABEL_STYLE = size => ({ fontFamily: FONT, fontSize: px(size), fontStyle: 'normal', stroke: INK, strokeThickness: 5 });
const DOT_COLORS = [0x4cc9f0, 0x80ed99, 0xb388ff, 0xf4a261];
const WALL_RUN_HEIGHT = 78;   // a qué altura de la barda corre
const WALL_TILT = 16;         // inclinación hacia la pared mientras corre en ella
const TRAIL_EVERY_MS = 55;    // cada cuánto deja una silueta en la estela

// Cómo se ve alguien mientras pasa un obstáculo (prog de 0 a 1).
// frame: cuadro fijo; run: sigue con la animación de correr; dy: altura; angle: giro.
function obstaclePose(type, prog) {
  const arc = Math.sin(Math.PI * prog);
  switch (type) {
    case 'puddle': return { frame: 'hop', dy: -arc * 48 };
    case 'fence': return { frame: prog > 0.1 && prog < 0.9 ? 'slide' : 'ready', dy: 0, dust: true };
    case 'chair': return { frame: prog > 0.15 && prog < 0.85 ? 'tuck' : 'hop', dy: -arc * 150, angle: 360 * Phaser.Math.Clamp((prog - 0.15) / 0.7, 0, 1) };
    case 'table': {
      const top = PROPS.table.h;
      if (prog < 0.2) return { frame: 'hop', dy: -top * (prog / 0.2) - Math.sin(Math.PI * prog / 0.2) * 16 };
      if (prog > 0.85) return { frame: 'hop', dy: -top * (1 - (prog - 0.85) / 0.15) };
      return { frame: 'slide', dy: -top, dust: true };
    }
    case 'wall': {
      // Carrera por la pared, como en los juegos de parkour: brinca a la barda, corre a lo largo
      // de ella inclinada (con estela) sobre el cemento fresco y se impulsa con una voltereta.
      const H = WALL_RUN_HEIGHT;
      if (prog < 0.2) {
        const q = prog / 0.2;
        return { frame: 'hop', dy: -H * q - Math.sin(Math.PI * q) * 18, angle: -WALL_TILT * q };
      }
      if (prog < 0.76) {
        const q = (prog - 0.2) / 0.56;
        return { run: true, dy: -H - Math.sin(Math.PI * q) * 12, angle: -WALL_TILT, trail: true, spark: true };
      }
      const q = (prog - 0.76) / 0.24;
      return { frame: q < 0.75 ? 'tuck' : 'hop', dy: -H * (1 - q) - Math.sin(Math.PI * q) * 45, angle: 360 * Math.min(1, q / 0.75) };
    }
    case 'hole': return { frame: 'fly', dy: -arc * 150 };
    default: return null;
  }
}

export class RunScene extends Phaser.Scene {
  constructor() {
    super('Run');
  }

  init(data) {
    this.chapter = data.chapter;
    this.level = data.level;
    // Phaser reutiliza la instancia de la escena: limpiar lo que solo existe en ciertos niveles.
    this.crew = [];
    this.story = !!data.story;
    this.phraseFor = new Map(); // frase elegida para cada obstáculo ya escrito
  }

  create() {
    const level = this.level;
    this.hero = level.hero || 'sofia';
    this.rules = levelRules(level);
    this.runner = new Runner(level, {
      getupMs: this.rules.getupMs, limitMs: this.rules.limitMs, maxFalls: this.rules.maxFalls, maxErrors: this.rules.maxErrors,
    });
    this.bg = backdrop(this, level.theme);
    this.tale = storyFor(this.chapter, level);
    this.weather = addWeather(this, this.tale?.weather);
    const bossMusic = { race: 'final', chase: 'perro', catch: 'perro' }[level.boss?.type];
    Music.play(this.tale?.music || bossMusic || (level.kind === 'secret' ? 'secreto' : 'carrera'));
    this.countdownLeft = COUNTDOWN_MS;
    this.ended = false;

    this.obstacleViews = this.runner.obstacles.map(o => this.createObstacleView(o));
    this.finish = this.add.image(0, FEET_Y + 4, 'finish').setOrigin(0, 1).setScale(SCALE);
    // Quien corre con Sofía va detrás de ella en pantalla.
    const rand = rng(level.id);
    this.crew = level.crew.map((def, i) => this.createCrewMember(def, i, rand));
    this.player = this.add.sprite(PLAYER_X, FEET_Y, this.hero, 'idle0').setOrigin(0.5, 1).setScale(SCALE);
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

  createCrewMember(def, i, rand) {
    const dog = def.id === 'perro';
    const key = CAST[def.id]?.sprite || def.id;
    const sprite = this.add.sprite(0, FEET_Y, key, dog ? 'run0' : 'idle0').setOrigin(0.5, 1).setScale(SCALE * 0.95);
    if (dog) sprite.play('dog-run');
    let x = 0;
    if (def.mode === 'follow') x = def.lead;
    if (def.mode === 'pace') x = PACE_HEAD;
    if (def.mode === 'chase') x = -def.gap;
    const m = { def, sprite, dog, x, lane: -2 - (i % 3) * 3, fallUntil: 0, fallAt: 0, seen: new Set(), leaving: false, rand };
    if (def.mode === 'rival' || def.mode === 'pace') m.timeMs = scheduledMs(this.level, def);
    return m;
  }

  createHud() {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.45).fillRect(0, 0, W, 44);
    this.clockText = text(this, 16, 10, '0.0 s', 22);
    this.rightText = text(this, W - 16, 10, '', 20, '#ffffff', { ox: 1 });
    // mini mapa del recorrido
    this.mapG = this.add.graphics();
    this.mapX0 = 300;
    this.mapX1 = 560;
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
    if ((o.type === 'chair' || o.type === 'table') && view) {
      this.tweens.add({ targets: view.sprite, angle: o.type === 'chair' ? 75 : 8, duration: 250, yoyo: true, hold: Math.max(0, this.rules.getupMs - 600) });
    }
    this.cameras.main.shake(200, 0.008);
    for (const m of this.crew.filter(c => c.def.mode === 'chase')) {
      const shout = m.dog ? '¡GUAU!' : '¡SOFÍA!';
      const t = text(this, m.sprite.x, FEET_Y - 150, shout, 22, '#ffd23f', { ox: 0.5 });
      this.tweens.add({ targets: t, y: t.y - 30, alpha: 0, duration: 900, onComplete: () => t.destroy() });
    }
  }

  end() {
    this.ended = true;
    Panel.setBroken(false);
    TypeInput.stop();
    const result = this.runner.result();
    const type = this.level.boss?.type;
    const rivals = this.crew.filter(m => m.def.mode === 'rival');
    // El lugar solo tiene sentido si llegó a la meta o se le acabó el tiempo corriendo.
    if (rivals.length && (result.passed || result.failReason === 'time')) result.place = 1 + rivals.filter(m => m.timeMs < result.timeMs).length;
    let msg = { race: '¡PRIMER LUGAR!', catch: '¡Lo alcanzaste!' }[type] || '¡META!';
    if (!result.passed) {
      if (result.failReason === 'errors') msg = '¡Demasiados traspiés!';
      else if (result.failReason === 'falls') msg = type === 'chase' ? '¡Te alcanzaron!' : '¡Demasiadas caídas!';
      else msg = { race: '¡Te ganaron!', chase: '¡Te alcanzaron!', catch: '¡Se te escapó!' }[type] || '¡Se acabó el tiempo!';
    }
    const banner = text(this, W / 2, 210, msg, 60, result.passed ? '#ffd23f' : '#ff6b6b', { ox: 0.5, oy: 0.5, strokeThickness: 10 });
    banner.setScale(0.2);
    this.tweens.add({ targets: banner, scale: 1, duration: 300, ease: 'Back.out' });
    this.player.setAngle(0).setY(FEET_Y);
    if (result.passed) this.player.play(`${this.hero}-cheer`);
    else this.player.setTexture(this.hero, result.failReason === 'falls' ? 'down' : 'sad');
    for (const m of this.crew) {
      if (m.dog) continue;
      if (m.def.mode === 'follow' && !m.leaving) m.sprite.play(`${m.def.id}-${result.passed ? 'cheer' : 'idle'}`);
    }
    this.time.delayedCall(1800, () => finishLevel(this, this.chapter, this.level, result, { story: this.story }));
  }

  // ---------- dibujo ----------

  screenX(worldX) {
    return PLAYER_X + (worldX - this.runner.x);
  }

  obstacleAt(x) {
    return this.runner.obstacles.find(o => x >= o.start && x <= o.end) || null;
  }

  draw(dt) {
    const r = this.runner;
    this.bg.scroll(r.x);
    for (const v of this.obstacleViews) this.drawObstacle(v);
    this.finish.x = this.screenX(r.finishX + 20);
    this.drawTimerBar();
    if (!this.ended) this.drawPlayer();
    for (const m of this.crew) this.drawCrew(m, dt);
    this.weather.update(dt);
    this.drawHud();
  }

  drawObstacle(v) {
    const { o, sprite, label, parts } = v;
    const sx = this.screenX(o.x);
    const visible = sx > -260 && sx < W + 200;
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

  // Aplica la pose de un obstáculo a un sprite. Devuelve false si no está pasando ninguno.
  applyObstaclePose(sprite, o, x, baseY, runKey, dustX) {
    const pose = obstaclePose(o.type, Phaser.Math.Clamp((x - o.start) / (o.end - o.start), 0, 1));
    if (!pose) return false;
    if (pose.run) {
      if (sprite.anims.currentAnim?.key !== runKey || !sprite.anims.isPlaying) sprite.play(runKey);
    } else {
      sprite.anims.stop();
      sprite.setFrame(pose.frame);
    }
    sprite.y = baseY + pose.dy;
    sprite.angle = pose.angle || 0;
    if (pose.dust && dustX != null && Math.random() < 0.3) this.dust.explode(1, dustX, FEET_Y);
    // Solo Sofía (dustX) deja estela y chispas de polvo al correr por la pared.
    if (dustX != null && pose.trail) this.wallTrail(sprite);
    if (dustX != null && pose.spark && Math.random() < 0.5) this.dust.explode(1, sprite.x - 6, sprite.y - 4);
    return true;
  }

  // Siluetas que se desvanecen detrás de Sofía mientras corre por la pared.
  wallTrail(sprite) {
    const now = this.time.now;
    if (now - (this.lastTrailAt || 0) < TRAIL_EVERY_MS) return;
    this.lastTrailAt = now;
    const ghost = this.add.image(sprite.x, sprite.y, sprite.texture.key, sprite.frame.name)
      .setOrigin(0.5, 1).setScale(sprite.scaleX, sprite.scaleY).setAngle(sprite.angle)
      .setTint(0x9ad1ff).setAlpha(0.45).setDepth(sprite.depth - 1);
    this.tweens.add({ targets: ghost, alpha: 0, x: ghost.x - 30, duration: 260, onComplete: () => ghost.destroy() });
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
    if (o && o.done && r.x >= o.start && this.applyObstaclePose(p, o, r.x, FEET_Y, `${this.hero}-run`, PLAYER_X - 20)) return;
    if (r.holding) {
      p.anims.stop();
      p.setFrame('ready');
      return;
    }
    const key = `${this.hero}-run`;
    if (p.anims.currentAnim?.key !== key || !p.anims.isPlaying) p.play(key);
    p.anims.timeScale = Phaser.Math.Clamp(r.v / BASE_SPEED, 0.5, 2.5);
  }

  // Dónde debería ir cada quien según su papel.
  crewTarget(m, dt) {
    const r = this.runner;
    const { def } = m;
    if (def.mode === 'rival') return { x: r.finishX * Math.min(1, r.clock / m.timeMs), direct: true };
    // A quien hay que alcanzar sale con ventaja, se mantiene adelante y en el tramo final se cansa:
    // ahí Sofía lo alcanza si va más rápido que él. Nunca va más lento que su horario (llega a la
    // meta justo al acabarse el tiempo).
    if (def.mode === 'pace') {
      const sched = PACE_HEAD + (r.finishX - PACE_HEAD) * Math.min(1, r.clock / m.timeMs);
      const x = r.x < r.finishX * PACE_TIRED_AT ? Math.max(sched, r.x + PACE_LEAD) : Math.max(sched, m.x + (r.v * PACE_TIRED_SPEED * dt) / 1000);
      return { x: Math.min(x, r.finishX + 40) };
    }
    if (def.mode === 'chase') {
      const max = this.rules.maxFalls ?? 3;
      let gap = def.gap - (r.falls * (def.gap - 70)) / (max + 1);
      if (r.failReason === 'falls' || (r.failReason === 'time' && this.ended)) gap = 26;
      return { x: r.x - gap };
    }
    // follow
    if (def.leaveAt != null && !m.leaving && r.x / r.finishX >= def.leaveAt) m.leaving = true;
    if (m.leaving) return { x: m.x + 2000 };
    let x = r.x + def.lead;
    // Si va adelante y Sofía está detenida, espera del otro lado del obstáculo (no en el aire).
    if (def.lead > 0) {
      const o = this.obstacleAt(x);
      if (o && !o.passed) x = o.end + 24;
    }
    return { x };
  }

  drawCrew(m, dt) {
    const r = this.runner;
    const s = m.sprite;
    const started = this.countdownLeft <= 0;
    const { x: target, direct } = this.crewTarget(m, dt);
    const prevX = m.x;
    const falling = r.clock < m.fallUntil;
    if (started && !falling) {
      if (direct) m.x = target;
      else {
        const speed = m.leaving ? LEAVE_SPEED : CREW_SPEED;
        const step = Phaser.Math.Clamp(target - m.x, (-speed * dt) / 1000, (speed * dt) / 1000);
        m.x += step;
      }
    }
    const moving = Math.abs(m.x - prevX) > 0.02 * dt;
    const sx = this.screenX(m.x);
    const baseY = FEET_Y + m.lane;
    s.x = sx;
    s.y = baseY;
    s.angle = 0;
    s.setFlipX(false);
    s.setVisible(sx > -80 && sx < W + 80);
    if (this.ended && !m.dog && m.def.mode === 'follow') return;
    if (m.dog) {
      // El perro no tiene poses de salto: solo sube y baja al pasar los obstáculos.
      const o = this.obstacleAt(m.x);
      if (o && o.type !== 'flat' && o.type !== 'fence') s.y = baseY - Math.sin(Math.PI * Phaser.Math.Clamp((m.x - o.start) / (o.end - o.start), 0, 1)) * 60;
      if (moving && !s.anims.isPlaying) s.play('dog-run');
      if (!moving || r.phase === 'fallen') { s.anims.stop(); s.setFrame('bark'); }
      return;
    }
    const id = m.def.id;
    // Quien es torpe a veces se tropieza al llegar a un obstáculo.
    const o = this.obstacleAt(m.x);
    if (m.def.clumsy && o && o.type !== 'flat' && !m.seen.has(o) && m.x - o.start < 30) {
      m.seen.add(o);
      if (m.rand() < CLUMSY_CHANCE) {
        m.fallAt = r.clock;
        m.fallUntil = r.clock + CLUMSY_DOWN_MS;
        m.x = Math.max(m.x, o.start);
      }
    }
    if (falling) {
      const t = r.clock - m.fallAt;
      s.anims.stop();
      s.setFrame(t < 200 ? 'trip' : t < CLUMSY_DOWN_MS - 250 ? 'down' : 'getup');
      return;
    }
    if (o && (moving || direct) && this.applyObstaclePose(s, o, m.x, baseY, `${id}-run`, null)) return;
    if (moving || (direct && m.x < r.finishX && started)) {
      if (s.anims.currentAnim?.key !== `${id}-run` || !s.anims.isPlaying) s.play(`${id}-run`);
      s.anims.timeScale = Phaser.Math.Clamp(Math.abs(m.x - prevX) / Math.max(1, dt) * 1000 / BASE_SPEED, 0.6, 2.2);
    } else if (direct && m.x >= r.finishX) {
      if (s.anims.currentAnim?.key !== `${id}-cheer`) s.play(`${id}-cheer`);
    } else {
      s.anims.stop();
      s.setFrame(started ? 'ready' : 'idle0');
    }
  }

  drawHud() {
    const r = this.runner;
    const type = this.level.boss?.type;
    const clock = this.countdownLeft > 0 ? 0 : r.clock;
    let left = formatTime(clock);
    if (this.rules.limitMs && type !== 'race') left += ` / ${formatTime(this.rules.limitMs)}`;
    this.clockText.setText(left);
    this.clockText.setColor(this.rules.limitMs && type !== 'race' && this.rules.limitMs - clock < 10000 ? '#ff6b6b' : '#ffffff');
    const parts = [];
    const rivals = this.crew.filter(m => m.def.mode === 'rival');
    if (rivals.length) parts.push(`Lugar ${1 + rivals.filter(m => m.x > r.x).length}°`);
    const pace = this.crew.find(m => m.def.mode === 'pace');
    if (pace) {
      const name = CAST[pace.def.id].name;
      parts.push(pace.x > r.x ? `${name} a ${Math.round((pace.x - r.x) / 30)} m` : `¡Alcanzaste a ${name}!`);
    }
    if (this.rules.maxErrors != null) parts.push(`Traspiés ${r.errors}/${this.rules.maxErrors}`);
    parts.push(this.rules.maxFalls != null ? `Caídas ${r.falls}/${this.rules.maxFalls}` : `Caídas ${r.falls}`);
    this.rightText.setText(parts.join('   '));

    const g = this.mapG;
    g.clear();
    const span = this.mapX1 - this.mapX0;
    const mx = wx => this.mapX0 + span * Phaser.Math.Clamp(wx / r.finishX, 0, 1);
    g.fillStyle(0xffffff, 0.35).fillRect(this.mapX0, 21, span, 3);
    for (const o of r.obstacles) g.fillStyle(o.passed ? 0x7bd389 : 0xffffff, 0.8).fillRect(mx(o.x), 18, 2, 9);
    g.fillStyle(0xffffff, 1).fillRect(this.mapX1 - 2, 12, 4, 18);
    this.crew.forEach((m, i) => {
      if (m.def.mode === 'follow') return;
      g.fillStyle(m.dog ? 0x3b2f2a : DOT_COLORS[i % DOT_COLORS.length], 1).fillCircle(mx(m.x), 22, 5);
    });
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
