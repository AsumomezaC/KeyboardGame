// Mapa del capítulo: 10 niveles en un camino, más el secreto cuando se reúnen 30 estrellas.
import Phaser from 'phaser';
import { Save } from '../core/save.js';
import { levelRules, levelStatus, chapterStars, chapterMaxStars, canFail, accuracyTarget } from '../game/rules.js';
import { Panel } from '../ui/panel.js';
import { escapeHTML } from '../ui/keyboard-view.js';
import { levelName } from '../data/chapter1.js';
import { WEATHER_NAMES } from '../data/weathers.js';
import { Music } from '../audio/music.js';
import { startLevel, storyFor } from './flow.js';
import { W, H, text, box, backdrop, onKeys, stars, formatTime, keyLegend } from './common.js';

const NODES = [
  [100, 360], [190, 290], [280, 360], [370, 285], [460, 355],
  [550, 280], [645, 350], [740, 275], [830, 345], [895, 225],
];
const SECRET_NODE = [760, 150];

export function goalLines(level) {
  const rules = levelRules(level);
  const lines = [];
  if (rules.limitMs && level.kind !== 'race') lines.push({ label: 'límite', ms: rules.limitMs, color: '#d1495b' });
  if (level.kind === 'race') lines.push({ label: '1.er lugar', ms: rules.limitMs, color: '#d1495b' });
  return lines;
}

export function levelInfoHtml(chapter, level) {
  const rules = levelRules(level);
  const status = levelStatus(chapter, level, Save);
  const best = Save.level(level.id);
  const story = storyFor(chapter, level);
  const keys = level.newKeys.length
    ? `Teclas nuevas: <b>${level.newKeys.map(k => (k === ' ' ? 'espacio' : k)).join(' ')}</b>`
    : 'Sin teclas nuevas';
  const rows = [];
  if (level.kind === 'dog') rows.push(`Jefe: un perro guardián te persigue. Con <b>${rules.maxFalls} caídas</b> te alcanza.`);
  else if (level.kind === 'race') rows.push(`Jefe: carrera contra 3 rivales. Debes llegar en <b>1.er lugar</b> (antes de ${formatTime(rules.limitMs)}). Levantarte tarda más.`);
  else if (level.kind === 'secret') rows.push(`Nivel secreto con mayúsculas. Límite: <b>${formatTime(rules.limitMs)}</b>.`);
  else if (rules.limitMs) rows.push(`Límite de tiempo: <b>${formatTime(rules.limitMs)}</b>. Si no lo logras, no avanzas.`);
  else rows.push('Aquí no se pierde: solo cuenta para tus estrellas.');
  rows.push(`Cada estrella se gana aparte: ★ terminar${canFail(level) ? ' a tiempo' : ''} · ★ velocidad: ${formatTime(rules.fastMs)} o menos · ★ precisión: ${Math.round(accuracyTarget(level) * 100)} % o más`);
  return `<h2>${escapeHTML(levelName(level))} <span class="stars">${'★'.repeat(best.stars)}${'☆'.repeat(3 - best.stars)}</span></h2>` +
    `<p>${keys}${level.requiresStars && level.kind !== 'secret' ? ` · Requiere ${level.requiresStars} ★` : ''}` +
    `${story ? ` · Clima: ${WEATHER_NAMES[story.weather]}` : ''}</p>` +
    rows.map(r => `<p>${r}</p>`).join('') +
    (status.unlocked
      ? `<p class="go">${best.passed && story ? 'Enter: elegir jugar con o sin diálogos' : 'Enter para jugar'}${best.bestTimeMs ? ` · Mejor tiempo: ${formatTime(best.bestTimeMs)}` : ''}</p>`
      : `<p class="locked">🔒 ${escapeHTML(status.reason)}</p>`);
}

export class LevelMapScene extends Phaser.Scene {
  constructor() {
    super('LevelMap');
  }

  init(data) {
    this.chapter = data.chapter;
    this.selectId = data.select;
  }

