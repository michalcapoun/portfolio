// SCROLL TO TOP ON LOAD
history.scrollRestoration = "manual";
window.scrollTo(0, 0);

// LANGUAGE SWITCHER

// Czech text lives in index.html; only English is kept here.
const translations = {
  en: {
    "nav.about": "about",
    "nav.projects": "projects",
    "nav.contact": "contact",
    "hero.p1": "I've been into computers since elementary school — I built my first one from spare parts. Through IT support, I found my way to software testing, where I discovered what I enjoy: systematically finding problems before they reach users.",
    "hero.p2": "I currently focus on mobile application testing — both manual and automated. I'm interested in the whole process: understanding how something should work, all the way to verifying that a fix actually works.",
    "hero.p3": "I automate in TypeScript — primarily with Appium, with some experience in Playwright. For mobile platforms UIAutomator2 and XCUITest, for API Postman and Swagger, network analysis in Proxyman. For diagnosing backend errors I use Azure Application Insights.",
    "projects.portfolio-text": "My portfolio — a place to share my projects and get in touch. Built with plain HTML, CSS and JavaScript, no frameworks, no dependencies.",
    "projects.tracer-text": "Personal trip archive. Save, organize and archive routes planned in Mapy.com. Vue 3, TypeScript, Supabase.",
  },
};

const storage = {
  get: (key) => { try { return localStorage.getItem(key); } catch(e) { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, val); } catch(e) {} },
};

const langButtons = document.querySelectorAll(".lang-button");
let currentLang = storage.get("selected-lang") || "cs";

const applyLanguage = (lang) => {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.dataset.cs ??= el.textContent;
    const text = lang === "cs" ? el.dataset.cs : translations.en[el.dataset.i18n];
    if (!text) return;
    el.textContent = text;
    if (el.dataset.text !== undefined) el.dataset.text = text;
  });
  langButtons.forEach((btn) => (btn.textContent = lang === "cs" ? "EN" : "CS"));
  document.documentElement.lang = lang;
};

applyLanguage(currentLang);

// CONSOLE GREETING

console.log(
  "%c  \\( )/\n  -( )-\n  /( )\\\n\n%c" +
    (currentLang === "cs" ? "Hledáš bugy? To je moje práce. Napiš mi:" : "Looking for bugs? That's my job. Say hi:") +
    "\n%cmichalcapoun@gmail.com",
  "color: #cc4331; font-weight: bold",
  "font-size: 14px; font-weight: bold",
  "font-size: 12px"
);

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentLang = currentLang === "cs" ? "en" : "cs";
    storage.set("selected-lang", currentLang);
    applyLanguage(currentLang);
  });
});

// THEME SWITCHER

const themeButtons = document.querySelectorAll(".theme-button");
const darkTheme = "dark-theme";

// Sun icon in dark mode, moon in light mode.
const applyTheme = (isDark) => {
  document.body.classList.toggle(darkTheme, isDark);
  themeButtons.forEach((btn) => btn.querySelector("i").classList.toggle("bx-sun", isDark));
};

applyTheme(storage.get("selected-theme") !== "light");

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const isDark = !document.body.classList.contains(darkTheme);
    applyTheme(isDark);
    storage.set("selected-theme", isDark ? "dark" : "light");
  });
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

const setMenu = (isOpen) => {
  navbar.classList.toggle("navbar--open", isOpen);
  hamburger.setAttribute("aria-expanded", isOpen);
  mobileMenu.setAttribute("aria-hidden", !isOpen);
  hamburgerIcon.classList.toggle("bx-menu", !isOpen);
  hamburgerIcon.classList.toggle("bx-x", isOpen);
};

hamburger.addEventListener("click", () => setMenu(!navbar.classList.contains("navbar--open")));

document.querySelectorAll(".navbar__mobile-link").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
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
