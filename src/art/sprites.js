// Hojas de sprites en PNG (public/assets/sprites/<id>.png + <id>.json). Un personaje puede tener
// solo algunos cuadros en PNG: esos reemplazan a los dibujados por código y el resto se queda
// como estaba. Si el PNG no carga, el juego sigue con el dibujo por código.

// Personajes que tienen hoja PNG.
export const PNG_SHEETS = ['sofia', 'dani', 'kevin', 'yesi', 'chuy', 'brayan', 'memo', 'ramiro', 'leticia', 'tomasito', 'tomas', 'tata', 'panadero'];

// Hojas PNG que no son de un personaje del reparto: el perro guardián (textura `dog`, 32×20, con
// los cuadros run0…run3 y bark).
export const OTHER_SHEETS = ['dog'];

// Obstáculos con hoja PNG (obst-<clave>.png + .json): una tira con un cuadro por variante, «v0»,
// «v1»…, del mismo tamaño que el obstáculo dibujado por código (OBSTACLE_SIZES de props.js).
export const OBSTACLE_SHEETS = ['chair', 'chalk', 'puddle', 'fence', 'table', 'wall', 'hole', 'container', 'alley', 'highwall', 'rail', 'bus', 'stalls'];
export const obstacleSheet = key => `obst-${key}`;

// Ambientes con hoja PNG de fondo (fondo-<ambiente>.png + .json): los cuadros «far», «mid» y
// «ground» (capa lejana, media y piso, del tamaño de FAR, MID y GROUND de backgrounds.js) y sus
// parejas apagadas «far-apagado», «mid-apagado» y «ground-apagado». Los colores del cielo van en
// meta.cielo: { vivo: [arriba, abajo], apagado: [arriba, abajo] }.
export const BACKGROUND_SHEETS = ['barrio', 'noche', 'prohibida', 'parque', 'carrera', 'mercado'];
export const BACKGROUND_LAYERS = ['far', 'mid', 'ground'];
export const DIM_SUFFIX = '-apagado';
export const backgroundSheet = theme => `fondo-${theme}`;

// Interiores con hoja PNG (fondo-<lugar>.png + .json): un solo cuadro «room» del tamaño de ROOM de
// backgrounds.js, ya en el tono con que sale en los diálogos (la casa, apagada).
export const ROOM_SHEETS = ['casa'];
export const ROOM_FRAME = 'room';

// Personajes con retrato para la caja de diálogo (hoja <id>-retrato.png + .json): un cuadro por
// gesto, más «_m» (boca al hablar) y «_b» (parpadeo, solo en los gestos con los ojos abiertos).
export const PORTRAITS = ['sofia', 'dani', 'kevin', 'yesi', 'chuy', 'brayan', 'memo', 'ramiro', 'leticia', 'tomasito', 'tomas', 'tata', 'panadero'];
export const PORTRAIT_SIZE = 48;
export const PORTRAIT_MOODS = ['idle', 'talk', 'sad', 'angry', 'cry', 'shock', 'happy', 'cheer'];
export const portraitKey = id => `retrato-${id}`;

export const spriteUrl = (id, ext) => `assets/sprites/${id}.${ext}`;
const pngKey = id => `png-${id}`;