  create() {
    const ch = this.chapter;
    backdrop(this, 'barrio').scroll(0);
    this.add.rectangle(0, 0, W, 540, 0x1d1b33, 0.35).setOrigin(0);
    const total = chapterStars(ch, Save, { includeSecret: true });
    text(this, 24, 18, `${ch.title} — ${ch.subtitle}`, 30, '#ffd23f');
    text(this, W - 24, 22, `★ ${total} / ${chapterMaxStars(ch, Save)}`, 26, '#ffffff', { ox: 1 });

    this.entries = ch.levels.map((level, i) => ({ level, pos: NODES[i] }));
    const secretStatus = levelStatus(ch, ch.secret, Save);
    if (secretStatus.visible) this.entries.push({ level: ch.secret, pos: SECRET_NODE });

    // camino de tierra entre nodos
    const path = this.add.graphics();
    path.lineStyle(14, 0x8d6e63, 1);
    path.beginPath();
    NODES.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
    path.strokePath();
    path.lineStyle(4, 0xc8a27c, 1);
    for (let i = 1; i < NODES.length; i++) {
      const [x0, y0] = NODES[i - 1], [x1, y1] = NODES[i];
      for (let t = 0.15; t < 0.9; t += 0.25) path.lineBetween(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, x0 + (x1 - x0) * (t + 0.1), y0 + (y1 - y0) * (t + 0.1));
    }
    if (secretStatus.visible) {
      path.lineStyle(4, 0xb388ff, 1);
      path.lineBetween(NODES[7][0], NODES[7][1], SECRET_NODE[0], SECRET_NODE[1]);
    }

    for (const e of this.entries) this.drawNode(e);
    this.legend = null;
    Music.play('mapa');
    this.marker = this.add.image(0, 0, 'sofia-head').setScale(3);
    this.tweens.add({ targets: this.marker, y: '-=8', duration: 450, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    let index = this.entries.findIndex(e => e.level.id === this.selectId);
    if (index < 0) {
      index = this.entries.findIndex(e => !Save.level(e.level.id).passed && levelStatus(ch, e.level, Save).unlocked);
      if (index < 0) index = 0;
    }
    this.select(index);

    this.choice = null;
    // Mientras el menú «con o sin diálogos» está abierto, las flechas y Enter son suyos.
    onKeys(this, {
      ArrowRight: () => !this.choice && this.select(Math.min(this.entries.length - 1, this.index + 1)),
      ArrowLeft: () => !this.choice && this.select(Math.max(0, this.index - 1)),
      ArrowUp: () => this.moveChoice(-1),
      ArrowDown: () => this.moveChoice(1),
      Enter: e => (this.choice ? this.confirmChoice(e) : !e.repeat && this.play()),
      h: () => this.play({ story: true }),
      H: () => this.play({ story: true }),
      Escape: () => (this.choice ? this.closeChoice() : this.scene.start('Chapters')),
    });
    Panel.show('info');
  }

  drawNode(e) {
    const { level, pos: [x, y] } = e;
    const status = levelStatus(this.chapter, level, Save);
    const best = Save.level(level.id);
    const boss = level.kind === 'dog' || level.kind === 'race';
    const r = boss ? 30 : 24;
    const fill = level.kind === 'secret' ? 0x7b2cbf : status.unlocked ? (best.passed ? 0x7bd389 : 0xfff7e0) : 0x8a8799;
    const node = this.add.circle(x, y, r, fill).setStrokeStyle(5, 0x2b1d2e).setInteractive({ useHandCursor: true });
    node.on('pointerdown', () => {
      const i = this.entries.indexOf(e);
      if (i === this.index) this.play();
      else this.select(i);
    });
    if (level.kind === 'dog') this.add.image(x, y, 'dog-head').setScale(3);
    else if (level.kind === 'race') this.add.image(x, y, 'trophy').setScale(3);
    else if (level.kind === 'secret') this.add.image(x, y, 'mystery').setScale(3);
    else text(this, x, y, level.label, 22, '#2b1d2e', { ox: 0.5, oy: 0.5, stroke: '#fff7e0', strokeThickness: 2 });
    if (!status.unlocked) this.add.image(x + r - 6, y - r + 6, 'padlock').setScale(2);
    stars(this, x, y + r + 16, best.stars, { gap: 20, scale: 2 });
    e.node = node;
    e.radius = r;
  }

  select(i) {
    this.index = i;
    const e = this.entries[i];
    this.tweens.killTweensOf(this.marker);
    this.marker.setPosition(e.pos[0], e.pos[1] - e.radius - 26);
    this.tweens.add({ targets: this.marker, y: '-=8', duration: 450, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    for (const other of this.entries) other.node.setStrokeStyle(other === e ? 7 : 5, other === e ? 0xffd23f : 0x2b1d2e);
    const level = e.level;
    this.drawLegend();
    Panel.setInfo(levelInfoHtml(this.chapter, level), Save.history(level.id), goalLines(level), `Historial · ${levelName(level)}`);
  }

  // Primera vez: siempre con historia. Ya superado: menú para jugar con o sin diálogos (H = con).
  play({ story } = {}) {
    const { level } = this.entries[this.index];
    if (!levelStatus(this.chapter, level, Save).unlocked) {
      this.cameras.main.shake(150, 0.004);
      return;
    }
    const replay = Save.level(level.id).passed && storyFor(this.chapter, level);
    if (story === undefined && replay) {
      this.openChoice();
      return;
    }
    startLevel(this, this.chapter, level, story === undefined ? undefined : { story });
  }

  openChoice() {
    if (this.choice) return;
    const c = this.add.container(0, 0).setDepth(200);
    c.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0));
    c.add(box(this, 300, 170, 360, 190));
    c.add(text(this, 480, 196, levelName(this.entries[this.index].level), 24, '#2b1d2e', { ox: 0.5, stroke: '#fff7e0', strokeThickness: 2 }));
    const options = [
      { label: 'Jugar sin diálogos', story: false },
      { label: 'Ver diálogos y jugar', story: true },
    ];
    const texts = options.map((o, i) => {
      const t = text(this, 350, 248 + i * 46, '', 22, '#2b1d2e', { stroke: '#fff7e0', strokeThickness: 2 });
      t.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        this.choice.index = i;
        this.confirmChoice();
      });
      c.add(t);
      return t;
    });
    this.choice = { c, options, texts, index: 0, openedAt: this.time.now };
    this.moveChoice(0);
  }

