/* Ô Sublime — couche « mouvement » (l'intention est décrite en tête de motion.css).
   Rien ici n'est indispensable : sans ce fichier, le site est la version sobre. */
(function () {
  'use strict';

  var doc = document, root = doc.documentElement;
  var W = window.OS_WREATH;
  var NS = 'http://www.w3.org/2000/svg';
  var KEY = 'os-motion';
  var IS_ROUTER = !!window.OS_ROUTER;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- petits outils ---------- */
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function mk(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function sv(tag, attrs) {
    var n = doc.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function on() { return root.classList.contains('has-motion'); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.warn('[motion]', e); } }
  function pref(v) {
    try {
      if (v === undefined) return localStorage.getItem(KEY);
      localStorage.setItem(KEY, v);
    } catch (e) {}
    return null;
  }
  function visiblePage() { return $('.page:not([hidden])'); }

  /* ---------- la couronne du logo, tracé par tracé ----------
     Toutes les rotations / zooms s'expriment en pourcentages de la boîte de chaque élément
     (transform-box: fill-box) : indépendants de l'échelle d'affichage, donc fiables sur Safari. */
  function wreathSVG(cls) {
    var s = W.size;
    var svg = sv('svg', { viewBox: '0 0 ' + s + ' ' + s, 'class': cls, 'aria-hidden': 'true', focusable: 'false' });
    var spin = sv('g', { 'class': 'w-spin' });
    var stems = sv('g', { 'class': 'w-stems' });
    W.parts.forEach(function (p) {
      if (p.k !== 's') return;
      var g = sv('g', { 'class': 'w-stem' });
      g.style.setProperty('--i', p.i);
      g.appendChild(sv('path', { d: p.d }));
      stems.appendChild(g);
    });
    spin.appendChild(stems);
    W.parts.forEach(function (p) {
      if (p.k !== 'l') return;
      var g = sv('g', { 'class': 'w-leaf' });
      g.style.setProperty('--i', p.i);
      var path = sv('path', { d: p.d });
      var o = ((p.bx - p.x0) / (p.x1 - p.x0) * 100).toFixed(1) + '% ' + ((p.by - p.y0) / (p.y1 - p.y0) * 100).toFixed(1) + '%';
      g.style.transformOrigin = o;
      path.style.transformOrigin = o;
      g.appendChild(path);
      spin.appendChild(g);
    });
    svg.appendChild(spin);
    return svg;
  }

  /* ---------- titres découpés en mots ---------- */
  function splitWords(node, counter) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = doc.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(doc.createTextNode(p)); return; }
          var w = mk('span', 'w'), wi = mk('span', 'wi', p);
          wi.style.setProperty('--wi', counter.n++);
          w.appendChild(wi);
          frag.appendChild(w);
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') {
        splitWords(n, counter);
      }
    });
  }

  /* ---------- préparation d'une page (ou du pied de page) : une seule fois ---------- */
  var SEQ = ['.sec-head', '.pillars', '.spa-tiles', '.care-grid', '.escales', '.steps', '.faq',
             '.care-sec__grid > div:first-child', '.info-grid > div', '.band > div:first-child',
             '.foot-grid', '.hours tbody', '.contact-list', '.care-points', '.escale__path'];
  var pars = [];

  function prep(scope) {
    if (!scope || scope.__prepped) return;
    scope.__prepped = true;

    $$('main h1, main h2', scope.nodeType === 9 ? doc : scope).forEach(function (h) {
      if (h.hasAttribute('data-split')) return;
      var label = h.textContent.replace(/\s+/g, ' ').trim();
      splitWords(h, { n: 0 });
      h.setAttribute('data-split', '');
      h.setAttribute('aria-label', label);
      $$('.w', h).forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });
    });

    SEQ.forEach(function (sel) {
      $$(sel, scope).forEach(function (c) {
        if (c.hasAttribute('data-seq')) return;
        c.setAttribute('data-seq', '');
        Array.prototype.forEach.call(c.children, function (ch, i) {
          ch.style.setProperty('--k', i);
          ch.classList.remove('reveal', 'reveal-d1', 'reveal-d2', 'reveal-d3');
        });
      });
    });

    $$('[data-intro] .reveal', scope).forEach(function (n) {
      n.classList.remove('reveal', 'reveal-d1', 'reveal-d2', 'reveal-d3');
    });

    var seen = new Map();
    $$('.reveal:not([data-seq])', scope).forEach(function (r) {
      var p = r.parentNode, n = seen.get(p) || 0;
      seen.set(p, n + 1);
      r.style.setProperty('--d', Math.min(n, 4) * 110 + 'ms');
    });

    $$('.photo', scope).forEach(function (ph) {
      var img = ph.querySelector('img');
      if (img) pars.push({ frame: ph, img: img, k: ph.classList.contains('hero-band') ? 0.07 : 0.05, py: 0 });
    });

    safe(function () { initFaq(scope); });
  }

  /* icônes au trait : longueur du tracé mesurée, pour qu'elles se dessinent */
  var DRAWABLE = '.pillar svg, .care-card svg, .contact-list svg, .care-points svg, .care-sec__media .ill';
  function prepDraw(scope) {
    $$(DRAWABLE, scope).forEach(function (svg) {
      if (svg.__drawn) return;
      var svgFill = svg.getAttribute('fill');
      if (svgFill === 'currentColor') { svg.__drawn = true; return; }
      var k = 0, measured = 0;
      $$('path, circle, rect, line, polyline, polygon, ellipse', svg).forEach(function (n) {
        var fill = n.getAttribute('fill');
        if (fill && fill !== 'none') return;
        if (!fill && svgFill && svgFill !== 'none') return;
        if (n.getAttribute('stroke-dasharray')) { n.classList.add('spin-slow'); return; }
        if (!n.getTotalLength) return;
        var len = 0;
        try { len = n.getTotalLength(); } catch (e) {}
        if (!len || !isFinite(len)) return;
        measured++;
        n.setAttribute('data-draw', '');
        n.style.setProperty('--len', Math.ceil(len) + 1);
        n.style.setProperty('--dk', k++);
      });
      if (measured || svg.getBoundingClientRect().width) svg.__drawn = true;
    });
  }

  /* ---------- révélations : un seul observateur ---------- */
  var io = null;
  function observe(scope) {
    var list = $$('.reveal, [data-seq], [data-split], .photo', scope);
    list.forEach(function (n) {
      if (n.closest('[data-intro]') && n.hasAttribute('data-split')) return;
      if (!io) { n.classList.add('is-in'); return; }
      if (!n.classList.contains('is-in')) io.observe(n);
    });
  }
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
  }

  function resetPage(scope) {
    $$('.is-in', scope).forEach(function (n) {
      if (n.matches('.reveal, [data-seq], [data-split], .photo')) n.classList.remove('is-in');
    });
    $$('.intro-on', scope).forEach(function (n) { n.classList.remove('intro-on'); });
  }

  /* ---------- intro (héros et en-têtes de page) ---------- */
  function fmtCount(v, n) { return v.toFixed(+n.getAttribute('data-dec') || 0).replace('.', ','); }
  function countUp(n) {
    var to = parseFloat(n.getAttribute('data-count')), t0 = performance.now(), dur = 1500;
    (function step(t) {
      var p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
      n.textContent = fmtCount(to * e, n);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  function playIntro(scope) {
    $$('[data-intro]', scope || doc).forEach(function (c) {
      if (c.closest('[hidden]')) return;
      c.classList.remove('intro-on');
      void c.offsetWidth;
      c.classList.add('intro-on');
      $$('[data-count]', c).forEach(function (n) {
        n.textContent = fmtCount(0, n);
        setTimeout(function () { countUp(n); }, 2100);
      });
    });
  }

  function pageChanged(el) {
    if (!el) return;
    resetPage(el);
    safe(function () { prepDraw(el); });
    // les .is-in retirés : les repères d'intro se réarment
  }
  function armPage(el) {
    if (!el) return;
    safe(function () { prepDraw(el); });
    observe(el);
    playIntro(el);
  }

  /* ---------- boucle d'animation unique ---------- */
  var tasks = [], raf = 0, last = 0;
  function loop(t) {
    raf = requestAnimationFrame(loop);
    var dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    for (var i = 0; i < tasks.length; i++) { try { tasks[i](t, dt); } catch (e) {} }
  }
  function startLoop() { if (raf || doc.hidden || !on()) return; last = performance.now(); raf = requestAnimationFrame(loop); }
  function stopLoop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  doc.addEventListener('visibilitychange', function () { if (doc.hidden) stopLoop(); else startLoop(); });

  /* progression, couronne du héros, parallaxe des photos */
  var bar, crest, crestHero;
  function scrollTask() {
    var y = window.pageYOffset || root.scrollTop || 0;
    var vh = window.innerHeight;
    if (bar) {
      var max = Math.max(1, root.scrollHeight - vh);
      bar.style.transform = 'scaleX(' + clamp(y / max, 0, 1).toFixed(4) + ')';
    }
    if (crest && crestHero && crestHero.classList.contains('intro-on') && !crestHero.closest('[hidden]')) {
      if (y < 2) { crest.style.transform = ''; crest.style.opacity = ''; }
      else if (y < 1200) {
        var t = clamp(y / 720, 0, 1);
        crest.style.transform = 'translate3d(0,' + (y * 0.2).toFixed(1) + 'px,0) rotate(' + (y * 0.035).toFixed(2) + 'deg) scale(' + (1 - t * 0.16).toFixed(3) + ')';
        crest.style.opacity = (1 - t * 0.92).toFixed(3);
      }
    }
    for (var i = 0; i < pars.length; i++) {
      var p = pars[i], r = p.frame.getBoundingClientRect();
      if (!r.height || r.bottom < -60 || r.top > vh + 60) continue;
      var c = clamp(((r.top + r.height / 2) - vh / 2) / vh, -1, 1);
      var v = -c * r.height * p.k;
      if (Math.abs(v - p.py) > 0.25) { p.py = v; p.img.style.setProperty('--py', v.toFixed(1) + 'px'); }
    }
  }

  /* ---------- poussière d'or (canvas) ---------- */
  var sprite;
  function goldSprite() {
    if (sprite) return sprite;
    var c = mk('canvas');
    c.width = c.height = 64;
    var g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,243,206,1)');
    gr.addColorStop(0.2, 'rgba(228,192,108,.95)');
    gr.addColorStop(0.5, 'rgba(176,140,67,.26)');
    gr.addColorStop(1, 'rgba(176,140,67,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return (sprite = c);
  }
  function initDust(host, cfg) {
    var cv = mk('canvas', 'dust');
    cv.setAttribute('aria-hidden', 'true');
    host.appendChild(cv);
    var ctx = cv.getContext('2d');
    var w = 0, h = 0, parts = [], live = false, px = 0, py = 0, tx = 0, ty = 0;
    var mem = Math.min(1, (navigator.deviceMemory || 4) / 4);
    var spr = goldSprite();

    function spawn(anywhere) {
      var z = 0.25 + Math.random() * 0.75;
      return {
        x: Math.random() * w, y: anywhere ? Math.random() * h : h + 14, z: z,
        s: (0.9 + Math.random() * 2.6) * z * cfg.size, v: (6 + Math.random() * 14) * z,
        ph: Math.random() * 6.283, sp: 0.25 + Math.random() * 0.6, a: 0.35 + Math.random() * 0.65
      };
    }
    function size() {
      var r = host.getBoundingClientRect();
      if (!r.width) return;
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(clamp(w * h / cfg.density, 14, cfg.max) * mem);
      parts = [];
      for (var i = 0; i < n; i++) parts.push(spawn(true));
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        live = es[0].isIntersecting;
        if (live && !w) size();
      }, { rootMargin: '80px' }).observe(host);
    }
    if ('ResizeObserver' in window) new ResizeObserver(function () { if (live) size(); }).observe(host);
    if (fine) {
      host.addEventListener('pointermove', function (e) {
        var r = host.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      }, { passive: true });
    }
    tasks.push(function (t, dt) {
      if (!live || !w) return;
      ctx.clearRect(0, 0, w, h);
      px += (tx - px) * 0.05; py += (ty - py) * 0.05;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.v * dt;
        if (p.y < -16) { parts[i] = p = spawn(false); }
        var x = p.x + Math.sin(p.ph + t * 0.0004 * p.sp * 6.283) * 15 * p.z - px * 28 * p.z;
        var y = p.y - py * 18 * p.z;
        var edge = Math.min(1, p.y / (h * 0.22), (h - p.y) / (h * 0.16));
        var tw = 0.62 + 0.38 * Math.sin(p.ph * 3 + t * 0.0011 * p.sp * 6);
        ctx.globalAlpha = clamp(p.a * tw * edge * cfg.alpha, 0, 1);
        var s = p.s * 6;
        ctx.drawImage(spr, x - s / 2, y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    });
  }

  /* ---------- curseur ---------- */
  function initCursor() {
    if (!fine) return;
    var ring = mk('div', 'cursor'), dot = mk('div', 'cursor-dot');
    ring.setAttribute('aria-hidden', 'true'); dot.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(ring); doc.body.appendChild(dot);
    root.classList.add('has-cursor');
    var x = -100, y = -100, rx = x, ry = y, seen = false;
    doc.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      if (!seen) { seen = true; rx = x; ry = y; ring.classList.add('is-on'); dot.classList.add('is-on'); }
      var t = e.target, c = t && t.closest ? t : null;
      var link = c && c.closest('a, button, summary, label, [data-cursor]');
      ring.classList.toggle('is-link', !!link);
      ring.classList.toggle('is-text', !!(c && c.closest('input, textarea, select')));
      ring.classList.toggle('is-photo', !!(c && !link && c.closest('.photo')));
    }, { passive: true });
    doc.addEventListener('pointerdown', function () { ring.classList.add('is-down'); });
    doc.addEventListener('pointerup', function () { ring.classList.remove('is-down'); });
    doc.documentElement.addEventListener('pointerleave', function () { ring.classList.remove('is-on'); dot.classList.remove('is-on'); seen = false; });
    tasks.push(function () {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    });
  }

  /* ---------- interactions : inclinaison, aimant, onde au clic ---------- */
  function initPointer() {
    doc.addEventListener('pointerdown', function (e) {
      var b = e.target.closest && e.target.closest('.btn');
      if (!b || !on()) return;
      var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2;
      var s = mk('span', 'rip');
      s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
      b.appendChild(s);
      setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 950);
    });
    if (!fine) return;
    doc.addEventListener('pointermove', function (e) {
      if (!on() || e.pointerType !== 'mouse') return;
      var t = e.target;
      if (!t || !t.closest) return;
      var card = t.closest('.care-card, .escale');
      if (card) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', ((x - 0.5) * 7).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - y) * 7).toFixed(2) + 'deg');
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      }
      var b = t.closest('.btn');
      if (b) {
        var q = b.getBoundingClientRect();
        b.style.setProperty('--tx', ((e.clientX - q.left - q.width / 2) * 0.2).toFixed(1) + 'px');
        b.style.setProperty('--ty', ((e.clientY - q.top - q.height / 2) * 0.28).toFixed(1) + 'px');
      }
    }, { passive: true });
    doc.addEventListener('pointerout', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var card = t.closest('.care-card, .escale');
      if (card && !(e.relatedTarget && card.contains(e.relatedTarget))) {
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
      }
      var b = t.closest('.btn');
      if (b && !(e.relatedTarget && b.contains(e.relatedTarget))) {
        b.style.setProperty('--tx', '0px'); b.style.setProperty('--ty', '0px');
      }
    });
  }

  /* ---------- horaires vivants ---------- */
  var HOURS = { 2: [[9, 12], [14, 19]], 3: [[9, 12], [14, 19]], 4: [[9, 12], [14, 19]], 5: [[9, 12], [14, 19]], 6: [[9, 17]] };
  var DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  function parisNow() {
    var m = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach(function (p) { m[p.type] = p.value; });
    var wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[m.weekday];
    return { wd: wd, min: (+m.hour) * 60 + (+m.minute) };
  }
  function statusInfo() {
    var n = parisNow(), today = HOURS[n.wd] || [], i, add;
    for (i = 0; i < today.length; i++) {
      if (n.min >= today[i][0] * 60 && n.min < today[i][1] * 60) return { open: true, text: 'Ouvert · jusqu’à ' + today[i][1] + ' h', wd: n.wd };
    }
    for (add = 0; add < 8; add++) {
      var d = (n.wd + add) % 7, rs = HOURS[d] || [];
      for (i = 0; i < rs.length; i++) {
        if (add === 0 && rs[i][0] * 60 <= n.min) continue;
        var when = add === 0 ? 'à ' + rs[i][0] + ' h' : add === 1 ? 'demain à ' + rs[i][0] + ' h' : DAYS[d] + ' à ' + rs[i][0] + ' h';
        return { open: false, text: 'Fermé · réouvre ' + when, wd: n.wd };
      }
    }
    return { open: false, text: 'Fermé', wd: n.wd };
  }
  var chips = [];
  function paintStatus() {
    var s = statusInfo();
    chips.forEach(function (c) {
      c.className = c.className.replace(/\bis-(open|closed)\b/g, '').trim() + (s.open ? ' is-open' : ' is-closed');
      c.querySelector('b').textContent = s.text;
    });
    $$('.hours tbody tr').forEach(function (tr, i) { tr.classList.toggle('is-today', ((s.wd + 6) % 7) === i); });
  }
  function initStatus() {
    $$('.hero--statement .hero__meta').forEach(function (m) {
      var c = mk('span', 'status');
      c.appendChild(mk('i')); c.appendChild(mk('b'));
      m.insertBefore(c, m.firstChild);
      chips.push(c);
    });
    $$('.hours').forEach(function (t) {
      var p = mk('p', 'status-line'), c = mk('span', 'status');
      c.appendChild(mk('i')); c.appendChild(mk('b'));
      p.appendChild(c);
      t.parentNode.insertBefore(p, t);
      chips.push(c);
    });
    paintStatus();
    setInterval(paintStatus, 60000);
  }

  /* ---------- FAQ : ouverture en douceur ---------- */
  function initFaq(scope) {
    $$('.faq details', scope).forEach(function (d) {
      if (d.__acc) return;
      d.__acc = true;
      d.classList.toggle('is-open', d.open);
      var s = d.querySelector('summary');
      if (!s || !d.animate) return;
      s.addEventListener('click', function (e) {
        if (!on()) return;
        e.preventDefault();
        var opening = d.__anim ? !d.classList.contains('is-open') : !d.open;
        var from = d.getBoundingClientRect().height;
        if (d.__anim) { d.__anim.onfinish = null; d.__anim.cancel(); }
        var to;
        if (opening) { d.open = true; to = d.getBoundingClientRect().height; }
        else { d.open = false; to = d.getBoundingClientRect().height; d.open = true; }
        d.classList.toggle('is-open', opening);
        d.style.overflow = 'hidden';
        var a = d.__anim = d.animate({ height: [from + 'px', to + 'px'] }, { duration: 540, easing: 'cubic-bezier(.22,1,.36,1)' });
        a.onfinish = function () { d.__anim = null; d.style.overflow = ''; d.open = opening; };
      });
    });
  }

  /* ---------- sommaire des soins : la pastille suit la lecture ---------- */
  function initSpy() {
    var nav = $('.chipnav');
    if (!nav || !('IntersectionObserver' in window)) return;
    var ul = $('ul', nav), links = $$('a[href^="#"]', nav);
    function current(id) {
      links.forEach(function (a) {
        var yes = a.getAttribute('href') === '#' + id;
        if (yes) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        if (yes && ul && ul.scrollWidth > ul.clientWidth) {
          ul.scrollTo({ left: a.offsetLeft - ul.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' });
        }
      });
    }
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) current(e.target.id); });
    }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });
    links.forEach(function (a) {
      var s = doc.getElementById(a.getAttribute('href').slice(1));
      if (s) spy.observe(s);
    });
  }

  /* ---------- le rideau (transition de page) ---------- */
  var curtain, busy = false;
  function buildCurtain() {
    curtain = mk('div', 'curtain');
    curtain.setAttribute('aria-hidden', 'true');
    var inner = mk('div', 'curtain__inner');
    if (W) inner.appendChild(wreathSVG('wreath'));
    inner.appendChild(mk('p', 'curtain__name', 'Ô Sublime'));
    inner.appendChild(mk('p', 'curtain__sub', 'Institut de beauté & spa'));
    curtain.appendChild(inner);
    doc.body.appendChild(curtain);
  }
  function cover() {
    return new Promise(function (res) {
      curtain.classList.remove('is-covered', 'play');
      curtain.classList.add('is-active');
      curtain.style.clipPath = '';
      void curtain.offsetWidth;
      if (curtain._a) curtain._a.cancel();
      var a = curtain._a = curtain.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)' }],
        { duration: 560, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
      setTimeout(function () { curtain.classList.add('play'); }, 300);
      a.onfinish = function () { curtain.classList.add('is-covered'); res(); };
    });
  }
  function uncover() {
    return new Promise(function (res) {
      curtain.style.clipPath = '';
      if (curtain._a) curtain._a.cancel();
      var a = curtain._a = curtain.animate([{ clipPath: 'inset(0% 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }],
        { duration: 720, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
      a.onfinish = function () {
        a.cancel(); curtain._a = null;
        curtain.classList.remove('is-active', 'is-covered', 'play');
        res();
      };
    });
  }
  function navigate(fn) {
    if (!on() || busy || !curtain) {
      var el0 = fn();
      if (el0) { pageChanged(el0); armPage(el0); }
      return;
    }
    busy = true;
    cover().then(function () {
      var el = fn();
      if (el) pageChanged(el);
      return wait(380).then(function () {
        var up = uncover();
        if (el) setTimeout(function () { armPage(el); }, 300);
        return up;
      });
    }).then(function () { busy = false; }, function () { busy = false; });
  }

  /* pages séparées (site réel) : le rideau se ferme avant de partir, et se lève à l'arrivée */
  function initLinks() {
    if (IS_ROUTER) return;
    doc.addEventListener('click', function (e) {
      if (!on() || busy || !curtain || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target || a.hasAttribute('download')) return;
      var href = a.getAttribute('href') || '';
      if (!/^[^:#?]+\.html(#.*)?$/.test(href)) return;
      var u = new URL(a.href, location.href);
      if (u.pathname === location.pathname) return;
      e.preventDefault();
      busy = true;
      cover().then(function () {
        try { sessionStorage.setItem('os-curtain', '1'); } catch (err) {}
        location.href = a.href;
        setTimeout(function () { busy = false; uncover(); }, 4000);
      });
    });
    window.addEventListener('pageshow', function (e) {
      if (e.persisted && curtain) { busy = false; curtain.classList.remove('is-active', 'is-covered', 'play'); }
    });
  }

  /* ---------- éléments de décor et d'interface ---------- */
  function buildChrome() {
    bar = mk('div', 'progress');
    bar.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(bar);

    if (W) {
      var foot = $('.site-foot');
      if (foot) {
        var fw = wreathSVG('wreath foot-wreath');
        foot.insertBefore(fw, foot.firstChild);
      }
      crest = $('.hero__crest');
      crestHero = crest && crest.closest('[data-intro]');
      if (crest) {
        var rings = sv('svg', { viewBox: '0 0 100 100', 'class': 'rings', 'aria-hidden': 'true', focusable: 'false' });
        for (var i = 0; i < 3; i++) {
          var c = sv('circle', { cx: 50, cy: 50, r: 50 });
          c.style.setProperty('--r', i);
          rings.appendChild(c);
        }
        crest.appendChild(rings);
        crest.appendChild(wreathSVG('wreath crest-svg'));
      }
    }
    $$('.hero--statement').forEach(function (h) {
      var cue = mk('span', 'scroll-cue');
      cue.setAttribute('aria-hidden', 'true');
      h.appendChild(cue);
      initDust(h, { size: 1, alpha: 0.85, density: 22000, max: 70 });
    });
    $$('.band').forEach(function (b) {
      var sh = mk('span', 'sheen');
      sh.setAttribute('aria-hidden', 'true');
      b.appendChild(sh);
      initDust(b, { size: 0.8, alpha: 1, density: 11000, max: 26 });
    });
    if (W) buildCurtain();
  }

  var toggle;
  function paintToggle() {
    if (!toggle) return;
    var v = on(), lbl = $('.lbl', toggle), hint = !v && mqReduce.matches && pref() === null;
    toggle.setAttribute('aria-pressed', v ? 'true' : 'false');
    toggle.classList.toggle('is-hint', hint);
    lbl.textContent = hint ? 'Animations réduites sur cet appareil · activer' : (v ? 'Animations activées' : 'Animations désactivées');
  }
  function buildToggle() {
    toggle = mk('button', 'motion-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Animations');
    var ic = sv('svg', { viewBox: '0 0 24 24', 'class': 'ic', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'aria-hidden': 'true', focusable: 'false' });
    ic.appendChild(sv('circle', { cx: 12, cy: 12, r: 2.3, fill: 'currentColor', stroke: 'none' }));
    ic.appendChild(sv('circle', { cx: 12, cy: 12, r: 6.2, 'class': 'r1' }));
    ic.appendChild(sv('circle', { cx: 12, cy: 12, r: 10.2, 'class': 'r2' }));
    ic.appendChild(sv('path', { d: 'M4 20L20 4', 'class': 'slash' }));
    toggle.appendChild(ic);
    toggle.appendChild(mk('span', 'lbl'));
    toggle.addEventListener('click', function () { setMotion(!on(), true); });
    doc.body.appendChild(toggle);
    paintToggle();
  }
  function clearInline() {
    if (crest) { crest.style.transform = ''; crest.style.opacity = ''; }
    pars.forEach(function (p) { p.img.style.removeProperty('--py'); p.py = 0; });
  }
  function setMotion(v, persist) {
    if (persist) pref(v ? 'on' : 'off');
    if (v !== on()) {
      root.classList.toggle('has-motion', v);
      if (v) {
        $$('.faq details').forEach(function (d) { d.classList.toggle('is-open', d.open); });
        startLoop(); playIntro(visiblePage() || doc);
      } else { stopLoop(); clearInline(); }
    }
    paintToggle();
  }
  mqReduce.addEventListener && mqReduce.addEventListener('change', function () {
    if (pref() === null) setMotion(!mqReduce.matches, false);
  });

  /* ---------- démarrage ---------- */
  function init() {
    window.OSMotion = { navigate: navigate, pageChanged: pageChanged, armPage: armPage, setMotion: setMotion, on: on };
    var pages = $$('.page');
    var held = root.classList.contains('curtain-hold');

    safe(buildChrome);
    safe(initStatus);
    safe(initSpy);
    safe(initPointer);
    safe(initLinks);
    safe(initCursor);
    safe(buildToggle);

    if (pages.length) {
      pages.forEach(function (p) { safe(function () { prep(p); }); });
      safe(function () { prep($('.site-foot')); });
    } else {
      safe(function () { prep(doc); });
    }
    tasks.push(scrollTask);

    var vis = visiblePage();
    var scopes = vis ? [vis, $('.site-foot')] : [doc];
    var fonts = (doc.fonts && doc.fonts.ready) ? Promise.race([doc.fonts.ready, wait(900)]) : wait(0);

    if (held && curtain) {
      curtain.style.clipPath = 'inset(0)';
      curtain.classList.add('is-active', 'is-covered', 'play');
      root.classList.remove('curtain-hold');
      try { sessionStorage.removeItem('os-curtain'); } catch (e) {}
    }

    fonts.then(function () {
      scopes.forEach(function (s) { if (s) { safe(function () { prepDraw(s); }); observe(s); } });
      if (held && curtain) {
        return wait(220).then(function () { playIntro(scopes[0]); return uncover(); });
      }
      playIntro(scopes[0]);
    }).catch(function () {}).then(function () {
      if (on()) startLoop();
    });

    // filet de sécurité : jamais de contenu resté invisible
    setTimeout(function () {
      $$('[data-intro]').forEach(function (c) { if (!c.closest('[hidden]')) c.classList.add('intro-on'); });
    }, 4500);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
