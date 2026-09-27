// SCROLL TO TOP ON LOAD
history.scrollRestoration = "manual";
window.scrollTo(0, 0);

const storage = {
  get: (key) => { try { return localStorage.getItem(key); } catch(e) { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, val); } catch(e) {} },
};

// LANGUAGE SWITCHER

// Czech text lives in index.html; only English is kept here.
const translations = {
  en: {
    "prompt": "Introduce yourself to a recruiter. Brief, in the first person.",
    "thinking": "Thinking…",
    "role": "QA tester · mobile app testing, manual and automated",
    "about.title": "About",
    "about.p1": "I've been into computers since elementary school — I built my first one from spare parts. Through IT support, I found my way to software testing, where I discovered what I enjoy: systematically finding problems before they reach users.",
    "about.p2": "I currently focus on mobile application testing — both manual and automated. I'm interested in the whole process: understanding how something should work, all the way to verifying that a fix actually works.",
    "tools.title": "Tools",
    "tools.automation": "automation",
    "tools.mobile": "mobile",
    "tools.network": "network",
    "projects.title": "Projects",
    "projects.portfolio": "This portfolio. Plain HTML, CSS and JavaScript, no frameworks.",
    "projects.tracer": "Personal archive of trips planned in Mapy.com. Vue 3, TypeScript, Supabase.",
    "contact.title": "Contact",
    "q.test": "What do you test?",
    "q.tools": "Which tools do you use?",
    "q.experience": "What's your experience?",
    "q.contact": "How can I reach you?",
  },
};

const langButton = document.querySelector(".lang-button");
let currentLang = storage.get("selected-lang") || "cs";

const applyLanguage = (lang) => {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.dataset.cs ??= el.textContent;
    const text = lang === "cs" ? el.dataset.cs : translations.en[el.dataset.i18n];
    if (text) el.textContent = text;
  });
  langButton.textContent = lang === "cs" ? "EN" : "CS";
  langButton.setAttribute("aria-label", lang === "cs" ? "Switch to English" : "Přepnout do češtiny");
  document.documentElement.lang = lang;
  document.querySelector(".prompt__input").setAttribute("aria-label", lang === "cs" ? "Zeptej se mě na něco" : "Ask me something");
  updateThemeButton();
};

// THEME SWITCHER

const themeButton = document.querySelector(".theme-button");
const root = document.documentElement;

// The button names the theme it switches to.
function updateThemeButton() {
  const toLight = root.dataset.theme !== "light";
  const labels = { cs: ["světlý", "tmavý"], en: ["light", "dark"] }[currentLang];
  themeButton.textContent = toLight ? labels[0] : labels[1];
}

themeButton.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  storage.set("selected-theme", root.dataset.theme);
  updateThemeButton();
});

// TERMINAL PRINTING
// The question is typed into the prompt, a spinner "thinks", the answer streams, then the cursor
// blinks in the bottom prompt, where visitors can ask their own questions (prewritten answers below).
// Without JS all text is simply visible. Any click, key, wheel or touch finishes printing at once.

const CPS = 450; // output speed in characters per second
const command = document.querySelector(".prompt__text");
const thinking = document.querySelector(".thinking");
const spinner = document.querySelector(".thinking__spinner");
const output = document.querySelector(".output");
const lastPrompt = document.querySelector(".prompt--last");
const input = document.querySelector(".prompt__input");
const suggestions = document.querySelector(".suggestions");
const footer = document.querySelector("footer");
const portraits = [...document.querySelectorAll(".portrait")].map((el) => [el, el.textContent]);
const typed = document.createTextNode(""); // mirror of the input, so the block cursor can follow it
document.querySelector(".prompt__typed").append(typed);
const cursor = document.createElement("span");
cursor.className = "cursor";
cursor.setAttribute("aria-hidden", "true");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nextFrame = () => new Promise(requestAnimationFrame);
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

let run = 0;
let fast = false;
let printed = []; // [textNode, fullText] of the current run

// Put back full text, e.g. before switching language mid-print.
const restore = () => {
  printed.forEach(([node, text]) => (node.data = text));
  portraits.forEach(([el, text]) => (el.textContent = text));
};

const textNodes = (el) => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  for (let n; (n = walker.nextNode()); ) {
    if (n.data.trim() && !n.parentElement.closest(".portrait")) nodes.push([n, n.data]);
  }
  return nodes;
};

// Each step returns false once a newer run has taken over.
async function typeInto(node, text, live) {
  for (const ch of text) {
    if (!live()) return false;
    if (fast) break;
    node.data += ch;
    await wait(25 + Math.random() * 35);
  }
  if (!live()) return false;
  node.data = text;
  return true;
}

async function think(promptEl, live) {
  cursor.remove();
  promptEl.after(thinking);
  thinking.hidden = fast;
  for (const frame of "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏") {
    if (!live()) return false;
    if (fast) break;
    spinner.textContent = frame;
    await wait(80);
  }
  if (!live()) return false;
  thinking.hidden = true;
  return true;
}

