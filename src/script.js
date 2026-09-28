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
    "thinking": "Thinking…",
    "prompt.work": "What have you worked on?",
    "prompt.contact": "How can I reach you?",
    "role": "QA tester · automation with AI",
    "about.p1": "I've been into computers since elementary school — I built my first one from spare parts. Through IT support, I found my way to software testing, where I discovered what I enjoy: systematically finding problems before they reach users.",
    "about.p2": "I currently test web and mobile applications, mostly with automation and the help of AI. I'm interested in the whole process: understanding how something should work, all the way to verifying that a fix actually works.",
    "work.now": "now",
    "work.cornerstone": "Mostly automated, AI-assisted testing of web and mobile apps. As a contractor.",
    "work.cyberfox": "Manual and automated testing of a mobile app (Appium), E2E scenarios, API tests in Postman, data checks in SQL. Contractor from 07/2025.",
    "work.assist": "Web app calculating car sales bonuses for Renault. Java, Spring Boot, SQL, AWS.",
    "work.bluepool": "Testing web and mobile apps, tests in Playwright, Appium and Postman.",
    "projects.portfolio": "This portfolio. Plain HTML, CSS and JavaScript, no frameworks.",
    "projects.tracer": "Personal archive of trips planned in Mapy.com. Vue 3, TypeScript, Supabase.",
  },
};

// FIRST QUESTION
// A few wordings of the same request, so a returning visitor doesn't see the same question typed every time; the
// answer below fits them all. Never the one shown last. The HTML keeps the first one for visitors without JS.
const PROMPTS = [
  { cs: "Představ se personalistovi. Stručně a v první osobě.", en: "Introduce yourself to a recruiter. Brief, in the first person." },
  { cs: "Kdo jsi a co děláš? Krátce, pro personalistu.", en: "Who are you and what do you do? Briefly, for a recruiter." },
  { cs: "Napiš o sobě pár vět v první osobě.", en: "Write a few sentences about yourself in the first person." },
  { cs: "Shrň pro personalistu, kdo jsi a co umíš.", en: "Sum up for a recruiter who you are and what you can do." },
  { cs: "Stručně se představ někomu, kdo hledá testera.", en: "Briefly introduce yourself to someone looking for a tester." },
  { cs: "Představ se, jako bys mluvil s personalistou.", en: "Introduce yourself as if you were talking to a recruiter." },
  { cs: "Kdo jsi? Pár vět pro někoho, kdo hledá QA testera.", en: "Who are you? A few sentences for someone looking for a QA tester." },
  { cs: "Popiš se v pár větách, ať vím, s kým mluvím.", en: "Describe yourself in a few sentences so I know who I'm talking to." },
  { cs: "Hledám testera do týmu. Kdo jsi?", en: "I'm looking for a tester for my team. Who are you?" },
];
{
  const last = storage.get("last-prompt");
  const choices = PROMPTS.map((_, i) => i).filter((i) => String(i) !== last);
  const pick = choices[Math.floor(Math.random() * choices.length)];
  storage.set("last-prompt", pick);
  document.querySelector(".prompt__text").dataset.cs = PROMPTS[pick].cs;
  translations.en.prompt = PROMPTS[pick].en;
}

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
// The name is drawn, then for each part a question is typed into its prompt, a spinner "thinks" and
// the answer streams. Then the cursor blinks on a new line under the last answer.
// Without JS all text is simply visible. Any click, key, wheel or touch finishes printing at once.

const CPS = 450; // output speed in characters per second
const thinking = document.querySelector(".thinking");
const spinner = document.querySelector(".thinking__spinner");
const steps = [...document.querySelectorAll(".step")];
const role = document.querySelector(".intro p");
const banner = document.querySelector(".banner");
const art = [...document.querySelectorAll(".banner, .portrait")].map((el) => [el, el.textContent]);
// Block cursor, like a terminal's
const cursor = document.createElement("span");
cursor.className = "cursor";
cursor.setAttribute("aria-hidden", "true");

