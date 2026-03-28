# michalcapoun.cz

Personal portfolio.

**Live:** [michalcapoun.cz](https://michalcapoun.cz)

## Stack

Plain HTML, CSS, and JavaScript. No frameworks, no build step, no dependencies — except [Boxicons](https://boxicons.com) and [Google Fonts (Source Code Pro)](https://fonts.google.com) loaded via CDN.

## Features

- Animated SVG signature on page load
- Dark / light theme toggle with localStorage persistence (dark by default)
- Language switcher (CS / EN) with localStorage persistence
- Mesh gradient background with glassmorphism cards
- Project carousel with infinite loop and swipe support (touch + trackpad)
- Flippable contact card showing name on front, code-styled contact info on back
- Scroll progress bar in the navbar
- Active section highlight via IntersectionObserver
- Hamburger menu on mobile
- Responsive layout (mobile + desktop)
- Google Analytics (G-7GPX0KYLXE)

## Projects shown

- **michalcapoun.cz** — this portfolio site
- **Map Archive** — work in progress

## Structure

```
index.html
src/
  style.css       # all styles (variables, layout, components)
  script.js       # all JS
assets/           # images, favicon
.github/
  workflows/
    deploy.yml    # GitHub Actions deployment
```

## Deployment

Deployed automatically to [GitHub Pages](https://pages.github.com) on every push to `main` via GitHub Actions. No build step — the repo root is uploaded as the artifact.
