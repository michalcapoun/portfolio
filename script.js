// HAMBURGER MENU

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger-icon");
  const menuLinks = document.querySelector(".hamburger-links");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    menuLinks.classList.toggle("open");
  });

  document.querySelectorAll(".hamburger-link").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      menuLinks.classList.remove("open");
    });
  });
});

// NAVBAR SCROLL EFFECT

const navbarLinks = document.querySelectorAll("#desktop-header .desktop-link");
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

// CONTACT COPY PHONE NUMBER

document.addEventListener("DOMContentLoaded", () => {
  const phoneNumberElement = document.getElementById("phoneNumber");
  const phoneIconElement = document.getElementById("phoneIcon");
  const copyMessageElement = document.getElementById("copyMessage");

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText(phoneNumberElement.innerText).then(() => {
      copyMessageElement.style.display = "block";
      setTimeout(() => {
        copyMessageElement.style.display = "none";
      }, 3000);
    });
  };

  phoneNumberElement.addEventListener("click", copyPhoneNumber);
  phoneIconElement.addEventListener("click", copyPhoneNumber);
});
