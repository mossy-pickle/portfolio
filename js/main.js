/* Active nav link */
(function () {
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
})();

/* Neuron diagram */
window.addEventListener('load', function () {
  var stage  = document.getElementById('neuronStage');
  var canvas = document.getElementById('neuronCanvas');
  if (!stage || !canvas) return;

  var ctx   = canvas.getContext('2d');
  var nodes = Array.from(stage.querySelectorAll('.neuron-node'));

  /* Use the actual rendered size of the stage */
  var W = stage.offsetWidth;
  var H = stage.offsetHeight;
  canvas.width  = W;
  canvas.height = H;

  var cx = W / 2;
  var cy = H / 2;

  /* Orbit radius = half the stage minus half an icon (64px) minus a small margin */
  var iconSize = 64;
  var r = W / 2 - iconSize / 2 - 20;

  /* Position each node */
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

    /* Bezier control point: perpendicular wobble */
    var cpx = cx + (x - cx) * 0.5 + (Math.random() - 0.5) * 50;
    var cpy = cy + (y - cy) * 0.5 + (Math.random() - 0.5) * 50;

    return { x: x, y: y, cpx: cpx, cpy: cpy };
  });

  /* Animated pulses */
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
      /* Static dendrite line */
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(np.cpx, np.cpy, np.x, np.y);
      ctx.strokeStyle = 'rgba(124,106,255,0.15)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      /* Traveling pulse — each offset by 1/4 turn */
      var p = (t * 0.35 + i * 0.25) % 1;
      var pt = bezierPt(cx, cy, np.cpx, np.cpy, np.x, np.y, p);

      var grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 16);
      grd.addColorStop(0,   'rgba(192,132,252,0.6)');
      grd.addColorStop(0.5, 'rgba(124,106,255,0.2)');
      grd.addColorStop(1,   'rgba(124,106,255,0)');
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230,210,255,0.95)';
      ctx.fill();
    });

    /* Center glow */
    var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 75);
    cg.addColorStop(0, 'rgba(124,106,255,0.2)');
    cg.addColorStop(1, 'rgba(124,106,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, 75, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();

    t += 0.005;
    requestAnimationFrame(draw);
  }

  draw();
});
