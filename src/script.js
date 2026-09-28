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

// FIRST QUESTION
// A few wordings of the same request, so a returning visitor doesn't see the same question typed every time; the
// answer below fits them all. Never the one shown last. The HTML keeps the first one for visitors without JS.
const PROMPTS = [
  { cs: "Představ se personalistovi. Stručně a v první osobě.", en: "Introduce yourself to a recruiter. Brief, in the first person." },
  { cs: "Kdo jsi a co děláš? Krátce, pro personalistu.", en: "Who are you and what do you do? Briefly, for a recruiter." },
  { cs: "Napiš o sobě pár vět pro náboráře. V první osobě.", en: "Write a few sentences about yourself for a recruiter. In the first person." },
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
const portraits = [...document.querySelectorAll(".portrait")].map((el) => [el, el.textContent]);
// The input is mirrored as text before the caret, the block cursor (covering the character
// under the caret, like a terminal) and text after it.
const typed = document.createTextNode("");
const afterCaret = document.createTextNode("");
const cursor = document.createElement("span");
cursor.className = "cursor";
cursor.setAttribute("aria-hidden", "true");
document.querySelector(".prompt__typed").append(typed, afterCaret);

// Puts the (empty) block cursor right after a node that is being printed.
const moveCursor = (node) => {
  cursor.textContent = "\u00a0";
  node.after(cursor);
};

function renderLine() {
  if (closed || lastPrompt.hidden || cursor.classList.contains("cursor--busy")) return; // the cursor is elsewhere
  lastPromptPath.textContent = pathLabel(cwd);
  lastPromptPath.hidden = !cwd.length;
  const value = input.value;
  const pos = input.selectionStart ?? value.length;
  typed.data = value.slice(0, pos);
  cursor.textContent = value[pos] ?? "\u00a0";
  afterCaret.data = value.slice(pos + 1);
  typed.after(cursor);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nextFrame = () => new Promise(requestAnimationFrame);
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const MAX_TYPED = 20; // questions and commands a visitor can type before the prompt closes

let run = 0;
let fast = false;
let userSkipped = false; // the visitor clicked, scrolled or typed during this run: stop following output
let typedCount = 0;
let closed = false;
let typedTimes = []; // timestamps of recent typed questions (flood detection)
let typedHistory = []; // everything the visitor typed, for the `history` command (not `history`: that would shadow window.history)
let typingQuestion = false; // a suggestion is being typed into the prompt; new questions wait
const usedSuggestions = new Set();
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

// Cursor waits in the bottom prompt.
function idle() {
  if (closed) return cursor.remove();
  lastPrompt.hidden = suggestions.hidden = false;
  cursor.classList.remove("cursor--busy");
  renderLine();
}

// Closed (after `exit` or the question limit): the prompt and suggestions are gone.
function setClosed(value) {
  closed = input.disabled = value;
  lastPrompt.hidden = suggestions.hidden = value;
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
  document.querySelectorAll(".exchange").forEach((el) => el.remove());
  input.value = typed.data = afterCaret.data = "";
  typedCount = 0;
  setClosed(false);
  typedTimes = [];
  typedHistory = [];
  histPos = 0;
  cwd = prevCwd = [];
  usedSuggestions.clear();
  suggestions.querySelectorAll("button").forEach((btn) => (btn.disabled = false));

  const [cmd, cmdText] = textNodes(command)[0];
  const lines = textNodes(output);
  printed = [[cmd, cmdText], ...lines];
  printed.forEach(([node]) => (node.data = ""));
  portraits.forEach(([el]) => (el.textContent = ""));
  lastPrompt.hidden = suggestions.hidden = thinking.hidden = true;

  // empty prompt, idle cursor for a moment, then the question is typed by hand
  moveCursor(cmd);
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

const EMAIL = '<a href="mailto:michalcapoun@gmail.com">michalcapoun@gmail.com</a>';
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
    match: /(jsi|je to|to je) (ai|a\.i\.|robot|bot|clovek|skutecn|umela inteligence|chatgpt)|(are you|is (this|it)) (an? )?(ai|bot|robot|human|real|chatgpt)/,
    cs: "<p>Ne. Stránka jen vypadá jako AI – odpovědi jsem napsal předem já a vybírají se podle klíčových slov.</p>",
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
    match: /nastroj|stack|technolog|appium|playwright|typescript|postman|swagger|proxyman|azure|automatiz|tool|framework/,
    cs: "<p>Automatizuji v TypeScriptu – primárně s Appium, zkušenosti mám i s Playwright. Pro mobilní platformy UIAutomator2 a XCUITest, pro API Postman a Swagger, síť analyzuji v Proxyman. Při diagnostice backendových chyb používám Azure Application Insights.</p>",
    en: "<p>I automate in TypeScript — primarily with Appium, with some experience in Playwright. For mobile platforms UIAutomator2 and XCUITest, for API Postman and Swagger, network analysis in Proxyman. For diagnosing backend errors I use Azure Application Insights.</p>",
  },
  {
    match: /prax|zkusenost|zivotopis|\bcv\b|resume|experience|kolik let|firm|zamestn|pozic/,
    cs: `<p>Celou pracovní historii najdeš na mém ${LINKEDIN}LinkedInu</a>. K testování jsem se dostal přes IT support a teď se věnuji testování mobilních aplikací, ručně i automatizovaně.</p>`,
    en: `<p>My full work history is on my ${LINKEDIN}LinkedIn</a>. I got into testing through IT support and now I focus on mobile app testing, both manual and automated.</p>`,
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
    match: /kdo|o sobe|predstav|zacal|cesta|jak ses|pocitac|\bwho\b|about you|^about\b|yourself|story|did you start|started|get into|got into/,
    cs: () => `<p>${translations.cs["about.p1"]}</p>`,
    en: () => `<p>${translations.en["about.p1"]}</p>`,
  },
];
const closingNote = {
  cs: `<p class="dim">Tohle byla poslední otázka, kterou tu zvládnu. Na další ti rád odpovím osobně – ${EMAIL}.</p>`,
  en: `<p class="dim">That was the last question I can take here. Happy to answer more in person – ${EMAIL}.</p>`,
};
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

// FAKE SHELL
// A few real commands over a tiny read-only file system built from the page's own content.
// Anything that isn't a known command goes to the prewritten answers.

let cwd = []; // path below the home directory, e.g. ["projects"]
let prevCwd = []; // for `cd -`
const pathLabel = (parts) => (parts.length ? `~/${parts.join("/")}` : "");
const lastPromptPath = lastPrompt.querySelector(".prompt__path");

// Prompt of a finished line; shows the directory it was typed in, like a shell prompt.
const promptMarkup = (parts) => `<p class="prompt">${parts.length ? `<span class="prompt__path">${esc(pathLabel(parts))}</span>` : ""}<span class="prompt__sign" aria-hidden="true">&gt;</span><span class="prompt__text"></span></p>`;
const HOME = "/Users/michal";
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;

function files() {
  const t = translations[currentLang];
  const label = (key) => t[key].padEnd(14);
  return {
    "about.txt": `${t["about.p1"]}\n\n${t["about.p2"]}`,
    "tools.txt": [
      `${label("tools.automation")}TypeScript, Appium, Playwright`,
      `${label("tools.mobile")}UIAutomator2, XCUITest`,
      `${"API".padEnd(14)}Postman, Swagger`,
      `${label("tools.network")}Proxyman`,
      `${"backend".padEnd(14)}Azure Application Insights`,
    ].join("\n"),
    "contact.txt": [
      `${"e-mail".padEnd(14)}${EMAIL}`,
      `${"LinkedIn".padEnd(14)}${link("https://www.linkedin.com/in/michalcapoun/", "linkedin.com/in/michalcapoun")}`,
      `${"GitHub".padEnd(14)}${link("https://github.com/michalcapoun", "github.com/michalcapoun")}`,
    ].join("\n"),
    projects: {
      "michalcapoun.cz": {
        "README.md": `# michalcapoun.cz\n\n${t["projects.portfolio"]}\n\nGitHub  ${link("https://github.com/michalcapoun/portfolio", "github.com/michalcapoun/portfolio")}`,
      },
      tracer: {
        "README.md": `# Tracer\n\n${t["projects.tracer"]}\n\nGitHub  ${link("https://github.com/michalcapoun/tracer", "github.com/michalcapoun/tracer")}\nLive    ${link("https://tracer-six.vercel.app", "tracer-six.vercel.app")}`,
      },
    },
  };
}

// Resolves a path to [segments, node]; node is undefined when it doesn't exist.
// Nothing above the home directory is reachable (like a chroot); names match case-insensitively.
function resolve(path = "") {
  let parts;
  if (path === "~" || path.startsWith("~/")) [parts, path] = [[], path.slice(1)];
  else if (path === HOME || path.startsWith(HOME + "/")) [parts, path] = [[], path.slice(HOME.length)];
  else if (path.startsWith("/")) return [[], undefined];
  else parts = [...cwd];
  for (const seg of path.split("/").filter(Boolean)) {
    if (seg === "..") parts.pop();
    else if (seg !== ".") parts.push(seg);
  }
  let node = files();
  const found = [];
  for (const seg of parts) {
    const key = isDir(node) ? Object.keys(node).find((k) => k.toLowerCase() === seg.toLowerCase()) : undefined;
    if (key === undefined) return [found, undefined];
    found.push(key);
    node = node[key];
  }
  return [found, node];
}

const isDir = (node) => typeof node === "object";
const textLength = (html) => new TextEncoder().encode(html.replace(/<[^>]+>/g, "")).length;
const modified = new Date(document.lastModified); // when the server last changed this page

function lsLong(name, node) {
  const d = modified;
  const date = `${d.toLocaleString("en-US", { month: "short" })} ${String(d.getDate()).padStart(2)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const dir = isDir(node);
  const size = dir ? (Object.keys(node).length + 2) * 32 : textLength(node);
  const links = dir ? 2 + Object.values(node).filter(isDir).length : 1;
  const shown = dir ? `<span class="shell__dir">${esc(name)}</span>` : esc(name);
  return `${dir ? "drwxr-xr-x" : "-rw-r--r--"}  ${links} michal  staff  ${String(size).padStart(5)} ${date} ${shown}`;
}

const plain = (html) => html.replace(/<[^>]+>/g, "");
const pad2 = (n) => String(n).padStart(2, "0");
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const env = () => ({
  HOME, USER: "michal", SHELL: "/bin/zsh", PWD: [HOME, ...cwd].join("/"),
  LANG: currentLang === "cs" ? "cs_CZ.UTF-8" : "en_US.UTF-8", TERM: "xterm-256color",
});
const BUILTINS = ["cd", "echo", "pwd", "history", "exit", "logout", "which"];

function wrap(text, width) {
  const lines = [""];
  for (const word of text.split(" ")) {
    if ((lines.at(-1) + " " + word).trim().length > width) lines.push(word);
    else lines[lines.length - 1] = (lines.at(-1) + " " + word).trim();
  }
  return lines;
}

// Reads a file for commands like head or grep: [text] or [undefined, error message].
function readFile(name, path) {
  const [, node] = resolve(path);
  if (node === undefined) return [undefined, `${name}: ${esc(path)}: No such file or directory`];
  if (isDir(node)) return [undefined, `${name}: ${esc(path)}: Is a directory`];
  return [node];
}

// Returns { html } for a known command (html may be empty), or null.
function runCommand(input) {
  // split like a shell: quoted strings stay one argument, quotes are dropped
  const [cmd, ...args] = input.match(/"[^"]*"|'[^']*'|\S+/g).map((t) => t.replace(/^(["'])(.*)\1$/, "$2"));
  const name = cmd.toLowerCase();
  const cs = currentLang === "cs";
  const flags = args.filter((a) => a.startsWith("-")).join("").replace(/-/g, "");
  const paths = args.filter((a) => !a.startsWith("-"));
  const out = (html) => ({ html });

  switch (name) {
    case "ls": {
      const bad = [...flags].find((f) => !"la1".includes(f));
      if (bad) return out(`ls: invalid option -- ${esc(bad)}\nusage: ls [-al1] [file ...]`);
      const [, node] = resolve(paths[0]);
      if (node === undefined) return out(`ls: ${esc(paths[0])}: No such file or directory`);
      if (!isDir(node)) return out(flags.includes("l") ? lsLong(paths[0], node) : esc(paths[0]));
      let entries = Object.entries(node).sort(([a], [b]) => a.localeCompare(b));
      if (flags.includes("a")) entries = [[".", node], ["..", node], ...entries];
      if (flags.includes("l")) {
        const total = entries.filter(([, n]) => !isDir(n)).length * 8;
        return out([`total ${total}`, ...entries.map(([n, v]) => lsLong(n, v))].join("\n"));
      }
      const names = entries.map(([n, v]) => (isDir(v) ? `<span class="shell__dir">${esc(n)}</span>` : esc(n)));
      return out(names.join(flags.includes("1") ? "\n" : "    "));
    }
    case "cd": {
      if (args[0] === "-") {
        [cwd, prevCwd] = [prevCwd, cwd];
        return out(esc(pathLabel(cwd) || "~"));
      }
      const [parts, node] = resolve(paths[0] ?? "~");
      if (node === undefined) return out(`cd: no such file or directory: ${esc(paths[0])}`);
      if (!isDir(node)) return out(`cd: not a directory: ${esc(paths[0])}`);
      [prevCwd, cwd] = [cwd, parts];
      return out("");
    }
    case "git": return out("fatal: not a git repository (or any of the parent directories): .git");
    case "man": {
      if (!paths[0]) return out("What manual page do you want?");
      if (!/^michal(capoun)?$/i.test(paths[0])) return out(`No manual entry for ${esc(paths[0])}`);
      const t = translations[currentLang];
      return out([
        "MICHAL(1)                  User Commands                  MICHAL(1)", "",
        "<b>NAME</b>", `       michal – ${esc(t.role)}`, "",
        "<b>SYNOPSIS</b>", "       cat about.txt | tools.txt | contact.txt", "",
        "<b>DESCRIPTION</b>", ...wrap(t["about.p2"], 60).map((l) => "       " + esc(l)), "",
        "<b>SEE ALSO</b>", "       ls(1), cat(1), tree(1)",
      ].join("\n"));
    }
    case "tree": {
      const [, node] = resolve(paths[0]);
      if (!isDir(node)) return out(`${esc(paths[0])} [error opening dir]\n\n0 directories, 0 files`);
      let dirs = 0, count = 0;
      const walk = (dir, prefix) => Object.entries(dir).sort(([a], [b]) => a.localeCompare(b)).flatMap(([n, v], i, all) => {
        const lastOne = i === all.length - 1;
        const branch = prefix + (lastOne ? "└── " : "├── ");
        if (!isDir(v)) return count++, [branch + esc(n)];
        dirs++;
        return [branch + `<span class="shell__dir">${esc(n)}</span>`, ...walk(v, prefix + (lastOne ? "    " : "│   "))];
      });
      const lines = walk(node, "");
      return out([`<span class="shell__dir">${esc(paths[0] ?? ".")}</span>`, ...lines, "",
        `${dirs} director${dirs === 1 ? "y" : "ies"}, ${count} file${count === 1 ? "" : "s"}`].join("\n"));
    }
    case "head": case "tail": {
      let n = 10;
      const targets = [];
      for (let i = 0; i < args.length; i++) {
        if (args[i] === "-n") n = Number(args[++i]);
        else if (/^-n?\d+$/.test(args[i])) n = Number(args[i].replace(/^-n?/, ""));
        else targets.push(args[i]);
      }
      if (!Number.isInteger(n) || n < 0) return out(`${name}: illegal line count -- ${esc(String(args[args.indexOf("-n") + 1] ?? ""))}`);
      if (!targets.length) return out(`usage: ${name} [-n lines] [file ...]`);
      return out(targets.map((p) => {
        const [text, error] = readFile(name, p);
        if (error) return error;
        const lines = text.split("\n");
        const part = name === "head" ? lines.slice(0, n) : n ? lines.slice(-n) : [];
        return (targets.length > 1 ? `==> ${esc(p)} <==\n` : "") + part.join("\n");
      }).join("\n\n"));
    }
    case "wc": {
      if (!paths.length) return out("usage: wc [-clw] [file ...]");
      const shown = flags ? [..."lwc"].filter((f) => flags.includes(f)) : ["l", "w", "c"];
      return out(paths.map((p) => {
        const [html, error] = readFile(name, p);
        if (error) return error;
        const text = plain(html) + "\n";
        const counts = { l: text.split("\n").length - 1, w: text.split(/\s+/).filter(Boolean).length, c: new TextEncoder().encode(text).length };
        return shown.map((k) => String(counts[k]).padStart(8)).join("") + " " + esc(p);
      }).join("\n"));
    }
    case "grep": {
      const [pattern, ...targets] = paths;
      if (!pattern) return out("usage: grep [-i] pattern [file ...]");
      const test = new RegExp(escRe(pattern), flags.includes("i") ? "i" : "");
      const split = new RegExp(`(${escRe(pattern)})`, flags.includes("i") ? "i" : "");
      return out(targets.flatMap((p) => {
        const [html, error] = readFile(name, p);
        if (error) return [error];
        return plain(html).split("\n").filter((l) => test.test(l)).map((l) =>
          (targets.length > 1 ? `<span class="shell__dir">${esc(p)}</span>:` : "") +
          l.split(split).map((part, i) => (i % 2 ? `<span class="shell__match">${esc(part)}</span>` : esc(part))).join(""));
      }).join("\n"));
    }
    case "which": return out(paths.map((c) =>
      BUILTINS.includes(c) ? `${esc(c)}: shell built-in command` : COMMANDS.includes(c) ? `/bin/${esc(c)}` : `${esc(c)} not found`).join("\n"));
    case "env": case "printenv": return out(Object.entries(env()).map(([k, v]) => `${k}=${esc(v)}`).join("\n"));
    case "hostname": return out(esc(location.hostname || "michalcapoun.cz"));
    case "id": return out("uid=501(michal) gid=20(staff) groups=20(staff)");
    case "uname": return out(flags.includes("a") ? `Darwin ${esc(location.hostname || "michalcapoun.cz")} 25.6.0 Darwin Kernel Version 25.6.0 arm64` : "Darwin");
    case "uptime": {
      const now = new Date();
      const mins = Math.floor(performance.now() / 60000); // since this page was opened
      const up = mins < 60 ? `${mins} min${mins === 1 ? "" : "s"}` : `${Math.floor(mins / 60)}:${pad2(mins % 60)}`;
      return out(`${pad2(now.getHours())}:${pad2(now.getMinutes())}  up ${up}, 1 user`);
    }
    case "less": case "more":
    case "cat": {
      if (!paths.length) return out(cs ? "cat: chybí název souboru" : "cat: missing file name");
      return out(paths.map((p) => {
        const [, node] = resolve(p);
        if (node === undefined) return `cat: ${esc(p)}: No such file or directory`;
        if (isDir(node)) return `cat: ${esc(p)}: Is a directory`;
        return node;
      }).join("\n"));
    }
    case "pwd": return out(esc([HOME, ...cwd].join("/")));
    case "whoami": return out("michal");
    case "echo": return out(esc(args.join(" ").replace(/\$\{?([A-Za-z_]\w*)\}?/g, (_, k) => env()[k] ?? "")));
    case "date": return out(esc(new Date().toString()));
    case "history": return out(typedHistory.map((h, i) => `${String(i + 1).padStart(5)}  ${esc(h)}`).join("\n"));
    case "clear": return { clear: true };
    case "help": return out(cs
      ? `Tohle je jen napodobenina shellu nad obsahem portfolia.\nUmí: ${COMMANDS.join(", ")}\nKlávesy: ↑/↓ historie, Tab doplňování, Ctrl+C, Ctrl+L, Ctrl+U, Ctrl+D\n\nNa ostatní se zeptej normálně, třeba „Co testuješ?“ nebo zkus „man michal“.`
      : `This is just a mock shell over the portfolio's content.\nIt knows: ${COMMANDS.join(", ")}\nKeys: Up/Down history, Tab completion, Ctrl+C, Ctrl+L, Ctrl+U, Ctrl+D\n\nFor anything else just ask, e.g. "What do you test?", or try "man michal".`);
    case "sudo": return out("michal is not in the sudoers file. This incident will be reported.");
    case "rm": case "rmdir": case "mv": case "cp": case "touch": case "mkdir": case "chmod": case "chown":
      return out(`${name}: ${esc(paths.at(-1) ?? ".")}: Read-only file system`);
    case "exit": case "logout": return { html: `logout\n\n${cs ? "[Proces dokončen]" : "[Process completed]"}`, exit: true };
    default: return null;
  }
}

