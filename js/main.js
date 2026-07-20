/* ============================================================
   Slide viewer — opens a modal deck player.
   Trigger: <a class="view-deck" data-deck="assets/projects/slides/mds" data-count="23">
   ============================================================ */
(function () {
  var triggers = document.querySelectorAll('.view-deck');
  if (!triggers.length) return;

  /* Build the modal once */
  var viewer = document.createElement('div');
  viewer.className = 'slide-viewer';
  viewer.innerHTML =
    '<button class="slide-close" title="Close (Esc)">&#10005;</button>' +
    '<img alt="Slide" />' +
    '<div class="slide-viewer-controls">' +
    '  <button class="slide-btn prev" title="Previous (&#8592;)">&#8592;</button>' +
    '  <span class="slide-counter"></span>' +
    '  <button class="slide-btn next" title="Next (&#8594;)">&#8594;</button>' +
    '</div>' +
    '<span class="slide-hint">Use arrow keys to navigate &middot; Esc to close</span>';
  document.body.appendChild(viewer);

  var img     = viewer.querySelector('img');
  var counter = viewer.querySelector('.slide-counter');
  var prevBtn = viewer.querySelector('.prev');
  var nextBtn = viewer.querySelector('.next');

  var deck = '', count = 0, idx = 0;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function show(i) {
    idx = Math.max(1, Math.min(count, i));
    img.src = deck + '/slide-' + pad(idx) + '.png';
    counter.textContent = idx + ' / ' + count;
    prevBtn.disabled = idx === 1;
    nextBtn.disabled = idx === count;
    /* Preload neighbors */
    if (idx < count) { (new Image()).src = deck + '/slide-' + pad(idx + 1) + '.png'; }
    if (idx > 1)     { (new Image()).src = deck + '/slide-' + pad(idx - 1) + '.png'; }
  }

  function open(d, c) {
    deck = d; count = c;
    viewer.classList.add('open');
    document.body.style.overflow = 'hidden';
    show(1);
  }

  function close() {
    viewer.classList.remove('open');
    document.body.style.overflow = '';
  }

  triggers.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      open(a.dataset.deck, parseInt(a.dataset.count, 10));
    });
  });

  prevBtn.addEventListener('click', function () { show(idx - 1); });
  nextBtn.addEventListener('click', function () { show(idx + 1); });
  viewer.querySelector('.slide-close').addEventListener('click', close);
  viewer.addEventListener('click', function (e) { if (e.target === viewer) close(); });

  document.addEventListener('keydown', function (e) {
    if (!viewer.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
})();

/* Active nav link */
(function () {
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
})();

/* Fireflies wandering randomly between the compass icons */
window.addEventListener('load', function () {
  var stage  = document.getElementById('compassStage');
  var canvas = document.getElementById('fireflyCanvas');
  if (!stage || !canvas) return;

  var ctx = canvas.getContext('2d');
  var W = stage.offsetWidth;
  var H = stage.offsetHeight;
  canvas.width = W;
  canvas.height = H;

  /* Node centers (N/E/S/W) from the DOM */
  var nodes = Array.from(stage.querySelectorAll('.compass-node')).map(function (n) {
    return {
      x: n.offsetLeft + n.offsetWidth / 2,
      y: n.offsetTop + n.offsetHeight / 2
    };
  });

  /* Each firefly travels node -> random other node on a curved path */
  var FLY_COUNT = 5;
  var flies = [];

  function newTrip(fly) {
    var from = (fly && fly.to !== undefined) ? fly.to : Math.floor(Math.random() * nodes.length);
    var to = from;
    while (to === from) to = Math.floor(Math.random() * nodes.length);
    var a = nodes[from], b = nodes[to];
    return {
      from: from, to: to,
      x1: a.x, y1: a.y, x2: b.x, y2: b.y,
      /* control point bows the path randomly, sometimes through the middle */
      cpx: (a.x + b.x) / 2 + (Math.random() - 0.5) * 140,
      cpy: (a.y + b.y) / 2 + (Math.random() - 0.5) * 140,
      p: 0,
      speed: 0.0025 + Math.random() * 0.0035,
      phase: Math.random() * Math.PI * 2
    };
  }

  for (var i = 0; i < FLY_COUNT; i++) {
    var f = newTrip(null);
    f.p = Math.random();  /* stagger starting positions */
    flies.push(f);
  }

  function bezierPt(f, p) {
    var m = 1 - p;
    return {
      x: m * m * f.x1 + 2 * m * p * f.cpx + p * p * f.x2,
      y: m * m * f.y1 + 2 * m * p * f.cpy + p * p * f.y2
    };
  }

  var t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    flies.forEach(function (f, i) {
      f.p += f.speed;
      if (f.p >= 1) {
        flies[i] = newTrip(f);
        f = flies[i];
      }

      var pt = bezierPt(f, f.p);
      var flicker = 0.6 + 0.4 * Math.sin(t * 6 + f.phase);

      /* Glow halo */
      var grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 14);
      grd.addColorStop(0,   'rgba(255,224,138,' + (0.7 * flicker) + ')');
      grd.addColorStop(0.4, 'rgba(255,200,80,'  + (0.28 * flicker) + ')');
      grd.addColorStop(1,   'rgba(255,200,80,0)');
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      /* Core */
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,244,200,' + (0.95 * flicker) + ')';
      ctx.fill();
    });

    t += 0.016;
    requestAnimationFrame(draw);
  }

  draw();
});

