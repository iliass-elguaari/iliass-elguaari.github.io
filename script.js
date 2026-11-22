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
    factEn: "In January 2027 I start at Statistics Canada as an Open Source Statistical Programmer.",
    factFr: "En janvier 2027, je commence chez Statistique Canada comme programmeur statistique à code source ouvert." },
  { id: "demos",      en: "Demos",      fr: "Démos",
    factEn: "Both demos are real projects, with the code on GitHub.",
    factFr: "Les deux démos sont de vrais projets, avec le code sur GitHub." },
  { id: "proof",      en: "Proof",      fr: "Preuves",
    factEn: "Every claim on this page links to its proof.",
    factFr: "Chaque affirmation de cette page renvoie à sa preuve." },
  { id: "projects",   en: "Projects",   fr: "Projets",
    factEn: "Six projects in two groups: four of my own and two from my courses. Each one is a level.",
    factFr: "Six projets en deux groupes : quatre personnels et deux de mes cours. Chacun est un niveau." },
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

  document.querySelectorAll("[data-en-ph]").forEach((input) => {
    input.placeholder = input.dataset[lang === "fr" ? "frPh" : "enPh"];
  });
  if (document.querySelector(".sh-tasks li button")) renderStudyTasks();

  // The API console writes a few words in code comments: redraw it in the new language.
  const pressedRoute = document.querySelector(".api [data-route][aria-pressed='true']");
  if (pressedRoute && pressedRoute.dataset.route !== "0") renderApi(Number(pressedRoute.dataset.route));

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

// ---------- 8b. Listings API console ----------

// Sample answers that follow the API's behaviour. The listings are the fixtures from ListingControllerTest.
const LISTING_1 = '{ "id": 1, "address": "75 Laurier Ave E", "monthlyRent": 950, "bedrooms": 1 }';
const LISTING_2 = '{ "id": 2, "address": "200 Rideau St", "monthlyRent": 1400, "bedrooms": 2 }';
const API_ROUTES = [
  { status: "200 OK", ok: true, body: "[\n  " + LISTING_1 + ",\n  " + LISTING_2 + "\n]", test: "getReturnsAllListingsWithoutFilter()" },
  { status: "200 OK", ok: true, body: "[\n  " + LISTING_1 + "\n]", test: "getFiltersByMaxRent()" },
  { status: "200 OK", ok: true, body: LISTING_1, test: "getByIdReturnsListing()" },
  { status: "404 Not Found", ok: false, body: null, test: "getByIdReturns404WhenMissing()" },
  { status: "200 OK", ok: true, request: '{ "address": "75 Laurier Ave E", "monthlyRent": 950, "bedrooms": 1 }', body: LISTING_1, test: "postSavesListing()" },
  { status: "400 Bad Request", ok: false, request: '{ "address": "Nowhere", "monthlyRent": -5, "bedrooms": 1 }', body: null, test: "postRejectsNegativeRent()" },
  { status: "204 No Content", ok: true, body: null, test: "deleteRemovesListing()" }
];

function initApi() {
  const api = document.querySelector(".api");
  if (!api) return;
  const buttons = api.querySelectorAll("[data-route]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      renderApi(Number(button.dataset.route));
    });
  });
}

function renderApi(index) {
  const route = API_ROUTES[index];
  const out = document.querySelector(".api-out");
  const status = out.querySelector(".api-status");
  const code = document.createElement("span");
  code.className = "status-code " + (route.ok ? "status-code--ok" : "status-code--err");
  code.textContent = route.status;
  status.replaceChildren(code);

  const body = out.querySelector(".api-body code");
  let text = "";
  if (route.request) text += "// " + (currentLang() === "fr" ? "corps de la requête" : "request body") + "\n" + route.request + "\n\n";
  if (route.body) text += (route.request ? "// " + (currentLang() === "fr" ? "réponse" : "response") + "\n" : "") + route.body;
  else text += currentLang() === "fr" ? "// pas de corps de réponse" : "// no response body";
  body.textContent = text;

  out.querySelector(".api-test code").textContent = route.test;
  out.classList.remove("is-fresh");
  void out.offsetWidth;
  out.classList.add("is-fresh");
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
  if (unlocked.size === 1) award("kickoff");
  if (unlocked.size === CHAPTERS.length) award("fulltime");
}

