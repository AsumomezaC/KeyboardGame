// Orden de escenas al jugar un nivel: diálogo previo → lección (teclas nuevas o calentamiento) → carrera
// → diálogo final → resultados. Los diálogos se ven siempre la primera vez; al repetir un nivel
// superado se omiten, salvo que la persona elija ver la historia (y entonces también se repite
// la lección). Los niveles sin teclas nuevas hacen un calentamiento con teclas ya conocidas.
import { Save } from '../core/save.js';
import { Dev } from '../core/dev.js';

export function storyFor(chapter, level) {
  return chapter.story?.[level.id] || null;
}

export function startLevel(scene, chapter, level, { story = !Save.level(level.id).passed } = {}) {
  const passed = Save.level(level.id).passed;
  // Modo desarrollador «solo cinemáticas»: diálogo de inicio → diálogo final → mapa.
  if (Dev.cinematics && storyFor(chapter, level)) {
    const map = { key: 'LevelMap', data: { chapter, select: level.id } };
    const after = { key: 'Dialogue', data: { chapter, level, part: 'after', then: map, canSkip: true } };
    scene.scene.start('Dialogue', { chapter, level, part: 'before', then: after, canSkip: true });
    return;
  }
  const hasLesson = level.newKeys.length > 0 || !!level.warmup;
  const lesson = hasLesson && (!passed || story);
  const play = { key: lesson ? 'Lesson' : 'Run', data: { chapter, level, story } };
  if (story && storyFor(chapter, level)?.before) {
    scene.scene.start('Dialogue', { chapter, level, part: 'before', then: play, canSkip: passed });
  } else {
    scene.scene.start(play.key, play.data);
  }
}

// Al terminar una carrera: el diálogo final sale al superar el nivel por primera vez o al ver la historia.
export function finishLevel(scene, chapter, level, result, { story }) {
  const results = { key: 'Results', data: { chapter, level, result } };
  const firstPass = result.passed && !Save.level(level.id).passed;
  if (result.passed && (story || firstPass) && storyFor(chapter, level)?.after) {
    scene.scene.start('Dialogue', { chapter, level, part: 'after', then: results, canSkip: !firstPass });
  } else {
    scene.scene.start(results.key, results.data);
  }
}