// Programs this "machine" doesn't have, and single words that aren't questions, fail like zsh does.
// Words the prewritten answers know (kontakt, portfolio, cv…) still get an answer.
const NOT_INSTALLED = ["npm", "npx", "node", "python", "python3", "pip", "vim", "vi", "nano", "emacs", "ssh", "ping",
  "top", "htop", "ps", "kill", "apt", "apt-get", "brew", "docker", "make", "java", "go", "cargo", "yarn", "code", "telnet"];

function unknownCommand(input) {
  const [first] = input.split(/\s+/);
  if (/^\.{0,2}\//.test(first)) {
    const [, node] = resolve(first);
    if (node === undefined) return `zsh: no such file or directory: ${esc(first)}`;
    return `zsh: permission denied: ${esc(first)}`;
  }
  if (NOT_INSTALLED.includes(first.toLowerCase())) return `zsh: command not found: ${esc(first)}`;
  const oneWord = /^[a-z0-9._~+-]+$/i.test(input);
  if (oneWord && !answers.some((a) => a.match.test(normalize(input)))) return `zsh: command not found: ${esc(input)}`;
  return null;
}

// Shell output appears at once, like in a real terminal: no thinking, no streaming.
function shellReply(question, shell, last, where = cwd) {
  typed.data = afterCaret.data = "";
  if (shell.clear) {
    document.querySelectorAll(".exchange").forEach((el) => el.remove());
    return idle();
  }
  const exchange = document.createElement("div");
  exchange.className = "exchange";
  exchange.innerHTML = `
    ${promptMarkup(where)}
    ${shell.html ? `<pre class="shell">${shell.html}</pre>` : ""}
    ${last ? `<div class="answer">${closingNote[currentLang]}</div>` : ""}`;
  exchange.querySelector(".prompt__text").textContent = question; // visitor text, never as HTML
  lastPrompt.before(exchange);
  if (shell.exit) setClosed(true);
  idle();
  (closed ? exchange : lastPrompt).scrollIntoView({ block: "nearest" });
}

