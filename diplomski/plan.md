# Plan diplomskog rada

## Napredak

```
Rad        ███████████████████░  ~93 %
Strane     ~50 od ~55
Poglavlja  11 od 12  (1–11)
```

Procena od 14.10.2026: `diplomski.md` ima oko 15 000 reči posle skraćivanja celog rada i poglavlja 4 (računajući tabele i dijagrame), uz oko 300 reči po strani (A4, 12 pt, prored 1,5), bez slika. Poglavlje 10 ima oko 450 reči i čeka slike 10.1 i 10.2. Nisu napisani poglavlje 12, sažetak i abstract; rad je već na gornjoj granici, pa ih treba pisati minimalno.

**Naslov:** Razvoj višeplatformske aplikacije za kurseve korišćenjem web tehnologija

Plan je napravljen na osnovu dva uzorka radova sa ETF-a u Nišu (Veljković 2026, završni rad; Trajković 2020, diplomski) i trenutnog stanja `course-hub` projekta. Za šablon je uzet Veljkovićev rad, jer je noviji i odgovara sadašnjem formatu.

Težište rada: **jedan backend i zajednički TypeScript/React kod za web (PWA), iOS i Android.**

## Trenutno stanje projekta

| Klijent                              | Tehnologija                                                                                             | Stanje                                                                                                                                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Web (PWA)**                        | Next.js 16, React 19, Tailwind 4, service worker, Web Push                                              | Kompletan: polaznik, kreator, AI/MCP, obaveštenja                                                                                                                                                                    |
| **Nativna aplikacija (iOS/Android)** | Expo 57, React Native 0.86, Expo Router, NativeWind                                                     | Završeno: prijava/registracija, katalog, detalji kursa, video i napredak, kvizovi, recenzije. Još nije urađeno: pozivnice, nativni push, obaveštenja, profil, deo za kreatora (za sada ekrani-placeholderi), EAS build |
| **Zajednički paketi**                | `contract`, `api-client` (Orval), `shared`, `i18n` (web + native), `ui-theme` (tokeni za obe platforme) | Već se koriste na obe platforme                                                                                                                                                                                      |

## Oznake

- ★ obavezno
- ◆ preporučeno
- ○ opciono

## Sadržaj rada

### Uvodni deo

- ★ Naslovna strana
- ★ Strana sa zadatkom, mentorom, komisijom i datumima
- ★ Sažetak + ključne reči (srpski)
- ★ Abstract + keywords (engleski)
- ★ Sadržaj
- ○ Spisak slika, tabela i skraćenica (REST, JWT, PWA, ORM, MCP…)

### 1. ★ Uvod

- Motivacija: onlajn učenje i korisnici na više uređaja
- Problem: kako izbeći tri odvojene aplikacije (web, iOS, Android)
- Cilj rada: jedan backend i jedan jezik (TypeScript) za sve klijente
- Doprinos rada
- Organizacija rada

### 2. ★ Problem i srodna rešenja

- 2.1 Platforme za onlajn kurseve (Moodle, Udemy, Coursera)
- 2.2 Pristupi višeplatformskom razvoju: nativni (Swift/Kotlin), hibridni (Cordova/Capacitor), cross-platform (React Native, Flutter), PWA
- 2.3 Uporedna tabela pristupa: deljenje koda, performanse, distribucija, push, offline rad
- 2.4 Pozicioniranje rada: PWA + React Native nad zajedničkim slojem

### 3. ★ Korišćene tehnologije

- 3.1 TypeScript i Zod: tipska sigurnost od baze do ekrana
- 3.2 REST, OpenAPI 3.1 i generisanje klijenta (Orval, React Query)
- 3.3 Node.js, Express 5, PostgreSQL/Supabase, Drizzle ORM
- 3.4 React 19 i Next.js 16 (App Router, SSR)
- 3.5 PWA: manifest, service worker, Web Push/VAPID
- 3.6 **React Native i Expo**: arhitektura, Expo Router, nativni moduli (SecureStore, expo-video, haptics)
- 3.7 Stilizovanje na dve platforme: Tailwind 4 na webu, NativeWind na nativnoj aplikaciji
- 3.8 Monorepo: pnpm i Turborepo
- ○ 3.9 Cloudflare Stream i R2

