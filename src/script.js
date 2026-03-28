// SCROLL TO TOP ON LOAD
history.scrollRestoration = "manual";
window.scrollTo(0, 0);

// LANGUAGE SWITCHER

const translations = {
  cs: {
    "nav.about": "o mně",
    "nav.projects": "projekty",
    "nav.contact": "kontakt",
    "hero.p1": "O počítače se zajímám od základní školy – první jsem si sestavil ze starých dílů. Přes IT support jsem se dostal k testování softwaru, kde jsem našel to, co mě baví: systematicky hledat problémy dřív, než se dostanou k uživatelům.",
    "hero.p2": "Aktuálně se věnuji testování mobilních aplikací – jak manuálnímu, tak automatizovanému. Zajímá mě celý proces: od pochopení toho, jak má věc fungovat, až po ověření že změna skutečně funguje.",
    "hero.p3": "Automatizuji v TypeScript – primárně s Appium, zkušenosti mám i s Playwright. Pro mobilní platformy UIAutomator2 a XCUITest, pro API Postman a Swagger, síť analyzuji v Proxyman. Při diagnostice backendových chyb používám Azure Application Insights.",
    "hero.resume": "Životopis",
    "projects.portfolio-text": "Moje portfolio – místo, kde sdílím projekty a kde mě můžeš kontaktovat. Postaveno na čistém HTML, CSS a JavaScriptu bez frameworků a závislostí.",
    "projects.map-archive-text": "Projekt, na kterém momentálně pracuji. Chci propojit mapy.com API pro ukládání tras a zobrazení základních dat a celkové trasy na mapě.",
  },
  en: {
    "nav.about": "about",
    "nav.projects": "projects",
    "nav.contact": "contact",
    "hero.p1": "I've been into computers since elementary school — I built my first one from spare parts. Through IT support, I found my way to software testing, where I discovered what I enjoy: systematically finding problems before they reach users.",
    "hero.p2": "I currently focus on mobile application testing — both manual and automated. I'm interested in the whole process: understanding how something should work, all the way to verifying that a fix actually works.",
    "hero.p3": "I automate in TypeScript — primarily with Appium, with some experience in Playwright. For mobile platforms UIAutomator2 and XCUITest, for API Postman and Swagger, network analysis in Proxyman. For diagnosing backend errors I use Azure Application Insights.",
    "hero.resume": "Resume",
    "projects.portfolio-text": "My portfolio — a place to share my projects and get in touch. Built with plain HTML, CSS and JavaScript, no frameworks, no dependencies.",
    "projects.map-archive-text": "A project I'm currently working on. I want to integrate the mapy.com API to store routes and display route data on a map.",
  },
};

const storage = {
  get: (key) => { try { return localStorage.getItem(key); } catch(e) { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, val); } catch(e) {} },
};

const langButton = document.querySelector(".lang-button");
let currentLang = storage.get("selected-lang") || "cs";

const applyLanguage = (lang) => {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const text = translations[lang][key];
    if (!text) return;
    el.textContent = text;
    if (el.dataset.text !== undefined) el.dataset.text = text;
  });
  langButton.textContent = lang === "cs" ? "EN" : "CS";
  document.documentElement.lang = lang;
};

applyLanguage(currentLang);

langButton.addEventListener("click", () => {
  currentLang = currentLang === "cs" ? "en" : "cs";
  storage.set("selected-lang", currentLang);
  applyLanguage(currentLang);
});

// THEME SWITCHER

const themeButton = document.querySelector(".theme-button");
const themeIcon = themeButton.querySelector("i");
const darkTheme = "dark-theme";
const sunIcon = "bx-sun";

const selectedTheme = storage.get("selected-theme");
const selectedIcon = storage.get("selected-icon");

const getCurrentTheme = () =>
  document.body.classList.contains(darkTheme) ? "dark" : "light";
const getCurrentIcon = () =>
  themeIcon.classList.contains(sunIcon) ? "bx bx-moon" : "bx bx-sun";

const isDark = selectedTheme ? selectedTheme === "dark" : true;
const useSun = selectedTheme ? selectedIcon === "bx bx-moon" : true;
document.body.classList[isDark ? "add" : "remove"](darkTheme);
themeIcon.classList[useSun ? "add" : "remove"](sunIcon);

