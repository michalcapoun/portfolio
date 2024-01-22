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

// NAVBAR

document.querySelectorAll("nav-link").forEach((link) => {
  link.addEventListener("click", function () {
    document
      .querySelectorAll("nav-link")
      .forEach((l) => l.classList.remove("active-link"));

    this.classList.add("active-link");
  });
});

window.addEventListener("scroll", function () {
  document
    .querySelectorAll(".nav-link")
    .forEach((link) => link.classList.remove("active-link"));
});

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
