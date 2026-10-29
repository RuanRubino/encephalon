// Rede de "sinapses" no fundo do hero: pontos à deriva, ligações próximas,
// o cursor atrai e conecta, um clique dispara um sinal que se propaga pela rede.

const STAIN = [139, 152, 255];
const FIBER = [228, 128, 196];
const INK = [236, 230, 218];

export function initNeural(canvas, host) {
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, dpr = 1;
  let nodes = [];
  let signals = [];
  const mouse = { x: -9999, y: -9999, active: false };
  const LINK = 128;
  let running = false;
  let raf = 0;
  let lastAmbient = 0;

  function resize() {
    const r = host.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width;
    h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(120, Math.max(36, Math.round((w * h) / 13000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: 1.2 + Math.random() * 1.8,
      flash: 0
    }));
    signals = [];
    if (reduce) draw(0);
  }

  function neighbors(i, max = 4) {
    const a = nodes[i];
    const out = [];
    for (let j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      const b = nodes[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < LINK * 1.15) out.push([j, d]);
    }
    out.sort((p, q) => p[1] - q[1]);
    return out.slice(0, max).map((p) => p[0]);
  }

  function fire(i, depth = 5, from = -1) {
    nodes[i].flash = 1;
    if (depth <= 0) return;
    for (const j of neighbors(i, 3)) {
      if (j === from) continue;
      signals.push({ a: i, b: j, t: 0, depth: depth - 1, speed: 0.025 + Math.random() * 0.02 });
    }
  }

  function nearest(x, y) {
    let best = 0, bd = Infinity;
    nodes.forEach((n, i) => {
      const d = Math.hypot(n.x - x, n.y - y);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }

  function step() {
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      if (n.y > h + 20) n.y = -20;
      if (mouse.active) {
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        const d = Math.hypot(dx, dy);
        if (d < 170 && d > 1) {
          n.x += (dx / d) * 0.35;
          n.y += (dy / d) * 0.35;
        }
      }
      n.flash *= 0.94;
    }
    const next = [];
    for (const s of signals) {
      s.t += s.speed;
      if (s.t >= 1) {
        if (nodes[s.b].flash < 0.5) fire(s.b, s.depth, s.a);
      } else next.push(s);
    }
    signals = next.slice(-220);
  }

  function rgba(c, a) {
    return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = rgba(STAIN, (1 - d / LINK) * 0.2);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      if (mouse.active) {
        const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (d < 170) {
          ctx.strokeStyle = rgba(STAIN, (1 - d / 170) * 0.45);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
    for (const s of signals) {
      const a = nodes[s.a], b = nodes[s.b];
      const x = a.x + (b.x - a.x) * s.t;
      const y = a.y + (b.y - a.y) * s.t;
      ctx.strokeStyle = rgba(FIBER, 0.35);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = rgba(FIBER, 0.95);
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const n of nodes) {
      if (n.flash > 0.05) {
        ctx.fillStyle = rgba(FIBER, n.flash * 0.25);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 10 * n.flash, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = n.flash > 0.2 ? rgba(FIBER, 0.95) : rgba(INK, 0.45);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(t) {
    if (!running) return;
    step();
    draw();
    if (t - lastAmbient > 2600 && nodes.length) {
      lastAmbient = t;
      fire(Math.floor(Math.random() * nodes.length), 3);
    }
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduce) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  host.addEventListener('pointermove', (e) => {
    const r = host.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
  });
  host.addEventListener('pointerleave', () => { mouse.active = false; });
  host.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) return;
    const r = host.getBoundingClientRect();
    const i = nearest(e.clientX - r.left, e.clientY - r.top);
    fire(i, 6);
    if (reduce) draw();
  });

  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop())).observe(host);
  resize();
}
