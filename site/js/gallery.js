/* معارض الصور: شريط بطاقات أفقي يتحرك مع التمرير العمودي، مع أزرار وأسهم لوحة المفاتيح للتنقل */
(function () {
  var S = window.HeatScroll;
  var rails = document.querySelectorAll('.rail');

  [].forEach.call(rails, function (rail) {
    var wrap = rail.querySelector('.track-wrap');
    var track = rail.querySelector('.track');
    var cards = [].slice.call(track.querySelectorAll('.card'));
    var n = cards.length;
    var countEl = rail.querySelector('.count b');
    var barEl = rail.querySelector('.rail-bar i');
    var prev = rail.querySelector('[data-dir="prev"]');
    var next = rail.querySelector('[data-dir="next"]');
    var imgs = cards.map(function (c) { return c.querySelector('img'); });
    rail.style.setProperty('--n', n);

    var shift = 0, active = -1;

    /* أقصى مسافة يتحرك فيها الشريط حتى تظهر آخر بطاقة */
    function measure() {
      track.style.transform = 'none';
      /* هامش جانبي يجعل البطاقة الأولى والأخيرة تقفان في منتصف الشاشة */
      var pad = Math.max(16, (wrap.clientWidth - cards[0].getBoundingClientRect().width) / 2);
      track.style.paddingInline = pad.toFixed(0) + 'px';
      shift = Math.max(0, track.scrollWidth - wrap.clientWidth);
    }

    function render(p) {
      var x = shift * p;
      /* الصفحة من اليمين إلى اليسار: البطاقات التالية على اليسار، فيتحرك الشريط إلى اليمين */
      track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      var mid = wrap.getBoundingClientRect();
      var cx = mid.left + mid.width / 2;
      var best = 0, bestD = Infinity;
      for (var i = 0; i < n; i++) {
        var r = cards[i].getBoundingClientRect();
        var d = (r.left + r.width / 2 - cx) / mid.width;   /* المسافة عن منتصف الشاشة */
        var ad = Math.abs(d);
        if (ad < bestD) { bestD = ad; best = i; }
        var k = S.clamp(ad * 1.6);
        cards[i].style.transform = 'scale(' + (1 - .08 * k).toFixed(3) + ')';
        cards[i].style.opacity = (1 - .45 * k).toFixed(3);
        imgs[i].style.transform = 'translate3d(' + (d * -40).toFixed(1) + 'px,0,0)';   /* حركة داخلية خفيفة للصورة */
      }
      if (best !== active) {
        if (active >= 0) cards[active].classList.remove('is-active');
        cards[best].classList.add('is-active');
        active = best;
        countEl.textContent = String(best + 1).padStart(2, '0');
      }
      barEl.style.width = (p * 100).toFixed(1) + '%';
    }

    function goTo(i) {
      i = Math.max(0, Math.min(n - 1, i));
      if (S.isStatic) { cards[i].scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' }); return; }
      S.scrollToProgress(rail, n > 1 ? i / (n - 1) : 0);
    }
    prev.addEventListener('click', function () { goTo((active < 0 ? 0 : active) - 1); });
    next.addEventListener('click', function () { goTo((active < 0 ? 0 : active) + 1); });
    rail.addEventListener('keydown', function (e) {
      /* في الواجهة العربية: السهم الأيسر يعني التالي */
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active + 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active - 1); }
    });

    if (S.isStatic) {
      rail.classList.add('is-static');
      countEl.textContent = '01';
      return;
    }
    measure();
    S.bind(rail, render, measure);
    window.addEventListener('load', function () { measure(); render(S.progressOf(rail)); });
  });
})();