// A small card that says which chapter was just unlocked and what it adds.
function showToast(index, chapter) {
  const n = unlocked.size;
  queueToast({
    kind: "chapter",
    final: n === CHAPTERS.length,
    labelEn: "Unlocked " + n + "/" + CHAPTERS.length + " · " + chapter.en,
    labelFr: "Débloqué " + n + "/" + CHAPTERS.length + " · " + chapter.fr,
    textEn: chapter.factEn,
    textFr: chapter.factFr
  });
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
    ".demo, .proof-item, .case, .edu-card, .band-card, .signing-card, .fit, .tool-row, .contact-panel, .bug-card, .level"
  ).forEach((el) => el.classList.add("spot"));
}

// ---------- 13. Level select: one project case file at a time ----------

const LEVEL_ORDER = ["scoutiq", "listings", "trippilot", "levain", "studyhub", "logic"];
const LEVEL_NAMES = {
  scoutiq: { en: "ScoutIQ", fr: "ScoutIQ" },
  listings: { en: "Listings API", fr: "Listings API" },
  trippilot: { en: "TripPilot AI", fr: "TripPilot AI" },
  levain: { en: "Maison Levain", fr: "Maison Levain" },
  studyhub: { en: "StudyHub", fr: "StudyHub" },
  logic: { en: "4-Bit Logic System", fr: "Système logique 4 bits" }
};
const played = new Set();
let currentLevel = null;

function initLevels() {
  const stage = document.querySelector("[data-case-stage]");
  if (!stage) return;
  document.documentElement.classList.add("has-levels");

  // Header and footer that frame the open case file.
  const head = document.createElement("div");
  head.className = "stage-head";
  head.setAttribute("aria-hidden", "true");
  stage.prepend(head);

  const nav = document.createElement("nav");
  nav.className = "stage-nav";
  nav.setAttribute("aria-label", "Levels");
  nav.dataset.enLabel = "Other projects";
  nav.dataset.frLabel = "Autres projets";
  nav.innerHTML = '<button type="button" class="stage-prev"></button><span class="stage-count"></span><button type="button" class="stage-next"></button>';
  stage.append(nav);
  nav.querySelector(".stage-prev").addEventListener("click", () => stepLevel(-1));
  nav.querySelector(".stage-next").addEventListener("click", () => stepLevel(1));

  document.querySelectorAll("[data-level]").forEach((card) => {
    card.addEventListener("click", (event) => {
      event.preventDefault();
      selectLevel(card.dataset.level, true);
      history.replaceState(null, "", "#" + card.dataset.level);
    });
  });

  // Any in-page link that points into a closed case file opens that case first.
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.hasAttribute("data-level")) return;
    openCaseFor(link.getAttribute("href").slice(1));
  }, true);
  addEventListener("hashchange", () => openCaseFor(location.hash.slice(1)));

  if (!openCaseFor(location.hash.slice(1))) selectLevel(LEVEL_ORDER[0], false, true);
}

// If the id is inside a case file, shows that case. Returns true when it did.
function openCaseFor(id) {
  if (!id) return false;
  const target = document.getElementById(id);
  const article = target ? target.closest(".case-stage .case") : null;
  if (!article) return false;
  if (article.id !== currentLevel) selectLevel(article.id, false);
  return true;
}

function stepLevel(delta) {
  const i = LEVEL_ORDER.indexOf(currentLevel);
  const next = LEVEL_ORDER[(i + delta + LEVEL_ORDER.length) % LEVEL_ORDER.length];
  selectLevel(next, true);
  history.replaceState(null, "", "#" + next);
}