async function ask(question, typeIt, last = false) {
  question = question.trim();
  if (!question) return;
  const live = startRun();
  input.value = typed.data = afterCaret.data = "";
  cursor.classList.add("cursor--busy");
  if (typeIt) {
    moveCursor(typed);
    typingQuestion = true;
    const done = await typeInto(typed, question, live);
    typingQuestion = false;
    if (!done) return;
  }

  const where = cwd;
  const shell = runCommand(question);
  if (shell) return shellReply(question, shell, last, where);
  const failed = unknownCommand(question);
  if (failed) return shellReply(question, { html: failed }, last, where);

  const exchange = document.createElement("div");
  exchange.className = "exchange";
  exchange.innerHTML = `
    ${promptMarkup(where)}
    <div class="answer"><span class="output__mark" aria-hidden="true">●</span>${answerFor(question)}${last ? closingNote[currentLang] : ""}</div>`;
  exchange.querySelector(".prompt__text").textContent = question; // visitor text, never as HTML
  typed.data = afterCaret.data = "";
  lastPrompt.before(exchange);
  exchange.scrollIntoView({ block: "nearest" });

  const lines = textNodes(exchange.querySelector(".answer"));
  printed = lines;
  lines.forEach(([node]) => (node.data = ""));
  if (!(await think(exchange.querySelector(".prompt"), live))) return;
  if (!(await stream(lines, live, true))) return;
  idle();
  if (!userSkipped) lastPrompt.scrollIntoView({ block: "nearest" });
}

