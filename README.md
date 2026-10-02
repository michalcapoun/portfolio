# michalcapoun.cz

[English](README.en.md)

Jsem QA Automation Engineer a tohle je můj osobní web: kdo jsem, na čem jsem pracoval, vlastní projekty a kontakt.

**Živě:** [michalcapoun.cz](https://michalcapoun.cz)

## Technologie

Čisté HTML, CSS a JavaScript. Žádné frameworky, žádný build, žádné závislosti — kromě [Google Fonts (JetBrains Mono)](https://fonts.google.com/specimen/JetBrains+Mono) načítaného přes CDN.

## Funkce

- Stránka vypadá jako rozhovor s AI v terminálu: vykreslí se moje jméno blokovým písmem a pak přijdou čtyři otázky — o mně, zkušenosti, vlastní projekty a kontakt. Každá se napíše do promptu a odpověď se vypíše po znacích, jakmile k ní návštěvník doscrolluje
- První otázka má devět znění a při každém otevření se vybere jiné než minule (pamatuje se v localStorage); odpověď je pro všechna stejná
- Na širokých obrazovkách (od 1200 px) se vedle jména vykreslí můj ASCII portrét; na mobilu je schovaný
- Kliknutí nebo klávesa dopíše text okamžitě; s vypnutými animacemi v systému se vypíše hned; bez JS je text rovnou vidět
- Jazyk se zvolí podle prohlížeče: čeština, pokud má návštěvník mezi jazyky češtinu nebo slovenštinu, jinak angličtina
- Přepínání jazyka (CS / EN), volba se pamatuje v localStorage a má přednost; po přepnutí se text vypíše znovu
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
  style.css       # všechny styly (barvy, layout, kurzor)
  script.js       # všechen JS
```

## Nasazení

Nasazuje se automaticky přes [GitHub Pages](https://pages.github.com) z větve `main` při každém pushi. Bez buildu.