function selectLevel(id, scroll, quiet) {
  currentLevel = id;
  const index = LEVEL_ORDER.indexOf(id);
  document.querySelectorAll(".case-stage .case").forEach((article) => {
    article.hidden = article.id !== id;
  });
  document.querySelectorAll("[data-level]").forEach((card) => {
    if (card.dataset.level === id) card.setAttribute("aria-current", "true");
    else card.removeAttribute("aria-current");
  });

  const stage = document.querySelector("[data-case-stage]");
  const name = LEVEL_NAMES[id];
  stage.querySelector(".stage-head").replaceChildren(both(
    "Level " + String(index + 1).padStart(2, "0") + " · " + name.en,
    "Niveau " + String(index + 1).padStart(2, "0") + " · " + name.fr
  ));
  const prev = LEVEL_NAMES[LEVEL_ORDER[(index + LEVEL_ORDER.length - 1) % LEVEL_ORDER.length]];
  const next = LEVEL_NAMES[LEVEL_ORDER[(index + 1) % LEVEL_ORDER.length]];
  stage.querySelector(".stage-prev").replaceChildren(both("← " + prev.en, "← " + prev.fr));
  stage.querySelector(".stage-next").replaceChildren(both(next.en + " →", next.fr + " →"));
  stage.querySelector(".stage-count").textContent = (index + 1) + " / " + LEVEL_ORDER.length;

  // Restart the entrance animation of the case file.
  const article = document.getElementById(id);
  article.classList.remove("is-entering");
  void article.offsetWidth;
  if (!quiet) article.classList.add("is-entering");

  if (!quiet) markPlayed(id);
  if (scroll) stage.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
}

function markPlayed(id) {
  if (played.has(id)) return;
  played.add(id);
  const card = document.querySelector('[data-level="' + id + '"]');
  if (card) card.classList.add("is-played");
  document.querySelector(".lv-played").textContent = played.size;
  if (played.size === LEVEL_ORDER.length) award("explorer");
}

// ---------- 14. Code reader: file tabs, line numbers, light syntax colours ----------

const KEYWORDS = {
  java: "public private protected static final class interface extends implements new return if else for while do switch case break continue throw throws try catch finally void int long double boolean char byte short float null true false this super import package",
  python: "def return if elif else for while in not and or is None True False import from as try except finally raise with class pass break continue lambda yield global",
  js: "const let var function return if else for while do switch case break continue new typeof instanceof null undefined true false this class import export default try catch finally throw of in"
};

function highlightLine(line, lang) {
  const text = line.textContent;
  const keywords = new Set(KEYWORDS[lang].split(" "));
  const comment = lang === "python" ? "#.*" : "\\/\\/.*|^\\s*\\/?\\*.*";
  const pattern = new RegExp(
    "(" + comment + ")" +                                       // 1 comment
    "|([fFrRbB]?\"(?:\\\\.|[^\"\\\\])*\"|[fFrRbB]?'(?:\\\\.|[^'\\\\])*'|`(?:\\\\.|[^`\\\\])*`)" + // 2 string
    "|(@[A-Za-z_]\\w*)" +                                        // 3 annotation / decorator
    "|(\\b\\d+(?:\\.\\d+)?\\b)" +                                // 4 number
    "|(\\b[A-Za-z_]\\w*\\b)",                                    // 5 word
    "g"
  );
  const fragment = document.createDocumentFragment();
  let last = 0;
  let match;
  while ((match = pattern.exec(text))) {
    let cls = null;
    if (match[1]) cls = "tk-com";
    else if (match[2]) cls = "tk-str";
    else if (match[3]) cls = "tk-ann";
    else if (match[4]) cls = "tk-num";
    else if (match[5]) {
      if (keywords.has(match[5])) cls = "tk-kw";
      else if (/^[A-Z]/.test(match[5])) cls = "tk-type";
      else if (text[pattern.lastIndex] === "(") cls = "tk-fn";
    }
    if (!cls) continue;
    if (match.index > last) fragment.append(text.slice(last, match.index));
    const span = document.createElement("span");
    span.className = cls;
    span.textContent = match[0];
    fragment.append(span);
    last = pattern.lastIndex;
  }
  if (last < text.length) fragment.append(text.slice(last));
  line.replaceChildren(fragment);
}

