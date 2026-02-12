// Subtle star field — same as dashboard but lighter
(function() {
  const c = document.getElementById('starfield');
  if (!c) return;
  const ctx = c.getContext('2d');
  let stars = [], w, h;

  function resize() {
    w = c.width = innerWidth;
    h = c.height = innerHeight;
  }

  function make() {
    stars = [];
    const count = Math.min(120, (w * h) / 15000 | 0);
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

  function draw(t) {
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
    requestAnimationFrame(draw);
  }

  resize();
  make();
  requestAnimationFrame(draw);
  addEventListener('resize', () => { resize(); make(); });
})();
