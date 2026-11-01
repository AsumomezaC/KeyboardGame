// Climas de cada nivel. Se agregan justo después del fondo: todo queda DETRÁS de obstáculos,
// personajes y textos, y los tintes solo cubren el cielo y las casas. Así el recorrido se lee
// igual con lluvia, niebla o atardecer, también para quien ve poco.
import Phaser from 'phaser';
import { makeCanvas } from '../art/pixel.js';
import { W, GROUND_TOP } from './common.js';

export { WEATHER_NAMES } from '../data/weathers.js';


function ensureTextures(scene) {
  if (scene.textures.exists('wx-rain')) return;
  const tex = (key, w, h, draw) => {
    const { c, p } = makeCanvas(w, h);
    draw(p);
    scene.textures.addCanvas(key, c);
  };
  tex('wx-rain', 1, 7, p => p.rect(0, 0, 1, 7, '#cfe8ff'));
  tex('wx-petal', 3, 2, p => { p.rect(0, 0, 3, 2, '#b388ff'); p.px(0, 0, '#d7bdff'); });
  tex('wx-leaf', 3, 3, p => { p.rect(0, 1, 3, 1, '#c1793a'); p.px(1, 0, '#d9963f'); p.px(1, 2, '#9c5a2a'); });
  tex('wx-paper', 4, 3, p => { p.rect(0, 0, 4, 3, '#f4f1e8'); p.rect(1, 1, 2, 1, '#9a9a9a'); });
  tex('wx-haze', 10, 1, p => p.rect(0, 0, 10, 1, '#fff3d6'));
  tex('wx-fog', 48, 14, p => {
    p.ellipse(24, 7, 23, 6, '#e7ecf3');
    p.ellipse(14, 6, 12, 5, '#f4f7fb');
  });
  tex('wx-cloud', 40, 14, p => {
    p.ellipse(20, 9, 18, 5, '#c9ced6');
    p.disc(14, 6, 5, '#d5dae1'); p.disc(24, 5, 6, '#d5dae1');
  });
  tex('wx-sun', 26, 26, p => {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      p.line(13 + Math.cos(a) * 9, 13 + Math.sin(a) * 9, 13 + Math.cos(a) * 12, 13 + Math.sin(a) * 12, '#ffe066', 2);
    }
    p.disc(13, 13, 7, '#ffd23f');
    p.disc(12, 12, 5, '#fff3b0');
  });
}

const fixedAll = (...objs) => objs.forEach(o => o.setScrollFactor(0));

// Tinte que solo cubre el cielo y las casas (no el suelo donde están los obstáculos).
function tint(scene, color, alpha, bottomColor = color, bottomAlpha = alpha) {
  const g = scene.add.graphics();
  g.fillGradientStyle(color, color, bottomColor, bottomColor, alpha, alpha, bottomAlpha, bottomAlpha);
  g.fillRect(0, 0, W, GROUND_TOP);
  return g;
}

function fall(scene, key, cfg) {
  return scene.add.particles(0, 0, key, {
    x: { min: -40, max: W + 120 },
    y: cfg.y ?? -10,
    lifespan: cfg.lifespan ?? 2000,
    speedX: cfg.speedX ?? 0,
    speedY: cfg.speedY ?? 100,
    frequency: cfg.frequency ?? 60,
    quantity: cfg.quantity ?? 1,
    scale: cfg.scale ?? 3,
    alpha: cfg.alpha ?? 1,
    rotate: cfg.rotate ?? 0,
    gravityY: cfg.gravityY ?? 0,
  });
}

