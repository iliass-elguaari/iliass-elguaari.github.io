// Iliass El Guaari · personal site
// Plain JavaScript, no libraries, no build step.
// Every visible string is in the HTML twice (lang="en" and lang="fr").
// CSS hides the copy that doesn't match <html lang>; this script only flips that attribute.

// ---------- 1. Constants ----------

const EMAIL = "ielgu032@uottawa.ca";

const PAGE_TEXT = {
  en: {
    title: "Iliass El Guaari · Software Engineer",
    description: "Iliass El Guaari, Software Engineering (Co-op) student at the University of Ottawa, starting at Statistics Canada as a Software Engineer (Open Source Statistical Programmer). Java and Python projects with demo videos. English and French."
  },
  fr: {
    title: "Iliass El Guaari · Ingénieur logiciel",
    description: "Iliass El Guaari, étudiant en génie logiciel (régime coop) à l'Université d'Ottawa, bientôt ingénieur logiciel chez Statistique Canada (programmeur statistique, code source ouvert). Projets Java et Python avec vidéos de démo. Français et anglais."
  }
};

// The 8 chapters. Each one unlocks a short fact the first time it scrolls into view.
// Every fact comes from the page itself.
const CHAPTERS = [
  { id: "next",       en: "Next move",  fr: "Prochaine étape",
    factEn: "I'm starting at Statistics Canada as an Open Source Statistical Programmer.",
    factFr: "Je commence chez Statistique Canada comme programmeur statistique à code source ouvert." },
  { id: "demos",      en: "Demos",      fr: "Démos",
    factEn: "Both demos are real projects, with the code on GitHub.",
    factFr: "Les deux démos sont de vrais projets, avec le code sur GitHub." },
  { id: "proof",      en: "Proof",      fr: "Preuves",
    factEn: "Every claim on this page links to its proof.",
    factFr: "Chaque affirmation de cette page renvoie à sa preuve." },
  { id: "projects",   en: "Projects",   fr: "Projets",
    factEn: "ScoutIQ never picks the same player twice: a HashSet makes sure of it.",
    factFr: "ScoutIQ ne choisit jamais deux fois le même joueur : un HashSet s'en assure." },
  { id: "pitch",      en: "Soccer",     fr: "Soccer",
    factEn: "Ottawa and Grenoble sit at almost the same latitude.",
    factFr: "Ottawa et Grenoble sont presque à la même latitude." },
  { id: "experience", en: "Experience", fr: "Parcours",
    factEn: "I served electors in English and French in the 2025 federal election.",
    factFr: "J'ai servi les électeurs en français et en anglais à l'élection fédérale de 2025." },
  { id: "skills",     en: "Skills",     fr: "Compétences",
    factEn: "Currently learning: React and Docker.",
    factFr: "En apprentissage : React et Docker." },
  { id: "contact",    en: "Contact",    fr: "Contact",
    factEn: "Interview in English or French, your call.",
    factFr: "Entrevue en français ou en anglais, à vous de choisir." }
];

