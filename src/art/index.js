// Genera todas las texturas y animaciones al arrancar.
import { buildKidSheet, buildKidHead, PALETTES, RUN_FRAMES } from './kid.js';
import { buildDogSheet } from './dog.js';
import { buildProps } from './props.js';
import { buildBackgrounds } from './backgrounds.js';

export const KIDS = ['sofia', 'rivalA', 'rivalB', 'rivalC'];

export function generateArt(scene) {
  for (const key of KIDS) buildKidSheet(scene, key, PALETTES[key]);
  buildKidHead(scene, 'sofia-head', PALETTES.sofia);
  buildDogSheet(scene);
  buildProps(scene);
  buildBackgrounds(scene);

  const frames = (key, names) => names.map(frame => ({ key, frame }));
  for (const key of KIDS) {
    scene.anims.create({
      key: `${key}-run`,
      frames: frames(key, Array.from({ length: RUN_FRAMES }, (_, i) => `run${i}`)),
      frameRate: 12,
      repeat: -1,
    });
    scene.anims.create({ key: `${key}-idle`, frames: frames(key, ['idle0', 'idle1']), frameRate: 2, repeat: -1 });
    scene.anims.create({ key: `${key}-cheer`, frames: frames(key, ['cheer0', 'cheer1']), frameRate: 4, repeat: -1 });
  }
  scene.anims.create({ key: 'dog-run', frames: frames('dog', ['run0', 'run1', 'run2', 'run3']), frameRate: 12, repeat: -1 });
}
