/* =====================================================================
   Janak Chauhan: portfolio features
   Command center, developer terminal, project view, presentation mode,
   keyboard shortcuts. Everything reads the content that is already on
   the page, so the text is written once, in index.html.
   ===================================================================== */
(function () {
  "use strict";
  var JC = (window.JC = window.JC || {});
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = function () { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  function txt(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }
  function mk(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- project data, read from the page ---------- */
  function getProjects() {
    return $$(".pcard").map(function (c) {
      var img = $("img", c), dl = $(".pcard-actions a[href$='.mp4']", c);
      return {
        id: c.getAttribute("data-id"),
        title: txt($("h3", c)), tagline: txt($(".project-tagline", c)),
        types: $$(".p-types li", c).map(txt), text: $$(".p-text", c).map(txt),
        ticks: $$(".ticks li", c).map(txt), stack: $$(".p-stack li", c).map(txt),
        demo: txt($(".p-demo", c)), hasVideo: c.getAttribute("data-video") === "1",
        poster: img ? img.getAttribute("src") : "", posterAlt: img ? img.getAttribute("alt") : "",
        mp4: dl ? dl.getAttribute("href") : "", webm: dl ? dl.getAttribute("href").replace(/\.mp4$/, ".webm") : ""
      };
    });
  }
  function chips(list, cls) { var u = mk("ul", "chips"); list.forEach(function (t) { u.appendChild(mk("li", cls || "chip", t)); }); return u; }
  function ticks(list) { var u = mk("ul", "ticks"); list.forEach(function (t) { u.appendChild(mk("li", "", t)); }); return u; }
  function media(p) {
    if (p.hasVideo) {
      var v = document.createElement("video");
      v.controls = true; v.preload = "metadata"; v.playsInline = true; v.poster = p.poster; v.setAttribute("aria-label", p.title + " demo recording, 20 seconds, no sound");
      [[p.mp4, "video/mp4"], [p.webm, "video/webm"]].forEach(function (s) { var so = document.createElement("source"); so.src = s[0]; so.type = s[1]; v.appendChild(so); });
      v.appendChild(document.createTextNode("Your browser can't play this video. "));
      var a = mk("a", "", "Download the clip instead."); a.href = p.mp4; v.appendChild(a);
      return v;
    }
    var art = mk("div", "art"); art.setAttribute("aria-hidden", "true"); art.appendChild(mk("b", "", p.title)); return art;
  }
  function stopMedia(root) { $$("video", root).forEach(function (v) { try { v.pause(); } catch (e) {} }); }

  /* ---------- go to a section ---------- */
  function go(id) {
    var s = document.getElementById(id); if (!s) return;
    s.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
    setTimeout(function () { try { s.focus({ preventScroll: true }); } catch (e) {} }, reduce() ? 0 : 450);
  }

  /* ---------- dialogs (native <dialog>: focus trap, Esc, inert page) ---------- */
  var opener = null;
  function openDialog(d, from) {
    opener = from || document.activeElement;
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
  }
  function afterClose(d) { stopMedia(d); d.textContent = ""; if (opener && opener.focus) { try { opener.focus(); } catch (e) {} } }

  /* project view */
  var detail = $("#detail");
  function openDetail(id, from) {
    if (!detail) return;
    var p = getProjects().filter(function (x) { return x.id === id; })[0]; if (!p) return;
    detail.textContent = "";
    var wrap = mk("div", "sheet-in"), left = mk("div", "sheet-media"), right = mk("div", "sheet-text");
    left.appendChild(media(p));
    var close = mk("button", "x sheet-close", "×"); close.type = "button"; close.setAttribute("aria-label", "Close project view");
    close.addEventListener("click", function () { detail.close(); });
    right.appendChild(close);
    right.appendChild(chips(p.types));
    right.appendChild(mk("h2", "", p.title));
    right.appendChild(mk("p", "project-tagline", p.tagline));
    p.text.forEach(function (t) { right.appendChild(mk("p", "p-text", t)); });
    if (p.ticks.length) { right.appendChild(mk("h3", "sub", "What it does")); right.appendChild(ticks(p.ticks)); }
    if (p.stack.length) { right.appendChild(mk("h3", "sub", "Built with")); right.appendChild(chips(p.stack, "chip chip-mono")); }
    if (p.demo) { right.appendChild(mk("h3", "sub", "About the demo")); right.appendChild(mk("p", "p-demo", p.demo)); }
    wrap.appendChild(left); wrap.appendChild(right); detail.appendChild(wrap);
    openDialog(detail, from);
    close.focus();
  }
  if (detail) {
    detail.addEventListener("click", function (e) { if (e.target === detail) detail.close(); });
    detail.addEventListener("close", function () { afterClose(detail); });
  }

  /* presentation mode */
  var pres = $("#present"), pi = 0, slides = [];
  var pEls = {};
  function buildPres() {
    pres.textContent = "";
    var wrap = mk("div", "pres-wrap"), top = mk("div", "pres-top"), bot = mk("div", "pres-bot");
    pEls.count = mk("span", "pres-count");
    pEls.exit = mk("button", "btn btn-ghost btn-sm", "Exit (Esc)"); pEls.exit.type = "button";
    pEls.exit.addEventListener("click", function () { pres.close(); });
    top.appendChild(pEls.count); top.appendChild(pEls.exit);
    pEls.slide = mk("div", "pres-slide"); pEls.slide.setAttribute("aria-live", "polite");
    pEls.prev = mk("button", "btn btn-ghost", "‹ Previous"); pEls.prev.type = "button";
    pEls.next = mk("button", "btn btn-primary", "Next ›"); pEls.next.type = "button";
    pEls.prev.addEventListener("click", function () { showSlide(pi - 1); });
    pEls.next.addEventListener("click", function () { showSlide(pi + 1); });
    pEls.dots = mk("div", "pres-dots");
    slides.forEach(function (p, i) {
      var b = mk("button"); b.type = "button"; b.setAttribute("aria-label", "Go to project " + (i + 1) + ": " + p.title);
      b.addEventListener("click", function () { showSlide(i); }); pEls.dots.appendChild(b);
    });
    var nav = mk("div", "pres-nav"); nav.appendChild(pEls.prev); nav.appendChild(pEls.next);
    bot.appendChild(pEls.dots); bot.appendChild(nav);
    wrap.appendChild(top); wrap.appendChild(pEls.slide); wrap.appendChild(bot); pres.appendChild(wrap);
  }
  function showSlide(i) {
    if (i < 0 || i >= slides.length) return;
    pi = i; var p = slides[i];
    stopMedia(pEls.slide); pEls.slide.textContent = "";
    var m = mk("div", "pres-media"); m.appendChild(media(p));
    var t = mk("div", "pres-text");
    t.appendChild(chips(p.types)); t.appendChild(mk("h2", "", p.title)); t.appendChild(mk("p", "project-tagline", p.tagline));
    p.text.forEach(function (x) { t.appendChild(mk("p", "", x)); });
    if (p.ticks.length) t.appendChild(ticks(p.ticks));
    if (p.stack.length) t.appendChild(chips(p.stack, "chip chip-mono"));
    pEls.slide.appendChild(m); pEls.slide.appendChild(t);
    pEls.count.textContent = "Presentation · " + (i + 1) + " / " + slides.length;
    pEls.prev.disabled = i === 0; pEls.next.disabled = i === slides.length - 1;
    pEls.prev.style.opacity = pEls.prev.disabled ? ".4" : ""; pEls.next.style.opacity = pEls.next.disabled ? ".4" : "";
    if (document.activeElement && document.activeElement.disabled) (i === 0 ? pEls.next : pEls.prev).focus();
    $$("button", pEls.dots).forEach(function (b, k) { if (k === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
    pEls.slide.scrollTop = 0;
  }
  function openPres(from) {
    if (!pres) return;
    slides = getProjects(); if (!slides.length) return;
    buildPres(); showSlide(0); openDialog(pres, from); pEls.next.focus();
  }
  if (pres) {
    /* listen on the document so the arrows still work when a focused button becomes disabled */
    document.addEventListener("keydown", function (e) {
      if (!pres.open || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); showSlide(pi + 1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); showSlide(pi - 1); }
      else if (e.key === "Home") { e.preventDefault(); showSlide(0); }
      else if (e.key === "End") { e.preventDefault(); showSlide(slides.length - 1); }
    });
    pres.addEventListener("close", function () { afterClose(pres); });
  }

  /* ---------- command center ---------- */
  var cc = $("#cc"), ccBtn = $("#cc-open");
  function setCC(open) {
    if (!cc || !ccBtn) return;
    cc.hidden = !open; ccBtn.setAttribute("aria-expanded", String(open));
    if (open) { var first = $("button[data-action]", cc); if (first) first.focus(); }
  }
  function toggleCC() { setCC(cc.hidden); }
  if (cc && ccBtn) {
    ccBtn.addEventListener("click", toggleCC);
    cc.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.stopPropagation(); setCC(false); ccBtn.focus(); } });
    $("[data-cc-close]", cc).addEventListener("click", function () { setCC(false); ccBtn.focus(); });
    document.addEventListener("pointerdown", function (e) { if (!cc.hidden && !e.target.closest(".dock")) setCC(false); });
  }

  /* ---------- developer terminal ---------- */
  var term = $("#term"), out = $("#term-out"), form = $("#term-form"), input = $("#term-in");
  var hist = [], hpos = 0, termOpener = null, welcomed = false;
  function ln(text, cls) { var s = mk("span", "ln" + (cls ? " " + cls : ""), text); out.appendChild(s); return s; }
  function lnLink(label, href, after) {
    var s = mk("span", "ln"); s.appendChild(document.createTextNode(label));
    var a = mk("a", "", href.replace(/^mailto:/, "")); a.href = href; if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
    s.appendChild(a); out.appendChild(s);
  }
  function blank() { out.appendChild(mk("span", "ln", " ")); }
  var COMMANDS = {
    help: function () {
      ln("Available commands:", "hl");
      [["help", "show this list"], ["about", "who I am"], ["skills", "skills by category"], ["projects", "my projects"], ["contact", "how to reach me"], ["clear", "clear the screen"], ["exit", "close the terminal"]]
        .forEach(function (c) { ln("  " + c[0] + (c[0].length < 9 ? new Array(10 - c[0].length).join(" ") : " ") + c[1]); });
    },
    about: function () {
      ln(txt($("#about .big")), "hl"); ln(txt($("#about .big ~ .soft"))); blank();
      ln("Education: " + txt($(".edu-name")) + ", " + txt($(".edu .soft")), "dim");
    },
    skills: function () {
      $$(".cluster").forEach(function (c) {
        var items = $$(".tag", c).map(function (t) { return t.getAttribute("data-skill") + (t.getAttribute("data-used") === "1" ? "*" : ""); });
        ln(txt($("h3", c)) + ": ", "hl"); ln("  " + items.join(", "));
      });
      blank(); ln("* used in the flight dashboard. The others are skills not shown in a project on this page.", "dim");
    },
    projects: function () {
      getProjects().forEach(function (p, i) {
        ln((i + 1) + ". " + p.title + "  [" + p.types.join(", ") + "]", "hl"); ln("   " + p.tagline);
        if (p.stack.length) ln("   Built with: " + p.stack.join(", "), "dim");
      });
      blank(); ln("Open the Projects section for details, or press R for presentation mode.", "dim");
    },
    contact: function () {
      var mail = $("a.email"), gh = $("#contact a[href^='https://github.com']");
      if (mail) lnLink("Email:   ", mail.getAttribute("href")); if (gh) lnLink("GitHub:  ", gh.getAttribute("href"));
    },
    clear: function () { out.textContent = ""; },
    exit: function () { closeTerm(); }
  };
  function run(raw) {
    var line = raw.trim(); if (!line) return;
    ln("$ " + line, "cmd");
    var parts = line.split(/\s+/), name = parts[0].toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(COMMANDS, name)) { ln("command not found: " + parts[0].slice(0, 40) + ". Type help to see the available commands.", "err"); }
    else if (parts.length > 1) { ln("'" + name + "' does not take any arguments. Just type " + name + ".", "err"); }
    else COMMANDS[name]();
    out.scrollTop = out.scrollHeight;
  }
  function openTerm(from) {
    if (!term) return;
    termOpener = from || document.activeElement; term.hidden = false;
    if (!welcomed) { welcomed = true; ln("Demo terminal. It only prints what is on this page: there is no server and no access to your system.", "dim"); ln("Type help to begin.", "dim"); }
    input.focus();
  }
  function closeTerm() { if (!term) return; term.hidden = true; if (termOpener && termOpener.focus && document.contains(termOpener)) termOpener.focus(); }
  if (term) {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); var v = input.value; if (v.trim()) { hist.push(v); } hpos = hist.length; input.value = ""; run(v);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp") { e.preventDefault(); if (hpos > 0) { hpos--; input.value = hist[hpos]; } }
      else if (e.key === "ArrowDown") { e.preventDefault(); if (hpos < hist.length - 1) { hpos++; input.value = hist[hpos]; } else { hpos = hist.length; input.value = ""; } }
      else if (e.key === "Tab" && input.value.trim() && !e.shiftKey) {
        var m = Object.keys(COMMANDS).filter(function (c) { return c.indexOf(input.value.trim().toLowerCase()) === 0; });
        if (m.length === 1) { e.preventDefault(); input.value = m[0]; }
      }
    });
    term.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.stopPropagation(); closeTerm(); } });
    $("[data-term-close]", term).addEventListener("click", closeTerm);
    term.addEventListener("click", function (e) { if (!e.target.closest("a,button,input") && !window.getSelection().toString()) input.focus(); });
  }

  /* ---------- wiring ---------- */
  var ACTIONS = {
    about: function () { go("about"); }, projects: function () { go("work"); }, skills: function () { go("skills"); },
    contact: function () { go("contact"); },
    terminal: function (f) { if (term && term.hidden) openTerm(f); else if (term) input.focus(); },
    present: function (f) { openPres(f); }, commands: function () { toggleCC(); }
  };
  JC.actions = ACTIONS; JC.getProjects = getProjects;

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-action]"), o = e.target.closest("[data-open]");
    if (o) { openDetail(o.getAttribute("data-open"), o); return; }
    if (!a) return;
    var fn = ACTIONS[a.getAttribute("data-action")]; if (!fn) return;
    if (a.closest("#cc")) { setCC(false); }
    fn(a.closest("#cc") ? ccBtn : a);
  });

  /* keyboard shortcuts: only plain keys, never while typing or inside a dialog */
  var KEYS = { a: "about", p: "projects", s: "skills", t: "terminal", r: "present", c: "contact", k: "commands", "?": "commands" };
  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
    if (document.querySelector("dialog[open]")) return;
    var name = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key]; if (!name) return;
    e.preventDefault(); ACTIONS[name](document.activeElement);
  });
})();