// Keep the mirror in step with typing and caret moves (arrows, clicks, selection).
["input", "keyup", "click", "focus"].forEach((e) => input.addEventListener(e, renderLine));
document.addEventListener("selectionchange", renderLine);
lastPrompt.addEventListener("submit", (e) => {
  e.preventDefault();
  let question = input.value.trim();
  if (closed || typingQuestion || !question) return;
  if (question === "!!") {
    if (!typedHistory.length) {
      setLine("");
      return shellReply("!!", { html: "zsh: no such event: 0" }, false);
    }
    question = typedHistory.at(-1);
  }
  const now = Date.now();
  typedTimes = [...typedTimes.filter((t) => now - t < FLOOD_MS), now];
  const kind = injectionIn(question) ?? (typedTimes.length >= FLOOD_COUNT ? "flood" : null);
  if (kind) return gameOver(kind, question);
  typedCount++;
  typedHistory.push(question);
  histPos = typedHistory.length;
  hideCompletions();
  const last = typedCount >= MAX_TYPED;
  if (last) setClosed(true);
  ask(question, false, last);
});
suggestions.querySelectorAll("button").forEach((btn) =>
  btn.addEventListener("click", () => {
    if (closed || typingQuestion) return;
    usedSuggestions.add(btn);
    btn.disabled = true;
    ask(btn.textContent, true);
  })
);

