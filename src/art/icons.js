// Íconos de la interfaz dentro del juego (texturas): la bocina de música en sus 4 niveles,
// en versión clara (barra de teclas, fondo oscuro) y oscura (botones color crema).
import { makeCanvas, addImage } from './pixel.js';
import { volumeIcon } from '../ui/volume-icon.js';

const STYLES = {
  'vol': { ink: '#ffffff', wave: '#80ed99', cross: '#ff6b6b' },
  'vol-ink': { ink: '#2b1d2e', wave: '#2f7d3a', cross: '#c1121f' },
};

export function buildIcons(scene) {
  for (const [prefix, colors] of Object.entries(STYLES)) {
    for (let level = 0; level <= 3; level++) {
      const { c, p } = makeCanvas(16, 16);
      const { speaker, extra, muted } = volumeIcon(level);
      for (const [x, y, w, h] of speaker) p.rect(x, y, w, h, colors.ink);
      for (const [x, y, w, h] of extra) p.rect(x, y, w, h, muted ? colors.cross : colors.wave);
      addImage(scene, `${prefix}-${level}`, c);
    }
  }
}