async function stream(nodes, live) {
  let t = performance.now();
  for (const [node, text] of nodes) {
    node.after(cursor);
    while (node.data.length < text.length) {
      if (!live()) return false;
      if (fast) { node.data = text; break; }
      await nextFrame();
      if (!live()) return false;
      const now = performance.now();
      node.data = text.slice(0, node.data.length + Math.max(1, Math.round(((now - t) * CPS) / 1000)));
      t = now;
    }
  }
  return live();
}

// Cursor waits in the bottom prompt.
function idle() {
  lastPrompt.hidden = suggestions.hidden = footer.hidden = false;
  typed.after(cursor);
  cursor.classList.remove("cursor--busy");
}

function startRun() {
  restore();
  const id = ++run;
  fast = reducedMotion();
  return () => id === run;
}

async function print() {
  const live = startRun();
  document.querySelectorAll(".exchange").forEach((el) => el.remove());
  input.value = typed.data = "";

  const [cmd, cmdText] = textNodes(command)[0];
  const lines = textNodes(output);
  printed = [[cmd, cmdText], ...lines];
  printed.forEach(([node]) => (node.data = ""));
  portraits.forEach(([el]) => (el.textContent = ""));
  lastPrompt.hidden = suggestions.hidden = footer.hidden = thinking.hidden = true;

  // empty prompt, idle cursor for a moment, then the question is typed by hand
  cmd.after(cursor);
  cursor.classList.remove("cursor--busy");
  if (!fast) await wait(500);
  cursor.classList.add("cursor--busy");
  if (!(await typeInto(cmd, cmdText, live))) return;
  if (!(await think(command.closest(".prompt"), live))) return;
  printPortraits(live); // runs alongside the text
  if (!(await stream(lines, live))) return;
  idle();
}

// The portrait prints line by line, both theme variants in step.
async function printPortraits(live) {
  const rows = portraits.map(([el, text]) => [el, text.split("\n")]);
  for (let i = 1; i <= rows[0][1].length; i++) {
    if (!live()) return;
    if (fast) break;
    rows.forEach(([el, lines]) => (el.textContent = lines.slice(0, i).join("\n")));
    await wait(35);
  }
  if (live()) portraits.forEach(([el, text]) => (el.textContent = text));
}

// PREWRITTEN ANSWERS
// Matched by keywords against the question (lowercase, without diacritics); first match wins.
// Only facts that are on this page — anything else falls back to "write me".

const EMAIL = '<a href="mailto:michalcapoun%2Bweb@gmail.com">michalcapoun+web@gmail.com</a>';
const LINKEDIN = '<a href="https://www.linkedin.com/in/michalcapoun/" target="_blank" rel="noopener noreferrer">';
const contactRows = `
  <dl class="group">
    <div class="row"><dt>e-mail</dt><dd>${EMAIL}</dd></div>
    <div class="row"><dt>LinkedIn</dt><dd>${LINKEDIN}linkedin.com/in/michalcapoun</a></dd></div>
    <div class="row"><dt>GitHub</dt><dd><a href="https://github.com/michalcapoun" target="_blank" rel="noopener noreferrer">github.com/michalcapoun</a></dd></div>
  </dl>`;
const projectRows = (portfolio, tracer) => `
  <div class="project">
    <b>michalcapoun.cz</b><span>${portfolio}</span>
    <span class="project__links"><a href="https://github.com/michalcapoun/portfolio" target="_blank" rel="noopener noreferrer">GitHub</a></span>
  </div>
  <div class="project">
    <b>Tracer</b><span>${tracer}</span>
    <span class="project__links"><a href="https://github.com/michalcapoun/tracer" target="_blank" rel="noopener noreferrer">GitHub</a> <a href="https://tracer-six.vercel.app" target="_blank" rel="noopener noreferrer">Live</a></span>
  </div>`;

