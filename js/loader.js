// loader timing

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var barFill = document.getElementById('bar-fill');
    var barPct  = document.getElementById('bar-pct');
    var overlay = document.getElementById('loader-overlay');
    if (!barFill || !barPct || !overlay) return;

    // timing window
    var totalMs   = 3000 + Math.random() * 2000;
    var startTime = null;

    // easing
    function easeInOut(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function tick(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed  = timestamp - startTime;
      var rawT     = Math.min(elapsed / totalMs, 1.0);
      var easedT   = easeInOut(rawT);
      var pct      = Math.floor(easedT * 100);

      barFill.style.width = easedT * 100 + '%';
      barPct.textContent  = pct + '%';

      if (rawT < 1.0) {
        requestAnimationFrame(tick);
      } else {
        barFill.style.width = '100%';
        barPct.textContent  = '100%';
        setTimeout(function () {
          overlay.classList.add('fade-out');
          setTimeout(function () {
            overlay.style.display = 'none';
            var bd = document.getElementById('welcome-backdrop');
            if (bd) {
              bd.style.pointerEvents = 'auto';
              setTimeout(function () { bd.classList.add('visible'); }, 80);
            }
          }, 500);
        }, 350);
      }
    }

    requestAnimationFrame(tick);
  });
})();