// TERMINAL KEYS
// ↑/↓ browse history, Tab completes commands and paths, Ctrl+C abandons the line or stops output,
// Ctrl+L clears the screen, Ctrl+U clears the line, Ctrl+D on an empty line logs out.
// Typing anywhere on the page goes to the prompt, like a terminal window.

const COMMANDS = ["cat", "cd", "clear", "date", "echo", "env", "exit", "git", "grep", "head", "help", "history", "hostname", "id",
  "less", "logout", "ls", "man", "more", "printenv", "pwd", "sudo", "tail", "tree", "uname", "uptime", "wc", "which", "whoami"];
let histPos = 0; // position in typedHistory while browsing; typedHistory.length = the line being written
let draft = ""; // what was on the line before browsing history

function setLine(value) {
  input.value = value;
  input.setSelectionRange(value.length, value.length);
  renderLine();
}

const completions = document.createElement("pre");
completions.className = "shell completions";
const hideCompletions = () => completions.remove();

const commonPrefix = (words) => words.reduce((a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return a.slice(0, i); });

function complete() {
  const value = input.value;
  const word = value.match(/\S*$/)[0];
  const base = value.slice(0, value.length - word.length);
  let options; // [shown in the list, text that replaces the word]
  if (!base.trim()) {
    options = COMMANDS.filter((c) => c.startsWith(word.toLowerCase())).map((c) => [c, c + " "]);
  } else {
    const dir = word.slice(0, word.lastIndexOf("/") + 1);
    const [, node] = resolve(dir);
    if (!isDir(node)) return;
    options = Object.entries(node)
      .filter(([n]) => n.toLowerCase().startsWith(word.slice(dir.length).toLowerCase()))
      .map(([n, v]) => [isDir(v) ? n + "/" : n, dir + n + (isDir(v) ? "/" : " ")]);
  }
  if (!options.length) return;
  const prefix = options.length === 1 ? options[0][1] : commonPrefix(options.map(([, full]) => full));
  if (prefix.length > word.length) return setLine(base + prefix);
  completions.textContent = options.map(([shown]) => shown).join("    ");
  lastPrompt.after(completions);
}