const answers = [
  {
    match: /jsi (ai|a\.i\.|robot|bot|clovek|skutecn)|are you (an? )?(ai|bot|robot|human|real)/,
    cs: "<p>Nejsem. Stránka jen vypadá jako AI – odpovědi jsem napsal předem já a vybírají se podle klíčových slov.</p>",
    en: "<p>No. This page only looks like an AI – I wrote the answers myself and they're picked by keywords.</p>",
  },
  {
    match: /^(ahoj|cau|nazdar|zdravim|dobry den|hello|hi|hey)\b|help|napoveda|co umis|na co se (muzu|mam) zeptat|what can i ask/,
    cs: "<p>Ahoj! Zeptej se mě třeba, co testuju, jaké používám nástroje, na moje projekty, praxi nebo kontakt.</p>",
    en: "<p>Hi! Ask me what I test, which tools I use, about my projects, experience or how to reach me.</p>",
  },
  {
    match: /kontakt|mail|telefon|zavol|cisl|napsat|napis|spojit|linkedin|contact|phone|call|reach|hire|nabid/,
    cs: "<p>Napiš mi e-mail nebo přes LinkedIn:</p>" + contactRows,
    en: "<p>Write me an e-mail or message me on LinkedIn:</p>" + contactRows,
  },
  {
    match: /prax|zkusenost|zivotopis|\bcv\b|resume|experience|kolik let|firm|zamestn|pozic/,
    cs: `<p>Celou pracovní historii najdeš na mém ${LINKEDIN}LinkedInu</a>. K testování jsem se dostal přes IT support a teď se věnuji testování mobilních aplikací, ručně i automatizovaně.</p>`,
    en: `<p>My full work history is on my ${LINKEDIN}LinkedIn</a>. I got into testing through IT support and now I focus on mobile app testing, both manual and automated.</p>`,
  },
  {
    match: /nastroj|stack|technolog|appium|playwright|typescript|postman|swagger|proxyman|azure|automatiz|tool|framework/,
    cs: "<p>Automatizuji v TypeScriptu – primárně s Appium, zkušenosti mám i s Playwright. Pro mobilní platformy UIAutomator2 a XCUITest, pro API Postman a Swagger, síť analyzuji v Proxyman. Při diagnostice backendových chyb používám Azure Application Insights.</p>",
    en: "<p>I automate in TypeScript — primarily with Appium, with some experience in Playwright. For mobile platforms UIAutomator2 and XCUITest, for API Postman and Swagger, network analysis in Proxyman. For diagnosing backend errors I use Azure Application Insights.</p>",
  },
  {
    match: /testuj|testovan|co delas|prace|pracuj|mobil|aplikac|\bqa\b|what do you (do|test)|job|work|role/,
    cs: () => `<p>${translations.cs["about.p2"]}</p>`,
    en: () => `<p>${translations.en["about.p2"]}</p>`,
  },
  {
    match: /projekt|portfolio|tracer|github|ukazk|project|built/,
    cs: () => projectRows(translations.cs["projects.portfolio"], translations.cs["projects.tracer"]),
    en: () => projectRows(translations.en["projects.portfolio"], translations.en["projects.tracer"]),
  },
  {
    match: /kdo|o sobe|predstav|zacal|cesta|jak ses|pocitac|who|about|yourself|story|start/,
    cs: () => `<p>${translations.cs["about.p1"]}</p>`,
    en: () => `<p>${translations.en["about.p1"]}</p>`,
  },
];
const fallback = {
  cs: `<p>Na tohle ti líp odpovím osobně – napiš mi na ${EMAIL}.</p>`,
  en: `<p>I'd rather answer that in person – write me at ${EMAIL}.</p>`,
};

// Czech texts live in the HTML; collect them once so answers can reuse them.
translations.cs = Object.fromEntries(
  [...document.querySelectorAll("[data-i18n]")].map((el) => [el.dataset.i18n, el.dataset.cs ?? el.textContent])
);

const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function answerFor(question) {
  const q = normalize(question);
  const html = (answers.find((a) => a.match.test(q)) ?? fallback)[currentLang];
  return typeof html === "function" ? html() : html;
}

async function ask(question, typeIt) {
  question = question.trim();
  if (!question) return;
  const live = startRun();
  input.value = typed.data = "";
  cursor.classList.add("cursor--busy");
  if (typeIt) {
    typed.after(cursor);
    if (!(await typeInto(typed, question, live))) return;
  }

  const exchange = document.createElement("div");
  exchange.className = "exchange";
  exchange.innerHTML = `
    <p class="prompt"><span class="prompt__sign" aria-hidden="true">&gt;</span><span class="prompt__text"></span></p>
    <div class="answer"><span class="output__mark" aria-hidden="true">●</span>${answerFor(question)}</div>`;
  exchange.querySelector(".prompt__text").textContent = question; // visitor text, never as HTML
  typed.data = "";
  lastPrompt.before(exchange);
  exchange.scrollIntoView({ block: "start", behavior: fast ? "auto" : "smooth" });

  const lines = textNodes(exchange.querySelector(".answer"));
  printed = lines;
  lines.forEach(([node]) => (node.data = ""));
  if (!(await think(exchange.querySelector(".prompt"), live))) return;
  if (!(await stream(lines, live))) return;
  idle();
}

input.addEventListener("input", () => {
  typed.data = input.value;
  if (!cursor.classList.contains("cursor--busy")) typed.after(cursor);
});
lastPrompt.addEventListener("submit", (e) => {
  e.preventDefault();
  ask(input.value, false);
});
suggestions.querySelectorAll("button").forEach((btn) => btn.addEventListener("click", () => ask(btn.textContent, true)));

["pointerdown", "keydown", "wheel", "touchstart"].forEach((e) =>
  addEventListener(e, () => (fast = true), { passive: true })
);

langButton.addEventListener("click", () => {
  restore();
  currentLang = currentLang === "cs" ? "en" : "cs";
  storage.set("selected-lang", currentLang);
  applyLanguage(currentLang);
  print();
});

applyLanguage(currentLang);
print();

// CONSOLE GREETING

console.log(
  "%c  \\( )/\n  -( )-\n  /( )\\\n\n%c" +
    (currentLang === "cs" ? "Hledáš bugy? To je moje práce. Napiš mi:" : "Looking for bugs? That's my job. Say hi:") +
    "\n%cmichalcapoun+web@gmail.com",
  "color: #cc4331; font-weight: bold",
  "font-size: 14px; font-weight: bold",
  "font-size: 12px"
);
