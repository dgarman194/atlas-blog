// Subtle star field — same as dashboard but lighter
(function() {
  const c = document.getElementById('starfield');
  if (!c) return;
  const ctx = c.getContext('2d');
  let stars = [], w, h;
  let rafId = 0;
  let lastFrameTs = 0;
  const frameIntervalMs = 1000 / 30; // Cap at 30fps to reduce CPU usage.
  let running = false;

  function resize() {
    w = c.width = innerWidth;
    h = c.height = innerHeight;
  }

  function make() {
    stars = [];
    const count = Math.min(80, (w * h) / 20000 | 0);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.6 + 0.1,
        sp: Math.random() * 0.003 + 0.001,
        ph: Math.random() * Math.PI * 2
      });
    }
  }

  function drawFrame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const a = 0.15 + ((Math.sin(t * s.sp + s.ph) + 1) / 2) * 0.6 * s.a;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.r > 0.9
        ? `rgba(212, 168, 67, ${a * 0.5})`
        : `rgba(200, 210, 230, ${a})`;
      ctx.fill();
    }
  }

  function tick(ts) {
    if (!running) return;
    if (ts - lastFrameTs >= frameIntervalMs) {
      drawFrame(ts);
      lastFrameTs = ts;
    }
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function onVisibilityChange() {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  }

  resize();
  make();
  start();
  addEventListener('resize', () => { resize(); make(); });
  document.addEventListener('visibilitychange', onVisibilityChange);
})();