function initCodeReaders() {
  document.querySelectorAll(".cr-code").forEach((pre) => {
    const lang = pre.dataset.lang;
    pre.querySelectorAll(".cl:not(.cl--gap)").forEach((line) => highlightLine(line, lang));
  });

  document.querySelectorAll("[data-code-reader]").forEach((reader) => {
    const tabs = Array.from(reader.querySelectorAll('[role="tab"]'));
    reader.querySelectorAll("[data-cr-hidden]").forEach((panel) => { panel.hidden = true; });

    function select(tab, focus) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => { select(tab); award("reader"); });
      tab.addEventListener("keydown", (event) => {
        let j = null;
        if (event.key === "ArrowRight") j = (i + 1) % tabs.length;
        if (event.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") j = 0;
        if (event.key === "End") j = tabs.length - 1;
        if (j === null) return;
        event.preventDefault();
        select(tabs[j], true);
      });
    });
    // Reading the code by scrolling or selecting it also counts.
    reader.addEventListener("focusin", (event) => { if (event.target.matches(".cr-code")) award("reader"); });
  });
}

// ---------- 15. StudyHub mock-up ----------

const studyTasks = [
  { name: "UML class diagram", course: "SEG 2105", date: "2026-11-14", done: true },
  { name: "ALU lab report", course: "CEG 2136", date: "2026-11-21", done: false },
  { name: "Practice proofs", course: "MAT 1348", date: "2026-11-25", done: false }
];
let editingTask = -1;

function initStudyHub() {
  const phone = document.querySelector(".phone");
  if (!phone) return;
  const form = phone.querySelector(".sh-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = form.querySelector("#sh-name");
    const date = form.querySelector("#sh-date");
    const error = form.querySelector(".sh-error");
    const problem = !name.value.trim()
      ? both("Give the task a name.", "Donnez un nom à la tâche.")
      : !validDate(date.value.trim())
        ? both("Use a real date, like 2026-12-01.", "Entrez une vraie date, par exemple 2026-12-01.")
        : null;
    if (problem) {
      error.replaceChildren(problem);
      (name.value.trim() ? date : name).setAttribute("aria-invalid", "true");
      (name.value.trim() ? date : name).focus();
      award("validator");
      return;
    }
    name.removeAttribute("aria-invalid");
    date.removeAttribute("aria-invalid");
    error.replaceChildren();
    studyTasks.push({ name: name.value.trim(), course: form.querySelector("#sh-course").value, date: date.value.trim(), done: false });
    name.value = "";
    date.value = "";
    renderStudyTasks();
    award("organizer");
  });

  phone.querySelectorAll("[data-sh-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      phone.querySelectorAll("[data-sh-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      phone.querySelectorAll("[data-sh-view]").forEach((view) => { view.hidden = view.dataset.shView !== button.dataset.shTab; });
      if (button.dataset.shTab === "courses") renderStudyCourses();
    });
  });
  renderStudyTasks();
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function renderStudyTasks() {
  const list = document.querySelector(".sh-tasks");
  list.replaceChildren();
  studyTasks.forEach((task, i) => {
    const item = document.createElement("li");
    item.className = "sh-task" + (task.done ? " is-done" : "");

    const check = document.createElement("button");
    check.type = "button";
    check.className = "sh-check";
    check.setAttribute("aria-pressed", String(task.done));
    check.setAttribute("aria-label", (currentLang() === "fr" ? "Terminée : " : "Done: ") + task.name);
    check.textContent = task.done ? "✓" : "";
    check.addEventListener("click", () => { task.done = !task.done; renderStudyTasks(); });

    const text = document.createElement("span");
    text.className = "sh-text";
    if (editingTask === i) {
      const input = document.createElement("input");
      input.className = "sh-edit";
      input.value = task.name;
      input.maxLength = 40;
      input.setAttribute("aria-label", currentLang() === "fr" ? "Modifier le nom de la tâche" : "Edit the task name");
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") { event.preventDefault(); saveEdit(i, input.value); }
        if (event.key === "Escape") { editingTask = -1; renderStudyTasks(); }
      });
      input.addEventListener("blur", () => { if (editingTask === i) saveEdit(i, input.value); });
      text.append(input);
      setTimeout(() => input.focus(), 0);
    } else {
      const name = document.createElement("span");
      name.className = "sh-name";
      name.textContent = task.name;
      text.append(name);
    }
    const meta = document.createElement("span");
    meta.className = "sh-meta";
    meta.textContent = task.course + " · " + task.date;
    text.append(meta);

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "sh-icon";
    edit.textContent = "✎";
    edit.setAttribute("aria-label", (currentLang() === "fr" ? "Modifier : " : "Edit: ") + task.name);
    edit.addEventListener("mousedown", (event) => event.preventDefault());
    edit.addEventListener("click", () => { editingTask = editingTask === i ? -1 : i; renderStudyTasks(); });

    const del = document.createElement("button");
    del.type = "button";
    del.className = "sh-icon sh-icon--del";
    del.textContent = "🗑";
    del.setAttribute("aria-label", (currentLang() === "fr" ? "Supprimer : " : "Delete: ") + task.name);
    del.addEventListener("click", () => {
      studyTasks.splice(i, 1);
      editingTask = -1;
      renderStudyTasks();
      document.querySelector("#sh-name").focus();
    });

    item.append(check, text, edit, del);
    list.append(item);
  });
  if (!studyTasks.length) {
    const empty = document.createElement("li");
    empty.className = "sh-empty";
    empty.append(both("No tasks left. Add one below.", "Plus aucune tâche. Ajoutez-en une ci-dessous."));
    list.append(empty);
  }
}