// Same spots, same order as ScoutIQ's Formation.java (create433, create442, create4231).
// x and y are percentages on the pitch (attack goes up); they are only for drawing.
const FORMATIONS = {
  "4-3-3": [
    { spot: "GK",  role: "GK",  x: 50, y: 90 },
    { spot: "LB",  role: "LB",  x: 15, y: 70 },
    { spot: "CB1", role: "CB",  x: 38, y: 74 },
    { spot: "CB2", role: "CB",  x: 62, y: 74 },
    { spot: "RB",  role: "RB",  x: 85, y: 70 },
    { spot: "CM1", role: "CM",  x: 30, y: 50 },
    { spot: "CM2", role: "CM",  x: 70, y: 50 },
    { spot: "CAM", role: "CAM", x: 50, y: 40 },
    { spot: "LW",  role: "LW",  x: 18, y: 22 },
    { spot: "ST",  role: "ST",  x: 50, y: 14 },
    { spot: "RW",  role: "RW",  x: 82, y: 22 }
  ],
  "4-4-2": [
    { spot: "GK",  role: "GK", x: 50, y: 90 },
    { spot: "LB",  role: "LB", x: 15, y: 70 },
    { spot: "CB1", role: "CB", x: 38, y: 74 },
    { spot: "CB2", role: "CB", x: 62, y: 74 },
    { spot: "RB",  role: "RB", x: 85, y: 70 },
    { spot: "LM",  role: "LM", x: 14, y: 46 },
    { spot: "CM1", role: "CM", x: 38, y: 50 },
    { spot: "CM2", role: "CM", x: 62, y: 50 },
    { spot: "RM",  role: "RM", x: 86, y: 46 },
    { spot: "ST1", role: "ST", x: 38, y: 18 },
    { spot: "ST2", role: "ST", x: 62, y: 18 }
  ],
  "4-2-3-1": [
    { spot: "GK",   role: "GK",  x: 50, y: 90 },
    { spot: "LB",   role: "LB",  x: 15, y: 70 },
    { spot: "CB1",  role: "CB",  x: 38, y: 74 },
    { spot: "CB2",  role: "CB",  x: 62, y: 74 },
    { spot: "RB",   role: "RB",  x: 85, y: 70 },
    { spot: "CDM1", role: "CDM", x: 38, y: 58 },
    { spot: "CDM2", role: "CDM", x: 62, y: 58 },
    { spot: "LW",   role: "LW",  x: 18, y: 34 },
    { spot: "CAM",  role: "CAM", x: 50, y: 36 },
    { spot: "RW",   role: "RW",  x: 82, y: 34 },
    { spot: "ST",   role: "ST",  x: 50, y: 14 }
  ]
};

// Role code -> its name in both languages, and the line TeamAnalyzer.java puts it in.
const ROLES = {
  GK:  { en: "Goalkeeper",           fr: "Gardien de but",    line: "goalkeeping" },
  LB:  { en: "Left back",            fr: "Arrière gauche",    line: "defense" },
  CB:  { en: "Centre back",          fr: "Défenseur central", line: "defense" },
  RB:  { en: "Right back",           fr: "Arrière droit",     line: "defense" },
  CDM: { en: "Defensive midfielder", fr: "Milieu défensif",   line: "midfield" },
  CM:  { en: "Central midfielder",   fr: "Milieu central",    line: "midfield" },
  CAM: { en: "Attacking midfielder", fr: "Milieu offensif",   line: "midfield" },
  LM:  { en: "Left midfielder",      fr: "Milieu gauche",     line: "midfield" },
  RM:  { en: "Right midfielder",     fr: "Milieu droit",      line: "midfield" },
  LW:  { en: "Left winger",          fr: "Ailier gauche",     line: "attack" },
  RW:  { en: "Right winger",         fr: "Ailier droit",      line: "attack" },
  ST:  { en: "Striker",              fr: "Attaquant",         line: "attack" }
};

