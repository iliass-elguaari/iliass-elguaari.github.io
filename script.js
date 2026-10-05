// Iliass El Guaari · personal site
// Plain JavaScript, no libraries, no build step.
// Every visible string is in the HTML twice (lang="en" and lang="fr").
// CSS hides the copy that doesn't match <html lang>; this script only flips that attribute.

// ---------- 1. Constants ----------

const EMAIL = "ielgu032@uottawa.ca";

const PAGE_TEXT = {
  en: {
    title: "Iliass El Guaari · Software Engineering co-op student",
    description: "Iliass El Guaari, Software Engineering (Co-op) student at the University of Ottawa, open to a Winter 2027 software co-op. Java and Python projects with demo videos. English and French."
  },
  fr: {
    title: "Iliass El Guaari · Étudiant en génie logiciel (coop)",
    description: "Iliass El Guaari, étudiant en génie logiciel (régime coop) à l'Université d'Ottawa, disponible pour un stage coop en logiciel à l'hiver 2027. Projets Java et Python avec vidéos de démo. Français et anglais."
  }
};

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
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

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
  const current = document.documentElement.dataset.theme || (systemDark.matches ? "dark" : "light");
  button.dataset.current = current;
  button.setAttribute("aria-pressed", String(current === "dark"));
}

// Switches between light and dark and remembers the choice.
function toggleTheme() {
  const root = document.documentElement;
  const current = root.dataset.theme || (systemDark.matches ? "dark" : "light");
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

// ---------- 11. Start ----------

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

  document.querySelectorAll("[data-set-lang]").forEach((button) => {
    button.addEventListener("click", () => switchLanguage(button.dataset.setLang));
  });
  document.querySelectorAll("[data-toggle-lang]").forEach((button) => {
    button.addEventListener("click", () => switchLanguage(currentLang() === "en" ? "fr" : "en"));
  });
  document.querySelector(".theme-btn").addEventListener("click", toggleTheme);
  document.getElementById("copy-email").addEventListener("click", copyEmail);

  // If the visitor never picked a theme, follow the system when it changes.
  systemDark.addEventListener("change", initTheme);
}

init();