/* Legacy neuron stage (no longer in the page — kept as a no-op guard) */
window.addEventListener('load', function () {
  var stage  = document.getElementById('neuronStage');
  var canvas = document.getElementById('neuronCanvas');
  if (!stage || !canvas) return;

  var ctx   = canvas.getContext('2d');
  var nodes = Array.from(stage.querySelectorAll('.neuron-node'));

  var W = stage.offsetWidth;
  var H = stage.offsetHeight;
  canvas.width  = W;
  canvas.height = H;

  var cx = W / 2;
  var cy = H / 2;

  /* Sizes scale with the stage: icons ~18% of stage width */
  var iconSize = Math.round(W * 0.18);
  var r = W / 2 - iconSize / 2 - 8;

  var nodePositions = nodes.map(function (node) {
    var angleDeg = parseFloat(node.dataset.angle) || 0;
    var rad = angleDeg * Math.PI / 180;
    var x = cx + Math.cos(rad) * r;
    var y = cy + Math.sin(rad) * r;

    node.style.position = 'absolute';
    node.style.left = (x - iconSize / 2) + 'px';
    node.style.top  = (y - iconSize / 2) + 'px';
    node.style.width  = iconSize + 'px';
    node.style.height = iconSize + 'px';

    var cpx = cx + (x - cx) * 0.5 + (Math.random() - 0.5) * 50;
    var cpy = cy + (y - cy) * 0.5 + (Math.random() - 0.5) * 50;

    return { x: x, y: y, cpx: cpx, cpy: cpy };
  });

  var t = 0;

  function bezierPt(x1, y1, cpx, cpy, x2, y2, p) {
    var m = 1 - p;
    return {
      x: m * m * x1 + 2 * m * p * cpx + p * p * x2,
      y: m * m * y1 + 2 * m * p * cpy + p * p * y2
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    nodePositions.forEach(function (np, i) {
      /* Static dendrite — vine-like, slightly mossy */
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(np.cpx, np.cpy, np.x, np.y);
      ctx.strokeStyle = 'rgba(212,219,178,0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      /* Traveling pulse — glowing yellow firefly */
      var p = (t * 0.35 + i * 0.25) % 1;
      var pt = bezierPt(cx, cy, np.cpx, np.cpy, np.x, np.y, p);

      /* flicker: gentle brightness wobble per firefly */
      var flicker = 0.75 + 0.25 * Math.sin(t * 40 + i * 7);

      var grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 20);
      grd.addColorStop(0,   'rgba(255,224,138,' + (0.75 * flicker) + ')');
      grd.addColorStop(0.4, 'rgba(255,200,80,'  + (0.3  * flicker) + ')');
      grd.addColorStop(1,   'rgba(255,200,80,0)');
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,244,200,' + (0.95 * flicker) + ')';
      ctx.fill();
    });

    /* Soft lichen glow behind the photo */
    var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.28);
    cg.addColorStop(0, 'rgba(212,219,178,0.14)');
    cg.addColorStop(1, 'rgba(212,219,178,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, W * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();

    t += 0.005;
    requestAnimationFrame(draw);
  }

  draw();
});