// A finished line without output, e.g. "ls^C"
function echoLine(text) {
  const exchange = document.createElement("div");
  exchange.className = "exchange";
  exchange.innerHTML = promptMarkup(cwd);
  exchange.querySelector(".prompt__text").textContent = text;
  lastPrompt.before(exchange);
}

function interrupt() {
  hideCompletions();
  if (cursor.classList.contains("cursor--busy")) {
    // stop the answer where it is, like ^C on a running command
    run++;
    printed = [];
    typingQuestion = false;
    thinking.hidden = true;
    if (cursor.isConnected) cursor.before("^C");
    setLine("");
    return idle();
  }
  echoLine(input.value + "^C");
  setLine("");
}

input.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault();
    if (e.key === "ArrowUp" && histPos > 0) {
      if (histPos === typedHistory.length) draft = input.value;
      setLine(typedHistory[--histPos]);
    } else if (e.key === "ArrowDown" && histPos < typedHistory.length) {
      histPos++;
      setLine(histPos === typedHistory.length ? draft : typedHistory[histPos]);
    }
  } else if (e.key === "Tab" && !e.shiftKey && input.value.trim()) {
    // on an empty line Tab still moves focus, so keyboard users aren't trapped
    e.preventDefault();
    complete();
  } else if (e.ctrlKey && !e.metaKey && !e.altKey) {
    const k = e.key.toLowerCase();
    if (k === "c") interrupt();
    else if (k === "l") document.querySelectorAll(".exchange").forEach((el) => el.remove());
    else if (k === "u") setLine("");
    else if (k === "d" && !input.value) shellReply("", runCommand("exit"), false);
    else return;
    e.preventDefault();
  }
});
input.addEventListener("input", hideCompletions);

