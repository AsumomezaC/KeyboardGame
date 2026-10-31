// Reglas de cada nivel: tiempos objetivo, estrellas y desbloqueos.
import { simulate } from './runner.js';

const DEFAULT_GETUP_MS = 1200;
const RIVAL_FACTORS = [1, 1.07, 1.16];
const cache = new Map();

// Los tiempos salen de simular a alguien que escribe al ritmo indicado, sin errores.
export function levelRules(level) {
  if (cache.has(level.id)) return cache.get(level.id);
  const getupMs = level.getupMs ?? DEFAULT_GETUP_MS;
  const timeAt = ppm => Math.round(simulate(level, ppm, { getupMs }).timeMs);
  const rules = {
    getupMs,
    maxFalls: level.maxFalls ?? null,
    limitMs: level.ppm.pass ? timeAt(level.ppm.pass) : null,
    twoMs: timeAt(level.ppm.two),
    threeMs: timeAt(level.ppm.three),
    rivals: null,
  };
  if (level.kind === 'race') {
    rules.rivals = RIVAL_FACTORS.map((f, i) => ({ name: `Rival ${'ABC'[i]}`, timeMs: Math.round(rules.limitMs * f) }));
  }
  cache.set(level.id, rules);
  return rules;
}

export function canFail(level) {
  return level.ppm.pass != null || level.maxFalls != null;
}

export function starsFor(level, result) {
  if (!result.passed) return 0;
  const rules = levelRules(level);
  let stars = 1;
  if (result.timeMs <= rules.twoMs && result.accuracy >= 0.9) stars = 2;
  if (result.timeMs <= rules.threeMs && result.accuracy >= 0.97 && result.falls === 0) stars = 3;
  return stars;
}

export function chapterStars(chapter, save, { includeSecret = false } = {}) {
  const levels = includeSecret ? [...chapter.levels, chapter.secret] : chapter.levels;
  return levels.reduce((n, l) => n + save.level(l.id).stars, 0);
}

// { visible, unlocked, reason }: reason explica por qué está bloqueado.
export function levelStatus(chapter, level, save) {
  const stars = chapterStars(chapter, save);
  if (level.kind === 'secret') {
    const visible = stars >= level.requiresStars;
    return { visible, unlocked: visible, reason: visible ? null : `Aparece al reunir ${level.requiresStars} ★` };
  }
  const i = chapter.levels.indexOf(level);
  if (i > 0 && !save.level(chapter.levels[i - 1].id).passed) {
    return { visible: true, unlocked: false, reason: `Supera el nivel ${chapter.levels[i - 1].label} primero` };
  }
  if (level.requiresStars && stars < level.requiresStars) {
    return { visible: true, unlocked: false, reason: `Necesitas ${level.requiresStars} ★ (tienes ${stars})` };
  }
  return { visible: true, unlocked: true, reason: null };
}

export function nextLevel(chapter, level) {
  if (level.kind === 'secret') return null;
  const i = chapter.levels.indexOf(level);
  return chapter.levels[i + 1] || null;
}
