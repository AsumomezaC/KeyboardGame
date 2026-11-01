// Genera todas las texturas y animaciones al arrancar.
import { buildKidSheet, buildStandingSheet, buildKidHead, PALETTES, RUN_FRAMES } from './kid.js';
import { buildDogSheet } from './dog.js';
import { buildProps } from './props.js';
import { buildBackgrounds } from './backgrounds.js';

// Niños que corren (hoja completa) y personajes que solo aparecen en diálogos (de pie).
export const KIDS = ['sofia', 'rivalA', 'rivalB', 'rivalC', 'dani'];
export const STANDING_CAST = {
  ramiro: 'adult', leticia: 'adult', panadero: 'adult', tomasito: 'toddler',
  kevin: 'teen', yesi: 'teen', chuy: 'teen', brayan: 'teen', memo: 'teen',
};

export function generateArt(scene) {
  for (const key of KIDS) buildKidSheet(scene, key, PALETTES[key]);
  for (const [key, build] of Object.entries(STANDING_CAST)) buildStandingSheet(scene, key, PALETTES[key], build);
  buildKidHead(scene, 'sofia-head', PALETTES.sofia);
  buildDogSheet(scene);
  buildProps(scene);
  buildBackgrounds(scene);

  const frames = (key, names) => names.map(frame => ({ key, frame }));
  for (const key of [...KIDS, ...Object.keys(STANDING_CAST)]) {
    scene.anims.create({ key: `${key}-idle`, frames: frames(key, ['idle0', 'idle1']), frameRate: 2, repeat: -1 });
    scene.anims.create({ key: `${key}-cheer`, frames: frames(key, ['cheer0', 'cheer1']), frameRate: 4, repeat: -1 });
  }
  for (const key of KIDS) {
    scene.anims.create({
      key: `${key}-run`,
      frames: frames(key, Array.from({ length: RUN_FRAMES }, (_, i) => `run${i}`)),
      frameRate: 12,
      repeat: -1,
    });
  }
  scene.anims.create({ key: 'dog-run', frames: frames('dog', ['run0', 'run1', 'run2', 'run3']), frameRate: 12, repeat: -1 });
}