### 4. ★ Analiza zahteva

- 4.1 Akteri: jedan pasus (posetilac, polaznik, kreator, spoljni sistemi)
- 4.2 Funkcionalni zahtevi po platformama: jedna tabela FZ-1 do FZ-14 sa kolonama web/nativna (matrica i lista zahteva spojene 14.10.2026.)
- 4.3 Nefunkcionalni zahtevi
- ~~Slučajevi korišćenja~~ (izbačeno 13.10.2026.)

### 5. ★ Projektovanje sistema

- 5.1 Arhitektura: jedan API, dva klijenta, zajednički paketi (dijagram)
- 5.2 Model podataka (ER dijagram)
- 5.3 Slojevi API-ja: routes → controllers → services → repository
- 5.4 Autentifikacija: JWT, osvežavanje tokena, čuvanje tokena po platformi (cookie/localStorage na webu, SecureStore na nativnoj)
- 5.5 Tok „jednog izvora istine“: db-schema → contract → OpenAPI → api-client → web/native
- 5.6 Navigacija i UI po platformi: bočni meni i mobilna donja navigacija na webu, tabovi i sheet na nativnoj

### 6. ★ Ponovna upotreba koda između platformi

Novo poglavlje i najjači argument za naslov.

- 6.1 Šta je zajedničko: tipovi i validacija, API hookovi, obrada grešaka, prevodi, dizajn tokeni
- 6.2 Šta mora biti posebno po platformi (materijal za tabelu je u `apps/native/spec/`):
  - `<video>` na webu → `expo-video`
  - `canvas-confetti` → Reanimated
  - `navigator.vibrate` → `expo-haptics`
  - `localStorage` → SecureStore
  - linkovi za dokumente → `expo-web-browser`
- 6.3 Promene zbog druge platforme: `env.ts` čita i `EXPO_PUBLIC_*`, deljena kopija React Query-ja, pinovanje verzija u monorepou
- ◆ 6.4 Merenje deljenja koda (koliko linija je u zajedničkim paketima, a koliko po klijentu)

### 7. ★ Implementacija serverske strane i web aplikacije

- 7.1 Kursevi, teme, lekcije (editor sa automatskim čuvanjem)
- 7.2 Multimedija: direktan upload, webhook
- 7.3 Upis, pozivnice, privatni kursevi
- 7.4 Praćenje napretka
- 7.5 Kvizovi i recenzije
- 7.6 Obaveštenja: Web Push i istorija obaveštenja
- 7.7 Lokalizacija (sr/en) i teme
- 7.8 PWA: instalacija, offline stranica, vibracija, responzivnost

### 8. ★ Implementacija nativne aplikacije

- 8.1 Integracija Expo aplikacije u monorepo (Metro, NativeWind, workspace zavisnosti)
- 8.2 Prijava i bezbedno čuvanje tokena
- 8.3 Katalog i beskonačna lista (`useInfiniteQuery` nad Orval fetcherima)
- 8.4 Detalji kursa: stablo lekcija u sheet-u, deep linkovi `?lesson=`
- 8.5 Video, napredak, kvizovi i recenzije
- 8.6 Sinhronizacija korisničkih podešavanja (jezik, tema)

### 9. ◆ Integracija veštačke inteligencije

AI generisanje kvizova (Claude), MCP server, OAuth za MCP klijente. Savremeno i atraktivno za komisiju.

### 10. ◆ Prikaz rada aplikacije

Snimci ekrana istog toka (npr. polaganje kviza) na desktopu, mobilnom webu, iOS-u i Android-u, jedni pored drugih.

