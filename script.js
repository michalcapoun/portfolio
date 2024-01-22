// HAMBURGER MENU

document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger-icon");
  const menuLinks = document.querySelector(".menu-links");

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

const navbarLinks = document.querySelectorAll("#desktop-header .nav-link");
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
window.addEventListener("scroll", updateActiveNavbarLink);

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

// CONTACT COPY PHONE NUMBER

document.getElementById("phoneNumber").addEventListener("click", function () {
  navigator.clipboard.writeText(this.innerText).then(() => {
    const message = document.getElementById("copyMessage");
    message.style.display = "block";

    setTimeout(() => {
      message.style.display = "none";
    }, 3000);
  });
});
