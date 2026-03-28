# michalcapoun.cz

Personal portfolio of Michal Čapoun — QA tester.

**Live:** [michalcapoun.cz](https://michalcapoun.cz)

## Stack

Built with plain HTML, CSS, and JavaScript. No frameworks, no build step, no dependencies — except [Boxicons](https://boxicons.com) and [Google Fonts](https://fonts.google.com) loaded via CDN.

## Features

- Animated SVG signature on load
- Dark / light theme with localStorage persistence
- Language switcher (CS / EN)
- Glassmorphism design with mesh gradient background
- Infinite project carousel with swipe support (touch + trackpad)
- Flip contact card
- Scroll progress bar
- Responsive layout (mobile, desktop, 27" monitor)

## Structure

```
index.html          # single HTML file
src/
  style.css         # all styles
  script.js         # all JS
assets/             # images, favicon
.github/
  workflows/
    deploy.yml      # GitHub Actions deployment
```

## Deployment

Deployed automatically to [GitHub Pages](https://pages.github.com) on every push to `main` via GitHub Actions.