### 11. ◆ Postavljanje u produkciju i cena održavanja

- 11.1 Postavljanje: Railway za API i web; EAS build za prodavnice aplikacija (za sada samo plan)
- 11.2 Cena održavanja sistema za 100, 1 000, 10 000, 100 000 i 1 000 000 korisnika
  - Stavke troška, za svaku servis koji sistem zaista koristi:
    - Railway: dva servisa (API i web), naplata po CPU-u, RAM-u i odlaznom saobraćaju
    - Supabase: PostgreSQL baza i autentifikacija (plan, veličina baze, broj aktivnih korisnika mesečno)
    - Cloudflare Stream: minuti uskladištenog i minuti isporučenog videa (verovatno najveća stavka)
    - Cloudflare R2: skladište dokumenata i slika (bez naplate odlaznog saobraćaja)
    - Claude API: tokeni po generisanom kvizu
    - Prodavnice: Apple Developer Program (godišnje) i Google Play (jednokratno); EAS build
    - Domen; Web Push i Expo push su besplatni
  - Pretpostavke modela korišćenja, utvrđene pre računanja: udeo aktivnih korisnika mesečno, minuti videa po aktivnom korisniku, odnos kreatora i polaznika, broj i trajanje kurseva, broj AI kvizova mesečno
  - Tabela: nivo korisnika × stavka, uz ukupan mesečni trošak i trošak po korisniku
  - Analiza: fiksni i promenljivi troškovi; prelomne tačke (prelazak sa besplatnog na plaćeni plan, više instanci API-ja, connection pooling i replike baze na 100 000+); šta najviše utiče na cenu
  - Izvori: zvanični cenovnici servisa, sa datumom pristupa. Za 1 000 000 korisnika cene su često stvar ugovora, pa jasno reći da je procena gruba

### 12. ★ Zaključak

- Jedan pasus o ograničenjima i daljem razvoju (poglavlje „Diskusija, ograničenja i dalji razvoj“ izbačeno 14.10.2026, a od njegovog sadržaja ostaje samo ovo): nativni klijent nije izjednačen sa webom, nativni push traži Expo push tokene na serveru, nema automatskih testova (provera: typecheck, lint, CI build, `expo-doctor`, ručni scenariji), nedovršene web funkcionalnosti (reset lozinke, Google prijava, avatar, admin panel)

### ★ Literatura

### ○ Prilozi

Delovi koda, OpenAPI specifikacija, uputstvo za pokretanje.

## Na šta paziti

- **Naslov i React Native.** Naslov kaže „korišćenjem web tehnologija“, a React Native nije web u užem smislu. Opravdanje u radu: ceo sistem koristi web tehnologije (TypeScript, React, HTTP/REST, CSS-slično stilizovanje preko NativeWind-a). Ovo obavezno objasniti u uvodu ili poglavlju 3, jer je lako pitanje za komisiju.
- **Obim nativnog dela.** Kreator, obaveštenja i profil na nativnoj strani su trenutno placeholderi. Dve opcije:
  - dovršiti bar faze 2–3 (push i profil) pre predaje;
  - predstaviti podelu kao projektnu odluku: web je puna aplikacija, nativna je aplikacija za polaznike. Tada jasno navesti šta je urađeno u poglavljima 4 i 12, bez preuveličavanja.
- **Testovi.** Automatskih testova nema. U zaključku (poglavlje 12) kratko navesti šta se i kako proverava.
- **Obim rada:** oko 45–55 strana. Teorija (poglavlja 2–3) oko 30%, projektovanje i implementacija (poglavlja 4–10) oko 55%.
- **Obaveznost sekcija** je izvedena iz dva uzorka radova. Proveriti sa mentorom ili u pravilniku ETF-a za završne radove. Sažetak/Abstract ima samo noviji rad, pa je verovatno obavezan u sadašnjem formatu.