const LINES = {
  goalkeeping: { en: "Goalkeeping", fr: "Gardien de but" },
  defense:     { en: "Defense",     fr: "Défense" },
  midfield:    { en: "Midfield",    fr: "Milieu de terrain" },
  attack:      { en: "Attack",      fr: "Attaque" }
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Updated by the IntersectionObservers in initActionBar().
let reportVisible = true;
let contactVisible = false;

// Formation board state.
let currentFormation = "4-3-3";
let selectedIndex = -1;

// ---------- 2. Helpers ----------

// Returns <span lang="en">…</span><span lang="fr">…</span>, so text built in JS is bilingual too.
function both(en, fr) {
  const fragment = document.createDocumentFragment();
  const enSpan = document.createElement("span");
  enSpan.lang = "en";
  enSpan.textContent = en;
  const frSpan = document.createElement("span");
  frSpan.lang = "fr";
  frSpan.textContent = fr;
  fragment.append(enSpan, frSpan);
  return fragment;
}

// The language currently shown: "en" or "fr".
function currentLang() {
  return document.documentElement.lang === "fr" ? "fr" : "en";
}

// Copies data-en-label or data-fr-label into aria-label for everything inside scope.
function applyLabels(scope) {
  const key = currentLang() + "Label"; // dataset.enLabel or dataset.frLabel
  scope.querySelectorAll("[data-en-label]").forEach((element) => {
    element.setAttribute("aria-label", element.dataset[key]);
  });
}

// ---------- 3. Language ----------

// Shows one language everywhere and remembers it.
function setLanguage(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-set-lang]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.setLang === lang));
  });

  applyLabels(document);
  document.querySelectorAll(".video iframe").forEach((iframe) => {
    iframe.title = iframe.parentElement.dataset[lang + "Title"];
  });

  document.title = PAGE_TEXT[lang].title;
  document.querySelector('meta[name="description"]').setAttribute("content", PAGE_TEXT[lang].description);
  document.querySelector('meta[property="og:title"]').setAttribute("content", PAGE_TEXT[lang].title);
  document.querySelector('meta[property="og:description"]').setAttribute("content", PAGE_TEXT[lang].description);

  try {
    localStorage.setItem("lang", lang);
  } catch (e) {}

  // Keep the address shareable: ?lang=fr opens the French version. The #hash is kept.
  try {
    const url = new URL(location.href);
    if (lang === "fr") url.searchParams.set("lang", "fr");
    else url.searchParams.delete("lang");
    if (url.href !== location.href) history.replaceState(null, "", url.href);
  } catch (e) {}
}

// Same as setLanguage, but flips the report card like a player card when it is on screen.
function switchLanguage(lang) {
  if (lang === currentLang()) return;

  const report = document.querySelector(".report");
  if (reducedMotion.matches || !reportVisible) {
    setLanguage(lang);
    return;
  }

  report.classList.add("is-flipping"); // turns edge-on in 200ms
  setTimeout(() => {
    setLanguage(lang);
    report.classList.remove("is-flipping"); // turns back in 200ms
  }, 200);
}

// ---------- 4. Theme ----------

// Shows the right icon and pressed state on the theme button.
function initTheme() {
  const button = document.querySelector(".theme-btn");
  const current = document.documentElement.dataset.theme || "dark";
  button.dataset.current = current;
  button.setAttribute("aria-pressed", String(current === "dark"));
}

// Switches between light and dark and remembers the choice.
function toggleTheme() {
  const root = document.documentElement;
  const current = root.dataset.theme || "dark";
  const next = current === "dark" ? "light" : "dark";

  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch (e) {}
  initTheme();
}

// ---------- 5. Videos (click to load) ----------

// If a thumbnail can't load, remove it so the designed artwork shows instead.
function initVideos() {
  document.querySelectorAll(".video-thumb").forEach((img) => {
    if (img.complete && img.naturalWidth === 0) img.remove();
    img.addEventListener("error", () => img.remove());
  });

  document.querySelectorAll(".video-play").forEach((button) => {
    button.addEventListener("click", () => loadVideo(button.closest(".video")));
  });
}

// Replaces the play button with the real YouTube player (privacy-enhanced domain).
function loadVideo(container) {
  const iframe = document.createElement("iframe");
  iframe.src = "https://www.youtube-nocookie.com/embed/" + container.dataset.videoId + "?autoplay=1&rel=0";
  iframe.title = container.dataset[currentLang() + "Title"];
  iframe.allow = "autoplay; encrypted-media; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";

  container.querySelector(".video-play").replaceWith(iframe);
  iframe.focus();
}

