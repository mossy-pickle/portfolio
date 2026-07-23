/* ============================================================
   Page-enter fade — fallback for when the cross-document view
   transition (see style.css) doesn't run: unsupported browsers,
   or environments where the browser skips the transition.
   ============================================================ */
(function () {
  /* Fade by default; cancel it only when a real view transition
     is confirmed handling the entrance instead. */
  document.documentElement.classList.add('page-fade');
  if ('onpagereveal' in window) {
    window.addEventListener('pagereveal', function (e) {
      if (e.viewTransition) document.documentElement.classList.remove('page-fade');
    });
  }
})();

/* ============================================================
   Leave choreography — intercept same-site link clicks, play
   the exit animation (style.css: body.leaving), then navigate.
   On the home page the clicked compass marker flares while the
   rest of the hero recedes; inner pages lift out quickly.
   ============================================================ */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.origin !== location.origin) return;
    if (a.hasAttribute('download') || a.target === '_blank' ||
        a.classList.contains('view-deck')) return;

    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    if (reduce.matches || document.body.classList.contains('leaving')) return;

    e.preventDefault();
    document.body.classList.add('leaving');
    a.classList.add('chosen');

    var isHome = !!document.querySelector('.hero');
    setTimeout(function () { location.href = a.href; }, isHome ? 620 : 320);
  });

  /* Back/forward-cache restore: never come back frozen mid-exit */
  window.addEventListener('pageshow', function () {
    document.body.classList.remove('leaving');
    var chosen = document.querySelector('a.chosen');
    if (chosen) chosen.classList.remove('chosen');
  });
})();

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

/* ============================================================
   Decks — cycling stacks on the illustration page.
   .deck-h slides horizontally; .deck-wheel is a 3D rotating
   drum of pages (scroll over it to rotate).
   Items are the direct children of .deck-frame.
   ============================================================ */
