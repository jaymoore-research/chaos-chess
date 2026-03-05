import { currentTheme } from './themes.js';

export function initArt(canvas) {
  const ctx = canvas.getContext('2d');
  let w, h;
  const particles = [];
  const NUM_PARTICLES = 200;
  let time = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    ctx.fillStyle = currentTheme.bgBase;
    ctx.fillRect(0, 0, w, h);
  }

  function flowAngle(x, y, t) {
    const scale = 0.003;
    const nx = x * scale;
    const ny = y * scale;
    return (
      Math.sin(nx * 2.5 + t * 0.4) * Math.cos(ny * 1.8 + t * 0.3) +
      Math.cos(nx * 1.2 - ny * 2.1 + t * 0.5) * 1.5 +
      Math.sin((nx + ny) * 3.0 + t * 0.2) * 0.8 +
      Math.sin(Math.sqrt(nx * nx + ny * ny) * 4.0 - t * 0.6) * 0.6
    );
  }

  function createParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      hue: Math.random() * 360,
      life: Math.random() * 300 + 100,
      speed: Math.random() * 1.5 + 0.5,
    };
  }

  function init() {
    resize();
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push(createParticle());
    }
    window.addEventListener('resize', resize);
  }

  function update() {
    time += 0.01;
    const t = currentTheme;

    ctx.fillStyle = t.trailFade;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const angle = flowAngle(p.x, p.y, time);
      p.x += Math.cos(angle) * p.speed;
      p.y += Math.sin(angle) * p.speed;
      p.hue = (p.hue + 0.3) % 360;
      p.life--;

      const alpha = Math.min(1, p.life / 50);
      const size = 2 + Math.sin(time * 2 + i) * 1;
      ctx.fillStyle = `hsla(${p.hue}, ${t.particleSaturation}%, ${t.particleLightness}%, ${alpha})`;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), size, size);

      ctx.fillStyle = `hsla(${p.hue}, ${t.particleSaturation}%, ${Math.min(90, t.particleLightness + 20)}%, ${alpha * 0.4})`;
      ctx.fillRect(Math.floor(p.x) - 1, Math.floor(p.y) - 1, size + 2, size + 2);

      if (p.life <= 0 || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
        particles[i] = createParticle();
      }
    }

    drawSpirals(ctx, w, h, time);
    requestAnimationFrame(update);
  }

  function drawSpirals(ctx, w, h, t) {
    const hues = currentTheme.spiralHues;
    const spirals = [
      { cx: w * 0.15, cy: h * 0.25, r: 80, speed: 1 },
      { cx: w * 0.85, cy: h * 0.75, r: 100, speed: -0.7 },
      { cx: w * 0.5, cy: h * 0.9, r: 60, speed: 1.3 },
      { cx: w * 0.1, cy: h * 0.8, r: 70, speed: -0.9 },
      { cx: w * 0.9, cy: h * 0.15, r: 90, speed: 0.8 },
    ];

    for (let si = 0; si < spirals.length; si++) {
      const s = spirals[si];
      const baseHue = hues[si] || 0;
      const points = 80;
      for (let i = 0; i < points; i++) {
        const frac = i / points;
        const angle = frac * Math.PI * 6 + t * s.speed;
        const radius = s.r * frac;
        const x = s.cx + Math.cos(angle) * radius;
        const y = s.cy + Math.sin(angle) * radius;

        const hue = (baseHue + frac * 60 + t * 20) % 360;
        const alpha = (1 - frac) * 0.15;
        const size = 2 + (1 - frac) * 2;

        ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
        ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
      }
    }
  }

  init();
  update();
}