// "Watch the demo" links: after the jump, put keyboard focus on that video's play button.
function initDemoLinks() {
  document.querySelectorAll("[data-demo-link]").forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.querySelector(link.getAttribute("href"));
      setTimeout(() => {
        const play = target ? target.querySelector(".video-play") : null;
        if (play) play.focus({ preventScroll: true });
      }, 0);
    });
  });
}

// ---------- 6. Formation board ----------

// Creates the 11 tokens once; they are moved (not recreated) when the formation changes.
function initBoard() {
  const board = document.querySelector(".board");
  const tokenContainer = board.querySelector(".board-tokens");

  for (let i = 0; i < 11; i++) {
    const token = document.createElement("button");
    token.type = "button";
    token.className = "token";
    token.setAttribute("aria-pressed", "false");
    token.style.transitionDelay = i * 25 + "ms";

    const role = document.createElement("span");
    role.className = "token-role";
    const order = document.createElement("span");
    order.className = "token-order";
    order.setAttribute("aria-hidden", "true");
    order.textContent = i + 1;

    token.append(role, order);
    token.addEventListener("click", () => selectSpot(i));
    tokenContainer.append(token);
  }

  board.querySelectorAll("[data-formation]").forEach((button) => {
    button.addEventListener("click", () => renderFormation(button.dataset.formation));
  });

  document.getElementById("fill-order").addEventListener("change", (event) => {
    board.classList.toggle("show-order", event.target.checked);
  });

  renderFormation("4-3-3");
}

// Moves token i to spot i of the chosen formation.
function renderFormation(name) {
  currentFormation = name;
  const tokens = document.querySelectorAll(".token");

  FORMATIONS[name].forEach((spot, i) => {
    const token = tokens[i];
    const role = ROLES[spot.role];
    token.style.left = spot.x + "%";
    token.style.top = spot.y + "%";
    token.querySelector(".token-role").textContent = spot.role;
    token.classList.toggle("token--gk", spot.role === "GK");
    token.dataset.enLabel = spot.spot + ", " + role.en;
    token.dataset.frLabel = spot.spot + ", " + role.fr;
  });

  document.querySelectorAll("[data-formation]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.formation === name));
  });

  applyLabels(document.querySelector(".board-tokens"));
  renderReadout(name);
  if (selectedIndex >= 0) selectSpot(selectedIndex);
}

// Explains how ScoutIQ fills the selected spot.
function selectSpot(index) {
  selectedIndex = index;
  const spot = FORMATIONS[currentFormation][index];
  const role = ROLES[spot.role];
  const line = LINES[role.line];
  const n = index + 1;

  document.querySelectorAll(".token").forEach((token, i) => {
    token.setAttribute("aria-pressed", String(i === index));
  });

  const title = document.createElement("h4");
  title.append(both(spot.spot + " · " + role.en, spot.spot + " · " + role.fr));

  const facts = document.createElement("dl");
  facts.append(
    infoRow(both("Line in the team analysis", "Ligne dans l'analyse d'équipe"), both(line.en, line.fr)),
    infoRow(both("Filled", "Ordre de remplissage"), both(`spot ${n} of 11`, `${n}${n === 1 ? "er" : "e"} poste sur 11`))
  );

  const how = document.createElement("p");
  how.append(both(
    `ScoutIQ fills the spots in this order. For each one, it takes the highest-scoring player for ${spot.role} who isn't already in the used-players HashSet.`,
    `ScoutIQ remplit les postes dans cet ordre. Pour chacun, il prend, pour le poste ${spot.role}, le joueur le mieux noté qui n'est pas déjà dans le HashSet des joueurs utilisés.`
  ));

  const info = document.querySelector(".board-info");
  info.replaceChildren(title, facts, how);

  // The only real sample number we have for a position: the 4-3-3 striker ranking.
  if (currentFormation === "4-3-3" && spot.role === "ST") {
    const sample = document.createElement("p");
    sample.className = "board-sample";
    sample.append(both(
      "Sample roster: Victor ranks first for ST, at 95/100.",
      "Effectif d'exemple : Victor est classé premier au poste ST, avec 95/100."
    ));
    info.append(sample);
  }
}

