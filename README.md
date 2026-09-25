# michalcapoun.cz

Osobní portfolio.

**Živě:** [michalcapoun.cz](https://michalcapoun.cz)

## Technologie

Čisté HTML, CSS a JavaScript. Žádné frameworky, žádný build, žádné závislosti — kromě [Boxicons](https://boxicons.com) a [Google Fonts (Source Code Pro)](https://fonts.google.com) načítaných přes CDN.

## Funkce

- Animovaný SVG podpis při načtení stránky
- Přepínání tmavého / světlého motivu, volba se pamatuje v localStorage (výchozí je tmavý)
- Přepínání jazyka (CS / EN), volba se pamatuje v localStorage
- Mesh gradient na pozadí a karty ve stylu glassmorphism
- Karusel projektů s nekonečnou smyčkou a swipem (dotyk i touchpad)
- Otočná kontaktní karta — vepředu jméno, vzadu kontakty stylizované jako kód
- Pozdrav v konzoli prohlížeče pro návštěvníky, kteří otevřou DevTools
- Ukazatel průběhu scrollování v navigaci
- Zvýraznění aktivní sekce přes IntersectionObserver
- Hamburger menu na mobilu
- Responzivní rozložení (mobil i desktop)
- Google Analytics (G-7GPX0KYLXE)

## Projekty na webu

- **michalcapoun.cz** — tohle portfolio ([GitHub](https://github.com/michalcapoun/portfolio))
- **Tracer** — osobní archiv výletů ve Vue 3, TypeScriptu a Supabase ([GitHub](https://github.com/michalcapoun/tracer), [živě](https://tracer-six.vercel.app))

## Struktura

```
index.html        # celá stránka, favicon je inline SVG
src/
  style.css       # všechny styly (proměnné, layout, komponenty)
  script.js       # všechen JS
assets/           # screenshoty projektů
```

## Nasazení

Nasazuje se automaticky přes [GitHub Pages](https://pages.github.com) z větve `main` při každém pushi. Bez buildu.
