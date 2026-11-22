(function () {
  "use strict";

  var D = window.SAAR_DATA;
  var STORE_KEY = "saar.prototype.v1";
  var TABS = ["home", "drawer", "orders", "about"];
  var CODES = D.roles.map(function (r) { return r.code; });
  var LOW = 25;

  var $ = function (id) { return document.getElementById(id); };
  var els = {
    app: $("app"), views: $("views"), tabbar: $("tabbar"), scrim: $("scrim"), sheet: $("sheet"),
    content: $("sheetContent"), grab: $("sheetGrab"), toast: $("toast"), video: $("heroVideo")
  };

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function cuisine(id) { return D.cuisines.filter(function (c) { return c.id === id; })[0]; }
  function role(code) { return D.roles.filter(function (r) { return r.code === code; })[0]; }
  function lid(code) { return '<span class="lid" aria-hidden="true">' + esc(code) + "</span>"; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function fmtDate(iso) {
    var p = String(iso).split("-");
    var m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][+p[1] - 1];
    return +p[2] + " " + m + " " + p[0];
  }

  /* ---------- state (localStorage, always guarded) ---------- */
  function defaults() {
    return { cuisineId: D.drawer.cuisineId, since: D.drawer.since, fills: Object.assign({}, D.drawer.fills), orders: [] };
  }
  function load() {
    var s = defaults();
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (saved && typeof saved === "object") {
        if (cuisine(saved.cuisineId)) s.cuisineId = saved.cuisineId;
        if (/^\d{4}-\d{2}-\d{2}$/.test(saved.since)) s.since = saved.since;
        if (saved.fills) CODES.forEach(function (c) {
          var v = Number(saved.fills[c]);
          if (isFinite(v) && v >= 0 && v <= 100) s.fills[c] = v;
        });
        if (Array.isArray(saved.orders)) {
          s.orders = saved.orders.filter(function (o) { return o && cuisine(o.cuisineId) && o.date && o.ref; });
        }
      }
    } catch (e) { /* private mode or corrupt data: run from defaults */ }
    return s;
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* keep working in memory */ }
  }
  var state = load();

  function allOrders() {
    var mine = state.orders.map(function (o) { return Object.assign({ mine: true }, o); });
    var samples = D.sampleOrders.map(function (o) { return Object.assign({ mine: false }, o); });
    return mine.concat(samples).sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return (b.mine ? 1 : 0) - (a.mine ? 1 : 0);
    });
  }

  /* ---------- rendering ---------- */
  function renderCuisines() {
    $("cuisineList").innerHTML = D.cuisines.map(function (c) {
      var dots = "";
      for (var i = 0; i < 6; i++) dots += '<span class="lid lid--xs"></span>';
      return '<button class="card" data-cuisine="' + esc(c.id) + '" aria-haspopup="dialog"><span><h3>' + esc(c.name) + "</h3>" +
        '<p class="card__note">' + esc(c.note) + "</p>" +
        (c.id === state.cuisineId ? '<span class="card__now">In your drawer</span>' : "") +
        '</span><span class="mini-tray" aria-hidden="true">' + dots + "</span></button>";
    }).join("");
  }

  function wrapWords(text) {
    var lines = [], line = "";
    text.split(" ").forEach(function (w) {
      if (line && (line + " " + w).length > 12) { lines.push(line); line = w; }
      else line = line ? line + " " + w : w;
    });
    lines.push(line);
    return lines.slice(0, 3);
  }

  function trayDiagram(c) {
    var radii = [46, 49, 52], gap = 4, W = 334, spineTop = 116, spineBottom = 124, h = 240;
    var used = radii.reduce(function (a, r) { return a + r * 2; }, 0) + gap * 2;
    var x = (W - used) / 2, xs = radii.map(function (r) { var cx = x + r; x += r * 2 + gap; return cx; });
    var out = '<svg class="tray" viewBox="0 0 ' + W + " " + h + '" role="group" aria-label="Top-down view of the SAAR tray">' +
      '<defs><radialGradient id="alu" cx="42%" cy="34%" r="78%"><stop offset="0" stop-color="#f5f4f1"/><stop offset=".62" stop-color="#d9d9d5"/><stop offset="1" stop-color="#b9b9b5"/></radialGradient></defs>' +
      '<line x1="5" y1="120" x2="' + (W - 5) + '" y2="120" stroke="#b8b8b4" stroke-width="2.4" stroke-linecap="round"/>';
    D.trayLayout.forEach(function (row, rIdx) {
      row.forEach(function (code, i) {
        var r = radii[i], cx = xs[i], cy = rIdx === 0 ? spineTop - r : spineBottom + r;
        var fill = state.fills[code], spice = c.spices[code], lines = wrapWords(cap(spice.name));
        var y0 = cy - 6 - (lines.length - 1) * 5;
        var txt = lines.map(function (l, n) {
          return '<text class="tray__spice" x="' + cx + '" y="' + (y0 + 15 + n * 11) + '">' + esc(l) + "</text>";
        }).join("");
        out += '<g class="tray__lid" data-lid="' + code + '" tabindex="0" role="button" aria-label="' +
          esc(code + ", " + spice.name + ", " + fill + " percent full") + '">' +
          '<circle class="tray__sel" cx="' + cx + '" cy="' + cy + '" r="' + (r - .5) + '" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>' +
          '<circle class="tray__disc" cx="' + cx + '" cy="' + cy + '" r="' + (r - 7) + '" fill="url(#alu)" stroke="#8f8f8b" stroke-width=".6"/>' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 3.5) + '" fill="none" stroke="#6d6c69" stroke-width="2.6"/>' +
          '<circle class="tray__arc" cx="' + cx + '" cy="' + cy + '" r="' + (r - 3.5) + '" fill="none" stroke="' + (fill < LOW ? "#f0a52a" : "#e8e7e3") +
          '" stroke-width="2.6" stroke-linecap="round" pathLength="100" stroke-dasharray="' + fill + ' 100" transform="rotate(-90 ' + cx + " " + cy + ')"/>' +
          '<text class="tray__code" x="' + cx + '" y="' + y0 + '">' + code + "</text>" + txt + "</g>";
      });
    });
    return out + "</svg>";
  }

  function renderDrawer() {
    var c = cuisine(state.cuisineId);
    var rows = CODES.map(function (code) {
      var f = state.fills[code], low = f < LOW;
      return '<button class="fill-row" data-row="' + code + '">' + lid(code) +
        '<span class="fill-row__main"><span class="fill-row__top"><span class="fill-row__name">' + esc(cap(c.spices[code].name)) +
        '</span><span class="fill-row__pct' + (low ? " is-low" : "") + '">' + (low ? "Low · " : "") + f + '%</span></span>' +
        '<span class="spice__role">' + esc(role(code).role) + '</span><div class="bar"><i class="' + (low ? "is-low" : "") + '" style="width:' + f + '%"></i></div></span></button>';
    }).join("");
    $("drawerPage").innerHTML =
      '<p class="eyebrow">In my drawer</p><h2>' + esc(c.name) + " set</h2>" +
      '<div class="tray-wrap">' + trayDiagram(c) + "</div>" +
      '<div class="meta"><div><div class="meta__k">Set in use since</div><div class="meta__v">' + fmtDate(state.since) + "</div></div>" +
      '<button class="btn btn--outline" data-action="change-set" aria-haspopup="dialog">Change set</button></div>' +
      '<p class="section-label">Fill levels</p><div>' + rows + "</div>" +
      '<p class="footnote">Fill levels are illustrative in this prototype.</p>';
  }

  function renderOrders() {
    var list = allOrders(), last = list[0];
    var lastC = cuisine(last.cuisineId);
    var tag = function (o) { return '<span class="demo-tag">' + (o.mine ? "Demo order" : "Sample data") + "</span>"; };
    $("ordersPage").innerHTML =
      '<p class="eyebrow">Orders</p><h2>Your refills</h2>' +
      '<p class="lede">Everything here is demo data. No real orders are placed.</p>' +
      '<div class="last-order"><div class="last-order__top"><span class="last-order__k">Last ordered</span>' + tag(last) + "</div>" +
      '<div class="last-order__date">' + fmtDate(last.date) + "</div>" +
      '<div class="last-order__set">' + esc(lastC.name) + " set · " + esc(last.ref) + "</div>" +
      '<div class="lid-row">' + CODES.map(lid).join("") + "</div></div>" +
      '<p class="section-label">History</p><div>' + list.map(function (o) {
        return '<div class="history-item"><div><div class="history-item__name">' + esc(cuisine(o.cuisineId).name) + '</div><div class="history-item__sub">' +
          fmtDate(o.date) + " · " + esc(o.ref) + "</div></div>" + tag(o) + "</div>";
      }).join("") + "</div>";
  }

  function renderAbout() {
    var story = [
      ["The tea caddy", "The ring tops come from the Indian tea caddy, the round chai holder carried from stall to stall."],
      ["The tiffin", "The folding handle comes from the Mumbai tiffin box, made to be lifted, carried and set down again."],
      ["The b3 drawer", "A 3 mm aluminium wire tray sits in the double-V of a bulthaup b3 drawer, holding six lidded containers, three on each side."]
    ];
    $("aboutPage").innerHTML =
      '<p class="eyebrow">About</p><h2>A contemporary spice storage object</h2>' +
      '<div class="story">' + story.map(function (s, i) {
        return "<article><span>" + (i + 1) + "</span><h3>" + esc(s[0]) + "</h3><p>" + esc(s[1]) + "</p></article>";
      }).join("") + "</div>" +
      '<p class="section-label">The lid codes</p>' +
      '<p class="lede" style="margin:0 0 6px;max-width:none">Each lid carries a dabbawala-style code that never changes, so every spice set fills the same six roles. An NFC tag in the lid opens this page.</p>' +
      '<div class="codes">' + D.roles.map(function (r) {
        return '<div class="code-row">' + lid(r.code) + "<div><b>" + esc(r.role) + "</b><small>" + esc(r.meaning) + "</small></div></div>";
      }).join("") + "</div>" +
      '<p class="credit">' + esc(D.credit) + "</p>";
  }

  function renderAll() { renderCuisines(); renderDrawer(); renderOrders(); }

  /* ---------- tabs ---------- */
  var currentTab = "home";
  function syncVideo() {
    var v = els.video;
    if (!v) return;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (currentTab === "home" && !document.hidden && !reduce) {
      v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () { /* Low Power Mode: the poster stays visible */ });
    } else { v.pause(); }
  }
  function setTab(tab, opts) {
    if (TABS.indexOf(tab) < 0) tab = "home";
    var again = tab === currentTab;
    currentTab = tab;
    TABS.forEach(function (t) { $("view-" + t).classList.toggle("is-active", t === tab); });
    els.tabbar.querySelectorAll(".tab").forEach(function (b) {
      var on = b.dataset.tab === tab;
      b.classList.toggle("is-active", on);
      if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    if (again && !(opts && opts.keepScroll)) $("view-" + tab).scrollTo({ top: 0, behavior: "smooth" });
    if (location.hash !== "#" + tab) {
      try { history.replaceState(history.state, "", "#" + tab); } catch (e) { /* file:// */ }
    }
    syncVideo();
  }

  /* ---------- bottom sheet ---------- */
  var sheetOpen = false, lastFocus = null, pendingTab = null, sheetPushed = false;
  function showSheet(html, label) {
    els.content.innerHTML = html;
    els.content.style.animation = "none";
    void els.content.offsetWidth;
    els.content.style.animation = "";
    els.sheet.setAttribute("aria-label", label);
    if (!sheetOpen) {
      lastFocus = document.activeElement;
      sheetOpen = true;
      els.scrim.classList.add("is-open");
      els.sheet.classList.add("is-open");
      els.sheet.setAttribute("aria-hidden", "false");
      els.views.inert = true;
      els.tabbar.inert = true;
      try { history.pushState({ sheet: true }, "", location.hash || "#" + currentTab); sheetPushed = true; } catch (e) { sheetPushed = false; }
    }
    els.sheet.focus({ preventScroll: true });
  }
  function hideSheet(fromHistory) {
    if (!sheetOpen) return;
    sheetOpen = false;
    els.sheet.style.transform = "";
    els.scrim.style.opacity = "";
    els.scrim.classList.remove("is-open");
    els.sheet.classList.remove("is-open");
    els.sheet.setAttribute("aria-hidden", "true");
    els.views.inert = false;
    els.tabbar.inert = false;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    if (!fromHistory && sheetPushed) { sheetPushed = false; history.back(); }
    else { sheetPushed = false; if (pendingTab) { setTab(pendingTab); pendingTab = null; } }
  }
  function closeThenGo(tab) {
    if (sheetPushed) { pendingTab = tab; hideSheet(); setTab(tab, { keepScroll: true }); }
    else { hideSheet(); setTab(tab, { keepScroll: true }); }
    $("view-" + tab).scrollTop = 0;
  }

  function openCuisine(id) {
    var c = cuisine(id);
    if (!c) return;
    showSheet(
      '<div class="sheet__head"><p class="eyebrow" style="margin-bottom:2px">Spice set</p><h2>' + esc(c.name) + "</h2><p>" + esc(c.note) + "</p></div>" +
      '<div class="sheet__body">' + CODES.map(function (code) {
        var s = c.spices[code];
        return '<div class="spice">' + lid(code) + '<div><div class="spice__role">' + esc(code) + " · " + esc(role(code).role) +
          '</div><div class="spice__name">' + esc(cap(s.name)) + '</div><div class="spice__flavour">' + esc(s.flavour) + "</div></div></div>";
      }).join("") + "</div>" +
      '<div class="sheet__foot"><button class="btn btn--primary" data-action="order" data-id="' + esc(c.id) + '">Order this set</button></div>',
      c.name + " spice set");
  }

  function placeDemoOrder(id) {
    var c = cuisine(id), n = state.orders.length + 1;
    var order = { ref: "DEMO-" + pad(n) + String(Date.now()).slice(-3), cuisineId: id, date: todayISO() };
    state.orders.unshift(order);
    save();
    renderOrders();
    showSheet(
      '<div class="confirm"><span class="lid" aria-hidden="true"></span><h3>Thank you for exploring</h3>' +
      "<p>SAAR is a design prototype. No order has been placed and nothing will be charged or sent.</p>" +
      '<p class="confirm__ref">Saved as a demo order<br>' + esc(c.name) + ' set · <span class="nowrap">' + esc(order.ref) + "</span></p></div>" +
      '<div class="sheet__foot sheet__foot--plain"><button class="btn btn--primary" data-action="view-orders">View in Orders</button>' +
      '<button class="btn btn--ghost" data-action="close">Keep exploring</button></div>',
      "Prototype notice");
  }

  function openChangeSet() {
    showSheet(
      '<div class="sheet__head"><h2>Change set</h2><p>Choose what is in your drawer now.</p></div>' +
      '<div class="sheet__body">' + D.cuisines.map(function (c) {
        var on = c.id === state.cuisineId;
        return '<button class="choice" data-action="pick-set" data-id="' + esc(c.id) + '"' + (on ? ' aria-current="true"' : "") + '><span><div class="choice__name">' + esc(c.name) +
          '</div><div class="choice__sub">' + esc(c.note) + "</div></span>" +
          (on ? '<svg class="icon choice__tick" viewBox="0 0 24 24" aria-label="Current set"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : "") + "</button>";
      }).join("") + '</div><div class="sheet__foot sheet__foot--plain" style="height:calc(var(--safe-b) + 14px);padding:0"></div>',
      "Change set");
  }

  function pickSet(id) {
    if (id !== state.cuisineId) {
      state.cuisineId = id;
      state.since = todayISO();
      CODES.forEach(function (c) { state.fills[c] = 100; });
      save();
      renderAll();
      toast(cuisine(id).name + " set is now in your drawer");
    }
    hideSheet();
  }

  var toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove("is-on"); }, 2600);
  }

  function selectLid(code) {
    var page = $("drawerPage");
    page.querySelectorAll("[data-lid]").forEach(function (g) { g.classList.toggle("is-selected", g.getAttribute("data-lid") === code); });
    page.querySelectorAll("[data-row]").forEach(function (r) {
      var on = r.getAttribute("data-row") === code;
      r.classList.toggle("is-selected", on);
      if (on) r.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target : e.target.parentNode;
    var tabBtn = t.closest(".tab");
    if (tabBtn) return setTab(tabBtn.dataset.tab);
    var card = t.closest("[data-cuisine]");
    if (card) return openCuisine(card.dataset.cuisine);
    var g = t.closest("[data-lid]");
    if (g) return selectLid(g.getAttribute("data-lid"));
    var row = t.closest("[data-row]");
    if (row) return selectLid(row.getAttribute("data-row"));
    if (t.closest("#heroCue")) return $("cuisines").scrollIntoView({ behavior: "smooth", block: "start" });
    var a = t.closest("[data-action]");
    if (!a) return;
    var act = a.dataset.action;
    if (act === "order") placeDemoOrder(a.dataset.id);
    else if (act === "change-set") openChangeSet();
    else if (act === "pick-set") pickSet(a.dataset.id);
    else if (act === "view-orders") closeThenGo("orders");
    else if (act === "close") hideSheet();
  });
  els.scrim.addEventListener("click", function () { hideSheet(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hideSheet();
    if ((e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest("[data-lid]")) {
      e.preventDefault();
      selectLid(e.target.closest("[data-lid]").getAttribute("data-lid"));
    }
  });

  window.addEventListener("popstate", function () {
    if (sheetOpen) { sheetPushed = false; hideSheet(true); return; }
    if (pendingTab) { var p = pendingTab; pendingTab = null; setTab(p, { keepScroll: true }); return; }
    setTab(location.hash.slice(1) || "home", { keepScroll: true });
  });
  window.addEventListener("hashchange", function () {
    var h = location.hash.slice(1);
    if (TABS.indexOf(h) >= 0 && h !== currentTab) setTab(h, { keepScroll: true });
  });
  document.addEventListener("visibilitychange", syncVideo);
  /* If the browser refused autoplay, start on the first touch. */
  ["touchstart", "click"].forEach(function (ev) {
    document.addEventListener(ev, function once() {
      if (els.video && els.video.paused) syncVideo();
      document.removeEventListener(ev, once);
    }, { passive: true });
  });

  /* Drag the handle down to dismiss */
  var dragY = null, dragH = 0;
  els.grab.addEventListener("pointerdown", function (e) {
    dragY = e.clientY; dragH = els.sheet.offsetHeight;
    els.sheet.classList.add("is-dragging");
    els.grab.setPointerCapture(e.pointerId);
  });
  els.grab.addEventListener("pointermove", function (e) {
    if (dragY === null) return;
    var dy = Math.max(0, e.clientY - dragY);
    els.sheet.style.transform = "translateY(" + dy + "px)";
    els.scrim.style.opacity = String(1 - Math.min(1, dy / dragH));
  });
  function endDrag(e) {
    if (dragY === null) return;
    var dy = Math.max(0, e.clientY - dragY);
    dragY = null;
    els.sheet.classList.remove("is-dragging");
    els.sheet.style.transform = "";
    els.scrim.style.opacity = "";
    if (dy > Math.min(120, dragH * .25)) hideSheet();
  }
  els.grab.addEventListener("pointerup", endDrag);
  els.grab.addEventListener("pointercancel", endDrag);

  /* ---------- start ---------- */
  renderAll();
  renderAbout();
  setTab(location.hash.slice(1) || "home", { keepScroll: true });
})();
