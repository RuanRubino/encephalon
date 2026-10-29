const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Entrada suave dos blocos marcados com .reveal
export function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = `${Math.min(i, 4) * 90}ms`;
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

// Borda da barra de navegação depois de rolar
export function initNav() {
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Colagem do hero: cada recorte segue o cursor conforme sua profundidade
export function initParallax() {
  const hero = document.querySelector('.hero');
  const pieces = [...document.querySelectorAll('[data-depth]')];
  if (!hero || reduce()) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, sy = 0;
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
  });
  hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
  (function frame() {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    sy = window.scrollY;
    pieces.forEach((p) => {
      const d = parseFloat(p.dataset.depth);
      p.style.transform = `translate3d(${cx * d * -36}px, ${cy * d * -30 - sy * d * 0.12}px, 0)`;
    });
    requestAnimationFrame(frame);
  })();
}

// Faixa de palavras: anda sozinha e acelera com a rolagem
export function initMarquee() {
  const track = document.querySelector('.marquee__track');
  if (!track) return;
  if (reduce()) return;
  let x = 0, last = window.scrollY, boost = 0;
  (function frame() {
    const y = window.scrollY;
    boost += (Math.abs(y - last) * 0.25 - boost) * 0.1;
    last = y;
    x -= 0.6 + boost;
    const half = track.scrollWidth / 2;
    if (-x >= half) x += half;
    track.style.transform = `translate3d(${x}px,0,0)`;
    requestAnimationFrame(frame);
  })();
}

// Manifesto: as palavras acendem conforme o texto passa pela tela
export function initWords() {
  const el = document.querySelector('[data-words]');
  if (!el) return;
  const keys = new Set(['cérebro.', 'cérebro', 'apaga.', 'visível:', 'processo', 'onde']);
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map((w) => `<span class="w${keys.has(w) ? ' key' : ''}">${w}</span>`)
    .join(' ');
  const spans = [...el.querySelectorAll('.w')];
  if (reduce()) {
    spans.forEach((s) => s.classList.add('on'));
    return;
  }
  const update = () => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    const n = Math.round(p * spans.length);
    spans.forEach((s, i) => s.classList.toggle('on', i < n));
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

// Botões magnéticos
export function initMagnetic() {
  if (!finePointer() || reduce()) return;
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', `${(e.clientX - r.left - r.width / 2) * 0.25}px`);
      btn.style.setProperty('--my', `${(e.clientY - r.top - r.height / 2) * 0.35}px`);
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  });
}

// Cartões de princípios inclinam em 3D sob o cursor
export function initTilt() {
  if (!finePointer() || reduce()) return;
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${x * 10}deg`);
      card.style.setProperty('--rx', `${y * -10}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    });
  });
}

// Galeria: arrastar para os lados
export function initStrip() {
  const strip = document.querySelector('.strip');
  if (!strip) return;
  let down = false, startX = 0, startScroll = 0, moved = false;
  strip.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true;
    moved = false;
    startX = e.clientX;
    startScroll = strip.scrollLeft;
    strip.setPointerCapture(e.pointerId);
  });
  strip.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) {
      moved = true;
      strip.classList.add('is-dragging');
    }
    strip.scrollLeft = startScroll - dx;
  });
  const end = () => {
    down = false;
    strip.classList.remove('is-dragging');
  };
  strip.addEventListener('pointerup', end);
  strip.addEventListener('pointercancel', end);
  strip.addEventListener('click', (e) => { if (moved) e.preventDefault(); }, true);
}

// Cursor: ponto + anel que segue com atraso e cresce sobre o que é clicável
export function initCursor() {
  if (!finePointer() || reduce()) return;
  document.documentElement.classList.add('has-cursor');
  const root = document.querySelector('.cursor');
  const dot = root.querySelector('.cursor__dot');
  const ring = root.querySelector('.cursor__ring');
  let x = -100, y = -100, rx = -100, ry = -100;
  window.addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    const hot = e.target.closest('a, button, input, .node, .strip, .tilt');
    root.classList.toggle('is-hover', !!hot);
  });
  (function frame() {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    dot.style.transform = `translate(${x}px, ${y}px)`;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(frame);
  })();
}

// Formulário da lista de espera (ainda sem servidor: só confirma na tela)
export function initForm() {
  const form = document.querySelector('.cta__form');
  if (!form) return;
  const input = form.querySelector('input');
  const msg = document.querySelector('.cta__msg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      msg.textContent = 'Digite um e-mail válido, como voce@empresa.com.br.';
      input.focus();
      return;
    }
    msg.textContent = `Pronto. Avisaremos ${v} quando o Synapsis abrir para testes.`;
    form.reset();
  });
}
