/* كشف الأرضية: الكاميرا تقترب من أرضية الصالة، تظهر الأنابيب شبه شفافة تحت البلاط، ثم تنفصل الطبقات */
(function () {
  var S = window.HeatScroll;
  var sec = document.getElementById('floor');
  if (!sec) return;
  var svg = document.getElementById('fsvg'), cam = document.getElementById('fcam'), villa = document.getElementById('fvilla');
  var f1 = sec.querySelector('.f1'), f2 = sec.querySelector('.f2'), f3 = sec.querySelector('.f3');
  var legend = document.getElementById('flegend');
  var lg = [].slice.call(legend.querySelectorAll('li'));
  var HALL = 'assets/images/scenes/hall-1280.webp';

  /* قطعة الأرضية التي تُشرَّح، بإحداثيات صورة الصالة 1280×720: خلف-يسار، خلف-يمين، أمام-يمين، أمام-يسار */
  var Q = [[495, 560], [763, 560], [779, 633], [438, 633]];

  /* تحويل إسقاطي من مربع الوحدة إلى القطعة، لرسم كل شيء بمنظور الأرضية نفسه */
  function homography(q) {
    var x0 = q[0][0], y0 = q[0][1], x1 = q[1][0], y1 = q[1][1], x2 = q[2][0], y2 = q[2][1], x3 = q[3][0], y3 = q[3][1];
    var dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    var den = dx1 * dy2 - dx2 * dy1, g = (dx3 * dy2 - dx2 * dy3) / den, h = (dx1 * dy3 - dx3 * dy1) / den;
    var a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, c = x0, d = y1 - y0 + g * y1, e = y3 - y0 + h * y3, f = y0;
    return function (u, v) { var w = g * u + h * v + 1; return [(a * u + b * v + c) / w, (d * u + e * v + f) / w]; };
  }
  var M = homography(Q);
  function P(u, v) { var p = M(u, v); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }

  function serpentine(U0, U1, V0, V1, N) {
    var s = 'M' + P(U0, V0), cu = U0;
    for (var k = 0; k < N; k++) {
      var v = V0 + k * (V1 - V0) / (N - 1), target = k % 2 === 0 ? U1 : U0;
      if (k > 0) s += ' L' + P(cu, v);
      s += ' L' + P(target, v);
      cu = target;
    }
    return s;
  }
  var field = serpentine(-.7, 1.7, -1.3, 1.9, 9);                                         /* الشبكة تحت الأرضية كلها */
  var loop = 'M' + P(-.02, .14) + ' L' + serpentine(.07, .93, .14, .86, 4).slice(1) + ' L' + P(-.02, .86); /* الحلقة داخل القطعة */

  function pts(dy) { return Q.map(function (p) { return p[0] + ',' + (p[1] + (dy || 0)); }).join(' '); }
  function front(t, fill) {
    return '<polygon fill="' + fill + '" points="' + Q[3][0] + ',' + Q[3][1] + ' ' + Q[2][0] + ',' + Q[2][1] + ' ' + Q[2][0] + ',' + (Q[2][1] + t) + ' ' + Q[3][0] + ',' + (Q[3][1] + t) + '"/>';
  }
  function mark(n, x, y) { return '<g class="mark" data-x="' + x + '" data-y="' + y + '"><circle r="13"/><text>' + n + '</text></g>'; }

  svg.innerHTML =
    '<defs><clipPath id="fclip"><polygon points="' + pts() + '"/></clipPath></defs>' +
    '<g><path class="fglow" id="fglow" d="' + field + '"/><path class="fline" id="fline" pathLength="1" d="' + field + '"/></g>' +
    '<g id="fhole"><polygon fill="#0b0f16" points="' + pts() + '"/><g clip-path="url(#fclip)"><polygon fill="#4a4e55" points="' + pts(12) + '"/></g>' + mark(5, Q[2][0] + 30, Q[2][1] + 22) + '</g>' +
    '<g id="fl4">' + front(12, '#3f6380') + '<polygon fill="#6f9cc0" points="' + pts() + '"/><g clip-path="url(#fclip)"><path class="fpipe" d="' + loop + '"/></g>' + mark(3, Q[3][0] - 30, Q[3][1] + 4) + mark(4, Q[2][0] + 30, Q[2][1] + 4) + '</g>' +
    '<g id="fl2">' + front(16, '#6f7173') + '<polygon fill="#a5a7a8" points="' + pts() + '"/>' + mark(2, Q[3][0] - 30, Q[3][1] + 6) + '</g>' +
    '<g id="fl1"><g id="ftf">' + front(8, '#b9b09c') + '<image href="' + HALL + '" width="1280" height="720" preserveAspectRatio="none" clip-path="url(#fclip)"/></g><polygon class="fedge" id="fedge" points="' + pts() + '"/>' + mark(1, Q[2][0] + 30, Q[2][1] - 8) + '</g>';

  var hole = document.getElementById('fhole'), l4 = document.getElementById('fl4'), l2 = document.getElementById('fl2'), l1 = document.getElementById('fl1');
  var ftf = document.getElementById('ftf'), fedge = document.getElementById('fedge'), fline = document.getElementById('fline'), fglow = document.getElementById('fglow');
  var m34 = l4.querySelectorAll('.mark');
  var marks = [l1.querySelector('.mark'), l2.querySelector('.mark'), m34[0], m34[1], hole.querySelector('.mark')];

  function size() {
    var w = svg.getBoundingClientRect().width || 1280, ms = Math.min(2.4, Math.max(1, 1280 / w * .8)).toFixed(2);
    marks.forEach(function (m) { m.setAttribute('transform', 'translate(' + m.dataset.x + ' ' + m.dataset.y + ') scale(' + ms + ')'); });
  }

  function render(p) {
    var smooth = S.smooth, clamp = S.clamp;
    /* 1. الدخول من الفيلا إلى الصالة */
    villa.style.transform = 'scale(' + (1 + 2.4 * smooth(p / .2)).toFixed(3) + ')';
    villa.style.opacity = 1 - smooth((p - .1) / .1);
    cam.style.opacity = smooth((p - .08) / .12);
    /* 2. الاقتراب من الأرضية */
    cam.style.transform = 'scale(' + (1 + .5 * smooth((p - .16) / .24)).toFixed(3) + ')';
    /* 3. الأنابيب شبه شفافة تحت البلاط */
    var t = clamp((p - .36) / .18);
    fline.style.strokeDashoffset = 1 - t;
    fline.style.opacity = t > 0 ? .5 : 0;
    fglow.style.opacity = .16 * smooth((p - .44) / .12);
    /* 4. تشريح الطبقات */
    var e = smooth((p - .58) / .28), on = smooth(e * 10);
    hole.style.opacity = l4.style.opacity = l2.style.opacity = ftf.style.opacity = fedge.style.opacity = on;
    l4.setAttribute('transform', 'translate(0 ' + (-82 * e).toFixed(1) + ')');
    l2.setAttribute('transform', 'translate(0 ' + (-164 * e).toFixed(1) + ')');
    l1.setAttribute('transform', 'translate(0 ' + (-246 * e).toFixed(1) + ')');
    legend.style.opacity = smooth((p - .56) / .08);
    marks.forEach(function (m, i) { var o = smooth((e - .12 * i - .1) / .25); m.style.opacity = o; lg[i].className = o > .5 ? 'on' : ''; });
    f1.style.opacity = 1 - smooth((p - .28) / .08);
    f2.style.opacity = smooth((p - .36) / .08) * (1 - smooth((p - .54) / .06));
    f3.style.opacity = smooth((p - .62) / .08);
  }

  size();
  if (S.isStatic) { sec.classList.add('is-static'); render(1); window.addEventListener('resize', size); return; }
  S.bind(sec, render, size);
})();
