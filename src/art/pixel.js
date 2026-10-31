// Utilidades para dibujar pixel art en canvas pequeños que luego Phaser escala sin suavizado.

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { c, ctx, p: new Painter(ctx) };
}

export class Painter {
  constructor(ctx) {
    this.ctx = ctx;
  }

  rect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  px(x, y, color) {
    this.rect(x, y, 1, 1, color);
  }

  // Bresenham con grosor: cada punto es un cuadrado de th×th.
  line(x0, y0, x1, y1, color, th = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    const off = Math.floor((th - 1) / 2);
    let err = dx + dy;
    for (;;) {
      this.rect(x0 - off, y0 - off, th, th, color);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  disc(cx, cy, r, color) {
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y <= r * r + r * 0.8) this.px(cx + x, cy + y, color);
      }
    }
  }

  ellipse(cx, cy, rx, ry, color) {
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) this.px(cx + x, cy + y, color);
      }
    }
  }
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Contorno de 1 px alrededor de todo lo dibujado (estilo sprite de consola portátil).
export function outline(canvas, color) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const [r, g, b] = hexToRgb(color);
  const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  const marks = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (solid(x, y)) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) marks.push((y * w + x) * 4);
    }
  }
  for (const i of marks) {
    d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

// Une cuadros del mismo tamaño en una tira y los registra como textura con nombre por cuadro.
export function addSheet(scene, key, frames, w, h) {
  const { c, ctx } = makeCanvas(w * frames.length, h);
  frames.forEach((f, i) => ctx.drawImage(f.canvas, i * w, 0));
  const tex = scene.textures.addCanvas(key, c);
  frames.forEach((f, i) => tex.add(f.name, 0, i * w, 0, w, h));
  return tex;
}

export function addImage(scene, key, canvas) {
  scene.textures.addCanvas(key, canvas);
}

// Generador pseudoaleatorio reproducible.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
