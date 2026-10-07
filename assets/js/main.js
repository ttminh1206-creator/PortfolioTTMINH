/* =========================================================================
   main.js — rendering, timeline road, lightbox, counters, navbar
   Reads everything from window.PORTFOLIO (assets/js/data.js)
   ========================================================================= */
(function () {
  "use strict";

  const D = window.PORTFOLIO;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const page = document.body.dataset.page;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Projects and research share one page; the label tells them apart */
  const CATEGORY = {
    project:  { label: "Projects & Research", page: "projects.html",   tag: "Project",  color: "#2E8B57" },
    research: { label: "Projects & Research", page: "projects.html",   tag: "Research", color: "#3C8DBC" },
    activity: { label: "Activities",          page: "activities.html", tag: "Activity", color: "#B8871F" }
  };
  const LIST_PAGES = {
    project:  { cats: ["project", "research"], all: "All projects & research" },
    activity: { cats: ["activity"], all: "All selected activities" }
  };

  const TYPE_ICON = {
    "Consultancy": "droplets", "Compliance": "clipboard-check", "Environmental assessment": "factory",
    "AI training": "audio-lines", "Research project": "map", "Thesis research": "flask-conical",
    "Training": "book-open", "Award": "trophy", "Milestone": "graduation-cap",
    "Conference": "presentation", "Volunteering": "heart-handshake"
  };
  const PIN_COLORS = ["#2E8B57", "#3C8DBC", "#B8871F", "#1F5E3B", "#2A9D8F", "#5E9C3F", "#B86B2A"];

  /* ---------- Helpers ---------- */
  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const bold = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
  const placeholder = (name = "leaf") => `<div class="ph" role="img" aria-label="Image coming soon">${icon(name)}</div>`;
  const itemIcon = (item) => item.icon || TYPE_ICON[item.type] || "leaf";
  const byNewest = (a, b) => (b.period[1] - a.period[1]) || (b.period[0] - a.period[0]);
  const byCategory = (...cats) => D.items.filter((i) => cats.includes(i.category)).sort(byNewest);
  const siblingsOf = (item) => byCategory(...(item.category === "activity" ? ["activity"] : ["project", "research"]));
  const refreshIcons = () => window.lucide && window.lucide.createIcons();

  /* Replace broken images with the leaf placeholder */
  function guardImages(root = document) {
    $$("img[data-guard]", root).forEach((img) => {
      img.addEventListener("error", () => {
        const ph = document.createElement("div");
        ph.innerHTML = placeholder();
        img.replaceWith(ph.firstElementChild);
        refreshIcons();
      }, { once: true });
    });
  }

  /* ---------- Card ---------- */
  function cardHTML(item) {
    const media = item.cover
      ? `<img src="${esc(item.cover)}" alt="${esc(item.gallery?.[0]?.alt || item.title)}" loading="lazy" data-guard>`
      : placeholder(itemIcon(item));
    const tags = (item.tags || []).slice(0, 3).map((t) => `<li class="chip">${esc(t)}</li>`).join("");
    const c = CATEGORY[item.category];
    return `
      <article class="card reveal">
        <div class="card-media">
          <span class="card-type" style="--c:${c.color}"><span class="dot"></span>${esc(c.tag)}</span>
          ${media}
        </div>
        <div class="card-body">
          <p class="card-meta">${icon(itemIcon(item))} ${esc(item.type)} <span class="sep">·</span> ${esc(item.date)}</p>
          <h3 class="card-title"><a href="detail.html?id=${encodeURIComponent(item.id)}">${esc(item.title)}</a></h3>
          <p class="card-summary">${esc(item.summary)}</p>
          <ul class="card-tags" aria-label="Tags">${tags}</ul>
        </div>
      </article>`;
  }

  function renderCards(el, items) {
    if (!el) return;
    el.innerHTML = items.map(cardHTML).join("");
    guardImages(el);
    refreshIcons();
    observeReveal(el);
  }

  /* ---------- Navbar, menu, footer ---------- */
  function initChrome() {
    const header = $(".site-header");
    const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const toggle = $(".nav-toggle");
    const menu = $("#nav-menu");
    if (toggle && menu) {
      const setOpen = (open) => {
        menu.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.innerHTML = icon(open ? "x" : "menu");
        refreshIcons();
      };
      toggle.addEventListener("click", () => setOpen(!menu.classList.contains("open")));
      $$("a", menu).forEach((a) => a.addEventListener("click", () => setOpen(false)));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menu.classList.contains("open")) { setOpen(false); toggle.focus(); }
      });
    }

    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
    $$("[data-name]").forEach((el) => (el.textContent = D.profile.name));
    $$(".to-top").forEach((b) =>
      b.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }))
    );
    initViewCounter();
  }

  /* ---------- Live visit counter (free Abacus API, no account needed) ----------
     Each browser session counts once (moving between pages does not add more).
     Local previews (Live Server) only read the number, they never add to it. */
  function initViewCounter() {
    const box = $("[data-views]");
    if (!box) return;
    const API = "https://abacus.jasoncameron.dev";
    const KEY = "ttminh1206-portfolio/visits";
    const START = 700; // shown count starts from 700 (added to the real number of visits)
    const num = $("[data-views-num]", box);
    const label = $("[data-views-label]", box);
    const isLocal = location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    let current = null;

    const show = (v) => {
      if (typeof v !== "number" || v < 0) return;
      v += START;
      if (v === current) return;
      const bumped = current !== null && v > current;
      current = v;
      num.textContent = v.toLocaleString("en-US");
      label.textContent = v === 1 ? "view" : "views";
      box.hidden = false;
      if (bumped) { box.classList.remove("bump"); void box.offsetWidth; box.classList.add("bump"); }
    };
    const fetchValue = (action) =>
      fetch(`${API}/${action}/${KEY}`).then((r) => r.json()).then((d) => show(d.value)).catch(() => {});

    let counted = false;
    try { counted = sessionStorage.getItem("views-counted") === "1"; } catch (e) {}
    if (!isLocal && !counted) {
      fetchValue("hit");
      try { sessionStorage.setItem("views-counted", "1"); } catch (e) {}
    } else {
      fetchValue("get");
    }

    // Live updates: the number changes on screen as soon as someone else visits.
    if ("EventSource" in window) {
      const es = new EventSource(`${API}/stream/${KEY}`);
      es.onmessage = (e) => { try { show(JSON.parse(e.data).value); } catch (err) {} };
    } else {
      setInterval(() => fetchValue("get"), 30000);
    }
  }

  /* ---------- Reveal on scroll ---------- */
  let revealObserver;
  function observeReveal(root = document) {
    const els = $$(".reveal:not(.in)", root);
    if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    revealObserver = revealObserver || new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); revealObserver.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((e) => revealObserver.observe(e));
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    const nums = $$("[data-count]");
    const run = (el) => {
      const target = +el.dataset.count;
      if (reduceMotion) { el.textContent = target; return; }
      const t0 = performance.now(), dur = 1400;
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    nums.forEach((n) => io.observe(n));
  }

  /* ---------- Cute skill badges (inline SVG illustrations) ---------- */
  const BADGES = {
    assess: `
      <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 3c15 0 29 9 29 27S48 61 32 61 3 50 3 32 17 3 32 3z" fill="#E3F3E8"/>
        <rect x="17" y="13" width="28" height="36" rx="5" fill="#fff" stroke="#1F5E3B" stroke-width="2.5"/>
        <rect x="25" y="10" width="12" height="7" rx="3" fill="#1F5E3B"/>
        <path d="M22 26l3 3 5-6M22 37l3 3 5-6" stroke="#2E8B57" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M33 27h7M33 38h7" stroke="#9FC9AE" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M44 52c-5 0-8-4-7-9 5-1 9 2 9 7 2-4 6-6 10-5-1 5-6 8-12 7z" fill="#7BC47F"/></svg>`,
    analysis: `
      <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 3c16 0 29 11 29 28S47 61 31 61 3 48 3 31 16 3 32 3z" fill="#E1F0F5"/>
        <path d="M10 22l14-6 16 6 14-6v28l-14 6-16-6-14 6z" fill="#fff" stroke="#1F5E3B" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M24 16v28M40 22v28" stroke="#9FC9AE" stroke-width="2"/>
        <path d="M14 38c5-6 9 2 14-4s8-1 12-6 7 0 10-3" fill="none" stroke="#3C8DBC" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="46" cy="45" r="7" fill="#FBF3DF" stroke="#B8871F" stroke-width="2.5"/><path d="M51 50l5 5" stroke="#B8871F" stroke-width="3" stroke-linecap="round"/></svg>`,
    comm: `
      <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 3c17 0 29 12 29 29S47 61 30 61 3 49 3 31 15 3 32 3z" fill="#FBF3DF"/>
        <rect x="9" y="14" width="32" height="22" rx="7" fill="#fff" stroke="#1F5E3B" stroke-width="2.5"/>
        <path d="M17 36l-3 7 9-7" fill="#fff" stroke="#1F5E3B" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M16 23h18M16 29h12" stroke="#9FC9AE" stroke-width="2.6" stroke-linecap="round"/>
        <rect x="30" y="30" width="25" height="18" rx="6" fill="#2E8B57"/>
        <path d="M47 48l4 6-9-6" fill="#2E8B57"/>
        <circle cx="37" cy="39" r="2" fill="#fff"/><circle cx="43" cy="39" r="2" fill="#fff"/><circle cx="49" cy="39" r="2" fill="#fff"/></svg>`,
    ai: `
      <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M31 3c17 0 30 12 30 28S48 61 32 61 3 49 3 32 14 3 31 3z" fill="#EAF6EF"/>
        <path d="M14 33a18 18 0 0 1 36 0" fill="none" stroke="#1F5E3B" stroke-width="3.2" stroke-linecap="round"/>
        <rect x="9" y="31" width="10" height="16" rx="5" fill="#2E8B57"/><rect x="45" y="31" width="10" height="16" rx="5" fill="#2E8B57"/>
        <path d="M24 39v4M28 35v12M32 31v20M36 35v12M40 39v4" stroke="#3C8DBC" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M40 11h12l4 4-4 4H40z" fill="#B8871F"/><circle cx="43" cy="15" r="1.6" fill="#fff"/></svg>`
  };

  /* =======================================================================
     HOME PAGE
     ======================================================================= */
  function renderHome() {
    const P = D.profile;

    $("#hero-name").textContent = P.name;
    $("#hero-role").textContent = P.title;
    $("#hero-sub").innerHTML = `${icon("graduation-cap")} ${esc(P.subtitle)}`;
    $("#hero-tagline").innerHTML = esc(P.tagline).replace(/\*\*(.+?)\*\*/g, "<mark>$1</mark>");

    // Stats
    $("#stats").innerHTML = D.stats.map((s) => `
      <div class="stat">
        <span class="stat-ico">${icon(s.icon || "leaf")}</span>
        <div class="stat-num"><span data-count="${s.value}">0</span><span class="suffix">${esc(s.suffix)}</span></div>
        <div class="stat-label">${esc(s.label)}</div>
      </div>`).join("");

    // About
    $("#about-text").innerHTML =
      D.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("") +
      `<div class="focus-box">${icon("compass")}<p style="margin:0">${esc(D.about.focus)}</p></div>` +
      `<div class="values">${D.about.values.map((v) =>
        `<div class="value">${icon(v.icon)}<h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></div>`).join("")}</div>`;

    $("#skills").innerHTML = D.skills.map((g) => `
      <div class="skill-group reveal">
        <div class="skill-head"><span class="skill-badge">${BADGES[g.badge] || ""}</span><h3>${esc(g.group)}</h3></div>
        <ul class="chips">${g.items.map((s) => `<li class="chip">${esc(s)}</li>`).join("")}</ul>
      </div>`).join("");

    // Study (bottom-up mini ladder) + Work
    const edu = D.education.slice().reverse(); // newest on top
    $("#study").innerHTML = edu.map((e, i) => `
      <li class="step reveal" style="--i:${edu.length - 1 - i}">
        <span class="step-ico">${icon(e.icon)}</span>
        <div>
          <span class="tl-date">${esc(e.years)}</span>
          <h4>${esc(e.level)}</h4>
          <p class="tl-org">${esc(e.major)}</p>
          <p class="muted">${esc(e.school)} · ${esc(e.result)}</p>
        </div>
      </li>`).join("");

    $("#work").innerHTML = D.work.map((w) => `
      <li class="tl-item work reveal">
        <span class="tl-dot">${icon("briefcase")}</span>
        <div class="tl-card">
          <span class="tl-date">${esc(w.date)}</span>
          <h4>${esc(w.title)}</h4>
          <div class="tl-org">${esc(w.org)}</div>
          <div class="tl-unit">${esc(w.unit)}</div>
          <p>${esc(w.text)}</p>
        </div>
      </li>`).join("");

    // Featured: projects + research together (3 + 3), then activities
    const fp = byCategory("project").filter((i) => i.featured).slice(0, 3);
    const fr = byCategory("research").filter((i) => i.featured).slice(0, 3);
    renderCards($("#featured-work"), [...fp, ...fr].sort(byNewest));
    renderCards($("#featured-activities"), byCategory("activity").filter((i) => i.featured).slice(0, 4));

    // Awards & certificates
    const awardCard = (a, cls = "") => {
      const tag = a.link ? "a" : "div";
      const href = a.link ? ` href="${esc(a.link)}"` : "";
      return `<${tag} class="award ${cls} reveal"${href}>
          <span class="award-ico">${icon(a.icon)}</span>
          <div><span class="award-year">${esc(a.year)}</span><h3>${esc(a.title)}</h3><p>${esc(a.org)}</p></div>
        </${tag}>`;
    };
    $("#awards").innerHTML = D.awards.map((a) => awardCard(a)).join("");
    $("#certificates").innerHTML = D.certificates.map((c) => awardCard(c, "cert")).join("");

    // Contact
    $("#contact-mail").href = `mailto:${P.emails[0]}`;
    $("#contact-list").innerHTML = [
      `<li><span class="item">${icon("mail")}<span><small>Email</small>${P.emails.map((m) =>
        `<a class="mail-link" href="mailto:${esc(m)}">${esc(m)}</a>`).join("")}</span></span></li>`,
      ...P.phones.map((ph) =>
        `<li><a href="tel:${ph.value.replace(/\s/g, "")}">${icon("phone")}<span><small>Phone · ${esc(ph.label)}</small>${esc(ph.value)}</span></a></li>`),
      ...P.socials.map((s) =>
        `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${icon(s.icon)}<span><small>${esc(s.label)}</small>${esc(s.url.replace(/^https?:\/\/(www\.)?/, "").replace(/[?&]hl=en$/, ""))}</span></a></li>`),
      `<li><span class="item">${icon("map-pin")}<span><small>Based in</small>${esc(P.location)}</span></span></li>`
    ].join("");

    refreshIcons();
    initCounters();
  }

  /* =======================================================================
     EDUCATION PAGE — milestones drawn from the bottom (Bachelor) up (PhD)
     ======================================================================= */
  function renderEducation() {
    const list = $("#climb");
    const all = []; // every photo, for one shared lightbox
    const mosaic = (imgs) => `<div class="climb-photos n${Math.min(imgs.length, 6)}">${imgs.map((g) => {
      all.push(g);
      return `<button type="button" data-index="${all.length - 1}" aria-label="Open photo: ${esc(g.alt)}">
        <img src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy" data-guard></button>`;
    }).join("")}</div>`;
    list.innerHTML = D.education.map((e, i) => `
      <li class="climb-step reveal ${i % 2 ? "flip" : ""}" style="--lvl:${i}">
        <div class="climb-marker">
          <span class="climb-ico">${icon(e.icon)}</span>
          <span class="climb-years">${esc(e.years)}</span>
        </div>
        <figure class="climb-photo">${mosaic(e.images || [])}</figure>
        <article class="climb-card">
          <span class="eyebrow">Step ${i + 1} · ${esc(e.short)}</span>
          <h2>${esc(e.level)}</h2>
          <p class="climb-major">${esc(e.major)}</p>
          <ul class="climb-facts">
            <li>${icon("school")}<span>${esc(e.school)}</span></li>
            <li>${icon("layers")}<span>${esc(e.faculty)}</span></li>
            <li>${icon("map-pin")}<span>${esc(e.location)}</span></li>
            <li>${icon("award")}<span>${esc(e.result)}</span></li>
          </ul>
          <p class="climb-thesis">${icon("book-open")}<span>${esc(e.thesis)}</span></p>
          <ul class="checklist">${e.achievements.map((a) => `<li>${icon("circle-check")}<span>${esc(a)}</span></li>`).join("")}</ul>
          ${e.link ? `<a class="pub-link" href="${esc(e.link)}">${icon("arrow-right")} More details</a>` : ""}
        </article>
      </li>`).join("");
    guardImages(list);
    refreshIcons();
    observeReveal(list);
    initLightbox(all, list);

    // grow the vine as the visitor scrolls
    const vine = $("#vine-path");
    if (vine && !reduceMotion) {
      const len = vine.getTotalLength();
      vine.style.strokeDasharray = len;
      const update = () => {
        const r = $(".climb-wrap").getBoundingClientRect();
        const seen = Math.min(Math.max((window.innerHeight - r.top) / (r.height + window.innerHeight * 0.3), 0), 1);
        vine.style.strokeDashoffset = len * (1 - seen);
      };
      update();
      window.addEventListener("scroll", update, { passive: true });
    }
  }

  /* =======================================================================
     LIST PAGES — timeline road + full grid
     ======================================================================= */
  function renderList(key) {
    const cfg = LIST_PAGES[key];
    const items = byCategory(...cfg.cats);
    $("#all-title").textContent = cfg.all;
    $("#result-count").textContent = `${items.length} items · newest first`;
    renderCards($("#grid"), items);
    initRoad($("#road"), items, cfg.cats.length > 1);
    if (cfg.cats.includes("research")) renderPublications();
  }

  /* Pin colour: by category when a page mixes projects and research */
  const pinColor = (it, i, byCat) => (byCat ? CATEGORY[it.category].color : PIN_COLORS[i % PIN_COLORS.length]);
  const legendHTML = (items) => {
    const cats = [...new Set(items.map((i) => i.category))];
    return `<div class="road-legend">${cats.map((c) =>
      `<span><i class="dot" style="background:${CATEGORY[c].color}"></i>${CATEGORY[c].tag} (${items.filter((i) => i.category === c).length})</span>`).join("")}</div>`;
  };

  function initRoad(host, items, byCat = false) {
    if (!host || !items.length) return;
    let mode = "";
    const draw = () => {
      const m = host.clientWidth >= 760 ? "h" : "v";
      if (m === mode) return;
      mode = m;
      (m === "h" ? roadHorizontal : roadVertical)(host, items, byCat);
      if (byCat) host.insertAdjacentHTML("afterbegin", legendHTML(items));
      refreshIcons();
    };
    draw();
    let t;
    window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(draw, 150); });
  }

  /* Desktop: a winding road from left (oldest) to right (newest); pins stand on it */
  function roadHorizontal(host, items, byCat) {
    const W = 1200, H = 480;
    const pt = (t) => ({
      x: 60 + t * (W - 120),
      y: H - 120 + 42 * Math.sin(t * Math.PI * 2.4) - t * 70
    });

    // road outline
    let d = "";
    for (let k = 0; k <= 120; k++) { const p = pt(k / 120); d += (k ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1); }

    // pins: oldest → newest, evenly spaced so busy years never crowd;
    // a year marker sits on the road just before the first pin of each year
    const sorted = items.slice().sort((a, b) => (a.period[0] - b.period[0]) || (a.period[1] - b.period[1]));
    const N = sorted.length;
    const slot = (i) => (i + 0.75) / (N + 0.5);
    const pins = sorted.map((it, i) => {
      const base = pt(slot(i));
      const h = [105, 185][i % 2];
      return { it, base, head: { x: base.x, y: base.y - h }, color: pinColor(it, i, byCat) };
    });

    const yearMarks = sorted.map((it, i) => {
      if (i && sorted[i - 1].period[0] === it.period[0]) return "";
      const p = pt(slot(i) - 0.45 / (N + 0.5));
      return `<g class="road-year"><circle cx="${p.x}" cy="${p.y}" r="9"/><text x="${p.x}" y="${p.y + 44}">${it.period[0]}</text></g>`;
    }).join("");

    const svg = `
      <svg class="road-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <defs><filter id="rs" x="-5%" y="-20%" width="110%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#1F5E3B" flood-opacity=".18"/></filter></defs>
        <path d="${d}" class="road-base" filter="url(#rs)"/>
        <path d="${d}" class="road-edge"/>
        <path d="${d}" class="road-line"/>
        ${pins.map((p) => `<line x1="${p.base.x}" y1="${p.base.y}" x2="${p.head.x}" y2="${p.head.y}" stroke="${p.color}" class="pin-stem"/>
          <circle cx="${p.base.x}" cy="${p.base.y}" r="7" fill="${p.color}" class="pin-foot"/>`).join("")}
        ${yearMarks}
      </svg>`;

    const heads = pins.map((p, i) => `
      <a class="pin" href="detail.html?id=${encodeURIComponent(p.it.id)}" data-i="${i}"
         style="left:${(p.head.x / W * 100).toFixed(3)}%;top:${(p.head.y / H * 100).toFixed(3)}%;--c:${p.color}"
         aria-label="${esc(p.it.title)} (${esc(p.it.date)})">
        <span class="pin-head">${icon(itemIcon(p.it))}</span>
        <span class="pin-year">${esc(String(p.it.period[0]))}</span>
      </a>`).join("");

    host.className = "road road-h";
    host.innerHTML = `<div class="road-stage" style="aspect-ratio:${W}/${H}">${svg}${heads}<div class="road-tip" role="tooltip" hidden></div></div>
      <p class="road-hint">${icon("mouse-pointer-2")} Hover over a pin to preview · click to open</p>`;

    const tip = $(".road-tip", host);
    const stage = $(".road-stage", host);
    const show = (a) => {
      const p = pins[+a.dataset.i], it = p.it;
      tip.innerHTML = `
        <div class="tip-media">${it.cover ? `<img src="${esc(it.cover)}" alt="">` : placeholder(itemIcon(it))}</div>
        <div class="tip-body">
          <span class="tip-type" style="color:${p.color}">${esc(CATEGORY[it.category].tag)} · ${esc(it.type)}</span>
          <strong>${esc(it.title)}</strong>
          <span class="tip-meta">${icon("calendar")} ${esc(it.date)}</span>
          <span class="tip-meta">${icon("user-round")} ${esc(it.role)}</span>
          <span class="tip-cta">View details ${icon("arrow-right")}</span>
        </div>`;
      refreshIcons();
      tip.hidden = false;
      const left = p.head.x / W;
      tip.style.left = left > 0.62 ? "" : `calc(${(left * 100).toFixed(2)}% + 34px)`;
      tip.style.right = left > 0.62 ? `calc(${((1 - left) * 100).toFixed(2)}% + 34px)` : "";
      tip.style.top = `${Math.max(0, (p.head.y / H) * 100 - 6).toFixed(2)}%`;
      $$(".pin", stage).forEach((x) => x.classList.toggle("active", x === a));
    };
    const hide = () => { tip.hidden = true; $$(".pin", stage).forEach((x) => x.classList.remove("active")); };

    $$(".pin", stage).forEach((a) => {
      a.addEventListener("mouseenter", () => show(a));
      a.addEventListener("focus", () => show(a));
      a.addEventListener("mouseleave", hide);
      a.addEventListener("blur", hide);
      // touch: first tap previews, second tap opens
      a.addEventListener("click", (e) => {
        if (a.dataset.touched !== "1" && window.matchMedia("(hover: none)").matches) {
          e.preventDefault();
          $$(".pin", stage).forEach((x) => (x.dataset.touched = ""));
          a.dataset.touched = "1";
          show(a);
        }
      });
    });
  }

  /* Mobile: the road runs top (newest) to bottom (oldest), labels beside each pin */
  function roadVertical(host, items, byCat) {
    const rows = items.slice().sort(byNewest);
    const ROW = 104, TOP = 46;
    const H = TOP + rows.length * ROW + 30;
    const x = (y) => 46 + 16 * Math.sin(y / 70);
    let d = "";
    for (let y = 0; y <= H; y += 6) d += (y ? "L" : "M") + x(y).toFixed(1) + " " + y;

    let lastYear = null;
    const parts = rows.map((it, j) => {
      const y = TOP + j * ROW + ROW / 2;
      const year = it.period[1];
      const yearChip = year !== lastYear ? `<span class="v-year" style="top:${TOP + j * ROW - 14}px">${year}</span>` : "";
      lastYear = year;
      const c = pinColor(it, j, byCat);
      const label = byCat ? `${CATEGORY[it.category].tag} · ${it.date}` : `${it.type} · ${it.date}`;
      return `${yearChip}
        <a class="v-pin" href="detail.html?id=${encodeURIComponent(it.id)}" style="top:${y - 26}px;--c:${c}">
          <span class="pin-head" style="left:${x(y) - 24}px">${icon(itemIcon(it))}</span>
          <span class="v-text"><span class="tip-type" style="color:${c}">${esc(label)}</span><strong>${esc(it.title)}</strong></span>
        </a>`;
    }).join("");

    host.className = "road road-v";
    host.innerHTML = `<div class="road-stage-v" style="height:${H}px">
        <svg class="road-svg" viewBox="0 0 120 ${H}" width="120" height="${H}" aria-hidden="true">
          <path d="${d}" class="road-base"/><path d="${d}" class="road-edge"/><path d="${d}" class="road-line"/>
        </svg>${parts}</div>`;
  }

  function renderPublications() {
    const el = $("#publications");
    if (!el) return;
    el.innerHTML = D.publications.map((p) => {
      const inPress = /in press/i.test(p.details);
      const link = p.link
        ? `<a class="pub-link" href="${esc(p.link)}" target="_blank" rel="noopener">${icon(p.linkType === "pdf" ? "file-down" : "external-link")} ${p.linkType === "pdf" ? "Full text (PDF)" : "DOI"}</a>`
        : "";
      return `
      <li class="pub reveal">
        <div>
          <div class="pub-authors">${bold(p.authors)} (${p.year}).</div>
          <div class="pub-title">${esc(p.title)}.</div>
          <div class="pub-venue"><em>${esc(p.venue)}</em>${p.details && !inPress ? `, ${esc(p.details)}` : ""}.</div>
          <div class="pub-foot">
            <span class="badge">${esc(p.type)}</span>
            ${inPress ? `<span class="badge gold">In press</span>` : ""}
            ${link}
          </div>
        </div>
      </li>`;
    }).join("");
    refreshIcons();
    observeReveal(el);
  }

  /* =======================================================================
     DETAIL PAGE
     ======================================================================= */
  function renderDetail() {
    const id = new URLSearchParams(location.search).get("id");
    const item = D.items.find((i) => i.id === id);
    const root = $("#detail");

    if (!item) {
      document.title = `Not found · ${D.profile.name}`;
      root.innerHTML = `
        <section class="not-found container">
          ${placeholder("sprout")}
          <h1>This page hasn't grown yet</h1>
          <p>We couldn't find an item called “${esc(id || "")}”. It may have been renamed or removed.</p>
          <p><a class="btn btn-primary" href="index.html">${icon("house")} Back to home</a></p>
        </section>`;
      refreshIcons();
      return;
    }

    const cat = CATEGORY[item.category];
    const siblings = siblingsOf(item);
    const idx = siblings.indexOf(item);
    const prev = siblings[idx - 1], next = siblings[idx + 1];

    document.title = `${item.title} · ${D.profile.name}`;
    const setMeta = (sel, val) => { const m = $(sel); if (m) m.setAttribute("content", val); };
    setMeta('meta[name="description"]', item.summary);
    setMeta('meta[property="og:title"]', item.title);
    setMeta('meta[property="og:description"]', item.summary);
    if (item.cover) setMeta('meta[property="og:image"]', item.cover);

    $$(`#nav-menu a[href="${cat.page}"]`).forEach((a) => a.setAttribute("aria-current", "page"));

    const isFigure = /research-(sustainability|chemical)|certificate|unssc|icogee|smart-cities|\.svg$/.test(item.cover);
    const cover = item.cover
      ? `<div class="detail-cover${isFigure ? " contain" : ""}"><img src="${esc(item.cover)}" alt="${esc(item.gallery?.[0]?.alt || item.title)}" data-guard></div>`
      : `<div class="detail-cover">${placeholder(itemIcon(item))}</div>`;

    const facts = [
      ["calendar", "Time", item.date],
      ["map-pin", "Location", item.location],
      ["user-round", "Role", item.role],
      ["building-2", "Organisation", item.organization]
    ].map(([ic, label, val]) => `
      <div class="fact"><span class="fact-ico">${icon(ic)}</span><div><small>${label}</small><span>${esc(val || "—")}</span></div></div>`).join("");

    const desc = Array.isArray(item.description) ? item.description.join(" ") : (item.description || item.summary);
    const highlights = (item.highlights || []).map((h) => `<li>${icon("circle-check")}<span>${esc(h)}</span></li>`).join("");
    const tags = (item.tags || []).map((t) => `<li class="chip">${esc(t)}</li>`).join("");
    const links = (item.links || []).length
      ? `<h2 style="margin-top:32px">${icon("link")} Related links</h2>
         <ul class="links">${item.links.map((l) =>
           `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${icon(l.icon || "external-link")}<span>${esc(l.label)}</span></a></li>`).join("")}</ul>`
      : "";
    // hide the gallery when its only image is the cover itself
    const g0 = item.gallery || [];
    const gallery = g0.length && !(g0.length === 1 && g0[0].src === item.cover)
      ? `<section class="section" style="padding-top:48px;padding-bottom:0" aria-labelledby="gal-h">
           <h2 id="gal-h" style="font-size:1.45rem;display:flex;align-items:center;gap:.5rem">${icon("images")} Gallery</h2>
           <div class="gallery">${item.gallery.map((g, i) =>
             `<button type="button" data-index="${i}" aria-label="Open image ${i + 1}: ${esc(g.alt)}">
                <img src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy" data-guard></button>`).join("")}</div>
         </section>`
      : "";

    root.innerHTML = `
      <div class="detail-top">
        <div class="container">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><a href="index.html">Home</a></li>
              <li><a href="${cat.page}">${cat.label}</a></li>
              <li><span aria-current="page">${esc(item.title)}</span></li>
            </ol>
          </nav>
          <header class="detail-head">
            <span class="eyebrow">${esc(cat.tag)} · ${esc(item.type)}</span>
            <h1>${esc(item.title)}</h1>
            <p class="subtitle">${esc(item.subtitle || "")}</p>
          </header>
          ${cover}
        </div>
      </div>
      <div class="container">
        <div class="facts">${facts}</div>
        <div class="detail-body">
          <section aria-labelledby="sum-h">
            <h2 id="sum-h">${icon("file-text")} Summary</h2>
            <p>${esc(desc)}</p>
            <ul class="tag-row" aria-label="Tags">${tags}</ul>
          </section>
          <section aria-labelledby="hl-h">
            <h2 id="hl-h">${icon("sparkles")} Highlights</h2>
            <ul class="checklist">${highlights}</ul>
            ${links}
          </section>
        </div>
        ${gallery}
        <nav class="detail-nav" aria-label="Item navigation">
          ${prev ? `<a class="btn btn-outline btn-sm" href="detail.html?id=${prev.id}">${icon("arrow-left")} Newer</a>` : `<span></span>`}
          <a class="btn btn-primary btn-sm" href="${cat.page}">${icon("layout-grid")} Back to ${cat.label.toLowerCase()}</a>
          ${next ? `<a class="btn btn-outline btn-sm" href="detail.html?id=${next.id}">Older ${icon("arrow-right")}</a>` : `<span></span>`}
        </nav>
      </div>`;

    guardImages(root);
    refreshIcons();
    initLightbox(item.gallery || []);
  }

  /* ---------- Lightbox ---------- */
  function initLightbox(images, scope = document) {
    const lb = $("#lightbox");
    if (!lb || !images.length) return;
    const img = $("img", lb), cap = $("figcaption", lb), cnt = $(".lb-count", lb);
    let i = 0, lastFocus = null;

    const show = (n) => {
      i = (n + images.length) % images.length;
      img.src = images[i].src;
      img.alt = images[i].alt;
      cap.textContent = images[i].alt;
      cnt.textContent = `${i + 1} / ${images.length}`;
    };
    const open = (n) => {
      lastFocus = document.activeElement;
      show(n);
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
      $(".lb-close", lb).focus();
    };
    const close = () => {
      lb.classList.remove("open");
      document.body.style.overflow = "";
      lastFocus && lastFocus.focus();
    };

    $$("button[data-index]", scope).forEach((b) => b.addEventListener("click", () => open(+b.dataset.index)));
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", () => show(i - 1));
    $(".lb-next", lb).addEventListener("click", () => show(i + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(i - 1);
      else if (e.key === "ArrowRight") show(i + 1);
      else if (e.key === "Tab") { // keep focus inside the dialog
        const f = $$("button", lb), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    let x0 = null;
    lb.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* =======================================================================
     BOOT
     ======================================================================= */
  initChrome();
  if (page === "home") renderHome();
  else if (page === "education") renderEducation();
  else if (page in LIST_PAGES) renderList(page);
  else if (page === "detail") renderDetail();
  refreshIcons();
  observeReveal();
})();
