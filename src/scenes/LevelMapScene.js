// Mapa del capítulo: 10 niveles en un camino, más el secreto cuando se reúnen 30 estrellas.
// El secreto sale del nivel después del cual ocurre en la historia.
import Phaser from 'phaser';
import { Save } from '../core/save.js';
import { levelRules, levelStatus, chapterStars, chapterMaxStars, canFail, accuracyTarget, chapterUnlocked } from '../game/rules.js';
import { Panel } from '../ui/panel.js';
import { escapeHTML } from '../ui/keyboard-view.js';
import { levelName, STORY_CHAPTERS } from '../data/chapters.js';
import { CAST } from '../data/cast.js';
import { WEATHER_NAMES } from '../data/weathers.js';
import { Music } from '../audio/music.js';
import { Numpad } from '../core/numpad.js';
import { startLevel, storyFor } from './flow.js';
import { askStory, shouldAsk } from './story-choice.js';
import { W, H, text, box, backdrop, onKeys, stars, formatTime, keyLegend } from './common.js';

const NODES = [
  [100, 360], [190, 290], [280, 360], [370, 285], [460, 355],
  [550, 280], [645, 350], [740, 275], [830, 345], [895, 225],
];
// El nodo secreto queda arriba, entre el nivel después del cual ocurre y el siguiente.
function secretNode(after) {
  const [x0, y0] = NODES[after - 1], [x1, y1] = NODES[after];
  return [Math.round((x0 + x1) / 2), Math.min(y0, y1) - 120];
}

const BOSS_TEXT = {
  race: (rules, names) => `Jefe: carrera contra ${names}. Debes llegar en <b>1.er lugar</b> (antes de ${formatTime(rules.limitMs)}).`,
  chase: (rules, names) => `Jefe: ${names} te persigue${names.includes(' y ') ? 'n' : ''}. Llega a la meta antes de ${formatTime(rules.limitMs)}.`,
  catch: (rules, names) => `Jefe: alcanza a ${names} antes de que llegue a la meta (${formatTime(rules.limitMs)}).`,
  trial: rules => `Jefe: contrarreloj. Llega a la meta antes de ${formatTime(rules.limitMs)}.`,
};

function crewNames(level, modes) {
  const names = level.crew.filter(m => modes.includes(m.mode)).map(m => (CAST[m.id] && !m.id.startsWith('rival') ? CAST[m.id].name.replace('Perro guardián', 'el perro guardián') : null));
  const known = names.filter(Boolean);
  const unknown = names.length - known.length;
  if (unknown) known.push(unknown === 1 ? 'otro corredor' : `${unknown} corredores`);
  return known.length > 1 ? `${known.slice(0, -1).join(', ')} y ${known.at(-1)}` : known[0] || '';
}

export function goalLines(level) {
  const rules = levelRules(level);
  const lines = [];
  if (rules.limitMs) lines.push({ label: level.boss?.type === 'race' ? '1.er lugar' : 'límite', ms: rules.limitMs, color: '#d1495b' });
  return lines;
}

