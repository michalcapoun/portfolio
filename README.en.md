# michalcapoun.cz

[Česky](README.md)

I'm a QA Automation Engineer and this is my personal website: who I am, what I've worked on, my own projects and how to reach me.

**Live:** [michalcapoun.cz](https://michalcapoun.cz)

## Stack

Plain HTML, CSS and JavaScript. No frameworks, no build, no dependencies — apart from [Google Fonts (JetBrains Mono)](https://fonts.google.com/specimen/JetBrains+Mono) loaded from a CDN.

## Features

- The page looks like a chat with an AI in a terminal: my name is drawn in block letters, followed by four questions — about me, experience, my own projects and contact. Each one is typed into a prompt and its answer is printed character by character once the visitor scrolls to it
- The first question has nine wordings and each visit picks a different one than last time (remembered in localStorage); the answer is the same for all of them
- On wide screens (from 1200 px) my ASCII portrait is drawn next to the name; it is hidden on phones
- A click or a key press prints the rest at once; with animations turned off in the system the text is printed straight away; without JS the text is simply visible
- Language switch (CS / EN), the choice is remembered in localStorage; the text is printed again after switching
- A greeting in the browser console for visitors who open DevTools
- Responsive layout (phone and desktop)
- Google Analytics (G-7GPX0KYLXE)

## Projects on the site

- **michalcapoun.cz** — this portfolio ([GitHub](https://github.com/michalcapoun/portfolio))
- **Tracer** — a personal trip archive in Vue 3, TypeScript and Supabase ([GitHub](https://github.com/michalcapoun/tracer), [live](https://tracer-six.vercel.app))

## Structure

```
index.html        # the whole page, no favicon
src/
  style.css       # all styles (colours, layout, cursor)
  script.js       # all JS
```

## Deployment

Deployed automatically by [GitHub Pages](https://pages.github.com) from the `main` branch on every push. No build.
