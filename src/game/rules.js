// Reglas de cada nivel: tiempos objetivo, estrellas y desbloqueos.
import { simulate } from './runner.js';
import { Dev } from '../core/dev.js';

const DEFAULT_GETUP_MS = 1200;
// Dificultad progresiva: al principio se piden ritmos más lentos (más tiempo para el límite y
// para la estrella de velocidad) y menos precisión; ambos suben poco a poco hasta su valor
// completo en el último nivel del capítulo 3. level.step va de 0 (primer nivel) a 1 (último).
const EASY_PPM = 0.75;
const ACCURACY_FROM = 0.9;
const ACCURACY_TO = 0.97;

const progress = level => level.step ?? 1;

export function effectivePpm(level, ppm) {
  return ppm * (EASY_PPM + (1 - EASY_PPM) * progress(level));
}

// Precisión para la estrella, redondeada a un porcentaje entero (90 % … 97 %).
export function accuracyTarget(level) {
  return Math.round((ACCURACY_FROM + (ACCURACY_TO - ACCURACY_FROM) * progress(level)) * 100) / 100;
}
const cache = new Map();

// Los tiempos salen de simular a alguien que escribe al ritmo indicado, sin errores.
export function levelRules(level) {
  if (cache.has(level.id)) return cache.get(level.id);
  const getupMs = level.getupMs ?? DEFAULT_GETUP_MS;
  const timeAt = ppm => Math.round(simulate(level, effectivePpm(level, ppm), { getupMs }).timeMs);
  const rules = {
    getupMs,
    maxFalls: level.boss?.maxFalls ?? null,
    maxErrors: level.boss?.maxErrors ?? null,
    limitMs: level.ppm.pass ? timeAt(level.ppm.pass) : null,
    fastMs: timeAt(level.ppm.fast),
  };
  cache.set(level.id, rules);
  return rules;
}

// Quien compite o va adelante termina el recorrido en un tiempo fijo (fracción del límite).
export function scheduledMs(level, member) {
  return Math.round(levelRules(level).limitMs * (member.factor ?? 1));
}

export function canFail(level) {
  return level.ppm.pass != null || !!level.boss;
}

// Tres estrellas independientes: terminar (a tiempo), velocidad y precisión.
// Las dos últimas solo cuentan si terminas el nivel.
export function starBreakdown(level, result) {
  const passed = !!result.passed;
  return {
    finish: passed,
    speed: passed && result.timeMs <= levelRules(level).fastMs,
    accuracy: passed && result.accuracy >= accuracyTarget(level),
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

// Un capítulo se abre al superar el nivel 10 del anterior. Los que están en construcción solo se
// abren con el modo desarrollador.
export function chapterUnlocked(chapters, index, save) {
  if (chapters[index]?.dev) return Dev.enabled;
  if (index === 0) return true;
  const prev = chapters[index - 1];
  return !!prev && save.level(prev.levels.at(-1).id).passed;
}

// { visible, unlocked, reason }: reason explica por qué está bloqueado.
export function levelStatus(chapter, level, save) {
  // capítulos en construcción: todos sus niveles abiertos para probarlos
  if (chapter.dev) return { visible: true, unlocked: true, reason: null };
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
