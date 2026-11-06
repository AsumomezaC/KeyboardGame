// Genera todas las texturas y animaciones al arrancar.
import { buildBuildSheet, buildKidHead, PALETTES, RUN_FRAMES } from './kid.js';
import { buildDogSheet } from './dog.js';
import { buildProps } from './props.js';
import { buildBackgrounds } from './backgrounds.js';
import { buildDetails } from './details.js';

// Complexión de cada personaje. Todos pueden correr (la Tata y la mamá persiguen a Sofía).
export const CAST_BUILDS = {
  sofia: 'kid', dani: 'kid', tomas: 'kid', rivalA: 'kid', rivalB: 'kid', rivalC: 'kid',
  kevin: 'teen', yesi: 'teen', chuy: 'teen', brayan: 'teen', memo: 'teen',
  ramiro: 'adult', leticia: 'adult', tata: 'adult', panadero: 'adult', tomasito: 'toddler',
};
export const RUNNERS = Object.keys(CAST_BUILDS);

export function generateArt(scene) {
  for (const [key, build] of Object.entries(CAST_BUILDS)) buildBuildSheet(scene, key, PALETTES[key], build);
  buildKidHead(scene, 'sofia-head', PALETTES.sofia);
  buildDogSheet(scene);
  buildProps(scene);
  buildBackgrounds(scene);
  buildDetails(scene);

  const frames = (key, names) => names.map(frame => ({ key, frame }));
  for (const key of RUNNERS) {
    scene.anims.create({ key: `${key}-idle`, frames: frames(key, ['idle0', 'idle1']), frameRate: 2, repeat: -1 });
    scene.anims.create({ key: `${key}-cheer`, frames: frames(key, ['cheer0', 'cheer1']), frameRate: 4, repeat: -1 });
    scene.anims.create({
      key: `${key}-run`,
      frames: frames(key, Array.from({ length: RUN_FRAMES }, (_, i) => `run${i}`)),
      frameRate: 12,
      repeat: -1,
    });
  }
  scene.anims.create({ key: 'dog-run', frames: frames('dog', ['run0', 'run1', 'run2', 'run3']), frameRate: 12, repeat: -1 });
}
