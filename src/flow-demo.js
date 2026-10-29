// Demonstração do Synapsis: uma execução com 5 etapas.
// "Concluir etapa" marca a atual como concluída e um pulso viaja pelo conector até a próxima.

const STEPS = [
  { title: 'Pedido', dept: 'Compras', who: 'Ana' },
  { title: 'Cotação', dept: 'Compras', who: 'Bruno' },
  { title: 'Aprovação', dept: 'Financeiro', who: 'Carla' },
  { title: 'Compra', dept: 'Vendas', company: 'Empresa B', who: 'Diego' },
  { title: 'Recebimento', dept: 'Logística', who: 'Elisa' }
];

export function initFlowDemo(root) {
  const canvas = root.querySelector('.demo__canvas');
  const svg = root.querySelector('.demo__wires');
  const layer = root.querySelector('.demo__nodes');
  const pulse = root.querySelector('.demo__pulse');
  const info = root.querySelector('.demo__info');
  const status = root.querySelector('[data-status]');
  const advanceBtn = root.querySelector('[data-advance]');
  const resetBtn = root.querySelector('[data-reset]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = 0;
  let selected = 0;
  let busy = false;
  let points = [];
  const paths = [];

  const buttons = STEPS.map((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'node' + (s.company ? ' is-external' : '');
    b.innerHTML =
      `<span class="node__k">ETAPA 0${i + 1}</span>` +
      `<span class="node__t">${s.title}</span>` +
      `<span class="node__d">${s.company ? 'Externo · ' + s.company : s.dept}</span>`;
    b.addEventListener('click', () => { selected = i; render(); });
    layer.appendChild(b);
    return b;
  });

  function layout() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const narrow = w < 480;
    points = STEPS.map((_, i) =>
      narrow
        ? { x: w * (i % 2 ? 0.7 : 0.3), y: h * (0.11 + i * 0.195) }
        : { x: w * (0.11 + i * 0.195), y: h * (i % 2 ? 0.7 : 0.3) }
    );
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.innerHTML = '';
    paths.length = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i], b = points[i + 1];
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const d = narrow
        ? `M${a.x} ${a.y} C${a.x} ${(a.y + b.y) / 2} ${b.x} ${(a.y + b.y) / 2} ${b.x} ${b.y}`
        : `M${a.x} ${a.y} C${(a.x + b.x) / 2} ${a.y} ${(a.x + b.x) / 2} ${b.y} ${b.x} ${b.y}`;
      p.setAttribute('d', d);
      if (STEPS[i + 1].company) p.classList.add('external');
      svg.appendChild(p);
      paths.push(p);
    }
    buttons.forEach((b, i) => {
      b.style.left = points[i].x + 'px';
      b.style.top = points[i].y + 'px';
    });
    render();
  }

  function initials(name) {
    return name.slice(0, 1).toUpperCase();
  }

  function render() {
    const finished = current >= STEPS.length;
    buttons.forEach((b, i) => {
      b.classList.toggle('is-done', i < current);
      b.classList.toggle('is-current', i === current);
      b.classList.toggle('is-selected', i === selected);
      b.setAttribute('aria-pressed', i === selected ? 'true' : 'false');
    });
    paths.forEach((p, i) => p.classList.toggle('done', i < current));
    status.textContent = finished ? 'Concluída' : 'Em andamento';
    status.classList.toggle('is-done', finished);
    advanceBtn.disabled = finished || busy;

    const s = STEPS[selected];
    const where = s.company ? `${s.dept} · ${s.company}` : s.dept;
    if (selected < current) {
      info.innerHTML =
        `<span class="avatar" aria-hidden="true">${initials(s.who)}</span>` +
        `<span><strong>${s.title}</strong> respondida por <strong>${s.who}</strong> · ${where}</span>`;
    } else if (selected === current) {
      info.innerHTML =
        `<span class="avatar" style="background: var(--amber); color: #2a1c00" aria-hidden="true">${initials(s.who)}</span>` +
        `<span><strong>${s.title}</strong> está com ${where}. O chefe delegou a <strong>${s.who}</strong>.</span>`;
    } else {
      info.innerHTML = `<span><strong>${s.title}</strong> ainda não chegou a ${where}.</span>`;
    }
    if (finished && selected === STEPS.length - 1) {
      info.innerHTML += '<span>Execução <strong>#128</strong> concluída.</span>';
    }
  }

  function travel(path, done) {
    if (reduce || !path) return done();
    const len = path.getTotalLength();
    const t0 = performance.now();
    const dur = 750;
    pulse.style.opacity = '1';
    (function frame(t) {
      const k = Math.min(1, (t - t0) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const pt = path.getPointAtLength(len * e);
      pulse.style.left = pt.x + 'px';
      pulse.style.top = pt.y + 'px';
      if (k < 1) requestAnimationFrame(frame);
      else {
        pulse.style.opacity = '0';
        done();
      }
    })(t0);
  }

  advanceBtn.addEventListener('click', () => {
    if (busy || current >= STEPS.length) return;
    busy = true;
    const from = current;
    current += 1;
    selected = from;
    render();
    travel(paths[from], () => {
      busy = false;
      if (current < STEPS.length) selected = current;
      render();
    });
  });

  resetBtn.addEventListener('click', () => {
    current = 0;
    selected = 0;
    busy = false;
    render();
  });

  new ResizeObserver(layout).observe(canvas);
  layout();
}