// One label/value row for the board info panel.
function infoRow(label, value) {
  const row = document.createElement("div");
  const dt = document.createElement("dt");
  const dd = document.createElement("dd");
  dt.append(label);
  dd.append(value);
  row.append(dt, dd);
  return row;
}

// The sample output only exists for 4-3-3, so other formations show no numbers.
function renderReadout(name) {
  const readout = document.querySelector(".readout");
  readout.classList.toggle("is-muted", name !== "4-3-3");

  const lines = [];
  if (name === "4-3-3") {
    lines.push(both("Sample roster run · 4-3-3", "Exemple d'exécution · 4-3-3"));
    lines.push(both("Overall fit: 90/100", "Adéquation globale : 90/100"));
    lines.push(both("Top of the striker ranking: Victor, 95/100", "En tête du classement des attaquants : Victor, 95/100"));
  } else {
    lines.push(both("Sample output is shown for 4-3-3 only.", "Résultat d'exemple affiché pour le 4-3-3 seulement."));
  }

  readout.replaceChildren();
  lines.forEach((content, i) => {
    const p = document.createElement("p");
    if (i === 0 && name === "4-3-3") p.className = "readout-title";
    p.append(content);
    readout.append(p);
  });
}

// ---------- 7. TripPilot pipeline ----------

// "Show only my changes" fades the parts that came from the original project.
function initPipelineToggle() {
  const button = document.querySelector(".mine-toggle");
  const pipeline = document.querySelector(".pipeline");
  button.addEventListener("click", () => {
    const on = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(on));
    pipeline.classList.toggle("mine-only", on);
  });
}

// ---------- 8. Contact ----------

// Copies the email address; if the clipboard isn't available, opens the mail app instead.
function copyEmail() {
  const status = document.querySelector(".copy-status");
  if (!navigator.clipboard || !window.isSecureContext) {
    location.href = "mailto:" + EMAIL;
    return;
  }

  navigator.clipboard.writeText(EMAIL)
    .then(() => {
      status.replaceChildren(both("Copied", "Copié"));
      setTimeout(() => status.replaceChildren(), 2000);
    })
    .catch(() => {
      location.href = "mailto:" + EMAIL;
    });
}

// ---------- 9. Top bar and phone action bar ----------

// Shows a border under the top bar as soon as the page scrolls.
function initTopbar() {
  const topbar = document.querySelector(".topbar");
  const sentinel = document.querySelector(".hero-sentinel");
  const observer = new IntersectionObserver((entries) => {
    topbar.classList.toggle("is-scrolled", !entries[0].isIntersecting);
  }, { rootMargin: "-56px 0px 0px 0px" });
  observer.observe(sentinel);
}

// Watches the report card and the contact section to decide when the action bar is useful.
function initActionBar() {
  new IntersectionObserver((entries) => {
    reportVisible = entries[0].isIntersecting;
    updateActionBar();
  }).observe(document.querySelector(".report-wrap"));

  new IntersectionObserver((entries) => {
    contactVisible = entries[0].isIntersecting;
    updateActionBar();
  }).observe(document.getElementById("contact"));
}

// The bar only shows when neither the report card nor the contact section is on screen.
function updateActionBar() {
  const bar = document.querySelector(".actionbar");
  const show = !reportVisible && !contactVisible;
  bar.classList.toggle("is-visible", show);
  // On phones, hide the top bar's resume button while the bar shows its own.
  document.querySelector(".topbar-resume").classList.toggle("is-tucked", show);
  bar.inert = !show;
  if (show) bar.removeAttribute("aria-hidden");
  else bar.setAttribute("aria-hidden", "true");
}

// ---------- 10. Links that open a new tab ----------

