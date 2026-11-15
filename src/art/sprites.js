// Hojas de sprites en PNG (public/assets/sprites/<id>.png + <id>.json). Un personaje puede tener
// solo algunos cuadros en PNG: esos reemplazan a los dibujados por código y el resto se queda
// como estaba. Si el PNG no carga, el juego sigue con el dibujo por código.

// Personajes que tienen hoja PNG.
export const PNG_SHEETS = ['sofia', 'dani', 'kevin', 'yesi', 'chuy', 'brayan', 'memo', 'ramiro', 'leticia', 'tomasito', 'tomas'];

// Personajes con retrato para la caja de diálogo (hoja <id>-retrato.png + .json): un cuadro por
// gesto, más «_m» (boca al hablar) y «_b» (parpadeo, solo en los gestos con los ojos abiertos).
export const PORTRAITS = ['sofia', 'dani', 'kevin', 'yesi', 'chuy', 'brayan', 'memo', 'ramiro', 'leticia', 'tomasito', 'tomas'];
export const PORTRAIT_SIZE = 48;
export const PORTRAIT_MOODS = ['idle', 'talk', 'sad', 'angry', 'cry', 'shock', 'happy', 'cheer'];
export const portraitKey = id => `retrato-${id}`;

export const spriteUrl = (id, ext) => `assets/sprites/${id}.${ext}`;
const pngKey = id => `png-${id}`;

// Se llama en el preload de la escena de arranque.
export function preloadSprites(scene) {
  for (const id of PNG_SHEETS) scene.load.atlas(pngKey(id), spriteUrl(id, 'png'), spriteUrl(id, 'json'));
  for (const id of PORTRAITS) scene.load.atlas(portraitKey(id), spriteUrl(`${id}-retrato`, 'png'), spriteUrl(`${id}-retrato`, 'json'));
}

// Cada cuántos ciclos de carrera entra el ciclo con tropiezo (para quien trae cuadros «runN_t»).
export const STUMBLE_EVERY = 4;

// Cuadros de la animación de correr. Si la hoja PNG trae variantes de tropiezo («runN_t»), la
// animación son varios ciclos normales y uno donde esos cuadros sustituyen a los suyos.
export function runSequence(scene, key, names) {
  const normal = names.map(frame => ({ key, frame }));
  const png = scene.textures.exists(pngKey(key)) ? scene.textures.get(pngKey(key)) : null;
  if (!png || !names.some(n => png.has(`${n}_t`))) return normal;
  const stumble = names.map(n => (png.has(`${n}_t`) ? { key: pngKey(key), frame: `${n}_t` } : { key, frame: n }));
  return [...Array.from({ length: STUMBLE_EVERY - 1 }, () => normal).flat(), ...stumble];
}

// Copia sobre la hoja dibujada por código (`key`) los cuadros que existan en el PNG con el mismo
// nombre y tamaño. Devuelve cuántos cuadros reemplazó.
export function applySprites(scene, key) {
  if (!PNG_SHEETS.includes(key) || !scene.textures.exists(pngKey(key)) || !scene.textures.exists(key)) return 0;
  const png = scene.textures.get(pngKey(key));
  const tex = scene.textures.get(key);
  const ctx = tex.getContext();
  const src = png.getSourceImage();
  let n = 0;
  for (const name of png.getFrameNames()) {
    if (!tex.has(name)) continue;
    const a = png.get(name), b = tex.get(name);
    if (a.cutWidth !== b.cutWidth || a.cutHeight !== b.cutHeight) continue;
    ctx.clearRect(b.cutX, b.cutY, b.cutWidth, b.cutHeight);
    ctx.drawImage(src, a.cutX, a.cutY, a.cutWidth, a.cutHeight, b.cutX, b.cutY, b.cutWidth, b.cutHeight);
    n++;
  }
  if (n) tex.refresh();
  return n;
}

// Cuadros de carrera de una hoja PNG como canvas sueltos, para dibujarlos fuera de Phaser
// (pantalla de carga). Devuelve null si la hoja no está o no trae toda la carrera.
export async function loadRunFrames(id, count) {
  try {
    const [atlas, img] = await Promise.all([
      fetch(spriteUrl(id, 'json')).then(r => (r.ok ? r.json() : null)),
      new Promise((ok, fail) => {
        const i = new Image();
        i.onload = () => ok(i);
        i.onerror = fail;
        i.src = spriteUrl(id, 'png');
      }),
    ]);
    const frames = [];
    for (let k = 0; k < count; k++) {
      const f = atlas?.frames?.[`run${k}`]?.frame;
      if (!f) return null;
      const c = document.createElement('canvas');
      c.width = f.w;
      c.height = f.h;
      c.getContext('2d').drawImage(img, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
      frames.push(c);
    }
    return frames;
  } catch {
    return null;
  }
}