  moveChoice(d) {
    const ch = this.choice;
    if (!ch) return;
    ch.index = (ch.index + d + ch.options.length) % ch.options.length;
    ch.texts.forEach((t, i) => t.setText(`${i === ch.index ? '▶ ' : '   '}${ch.options[i].label}`)
      .setColor(i === ch.index ? '#b83350' : '#2b1d2e'));
  }

  // Ignora el Enter sostenido que abrió el menú: hay que soltarlo y presionarlo otra vez.
  confirmChoice(e) {
    if (e && (e.repeat || this.time.now - this.choice.openedAt < 200)) return;
    const { options, index } = this.choice;
    this.closeChoice();
    this.play({ story: options[index].story });
  }

  closeChoice() {
    this.choice?.c.destroy();
    this.choice = null;
  }

  drawLegend() {
    const level = this.entries[this.index].level;
    const replay = Save.level(level.id).passed && storyFor(this.chapter, level);
    this.legend?.destroy();
    this.legend = this.add.container(0, 0);
    const before = this.children.list.length;
    keyLegend(this, [
      ['← →', 'elegir nivel'],
      ['Enter', replay ? 'jugar (con o sin diálogos)' : 'jugar'],
      ['Esc', 'capítulos'],
      ['M', 'música'],
    ]);
    this.legend.add(this.children.list.slice(before));
  }
}