(function () {
  var decks = document.querySelectorAll('.deck');
  if (!decks.length) return;

  /* Fullscreen zoom for the wheel's front card: FLIP the card
     from its on-wheel rect up to center screen; click/Esc drops
     it back where it came from. */
  function zoomCard(card) {
    if (document.querySelector('.wheel-zoom')) return;

    var start = card.getBoundingClientRect();
    var overlay = document.createElement('div');
    overlay.className = 'wheel-zoom';
    var clone = card.cloneNode(true);
    clone.className = 'wheel-zoom-card' +
      (card.classList.contains('deck-page') ? ' deck-page' : '');
    clone.removeAttribute('style');
    overlay.appendChild(clone);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    /* final box: fill up to 90vw x 86vh at the image's natural
       aspect (fall back to the card box for non-images) */
    var vw = window.innerWidth, vh = window.innerHeight;
    var ratio = (card.naturalWidth && card.naturalHeight)
      ? card.naturalWidth / card.naturalHeight
      : start.width / start.height;
    var fw = Math.min(vw * 0.9, vh * 0.86 * ratio);
    var fh = fw / ratio;
    var fx = (vw - fw) / 2, fy = (vh - fh) / 2;

    clone.style.width = fw + 'px';
    clone.style.height = fh + 'px';
    clone.style.left = fx + 'px';
    clone.style.top = fy + 'px';
    clone.style.transformOrigin = 'top left';

    var dx = start.left - fx, dy = start.top - fy, s = start.width / fw;
    var atSource = 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')';

    clone.style.transition = 'none';
    clone.style.transform = atSource;
    void clone.offsetWidth;
    clone.style.transition = '';
    overlay.classList.add('open');
    clone.style.transform = 'translate(0, 0) scale(1)';

    function onKey(e) { if (e.key === 'Escape') close(); }
    function close() {
      overlay.classList.remove('open');
      clone.style.transform = atSource;
      document.removeEventListener('keydown', onKey);
      setTimeout(function () {
        overlay.remove();
        document.body.style.overflow = '';
      }, 400);
    }
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
  }

  decks.forEach(function (deck) {
    var frame   = deck.querySelector('.deck-frame');
    var counter = deck.querySelector('.deck-counter');
    var prevBtn = deck.querySelector('.deck-prev');
    var nextBtn = deck.querySelector('.deck-next');
    var items   = Array.prototype.slice.call(frame.children);
    var isWheel = deck.classList.contains('deck-wheel');
    var idx = 0;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    if (!items.length) {
      counter.textContent = '00 / 00';
      prevBtn.disabled = nextBtn.disabled = true;
      return;
    }
    if (items.length === 1) {
      prevBtn.disabled = nextBtn.disabled = true;
    }

    var WHEEL_CLASSES = ['w0', 'wu1', 'wu2', 'wd1', 'wd2', 'w-hdn'];

    function wheelClass(signed) {
      if (signed === 0)  return 'w0';
      if (signed === 1)  return 'wu1';
      if (signed === 2)  return 'wu2';
      if (signed === -1) return 'wd1';
      if (signed === -2) return 'wd2';
      /* deep positions: below-back gets w-hdn, above-back is the
         classless default state */
      return signed < 0 ? 'w-hdn' : '';
    }

    function render() {
      var n = items.length;
      items.forEach(function (item, i) {
        var off = (i - idx + n) % n;
        if (isWheel) {
          /* signed offset: positive = up the back, negative = below */
          var signed = off * 2 > n ? off - n : off;
          var cls = wheelClass(signed);
          var prev = parseInt(item.dataset.pos || 'NaN', 10);
          /* a card recycling from one deep side to the other must
             snap, not sweep across the visible wheel */
          var wrap = !isNaN(prev) &&
                     (prev > 0) !== (signed > 0) &&
                     Math.abs(prev) >= 2 && Math.abs(signed) >= 2;
          WHEEL_CLASSES.forEach(function (c) { item.classList.remove(c); });
          if (wrap) {
            item.style.transition = 'none';
            if (cls) item.classList.add(cls);
            void item.offsetWidth; /* force reflow so the snap lands */
            item.style.transition = '';
          } else if (cls) {
            item.classList.add(cls);
          }
          item.dataset.pos = String(signed);
          item.style.zIndex = String(10 - Math.abs(signed));
        } else {
          item.classList.remove('is-top', 'is-under1', 'is-under2', 'is-out');
          if (off === 0) item.classList.add('is-top');
          if (off === 1) item.classList.add('is-under1');
          if (off === 2) item.classList.add('is-under2');
          item.style.zIndex = String(n - off);
        }
      });
      counter.textContent = pad(idx + 1) + ' / ' + pad(items.length);
    }

    function step(dir) {
      var old = items[idx];
      idx = (idx + dir + items.length) % items.length;
      render();
      if (!isWheel && dir > 0) {
        /* outgoing item exits forward, above the rest */
        old.classList.add('is-out');
        old.style.zIndex = String(items.length + 1);
      }
    }

    prevBtn.addEventListener('click', function () { step(-1); });
    nextBtn.addEventListener('click', function () { step(1); });

    /* Click the front card to pull it up fullscreen */
    if (isWheel) {
      frame.addEventListener('click', function (e) {
        var top = frame.querySelector('.w0');
        if (top && (e.target === top || top.contains(e.target))) {
          zoomCard(top);
        }
      });
    }

    /* Wheel rotation: scroll (or swipe) over the frame.
       scroll down = pull the back page forward */
    if (isWheel && items.length > 1) {
      var acc = 0, locked = false;

      frame.addEventListener('wheel', function (e) {
        e.preventDefault();
        if (locked) return;
        acc += e.deltaY;
        if (Math.abs(acc) > 60) {
          step(acc > 0 ? 1 : -1);
          acc = 0;
          locked = true;
          setTimeout(function () { locked = false; }, 420);
        }
      }, { passive: false });

      var touchY = null;
      frame.addEventListener('touchstart', function (e) {
        touchY = e.touches[0].clientY;
      }, { passive: true });
      frame.addEventListener('touchmove', function (e) {
        if (touchY === null) return;
        var dy = touchY - e.touches[0].clientY;
        if (Math.abs(dy) > 45) {
          step(dy > 0 ? 1 : -1);
          touchY = e.touches[0].clientY;
          e.preventDefault();
        }
      }, { passive: false });
      frame.addEventListener('touchend', function () { touchY = null; });
    }

    render();
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