function saveEdit(i, value) {
  if (value.trim()) studyTasks[i].name = value.trim();
  editingTask = -1;
  renderStudyTasks();
}

function renderStudyCourses() {
  const list = document.querySelector(".sh-courses");
  list.replaceChildren();
  ["SEG 2105", "CEG 2136", "MAT 1348"].forEach((course) => {
    const tasks = studyTasks.filter((t) => t.course === course);
    const left = tasks.filter((t) => !t.done).length;
    const item = document.createElement("li");
    const name = document.createElement("span");
    name.className = "sh-name";
    name.textContent = course;
    const meta = document.createElement("span");
    meta.className = "sh-meta";
    meta.append(both(left + " to do · " + tasks.length + " total", left + " à faire · " + tasks.length + " au total"));
    item.append(name, meta);
    list.append(item);
  });
}

// ---------- 16. 4-bit ALU and modulo-60 counter ----------

const alu = { a: 5, b: 3, op: "ADD" };
const counter = { units: 0, tens: 0, timer: 0 };

function initAlu() {
  const box = document.querySelector(".alu");
  if (!box) return;
  ["a", "b"].forEach((reg) => {
    const holder = box.querySelector('[data-reg="' + reg + '"]');
    holder.replaceChildren();
    for (let bit = 3; bit >= 0; bit--) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bit";
      button.dataset.bit = bit;
      button.innerHTML = '<span class="bit-name">' + reg + bit + '</span><span class="bit-val"></span>';
      button.addEventListener("click", () => {
        alu[reg] ^= 1 << bit;
        renderAlu();
        award("engineer");
      });
      holder.append(button);
    }
  });
  const out = box.querySelector('[data-reg="r"]');
  out.replaceChildren();
  for (let bit = 3; bit >= 0; bit--) {
    const cell = document.createElement("span");
    cell.className = "bit bit--out";
    cell.innerHTML = '<span class="bit-name">r' + bit + '</span><span class="bit-val"></span>';
    out.append(cell);
  }
  box.querySelectorAll("[data-op]").forEach((button) => {
    button.addEventListener("click", () => {
      alu.op = button.dataset.op;
      box.querySelectorAll("[data-op]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      renderAlu();
      award("engineer");
    });
  });

  box.querySelector('[data-clk="step"]').addEventListener("click", () => { tick(); award("engineer"); });
  box.querySelector('[data-clk="reset"]').addEventListener("click", () => { counter.units = 0; counter.tens = 0; renderCounter(); });
  const run = box.querySelector('[data-clk="run"]');
  run.addEventListener("click", () => {
    const on = run.getAttribute("aria-pressed") !== "true";
    run.setAttribute("aria-pressed", String(on));
    run.replaceChildren(on ? both("Pause", "Pause") : both("Run", "Lancer"));
    clearInterval(counter.timer);
    if (on) counter.timer = setInterval(tick, 180);
  });
  renderAlu();
  renderCounter();
}

