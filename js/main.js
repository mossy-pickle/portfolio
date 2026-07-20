/* ============================================================
   Orbit positioning
   Items are evenly spaced around a circle of radius --orbit-r.
   CSS handles the spin; JS only sets the initial translate.
   ============================================================ */
(function positionOrbitItems() {
  const stage = document.querySelector('.orbit-stage');
  if (!stage) return;

  const items = stage.querySelectorAll('.orbit-item');
  const r = getComputedStyle(document.documentElement)
    .getPropertyValue('--orbit-r').trim().replace('px', '');
  const radius = parseInt(r, 10) || 160;
  const count = items.length;

  items.forEach((item, i) => {
    const angleDeg = (360 / count) * i - 90; // start at top
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;
    item.style.transform = `translate(${x}px, ${y}px)`;
    // expose counter angle for CSS hover
    item.querySelector('a').style.setProperty('--counter', '0deg');
  });
})();

/* ============================================================
   Active nav link
   ============================================================ */
(function setActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();
