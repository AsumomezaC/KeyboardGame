// Orden de escenas al jugar un nivel: diálogo previo → lección (teclas nuevas o calentamiento) → carrera
// → diálogo final → resultados. Los diálogos se ven siempre la primera vez; al repetir un nivel
// superado se omiten, salvo que la persona elija ver la historia (y entonces también se repite
// la lección). Los niveles sin teclas nuevas hacen un calentamiento con teclas ya conocidas.
import { Save } from '../core/save.js';
import { Dev } from '../core/dev.js';
import { levelRules } from '../game/rules.js';

export function storyFor(chapter, level) {
  return chapter.story?.[level.id] || null;
}

export function startLevel(scene, chapter, level, { story = !Save.level(level.id).passed } = {}) {
  const passed = Save.level(level.id).passed;
  if (Dev.noDialogues) story = false;
  // Modo desarrollador «solo cinemáticas»: diálogo de inicio → diálogo final → mapa.
  if (Dev.cinematics && storyFor(chapter, level)) {
    const map = { key: 'LevelMap', data: { chapter, select: level.id } };
    const after = { key: 'Dialogue', data: { chapter, level, part: 'after', then: map, canSkip: true } };
    scene.scene.start('Dialogue', { chapter, level, part: 'before', then: after, canSkip: true });
    return;
  }
  const hasLesson = level.newKeys.length > 0 || !!level.warmup;
  const lesson = hasLesson && (!passed || story);
  // Modo Dios: sin lección ni carrera; el nivel se supera solo con 3 estrellas.
  const play = Dev.god
    ? finishTarget(chapter, level, godResult(level), { story })
    : { key: lesson ? 'Lesson' : 'Run', data: { chapter, level, story } };
  if (story && storyFor(chapter, level)?.before) {
    scene.scene.start('Dialogue', { chapter, level, part: 'before', then: play, canSkip: passed });
  } else {
    scene.scene.start(play.key, play.data);
  }
}

// Al terminar una carrera: el diálogo final sale al superar el nivel por primera vez o al ver la
// historia (nunca con «Jugar sin diálogos» de Configuración).
export function finishLevel(scene, chapter, level, result, { story }) {
  const { key, data } = finishTarget(chapter, level, result, { story });
  scene.scene.start(key, data);
}

function finishTarget(chapter, level, result, { story }) {
  const results = { key: 'Results', data: { chapter, level, result } };
  const firstPass = result.passed && !Save.level(level.id).passed;
  if (!Dev.noDialogues && result.passed && (story || firstPass) && storyFor(chapter, level)?.after) {
    return { key: 'Dialogue', data: { chapter, level, part: 'after', then: results, canSkip: !firstPass } };
  }
  return results;
}

// Resultado perfecto para el modo Dios: a tiempo, tan rápido como pide la estrella de velocidad y sin errores.
function godResult(level) {
  const rules = levelRules(level);
  return {
    passed: true, timeMs: rules.fastMs, wpm: level.ppm.fast, accuracy: 1,
    falls: 0, errors: 0, errByChar: {}, place: level.boss?.type === 'race' ? 1 : undefined, god: true,
  };
}
