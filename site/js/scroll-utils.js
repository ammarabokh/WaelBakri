/* أدوات مشتركة لكل الأقسام المرتبطة بالتمرير */
window.HeatScroll = (function () {
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smooth(t) { t = clamp(t); return t * t * (3 - 2 * t); }

  /* هل يجب عرض نسخة ثابتة بلا حركة؟ (تقليل الحركة أو توفير البيانات) */
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var isStatic = reduced || saveData;

  /* تقدم التمرير داخل قسم لاصق: 0 عند بدايته و1 عند نهايته */
  function progressOf(section) {
    var r = section.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    return total > 0 ? clamp(-r.top / total) : 1;
  }

  /* يربط دالة رسم بقسم، ويستدعيها مرة واحدة في كل إطار عند التمرير */
  function bind(section, render, onResize) {
    var ticking = false;
    function update() { render(progressOf(section)); }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { if (onResize) onResize(); onScroll(); });
    update();
    return update;
  }

  /* ينقل الصفحة إلى نقطة تقدم معينة داخل قسم لاصق */
  function scrollToProgress(section, p) {
    var top = section.getBoundingClientRect().top + window.scrollY;
    var total = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + total * clamp(p), behavior: reduced ? 'auto' : 'smooth' });
  }

  /* الشريط العلوي يصبح معتماً خارج المشاهد اللاصقة، حتى لا يتداخل مع نصوص الأقسام العادية */
  (function () {
    var top = document.querySelector('.top');
    var bands = document.querySelectorAll('.band,.site-foot');
    if (!top || !bands.length) return;
    function check() {
      var solid = false;
      for (var i = 0; i < bands.length; i++) {
        var r = bands[i].getBoundingClientRect();
        if (r.top < 70 && r.bottom > 0) { solid = true; break; }
      }
      top.classList.toggle('is-solid', solid);
    }
    window.addEventListener('scroll', check, { passive: true });
    check();
  })();

  return { clamp: clamp, smooth: smooth, isStatic: isStatic, progressOf: progressOf, bind: bind, scrollToProgress: scrollToProgress };
})();