themeButton.addEventListener("click", () => {
  document.body.classList.toggle(darkTheme);
  themeIcon.classList.toggle(sunIcon);
  localStorage.setItem("selected-theme", getCurrentTheme());
  localStorage.setItem("selected-icon", getCurrentIcon());
});

// CONTACT CARD FLIP

const flipButtons = document.querySelectorAll('[data-action="flip"]');
const contactCard = document.querySelector(".contact-container");

flipButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    contactCard.classList.toggle("contact-container--active");
  });
});

// HAMBURGER MENU

const hamburger = document.querySelector(".navbar__hamburger");
const navbar = document.querySelector(".navbar");
const mobileMenu = document.querySelector(".navbar__mobile-menu");
const hamburgerIcon = hamburger.querySelector("i");

hamburger.addEventListener("click", () => {
  const isOpen = navbar.classList.toggle("navbar--open");
  hamburger.setAttribute("aria-expanded", isOpen);
  mobileMenu.setAttribute("aria-hidden", !isOpen);
  hamburgerIcon.classList.toggle("bx-menu");
  hamburgerIcon.classList.toggle("bx-x");
});

document.querySelectorAll(".navbar__mobile-link").forEach((link) => {
  link.addEventListener("click", () => {
    navbar.classList.remove("navbar--open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    hamburgerIcon.classList.add("bx-menu");
    hamburgerIcon.classList.remove("bx-x");
  });
});

// PROGRESS BAR & ACTIVE SECTION

const progressFill = document.querySelector(".navbar__progress-fill");
const navLinks = document.querySelectorAll(".navbar__link");
const sections = document.querySelectorAll("main section");

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressFill.style.width = pct + "%";
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.remove("navbar__link--active"));
        const active = document.querySelector(
          `.navbar__link[href="#${entry.target.id}"]`
        );
        if (active) active.classList.add("navbar__link--active");
      }
    });
  },
  { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
);

sections.forEach((section) => observer.observe(section));

// INFINITE CAROUSEL

const trackWrapper = document.querySelector(".projects__track-wrapper");
const track = document.querySelector(".cards");
const originalItems = [...track.querySelectorAll(".cards__item")];

const firstClone = originalItems[0].cloneNode(true);
const lastClone = originalItems[originalItems.length - 1].cloneNode(true);
track.append(firstClone);
track.prepend(lastClone);

const allItems = [...track.querySelectorAll(".cards__item")];
let currentIndex = 1;
let isTransitioning = false;

const getWidth = () => trackWrapper.offsetWidth;

const jumpTo = (index) => {
  track.style.transition = "none";
  currentIndex = index;
  track.style.transform = `translateX(-${currentIndex * getWidth()}px)`;
};

const slideTo = (index) => {
  if (isTransitioning) return;
  isTransitioning = true;
  track.style.transition = "transform 0.4s ease";
  currentIndex = index;
  track.style.transform = `translateX(-${currentIndex * getWidth()}px)`;
};

const updateItemWidths = () => {
  const w = getWidth();
  allItems.forEach((item) => (item.style.width = w + "px"));
  jumpTo(currentIndex);
};

updateItemWidths();
window.addEventListener("resize", updateItemWidths);

track.addEventListener("transitionend", () => {
  isTransitioning = false;
  if (currentIndex === 0) jumpTo(allItems.length - 2);
  if (currentIndex === allItems.length - 1) jumpTo(1);
});

document.querySelector(".projects__nav--prev").addEventListener("click", () => slideTo(currentIndex - 1));
document.querySelector(".projects__nav--next").addEventListener("click", () => slideTo(currentIndex + 1));

// SWIPE (touch + touchpad)

let swipeStartX = 0;
let isSwiping = false;

trackWrapper.addEventListener("pointerdown", (e) => {
  swipeStartX = e.clientX;
  isSwiping = true;
});

trackWrapper.addEventListener("pointerup", (e) => {
  if (!isSwiping) return;
  isSwiping = false;
  const delta = e.clientX - swipeStartX;
  if (Math.abs(delta) > 50) {
    delta < 0 ? slideTo(currentIndex + 1) : slideTo(currentIndex - 1);
  }
});

trackWrapper.addEventListener("pointercancel", () => { isSwiping = false; });
