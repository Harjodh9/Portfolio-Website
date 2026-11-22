/* ==========================================================================
   Theme toggle
   The inline script in <head> sets data-theme before first paint.
   This keeps the toggle in sync, saves the choice, and follows the system
   setting until the visitor picks one manually.
   ========================================================================== */
(function () {
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function saved() {
    try {
      var t = localStorage.getItem('theme');
      return t === 'light' || t === 'dark' ? t : null;
    } catch (e) {
      return null;
    }
  }

  function apply(theme) {
    root.dataset.theme = theme;
    if (toggle) toggle.setAttribute('aria-checked', String(theme === 'dark'));
  }

  apply(saved() || (systemDark.matches ? 'dark' : 'light'));

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // Follow the system theme only if the visitor hasn't chosen one
  systemDark.addEventListener('change', function (e) {
    if (!saved()) apply(e.matches ? 'dark' : 'light');
  });
})();

/* ==========================================================================
   Mobile menu
   ========================================================================== */
(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (!btn || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  btn.addEventListener('click', function () {
    setOpen(!nav.classList.contains('is-open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();

/* ==========================================================================
   Projects carousel (manual: arrow buttons, swipe or scroll, no auto-play)
   ========================================================================== */
(function () {
  var track = document.getElementById('carouselTrack');
  var prev = document.getElementById('carouselPrev');
  var next = document.getElementById('carouselNext');
  var count = document.getElementById('carouselCount');
  var bar = document.getElementById('carouselProgress');
  if (!track || !prev || !next) return;

  var cards = Array.prototype.slice.call(track.children);
  var total = cards.length;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Distance from one card's left edge to the next (card width + gap)
  function step() {
    if (total < 2) return cards[0] ? cards[0].getBoundingClientRect().width : 1;
    return cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
  }

  function update() {
    var s = step();
    var padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    var maxScroll = track.scrollWidth - track.clientWidth;
    var visible = Math.max(1, Math.floor((track.clientWidth - padLeft + gap) / s + 0.01));
    var atStart = track.scrollLeft <= 1;
    var atEnd = track.scrollLeft >= maxScroll - 2;

    var first = Math.min(total, Math.round(track.scrollLeft / s) + 1);
    var last = Math.min(total, first + visible - 1);
    if (atEnd) { last = total; first = Math.max(1, total - visible + 1); }
    if (atStart) { first = 1; last = Math.min(total, visible); }

    prev.disabled = atStart;
    next.disabled = atEnd;
    if (count) count.textContent = (first === last ? first : first + '\u2013' + last) + ' of ' + total;
    if (bar) bar.style.width = (last / total * 100) + '%';
  }

  function scrollByCards(direction) {
    track.scrollBy({ left: direction * step(), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  prev.addEventListener('click', function () { scrollByCards(-1); });
  next.addEventListener('click', function () { scrollByCards(1); });

  // Arrow keys when the track itself has focus
  track.addEventListener('keydown', function (e) {
    if (e.target !== track) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCards(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByCards(-1); }
  });

  var ticking = false;
  track.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', update);

  update();
})();

/* ==========================================================================
   Electric border (contact card)
   Only animate while the card is on screen (the SVG filter is expensive to
   repaint), and not at all for visitors who prefer reduced motion.
   ========================================================================== */
(function () {
  var svg = document.querySelector('.svg-filters--card');
  var card = document.querySelector('.contact-card.electric-card');
  if (!svg || !card || !svg.pauseAnimations) return;

  svg.pauseAnimations();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) { svg.unpauseAnimations(); return; }

  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) svg.unpauseAnimations();
      else svg.pauseAnimations();
    });
  }, { rootMargin: '100px' }).observe(card);
})();