function computeAlu(a, b, op) {
  const sign = (x) => (x >> 3) & 1;
  let raw = 0;
  let c = 0;
  let v = 0;
  if (op === "ADD") { raw = a + b; c = raw > 15 ? 1 : 0; }
  if (op === "SUB") { raw = a + ((~b) & 15) + 1; c = raw > 15 ? 1 : 0; }
  if (op === "AND") raw = a & b;
  if (op === "OR") raw = a | b;
  if (op === "XOR") raw = a ^ b;
  if (op === "NOT") raw = (~a) & 15;
  if (op === "SHL") { raw = a << 1; c = (a >> 3) & 1; }
  if (op === "SHR") { raw = a >> 1; c = a & 1; }
  const r = raw & 15;
  if (op === "ADD") v = sign(a) === sign(b) && sign(r) !== sign(a) ? 1 : 0;
  if (op === "SUB") v = sign(a) !== sign(b) && sign(r) !== sign(a) ? 1 : 0;
  return { r, Z: r === 0 ? 1 : 0, C: c, V: v, N: sign(r) };
}

function bin(x, width) { return x.toString(2).padStart(width, "0"); }
function signed4(x) { return x > 7 ? x - 16 : x; }

function renderAlu() {
  const box = document.querySelector(".alu");
  const res = computeAlu(alu.a, alu.b, alu.op);
  const usesB = !["NOT", "SHL", "SHR"].includes(alu.op);
  ["a", "b"].forEach((reg) => {
    box.querySelectorAll('[data-reg="' + reg + '"] .bit').forEach((button) => {
      const on = (alu[reg] >> Number(button.dataset.bit)) & 1;
      button.setAttribute("aria-pressed", String(!!on));
      button.setAttribute("aria-label", reg.toUpperCase() + " bit " + button.dataset.bit + ": " + on);
      button.querySelector(".bit-val").textContent = on;
    });
    box.querySelector('[data-val="' + reg + '"]').textContent = bin(alu[reg], 4) + " = " + alu[reg] + " (" + (signed4(alu[reg]) >= 0 ? "+" : "") + signed4(alu[reg]) + ")";
  });
  box.querySelector('[data-row="b"]').classList.toggle("is-unused", !usesB);
  box.querySelectorAll('[data-reg="r"] .bit').forEach((cell, i) => {
    const on = (res.r >> (3 - i)) & 1;
    cell.classList.toggle("is-on", !!on);
    cell.querySelector(".bit-val").textContent = on;
  });
  box.querySelector('[data-val="r"]').textContent = bin(res.r, 4) + " = " + res.r + " (" + (signed4(res.r) >= 0 ? "+" : "") + signed4(res.r) + ")";
  box.querySelectorAll("[data-flag]").forEach((flag) => flag.classList.toggle("is-on", !!res[flag.dataset.flag]));
  const symbol = { ADD: "+", SUB: "−", AND: "AND", OR: "OR", XOR: "XOR" }[alu.op];
  const eq = usesB
    ? bin(alu.a, 4) + " " + symbol + " " + bin(alu.b, 4) + " = " + bin(res.r, 4)
    : alu.op.replace("NOT", "NOT ").replace("SHL", "SHL ").replace("SHR", "SHR ") + bin(alu.a, 4) + " = " + bin(res.r, 4);
  const flagsOn = ["Z", "C", "V", "N"].filter((f) => res[f]).join(" ");
  box.querySelector(".alu-eq").textContent = eq + (flagsOn ? "  ·  " + flagsOn : "");
}