// Devuelve { update(dt) } para lo que se anima a mano (nubes, niebla).
export function addWeather(scene, kind) {
  ensureTextures(scene);
  const parts = [];
  const movers = [];
  const drift = (key, n, { y0, y1, speed, alpha, scale }) => {
    for (let i = 0; i < n; i++) {
      const img = scene.add.image(Phaser.Math.Between(0, W), Phaser.Math.Between(y0, y1), key)
        .setScale(scale).setAlpha(alpha);
      movers.push({ img, speed: speed * (0.6 + Math.random() * 0.8) });
      parts.push(img);
    }
  };

  switch (kind) {
    case 'sol': {
      parts.push(tint(scene, 0xfff1c1, 0.18, 0xffe0a0, 0.05));
      const sun = scene.add.image(W - 120, 90, 'wx-sun').setScale(4);
      scene.tweens.add({ targets: sun, angle: 360, duration: 40000, repeat: -1 });
      parts.push(sun);
      break;
    }
    case 'jacaranda':
      parts.push(tint(scene, 0xe8dcff, 0.12, 0xe8dcff, 0));
      parts.push(fall(scene, 'wx-petal', { speedX: { min: -60, max: -20 }, speedY: { min: 40, max: 80 }, lifespan: 7000, frequency: 260, rotate: { min: 0, max: 360 }, scale: 3 }));
      break;
    case 'llovizna':
      parts.push(tint(scene, 0x8fa6c4, 0.18, 0x8fa6c4, 0.08));
      parts.push(fall(scene, 'wx-rain', { speedX: -40, speedY: { min: 380, max: 460 }, lifespan: 1200, frequency: 45, scale: 2, alpha: 0.55 }));
      break;
    case 'lluvia':
      parts.push(tint(scene, 0x223355, 0.35, 0x223355, 0.2));
      parts.push(fall(scene, 'wx-rain', { speedX: -120, speedY: { min: 700, max: 850 }, lifespan: 800, frequency: 6, quantity: 2, scale: 2.5, alpha: 0.6 }));
      break;
    case 'nublado':
      parts.push(tint(scene, 0x7d8597, 0.3, 0x7d8597, 0.12));
      drift('wx-cloud', 6, { y0: 30, y1: 170, speed: -12, alpha: 0.9, scale: 4 });
      break;
    case 'atardecer':
      parts.push(tint(scene, 0x5a2a6e, 0.3, 0xff8c42, 0.28));
      parts.push(scene.add.circle(W - 200, 300, 46, 0xffb347, 0.9));
      break;
    case 'viento':
      parts.push(tint(scene, 0xd9c7a0, 0.15, 0xd9c7a0, 0.05));
      parts.push(fall(scene, 'wx-leaf', { x: W + 20, speedX: { min: -520, max: -360 }, speedY: { min: -30, max: 60 }, lifespan: 3000, frequency: 90, rotate: { min: 0, max: 360 } }));
      parts.push(fall(scene, 'wx-paper', { speedX: { min: -400, max: -300 }, speedY: { min: 0, max: 50 }, lifespan: 3000, frequency: 700, rotate: { min: -30, max: 30 } }));
      break;
    case 'niebla':
      parts.push(tint(scene, 0xc9d2de, 0.35, 0xc9d2de, 0.45));
      drift('wx-fog', 9, { y0: 220, y1: 400, speed: -18, alpha: 0.45, scale: 6 });
      break;
    case 'frio':
      parts.push(tint(scene, 0x4f6d9a, 0.25, 0x4f6d9a, 0.1));
      parts.push(fall(scene, 'wx-leaf', { speedX: { min: -90, max: -40 }, speedY: { min: 30, max: 70 }, lifespan: 7000, frequency: 450, rotate: { min: 0, max: 360 } }));
      break;
    case 'calor':
      parts.push(tint(scene, 0xffc46b, 0.22, 0xffe7b0, 0.1));
      parts.push(scene.add.particles(0, 0, 'wx-haze', {
        x: { min: 0, max: W }, y: { min: 300, max: GROUND_TOP }, lifespan: 1600,
        speedY: { min: -30, max: -15 }, frequency: 70, scale: { start: 3, end: 6 }, alpha: { start: 0.35, end: 0 },
      }));
      break;
    default:
      break;
  }
  fixedAll(...parts);
  return {
    update(dt) {
      for (const m of movers) {
        m.img.x += (m.speed * dt) / 1000;
        if (m.img.x < -m.img.displayWidth) m.img.x = W + m.img.displayWidth;
      }
    },
  };
}

