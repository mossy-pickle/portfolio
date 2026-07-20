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

/* ============================================================
   Neuron diagram — static nodes + animated webbing
   ============================================================ */
(function initNeuron() {
  const stage = document.getElementById('neuronStage');
  const canvas = document.getElementById('neuronCanvas');
  if (!stage || !canvas) return;

  const ctx = canvas.getContext('2d');
  const nodes = Array.from(stage.querySelectorAll('.neuron-node'));

  // Size the canvas to the stage
  const W = stage.offsetWidth;
  const H = stage.offsetHeight;
  canvas.width = W;
  canvas.height = H;

  const cx = W / 2;
  const cy = H / 2;

  // Position each node around the center based on data-angle
  const r = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--orbit-r'), 10
  ) || 160;
  const iconSize = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--icon-size'), 10
  ) || 64;

  const nodePositions = nodes.map(node => {
    const angleDeg = parseFloat(node.dataset.angle) || 0;
    const rad = (angleDeg * Math.PI) / 180;
    const x = cx + Math.cos(rad) * r;
    const y = cy + Math.sin(rad) * r;

    // Position the DOM element (centered on x,y)
    node.style.left = (x - iconSize / 2) + 'px';
    node.style.top  = (y - iconSize / 2) + 'px';
    // Store translate for hover scale-from-center
    node.style.setProperty('--tx', (x - iconSize / 2) + 'px');
    node.style.setProperty('--ty', (y - iconSize / 2) + 'px');

    return { x, y, node };
  });

  /* ----------------------------------------------------------
     Animated pulse traveling along each dendrite line
  ---------------------------------------------------------- */
  // Each connection: center -> node
  const connections = nodePositions.map((np, i) => ({
    x1: cx, y1: cy,
    x2: np.x, y2: np.y,
    // offset each pulse so they don't all fire together
    phase: i / nodePositions.length,
    // slight random wobble points along the path
    cpx: cx + (np.x - cx) * 0.5 + (Math.random() - 0.5) * 60,
    cpy: cy + (np.y - cy) * 0.5 + (Math.random() - 0.5) * 60,
  }));

  let t = 0;

  function lerp(a, b, p) { return a + (b - a) * p; }

  // Point along a quadratic bezier at t
  function bezier(x1, y1, cpx, cpy, x2, y2, t) {
    const mt = 1 - t;
    return {
      x: mt * mt * x1 + 2 * mt * t * cpx + t * t * x2,
      y: mt * mt * y1 + 2 * mt * t * cpy + t * t * y2,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    connections.forEach(c => {
      // Draw the base dendrite line (dim, static)
      ctx.beginPath();
      ctx.moveTo(c.x1, c.y1);
      ctx.quadraticCurveTo(c.cpx, c.cpy, c.x2, c.y2);
      ctx.strokeStyle = 'rgba(124,106,255,0.12)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Traveling pulse
      const pulseT = ((t * 0.4 + c.phase) % 1);
      const pt = bezier(c.x1, c.y1, c.cpx, c.cpy, c.x2, c.y2, pulseT);

      // Glow halo
      const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 14);
      grd.addColorStop(0,   'rgba(192,132,252,0.55)');
      grd.addColorStop(0.4, 'rgba(124,106,255,0.25)');
      grd.addColorStop(1,   'rgba(124,106,255,0)');
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Bright core dot
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220,200,255,0.9)';
      ctx.fill();
    });

    // Soft glow at center
    const cGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
    cGrd.addColorStop(0,   'rgba(124,106,255,0.18)');
    cGrd.addColorStop(1,   'rgba(124,106,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.fillStyle = cGrd;
    ctx.fill();

    t += 0.005;
    requestAnimationFrame(draw);
  }

  draw();
})();
