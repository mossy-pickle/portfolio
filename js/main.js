/* Active nav link */
(function () {
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
})();

/* Neuron diagram — wood rounds connected by mossy dendrites */
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
      /* Static dendrite — vine-like brown-green */
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(np.cpx, np.cpy, np.x, np.y);
      ctx.strokeStyle = 'rgba(127,85,57,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      /* Traveling pulse — mossy green firefly */
      var p = (t * 0.35 + i * 0.25) % 1;
      var pt = bezierPt(cx, cy, np.cpx, np.cpy, np.x, np.y, p);

      var grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 18);
      grd.addColorStop(0,   'rgba(123,160,91,0.65)');
      grd.addColorStop(0.5, 'rgba(74,124,89,0.25)');
      grd.addColorStop(1,   'rgba(74,124,89,0)');
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(58,90,64,0.95)';
      ctx.fill();
    });

    /* Soft green glow behind the photo */
    var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.28);
    cg.addColorStop(0, 'rgba(123,160,91,0.18)');
    cg.addColorStop(1, 'rgba(123,160,91,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, W * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();

    t += 0.005;
    requestAnimationFrame(draw);
  }

  draw();
});