function tick() {
  counter.units++;
  if (counter.units === 10) {
    counter.units = 0;
    counter.tens = (counter.tens + 1) % 6;
  }
  renderCounter();
}

function renderCounter() {
  const box = document.querySelector(".alu");
  box.querySelector('[data-d="units"]').textContent = counter.units;
  box.querySelector('[data-d="tens"]').textContent = counter.tens;
  box.querySelector('[data-q="units"]').textContent = bin(counter.units, 4);
  box.querySelector('[data-q="tens"]').textContent = bin(counter.tens, 3);
}

// ---------- 17. Achievements ----------

const ACHIEVEMENTS = [
  { id: "kickoff",    icon: "⚽", en: "Kickoff",       fr: "Coup d'envoi",      hintEn: "Start the story.",                        hintFr: "Commencez l'histoire." },
  { id: "tactician",  icon: "📋", en: "Tactician",     fr: "Tacticien",         hintEn: "Change the formation on the ScoutIQ board.", hintFr: "Changez la formation sur le tableau de ScoutIQ." },
  { id: "tester",     icon: "🧪", en: "API tester",    fr: "Testeur d'API",     hintEn: "Send a request to the Listings API.",     hintFr: "Envoyez une requête à la Listings API." },
  { id: "reader",     icon: "{ }", en: "Code reader",  fr: "Lecteur de code",   hintEn: "Open a file in a code reader.",           hintFr: "Ouvrez un fichier dans un lecteur de code." },
  { id: "organizer",  icon: "✓",  en: "Organized",     fr: "Organisé",          hintEn: "Add a task in StudyHub.",                 hintFr: "Ajoutez une tâche dans StudyHub." },
  { id: "validator",  icon: "⚠",  en: "Edge case",     fr: "Cas limite",        hintEn: "Trip StudyHub's validation.",             hintFr: "Déclenchez la validation de StudyHub." },
  { id: "engineer",   icon: "⚡", en: "Bit flipper",   fr: "Basculeur de bits", hintEn: "Flip a bit on the 4-bit ALU.",            hintFr: "Basculez un bit de l'UAL 4 bits." },
  { id: "explorer",   icon: "🗺", en: "Explorer",      fr: "Explorateur",       hintEn: "Open all 6 levels.",                      hintFr: "Ouvrez les 6 niveaux." },
  { id: "dj",         icon: "🎧", en: "Sound check",   fr: "Test de son",       hintEn: "Turn on the music.",                      hintFr: "Activez la musique." },
  { id: "fulltime",   icon: "🏆", en: "Full time",     fr: "Fin du match",      hintEn: "Unlock all 8 chapters.",                  hintFr: "Débloquez les 8 chapitres." }
];
const earned = new Set();
const toastQueue = [];
let toastBusy = false;

