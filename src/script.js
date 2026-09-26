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
    "contact.phone": "phone",
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
// The command is typed, then the output streams, then the cursor blinks on a new prompt.
// Without JS all text is simply visible. Any click, key, wheel or touch finishes printing at once.

const CPS = 450; // output speed in characters per second
const command = document.querySelector(".prompt__cmd");
const output = document.querySelector(".output");
const lastPrompt = document.querySelector(".prompt--last");
const footer = document.querySelector("footer");
const cursor = document.createElement("span");
cursor.className = "cursor";
cursor.setAttribute("aria-hidden", "true");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nextFrame = () => new Promise(requestAnimationFrame);

let run = 0;
let fast = false;
let printed = []; // [textNode, fullText] of the current run

// Put back full text, e.g. before switching language mid-print.
const restore = () => printed.forEach(([node, text]) => (node.data = text));

const textNodes = (el) => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  for (let n; (n = walker.nextNode()); ) if (n.data.trim()) nodes.push([n, n.data]);
  return nodes;
};

async function print() {
  restore();
  const id = ++run;
  const live = () => id === run;
  fast = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [cmd, cmdText] = textNodes(command)[0];
  const lines = textNodes(output);
  printed = [[cmd, cmdText], ...lines];
  printed.forEach(([node]) => (node.data = ""));
  lastPrompt.hidden = footer.hidden = true;

  // fresh prompt, idle cursor for a moment, then the command is typed by hand
  cmd.after(cursor);
  cursor.classList.remove("cursor--busy");
  if (!fast) await wait(700);
  cursor.classList.add("cursor--busy");
  for (const ch of cmdText) {
    if (!live()) return;
    if (fast) break;
    cmd.data += ch;
    await wait(35 + Math.random() * 60);
  }
  if (!live()) return;
  cmd.data = cmdText;
  if (!fast) await wait(350);

  // output streams at CPS
  let t = performance.now();
  for (const [node, text] of lines) {
    node.after(cursor);
    while (node.data.length < text.length) {
      if (!live()) return;
      if (fast) { node.data = text; break; }
      await nextFrame();
      if (!live()) return;
      const now = performance.now();
      node.data = text.slice(0, node.data.length + Math.max(1, Math.round(((now - t) * CPS) / 1000)));
      t = now;
    }
  }
  if (!live()) return;
  lastPrompt.hidden = footer.hidden = false;
  lastPrompt.append(cursor);
  cursor.classList.remove("cursor--busy");
}

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
    "\n%cmichalcapoun@gmail.com",
  "color: #cc4331; font-weight: bold",
  "font-size: 14px; font-weight: bold",
  "font-size: 12px"
);
