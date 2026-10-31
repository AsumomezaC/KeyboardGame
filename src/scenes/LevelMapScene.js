// Mapa del capítulo: 10 niveles en un camino, más el secreto cuando se reúnen 30 estrellas.
import Phaser from 'phaser';
import { Save } from '../core/save.js';
import { levelRules, levelStatus, chapterStars, canFail } from '../game/rules.js';
import { Panel } from '../ui/panel.js';
import { escapeHTML } from '../ui/keyboard-view.js';
import { levelName } from '../data/chapter1.js';
import { W, text, backdrop, onKeys, stars, formatTime } from './common.js';

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
  lines.push({ label: '★★', ms: rules.twoMs, color: '#4f9fd1' });
  lines.push({ label: '★★★', ms: rules.threeMs, color: '#e8a400' });
  return lines;
}

export function levelInfoHtml(chapter, level) {
  const rules = levelRules(level);
  const status = levelStatus(chapter, level, Save);
  const best = Save.level(level.id);
  const keys = level.newKeys.length
    ? `Teclas nuevas: <b>${level.newKeys.map(k => (k === ' ' ? 'espacio' : k)).join(' ')}</b>`
    : 'Sin teclas nuevas';
  const rows = [];
  if (level.kind === 'dog') rows.push(`Jefe: un perro guardián te persigue. Con <b>${rules.maxFalls} caídas</b> te alcanza.`);
  else if (level.kind === 'race') rows.push(`Jefe: carrera contra 3 rivales. Debes llegar en <b>1.er lugar</b> (antes de ${formatTime(rules.limitMs)}). Levantarte tarda más.`);
  else if (level.kind === 'secret') rows.push(`Nivel secreto con mayúsculas. Límite: <b>${formatTime(rules.limitMs)}</b>.`);
  else if (rules.limitMs) rows.push(`Límite de tiempo: <b>${formatTime(rules.limitMs)}</b>. Si no lo logras, no avanzas.`);
  else rows.push('Aquí no se pierde: solo cuenta para tus estrellas.');
  rows.push(`★ terminar${canFail(level) ? ' a tiempo' : ''} · ★★ en ${formatTime(rules.twoMs)} y 90 % de precisión · ★★★ en ${formatTime(rules.threeMs)}, 97 % y sin caídas`);
  return `<h2>${escapeHTML(levelName(level))} <span class="stars">${'★'.repeat(best.stars)}${'☆'.repeat(3 - best.stars)}</span></h2>` +
    `<p>${keys}${level.requiresStars && level.kind !== 'secret' ? ` · Requiere ${level.requiresStars} ★` : ''}</p>` +
    rows.map(r => `<p>${r}</p>`).join('') +
    (status.unlocked
      ? `<p class="go">Enter para jugar${best.bestTimeMs ? ` · Mejor tiempo: ${formatTime(best.bestTimeMs)}` : ''}</p>`
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
    const total = chapterStars(ch, Save);
    text(this, 24, 18, `${ch.title} — ${ch.subtitle}`, 30, '#ffd23f');
    text(this, W - 24, 22, `★ ${total} / 30`, 26, '#ffffff', { ox: 1 });
    text(this, 24, 60, '← → elegir · Enter jugar · Esc capítulos', 16, '#ffffff', { bold: false });

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
    this.marker = this.add.image(0, 0, 'sofia-head').setScale(3);
    this.tweens.add({ targets: this.marker, y: '-=8', duration: 450, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    let index = this.entries.findIndex(e => e.level.id === this.selectId);
    if (index < 0) {
      index = this.entries.findIndex(e => !Save.level(e.level.id).passed && levelStatus(ch, e.level, Save).unlocked);
      if (index < 0) index = 0;
    }
    this.select(index);

    onKeys(this, {
      ArrowRight: () => this.select(Math.min(this.entries.length - 1, this.index + 1)),
      ArrowLeft: () => this.select(Math.max(0, this.index - 1)),
      Enter: () => this.play(),
      Escape: () => this.scene.start('Chapters'),
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
    Panel.setInfo(levelInfoHtml(this.chapter, level), Save.history(level.id), goalLines(level), `Historial · ${levelName(level)}`);
  }

  play() {
    const { level } = this.entries[this.index];
    if (!levelStatus(this.chapter, level, Save).unlocked) {
      this.cameras.main.shake(150, 0.004);
      return;
    }
    const needsLesson = level.newKeys.length > 0 && !Save.level(level.id).passed;
    this.scene.start(needsLesson ? 'Lesson' : 'Run', { chapter: this.chapter, level });
  }
}
