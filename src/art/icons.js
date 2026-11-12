// Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
// Íconos de la interfaz dentro del juego (texturas): el engrane de Configuración, en versión clara
// (barra de teclas, fondo oscuro) y oscura (botones color crema).
import { makeCanvas, addImage } from './pixel.js';
import { GEAR } from '../ui/gear-icon.js';

const STYLES = { gear: '#ffffff', 'gear-ink': '#2b1d2e' };

export function buildIcons(scene) {
  for (const [key, color] of Object.entries(STYLES)) {
    const { c, p } = makeCanvas(16, 16);
    for (const [x, y] of GEAR) p.px(x, y, color);
    addImage(scene, key, c);
  }
}
