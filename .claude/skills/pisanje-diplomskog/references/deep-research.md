# Brif za `anthropic-skills:deep-research`

`deep-research` ne zna ništa o radu, pa mu brif mora sam da objasni kontekst i format. Popuni šablon i pošalji ga kao argument skilla.

## Šablon

```text
Kontekst: istraživanje za diplomski rad na ETF-u u Nišu, „Razvoj višeplatformske aplikacije
za kurseve korišćenjem web tehnologija“. Sistem: monorepo (pnpm + Turborepo) sa Express 5 API-jem,
Next.js 16 PWA klijentom i Expo / React Native klijentom (iOS, Android) koji dele TypeScript pakete
(Zod šeme, OpenAPI → Orval klijent, i18n, dizajn tokeni).

Poglavlje: <broj i naziv iz plan.md>
Pitanja na koja istraživanje treba da odgovori:
- <pitanje 1>
- <pitanje 2>

Zahtevi za izvore:
- Prednost imaju recenzirani radovi (IEEE, ACM, Springer, Elsevier), zvanična dokumentacija
  i specifikacije (W3C, WHATWG, MDN, web.dev, zvanični sajtovi alata) i izveštaji priznatih institucija.
- Blogovi i marketinški tekstovi samo ako nema boljeg izvora, i jasno označeni.
- Ne navodi izvor koji nisi otvorio. Brojke i datume prenesi tačno, sa periodom na koji se odnose.

Format rezultata (markdown):
1. Kratak pregled nalaza po pitanjima (5–10 rečenica po pitanju).
2. Uporedna tabela ako poglavlje poredi pristupe ili alate.
3. Lista izvora, za svaki: pun bibliografski zapis (autori, naslov, časopis/konferencija ili sajt,
   godina, volumen/strane, DOI ili URL, datum pristupa), i 1–2 rečenice šta taj izvor potvrđuje.
4. Tvrdnje koje nisu mogle da se potvrde ili su izvori oko njih neslagani.
```

## Pitanja po poglavljima

**2. Problem i srodna rešenja**
- Koje su vodeće platforme za onlajn kurseve (Moodle, Udemy, Coursera…) i na kojim platformama su dostupne?
- Koji su pristupi višeplatformskom razvoju (nativni, hibridni/WebView, cross-platform radni okviri, PWA) i kako ih literatura poredi po deljenju koda, performansama, pristupu uređaju, distribuciji, push obaveštenjima i radu bez mreže?
- Koja su ograničenja PWA na iOS-u (instalacija, Web Push od iOS 16.4) u odnosu na Android?

**3. Korišćene tehnologije**
- Za svaku tehnologiju iz `plan.md` (TypeScript, Zod, OpenAPI 3.1, Orval, React Query, Express 5, PostgreSQL, Supabase, Drizzle, React 19, Next.js 16, PWA API-ji, React Native, Expo, NativeWind, Tailwind 4, pnpm, Turborepo): šta je, ključni koncepti, zvanični izvor.
- Monorepo naspram polyrepo: prednosti, nedostaci, praksa u industriji.

**9. Integracija VI**
- Uloga velikih jezičkih modela u pravljenju nastavnog sadržaja i generisanju pitanja za proveru znanja.
- Efekat testiranja i kvizovi kao motivacija (dopuna postojećih referenci [5]).
- Model Context Protocol: šta je, ko ga je predložio, kako radi autorizacija (OAuth).

## Posle istraživanja

1. Sačuvaj rezultat u `diplomski/istrazivanje/<broj>-<tema>.md`.
2. Pri pisanju u `Reference.md` prenesi samo izvore koje zaista citiraš, u formatu iz SKILL.md, numerisane po redosledu prvog citiranja.
3. Tvrdnje iz odeljka „nije potvrđeno“ ne koristi u radu, ili ih autoru navedi kao otvoreno pitanje.
