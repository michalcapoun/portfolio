# michalcapoun.cz

Osobní portfolio.

**Živě:** [michalcapoun.cz](https://michalcapoun.cz)

## Technologie

Čisté HTML, CSS a JavaScript. Žádné frameworky, žádný build, žádné závislosti — kromě [Google Fonts (JetBrains Mono)](https://fonts.google.com/specimen/JetBrains+Mono) načítaného přes CDN.

## Funkce

- Stránka vypadá jako výpis z terminálu: po otevření se napíše příkaz, obsah se vypíše po znacích a na konci bliká kurzor
- Kliknutí, klávesa, scroll nebo dotyk dopíše text okamžitě; s vypnutými animacemi v systému se vypíše hned; bez JS je text rovnou vidět
- Přepínání tmavého / světlého motivu, volba se pamatuje v localStorage (výchozí je tmavý)
- Přepínání jazyka (CS / EN), volba se pamatuje v localStorage; po přepnutí se text vypíše znovu
- Pozdrav v konzoli prohlížeče pro návštěvníky, kteří otevřou DevTools
- Responzivní rozložení (mobil i desktop)
- Google Analytics (G-7GPX0KYLXE)

## Projekty na webu

- **michalcapoun.cz** — tohle portfolio ([GitHub](https://github.com/michalcapoun/portfolio))
- **Tracer** — osobní archiv výletů ve Vue 3, TypeScriptu a Supabase ([GitHub](https://github.com/michalcapoun/tracer), [živě](https://tracer-six.vercel.app))

## Struktura

```
index.html        # celá stránka, bez faviconu
src/
  style.css       # všechny styly (motivy, layout, kurzor)
  script.js       # všechen JS
```

## Nasazení

Nasazuje se automaticky přes [GitHub Pages](https://pages.github.com) z větve `main` při každém pushi. Bez buildu.
