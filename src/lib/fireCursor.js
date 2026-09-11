/**
 * Fire Lighter Cursor — визуальный оверлей курсора в виде зажигалки с огнём.
 * Framework-agnostic (можно обернуть в React/Next.js компонент).
 *
 * Ключевая идея: пламя ВСЕГДА рисуется точно в точке (mouseX, mouseY) —
 * то есть там же, где ваша игровая логика регистрирует точку рисования.
 * Корпус зажигалки смещён относительно пламени, а не наоборот — поэтому
 * визуальный "кончик огня" и реальная точка курсора теперь совпадают 1:1.
 *
 * Использование:
 *   import { createFireCursor } from './fireCursor.js';
 *   const cursor = createFireCursor(containerElement);
 *   // ...
 *   cursor.destroy(); // при размонтировании
 */

export function createFireCursor(targetEl, opts = {}) {
  const TILT_ANGLE = (opts.tiltDeg ?? -35) * Math.PI / 180;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = opts.zIndex ?? 1000;

  const prevPosition = targetEl.style.position;
  if (!prevPosition || prevPosition === 'static') {
    targetEl.style.position = 'relative';
  }
  const prevCursor = targetEl.style.cursor;
  targetEl.style.cursor = 'none';
  targetEl.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = targetEl.clientWidth;
    canvas.height = targetEl.clientHeight;
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(targetEl);

  let mouseX = 0, mouseY = 0, active = false, isDrawing = false;
  let particles = [];
  let t = 0;
  let raf;

  function onMove(e) {
    const rect = targetEl.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    active = true;
  }
  function onLeave() { active = false; isDrawing = false; }
  function onDown() { isDrawing = true; }
  function onUp() { isDrawing = false; }

  targetEl.addEventListener('mousemove', onMove);
  targetEl.addEventListener('mouseleave', onLeave);
  targetEl.addEventListener('mousedown', onDown);
  window.addEventListener('mouseup', onUp);

  function spawnParticles(x, y, count, intense) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * (intense ? 1.6 : 0.7),
        vy: -Math.random() * (intense ? 2.2 : 1.1) - 0.3,
        life: 1,
        decay: 0.014 + Math.random() * 0.022,
        size: (intense ? 7 : 4) + Math.random() * (intense ? 7 : 5),
        hue: 18 + Math.random() * 32
      });
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Реалистичное многослойное пламя: синее основание -> оранжевая середина -> жёлто-белый кончик.
  // cx,cy передаются как (0,0) — это точка контакта, привязанная к реальной точке курсора.
  function drawRealisticFlame(cx, cy, h, w, flicker) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(flicker, flicker);

    const outer = new Path2D();
    outer.moveTo(0, -h);
    outer.bezierCurveTo(-w * 0.55, -h * 0.55, -w * 0.65, -h * 0.2, -w * 0.4, 0);
    outer.bezierCurveTo(-w * 0.2, h * 0.15, w * 0.2, h * 0.15, w * 0.4, 0);
    outer.bezierCurveTo(w * 0.65, -h * 0.2, w * 0.55, -h * 0.55, 0, -h);
    outer.closePath();
    const gOuter = ctx.createLinearGradient(0, -h, 0, h * 0.1);
    gOuter.addColorStop(0, '#ffe27a');
    gOuter.addColorStop(0.35, '#ff8f1f');
    gOuter.addColorStop(1, '#c62828');
    ctx.fillStyle = gOuter;
    ctx.fill(outer);

    const mid = new Path2D();
    mid.moveTo(0, -h * 0.8);
    mid.bezierCurveTo(-w * 0.32, -h * 0.4, -w * 0.36, -h * 0.1, -w * 0.2, h * 0.05);
    mid.bezierCurveTo(-w * 0.1, h * 0.12, w * 0.1, h * 0.12, w * 0.2, h * 0.05);
    mid.bezierCurveTo(w * 0.36, -h * 0.1, w * 0.32, -h * 0.4, 0, -h * 0.8);
    mid.closePath();
    const gMid = ctx.createLinearGradient(0, -h * 0.8, 0, h * 0.1);
    gMid.addColorStop(0, '#fff3c4');
    gMid.addColorStop(1, '#ff9800');
    ctx.fillStyle = gMid;
    ctx.fill(mid);

    const base = new Path2D();
    base.ellipse(0, h * 0.02, w * 0.16, h * 0.14, 0, 0, Math.PI * 2);
    const gBase = ctx.createRadialGradient(0, h * 0.02, 0, 0, h * 0.02, w * 0.16);
    gBase.addColorStop(0, '#bfe9ff');
    gBase.addColorStop(0.6, '#4fc3f7');
    gBase.addColorStop(1, 'rgba(79,195,247,0)');
    ctx.fillStyle = gBase;
    ctx.fill(base);

    ctx.restore();
  }

  // Корпус зажигалки сдвинут ОТ точки контакта, а не наоборот —
  // именно поэтому пламя больше не "убегает" от реальной точки рисования.
  function drawLighter(flicker) {
    const OFFSET_X = 3, OFFSET_Y = 1; // визуальный сдвиг корпуса относительно пламени

    const bodyGrad = ctx.createLinearGradient(-9, 0, 9, 0);
    bodyGrad.addColorStop(0, '#4a4f56');
    bodyGrad.addColorStop(0.4, '#e8edf1');
    bodyGrad.addColorStop(0.6, '#9aa2ab');
    bodyGrad.addColorStop(1, '#2e3236');
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = '#1a1c1f';
    ctx.lineWidth = 1.5;
    roundRect(-9 + OFFSET_X, 8 + OFFSET_Y, 18, 38, 3);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#7c848c';
    roundRect(-9 + OFFSET_X, 2 + OFFSET_Y, 18, 8, 2);
    ctx.fill();
    ctx.strokeStyle = '#1a1c1f';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(6 + OFFSET_X, 5 + OFFSET_Y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#c9a227';
    ctx.fill();
    ctx.strokeStyle = '#7a5c12';
    ctx.stroke();

    // Пламя визуально шире своей математической точки контакта (закруглённое
    // основание), из-за чего линия рисовалась заметно ниже видимого кончика.
    // Уменьшили и сдвинули вниз, чтобы видимый кончик совпадал с (0,0).
    drawRealisticFlame(0, 5, 18, 9, flicker);
  }

  function drawCursor(x, y, time) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(TILT_ANGLE);
    const flicker = 1 + Math.sin(time * 0.02) * 0.05 + (Math.random() - 0.5) * 0.04;
    ctx.save();
    ctx.shadowColor = 'rgba(255,120,0,0.9)';
    ctx.shadowBlur = 20;
    drawLighter(flicker);
    ctx.restore();
    ctx.restore();
  }

  function loop() {
    t++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (active) {
      if (isDrawing && t % 2 === 0) spawnParticles(mouseX, mouseY, 3, true);
      else if (t % 3 === 0) spawnParticles(mouseX, mouseY, 1, false);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    particles = particles.filter(p => p.life > 0);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy -= 0.01;
      p.life -= p.decay;
      const r = Math.max(0, p.size * p.life);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.life})`);
      g.addColorStop(1, `hsla(${p.hue}, 100%, 40%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (active) drawCursor(mouseX, mouseY, t);
    raf = requestAnimationFrame(loop);
  }
  loop();

  return {
    // точная точка контакта пламени прямо сейчас — используйте её (или свои же
    // container-relative координаты мыши) для рисования линии, чтобы курсор
    // и визуальный огонь совпадали
    getContactPoint: () => ({ x: mouseX, y: mouseY }),
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      targetEl.removeEventListener('mousemove', onMove);
      targetEl.removeEventListener('mouseleave', onLeave);
      targetEl.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      canvas.remove();
      targetEl.style.cursor = prevCursor;
    }
  };
}
