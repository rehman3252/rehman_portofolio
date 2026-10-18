/* Behavior only: no HTML is generated here. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  document.getElementById('year').textContent = new Date().getFullYear();

  // Theme toggle (saved in localStorage)
  var toggle = document.getElementById('themeToggle');
  try { var saved = localStorage.getItem('theme'); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    toggle.setAttribute('aria-label', next === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Scroll: progress bar, solid nav, parallax (one rAF-throttled listener)
  var bar = document.getElementById('scrollProgress'), nav = document.getElementById('siteNav');
  var parallax = document.querySelectorAll('[data-parallax]'), ticking = false;
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    nav.classList.toggle('scrolled', window.scrollY > 40);
    if (!reduced) parallax.forEach(function (el) {
      el.style.transform = 'translateY(' + (window.scrollY * -el.dataset.parallax) + 'px)';
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Reveal on scroll
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('visible'); }); }

  // Active nav link
  var links = document.querySelectorAll('.nav-link');
  var sio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) links.forEach(function (l) {
        var on = l.getAttribute('href') === '#' + e.target.id;
        l.classList.toggle('active', on);
        if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(function (s) { sio.observe(s); });

  // Close mobile menu after choosing a link
  var menu = document.getElementById('navMenu');
  links.forEach(function (l) { l.addEventListener('click', function () {
    if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
  }); });

  // Project filtering: toggles the `hidden` attribute on existing cards
  var buttons = document.querySelectorAll('.filter-btn'), cards = document.querySelectorAll('.project');
  buttons.forEach(function (b) { b.addEventListener('click', function () {
    var f = b.dataset.filter;
    buttons.forEach(function (x) { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b); });
    cards.forEach(function (c) { c.hidden = !(f === 'all' || c.dataset.category.split(' ').indexOf(f) > -1); });
  }); });

  // Project dialogs (native <dialog>: focus trap + Esc built in)
  document.querySelectorAll('[data-dialog]').forEach(function (b) {
    b.addEventListener('click', function () { document.getElementById(b.dataset.dialog).showModal(); });
  });
  document.querySelectorAll('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d || e.target.hasAttribute('data-close')) d.close(); });
  });

  // Magnetic buttons + cursor dot (fine pointers only)
  if (!reduced && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.25 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
    var dot = document.getElementById('cursorDot');
    window.addEventListener('mousemove', function (e) { dot.style.opacity = 1; dot.style.transform = 'translate(' + (e.clientX - 5) + 'px,' + (e.clientY - 5) + 'px)'; }, { passive: true });
  }

  // Contact form: validate, then open the visitor's email app (no backend)
  var form = document.getElementById('contactForm'), status = document.getElementById('formStatus');
  var msgs = { name: 'Enter your name.', email: 'Enter a valid email address.', subject: 'Enter a subject.', message: 'Enter a message.' };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['name', 'email', 'subject', 'message'].forEach(function (k) {
      var f = form.elements[k], err = document.getElementById('e' + k.charAt(0).toUpperCase() + k.slice(1));
      var bad = !f.value.trim() || (k === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
      err.textContent = bad ? msgs[k] : ''; f.setAttribute('aria-invalid', bad); if (bad) ok = false;
    });
    if (!ok) { status.textContent = 'Fix the highlighted fields and try again.'; return; }
    var body = 'From: ' + form.elements.name.value + ' (' + form.elements.email.value + ')\n\n' + form.elements.message.value;
    window.location.href = 'mailto:rehmn3252@gmail.com?subject=' + encodeURIComponent(form.elements.subject.value) + '&body=' + encodeURIComponent(body);
    status.textContent = 'Your email app should open with the message ready to send.';
  });
})();
