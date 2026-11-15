/* الغلاف: البيت يبدأ بألوان حرارية باردة ويدفأ غرفة بعد غرفة مع التمرير */
(function () {
  var S = window.HeatScroll;
  var hero = document.getElementById('hero');
  if (!hero) return;
  var img = document.getElementById('villa');
  var canvas = document.getElementById('thermal');
  var cold = hero.querySelector('.scene .cold');
  var s1 = hero.querySelector('.s1'), s2 = hero.querySelector('.s2'), s3 = hero.querySelector('.s3');
  var tempEl = document.getElementById('temp'), bar = document.getElementById('bar'), hint = document.getElementById('hint');

  if (S.isStatic) {
    hero.classList.add('is-static');
    tempEl.textContent = '22°';
    bar.style.width = '100%';
    tempEl.style.color = bar.style.background = 'var(--gold)';
    return;
  }

  var W = canvas.width, H = canvas.height, K = W / 1280;
  var ctx = canvas.getContext('2d');
  var thermal = null;

  /* مواضع الغرف بإحداثيات الصورة 1280×720 بعد العكس، ونافذة ظهور كل غرفة من تقدم التمرير */
  var rooms = [
    { x: 1174, y: 562, rx: 62, ry: 56, a: .06, b: .20 },
    { x: 1020, y: 508, rx: 104, ry: 92, a: .14, b: .30 },
    { x: 747, y: 506, rx: 160, ry: 86, a: .26, b: .44 },
    { x: 747, y: 330, rx: 160, ry: 92, a: .34, b: .52 },
    { x: 445, y: 506, rx: 160, ry: 86, a: .44, b: .62 },
    { x: 462, y: 330, rx: 146, ry: 92, a: .52, b: .68 },
    { x: 232, y: 506, rx: 84, ry: 86, a: .60, b: .76 },
    { x: 247, y: 330, rx: 98, ry: 92, a: .66, b: .82 }
  ];
  /* تدرج الكاميرا الحرارية: من الكحلي إلى الأزرق الجليدي ثم الأبيض */
  var stops = [[0, 4, 8, 22], [.2, 26, 24, 88], [.45, 30, 74, 160], [.7, 52, 150, 196], [.88, 160, 222, 232], [1, 240, 252, 255]];

  function buildThermal() {
    try {
      var off = document.createElement('canvas');
      off.width = W; off.height = H;
      var o = off.getContext('2d', { willReadFrequently: true });
      o.drawImage(img, 0, 0, W, H);
      var d = o.getImageData(0, 0, W, H), p = d.data;
      for (var i = 0; i < p.length; i += 4) {
        var l = Math.pow((.299 * p[i] + .587 * p[i + 1] + .114 * p[i + 2]) / 255, .85);
        var j = 1;
        while (j < stops.length - 1 && l > stops[j][0]) j++;
        var a = stops[j - 1], b = stops[j], t = (l - a[0]) / (b[0] - a[0]);
        p[i] = a[1] + (b[1] - a[1]) * t;
        p[i + 1] = a[2] + (b[2] - a[2]) * t;
        p[i + 2] = a[3] + (b[3] - a[3]) * t;
      }
      o.putImageData(d, 0, 0);
      thermal = off;
      hero.classList.add('canvas-ready');
    } catch (e) { thermal = null; }
    update();
  }

  function render(p) {
    var smooth = S.smooth;
    if (thermal) {
      ctx.globalCompositeOperation = 'copy';
      ctx.drawImage(thermal, 0, 0);
      ctx.globalCompositeOperation = 'destination-out';
      for (var i = 0; i < rooms.length; i++) {
        var r = rooms[i], t = smooth((p - r.a) / (r.b - r.a));
        if (t <= 0) continue;
        var s = .35 + 1.45 * t;
        ctx.save();
        ctx.translate(r.x * K, r.y * K);
        ctx.scale(r.rx * K * s, r.ry * K * s);
        var g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        g.addColorStop(0, 'rgba(0,0,0,' + t + ')');
        g.addColorStop(.62, 'rgba(0,0,0,' + t + ')');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(-1, -1, 2, 2);
        ctx.restore();
      }
      canvas.style.opacity = 1 - smooth((p - .80) / .17);
    } else {
      cold.style.opacity = 1 - smooth((p - .1) / .75);
    }
    s1.style.opacity = 1 - smooth((p - .14) / .1);
    s2.style.opacity = smooth((p - .27) / .1) * (1 - smooth((p - .68) / .1));
    s3.style.opacity = smooth((p - .80) / .1);
    var warm = smooth((p - .06) / .84);
    tempEl.textContent = Math.round(4 + 18 * warm) + '°';
    bar.style.width = Math.round(warm * 100) + '%';
    tempEl.style.color = bar.style.background = warm > .55 ? 'var(--gold)' : 'var(--cold)';
    hint.style.opacity = 1 - smooth(p / .06);
  }

  var update = S.bind(hero, render);
  if (img.complete && img.naturalWidth) buildThermal();
  else img.addEventListener('load', buildThermal);
})();
