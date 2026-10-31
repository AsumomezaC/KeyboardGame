// Pista de parkour: el corredor avanza solo y cada obstáculo se supera escribiendo su texto.
// Si llegas al obstáculo sin terminarlo, te detienes frente a él y el reloj sigue corriendo.
const Game = (() => {
  const W = 960, H = 360, GROUND_Y = 290;
  const PLAYER_SCREEN_X = 220, PW = 22, PH = 44;
  const BASE_SPEED = 160;        // px/s
  const MAX_COMBO_BONUS = 0.6;   // +60 % de velocidad con racha alta
  const STUMBLE_MS = 450;
  const SHAPES = {
    muro: { w: 46, h: 42 },
    hueco: { w: 80, h: 0 },
    pared: { w: 34, h: 120 },
  };

  let ctx = null;
  let s = null;
  let rafId = 0;
  let hooks = {};

  function start(canvas, level, h) {
    ctx = canvas.getContext('2d');
    hooks = h;
    let x = 760;
    const obstacles = level.items.map(([text, type]) => {
      const shape = SHAPES[type];
      const o = { x, w: shape.w, h: shape.h, type, chars: Array.from(text), typed: 0, cleared: false };
      x += shape.w + 260 + o.chars.length * 22;
      return o;
    });
    const now = performance.now();
    s = {
      level, obstacles,
      target: 0, pos: 0, combo: 0, bestCombo: 0,
      stumbleUntil: 0, flashUntil: 0, blocked: false,
      phase: 'countdown', countdownEnd: now + 3000, startTime: 0, endTime: 0, last: now,
      finishX: x - 100,
      correct: 0, errors: 0, errByChar: {},
    };
    notifyTarget();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    cancelAnimationFrame(rafId);
    s = null;
  }

  function loop(now) {
    if (!s) return;
    const dt = Math.min(0.05, (now - s.last) / 1000);
    s.last = now;
    update(now, dt);
    draw(now);
    if (s.phase === 'done') {
      hooks.onFinish(results());
      return;
    }
    rafId = requestAnimationFrame(loop);
  }

  function update(now, dt) {
    if (s.phase === 'countdown') {
      if (now >= s.countdownEnd) {
        s.phase = 'run';
        s.startTime = now;
      }
      return;
    }
    const stumbling = now < s.stumbleUntil;
    const mult = stumbling ? 0.15 : 1 + Math.min(s.combo / 40, 1) * MAX_COMBO_BONUS;
    let next = s.pos + BASE_SPEED * mult * dt;
    const o = s.obstacles[s.target];
    s.blocked = false;
    if (o) {
      const limit = o.x - 8 - PW;
      if (next > limit) {
        next = Math.max(s.pos, limit);
        s.blocked = true;
      }
    }
    s.pos = next;
    if (s.pos >= s.finishX) {
      s.phase = 'done';
      s.endTime = now;
    }
  }

  function onChar(ch) {
    if (!s || s.phase !== 'run') return;
    const o = s.obstacles[s.target];
    if (!o) return;
    const expected = o.chars[o.typed];
    if (ch === expected) {
      o.typed++;
      s.correct++;
      s.combo++;
      s.bestCombo = Math.max(s.bestCombo, s.combo);
      if (o.typed === o.chars.length) {
        o.cleared = true;
        s.target++;
      }
    } else {
      const now = performance.now();
      s.errors++;
      s.combo = 0;
      s.errByChar[expected] = (s.errByChar[expected] || 0) + 1;
      s.stumbleUntil = now + STUMBLE_MS;
      s.flashUntil = now + 200;
      if (hooks.onError) hooks.onError(expected, ch);
    }
    notifyTarget();
  }

  function notifyTarget() {
    const o = s.obstacles[s.target];
    hooks.onTarget(o ? { chars: o.chars, typed: o.typed } : null);
  }

  function results() {
    const ms = s.endTime - s.startTime;
    const total = s.correct + s.errors;
    return {
      levelId: s.level.id,
      levelName: s.level.name,
      timeMs: ms,
      wpm: s.correct / 5 / (ms / 60000),
      accuracy: total ? s.correct / total : 1,
      correct: s.correct,
      errors: s.errors,
      bestCombo: s.bestCombo,
      weak: Object.entries(s.errByChar).sort((a, b) => b[1] - a[1]),
    };
  }

  // ---------- Dibujo ----------

  function draw(now) {
    const cam = s.pos - PLAYER_SCREEN_X;
    drawBackground(cam);
    drawGround(cam);
    drawFinish(cam);
    for (const o of s.obstacles) drawObstacle(o, cam);
    drawPlayer(now);
    for (let i = 0; i < s.obstacles.length; i++) drawLabel(s.obstacles[i], cam, i === s.target);
    drawHUD(now);
    if (now < s.flashUntil) {
      ctx.fillStyle = 'rgba(220, 40, 40, 0.18)';
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawBackground(cam) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#1b2440');
    sky.addColorStop(1, '#39466e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    // Edificios con paralaje; la altura sale de un pseudoaleatorio fijo por índice.
    ctx.fillStyle = '#26304f';
    const offset = cam * 0.3;
    const first = Math.floor(offset / 90) - 1;
    for (let i = first; i < first + 14; i++) {
      const bh = 60 + ((i * 7919) % 97 + 97) % 97 * 1.4;
      ctx.fillRect(i * 90 - offset, GROUND_Y - bh, 70, bh);
    }
  }

  function drawGround(cam) {
    ctx.fillStyle = '#5b4a3a';
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = '#7a6450';
    ctx.fillRect(0, GROUND_Y, W, 6);
    ctx.fillStyle = '#0d1020';
    for (const o of s.obstacles) {
      if (o.type !== 'hueco') continue;
      const x = o.x - cam;
      if (x > -o.w && x < W) ctx.fillRect(x, GROUND_Y, o.w, H - GROUND_Y);
    }
  }

  function drawFinish(cam) {
    const x = s.finishX + PW - cam;
    if (x < -20 || x > W + 20) return;
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = i % 2 ? '#111' : '#eee';
      ctx.fillRect(x, GROUND_Y - 120 + i * 10, 10, 10);
    }
  }

  function drawObstacle(o, cam) {
    if (o.type === 'hueco') return;
    const x = o.x - cam;
    if (x < -o.w || x > W) return;
    ctx.fillStyle = o.type === 'pared' ? '#8d99ae' : '#a9746e';
    ctx.fillRect(x, GROUND_Y - o.h, o.w, o.h);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.strokeRect(x + 0.5, GROUND_Y - o.h + 0.5, o.w - 1, o.h - 1);
  }

  function jumpOffset() {
    const px = s.pos + PW / 2;
    for (const o of s.obstacles) {
      if (!o.cleared) break;
      const from = o.x - 70, to = o.x + o.w + 40;
      if (px > from && px < to) {
        const peak = o.type === 'pared' ? o.h + 16 : 64;
        return Math.sin(Math.PI * (px - from) / (to - from)) * peak;
      }
    }
    return 0;
  }

  function drawPlayer(now) {
    const air = jumpOffset();
    const x = PLAYER_SCREEN_X;
    const y = GROUND_Y - PH - air;
    const stumbling = now < s.stumbleUntil;
    const moving = s.phase === 'run' && !s.blocked;
    const stride = moving && air === 0 ? Math.sin(s.pos / 9) * 8 : 0;

    ctx.save();
    ctx.translate(x + PW / 2, y + PH);
    if (stumbling) ctx.rotate(0.25);
    ctx.strokeStyle = stumbling ? '#ff6b6b' : '#ffd166';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    // piernas
    ctx.beginPath();
    ctx.moveTo(0, -18); ctx.lineTo(stride, 0);
    ctx.moveTo(0, -18); ctx.lineTo(-stride, 0);
    // torso
    ctx.moveTo(0, -18); ctx.lineTo(2, -34);
    // brazos
    ctx.moveTo(2, -30); ctx.lineTo(10 - stride / 2, -22);
    ctx.moveTo(2, -30); ctx.lineTo(-6 + stride / 2, -22);
    ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(3, -40, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (s.blocked && s.phase === 'run') {
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('¡Escribe para pasar!', x + PW / 2, GROUND_Y + 32);
    }
  }

  function drawLabel(o, cam, isTarget) {
    const cx = o.x + o.w / 2 - cam;
    if (cx < -150 || cx > W + 150) return;
    const chars = o.chars.map(c => (c === ' ' ? '·' : c));
    ctx.font = (isTarget ? 'bold 22px ' : '18px ') + 'Consolas, "Courier New", monospace';
    ctx.textAlign = 'left';
    const widths = chars.map(c => ctx.measureText(c).width);
    const total = widths.reduce((a, b) => a + b, 0);
    const y = GROUND_Y - Math.max(o.h, 20) - 20;
    let x = cx - total / 2;

    if (isTarget) {
      ctx.fillStyle = 'rgba(10, 12, 25, 0.75)';
      ctx.fillRect(x - 8, y - 22, total + 16, 30);
    }
    chars.forEach((c, i) => {
      if (o.cleared) ctx.fillStyle = 'rgba(160, 220, 160, 0.45)';
      else if (i < o.typed) ctx.fillStyle = '#7bd389';
      else if (isTarget && i === o.typed) ctx.fillStyle = '#ffd166';
      else ctx.fillStyle = '#f1f1f1';
      ctx.fillText(c, x, y);
      if (isTarget && i === o.typed) ctx.fillRect(x, y + 4, widths[i], 2);
      x += widths[i];
    });
  }

  function drawHUD(now) {
    const elapsed = s.phase === 'countdown' ? 0 : (s.phase === 'done' ? s.endTime : now) - s.startTime;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, W, 34);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Tiempo ${(elapsed / 1000).toFixed(2)} s`, 14, 23);
    ctx.textAlign = 'center';
    const done = s.obstacles.filter(o => o.cleared).length;
    ctx.fillText(`Obstáculos ${done}/${s.obstacles.length}`, W / 2, 23);
    ctx.textAlign = 'right';
    const wpm = elapsed > 1000 ? s.correct / 5 / (elapsed / 60000) : 0;
    ctx.fillText(`Racha ${s.combo}   PPM ${wpm.toFixed(0)}`, W - 14, 23);

    if (s.phase === 'countdown') {
      const n = Math.ceil((s.countdownEnd - now) / 1000);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 96px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(n), W / 2, H / 2 + 30);
    }
  }

  return { start, stop, onChar };
})();