export function levelInfoHtml(chapter, level) {
  const rules = levelRules(level);
  const status = levelStatus(chapter, level, Save);
  const best = Save.level(level.id);
  const story = storyFor(chapter, level);
  const keys = level.newKeys.length
    ? `Teclas nuevas: <b>${escapeHTML(level.newKeys.map(k => (k === ' ' ? 'espacio' : k)).join(' '))}</b>`
    : 'Sin teclas nuevas';
  const rows = [];
  if (level.boss) {
    const modes = { race: ['rival'], chase: ['chase'], catch: ['pace'], trial: [] }[level.boss.type];
    rows.push(BOSS_TEXT[level.boss.type](rules, crewNames(level, modes)));
    rows.push(`Pierdes con más de <b>${rules.maxErrors} traspiés</b> o más de <b>${rules.maxFalls} caídas</b>.`);
  } else if (level.kind === 'secret') rows.push(`Nivel secreto con mayúsculas. Límite: <b>${formatTime(rules.limitMs)}</b>.`);
  else if (rules.limitMs) rows.push(`Límite de tiempo: <b>${formatTime(rules.limitMs)}</b>. Si no lo logras, no avanzas.`);
  else rows.push('Aquí no se pierde: solo cuenta para tus estrellas.');
  // < > sin teclado numérico: el nivel ya viene sin ellas; se dice por qué
  if (level.numpadKeys && !Numpad.has) rows.push(`Las teclas <b>${escapeHTML(level.numpadKeys.join(' '))}</b> solo se pueden jugar con teclado numérico: este nivel no las usa (Configuración, tecla M).`);
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
    backdrop(this, ch.map || 'barrio').scroll(0);
    this.add.rectangle(0, 0, W, 540, 0x1d1b33, 0.35).setOrigin(0);
    const total = chapterStars(ch, Save, { includeSecret: true });
    text(this, 24, 18, `${ch.title} — ${ch.subtitle}`, 30, '#ffd23f');
    text(this, W - 24, 22, `★ ${total} / ${chapterMaxStars(ch, Save)}`, 26, '#ffffff', { ox: 1 });

    // Los niveles 1-10 se recorren con ← →. El secreto queda arriba: se entra con ↑ desde el nivel
    // anterior o el siguiente, y se sale con ← o → hacia esos mismos niveles (o ↓ al anterior).
    this.entries = ch.levels.map((level, i) => ({ level, pos: NODES[i] }));
    const secretStatus = levelStatus(ch, ch.secret, Save);
    const secretPos = secretNode(ch.secret.after);
    this.secretIndex = -1;
    if (secretStatus.visible) {
      this.entries.push({ level: ch.secret, pos: secretPos });
      this.secretIndex = this.entries.length - 1;
    }

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
      const [ax, ay] = NODES[ch.secret.after - 1];
      path.lineBetween(ax, ay, secretPos[0], secretPos[1]);
    }

    for (const e of this.entries) this.drawNode(e);
    this.legend = null;
    Music.play('mapa');
    this.marker = this.add.image(0, 0, `${ch.hero || 'sofia'}-head`).setScale(3);
    this.tweens.add({ targets: this.marker, y: '-=8', duration: 450, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    let index = this.entries.findIndex(e => e.level.id === this.selectId);
    if (index < 0) {
      index = this.entries.findIndex(e => !Save.level(e.level.id).passed && levelStatus(ch, e.level, Save).unlocked);
      if (index < 0) index = 0;
    }
    this.select(index);

    // El menú «con o sin diálogos» (story-choice.js) se queda con las teclas mientras está abierto.
    onKeys(this, {
      ArrowRight: () => this.step(1),
      ArrowLeft: () => this.step(-1),
      ArrowUp: () => this.nearSecret() && this.select(this.secretIndex),
      ArrowDown: () => this.onSecret() && this.select(this.chapter.secret.after - 1),
      Enter: e => !e.repeat && this.play(),
      h: () => this.play({ story: true }),
      H: () => this.play({ story: true }),
      Escape: () => this.scene.start('Chapters', { select: ch.index }),
    });
    Panel.show('info');
  }

  drawNode(e) {
    const { level, pos: [x, y] } = e;
    const status = levelStatus(this.chapter, level, Save);
    const best = Save.level(level.id);
    const boss = !!level.boss;
    const r = boss ? 30 : 24;
    const fill = level.kind === 'secret' ? 0x7b2cbf : status.unlocked ? (best.passed ? 0x7bd389 : 0xfff7e0) : 0x8a8799;
    const node = this.add.circle(x, y, r, fill).setStrokeStyle(5, 0x2b1d2e).setInteractive({ useHandCursor: true });
    e.stroke = boss ? 0xc1121f : 0x2b1d2e;
    node.on('pointerdown', () => {
      const i = this.entries.indexOf(e);
      if (i === this.index) this.play();
      else this.select(i);
    });
    if (level.boss && level.crew.some(m => m.id === 'perro')) this.add.image(x, y, 'dog-head').setScale(3);
    else if (level.boss?.type === 'race' || level.boss?.type === 'trial') this.add.image(x, y, 'trophy').setScale(3);
    else if (level.kind === 'secret') this.add.image(x, y, 'mystery').setScale(3);
    else text(this, x, y, level.label, 22, '#2b1d2e', { ox: 0.5, oy: 0.5, stroke: '#fff7e0', strokeThickness: 2 });
    if (!status.unlocked) this.add.image(x + r - 6, y - r + 6, 'padlock').setScale(2);
    stars(this, x, y + r + 16, best.stars, { gap: 20, scale: 2 });
    e.node = node;
    e.radius = r;
  }

  onSecret() {
    return this.index === this.secretIndex && this.secretIndex >= 0;
  }

  // El secreto está entre el nivel «after» y el siguiente.
  nearSecret() {
    const after = this.chapter.secret.after;
    return this.secretIndex >= 0 && (this.index === after - 1 || this.index === after);
  }

  step(d) {
    const last = this.chapter.levels.length - 1;
    if (this.onSecret()) this.select(this.chapter.secret.after - (d < 0 ? 1 : 0));
    else if (this.index + d < 0 || this.index + d > last) this.changeChapter(d);
    else this.select(this.index + d);
  }

  // Desde el primer nivel (←) o el último (→) se pasa al capítulo anterior o siguiente, si existe
  // y está abierto: al nivel que sigue en el orden de la historia (el último del anterior o el
  // primero del siguiente).
  changeChapter(d) {
    const i = this.chapter.index + d;
    const next = STORY_CHAPTERS[i];
    if (!next || !chapterUnlocked(STORY_CHAPTERS, i, Save)) return;
    const level = d < 0 ? next.levels.at(-1) : next.levels[0];
    this.scene.start('LevelMap', { chapter: next, select: level.id });
  }

  select(i) {
    this.index = i;
    const e = this.entries[i];
    this.tweens.killTweensOf(this.marker);
    this.marker.setPosition(e.pos[0], e.pos[1] - e.radius - 26);
    this.tweens.add({ targets: this.marker, y: '-=8', duration: 450, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    for (const other of this.entries) other.node.setStrokeStyle(other === e ? 7 : 5, other === e ? 0xffd23f : other.stroke);
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
    if (story === undefined && shouldAsk(this.chapter, level)) {
      askStory(this, level, picked => this.play({ story: picked }));
      return;
    }
    startLevel(this, this.chapter, level, story === undefined ? undefined : { story });
  }

  drawLegend() {
    const level = this.entries[this.index].level;
    const replay = Save.level(level.id).passed && storyFor(this.chapter, level);
    this.legend?.destroy();
    this.legend = this.add.container(0, 0);
    const before = this.children.list.length;
    keyLegend(this, [
      ['← →', 'elegir nivel'],
      ...(this.nearSecret() ? [['↑', 'secreto', () => this.select(this.secretIndex)]] : []),
      ...(this.onSecret() ? [['↓', 'volver', () => this.select(this.chapter.secret.after - 1)]] : []),
      ['Enter', replay ? 'jugar (con o sin diálogos)' : 'jugar', () => this.play()],
      ['Esc', 'capítulos', () => this.scene.start('Chapters', { select: this.chapter.index })],
      ['M', 'música'],
    ]);
    this.legend.add(this.children.list.slice(before));
  }
}
