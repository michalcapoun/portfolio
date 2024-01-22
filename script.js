// HAMBURGER MENU

document.addEventListener("DOMContentLoaded", function () {
  var hamburger = document.querySelector(".hamburger-icon");
  var menuLinks = document.querySelector(".menu-links");

  hamburger.addEventListener("click", function () {
    menuLinks.classList.toggle("open");
  });

  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      menuLinks.classList.remove("open");
    });
  });
});

// NAVBAR SCROLL EFFECT

const selectElements = (selector, selectAll = false) => {
  selector = selector.trim();
  return selectAll
    ? [...document.querySelectorAll(selector)]
    : document.querySelector(selector);
};

const addScrollListener = (element, listener) => {
  element.addEventListener("scroll", listener);
};

let navbarLinks = selectElements("#desktop-header .nav-link", true);

let currentActiveIndex = -1;

const updateActiveNavbarLink = () => {
  const scrollOffset = 200;
  const currentPosition = window.scrollY + scrollOffset;

  navbarLinks.forEach((link, index) => {
    const targetSection = selectElements(link.hash);
    if (!link.hash || !targetSection) return;

    const isInSectionView =
      currentPosition >= targetSection.offsetTop &&
      currentPosition <= targetSection.offsetTop + targetSection.offsetHeight;

    if (isInSectionView && index !== currentActiveIndex) {
      navbarLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      currentActiveIndex = index;
    } else if (!isInSectionView && index === currentActiveIndex) {
      link.classList.remove("active");
      currentActiveIndex = -1;
    }
  });
};

window.addEventListener("load", updateActiveNavbarLink);
addScrollListener(document, updateActiveNavbarLink);

// ABOUT BUTTONS

document.addEventListener("DOMContentLoaded", () => {
  const downloadCvBtn = document.getElementById("download-cv");
  const contactMeBtn = document.getElementById("contact-me");

  downloadCvBtn.addEventListener("click", () => {
    window.open("./assets/CV EN Michal Čapoun.pdf");
  });

  contactMeBtn.addEventListener("click", () => {
    location.href = "#contact";
  });
});
