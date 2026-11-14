// Menú «¿con o sin diálogos?» que aparece al iniciar un nivel ya superado que tiene historia.
// Lo usan el mapa y los resultados (botón «Siguiente»). Mientras está abierto, las teclas son
// suyas: ↑ ↓ eligen, Enter (o espacio) confirma, H elige con historia y Esc lo cierra.
import { Save } from '../core/save.js';
import { Dev } from '../core/dev.js';
import { levelName } from '../data/chapters.js';
import { storyFor } from './flow.js';
import { W, H, text, box } from './common.js';

// ¿Hay que preguntar? Solo si el nivel ya se superó y tiene diálogos.
export function shouldAsk(chapter, level) {
  if (Dev.noDialogues) return false; // «Jugar sin diálogos» de Configuración: nunca se pregunta
  return Save.level(level.id).passed && !!storyFor(chapter, level);
}

// onPick(story: boolean). Devuelve una función para cerrarlo sin elegir.
export function askStory(scene, level, onPick) {
  const c = scene.add.container(0, 0).setDepth(200);
  // el velo es interactivo para que los clics no lleguen a los botones de abajo
  c.add(scene.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0).setInteractive());
  c.add(box(scene, 300, 170, 360, 190));
  c.add(text(scene, 480, 196, levelName(level), 24, '#2b1d2e', { ox: 0.5, stroke: '#fff7e0', strokeThickness: 2 }));
  const options = [
    { label: 'Jugar sin diálogos', story: false },
    { label: 'Ver diálogos y jugar', story: true },
  ];
  let index = 0;
  const openedAt = performance.now();
  const texts = options.map((o, i) => {
    const t = text(scene, 350, 248 + i * 46, '', 22, '#2b1d2e', { stroke: '#fff7e0', strokeThickness: 2 });
    t.setInteractive({ useHandCursor: true }).on('pointerdown', () => pick(i));
    c.add(t);
    return t;
  });
  const render = () => texts.forEach((t, i) => t.setText(`${i === index ? '▶ ' : '   '}${options[i].label}`)
    .setColor(i === index ? '#b83350' : '#2b1d2e'));
  render();

  const onKey = e => {
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    const k = e.key;
    if (k === 'ArrowUp' || k === 'ArrowDown') { index = (index + 1) % options.length; render(); }
    // ignora el Enter sostenido que abrió el menú: hay que soltarlo y presionarlo otra vez
    else if ((k === 'Enter' || k === ' ') && !e.repeat && performance.now() - openedAt > 200) pick(index);
    else if (k === 'h' || k === 'H') pick(1);
    else if (k === 'Escape') close();
  };
  const onKeyUp = e => e.stopPropagation();
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('keyup', onKeyUp, true);
  scene.events.once('shutdown', close);

  function close() {
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('keyup', onKeyUp, true);
    scene.events.off('shutdown', close);
    c.destroy();
  }
  function pick(i) {
    close();
    onPick(options[i].story);
  }
  return close;
}