function initTrophies() {
  const list = document.querySelector(".trophy-list");
  if (!list) return;
  ACHIEVEMENTS.forEach((a) => {
    const item = document.createElement("li");
    item.className = "trophy";
    item.dataset.trophy = a.id;
    const icon = document.createElement("span");
    icon.className = "trophy-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "🔒";
    const body = document.createElement("span");
    body.className = "trophy-body";
    const name = document.createElement("span");
    name.className = "trophy-name";
    name.append(both(a.en, a.fr));
    const hint = document.createElement("span");
    hint.className = "trophy-hint";
    hint.append(both(a.hintEn, a.hintFr));
    const state = document.createElement("span");
    state.className = "sr-only trophy-state";
    state.append(both("Locked. ", "Verrouillé. "));
    body.append(state, name, hint);
    item.append(icon, body);
    list.append(item);
  });
  document.querySelectorAll(".trophy-total").forEach((el) => { el.textContent = ACHIEVEMENTS.length; });

  // Hook the existing demos.
  document.querySelectorAll("[data-formation]").forEach((b) => b.addEventListener("click", () => award("tactician")));
  document.querySelectorAll(".api [data-route]").forEach((b) => b.addEventListener("click", () => award("tester")));
  addEventListener("sound:change", (e) => { if (e.detail.music) award("dj"); });
}

function award(id) {
  if (earned.has(id)) return;
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  if (!a) return;
  earned.add(id);
  const item = document.querySelector('[data-trophy="' + id + '"]');
  if (item) {
    item.classList.add("is-earned");
    item.querySelector(".trophy-icon").textContent = a.icon;
    item.querySelector(".trophy-state").replaceChildren(both("Earned. ", "Obtenu. "));
  }
  document.querySelectorAll(".trophy-n").forEach((el) => { el.textContent = earned.size; });
  queueToast({
    kind: "trophy",
    id: id,
    labelEn: "Achievement " + earned.size + "/" + ACHIEVEMENTS.length,
    labelFr: "Succès " + earned.size + "/" + ACHIEVEMENTS.length,
    textEn: a.icon + "  " + a.en + " · " + a.hintEn.replace(/\.$/, ""),
    textFr: a.icon + "  " + a.fr + " · " + a.hintFr.replace(/\.$/, "")
  });
}

function queueToast(toast) {
  toastQueue.push(toast);
  if (!toastBusy) nextToast();
}

function nextToast() {
  const t = toastQueue.shift();
  if (!t) { toastBusy = false; return; }
  toastBusy = true;
  const el = document.querySelector(".unlock");
  el.querySelector(".unlock-label").replaceChildren(both(t.labelEn, t.labelFr));
  el.querySelector(".unlock-text").replaceChildren(both(t.textEn, t.textFr));
  el.classList.toggle("is-trophy", t.kind === "trophy");
  el.classList.toggle("is-final", !!t.final);
  el.classList.remove("is-visible");
  void el.offsetWidth;
  el.classList.add("is-visible");
  if (window.Sound) Sound.play(t.kind === "trophy" ? (t.id === "fulltime" ? "fanfare" : "achievement") : "unlock");
  if (t.kind === "trophy") burst(el.querySelector(".unlock-icon"), t.id === "fulltime" ? 40 : 22);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove("is-visible");
    setTimeout(nextToast, 350);
  }, toastQueue.length ? 2600 : 4000);
}

// Confetti from a point on screen. Purely decorative, skipped with reduced motion.
function burst(origin, count) {
  if (!origin || reducedMotion.matches) return;
  const box = origin.getBoundingClientRect();
  const colors = ["var(--signal)", "var(--brand)", "var(--brand-2)", "#ffffff", "var(--accent-end)"];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "confetti";
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
    const dist = 60 + Math.random() * 110;
    p.style.left = box.left + box.width / 2 + "px";
    p.style.top = box.top + box.height / 2 + "px";
    p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    p.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    p.style.setProperty("--r", (Math.random() * 720 - 360) + "deg");
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 80 + "ms";
    if (i % 3 === 0) p.style.borderRadius = "50%";
    document.body.append(p);
    setTimeout(() => p.remove(), 1400);
  }
}

// ---------- 18. Start ----------

function init() {
  setLanguage(document.documentElement.lang); // no flip on load, just sync labels
  markNewTabLinks();
  initTheme();
  initVideos();
  initDemoLinks();
  initBoard();
  initPipelineToggle();
  initApi();
  initTopbar();
  initActionBar();
  initTrophies();
  initLevels();
  initCodeReaders();
  initStudyHub();
  initAlu();
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