// Tells screen-reader users that a link opens a new tab (the text is visually hidden).
function markNewTabLinks() {
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    const note = document.createElement("span");
    note.className = "sr-only";
    note.append(both(" (opens in a new tab)", " (nouvel onglet)"));
    link.append(note);
  });
}


// ---------- 11. Story: scroll progress, chapters, unlocks, reveals ----------

const unlocked = new Set();
let toastTimer = 0;

// Thin bar under the top bar: how far down the page the visitor is.
function initProgress() {
  const bar = document.querySelector(".progress-bar");
  const timeline = document.querySelector(".timeline");
  let ticking = false;

  function update() {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    bar.style.transform = "scaleX(" + ratio + ")";

    // The experience timeline "draws" itself as it scrolls past the middle of the screen.
    if (timeline) {
      const box = timeline.getBoundingClientRect();
      const t = (innerHeight * 0.6 - box.top) / box.height;
      timeline.style.setProperty("--tl", Math.min(1, Math.max(0, t)).toFixed(3));
    }
  }

  addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  addEventListener("resize", update);
  update();
}

// Builds the chapter rail, then watches each chapter to light it up and unlock its fact.
function initChapters() {
  const list = document.querySelector(".rail-list");
  CHAPTERS.forEach((chapter, i) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#" + chapter.id;
    link.tabIndex = -1;
    link.dataset.chapter = chapter.id;
    const num = document.createElement("span");
    num.className = "rail-num";
    num.textContent = String(i + 1).padStart(2, "0");
    const label = document.createElement("span");
    label.className = "rail-label";
    label.append(both(chapter.en, chapter.fr));
    link.append(num, label);
    item.append(link);
    list.append(item);
  });

  // "Reading" = the chapter that crosses the middle of the screen.
  const reading = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      document.querySelectorAll(".rail a, .jump a").forEach((a) => {
        a.classList.toggle("is-current", a.getAttribute("href") === "#" + id);
      });
      unlock(id);
    });
  }, { rootMargin: "-45% 0px -45% 0px" });

  CHAPTERS.forEach((chapter) => {
    const section = document.getElementById(chapter.id);
    if (section) reading.observe(section);
  });

  // The contact chapter is short and sits at the very bottom: unlock it once it is mostly on screen.
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) unlock("contact");
  }, { threshold: 0.5 }).observe(document.getElementById("contact"));
}

function unlock(id) {
  if (unlocked.has(id)) return;
  unlocked.add(id);
  const index = CHAPTERS.findIndex((c) => c.id === id);
  const chapter = CHAPTERS[index];

  document.querySelectorAll('.rail a[data-chapter="' + id + '"], .jump a[href="#' + id + '"]').forEach((a) => {
    a.classList.add("is-unlocked");
  });
  document.querySelector(".rail-n").textContent = unlocked.size;
  document.querySelector(".rail").classList.toggle("is-complete", unlocked.size === CHAPTERS.length);
  if (unlocked.size === CHAPTERS.length) document.querySelector(".dossier-done").hidden = false;

  showToast(index, chapter);
}

// A small card that says which chapter was just unlocked and what it adds.
function showToast(index, chapter) {
  const toast = document.querySelector(".unlock");
  const label = toast.querySelector(".unlock-label");
  const text = toast.querySelector(".unlock-text");
  const n = unlocked.size;
  label.replaceChildren(both(
    "Unlocked " + n + "/" + CHAPTERS.length + " · " + chapter.en,
    "Débloqué " + n + "/" + CHAPTERS.length + " · " + chapter.fr
  ));
  text.replaceChildren(both(chapter.factEn, chapter.factFr));
  toast.classList.toggle("is-final", n === CHAPTERS.length);
  toast.classList.remove("is-visible");
  void toast.offsetWidth; // restart the entrance animation
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 4200);
}