// Se llama en el preload de la escena de arranque.
export function preloadSprites(scene) {
  for (const id of [...PNG_SHEETS, ...OTHER_SHEETS]) scene.load.atlas(pngKey(id), spriteUrl(id, 'png'), spriteUrl(id, 'json'));
  for (const key of OBSTACLE_SHEETS) scene.load.atlas(pngKey(obstacleSheet(key)), spriteUrl(obstacleSheet(key), 'png'), spriteUrl(obstacleSheet(key), 'json'));
  for (const place of ROOM_SHEETS) scene.load.atlas(pngKey(backgroundSheet(place)), spriteUrl(backgroundSheet(place), 'png'), spriteUrl(backgroundSheet(place), 'json'));
  for (const theme of BACKGROUND_SHEETS) scene.load.atlas(pngKey(backgroundSheet(theme)), spriteUrl(backgroundSheet(theme), 'png'), spriteUrl(backgroundSheet(theme), 'json'));
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
  if (!(PNG_SHEETS.includes(key) || OTHER_SHEETS.includes(key)) || !scene.textures.exists(pngKey(key)) || !scene.textures.exists(key)) return 0;
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

// Copia cada variante de la hoja PNG de un obstáculo sobre su textura dibujada por código (`chair`,
// `chair-1`…) si mide lo mismo: así no cambian ni el tamaño ni la zona de choque. Las variantes que
// la hoja no traiga se quedan con el dibujo por código. Devuelve cuántas reemplazó.
export function applyObstacleSheet(scene, key, variants) {
  const sheet = pngKey(obstacleSheet(key));
  if (!OBSTACLE_SHEETS.includes(key) || !scene.textures.exists(sheet)) return 0;
  const png = scene.textures.get(sheet);
  const src = png.getSourceImage();
  let n = 0;
  for (let v = 0; v < variants; v++) {
    const texKey = v ? `${key}-${v}` : key;
    if (!png.has(`v${v}`) || !scene.textures.exists(texKey)) continue;
    const a = png.get(`v${v}`), tex = scene.textures.get(texKey);
    if (a.cutWidth !== tex.width || a.cutHeight !== tex.height) continue;
    const ctx = tex.getContext();
    ctx.clearRect(0, 0, tex.width, tex.height);
    ctx.drawImage(src, a.cutX, a.cutY, a.cutWidth, a.cutHeight, 0, 0, tex.width, tex.height);
    tex.refresh();
    n++;
  }
  return n;
}

// Copia las capas de la hoja PNG de un ambiente sobre sus texturas dibujadas por código
// (`far-barrio`, `mid-barrio`, `ground-barrio`) si miden lo mismo, y crea las texturas apagadas
// (`far-barrio-apagado`…). Devuelve { layers, sky } o null si el ambiente no tiene hoja: entonces
// queda el dibujo por código y no hay versión apagada.
export function applyBackgroundSheet(scene, theme) {
  const sheet = pngKey(backgroundSheet(theme));
  if (!BACKGROUND_SHEETS.includes(theme) || !scene.textures.exists(sheet)) return null;
  const png = scene.textures.get(sheet);
  const src = png.getSourceImage();
  let layers = 0;
  for (const layer of BACKGROUND_LAYERS) {
    const key = `${layer}-${theme}`;
    if (!scene.textures.exists(key)) continue;
    const base = scene.textures.get(key);
    for (const suffix of ['', DIM_SUFFIX]) {
      if (!png.has(layer + suffix)) continue;
      const a = png.get(layer + suffix);
      if (a.cutWidth !== base.width || a.cutHeight !== base.height) continue;
      const tex = suffix ? scene.textures.createCanvas(key + suffix, base.width, base.height) : base;
      const ctx = tex.getContext();
      ctx.clearRect(0, 0, tex.width, tex.height);
      ctx.drawImage(src, a.cutX, a.cutY, a.cutWidth, a.cutHeight, 0, 0, tex.width, tex.height);
      tex.refresh();
      layers++;
    }
  }
  return { layers, sky: png.customData?.meta?.cielo ?? null };
}

// Copia el cuadro «room» de la hoja PNG de un interior sobre su textura dibujada por código
// (`room-casa`) si mide lo mismo. Devuelve true si la reemplazó; si no, queda el dibujo por código.
export function applyRoomSheet(scene, place) {
  const sheet = pngKey(backgroundSheet(place));
  const key = `room-${place}`;
  if (!ROOM_SHEETS.includes(place) || !scene.textures.exists(sheet) || !scene.textures.exists(key)) return false;
  const png = scene.textures.get(sheet);
  if (!png.has(ROOM_FRAME)) return false;
  const a = png.get(ROOM_FRAME), tex = scene.textures.get(key);
  if (a.cutWidth !== tex.width || a.cutHeight !== tex.height) return false;
  const ctx = tex.getContext();
  ctx.clearRect(0, 0, tex.width, tex.height);
  ctx.drawImage(png.getSourceImage(), a.cutX, a.cutY, a.cutWidth, a.cutHeight, 0, 0, tex.width, tex.height);
  tex.refresh();
  return true;
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