// Puts the (empty) block cursor right after a node that is being printed.
const moveCursor = (node) => {
  cursor.textContent = "\u00a0";
  node.after(cursor);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nextFrame = () => new Promise(requestAnimationFrame);
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

let run = 0;
let fast = false;
let userSkipped = false; // the visitor clicked, scrolled or pressed a key during this run: stop following output
let printed = []; // [textNode, fullText] of the current run

// Put back full text, e.g. before switching language mid-print.
const restore = () => {
  printed.forEach(([node, text]) => (node.data = text));
  art.forEach(([el, text]) => (el.textContent = text));
};

const textNodes = (el) => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  for (let n; (n = walker.nextNode()); ) {
    if (n.data.trim() && !n.parentElement.closest(".banner, .portrait")) nodes.push([n, n.data]);
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

// follow: keep the cursor in view while printing, like a terminal scrolling with its output
async function stream(nodes, live, follow = false) {
  let t = performance.now();
  for (const [node, text] of nodes) {
    moveCursor(node);
    while (node.data.length < text.length) {
      if (!live()) return false;
      if (fast) { node.data = text; break; }
      await nextFrame();
      if (!live()) return false;
      const now = performance.now();
      node.data = text.slice(0, node.data.length + Math.max(1, Math.round(((now - t) * CPS) / 1000)));
      t = now;
      if (follow && !userSkipped) cursor.scrollIntoView({ block: "nearest" });
    }
  }
  return live();
}

function startRun() {
  restore();
  const id = ++run;
  fast = reducedMotion();
  userSkipped = false;
  return () => id === run;
}

async function print() {
  const live = startRun();
  const roleLines = textNodes(role);
  const parts = steps.map((step) => ({
    step,
    cmd: textNodes(step.querySelector(".prompt__text"))[0],
    lines: textNodes(step.querySelector(".output")),
  }));
  printed = [...roleLines, ...parts.flatMap(({ cmd, lines }) => [cmd, ...lines])];
  printed.forEach(([node]) => (node.data = ""));
  art.forEach(([el, text]) => (el.textContent = blank(text)));
  steps.forEach((step) => (step.hidden = true));
  thinking.hidden = true;

  // name and portrait are drawn first, then the role
  drawArt(art.filter(([el]) => el !== banner), live); // the portrait runs alongside everything else
  if (!(await drawArt(art.filter(([el]) => el === banner), live))) return;
  if (!(await stream(roleLines, live))) return;

  // each part: empty prompt, idle cursor for a moment, the question typed by hand, then the answer.
  // The first part starts at the top; later ones are followed until the visitor scrolls or clicks.
  for (const [i, { step, cmd: [cmd, cmdText], lines }] of parts.entries()) {
    step.hidden = false;
    if (i && !fast) step.scrollIntoView({ block: "nearest" }); // fast: skipped, or no animation at all
    moveCursor(cmd);
    cursor.classList.remove("cursor--busy");
    if (!fast) await wait(500);
    cursor.classList.add("cursor--busy");
    if (!(await typeInto(cmd, cmdText, live))) return;
    if (!(await think(step.querySelector(".prompt"), live))) return;
    if (!(await stream(lines, live, i > 0))) return;
  }
  steps.at(-1).after(cursor); // on its own line, not inside the last link
  cursor.classList.remove("cursor--busy");
}

// Undrawn rows are spaces of the same length, so the art keeps its size and nothing around it moves.
const blank = (text) => text.replace(/[^\n]/g, " ");

// ASCII art prints line by line; both portrait variants in step.
async function drawArt(entries, live) {
  const rows = entries.map(([el, text]) => [el, text.split("\n"), blank(text).split("\n")]);
  for (let i = 1; i <= rows[0][1].length; i++) {
    if (!live()) return false;
    if (fast) break;
    rows.forEach(([el, lines, blanks]) => (el.textContent = lines.map((line, j) => (j < i ? line : blanks[j])).join("\n")));
    await wait(35);
  }
  if (!live()) return false;
  entries.forEach(([el, text]) => (el.textContent = text));
  return true;
}

["pointerdown", "keydown", "wheel", "touchstart"].forEach((e) =>
  addEventListener(e, () => (fast = userSkipped = true), { passive: true })
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
    "\n%cmichalcapoun@gmail.com",
  "color: #cc4331; font-weight: bold",
  "font-size: 14px; font-weight: bold",
  "font-size: 12px"
);