addEventListener("keydown", (e) => {
  const printable = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
  if (printable && !closed && !lastPrompt.hidden && !e.target.closest?.("input, textarea, button, a")) input.focus();
});

// TESTER DETECTION
// Not keywords: what the browser would make of the input, and how the visitor behaves.
// Any of these ends the session with a game-over screen; a reload brings the page back.

const PASTE_LIMIT = 1000; // pasting more than this is a length (boundary) test; the field holds 200
const FLOOD_COUNT = 8; // typed questions or commands ...
const FLOOD_MS = 5000; // ... within this window

const techniques = {
  xss: { cs: "XSS (vložený HTML/JavaScript)", en: "XSS (injected HTML/JavaScript)" },
  template: { cs: "template injection", en: "template injection" },
  boundary: { cs: "test hraničních hodnot (příliš dlouhý vstup)", en: "boundary test (oversized input)" },
  tamper: { cs: "obcházení omezení přes DevTools", en: "bypassing limits via DevTools" },
  flood: { cs: "zahlcení formuláře", en: "form flooding" },
};

// The browser's own HTML parser in an inert document (nothing runs or loads): if the input
// would become an element, it's markup. "<3" or "a < b" stay text.
function injectionIn(text) {
  const doc = new DOMParser().parseFromString(text, "text/html");
  if ([...doc.querySelectorAll("*")].some((el) => !["HTML", "HEAD", "BODY"].includes(el.tagName))) return "xss";
  if (/\{\{.+\}\}|\$\{(?![A-Za-z_]\w*\}).+?\}/.test(text)) return "template"; // ${HOME} is just a shell variable
  return null;
}

