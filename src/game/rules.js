// Reglas de cada nivel: tiempos objetivo, estrellas y desbloqueos.
import { simulate } from './runner.js';

const DEFAULT_GETUP_MS = 1200;
export const ACCURACY_STAR = 0.95;
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
    fastMs: timeAt(level.ppm.fast),
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

// Tres estrellas independientes: terminar (a tiempo), velocidad y precisión.
// Las dos últimas solo cuentan si terminas el nivel.
export function starBreakdown(level, result) {
  const passed = !!result.passed;
  return {
    finish: passed,
    speed: passed && result.timeMs <= levelRules(level).fastMs,
    accuracy: passed && result.accuracy >= ACCURACY_STAR,
  };
}

export function starsFor(level, result) {
  const b = starBreakdown(level, result);
  return b.finish + b.speed + b.accuracy;
}

export function chapterStars(chapter, save, { includeSecret = false } = {}) {
  const levels = includeSecret ? [...chapter.levels, chapter.secret] : chapter.levels;
  return levels.reduce((n, l) => n + save.level(l.id).stars, 0);
}

// Estrellas posibles del capítulo: el secreto solo suma sus 3 cuando ya apareció.
export function chapterMaxStars(chapter, save) {
  const base = chapter.levels.length * 3;
  return levelStatus(chapter, chapter.secret, save).visible ? base + 3 : base;
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
