/* =====================================================================
   Janak Chauhan: portfolio script (core)
   Plain JavaScript, no libraries. Each feature is wrapped so that if one
   part fails, the rest of the page (and all the content) still works.
   Scroll-driven stages (intro, work rail, About browser, outro) switch on
   only when motion is allowed, and fall back to a plain stacked layout.
   ===================================================================== */
(function () {
  "use strict";
  var JC = (window.JC = window.JC || {});
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  JC.reduce = function () { return mq.matches; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  JC.$ = $; JC.$$ = $$;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function vw() { return document.documentElement.clientWidth || window.innerWidth; }

  var toastTimer;
  JC.toast = function (msg) {
    var t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 4200);
  };

  /* ---------- Reveal on scroll (fade + short rise, once) ---------- */
  function initReveal() {
    var items = $$(".reveal");
    if (!items.length || !("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("reveal-ready");
    var io = new IntersectionObserver(function (entries) {
      var shown = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.style.setProperty("--d", Math.min(shown * 60, 240) + "ms");
        en.target.classList.add("is-in"); io.unobserve(en.target); shown++;
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.04 });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () { items.forEach(function (el) { el.classList.add("is-in"); }); }, 3000);
  }

  /* ---------- 4. Copy-email button ---------- */
  function initCopy() {
    var btn = $("#copy-email"), status = $("#copy-status");
    if (!btn || !status) return;
    var email = btn.getAttribute("data-email"), timer;
    function say(m) { status.textContent = m; clearTimeout(timer); timer = setTimeout(function () { status.textContent = ""; }, 4000); }
    function legacy() {
      var f = document.createElement("textarea"); f.value = email; f.setAttribute("readonly", "");
      f.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(f); f.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(f); return ok;
    }
    btn.addEventListener("click", function () {
      var fail = "Couldn't copy automatically. The address is: " + email;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(function () { say("Email address copied."); },
          function () { say(legacy() ? "Email address copied." : fail); });
      } else say(legacy() ? "Email address copied." : fail);
    });
  }

  /* ---------- 5. Footer year ---------- */
  function initYear() { var el = $("#year"); if (el) el.textContent = String(new Date().getFullYear()); }

  /* ---------- Hero: polaroids, hover words, hand-drawn marks, logo-dot easter egg ---------- */
  function initPolaroids() {
    var cards = $$(".hero-polaroid");
    function toggle(c) {
      var on = !c.classList.contains("is-front");
      cards.forEach(function (o) { o.classList.remove("is-front"); o.setAttribute("aria-pressed", "false"); });
      if (on) { c.classList.add("is-front"); c.setAttribute("aria-pressed", "true"); }
    }
    cards.forEach(function (c) {
      c.addEventListener("click", function () { toggle(c); });
      c.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(c); } });
    });
  }
  function initHoverwords() {
    var n = 0;
    $$(".hero-hoverword").forEach(function (w) {
      var pop = null, id = "pop-" + (++n);
      function show() {
        if (pop) return;
        pop = document.createElement("span"); pop.className = "hero-hoverword-pop"; pop.id = id; pop.setAttribute("role", "tooltip");
        pop.textContent = w.getAttribute("data-pop"); w.appendChild(pop); w.setAttribute("aria-describedby", id);
      }
      function hide() { if (pop) { pop.remove(); pop = null; w.removeAttribute("aria-describedby"); } }
      w.addEventListener("mouseenter", show); w.addEventListener("mouseleave", hide);
      w.addEventListener("focus", show); w.addEventListener("blur", hide);
      w.addEventListener("click", function () { pop ? hide() : show(); });
      w.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
    });
  }
  function initAnnotations() {
    var NS = "http://www.w3.org/2000/svg";
    var items = $$(".anno[data-anno]");
    items.forEach(function (a) {
      var kind = a.getAttribute("data-anno"), svg = document.createElementNS(NS, "svg"), p = document.createElementNS(NS, "path");
      svg.setAttribute("class", "anno-svg"); svg.setAttribute("aria-hidden", "true"); svg.setAttribute("preserveAspectRatio", "none");
      p.setAttribute("pathLength", "1"); p.setAttribute("fill", "none"); p.setAttribute("stroke", "currentColor"); p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round");
      if (kind === "underline") {
        svg.setAttribute("viewBox", "0 0 100 12"); svg.style.cssText = "left:-2%;bottom:-.3em;width:104%;height:.4em";
        p.setAttribute("d", "M2 7C20 2 36 10 54 6s30-4 44 0"); p.setAttribute("stroke-width", "2.6");
      } else {
        svg.setAttribute("viewBox", "0 0 100 44"); svg.style.cssText = "left:-14%;top:-24%;width:128%;height:150%";
        p.setAttribute("d", "M52 4C22 3 4 12 5 24c1 12 26 17 52 16 28-1 40-9 38-21C93 9 70 3 38 5"); p.setAttribute("stroke-width", "2.2"); p.setAttribute("vector-effect", "non-scaling-stroke");
      }
      svg.appendChild(p); a.appendChild(svg);
    });
    if (!("IntersectionObserver" in window) || JC.reduce()) { items.forEach(function (a) { a.classList.add("is-drawn"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { setTimeout(function () { e.target.classList.add("is-drawn"); }, 350); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    items.forEach(function (a) { io.observe(a); });
  }
  function initEgg() {
    var mark = $(".hero-dot"); if (!mark) return;
    var n = 0, t0 = 0;
    mark.addEventListener("click", function () {
      var now = Date.now(); if (now - t0 > 2000) n = 0; t0 = now; n++;
      if (n < 5) return; n = 0;
      mark.classList.remove("egg"); void mark.offsetWidth; mark.classList.add("egg");
      if (!JC.reduce()) {
        var r = mark.getBoundingClientRect(), cols = ["#e25531", "#242620", "#b53c1f", "#d3d3c8"];
        for (var i = 0; i < 12; i++) {
          var d = document.createElement("span"), a = i / 12 * 6.2832, k = 46 + (i % 3) * 14;
          d.className = "egg-dot"; d.style.left = r.left + r.width / 2 - 4 + "px"; d.style.top = r.top + r.height / 2 - 4 + "px";
          d.style.background = cols[i % 4]; d.style.setProperty("--dx", Math.cos(a) * k + "px"); d.style.setProperty("--dy", Math.sin(a) * k + "px");
          document.body.appendChild(d); setTimeout((function (el) { return function () { el.remove(); }; })(d), 900);
        }
      }
      JC.toast("You found it. Data tip: always plot your data before you trust a number.");
    });
  }

  /* ---------- Hero spotlight follows a fine pointer (as on the reference) ---------- */
  function initSpotlight() {
    var spot = $(".hero-spot"), hero = spot && spot.parentElement; if (!spot) return;
    var raf = 0, x = 0, y = 0;
    function off() { cancelAnimationFrame(raf); raf = 0; delete spot.dataset.active; }
    function move(e) {
      if (mq.matches || e.pointerType === "touch") return;
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0; var r = hero.getBoundingClientRect();
        spot.style.setProperty("--spot-x", (x - r.left) + "px"); spot.style.setProperty("--spot-y", (y - r.top) + "px"); spot.dataset.active = "true";
      });
    }
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerenter", move, { passive: true });
    hero.addEventListener("pointerleave", off); hero.addEventListener("pointercancel", off);
    window.addEventListener("blur", off); window.addEventListener("scroll", off, { passive: true });
    if (mq.addEventListener) mq.addEventListener("change", off);
  }

  /* ---------- Project filters ---------- */
  function initProjects() {
    var rail = $("#rail"); if (!rail) return;
    var cards = $$(".pcard", rail), btns = $$(".filter"), status = $("#filter-status"), empty = $("#rail-empty");
    function apply(cat) {
      var n = 0;
      cards.forEach(function (c) {
        var show = cat === "all" || (c.getAttribute("data-cats") || "").split(" ").indexOf(cat) > -1;
        c.hidden = !show; if (show) n++;
      });
      btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === cat)); });
      if (empty) empty.hidden = n > 0;
      if (status) status.textContent = n === 0 ? "No projects match this filter." : "Showing " + n + (n === 1 ? " project." : " projects.");
      if (JC.layout) JC.layout();
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { apply(b.getAttribute("data-filter")); }); });
    JC.filterProjects = apply;
  }

  /* ---------- Scroll stages ---------- */
  function initStages() {
    var root = document.documentElement;
    var intro = $(".intro"), outro = $(".outro"), work = $("#work"), rail = $("#rail"), viewport = $(".work-viewport");
    var about = $("#about"), bstage = $("#browser-stage"), head = $(".about-head");
    var pencil = $(".pencil-progress"), pNum = $(".pencil-progress-number");
    var tabs = $$("#about [role=tab]"), pages = $$("#about .browser-page"), urlB = $("#browser-url-b");
    var dots = $$(".browser-progress i"), nextBtn = $("#browser-next");
    var navLinks = $$("#site-nav a[href^='#']");
    var LABELS = ["About", "How I work", "Interests"], cur = 0;
    var live = false, pin = false, bpin = false, travel = 0, ticking = false;
    var beats = {};

    function wordsOf(stage, sel) {
      return $$(stage + " " + sel).map(function (b) { return { el: b, words: $$(".intro-word,.outro-word", b) }; });
    }
    beats.intro = intro ? wordsOf(".intro", ".intro-beat") : [];
    beats.outro = outro ? wordsOf(".outro", ".outro-beat") : [];

    function reveal(beat, p, a, b) {
      var n = beat.words.length;
      beat.words.forEach(function (w, i) {
        var t = clamp((p - (a + (b - a) * 0.72 * (i / n))) / ((b - a) * 0.28), 0, 1);
        w.style.opacity = (0.12 + 0.88 * t).toFixed(3);
        w.style.transform = "translateY(" + ((1 - t) * 0.18).toFixed(3) + "em)";
        w.style.filter = t >= 1 ? "none" : "blur(" + ((1 - t) * 6).toFixed(2) + "px)";
      });
    }
    function clearWords(list) {
      list.forEach(function (bt) {
        bt.el.style.opacity = bt.el.style.transform = ""; 
        bt.words.forEach(function (w) { w.style.opacity = w.style.transform = w.style.filter = ""; });
      });
    }
    function progress(el, extra) {
      var r = el.getBoundingClientRect(), span = r.height - window.innerHeight * (extra || 1);
      return span > 0 ? clamp(-r.top / span, 0, 1) : 0;
    }

    function drawIntro() {
      var p = progress(intro), b0 = beats.intro[0], b1 = beats.intro[1], iris = $(".intro-iris", intro), hint = $(".intro-hint", intro);
      reveal(b0, p, 0.02, 0.3);
      var e0 = clamp((p - 0.4) / 0.1, 0, 1);
      b0.el.style.opacity = (1 - e0).toFixed(3);
      b0.el.style.transform = "translateY(" + (-6 * e0).toFixed(2) + "vh) scale(" + (1 + 0.04 * e0).toFixed(3) + ")";
      reveal(b1, p, 0.5, 0.74);
      b1.el.style.opacity = clamp((p - 0.47) / 0.04, 0, 1) * (1 - clamp((p - 0.93) / 0.05, 0, 1));
      var z = clamp((p - 0.82) / 0.16, 0, 1);
      b1.el.style.transform = "scale(" + (1 + 2.2 * z * z).toFixed(3) + ")";
      if (iris) iris.style.transform = "scale(" + Math.pow(clamp((p - 0.8) / 0.2, 0, 1), 2).toFixed(3) + ")";
      if (hint) hint.style.opacity = (1 - clamp(p / 0.08, 0, 1)).toFixed(2);
    }
    function drawOutro() {
      var p = progress(outro, 1), b0 = beats.outro[0], b1 = beats.outro[1];
      reveal(b0, p, 0.02, 0.28);
      var e0 = clamp((p - 0.4) / 0.08, 0, 1);
      b0.el.style.opacity = (1 - e0).toFixed(3);
      b0.el.style.transform = "translateY(" + (-6 * e0).toFixed(2) + "vh)";
      reveal(b1, p, 0.5, 0.7);
      b1.el.style.opacity = clamp((p - 0.46) / 0.04, 0, 1);
    }
    function drawWork() {
      var r = work.getBoundingClientRect(), q = travel > 0 ? clamp(-r.top / travel, 0, 1) : 0;
      rail.style.transform = "translate3d(" + (-q * travel).toFixed(1) + "px,0,0)";
    }
    function drawAbout() {
      var vh = window.innerHeight, hr = head.getBoundingClientRect(), sr = bstage.getBoundingClientRect();
      about.style.setProperty("--about-reveal", clamp((vh * 0.92 - hr.top) / (vh * 0.5), 0, 1).toFixed(3));
      about.style.setProperty("--enter", clamp((vh - sr.top) / (vh * 0.55), 0, 1).toFixed(3));
      if (bpin) {
        var idx = clamp(Math.floor((-sr.top + vh * 0.05) / (vh * 0.75)), 0, tabs.length - 1);
        if (idx !== cur) setTab(idx, true);
      }
    }
    function setTab(i, fromScroll) {
      cur = i;
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.classList.toggle("is-active", on); t.setAttribute("aria-selected", String(on)); t.setAttribute("tabindex", on ? "0" : "-1");
      });
      pages.forEach(function (p, k) { p.classList.toggle("is-active", k === i); });
      if (urlB && pages[i]) urlB.textContent = pages[i].getAttribute("data-url");
      dots.forEach(function (d, k) { d.classList.toggle("is-on", k === i); });
      if (nextBtn) {
        var last = i === tabs.length - 1;
        nextBtn.innerHTML = '<span class="browser-next-hint">' + (bpin ? "keep scrolling" : "next tab") + "</span>next: <b>" + (last ? "Get in touch" : LABELS[i + 1]) + "</b> ↓";
      }
    }
    function tabTop(i) { return bstage.getBoundingClientRect().top + window.scrollY + i * window.innerHeight * 0.75 + 4; }
    function goTab(i) {
      if (bpin) window.scrollTo({ top: tabTop(i), behavior: JC.reduce() ? "auto" : "smooth" });
      else setTab(i);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { goTab(i); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = tabs.length, j = -1;
        if (k === "ArrowRight") j = (i + 1) % n; else if (k === "ArrowLeft") j = (i - 1 + n) % n; else if (k === "Home") j = 0; else if (k === "End") j = n - 1;
        if (j < 0) return; e.preventDefault(); goTab(j); tabs[j].focus();
      });
    });
    if (nextBtn) nextBtn.addEventListener("click", function () {
      if (cur < tabs.length - 1) goTab(cur + 1);
      else { var c = document.getElementById("contact"); if (c) c.scrollIntoView({ behavior: JC.reduce() ? "auto" : "smooth" }); }
    });

    function drawPencil() {
      if (!pencil) return;
      var max = document.documentElement.scrollHeight - window.innerHeight, p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      pencil.style.setProperty("--pencil-progress", p.toFixed(4));
      var pct = Math.round(p * 100); pNum.textContent = pct + "%"; pencil.setAttribute("aria-valuenow", String(pct));
      var wr = work.getBoundingClientRect(), mid = window.innerHeight / 2;
      pencil.setAttribute("data-dark", String(wr.top <= mid && wr.bottom >= mid));
      pencil.setAttribute("data-arrived", String(p > 0.98));
    }
    function drawNav() {
      var ids = ["work", "skills", "about", "contact"], vh = window.innerHeight, active = null;
      ids.forEach(function (id) { var el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= vh * 0.35) active = id; });
      var cr = document.getElementById("contact"); var onFooter = cr && cr.getBoundingClientRect().top <= vh * 0.5;
      navLinks.forEach(function (a) {
        var on = !onFooter && a.getAttribute("href") === "#" + active;
        if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
    }
    function frame() {
      ticking = false;
      if (live && intro && beats.intro.length > 1) drawIntro();
      if (live && outro && beats.outro.length > 1) drawOutro();
      if (pin) drawWork();
      if (live) drawAbout();
      drawPencil(); drawNav();
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

    function layout() {
      live = !JC.reduce();
      var w = vw(), h = window.innerHeight;
      pin = live && w >= 1100 && h >= 520 && !!rail && !!viewport;
      bpin = live && w >= 1100 && h >= 560 && !!bstage;
      [intro, outro].forEach(function (s) { if (s) s.classList.toggle("is-live", live); });
      if (!live) { clearWords(beats.intro); clearWords(beats.outro); var ir = $(".intro-iris"); if (ir) ir.style.transform = ""; }
      about.classList.toggle("is-pinned", bpin);
      if (!live) { ["--about-reveal", "--enter"].forEach(function (v) { about.style.removeProperty(v); }); }
      work.removeAttribute("data-mode"); rail.style.transform = ""; work.style.removeProperty("--work-travel");
      if (pin) {
        work.setAttribute("data-mode", "pin");
        travel = Math.max(0, rail.scrollWidth - w);
        work.style.setProperty("--work-travel", travel + "px");
      } else travel = 0;
      if (!bpin) { nextBtn && setTab(cur); }
      else setTab(cur);
      frame();
    }
    JC.layout = layout;
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("load", layout);
    if (mq.addEventListener) mq.addEventListener("change", layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

    /* keyboard focus inside the pinned rail: bring that card into view by scrolling the page */
    if (rail) {
      rail.addEventListener("focusin", function (e) {
        if (!pin) return;
        var card = e.target.closest(".work-card, .more-work"); if (!card) return;
        var rr = rail.getBoundingClientRect(), cr = card.getBoundingClientRect();
        var q = clamp(((cr.left - rr.left) - (vw() - card.offsetWidth) / 2) / (travel || 1), 0, 1);
        var top = work.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + q * travel, behavior: "auto" });
      });
      if (viewport) viewport.addEventListener("scroll", function () { viewport.scrollLeft = 0; });
    }
    layout();
  }

  /* ---------- 8. Skills map: select a skill to learn what it is ---------- */
  var SKILL_INFO = {
    "JavaScript": "The programming language of the web browser. Used for the front end of the flight dashboard, and for the interactive parts of this page.",
    "MySQL": "A relational database. Used as the database of the flight dashboard.",
    "Python": "A general-purpose programming language, widely used for data analysis and back-end development.",
    "C++": "A compiled, general-purpose language used for performance-sensitive software.",
    "Java": "An object-oriented language used for applications and back-end systems.",
    "R": "A language built for statistics and data analysis.",
    "Chart.js": "A JavaScript library for drawing charts in the browser. Used for the interactive charts in the flight dashboard.",
    "Data visualization": "Turning numbers into charts and visuals so that patterns are easy to see.",
    "Microsoft Power BI": "A Microsoft tool for building business dashboards and reports from data.",
    "Tableau": "A tool for building interactive data visualisations and dashboards.",
    "Predictive modeling": "Using past data to estimate what might happen next.",
    "FastAPI": "A Python web framework for building APIs. Used to build the flight dashboard.",
    "React": "A JavaScript library for building user interfaces out of reusable components.",
    "Node.js": "A runtime that lets JavaScript run on a server instead of only in the browser.",
    "Express": "A minimal web framework for Node.js, used to build servers and APIs.",
    "AWS": "Amazon's cloud platform, offering computing, storage and databases on demand.",
    "Prompt engineering": "Writing clear instructions for AI language models so that the output is useful and reliable."
  };
  function initSkills() {
    var map = $("#skillmap"), panel = $("#skill-info"); if (!map || !panel) return;
    var tags = $$(".tag[data-skill]", map), clusters = $$(".cluster", map), hub = $("#hub"), svg = $("#map-lines");
    var NS = "http://www.w3.org/2000/svg", paths = [];

    function drawLines() {
      if (!svg || !hub) return;
      while (svg.firstChild) svg.removeChild(svg.firstChild); paths = [];
      if (getComputedStyle(svg).display === "none") return;
      var mr = map.getBoundingClientRect(), hr = hub.getBoundingClientRect();
      var hx = hr.left - mr.left + hr.width / 2, hy = hr.top - mr.top + hr.height / 2;
      svg.setAttribute("viewBox", "0 0 " + mr.width + " " + mr.height);
      clusters.forEach(function (cl) {
        var r = cl.getBoundingClientRect(), cx = r.left - mr.left + r.width / 2, cy = r.top - mr.top + r.height / 2;
        var ex = cx < hx ? r.right - mr.left : r.left - mr.left;
        var p = document.createElementNS(NS, "path");
        p.setAttribute("d", "M" + hx + " " + hy + " C" + ((hx + ex) / 2) + " " + hy + " " + ((hx + ex) / 2) + " " + cy + " " + ex + " " + cy);
        p.dataset.cluster = cl.getAttribute("data-cluster"); svg.appendChild(p); paths.push(p);
      });
    }
    function select(tag) {
      tags.forEach(function (t) { t.setAttribute("aria-pressed", String(t === tag)); });
      var cl = tag.closest(".cluster"), name = tag.getAttribute("data-skill"), cname = cl.getAttribute("data-cluster");
      clusters.forEach(function (c) { c.classList.toggle("on", c === cl); });
      paths.forEach(function (p) { p.classList.toggle("on", p.dataset.cluster === cname); });
      var used = tag.getAttribute("data-used") === "1";
      panel.textContent = "";
      var h = document.createElement("h3"); h.textContent = name;
      var m = document.createElement("p"); m.className = "meta"; m.textContent = cname + " · " + (used ? "Used in a project on this page" : "Not shown in a project on this page");
      var d = document.createElement("p"); d.textContent = SKILL_INFO[name] || "";
      panel.appendChild(h); panel.appendChild(m); panel.appendChild(d);
    }
    tags.forEach(function (t) { t.setAttribute("aria-pressed", "false"); t.addEventListener("click", function () { select(t); }); });
    drawLines();
    if ("ResizeObserver" in window) new ResizeObserver(function () { drawLines(); }).observe(map);
    window.addEventListener("load", drawLines);
  }


  [initReveal, initCopy, initYear, initPolaroids, initHoverwords, initAnnotations, initEgg, initSpotlight, initProjects, initSkills, initStages].forEach(function (fn) {
    try { fn(); } catch (err) { if (window.console) console.warn("[portfolio] " + fn.name + " failed:", err); }
  });
})();