input.addEventListener("paste", (e) => {
  const text = e.clipboardData?.getData("text") ?? "";
  if (text.length <= PASTE_LIMIT) return;
  e.preventDefault();
  gameOver("boundary", `${text.slice(0, 60)}… (${text.length})`);
});

// Only this script changes these attributes, always together with its own state;
// a mismatch means someone edited the page in DevTools.
const suggestionButtons = [...suggestions.querySelectorAll("button")];
const guard = new MutationObserver(() => {
  const tampered =
    input.disabled !== closed ||
    input.maxLength !== 200 ||
    suggestionButtons.some((btn) => btn.disabled !== usedSuggestions.has(btn));
  if (tampered) gameOver("tamper");
});
guard.observe(input, { attributes: true, attributeFilter: ["disabled", "maxlength"] });
suggestionButtons.forEach((btn) => guard.observe(btn, { attributes: true, attributeFilter: ["disabled"] }));

let over = false;

// The whole portfolio is replaced by the attempt, the detected technique and a goodbye.
// Nothing is left to click or type.
async function gameOver(kind, question) {
  if (over) return;
  over = true;
  guard.disconnect();
  const live = startRun();
  cursor.classList.add("cursor--busy");
  const t = {
    cs: ["Dobrý pokus, ale bugy tu hledám já.", "Detekováno", `Tím pro dnešek končíme. Kdyby něco, jsem na ${EMAIL}.`, "Spojení s michalcapoun.cz bylo ukončeno."],
    en: ["Nice try, but I'm the one hunting bugs here.", "Detected", `That's it for today. If you need anything, I'm at ${EMAIL}.`, "Connection to michalcapoun.cz closed."],
  }[currentLang];
  const screen = document.createElement("main");
  screen.className = "term";
  screen.innerHTML = `
    ${question ? promptMarkup(cwd) : ""}
    <div class="answer">
      <span class="output__mark" aria-hidden="true">●</span>
      <p>${t[0]}</p>
      <p class="dim">${t[1]}: ${techniques[kind][currentLang]}</p>
      <p>${t[2]}</p>
    </div>
    <p class="dim game-over">${t[3]}</p>`;
  if (question) screen.querySelector(".prompt__text").textContent = question; // visitor text, never as HTML
  document.body.replaceChildren(screen);
  scrollTo(0, 0);

  const lines = [...textNodes(screen.querySelector(".answer")), ...textNodes(screen.querySelector(".game-over"))];
  printed = lines;
  lines.forEach(([node]) => (node.data = ""));
  if (question && !(await think(screen.querySelector(".prompt"), live))) return;
  if (await stream(lines, live)) cursor.remove();
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
