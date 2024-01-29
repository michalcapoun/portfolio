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

// NAVBAR SCROLL EFFECT SHADOW

const shadowHeader = () => {
  const header = document.querySelector("#header");
  this.scrollY >= 50
    ? header.classList.add("shadow-header")
    : header.classList.remove("shadow-header");

  window.addEventListener("scroll", shadowHeader);
};

// NAVBAR ACTIVE SECTION

// const navbarLinks = document.querySelectorAll(".desktop-link");
// let currentActiveIndex = -1;

// const updateActiveNavbarLink = () => {
//   const scrollOffset = 200;
//   const currentPosition = window.scrollY + scrollOffset;

//   navbarLinks.forEach((link, index) => {
//     const targetSection = document.querySelector(link.hash);
//     if (!link.hash || !targetSection) return;

//     const isInSectionView =
//       currentPosition >= targetSection.offsetTop &&
//       currentPosition <= targetSection.offsetTop + targetSection.offsetHeight;

//     if (isInSectionView && index !== currentActiveIndex) {
//       navbarLinks.forEach((el) => el.classList.remove("active"));
//       link.classList.add("active");
//       currentActiveIndex = index;
//     } else if (!isInSectionView && index === currentActiveIndex) {
//       link.classList.remove("active");
//       currentActiveIndex = -1;
//     }
//   });
// };

// window.addEventListener("load", updateActiveNavbarLink);
// window.addEventListener("scroll", updateActiveNavbarLink);

// COPY PHONE NUMBER TO CLIPBOARD

// document.addEventListener("DOMContentLoaded", () => {
//   const phoneNumberElement = document.getElementById("phoneNumber");
//   const copyMessageElement = document.getElementById("copyMessage");

//   const copyPhoneNumber = () => {
//     navigator.clipboard.writeText(phoneNumberElement.innerText).then(() => {
//       copyMessageElement.style.display = "block";
//       setTimeout(() => {
//         copyMessageElement.style.display = "none";
//       }, 3000);
//     });
//   };

//   phoneNumberElement.addEventListener("click", copyPhoneNumber);
// });
