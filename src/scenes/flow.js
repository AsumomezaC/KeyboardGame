// Orden de escenas al jugar un nivel: diálogo previo → lección (si hay teclas nuevas) → carrera
// → diálogo final → resultados. Los diálogos se ven siempre la primera vez; al repetir un nivel
// superado se omiten, salvo que la persona elija ver la historia (y entonces también se repite
// el calentamiento de teclas nuevas).
import { Save } from '../core/save.js';

export function storyFor(chapter, level) {
  return chapter.story?.[level.id] || null;
}

export function startLevel(scene, chapter, level, { story = !Save.level(level.id).passed } = {}) {
  const passed = Save.level(level.id).passed;
  const lesson = level.newKeys.length > 0 && (!passed || story);
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
