(function () {
  "use strict";

  var D = window.PORTFOLIO;
  if (!D) {
    document.body.innerHTML = "<p style='padding:24px;color:#fff'>data.js 未加载</p>";
    return;
  }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var isNarrow = function () { return window.matchMedia("(max-width: 720px)").matches; };
  var motionOK = function () {
    return !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) &&
      typeof Element !== "undefined" && !!Element.prototype.animate;
  };

  /* ---------------- 分类：按 folder 自动归组 ---------------- */

  function categoryGroups() {
    var matched = new Set();
    var groups = (D.categories || []).map(function (c) {
      var items = D.projects.filter(function (p) {
        if (p.folder === c.label) { matched.add(p.id); return true; }
        return false;
      });
      return { label: c.label, note: c.note || "", tone: c.tone || "gray", items: items };
    });
    var rest = D.projects.filter(function (p) { return !matched.has(p.id); });
    if (rest.length) {
      groups.push({ label: "其他", note: "未归类 · 可在 categories 里补一条", tone: "gray", items: rest });
    }
    return groups;
  }

  function ongoing() {
    return D.projects.filter(function (p) { return p.status !== "已完成"; });
  }

  /* ---------------- 合成音效 ---------------- */

  var audioCtx = null;
  function sfxOn() {
    try { return localStorage.getItem("portfolio-sfx") === "1"; } catch (e) { return false; }
  }
  function sfx(kind) {
    if (!sfxOn()) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended") audioCtx.resume();
      var t = audioCtx.currentTime;
      var o = audioCtx.createOscillator();
      var g = audioCtx.createGain();
      o.type = kind === "close" ? "triangle" : "sine";
      o.frequency.setValueAtTime(kind === "close" ? 540 : 620, t);
      o.frequency.exponentialRampToValueAtTime(kind === "close" ? 240 : 920, t + 0.09);
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(t); o.stop(t + 0.14);
    } catch (e) { /* noop */ }
  }

  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 2400);
  }

  /* ---------------- 项目条目 ---------------- */

  function entryHTML(p) {
    return '<button class="entry" type="button" data-open="p:' + esc(p.id) + '">' +
      '<span class="entry-glyph" aria-hidden="true">' + esc(p.icon) + "</span>" +
      '<span class="entry-main"><span class="entry-title">' + esc(p.title) + "</span>" +
      '<span class="entry-sub">' + esc(p.year) + " · " + esc(p.status) + " · " + esc(p.duration) + "</span></span>" +
      '<span class="entry-status ' + (p.status === "已完成" ? "" : "is-open") + '">' + esc(p.status) + "</span>" +
      '<span class="entry-arrow" aria-hidden="true">→</span></button>';
  }

  /* ---------------- 项目详情卡片（扇面质感） ---------------- */

  function projectDetailHTML(p) {
    var idx = D.projects.findIndex(function (x) { return x.id === p.id; });
    var next = D.projects.length ? D.projects[(idx + 1) % D.projects.length] : null;
    var statusClass = p.status === "已完成" ? "is-done" : (p.status === "进行中" ? "is-open" : "");
    var tags = (p.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("");
    var detail = (p.detail || []).map(function (t, i) {
      return '<li><span class="tl-dot" aria-hidden="true"></span><span class="tl-text">' + esc(t) + "</span></li>";
    }).join("");
    var links = (p.links || []).map(function (l) {
      return '<a class="link-btn" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' + esc(l.label) + " ↗</a>";
    }).join("");
    return '<p class="bd-eyebrow">' + esc(p.folder) + " / " + esc(p.year) + "</p>" +
      '<h2 class="bd-title">' + esc(p.title) + "</h2>" +
      '<p class="bd-summary">' + esc(p.summary) + "</p>" +
      '<div class="meta-row"><span class="chip ' + statusClass + '">' + esc(p.status) + "</span>" +
      '<span class="chip">耗时 ' + esc(p.duration) + "</span></div>" +
      (p.highlight ? '<div class="data-strip">' + esc(p.highlight) + "</div>" : "") +
      (tags ? '<div class="tag-row">' + tags + "</div>" : "") +
      (detail ? '<p class="section-label">做了什么</p><ol class="timeline">' + detail + "</ol>" : "") +
      (p.review ? '<p class="section-label">一句话复盘</p><p class="review">' + esc(p.review) + "</p>" : "") +
      (links ? '<p class="section-label">相关链接</p><div class="links-row">' + links + "</div>" : "") +
      (next ? '<div class="bd-foot"><button class="link-btn" data-open="p:' + esc(next.id) + '">下一个项目 → ' + esc(next.icon) + "</button></div>" : "");
  }

  /* 分类详情卡片：该类下所有项目 + 分类说明 */
  function categoryDetailHTML(label) {
    var g = categoryGroups().find(function (x) { return x.label === label; });
    if (!g) return '<p class="bd-summary">这个分类还没有建立。</p>';
    if (!g.label) {
      return '<p class="bd-eyebrow">分类</p>' +
        '<h2 class="bd-title">待填写</h2>' +
        '<p class="bd-summary">这片扇叶的分类名还没填。去 data.js 的 categories 里补一个 label（顺便把 fan.blades 里对应扇叶的 label 改成一样）即可。</p>';
    }
    var rows = g.items.length
      ? g.items.map(entryHTML).join("")
      : '<p class="bd-summary">暂无项目 · 在 data.js 的 projects 里加一条、folder 写「' + esc(label) + '」即可。</p>';
    return '<p class="bd-eyebrow">分类</p>' +
      '<h2 class="bd-title">' + esc(g.label) + "</h2>" +
      (g.note ? '<p class="bd-summary">' + esc(g.note) + "</p>" : "") +
      '<p class="section-label">' + g.items.length + " 个项目</p>" + rows;
  }

  /* 扇叶详情卡片：打开在扇子旁的浮层 */
  var detailFor = null;

  function openBladeDetail(html) {
    var host = $("#bladeDetail");
    var body = $("#bladeDetailBody");
    body.innerHTML = html;
    host.hidden = false;
    requestAnimationFrame(function () { host.classList.add("is-open"); });
  }

  function closeBladeDetail() {
    var host = $("#bladeDetail");
    host.classList.remove("is-open");
    setTimeout(function () {
      host.hidden = true;
      $("#bladeDetailBody").innerHTML = "";
      host.classList.remove("is-lg");
    }, 200);
  }

  /* ---------------- 折扇 ---------------- */

  function fanBladeList() {
    var groups = categoryGroups();
    var conf = (D.fan && D.fan.blades) || [];
    var list = [];
    var usedCats = {};
    // 扇叶头部改用与主题契合的单字徽记（取分类首字），替代原先的项目数
    var THEME_GLYPH = { "设计与表达": "设", "游戏与实验": "戏", "学习经历": "学", "荣誉成绩": "誉" };
    conf.forEach(function (b) {
      if (b.kind === "cat") {
        var g = groups.find(function (x) { return x.label === b.label; });
        var c = (D.categories || []).find(function (x) { return x.label === b.label; });
        if (c || g) {
          usedCats[b.label] = true;
          list.push({
            label: b.label,
            tone: (c && c.tone) || "gray",
            head: THEME_GLYPH[b.label] || "扇",
            sub: (g ? g.items.length : 0) + " 项"
          });
        }
      } else if (b.kind === "zone") {
        var z = D.zones.find(function (x) { return x.id === b.id; });
        if (z) {
          list.push({
            zoneId: z.id,
            tone: "gray",
            head: z.no,
            label: z.title,
            sub: z.en
          });
        }
      }
    });
    (D.categories || []).forEach(function (c) {
      if (usedCats[c.label]) return;
      var g = groups.find(function (x) { return x.label === c.label; });
      list.push({
        label: c.label,
        tone: c.tone || "gray",
        head: THEME_GLYPH[c.label] || "扇",
        sub: (g ? g.items.length : 0) + " 项"
      });
    });
    return list;
  }

  function renderFan() {
    var host = $("#fan");
    if (!host) return;
    var blades = fanBladeList();
    var n = blades.length;
    var spread = (D.fan && D.fan.spread) || 118;
    host.innerHTML = blades.map(function (b, i) {
      var a = n === 1 ? 0 : -spread / 2 + i * (spread / (n - 1));
      var blank = !b.label; // 分类文字尚未填写 → 只留空扇叶，不显示 head/sub 数字文字
      return '<button type="button" class="fan-blade' + (blank ? " is-blank" : "") + '" data-tone="' + esc(b.tone) + '"' +
        ' data-idx="' + i + '"' +
        ' style="--a:' + a.toFixed(1) + "deg;--d:" + (i * 75) + 'ms"' +
        ' aria-label="扇叶：' + (blank ? "待填写" : esc(b.label)) + '">' +
        '<span class="fb-rib" aria-hidden="true"></span>' +
        '<span class="fb-edge" aria-hidden="true"></span>' +
        (blank ? "" : '<span class="fb-head">' + esc(b.head) + "</span>") +
        '<span class="fb-label">' + esc(b.label) + "</span>" +
        (blank ? "" : '<span class="fb-sub">' + esc(b.sub) + "</span>") +
        "</button>";
    }).join("");
    $("#fanCaption").textContent = n + " 叶扇 · " + ((D.fan && D.fan.note) || "");
  }

  function openFan(animated) {
    var stage = $("#fanStage");
    if (!stage) return;
    if (animated && motionOK()) {
      stage.classList.remove("is-open");
      void stage.offsetWidth;
      setTimeout(function () { stage.classList.add("is-open"); }, 30);
    } else {
      stage.classList.add("is-open");
    }
    setFanCollapsed(false);
  }

  function closeFan() {
    var stage = $("#fanStage");
    if (stage) stage.classList.remove("is-open");
  }

  /* 收起/展开折扇：点击扇钉切换 */
  var fanCollapsed = false;
  function setFanCollapsed(collapsed) {
    fanCollapsed = collapsed;
    var stage = $("#fanStage");
    var pivot = $("#fanPivot");
    if (!stage) return;
    stage.classList.toggle("is-collapsed", collapsed);
    if (pivot) {
      pivot.setAttribute("aria-pressed", collapsed ? "true" : "false");
      pivot.title = collapsed ? "展开折扇" : "收起折扇";
    }
    if (collapsed) closeBladeDetail();
  }
  function toggleFan() {
    var going = !fanCollapsed;
    setFanCollapsed(going);
    sfx(going ? "close" : "open");
    toast(going ? "折扇已收起 · 点击扇钉展开" : "折扇已展开");
  }

  /* 扇叶点击：根据扇叶类型打开详情卡片 */
  function onBladeClick(blade) {
    var idx = Number(blade.dataset.idx);
    var list = fanBladeList();
    var b = list[idx];
    if (!b) return;
    sfx("open");
    if (b.zoneId) {
      openBladeDetail(zoneDetailHTML(b.zoneId));
    } else {
      openBladeDetail(categoryDetailHTML(b.label));
    }
  }

  /* 系统扇叶（zone）详情 */
  function zoneDetailHTML(id) {
    if (id === "progress") {
      var list = ongoing().map(entryHTML).join("");
      var sticky = D.notes.length
        ? '<div class="sticky-card" title="可以拖动我 · 扔远点就进回收站"><span class="sticky-head">下次想做的 · sticky note</span>' +
          '<span class="sticky-text">' + esc(D.notes[0] || "") + "</span></div>"
        : '<p class="bd-summary">便签都被揉掉了，去 data.js 的 notes 里补几条。</p>';
      return '<p class="bd-eyebrow">进行中 · In progress</p>' +
        '<h2 class="bd-title">进行中</h2>' +
        '<p class="bd-summary">没做完的，和下一批想做的。</p>' +
        (list || '<p class="bd-summary">目前没有进行中的项目。</p>') + sticky;
    }
    if (id === "archive") {
      var logs = D.changelog.slice(0, 3).map(function (c) {
        return "<li><b>" + esc(c.v) + "</b>" + esc(c.note) + "</li>";
      }).join("");
      return '<p class="bd-eyebrow">归档 · Archive</p>' +
        '<h2 class="bd-title">归档</h2>' +
        '<div class="mini-block"><span class="mini-label">CHANGELOG · 最近更新</span>' +
        '<ul class="mini-list">' + logs + "</ul></div>" +
        '<p class="bd-foot-note">' + esc(D.meta.version) + " · 更新于 " + esc(D.meta.updated) + " · 长期迭代</p>";
    }
    if (id === "about") {
      var az = D.zones.find(function (x) { return x.type === "about"; });
      var a = D.about || {};
      var rowsHtml = (a.rows || []).map(function (r) {
        return '<div class="about-row"><span class="about-key">' + esc(r[0]) + "</span><span class=\"about-val\">" + esc(r[1]) + "</span></div>";
      }).join("");
      var parasHtml = (a.paragraphs || []).map(function (p) {
        return "<p class=\"bd-summary\">" + esc(p) + "</p>";
      }).join("");
      return '<p class="bd-eyebrow">关于我 · About me</p>' +
        '<h2 class="bd-title">' + esc(a.title || "关于我") + "</h2>" +
        (az ? '<p class="bd-summary">' + esc(az.desc) + "</p>" : "") +
        '<div class="about-rows">' + rowsHtml + "</div>" +
        parasHtml;
    }
    if (id === "system") {
      var z = D.zones.find(function (x) { return x.type === "system"; });
      var logs = D.changelog.slice(0, 3).map(function (c) {
        return "<li><b>" + esc(c.v) + "</b>" + esc(c.note) + "</li>";
      }).join("");
      return '<p class="bd-eyebrow">系统 · System</p>' +
        '<h2 class="bd-title">系统</h2>' +
        (z ? '<p class="bd-summary">' + esc(z.desc) + "</p>" : "") +
        '<div class="about-rows">' +
        '<div class="about-row"><span class="about-key">网站名称</span><span class="about-val">张士扬的个人网站</span></div>' +
        '<div class="about-row"><span class="about-key">当前版本</span><span class="about-val">' + esc(D.meta.version) + "</span></div>" +
        '<div class="about-row"><span class="about-key">最近更新</span><span class="about-val">' + esc(D.meta.updated) + "</span></div>" +
        '<div class="about-row"><span class="about-key">状态</span><span class="about-val">长期迭代 · 持续更新</span></div>' +
        "</div>" +
        '<p class="section-label">更新日志</p>' +
        '<ul class="mini-list">' + logs + "</ul>" +
        '<p class="bd-foot-note">' + esc(D.meta.iterationHint) + "</p>";
    }
    return '<p class="bd-summary">未知区块。</p>';
  }

  /* 便签揉团：拖出一段距离松手，揉成一团扔进回收站 */
  function bindSticky() {
    $$(".sticky-card").forEach(function (card) {
      if (card.dataset.bound) return;
      card.dataset.bound = "1";
      var drag = null;
      card.addEventListener("pointerdown", function (ev) {
        if (ev.button !== 0 || ev.target.closest("button, a")) return;
        drag = { sx: ev.clientX, sy: ev.clientY, moved: false };
        try { card.setPointerCapture(ev.pointerId); } catch (e) { /* noop */ }
        card.classList.add("is-held");
      });
      card.addEventListener("pointermove", function (ev) {
        if (!drag) return;
        var dx = ev.clientX - drag.sx, dy = ev.clientY - drag.sy;
        if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
        if (drag.moved) {
          card.style.transform = "translate(" + dx + "px," + dy + "px) rotate(" + (dx / 18) + "deg)";
        }
      });
      function up(ev) {
        if (!drag) return;
        var d = drag;
        drag = null;
        card.classList.remove("is-held");
        var dx = ev.clientX - d.sx, dy = ev.clientY - d.sy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var cur = card.style.transform;
        card.style.transform = "";
        if (d.moved && dist > 140 && motionOK()) {
          sfx("close");
          var anim = card.animate([
            { transform: cur || "none", opacity: 1, filter: "none" },
            { transform: "translate(" + (dx + 40) + "px," + (dy - 30) + "px) scale(.15) rotate(24deg)", opacity: 0, filter: "blur(2px)" }
          ], { duration: 300, easing: "cubic-bezier(.5,0,.8,.4)" });
          var doneDone = false;
          var done = function () {
            if (doneDone) return;
            doneDone = true;
            if (!card.isConnected) return;
            var textEl = $(".sticky-text", card);
            var text = textEl ? textEl.textContent : "一条便签";
            D.scraps.push({ title: "便签：" + text.slice(0, 18) + (text.length > 18 ? "…" : ""), reason: "被揉成一团扔了。" });
            D.notes.shift();
            toast("便签已扔进回收站");
            var host = $("#bladeDetail");
            var active = document.querySelector(".fan-blade[data-idx][aria-pressed=true], .fan-blade.active");
            if (!active) {
              var list = fanBladeList();
              var zi = list.findIndex(function (x) { return x.zoneId === "progress"; });
              if (zi >= 0) active = document.querySelector('.fan-blade[data-idx="' + zi + '"]');
            }
            if (active) onBladeClick(active);
          };
          anim.onfinish = done; anim.oncancel = done;
          setTimeout(done, 380);
        } else if (cur && motionOK()) {
          card.animate([
            { transform: cur }, { transform: "none" }
          ], { duration: 260, easing: "cubic-bezier(.2,1.4,.3,1)" });
        }
      }
      card.addEventListener("pointerup", up);
      card.addEventListener("pointercancel", up);
    });
  }

  /* ---------------- 壁纸 / 主题 ---------------- */

  function syncThemeBtn() {
    var b = $("#themeBtn");
    var cur = (D.wallpapers || []).find(function (w) { return w.id === document.body.dataset.wallpaper; });
    b.title = "切换壁纸（当前：" + (cur ? cur.label : "—") + "）";
  }

  function getWallpaper(id) {
    return (D.wallpapers || []).find(function (w) { return w.id === id; }) || (D.wallpapers && D.wallpapers[0]);
  }

  function setWallpaper(id) {
    var wp = getWallpaper(id);
    if (!wp) return;
    var b = document.body;
    b.dataset.wallpaper = wp.id;
    b.dataset.theme = wp.theme || "day";
    b.style.background = wp.bg;
    b.style.setProperty("--wall-bg", wp.bg);
    if (wp.accent) b.style.setProperty("--accent", wp.accent);
    if (wp.accentSoft) b.style.setProperty("--accent-soft", wp.accentSoft);
    if (wp.glow1) b.style.setProperty("--glow-1", wp.glow1);
    if (wp.glow2) b.style.setProperty("--glow-2", wp.glow2);
    try { localStorage.setItem("portfolio-wallpaper", wp.id); } catch (e) { /* noop */ }
    syncThemeBtn();
  }

  function cycleWallpaper() {
    var list = D.wallpapers || [];
    if (!list.length) return;
    var cur = document.body.dataset.wallpaper || list[0].id;
    var idx = list.findIndex(function (w) { return w.id === cur; });
    if (idx < 0) idx = 0;
    var next = list[(idx + 1) % list.length];
    setWallpaper(next.id);
    toast("壁纸：" + next.label);
  }

  function initWallpaper() {
    var saved = null;
    try { saved = localStorage.getItem("portfolio-wallpaper"); } catch (e) { /* noop */ }
    setWallpaper(saved || D.defaultWallpaper || (D.wallpapers && D.wallpapers[0] && D.wallpapers[0].id));
  }

  /* ---------------- 全局搜索 ---------------- */

  var searchState = { items: [], active: 0, query: "" };

  function searchIndex() {
    var sys = [
      { key: "a:term", glyph: ">_", title: "终端", sub: "应用 · 命令行" }
    ];
    var items = D.projects.map(function (p) {
      var hay = [p.title, p.summary, p.folder, p.year, p.status, p.duration,
        (p.tags || []).join(" "), (p.detail || []).join(" "), p.review || "", p.highlight || ""].join(" ");
      return {
        key: "p:" + p.id, glyph: p.icon, title: p.title,
        sub: p.folder + " · " + p.year + " · " + p.status, hay: hay.toLowerCase()
      };
    });
    return items.concat(sys.map(function (s) {
      s.hay = (s.title + " " + s.sub).toLowerCase();
      return s;
    }));
  }

  function highlight(text, q) {
    var s = String(text == null ? "" : text);
    if (!q) return esc(s);
    var needle = q.toLowerCase(), out = "", rest = s;
    while (needle) {
      var i = rest.toLowerCase().indexOf(needle);
      if (i < 0) break;
      out += esc(rest.slice(0, i)) + "<mark>" + esc(rest.slice(i, i + q.length)) + "</mark>";
      rest = rest.slice(i + q.length);
    }
    return out + esc(rest);
  }

  function renderSearchResults() {
    var host = $("#searchResults");
    var q = searchState.query.split(/\s+/)[0] || "";
    if (!searchState.items.length) {
      host.innerHTML = '<li class="search-empty">没有匹配的条目。换个关键词，或往 data.js 里加一个项目。</li>';
      return;
    }
    host.innerHTML = searchState.items.map(function (it, i) {
      var on = i === searchState.active;
      return '<li><button class="search-item' + (on ? " is-active" : "") + '" type="button" role="option" ' +
        'aria-selected="' + on + '" data-open="' + esc(it.key) + '">' +
        '<span class="glyph" aria-hidden="true">' + esc(it.glyph) + "</span>" +
        '<span class="si-main"><span class="si-title">' + highlight(it.title, q) + "</span>" +
        '<span class="si-sub">' + esc(it.sub) + "</span></span></button></li>";
    }).join("");
  }

  function runSearch(q) {
    searchState.query = String(q || "").trim();
    var tokens = searchState.query.toLowerCase().split(/\s+/).filter(Boolean);
    var all = searchIndex();
    var hits = tokens.length
      ? all.filter(function (it) { return tokens.every(function (t) { return it.hay.indexOf(t) >= 0; }); })
      : all;
    searchState.items = hits.slice(0, 12);
    searchState.active = 0;
    renderSearchResults();
  }

  function moveActive(delta) {
    if (!searchState.items.length) return;
    searchState.active = (searchState.active + delta + searchState.items.length) % searchState.items.length;
    renderSearchResults();
    var act = $(".search-item.is-active", $("#searchResults"));
    if (act) act.scrollIntoView({ block: "nearest" });
  }

  var searchTimer;
  var searchOpen = false;

  function openSearch() {
    var p = $("#searchPanel");
    if (searchOpen) { $("#searchInput").focus(); return; }
    searchOpen = true;
    clearTimeout(searchTimer);
    p.hidden = false;
    $("#searchBtn").setAttribute("aria-expanded", "true");
    requestAnimationFrame(function () { p.classList.add("is-open"); });
    $("#searchInput").value = "";
    runSearch("");
    $("#searchInput").focus();
  }

  function closeSearch(keepFocus) {
    if (!searchOpen) return;
    searchOpen = false;
    var p = $("#searchPanel");
    $("#searchBtn").setAttribute("aria-expanded", "false");
    p.classList.remove("is-open");
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { p.hidden = true; }, 160);
    if (!keepFocus) $("#searchBtn").focus();
  }

  function toggleSearch() {
    if (searchOpen) closeSearch(); else openSearch();
  }

  /* ---------------- 终端（面板版） ---------------- */

  var TERM_HELP = [
    "可用命令：",
    "  ls                 列出全部项目（id / 状态 / 分类）",
    "  open <名称>        打开项目，支持 id 或标题关键字",
    "  cat <名称>         在终端里查看项目摘要与复盘",
    "  theme [名称]       切换壁纸：day / night / dusk / mist",
    "  stats              版本与项目统计",
    "  about              关于我",
    "  clear              清屏",
    "  help               显示这份帮助"
  ];

  function termHTML() {
    return '<div class="term" data-term>' +
      '<div class="term-log" data-term-log>' +
      '<p class="term-line term-sys">个人网站 · terminal ' + esc(D.meta.version) + "</p>" +
      '<p class="term-line term-dim">输入 help 查看可用命令。</p>' +
      "</div>" +
      '<div class="term-input-row">' +
      '<span class="term-prompt" aria-hidden="true">~ $</span>' +
      '<input class="term-input" data-term-input type="text" autocomplete="off" spellcheck="false" aria-label="终端命令" placeholder="help">' +
      "</div></div>";
  }

  function termLog() {
    return $("#termPanel [data-term-log]");
  }

  function termPrint(lines, kind) {
    var log = termLog();
    if (!log) return;
    lines.forEach(function (l) {
      var p = document.createElement("p");
      p.className = "term-line" + (kind ? " term-" + kind : "");
      p.textContent = l;
      log.appendChild(p);
    });
    log.scrollTop = log.scrollHeight;
  }

  function termFind(arg) {
    var q = String(arg || "").trim().toLowerCase();
    if (!q) return null;
    return D.projects.find(function (p) { return p.id.toLowerCase() === q; }) ||
      D.projects.find(function (p) { return p.title.toLowerCase() === q; }) ||
      D.projects.find(function (p) { return p.title.toLowerCase().indexOf(q) >= 0; });
  }

  function termRun(raw) {
    var line = String(raw || "").trim();
    if (!line) return;
    var parts = line.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var arg = parts.slice(1).join(" ");
    termPrint(["~ $ " + line], "cmd");

    if (cmd === "help") { termPrint(TERM_HELP); return; }

    if (cmd === "ls") {
      var rows = ["ID      状态    项目"];
      D.projects.forEach(function (p) {
        rows.push(p.id.padEnd(8) + p.status.padEnd(7) + p.title + "（" + p.folder + " · " + p.year + "）");
      });
      rows.push("共 " + D.projects.length + " 个项目。用 open <id 或标题> 打开。");
      termPrint(rows);
      return;
    }

    if (cmd === "open") {
      var target = termFind(arg);
      if (!target) { termPrint(['找不到项目："' + arg + '"。先 ls 看看。'], "err"); return; }
      openBladeDetail(projectDetailHTML(target));
      termPrint(["已打开：" + target.title], "ok");
      return;
    }

    if (cmd === "cat") {
      var p = termFind(arg);
      if (!p) { termPrint(['找不到项目："' + arg + '"'], "err"); return; }
      var out = [p.title, p.folder + " · " + p.year + " · " + p.status + " · 耗时 " + p.duration, "", p.summary];
      if (p.highlight) out.push("", "关键结果：" + p.highlight);
      if (p.tags && p.tags.length) out.push("标签：" + p.tags.join("、"));
      (p.detail || []).forEach(function (t, i) { out.push("  " + (i + 1) + ". " + t); });
      if (p.review) out.push("", "复盘：" + p.review);
      termPrint(out);
      return;
    }

    if (cmd === "theme") {
      var list = D.wallpapers || [];
      if (!arg) {
        cycleWallpaper();
        termPrint(["壁纸已切换为：" + getWallpaper(document.body.dataset.wallpaper).label], "ok");
        return;
      }
      var want = arg.toLowerCase();
      var hit = list.find(function (w) { return w.id.toLowerCase() === want || (w.label || "").toLowerCase() === want; });
      if (!hit) { termPrint(["未知主题：" + arg + "。可选：" + list.map(function (w) { return w.id; }).join(" / ")], "err"); return; }
      setWallpaper(hit.id);
      toast("壁纸：" + hit.label);
      termPrint(["壁纸已切换为：" + hit.label], "ok");
      return;
    }

    if (cmd === "stats") {
      var done = D.projects.filter(function (x) { return x.status === "已完成"; }).length;
      termPrint([
        "版本：" + D.meta.version + " · 更新于 " + D.meta.updated,
        "项目：" + D.projects.length + " 个（已完成 " + done + " · 进行中 " + (D.projects.length - done) + "）",
        "分类：" + (D.categories || []).map(function (c) { return c.label; }).join(" / ")
      ]);
      return;
    }

    if (cmd === "about") {
      termPrint([D.meta.owner + " · " + D.meta.role, ""].concat(D.about && D.about.paragraphs ? D.about.paragraphs : []));
      return;
    }

    if (cmd === "clear") {
      var log = termLog();
      if (log) log.innerHTML = "";
      return;
    }

    if (cmd === "sudo") { termPrint(["这里不需要 sudo，你自己就是管理员。"], "dim"); return; }

    termPrint(["未知命令：" + cmd + "。输入 help 查看可用命令。"], "err");
  }

  function openTerminal() {
    var host = $("#termPanel");
    if (!host.dataset.bound) {
      host.dataset.bound = "1";
      host.innerHTML = '<div class="panel-head"><span class="panel-title">终端</span>' +
        '<button class="panel-close" type="button" data-act="closeTerm" aria-label="关闭">×</button></div>' +
        '<div class="panel-body">' + termHTML() + "</div>";
      var input = $("[data-term-input]", host);
      var hist = [], hi = 0;
      host.addEventListener("pointerdown", function (ev) {
        if (ev.target.closest("[data-act]")) return;
        input.focus();
      });
      input.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") {
          ev.preventDefault();
          var v = input.value;
          termRun(v);
          if (v.trim()) { hist.push(v.trim()); hi = hist.length; }
          input.value = "";
        } else if (ev.key === "ArrowUp") {
          if (!hist.length) return;
          ev.preventDefault();
          hi = Math.max(0, hi - 1);
          input.value = hist[hi] || "";
        } else if (ev.key === "ArrowDown") {
          if (!hist.length) return;
          ev.preventDefault();
          hi = Math.min(hist.length, hi + 1);
          input.value = hist[hi] || "";
        }
      });
    }
    host.hidden = false;
    requestAnimationFrame(function () { host.classList.add("is-open"); });
    var box = $("[data-term-input]", host);
    if (box) box.focus();
  }

  function closeTerminal() {
    var host = $("#termPanel");
    host.classList.remove("is-open");
    setTimeout(function () { host.hidden = true; }, 180);
  }

  /* ---------------- 入场封面 ---------------- */

  var introVisible = true;
  var introBusy = false;

  function renderIntro() {
    var it = D.intro || {};
    $("#introKicker").textContent = it.kicker || "";
    $("#introTitle").textContent = it.title || "";
    $("#introHintText").textContent = it.hint || "点击任意位置进入";
    $("#introFoot").textContent = it.foot || "";
    var nameEl = $("#introName");
    nameEl.textContent = "";
    var chars = String(it.name || "").split("");
    chars.forEach(function (c) {
      var s = document.createElement("span");
      s.className = "ch";
      s.textContent = c;
      s.setAttribute("aria-hidden", "true");
      nameEl.appendChild(s);
    });
    nameEl.setAttribute("aria-label", it.name || "");
    $("#introTagline").textContent = it.tagline || "";
    $("#introDesc").innerHTML = (it.desc || []).map(function (line) {
      return "<p>" + esc(line) + "</p>";
    }).join("");
  }

  function replayDesktopEntrance() {
    openFan(true);
    if (motionOK()) {
      [".topbar"].forEach(function (sel) {
        var el = $(sel);
        if (el && el.animate) {
          el.animate(
            [{ transform: "translateY(-16px)", opacity: 0.4 }, { transform: "none", opacity: 1 }],
            { duration: 460, easing: "cubic-bezier(.2,.8,.3,1)" }
          );
        }
      });
    }
  }

  function leaveIntro(x, y) {
    if (!introVisible || introBusy) return;
    introBusy = true;
    var el = $("#intro");
    var cx = typeof x === "number" ? x : window.innerWidth / 2;
    var cy = typeof y === "number" ? y : window.innerHeight * 0.55;
    el.style.setProperty("--ix", cx + "px");
    el.style.setProperty("--iy", cy + "px");
    sfx("open");
    var finish = function () {
      el.hidden = true;
      el.classList.remove("is-leaving");
      introVisible = false;
      introBusy = false;
      replayDesktopEntrance();
    };
    if (motionOK()) {
      el.classList.add("is-leaving");
      setTimeout(finish, 640);
    } else {
      finish();
    }
  }

  function showIntro() {
    if (introVisible || introBusy) return;
    introBusy = true;
    closeFan();
    closeBladeDetail();
    closeTerminal();
    var el = $("#intro");
    el.hidden = false;
    introVisible = true;
    sfx("open");
    if (motionOK()) {
      el.classList.add("is-returning");
      setTimeout(function () {
        el.classList.remove("is-returning");
        introBusy = false;
      }, 40);
    } else {
      introBusy = false;
    }
  }

  function bindIntro() {
    var el = $("#intro");
    renderIntro();
    el.addEventListener("click", function (ev) {
      leaveIntro(ev.clientX, ev.clientY);
    });
    el.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " " || ev.key === "Escape") {
        ev.preventDefault();
        leaveIntro();
      }
    });
  }

  /* ---------------- 全局事件 ---------------- */

  function handleOpen(value) {
    var parts = String(value).split(":");
    if (parts[0] === "p") {
      var p = D.projects.find(function (x) { return x.id === parts[1]; });
      if (p) openBladeDetail(projectDetailHTML(p));
    } else if (parts[0] === "a" && parts[1] === "term") {
      openTerminal();
    } else if (parts[0] === "a" && parts[1] === "intro") {
      showIntro();
    }
  }

  function bindGlobal() {
    $("#themeBtn").addEventListener("click", function () { cycleWallpaper(); });
    $("#introBtn").addEventListener("click", function () { showIntro(); });
    var pivot = $("#fanPivot");
    if (pivot) pivot.addEventListener("click", function (ev) { ev.stopPropagation(); toggleFan(); });

    document.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-open]");
      if (b) { handleOpen(b.dataset.open); return; }
      var act = ev.target.closest("[data-act]");
      if (act) {
        if (act.dataset.act === "closeTerm") closeTerminal();
        return;
      }
      // 点详情卡片外的空白关闭详情
      if (ev.target.closest(".fan-blade")) {
        var blade = ev.target.closest(".fan-blade");
        onBladeClick(blade);
      }
    });

    document.addEventListener("keydown", function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        toggleSearch();
        return;
      }
      if (ev.key !== "Escape") return;
      if (introVisible) { leaveIntro(); return; }
      if (searchOpen) { closeSearch(); return; }
      if (!$("#termPanel").hidden) { closeTerminal(); return; }
      if (!$("#bladeDetail").hidden) { closeBladeDetail(); return; }
    });

    document.addEventListener("pointerdown", function (ev) {
      if (searchOpen && !ev.target.closest("#searchPanel") && !ev.target.closest("#searchBtn")) closeSearch(true);
    });
  }

  function bindSearch() {
    $("#searchBtn").addEventListener("click", function (ev) {
      ev.stopPropagation();
      toggleSearch();
    });
    var input = $("#searchInput");
    input.addEventListener("input", function () { runSearch(input.value); });
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown") { ev.preventDefault(); moveActive(1); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); moveActive(-1); }
      else if (ev.key === "Enter") {
        ev.preventDefault();
        var it = searchState.items[searchState.active];
        if (it) { handleOpen(it.key); closeSearch(true); }
      } else if (ev.key === "Escape") {
        ev.preventDefault();
        closeSearch();
      }
    });
    $("#searchPanel").addEventListener("click", function (ev) {
      if (ev.target.closest("[data-open]")) closeSearch(true);
    });
  }

  /* ---------------- 详情卡缩放 ---------------- */

  function bindBladeDetail() {
    var host = $("#bladeDetail");
    var body = $("#bladeDetailBody");
    var resizer = host.querySelector("[data-bd-resizer]");
    var sizeBtn = host.querySelector("[data-bd-size]");
    var closeBtn = host.querySelector("[data-bd-close]");

    // 尺寸档位：默认(中) <-> 大。点击标题栏按钮循环切换
    var SIZE_STEPS = ["", "is-lg", "is-xl"];
    function nextSize() {
      var cur = SIZE_STEPS.indexOf(host.dataset.size || "");
      var nx = (cur + 1) % SIZE_STEPS.length;
      host.dataset.size = SIZE_STEPS[nx];
      host.classList.remove("is-lg", "is-xl");
      if (SIZE_STEPS[nx]) host.classList.add(SIZE_STEPS[nx]);
      sizeBtn.textContent = SIZE_STEPS[nx] === "" ? "⤢" : (SIZE_STEPS[nx] === "is-lg" ? "▣" : "⛶");
      toast(SIZE_STEPS[nx] === "" ? "已恢复默认尺寸" : (SIZE_STEPS[nx] === "is-lg" ? "已放大" : "已全屏放大"));
    }

    sizeBtn.addEventListener("click", function (ev) { ev.stopPropagation(); nextSize(); });
    closeBtn.addEventListener("click", function (ev) { ev.stopPropagation(); closeBladeDetail(); });

    // 右下角把手拖拽缩放：直接调整卡片宽高
    resizer.addEventListener("pointerdown", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var startX = ev.clientX, startY = ev.clientY;
      var startW = host.offsetWidth, startH = host.offsetHeight;
      var vw = window.innerWidth, vh = window.innerHeight;

      function move(e) {
        var w = Math.max(300, Math.min(startW + (e.clientX - startX), vw - 40));
        var h = Math.max(240, Math.min(startH + (e.clientY - startY), vh - 90));
        host.style.width = w + "px";
        host.style.height = h + "px";
        host.style.maxHeight = "none";
      }
      function up() {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "nwse-resize";
    });
  }

  /* ---------------- 启动 ---------------- */

  /* ---------------- 桌面右键菜单 ---------------- */

  function openContextMenu(x, y) {
    var menu = $("#ctxMenu");
    if (!menu) return;
    menu.hidden = false;
    // 先量尺寸再定位，避免超出视口
    menu.style.left = "0px"; menu.style.top = "0px";
    var mw = menu.offsetWidth, mh = menu.offsetHeight;
    var vw = window.innerWidth, vh = window.innerHeight;
    menu.style.left = Math.max(4, Math.min(x, vw - mw - 8)) + "px";
    menu.style.top = Math.max(4, Math.min(y, vh - mh - 8)) + "px";
    requestAnimationFrame(function () { menu.classList.add("is-open"); });
  }

  function closeContextMenu() {
    var menu = $("#ctxMenu");
    if (!menu || menu.hidden) return;
    menu.classList.remove("is-open");
    setTimeout(function () { menu.hidden = true; }, 160);
  }

  function runContextAction(act) {
    closeContextMenu();
    switch (act) {
      case "refresh": renderFan(); toast("桌面已刷新"); break;
      case "wallpaper": cycleWallpaper(); break;
      case "terminal": openTerminal(); break;
      case "toggle": toggleFan(); break;
      case "intro": showIntro(); break;
    }
  }

  function bindContextMenu() {
    var menu = $("#ctxMenu");
    var desktop = $("#desktop");
    if (!menu || !desktop) return;
    desktop.addEventListener("contextmenu", function (ev) {
      var t = ev.target;
      // 输入区/终端/详情卡/搜索面板内保留系统原生菜单
      if (t && t.closest && t.closest("input, textarea, [contenteditable], .term-panel, .blade-detail, .search-panel, .ctx-menu")) return;
      ev.preventDefault();
      openContextMenu(ev.clientX, ev.clientY);
    });
    menu.addEventListener("click", function (ev) {
      var item = ev.target && ev.target.closest ? ev.target.closest(".ctx-item") : null;
      if (item) runContextAction(item.dataset.ctx);
    });
    document.addEventListener("click", function (ev) {
      if (!menu.hidden && !(ev.target && ev.target.closest && ev.target.closest("#ctxMenu"))) closeContextMenu();
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") closeContextMenu();
    });
    window.addEventListener("blur", closeContextMenu);
    window.addEventListener("resize", closeContextMenu);
    window.addEventListener("scroll", closeContextMenu, true);
  }

  function init() {
    document.title = ((D.intro && (D.intro.name + D.intro.title)) || "个人网站") + " · " + D.meta.version;
    initWallpaper();
    syncThemeBtn();
    renderFan();
    bindIntro();
    bindGlobal();
    bindSearch();
    bindBladeDetail();
    bindContextMenu();
    $("#brandSub").textContent = D.layout.tagline;
    $("#topVersion").textContent = D.meta.version;
    $("#topHint").textContent = D.layout.hint;
    initBoot();
  }

  function initBoot() {
    var boot = $("#boot");
    if (!boot) return;
    $("#bootSub").textContent = D.meta.version + " · 正在展开折扇…";
    var done = false;
    var finish = function () {
      if (done) return;
      done = true;
      boot.classList.add("is-out");
      setTimeout(function () { if (boot.parentNode) boot.remove(); }, 380);
      try { sessionStorage.setItem("portfolio-booted", "1"); } catch (err) { /* noop */ }
    };
    $("#bootSkip").addEventListener("click", finish);
    var seen = false;
    try { seen = sessionStorage.getItem("portfolio-booted") === "1"; } catch (err) { /* noop */ }
    if (seen) finish();
    else setTimeout(finish, 1200);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
