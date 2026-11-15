/* رحلة الحرارة: مسارات SVG تُرسم فوق صورة الفيلا مع التمرير */
(function () {
  var S = window.HeatScroll;
  var sec = document.getElementById('heat-pump');
  if (!sec) return;
  var svg = sec.querySelector('svg'), scene = sec.querySelector('.scene'), dim = document.getElementById('jdim');
  var items = [].slice.call(sec.querySelectorAll('[data-a]'));
  var marks = [].slice.call(sec.querySelectorAll('.mark'));
  var j1 = sec.querySelector('.j1'), j2 = sec.querySelector('.j2'), j3 = sec.querySelector('.j3');
  var st = [document.getElementById('st1'), document.getElementById('st2'), document.getElementById('st3')];

  /* سماكة الخطوط وحجم العلامات تبقى مقروءة مهما صغر المشهد */
  function size() {
    var w = scene.getBoundingClientRect().width || 1280, k = 1280 / w;
    svg.style.setProperty('--sw', Math.max(3, 2.4 * k).toFixed(2));
    svg.style.setProperty('--sw2', Math.max(2, 1.7 * k).toFixed(2));
    var ms = Math.min(2.6, Math.max(1, k * .8)).toFixed(2);
    marks.forEach(function (m) { m.setAttribute('transform', 'translate(' + m.dataset.x + ' ' + m.dataset.y + ') scale(' + ms + ')'); });
  }

  function render(p) {
    var smooth = S.smooth, clamp = S.clamp;
    items.forEach(function (el) {
      var a = +el.dataset.a, b = +el.dataset.b, t = clamp((p - a) / (b - a));
      if (el.tagName.toLowerCase() === 'path') { el.style.strokeDashoffset = 1 - t; el.style.opacity = t > 0 ? 1 : 0; }
      else el.style.opacity = smooth(t);
    });
    j1.style.opacity = 1 - smooth((p - .24) / .08);
    j2.style.opacity = smooth((p - .30) / .08) * (1 - smooth((p - .48) / .08));
    j3.style.opacity = smooth((p - .54) / .08);
    var s = p < .28 ? 0 : p < .5 ? 1 : 2;
    for (var i = 0; i < 3; i++) st[i].className = i === s ? 'on' : '';
    dim.style.opacity = .58 - .3 * smooth((p - .82) / .18);
  }

  size();
  if (S.isStatic) { sec.classList.add('is-static'); render(1); window.addEventListener('resize', size); return; }
  S.bind(sec, render, size);
})();
