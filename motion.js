// Poster tilt + glow on the home page. Kept outside the canvas export so a
// re-export doesn't lose it: after exporting, re-add this line to the <head> of
// index.html:  <script src="/motion.js" defer></script>
//
// The bundle renders, re-renders and clones the page, so nothing here holds on
// to elements: listeners live on the document and the poster is found from the
// event target each time.
(() => {
  const MAX_TILT = 5; // degrees at the poster's edge
  const POSTER = ':scope > img[alt*="double feature poster" i]';
  // Glow colour follows the half under the cursor (hotspots split at 47% / 89%).
  const glowFor = (py) =>
    py < 0.47 ? 'rgba(216,50,30,.38)' :    // Knock Knock red
    py < 0.89 ? 'rgba(170,201,15,.34)' :   // Wombo green
                'rgba(244,234,210,.22)';   // footer strip

  // Checked per event: media queries created before the bundle swaps in the
  // page don't reliably update afterwards.
  const motionOk = () =>
    !matchMedia('(prefers-reduced-motion: reduce)').matches &&
    matchMedia('(hover: hover) and (pointer: fine)').matches;

  const cardFrom = (el) => {
    for (let c = el; c && c.nodeType === 1; c = c.parentElement) {
      if (c.querySelector(POSTER)) return c;
    }
    return null;
  };

  const glowIn = (card) => {
    let glow = card.querySelector(':scope > [data-poster-glow]');
    if (!glow) {
      glow = document.createElement('div');
      glow.dataset.posterGlow = '';
      glow.style.cssText =
        'position:absolute;inset:0;pointer-events:none;opacity:0;' +
        'mix-blend-mode:screen;transition:opacity .35s ease';
      card.querySelector(POSTER).after(glow); // under the hotspots, so their labels stay untinted
    }
    return glow;
  };

  let active = null, raf = 0, cx = 0, cy = 0;

  const settle = () => {
    if (!active) return;
    active.style.transition = 'transform .7s cubic-bezier(.2,.7,.2,1)';
    active.style.transform = '';
    glowIn(active).style.opacity = '0';
    active = null;
  };

  const render = () => {
    raf = 0;
    if (!active || !active.isConnected) return;
    const r = active.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (cx - r.left) / r.width));
    const py = Math.min(1, Math.max(0, (cy - r.top) / r.height));
    active.style.transform =
      `perspective(1400px) rotateX(${((0.5 - py) * 2 * MAX_TILT).toFixed(2)}deg)` +
      ` rotateY(${((px - 0.5) * 2 * MAX_TILT).toFixed(2)}deg)`;
    const glow = glowIn(active);
    glow.style.background =
      `radial-gradient(circle at ${px * 100}% ${py * 100}%, ${glowFor(py)}, transparent 42%)`;
    glow.style.opacity = '1';
  };

  document.addEventListener('pointermove', (e) => {
    const card = motionOk() ? cardFrom(e.target) : null;
    if (card !== active) settle();
    if (!card) return;
    active = card;
    cx = e.clientX; cy = e.clientY;
    card.style.transition = 'transform .15s ease-out';
    raf ||= requestAnimationFrame(render);
  }, { passive: true });

  // Cursor left the window, or the page moved on to a show.
  document.addEventListener('pointerout', (e) => { if (!e.relatedTarget) settle(); });
  addEventListener('hashchange', settle);
})();
