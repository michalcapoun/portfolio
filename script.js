// THEME SWITCHER

const themeButton = document.querySelector("#theme-button");
const darkTheme = "dark-theme";
const iconTheme = "bx-sun";

const selectedTheme = localStorage.getItem("selected-theme");
const selectedIcon = localStorage.getItem("selected-icon");

const getCurrentTheme = () =>
  document.body.classList.contains(darkTheme) ? "dark" : "light";
const getCurrentIcon = () =>
  themeButton.classList.contains(iconTheme) ? "bx bx-moon" : "bx bx-sun";

if (selectedTheme) {
  document.body.classList[selectedTheme === "dark" ? "add" : "remove"](
    darkTheme
  );
  themeButton.classList[selectedIcon === "bx bx-moon" ? "add" : "remove"](
    iconTheme
  );
}

themeButton.addEventListener("click", () => {
  document.body.classList.toggle(darkTheme);
  themeButton.classList.toggle(iconTheme);

  localStorage.setItem("selected-theme", getCurrentTheme());
  localStorage.setItem("selected-icon", getCurrentIcon());
});

// CONTACT CARD FLIP

const arrows = document.querySelectorAll(".bx-revision");
const card = document.querySelector(".contact-container");

arrows.forEach((arrow) => {
  arrow.addEventListener("click", () => {
    card.classList.toggle("contact-active");
  });
});

// HORIZONTAL PARALLAX

const elementInitialPositions = new Map();

function parallaxScroll() {
  const elements = document.querySelectorAll(".parallax");
  elements.forEach((el) => {
    const elementTop = el.getBoundingClientRect().top;
    const viewportHeight = window.innerHeight;

    if (elementTop <= viewportHeight && !elementInitialPositions.has(el)) {
      elementInitialPositions.set(el, window.scrollY);
    }

    if (elementInitialPositions.has(el)) {
      const initialScrollY = elementInitialPositions.get(el);
      const scrollDistance = window.scrollY - initialScrollY;

      const translateValue = scrollDistance * 0.1;

      el.style.transform = `translateX(${translateValue}%)`;
    }
  });
}

window.addEventListener("scroll", parallaxScroll);
