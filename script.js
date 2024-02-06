// NAVBAR MENU TOGGLE

document.addEventListener("DOMContentLoaded", () => {
  const navMenu = document.querySelector("#nav-menu");
  const navToggle = document.querySelector("#nav-toggle");
  const navClose = document.querySelector("#nav-close");

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.add("show-menu");
    });
  }

  if (navClose) {
    navClose.addEventListener("click", () => {
      navMenu.classList.remove("show-menu");
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const navLink = document.querySelectorAll(".nav-link");

  const linkAction = () => {
    const navMenu = document.querySelector("#nav-menu");
    navMenu.classList.remove("show-menu");
  };
  navLink.forEach((n) => n.addEventListener("click", linkAction));
});

// NAVBAR ACTIVE SECTION

const navbarLinks = document.querySelectorAll(".nav-link");
let currentActiveIndex = -1;

const updateActiveNavbarLink = () => {
  const scrollOffset = 200;
  const currentPosition = window.scrollY + scrollOffset;

  navbarLinks.forEach((link, index) => {
    const targetSection = document.querySelector(link.hash);
    if (!link.hash || !targetSection) return;

    const isInSectionView =
      currentPosition >= targetSection.offsetTop &&
      currentPosition <= targetSection.offsetTop + targetSection.offsetHeight;

    if (isInSectionView && index !== currentActiveIndex) {
      navbarLinks.forEach((el) => el.classList.remove("active"));
      link.classList.add("active");
      currentActiveIndex = index;
    } else if (!isInSectionView && index === currentActiveIndex) {
      link.classList.remove("active");
      currentActiveIndex = -1;
    }
  });
};

window.addEventListener("load", updateActiveNavbarLink);
window.addEventListener("scroll", updateActiveNavbarLink);

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

// CONTACT CARD CLICK

document
  .querySelector(".contact-container")
  .addEventListener("click", function () {
    this.classList.toggle("contact-active");
  });