// Fades blocks in as they arrive. Without JavaScript, or with reduced motion, everything is simply there.
function initReveals() {
  if (reducedMotion.matches || !("IntersectionObserver" in window)) return;
  const selector = [
    ".section-head", ".signing-card", ".fit", ".demo", ".proof-item", ".case-head", ".case-grid",
    ".pipeline", ".levain-grid", ".band-top", ".band-card", ".tl-item", ".edu-card",
    ".tool-row", ".contact-panel"
  ].join(",");
  const targets = document.querySelectorAll(selector);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  targets.forEach((el) => {
    // Stagger siblings of the same kind a little.
    const siblings = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.matches(selector)) : [];
    el.style.setProperty("--d", Math.min(siblings.indexOf(el), 5) * 80 + "ms");
    el.classList.add("reveal");
    observer.observe(el);
  });
  document.documentElement.classList.add("has-reveal");
}

// Counts the ScoutIQ numbers up when they first appear.
function initCounters() {
  if (reducedMotion.matches) return;
  const nums = document.querySelectorAll(".stat-num");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const el = entry.target;
      const end = parseInt(el.dataset.value, 10);
      const start = performance.now();
      const duration = 900;
      function step(now) {
        const t = Math.min(1, (now - start) / duration);
        el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  nums.forEach((el) => {
    el.dataset.value = el.textContent.trim();
    el.textContent = "0";
    observer.observe(el);
  });
}

// Cycles the "I build ..." line in the hero.
function initRotator() {
  const words = document.querySelectorAll(".rotator-word");
  if (!words.length || reducedMotion.matches) return;
  let i = 0;
  const total = words[0].dataset.words.split("|").length;
  setInterval(() => {
    if (document.hidden) return;
    i = (i + 1) % total;
    words.forEach((word) => {
      word.classList.add("is-out");
      setTimeout(() => {
        word.textContent = word.dataset.words.split("|")[i];
        word.classList.remove("is-out");
      }, 320);
    });
  }, 2800);
}

// A soft light follows the pointer across cards, and the report card tilts a little.
function initPointerEffects() {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!finePointer.matches || reducedMotion.matches) return;

  document.querySelectorAll(".spot").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const box = card.getBoundingClientRect();
      card.style.setProperty("--mx", event.clientX - box.left + "px");
      card.style.setProperty("--my", event.clientY - box.top + "px");
    });
  });

  const wrap = document.querySelector(".report-wrap");
  wrap.addEventListener("pointermove", (event) => {
    const box = wrap.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    wrap.style.setProperty("--ry", (x * 8).toFixed(2) + "deg");
    wrap.style.setProperty("--rx", (y * -8).toFixed(2) + "deg");
  });
  wrap.addEventListener("pointerleave", () => {
    wrap.style.removeProperty("--rx");
    wrap.style.removeProperty("--ry");
  });
}

// Marks the cards that get the pointer light.
function markSpotCards() {
  document.querySelectorAll(
    ".demo, .proof-item, .case, .edu-card, .band-card, .signing-card, .fit, .tool-row, .contact-panel, .bug-card"
  ).forEach((el) => el.classList.add("spot"));
}

// ---------- 12. Start ----------

function init() {
  setLanguage(document.documentElement.lang); // no flip on load, just sync labels
  markNewTabLinks();
  initTheme();
  initVideos();
  initDemoLinks();
  initBoard();
  initPipelineToggle();
  initTopbar();
  initActionBar();
  markSpotCards();
  initProgress();
  initChapters();
  initReveals();
  initCounters();
  initRotator();
  initPointerEffects();

  document.querySelectorAll("[data-set-lang]").forEach((button) => {
    button.addEventListener("click", () => switchLanguage(button.dataset.setLang));
  });
  document.querySelectorAll("[data-toggle-lang]").forEach((button) => {
    button.addEventListener("click", () => switchLanguage(currentLang() === "en" ? "fr" : "en"));
  });
  document.querySelector(".theme-btn").addEventListener("click", toggleTheme);
  document.getElementById("copy-email").addEventListener("click", copyEmail);
}

init();
