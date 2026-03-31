# Portfolio – michalcapoun.cz

Personal portfolio website of Michal Capoun.

## Stack

Plain HTML/CSS/JS – no frameworks, no build step, no dependencies.
- Single HTML file: `index.html`
- JS: `src/script.js` (language switcher CS/EN, dark/light theme, flip card, carousel)
- CSS: `src/style.css` (single file)
- Assets: `assets/`

## Rules

- No frameworks or libraries (exception: Boxicons + Google Fonts via CDN)
- Website content is in Czech
- Prefer simple, readable solutions over complex ones

## Setup

After cloning, run once to activate git hooks:
```
make setup
```
This sets `core.hooksPath` to `.githooks/` so the pre-push watchdog sync hook works.

## Context

- Owner: Michal Capoun – QA tester
- Live version: michalcapoun.cz
- Google Analytics: G-7GPX0KYLXE
- Projects on the site: michalcapoun.cz (portfolio), Map Archive (WIP)
