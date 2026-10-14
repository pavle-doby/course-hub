# Razvoj višeplatformske aplikacije za kurseve korišćenjem web tehnologija

# 1. Uvod

## 1.1 Motivacija

Polaznici onlajn kurseva uče na više uređaja: u septembru 2026. godine mobilni uređaji činili su 58,99% svetskog web saobraćaja, a desktop računari 39,26% [1]. Aplikacija za učenje zato treba da radi u pretraživaču i kao aplikacija na iOS-u i Android-u, što tradicionalno znači tri kodne baze (web, Swift, Kotlin) i trostruko održavanje. Web tehnologije smanjuju taj trošak: progresivna web aplikacija (eng. _Progressive Web App_ – PWA) se iz jedne kodne baze instalira na uređaj, radi bez internet konekcije i prima push obaveštenja [2], a React Native [3] i platforma Expo [4] omogućavaju nativnu aplikaciju u TypeScript-u i programskom modelu biblioteke React. Na učenje utiču još kvizovi i veštačka inteligencija (VI): studenti koji su gradivo ponavljali kroz testove posle nedelju dana sećali su se 61% teksta, a oni koji su ga ponovo čitali 40% [5], dok VI kreatoru pomaže pri pravljenju sadržaja, a polazniku pri učenju.

## 1.2 Problem

Rad rešava problem razvoja aplikacije za onlajn kurseve dostupne na webu, iOS-u i Android-u bez tri nezavisna sistema. Problem ima tri nivoa: izbor pristupa višeplatformskom razvoju (nativni, hibridni, React Native ili PWA), jedan programski interfejs (eng. _Application Programming Interface_ – API) za sve klijente i organizacija koda u kojoj se tipovi, validacija, pozivi API-ja, prevodi i komponente pišu jednom, a izmena na jednom mestu ne ostavlja ostale delove nesaglasnim. Funkcionalno, aplikacija pokriva ceo životni ciklus kursa: kreator pravi kurs od tema i lekcija sa videom, dokumentima i kvizovima, a polaznik se upisuje, uči, rešava kvizove, prati napredak i ocenjuje kurs.

## 1.3 Cilj rada

Cilj rada je da pokaže monorepo arhitekturu u kojoj je pisanje web i nativne aplikacije efikasno. Stranice se sklapaju od gotovih komponenti, a logika se oslanja na funkcije za pozive API-ja koje se automatski generišu iz opisa API-ja, pa tačno odgovaraju serveru i bazi. Promena tabele ili rute prenosi se kroz ceo sistem, od tipova u ugovoru do šema u formama, i otkriva se kao greška u tipovima pre izvršavanja. Serverska aplikacija razdvaja odgovornosti: poslovna pravila su u domenskim servisima, a rute, validacija, pristup bazi i obrada grešaka rade samo svoj posao, pa se kod lako čita. Na istoj osnovi nova aplikacija, npr. administratorska, pravi se bez ponovnog pisanja ugovora i klijenta za API. Rad pokazuje i da je PWA dobar izbor za prvu verziju proizvoda (eng. _Minimum Viable Product_ – MVP) kada funkcionalni zahtevi staju u njena ograničenja. Funkcionalni ciljevi su učenje dostupno na svim uređajima, VI pri pravljenju kursa i učenju i kvizovi kao provera znanja i motivacija za nastavak kursa.

## 1.4 Doprinos rada

Praktični doprinos je sistem _Course Hub_, monorepo sa jednim serverom i dva klijenta u jeziku TypeScript. Server (Node.js, Express) izlaže REST (eng. _Representational State Transfer_) API sa 82 operacije opisane specifikacijom OpenAPI, nad bazom PostgreSQL. Web klijent (Next.js) je PWA i pokriva ceo životni ciklus kursa, a nativni klijent (Expo, React Native) za iOS i Android pokriva deo za polaznika. Klijenti dele šeme, generisani klijent za API, obradu grešaka, prevode i dizajn tokene, po uzoru na monorepo praksu kompanija kao što je Google [6], pa je 70,4% koda koji koristi nativni klijent zajedničko. Jezički model Claude predlaže pitanja za kviz, a MCP server (eng. _Model Context Protocol_) omogućava asistentima zasnovanim na VI da prave nacrte kurseva i čitaju upisane kurseve, ako je kreator to dozvolio. Analitički doprinos su uporedni prikaz pristupa višeplatformskom razvoju, obrazloženje arhitektonskih odluka i merenje udela zajedničkog koda.

## 1.5 Organizacija rada

Rad ima dvanaest poglavlja. Poglavlje 2 opisuje postojeće platforme za kurseve i pristupe višeplatformskom razvoju, poglavlje 3 korišćene tehnologije, a poglavlje 4 aktere i zahteve. Poglavlje 5 prikazuje projektovanje sistema (arhitektura, model podataka, slojevi servera, autentifikacija, tok od šeme baze do klijenata), a poglavlje 6 deljenje koda između platformi i njegov izmereni udeo. Poglavlja 7 i 8 opisuju implementaciju servera i web klijenta, odnosno nativnog klijenta, poglavlje 9 integraciju VI, poglavlje 10 rad aplikacije na različitim platformama, a poglavlje 11 postavljanje u produkciju i cenu održavanja. Poglavlje 12 je zaključak, sa ograničenjima i pravcima daljeg razvoja.

# 2. Problem i srodna rešenja

## 2.1 Platforme za onlajn kurseve

Sistemi za upravljanje učenjem (eng. _Learning Management System_ – LMS), kao Moodle i Canvas, instalira obrazovna institucija, pa je Moodle mobilna aplikacija klijent sajta određene institucije [7]. Masovne otvorene onlajn kurseve (eng. _Massive Open Online Course_ – MOOC) nude Coursera i edX; Coursera je za 2025. godinu prijavila oko 197 miliona registrovanih polaznika i sadržaj više od 200 univerziteta i 175 kompanija [8]. Udemy je tržište kurseva nezavisnih instruktora i od 11. maja 2026. godine podružnica Coursere [9], a Teachable platforma na kojoj kreatori prodaju kurseve pod svojim imenom [10]. Sve ove platforme imaju web aplikaciju kao potpun klijent i aplikacije za iOS i Android namenjene pretežno praćenju sadržaja, čija je ključna dodatna funkcija učenje bez internet konekcije [7, 8]; deo funkcija ostaje samo na webu, npr. nadgledani ispiti na edX-u [11] i upis na kurs na Teachable-u [10]. Tehnologija mobilnih aplikacija može se pouzdano utvrditi samo za otvoreni kod: Moodle aplikacija je hibridna (Angular, Ionic, Cordova) [7, 12], dok je Canvas potpuno nativan, sa Android aplikacijom u Javi i Kotlinu [13] i iOS aplikacijom u Swift-u, iz koje se uklanja raniji React Native kod [14]. VI je postala deo ovih platformi: Moodle od verzije 4.5 ima podsistem za VI [15], a Coursera Coach polazniku postavlja pitanja za vežbu pre kviza [8].

## 2.2 Pristupi višeplatformskom razvoju

Literatura pristupe klasifikuje od 2012. godine, kada su Heitkötter i saradnici dali okvir sa infrastrukturnim i razvojnim kriterijumima [16]; detaljnu taksonomiju dali su El-Kassas i saradnici [17]. Rad koristi taksonomiju Biørn-Hansena, Grønlija i Ghinee sa pet kategorija: hibridni, interpretirani, unakrsno kompajlirani, modelom vođeni pristup i PWA [18]. Modelom vođeni pristup je pretežno akademski, pa su razmotreni ostali, uz nativni kao osnovu za poređenje:

- **Nativni:** posebna aplikacija po platformi (Swift za iOS, Kotlin za Android), sa potpunim pristupom uređaju, ali zasebnom kodnom bazom; razvoj za iOS traži macOS [16].
- **Web i PWA:** jedan kod za sve pretraživače i distribucija preko adrese, bez prodavnica [16]; PWA dodaje instalaciju, rad bez konekcije preko servisnog radnika (eng. _service worker_) i push obaveštenja [2]. Majchrzak i saradnici su 2018. godine zaključili da PWA ne može biti objedinjujuće rešenje dok ga iOS ne podržava u punoj meri [19].
- **Hibridni:** web kod u nativnom omotaču, prikazan u ugrađenoj komponenti pretraživača (eng. _WebView_), sa pristupom uređaju preko priključaka [18]; predstavnici su Cordova i Capacitor [20], a pristup je upotrebljiv kada nije potreban potpuno nativan izgled [16].
- **Interpretirani:** JavaScript ili TypeScript kod koji iscrtava nativne komponente [18], npr. React Native. Od verzije 0.76 (23. oktobar 2024.) podrazumevana je nova arhitektura: JSI (eng. _JavaScript Interface_) za direktne sinhrone pozive nativnog koda, Fabric za iscrtavanje i TurboModules za module koji se učitavaju po potrebi [21], bez troška serijalizacije starog asinhronog mosta [22].
- **Unakrsno kompajlirani:** prevođenje u mašinski kod, npr. Flutter, sa jezikom Dart i sopstvenim komponentama i iscrtavanjem [23].

Merenja ne potvrđuju da je nativna aplikacija uvek najbrža. Na šest Android uređaja i 16.290 merenja većina radnih okvira ima značajan dodatni trošak, ali React Native u proseku troši manje memorije od nativne aplikacije, a Flutter u mirovanju i do deset puta više [24]; Flutter obično ima najmanji dodatni trošak, a React Native je u aplikaciji sa stalnim animacijama trošio i do 96% manje energije od sledećeg okvira [25]. Web verzije deset servisa troše oko 53% više energije i 49% više procesorskog vremena od nativnih [26], a servisni radnik nema značajan uticaj na potrošnju [27]. Sva merenja su na Androidu i, za React Native, na staroj arhitekturi, pa literatura zaključuje da izbor zavisi od vrste aplikacije [28].

### 2.2.1 Progresivne web aplikacije na različitim platformama

Mogućnosti PWA razlikuju se pre svega između Androida i desktop pretraživača, sa jedne strane, i iOS-a, sa druge:

- **Instalacija:** Chrome na Androidu instalira PWA kao WebAPK, a Chrome i Edge na desktopu iz adresne linije [29]; dugme za instalaciju (`beforeinstallprompt`) postoji samo u Chromium pretraživačima [30]. Na iOS-u korisnik ručno bira „Add to Home Screen“, a od iOS-a 26 takav sajt se podrazumevano otvara kao web aplikacija [31]; Safari 17 na macOS-u dodaje web aplikaciju u Dock [32]. Na Google Play PWA se objavljuje kao TWA (eng. _Trusted Web Activity_) [33].
- **Push obaveštenja:** u Chrome-u od 2015. godine, i na Androidu, bez instalacije [34]; na iOS-u od verzije 16.4 (2023.) samo za aplikacije dodate na početni ekran i uz dozvolu traženu posle radnje korisnika [35]; od iOS-a 18.4 postoji deklarativni Web Push, ali bez tihih obaveštenja [36].
- **Skladište i rad u pozadini:** servisni radnik radi u Safari-ju od iOS-a 11.3 [37], ali Safari briše podatke sajta posle sedam dana korišćenja bez interakcije sa njim [38]; od Safari-ja 17 sajt može da koristi do 60% diska, uz heurističko trajno čuvanje [39]. Pozadinska sinhronizacija i preuzimanje postoje samo u Chromium-u [40], a Safari ne podržava `navigator.vibrate` [41].
- **Zavisnost od proizvođača:** Apple je u probnim verzijama iOS-a 17.4 u Evropskoj uniji uklonio web aplikacije sa početnog ekrana, pozivajući se na Zakon o digitalnim tržištima (eng. _Digital Markets Act_ – DMA) [42], i odluku povukao 1. marta 2024. godine [43, 44]. Manifest, Push API i servisni radnici još nisu W3C preporuke [45, 46, 47], dok su protokol za push poruke i VAPID standardi organizacije IETF [48, 49].

## 2.3 Uporedni prikaz pristupa

Tabela 2.1 sažima poređenje; podaci o performansama odnose se na Android.

_Tabela 2.1: Poređenje pristupa višeplatformskom razvoju_

| Kriterijum                  | Nativni (Swift, Kotlin)              | Web aplikacija / PWA                                                   | Hibridni (Cordova, Capacitor)    | Interpretirani (React Native)   | Unakrsno kompajlirani (Flutter)                                       |
| --------------------------- | ------------------------------------ | ---------------------------------------------------------------------- | -------------------------------- | ------------------------------- | --------------------------------------------------------------------- |
| Deljenje koda               | Nema, poseban kod za svaku platformu | Jedan kod za sve pretraživače                                          | Jedan web kod u nativnom omotaču | Jedan JavaScript/TypeScript kod | Jedan Dart kod                                                        |
| Korisnički interfejs        | Nativni                              | Web                                                                    | Web unutar WebView-a             | Nativne komponente              | Sopstvene komponente i iscrtavanje                                    |
| Performanse                 | Osnova za poređenje                  | U pretraživaču oko 53% više energije od nativne [26]                   | Najneujednačeniji rezultati [24] | Zavise od zadatka [24, 25]      | Obično najmanji dodatni trošak, najveća memorija u mirovanju [24, 25] |
| Pristup uređaju             | Potpun                               | Ograničen, posebno na iOS-u                                            | Preko priključaka                | Preko nativnih modula (JSI)     | Preko kanala ka platformi                                             |
| Distribucija                | Prodavnice aplikacija                | Adresa (URL), uvek najnovija verzija; na Androidu i Google Play        | Prodavnice aplikacija            | Prodavnice aplikacija           | Prodavnice aplikacija                                                 |
| Push obaveštenja            | Potpuna                              | Android i desktop bez instalacije; iOS od 16.4, samo posle instalacije | Preko priključka                 | Preko nativnog modula           | Preko priključka                                                      |
| Rad bez internet konekcije  | Potpun                               | Servisni radnik svuda; pozadinska sinhronizacija samo u Chromium-u     | Preko priključaka                | Preko nativnih modula           | Preko priključaka                                                     |
| Potrebna znanja             | Swift i Kotlin                       | HTML, CSS, JavaScript                                                  | Web tehnologije                  | JavaScript/TypeScript, React    | Dart                                                                  |
| Primer platforme za kurseve | Canvas                               | Web klijenti svih platformi                                            | Moodle aplikacija                | Nativni klijent Course Hub-a    | —                                                                     |

## 2.4 Pozicioniranje rada

Nijedan pristup ne dominira. PWA ima najmanji trošak razvoja i distribucije: jedan kod radi u svakom pretraživaču, objavljuje se na adresi, bez prodavnica, i nova verzija odmah stiže do svih korisnika. Njena ograničenja su uglavnom na iOS-u: ručna instalacija, push tek posle instalacije, bez pozadinske sinhronizacije i zavisnost od odluka Apple-a (odeljak 2.2.1). PWA je zato dobar izbor za MVP kada funkcionalni zahtevi ne traže ono što ona ne pruža; za aplikaciju za kurseve, čiji su osnovni tok pregled sadržaja, video i kvizovi, to važi, osim za učenje bez konekcije, koje Course Hub ne podržava (odeljak 4.3). Kada zatreba više, React Native daje nativnu aplikaciju u istom jeziku i programskom modelu. Rad kombinuje oba pristupa: web klijent je PWA u Next.js-u, a nativni klijent je napravljen u Expo-u; oba koriste isti API i zajedničke pakete, pa se cena druge kodne baze, glavni trošak višeplatformskog razvoja [16], svodi na navigaciju, prikaz i pristup uređaju (poglavlje 6). Nativni klijent za sada pokriva deo za polaznika, a nativna push obaveštenja nisu implementirana (poglavlje 12).

# 3. Korišćene tehnologije

Tehnologije sistema čine lanac kojim jedna definicija podataka putuje od baze do oba klijenta: tabele u biblioteci Drizzle ORM → šeme za validaciju u biblioteci Zod → OpenAPI specifikacija API-ja → funkcije za pozive API-ja koje generiše alat Orval. Poglavlje prati taj lanac, a tabela 3.1 daje pregled tehnologija po slojevima.

_Tabela 3.1: Tehnologije sistema Course Hub_

| Sloj              | Tehnologije                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| Web klijent       | Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui i Radix   |
| PWA               | Manifest web aplikacije, servisni radnik, Push API (Web Push, VAPID)   |
| Nativni klijent   | Expo SDK 57, React Native 0.86, Expo Router, NativeWind 4              |
| API               | Express 5, Node.js 22 ili noviji, Pino, OpenAPI 3.1                    |
| Baza podataka     | PostgreSQL (Supabase), Drizzle ORM, `drizzle-kit`                      |
| Autentifikacija   | Supabase Auth, sa pristupnim tokenom i tokenom za osvežavanje          |
| Multimedija       | Cloudflare Stream (video) i Cloudflare R2 (dokumenti i naslovne slike) |
| Zajednički tipovi | `@repo/contract` (Zod šeme, izvedene iz tabela pomoću `drizzle-zod`)   |
| Klijent za API    | Orval → TanStack Query i Axios (automatski generisan)                  |
| Lokalizacija      | i18next, srpski (podrazumevani) i engleski                             |
| Izgradnja         | Turborepo, pnpm radni prostor                                          |

## 3.1 TypeScript i Zod

### 3.1.1 TypeScript

TypeScript je programski jezik kompanije Microsoft koji jeziku JavaScript dodaje statički sistem tipova [50]. Tipovi se porede strukturno, po obliku vrednosti, a ne po imenu [50], i proveravaju se pri prevođenju u JavaScript, pa se greške otkrivaju u toku razvoja, a ne kod korisnika. Course Hub koristi TypeScript 5.8 na serveru i webu i 6.0 u nativnoj aplikaciji; aktuelna verzija 7.0 (jul 2026.) prva je sa kompajlerom napisanim u jeziku Go [51]. TypeScript je jedini jezik u sistemu, pa isti tipovi opisuju podatke u bazi, na serveru i u oba klijenta.

### 3.1.2 Zod

Tipovi TypeScript-a postoje samo pri prevođenju, a podaci sa mreže, npr. telo HTTP zahteva, moraju se proveriti u toku izvršavanja. Zod je biblioteka za validaciju šema sa statičkim zaključivanjem tipova [52]: šema se definiše jednom, metoda `.parse()` proverava podatke, a TypeScript tip se izvodi iz šeme, pa se validacija i tip ne mogu razići. Zod 4 parsira i do 14,7 puta brže od Zod-a 3 i prevodi šeme u JSON Schema [53]. Sve šeme zahteva i odgovora nalaze se u paketu `@repo/contract`, koji koriste server i oba klijenta.

## 3.2 REST, OpenAPI i generisanje klijenta

### 3.2.1 REST

Serverski API sledi arhitektonski stil REST, koji je Roy Fielding definisao 2000. godine [54]. Od njegovih ograničenja Course Hub poštuje razdvajanje klijenta i servera, komunikaciju bez čuvanja stanja na serveru (eng. _stateless_; svaki zahtev nosi sopstveni token) i uniformni interfejs sa resursima kao što je `/v1/courses` i standardnim HTTP metodama [54].

### 3.2.2 OpenAPI

OpenAPI je standardan opis HTTP API-ja nezavisan od programskog jezika, koji čitaju i ljudi i alati za dokumentaciju, testiranje i generisanje koda; verzija 3.1.0 objavljena je 2021. godine u okviru Linux fondacije [55]. Šema podataka u OpenAPI 3.1 usklađena je sa standardom JSON Schema, pa se Zod šeme u nju preslikavaju gotovo bez gubitaka. Course Hub opis API-ja ne piše ručno: biblioteka `@asteasolutions/zod-to-openapi` registruje svaku putanju u kodu (`registry.registerPath`) nad istim Zod šemama koje server koristi za validaciju i generiše `openapi.json` [56], pa opis uvek odgovara ponašanju servera.

### 3.2.3 Orval

Iz `openapi.json` alat Orval generiše klijent za API: tipizovanu funkciju i React hook za svaku operaciju [57]. Generisani kod je u paketu `@repo/api-client`, ne menja se ručno i ponovo se generiše posle svake promene API-ja, pa tačno odgovara rutama servera i oblicima podataka iz baze. Promena Zod šeme na serveru zato postaje greška u tipovima u svakom delu web ili nativnog klijenta koji je koristi, pre nego što kod stigne do korisnika.

### 3.2.4 TanStack Query

Hook-ovi koje generiše Orval koriste biblioteku TanStack Query, koja upravlja „serverskim stanjem“: dohvatanjem, keširanjem, sinhronizacijom i osvežavanjem podataka sa servera, uz uklanjanje dupliranih zahteva i osvežavanje u pozadini [58]. Komponente zbog toga ne moraju same da vode računa o učitavanju, greškama i zastarelim podacima, već samo pozivaju odgovarajući hook.

### 3.2.5 Axios

Sami HTTP zahtevi šalju se bibliotekom Axios, HTTP klijentom zasnovanim na obećanjima (eng. _promise_) za pretraživač i Node.js, koji podržava presretače zahteva i odgovora [59]. U Course Hub-u presretač automatski dodaje pristupni token svakom zahtevu i osvežava ga kada istekne.

## 3.3 Serverske tehnologije i baza podataka

### 3.3.1 Node.js

Server je napisan za Node.js, asinhrono okruženje za izvršavanje JavaScript-a vođeno događajima, u kome ulazno-izlazne operacije ne blokiraju proces [60]. Projekat traži Node.js 22 ili noviji, što obuhvata obe linije sa dugoročnom podrškom (eng. _Long-Term Support_ – LTS) u septembru 2026. godine, 22 i 24 [61].

### 3.3.2 Express

HTTP server je napravljen pomoću radnog okvira Express 5, zvanično predstavljenog 15. oktobra 2024. godine [62]. Za ovaj rad je najvažnija novina Express-a 5 to što se greške iz asinhronih funkcija za obradu zahteva automatski prosleđuju centralnom mehanizmu za obradu grešaka [62]. Zahvaljujući tome, servisi sistema Course Hub mogu da bacaju tipizovane greške (npr. `NotFoundError`), koje jedan zajednički međusloj (eng. _middleware_) pretvara u JSON odgovor sa odgovarajućim HTTP statusom.

### 3.3.3 Pino

Događaji na serveru beleže se bibliotekom Pino, koja zapise piše u formatu JSON, pa se mogu pretraživati po poljima [63]. Formatiranje i slanje zapisa obavljaju transporti u zasebnoj niti (eng. _worker thread_), pa ne opterećuju nit koja obrađuje zahteve [64]. Biblioteka `pino-http` uz svaki zahtev beleži statusni kod i vreme odgovora [65]; svaki zahtev dobija identifikator koji se vraća u zaglavlju `X-Request-Id`, a odgovori 4xx beleže se kao upozorenja, 5xx kao greške.

### 3.3.4 PostgreSQL

Podaci se čuvaju u sistemu PostgreSQL, objektno-relacionoj bazi podataka otvorenog koda koja koristi i proširuje jezik SQL i koja je u skladu sa svojstvima ACID od 2001. godine [66]. Pored relacionih tabela za kurseve, teme, lekcije, upise i napredak, Course Hub koristi i tip `jsonb` za pitanja u kvizovima. Ovaj tip čuva JSON podatke u binarnom obliku, brže se obrađuje od tipa `json` i podržava indeksiranje, zbog čega ga dokumentacija preporučuje za većinu aplikacija [67].

### 3.3.5 Supabase

Baza je na platformi Supabase, gde je svaki projekat potpuna PostgreSQL baza sa dodatnim servisima [68]; Course Hub koristi bazu i servis za autentifikaciju. Posle prijave korisnik dobija pristupni token u formatu JSON Web Token (JWT), koji podrazumevano važi jedan sat, i jednokratni token za osvežavanje [69]. JWT je standard organizacije IETF za prenošenje tvrdnji (eng. _claims_) zaštićenih digitalnim potpisom [70]; Supabase-ov JWT nosi identifikator korisnika i vreme isteka [71]. Token se proverava u međusloju `handleAuth` (odeljak 5.4).

### 3.3.6 Drizzle ORM

Pristup bazi ostvaren je bibliotekom Drizzle ORM, TypeScript alatom za objektno-relaciono mapiranje (eng. _Object-Relational Mapping_ – ORM) sa upitima koji verno prate SQL [72]. Šema baze piše se u TypeScript-u, a `drizzle-kit` iz nje generiše SQL migracije [73]. Ključna je biblioteka `drizzle-zod`, koja iz definicije tabele izvodi Zod šeme [74]. Tabela u paketu `@repo/db-schema` tako postaje jedini izvor istine: iz nje nastaju migracije i šeme u `@repo/contract`, a iz šema OpenAPI opis i klijent za API. Drizzle još nije dostigao verziju 1.0; projekat koristi stabilnu liniju 0.45, a 1.0 je u fazi kandidata za izdanje [75].

### 3.3.7 Cloudflare Stream

Video snimci lekcija čuvaju se i isporučuju pomoću servisa Cloudflare Stream, koji video automatski kodira u više kvaliteta i isporučuje ga adaptivnim protokolima HLS (eng. _HTTP Live Streaming_) i DASH (eng. _Dynamic Adaptive Streaming over HTTP_) [76]. Kreator kursa video otprema direktno na Cloudflare, preko jednokratne adrese koju mu izda server, pa video ne prolazi kroz server sistema Course Hub [77]. Kada se obrada videa završi, Cloudflare o tome obaveštava server pozivom (eng. _webhook_) potpisanim HMAC-SHA256 potpisom, koji server proverava nad izvornim telom zahteva [78].

### 3.3.8 Cloudflare R2

Ostali fajlovi (dokumenti lekcija i naslovne slike kurseva) čuvaju se u objektnom skladištu Cloudflare R2, koje ne naplaćuje odlazni saobraćaj [79]; klijent im pristupa preko privremenih potpisanih adresa (eng. _presigned URL_) [80].

## 3.4 React i Next.js

### 3.4.1 React

React je biblioteka kompanije Meta za izradu korisničkog interfejsa od komponenti za višekratnu upotrebu, koje opisuju izgled interfejsa za dato stanje [81]. Pri promeni podataka React poredi novi virtuelni prikaz objektnog modela dokumenta (eng. _Document Object Model_ – DOM) sa prethodnim i u stvarni DOM upisuje samo razlike; postupak se naziva usklađivanje (eng. _reconciliation_) [81, 82]. Komponente su funkcije napisane u sintaksi JSX (eng. _JavaScript XML_), koje primaju svojstva (eng. _props_) i čuvaju stanje (eng. _state_) [83]. Oba klijenta koriste React, pa dele programski model, iako web iscrtava HTML elemente, a nativni klijent nativne komponente.

### 3.4.2 Next.js

Web klijent je napravljen radnim okvirom Next.js, koji razvija kompanija Vercel. Next.js koristi rutiranje zasnovano na fajlovima (App Router), u kome struktura direktorijuma `app/` određuje adrese stranica, i podržava prikaz na serveru i serverske komponente. Verzija 16, objavljena 21. oktobra 2025. godine, uvela je Turbopack kao podrazumevani alat za pakovanje koda i zamenila fajl `middleware.ts` fajlom `proxy.ts`, koji eksplicitno označava mrežnu granicu aplikacije [84]. Course Hub koristi Next.js 16.3, a fajl `apps/web/proxy.ts` zadužen je za usmeravanje zahteva prema izabranom jeziku.

## 3.5 Progresivne web aplikacije

Web klijent postaje progresivna web aplikacija pomoću tri tehnologije: manifesta web aplikacije, servisnog radnika i Push API-ja. Ograničenja ovih tehnologija na različitim platformama opisana su u odeljku 2.2.1.

### 3.5.1 Manifest web aplikacije

Manifest web aplikacije je JSON dokument koji opisuje naziv, ikone, boje i način prikaza aplikacije, na osnovu koga operativni sistem može aplikaciju da instalira [45]. U Course Hub-u ga generiše fajl `app/manifest.ts`.

### 3.5.2 Servisni radnik

Servisni radnik je skripta koja radi odvojeno od stranice i presreće mrežne zahteve, pa može da posluži keširan sadržaj kada internet konekcija nije dostupna [46]. Course Hub-ov servisni radnik (`public/sw.js`) prikazuje posebnu stranicu kada korisnik nema internet konekciju i prima push poruke.

### 3.5.3 Push API i VAPID

Push API omogućava serveru da pošalje poruku servisnom radniku čak i kada aplikacija nije otvorena [47]. Poruke se isporučuju protokolom definisanim u standardu RFC 8030 [48], a server se servisu za isporuku predstavlja pomoću mehanizma VAPID (eng. _Voluntary Application Server Identification_), definisanog standardom RFC 8292 [49]. Server sistema Course Hub šalje obaveštenja pomoću biblioteke `web-push`, na primer kreatoru kada se polaznik upiše na njegov kurs ili polaznicima kada se objavljeni kurs izmeni.

## 3.6 React Native i Expo

### 3.6.1 React Native

Nativni klijent je napravljen pomoću radnog okvira React Native, koji programski model React-a prenosi na platforme Android i iOS: kod se piše u JavaScript-u ili TypeScript-u, a iscrtava se nativnim komponentama platforme [3]. Od verzije 0.82, objavljene u oktobru 2025. godine, React Native radi isključivo na novoj arhitekturi opisanoj u odeljku 2.2 [85]. Sam React Native tim preporučuje da se nove aplikacije prave pomoću radnog okvira izgrađenog nad React Native-om i kao takav navodi Expo [86].

### 3.6.2 Expo

Expo postavlja cilj da jedan JavaScript/TypeScript projekat radi nativno na Android-u, iOS-u i webu [4]. Verzija Expo SDK 57, objavljena 30. juna 2026. godine, zasnovana je na React Native-u 0.86 i React-u 19.2 [87], i nju koristi Course Hub. Za ovaj rad posebno su važni sledeći delovi Expo platforme:

- **Expo Router** pretvara fajlove u direktorijumu `app/` u ekrane aplikacije, po istom principu kao App Router u Next.js-u, pri čemu je svaki ekran automatski dostupan preko dubokog linka (eng. _deep link_) [88]. Zahvaljujući tome, adresa lekcije ima isti oblik u web i u nativnom klijentu, pa link iz obaveštenja može da otvori istu lekciju na obe platforme.
- **Kontinuirano generisanje nativnog koda** (eng. _Continuous Native Generation_ – CNG) generiše nativne projekte za iOS i Android iz konfiguracije, pa se oni ne održavaju ručno [89].
- **EAS** (eng. _Expo Application Services_) obuhvata servise za izgradnju aplikacije u oblaku, objavljivanje u prodavnicama i ažuriranje bez nove verzije u prodavnici [90].
- **Nativni moduli** zamenjuju web API-je tamo gde je potrebno: `expo-secure-store` čuva tokene šifrovane u iOS Keychain-u i Android Keystore-u, umesto u skladištu pretraživača [91], a `expo-video` reprodukuje HLS i DASH snimke, pa radi direktno sa Cloudflare Stream-om [92].

## 3.7 Korisnički interfejs na dve platforme: stilizovanje i lokalizacija

### 3.7.1 Tailwind CSS

Web klijent se stilizuje pomoću biblioteke Tailwind CSS, u kojoj se izgled elementa zadaje malim pomoćnim klasama direktno u oznakama. Verzija 4.0, objavljena 22. januara 2025. godine, donela je nov, znatno brži mehanizam za izgradnju i konfiguraciju zapisanu u samom CSS-u, u kojoj su vrednosti dizajn tokena CSS promenljive [93].

### 3.7.2 shadcn/ui i Radix

Komponente web klijenta zasnovane su na kolekciji shadcn/ui, koja nije klasična biblioteka komponenti, već kod komponenti koji se kopira u projekat i dalje prilagođava [94], i na primitivama Radix, nestilizovanim komponentama koje prate WAI-ARIA obrasce pristupačnosti i same upravljaju fokusom i tastaturom [95].

### 3.7.3 NativeWind

Nativni klijent koristi biblioteku NativeWind, koja omogućava da se React Native komponente stilizuju istim Tailwind klasama [96]. Stabilna verzija NativeWind 4 zahteva Tailwind CSS 3 [96], pa sistem namerno koristi dve glavne verzije Tailwind-a: verziju 4 na webu i verziju 3 na nativnoj platformi. Zajedničke su im samo vrednosti dizajn tokena (boje, razmaci, zaobljenja) iz paketa `@repo/ui-theme`, pa obe aplikacije imaju isti vizuelni identitet iako se komponente razlikuju.

### 3.7.4 i18next

Obe aplikacije su prevedene na srpski i engleski jezik pomoću biblioteke i18next, radnog okvira za internacionalizaciju JavaScript aplikacija koji podržava množinu, kontekst i umetanje vrednosti u tekst [97]. Prevodi se nalaze u zajedničkom paketu `@repo/i18n`, sa posebnom konfiguracijom za web i za nativnu aplikaciju, pa se isti ključ prevoda koristi na obe platforme.

## 3.8 Monorepo: pnpm i Turborepo

Monorepo je repozitorijum sa više projekata jasno definisanih međusobnih odnosa, koji se grade i postavljaju nezavisno, ali se čuvaju i verzionišu zajedno [98]; najpoznatiji primer je Google [6]. Literatura kao prednosti navodi vidljivost koda, ponovnu upotrebu, jednostavnije upravljanje zavisnostima i koordinisane izmene više projekata, a kao nedostatke slabiju kontrolu pristupa i potrebu za alatima; recenzirana studija koja kvantitativno dokazuje prednost jednog pristupa nije pronađena, pa je izbor monorepa obrazložena inženjerska odluka [99, 100, 101]. Za Course Hub je presudno to što promena šeme u `@repo/contract` u istom komitu stiže do servera, generisanog klijenta za API i oba klijenta; sa više repozitorijuma zajednički paketi bi se objavljivali i verzionisali, pa bi klijenti mogli da koriste nesaglasne verzije ugovora. Nova aplikacija u `apps/` dobija sve pakete preko zavisnosti `workspace:*`, bez objavljivanja. Potrebu za alatima pokrivaju pnpm i Turborepo.

### 3.8.1 pnpm

pnpm je menadžer paketa koji svaki paket čuva samo jednom na disku, u skladištu adresiranom po sadržaju, i u projekte ga povezuje tvrdim vezama; u direktorijum `node_modules` stavlja samo direktne zavisnosti, pa kod ne može slučajno da koristi paket koji nije deklarisao [102]. Radni prostor (eng. _workspace_) se definiše fajlom `pnpm-workspace.yaml`, a interni paketi se referenciraju protokolom `workspace:*`, koji se uvek razrešava na lokalni paket [103]. Course Hub koristi pnpm 11. Zbog nativne aplikacije, čiji alat za pakovanje koda (Metro) očekuje klasičnu strukturu direktorijuma `node_modules`, projekat koristi opciju `nodeLinker: hoisted`, što je svesni kompromis u odnosu na podrazumevanu strogu strukturu.

### 3.8.2 Turborepo

Turborepo je sistem za izgradnju projekata u JavaScript-u i TypeScript-u, napisan u jeziku Rust, koji razvija kompanija Vercel [104]. U fajlu `turbo.json` definišu se zadaci (izgradnja, provera tipova, lint) i njihove zavisnosti, pri čemu oznaka `^build` znači da se pre izgradnje paketa moraju izgraditi paketi od kojih on zavisi [105]. Rezultati zadataka keširaju se prema hešu ulaznih fajlova, pa se zadatak čiji se ulazi nisu promenili ne izvršava ponovo [106]. U kontinuiranoj integraciji Course Hub-a komanda `pnpm turbo build --filter=api...` gradi samo serversku aplikaciju i interne pakete od kojih ona zavisi. Alternativa Turborepo-u je Nx, koji nudi graf projekata i dodatke za različite tehnologije [107]; Turborepo je izabran zbog jednostavnosti, jer se oslanja na postojeće skripte u fajlovima `package.json`.

# 4. Analiza zahteva

Zahtevi su podeljeni na funkcionalne, koji opisuju šta sistem radi, i nefunkcionalne, koji opisuju svojstva kvaliteta, prema standardu ISO/IEC/IEEE 29148 [108]. Opisuju sistem onakav kakav je implementiran.

## 4.1 Akteri

Prema specifikaciji jezika UML (eng. _Unified Modeling Language_), akter je uloga koju u interakciji sa sistemom ima korisnik ili drugi sistem, a ne konkretna osoba [109]. Course Hub ne razlikuje vrste naloga, pa je uloga korisnika vezana za kurs. Akteri su:

- **Posetilac:** neprijavljeni korisnik koji pregleda katalog javnih kurseva.
- **Polaznik:** korisnik upisan na kurs.
- **Kreator:** korisnik koji je napravio kurs.
- **Asistent zasnovan na VI:** spoljni sistem koji preko MCP-a radi u ime polaznika ili kreatora (poglavlje 9).
- **Jezički model Claude:** spoljni sistem koji predlaže pitanja za kviz.
- **Cloudflare Stream:** spoljni sistem koji javlja da je obrada video snimka završena.
- **Servisi za push:** servisi pretraživača koji isporučuju push poruke do uređaja.

Šema baze predviđa i ulogu administratora, ali nijedan klijent još ne koristi njene rute (odeljak 5.1), pa administrator nije akter.

## 4.2 Funkcionalni zahtevi po platformama

Funkcionalni zahtevi i njihova podrška po klijentu dati su u tabeli 4.1. Web klijent ispunjava sve zahteve, a nativni pokriva deo za polaznika. To je projektna odluka: polazniku je mobilna aplikacija najpotrebnija, a kreator radi pretežno na računaru, kao i kod platformi iz odeljka 2.1.

_Tabela 4.1: Funkcionalni zahtevi po platformama (✓ ostvareno, ✗ planirano)_

| Oznaka | Zahtev                                                                                                                                                                                                                 | Web                           | Nativna                            |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------- |
| FZ-1   | **Nalog.** Registracija, prijava, odjava i automatsko osvežavanje sesije.                                                                                                                                              | ✓                             | ✓                                  |
| FZ-2   | **Profil i podešavanja.** Izmena profila i brisanje naloga; jezik (srpski ili engleski) i tema čuvaju se na serveru i primenjuju na svakom uređaju posle prijave.                                                      | ✓                             | Samo primena podešavanja           |
| FZ-3   | **Katalog.** Pretraga i filtriranje objavljenih javnih kurseva, sa brojem polaznika i prosečnom ocenom; posetilac vidi opšte podatke o kursu, ali ne i sadržaj lekcija.                                                | ✓                             | ✓, samo uz prijavu                 |
| FZ-4   | **Upis.** Samostalan upis na javni kurs i odjava; na privatni kurs samo preko pozivnice, a pokušaj upisa bez nje dojavljuje se kreatoru.                                                                               | ✓                             | ✓                                  |
| FZ-5   | **Učenje.** Stablo tema i lekcija sa video snimkom, dokumentima i opisom; link do teme ili lekcije (`?topic=`, `?lesson=`) i nastavak od poslednje aktivne lekcije.                                                    | ✓                             | ✓                                  |
| FZ-6   | **Napredak.** Status lekcije, postavljen ručno ili automatski (video odgledan do kraja i svi ocenjivi odgovori u kvizu tačni), izveden status teme i kursa, nastavak videa od mesta prekida i čestitka na kraju kursa. | ✓                             | ✓                                  |
| FZ-7   | **Rešavanje kviza** na kraju kursa, teme ili lekcije: pitanja sa jednim ili više tačnih odgovora i slobodnim tekstom (koji se ne ocenjuje), prikaz rezultata i ponovno rešavanje.                                      | ✓                             | ✓                                  |
| FZ-8   | **Recenzije.** Ocena od jedne do pet zvezdica uz komentar, jedna po polazniku, i jedan odgovor kreatora na svaku recenziju.                                                                                            | ✓                             | ✓                                  |
| FZ-9   | **Kreiranje kursa.** Pravljenje, izmena, dupliranje i brisanje kursa, tema i lekcija uz automatsko čuvanje; status (nacrt, objavljen, arhiviran) i vidljivost (javni ili privatni); naslovna slika, video i dokumenti. | ✓                             | ✗                                  |
| FZ-10  | **Pravljenje kviza**, ručno ili iz predloga jezičkog modela, koji kreator proverava pre čuvanja.                                                                                                                       | ✓                             | ✗                                  |
| FZ-11  | **Pozivnice i polaznici.** Pozivnica za privatni kurs, vezana za adresu e-pošte ili jednokratni link, njen opoziv i prihvatanje; pregled polaznika svih kurseva kreatora.                                              | ✓                             | ✗                                  |
| FZ-12  | **Obaveštenja.** Push obaveštenja o upisu, završetku kursa, pokušaju upisa na privatni kurs, izmeni kursa i novom kursu kreatora; istorija i uključivanje kategorija po kursu.                                         | ✓, na iOS-u posle instalacije | ✗, zahteva izmenu API-ja           |
| FZ-13  | **Asistent zasnovan na VI** preko MCP-a: kreator pravi nacrte kurseva, tema, lekcija i kvizova, ali ih ne može objaviti ni obrisati; polaznik čita upisane kurseve ako je kreator to dozvolio.                         | — (MCP klijent)               | — (MCP klijent)                    |
| FZ-14  | **Pristup za VI.** Lični pristupni tokeni za MCP i stranica za saglasnost MCP klijenta (OAuth).                                                                                                                        | ✓                             | ✗; saglasnost namerno samo na webu |

Osnovni tok učenja, od kataloga do kviza i recenzije (FZ-3 do FZ-8), dostupan je na obe platforme. Najveći nedostatak nativnog klijenta su push obaveštenja, koja bi na iOS-u radila bez instalacije PWA, a zahtevaju podršku za Expo push tokene na serveru. Web klijent se instalira kao PWA, a nativni će se distribuirati preko prodavnica posle izgradnje pomoću EAS-a. Zahtevi označeni sa ✓ na nativnom klijentu prolaze proveru tipova, a ručna provera na uređajima je u toku.

## 4.3 Nefunkcionalni zahtevi

Nefunkcionalni zahtevi (tabela 4.2) grupisani su po karakteristikama kvaliteta iz standarda ISO/IEC 25010:2023 [110, 111], i to samo po onima koje su za ovaj sistem bitne.

_Tabela 4.2: Nefunkcionalni zahtevi po karakteristikama kvaliteta ISO/IEC 25010_

| Oznaka | Karakteristika         | Zahtev                                                                                                                                                                                                                                 |
| ------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFZ-1  | Fleksibilnost          | Sistem je dostupan u svakom savremenom pretraživaču, na računaru i na telefonu, i kao nativna aplikacija za iOS i Android. Web klijent se može instalirati kao progresivna web aplikacija.                                             |
| NFZ-2  | Kompatibilnost         | Svi klijenti koriste isti API i iste naloge, pa se napredak, odgovori u kvizovima i podešavanja jednog korisnika vide na svakom uređaju.                                                                                               |
| NFZ-3  | Sposobnost interakcije | Interfejs je preveden na srpski (podrazumevani jezik) i engleski, uključujući poruke o greškama i tekst obaveštenja, koji se prevodi na jezik primaoca. Podržane su svetla i tamna tema.                                               |
| NFZ-4  | Sposobnost interakcije | Web interfejs se prilagođava veličini ekrana: na računaru koristi bočni meni, a na telefonu donju navigaciju. Komponente prate obrasce pristupačnosti WAI-ARIA [95].                                                                   |
| NFZ-5  | Bezbednost             | Svaka privatna ruta API-ja proverava pristupni token. Izmena ili brisanje tuđeg kursa, teme ili lekcije odbija se statusom 403. Sadržaj lekcija i tačni odgovori u kvizu ne šalju se korisniku koji nije upisan.                       |
| NFZ-6  | Bezbednost             | Lični pristupni tokeni za MCP čuvaju se samo kao heš i važe samo za MCP rutu. Pozivi servisa Cloudflare Stream prihvataju se samo sa ispravnim potpisom. Na nativnoj platformi tokeni se čuvaju šifrovani.                             |
| NFZ-7  | Efikasnost performansi | Video snimci i fajlovi otpremaju se direktno u Cloudflare, mimo servera, a video se isporučuje adaptivnim protokolom. Liste kurseva, lekcija, recenzija i obaveštenja učitavaju se po stranicama.                                      |
| NFZ-8  | Efikasnost performansi | Generisanje kviza pomoću VI ograničeno je na 20 zahteva po korisniku dnevno, radi kontrole troškova.                                                                                                                                   |
| NFZ-9  | Pouzdanost             | Kada nema internet konekcije, web klijent prikazuje posebnu stranicu i obaveštenje, a po povratku konekcije osvežava podatke. Neuspelo slanje push poruke ne prekida radnju koja ga je pokrenula, a neaktivne pretplate se uklanjaju.  |
| NFZ-10 | Održivost              | Model podataka definiše se na jednom mestu, a tipovi, šeme za validaciju, opis API-ja i klijent za API izvode se iz njega. Promena modela ili rute koja nije usklađena sa klijentima otkriva se kao greška u tipovima pre izvršavanja. |

Sistem namerno ne podržava učenje bez internet konekcije, za razliku od platformi iz odeljka 2.1: servisni radnik kešira samo statičke resurse i stranicu za rad bez konekcije, a ne sadržaj lekcija. Automatskih testova nema, pa se NFZ-10 proverava proverom tipova, lint alatom i izgradnjom (poglavlje 12).

# 5. Projektovanje sistema

Princip koji povezuje odeljke ovog poglavlja je da se ono što ne zavisi od platforme projektuje jednom, a posebno po platformi samo ono što mora da se razlikuje.

## 5.1 Arhitektura sistema

Sistem čine tri aplikacije i zajednički paketi u jednom monorepou. Slika 5.1 prikazuje strukturu repozitorijuma; u uglastim zagradama navedene su aplikacije koje koriste dati paket, prema zavisnostima deklarisanim u fajlovima `package.json`.

_Slika 5.1: Struktura monorepoa Course Hub_

```text
course-hub/                     pnpm radni prostor + Turborepo
├── apps/
│   ├── api/                    Express 5, REST API (OpenAPI 3.1)
│   │   ├── src/modules/        17 funkcionalnih modula (kursevi, teme, lekcije, upisi,
│   │   │                       napredak, kvizovi, recenzije, pozivnice, video, dokumenti,
│   │   │                       obaveštenja, korisnici, auth, tokeni, OAuth, VI, health)
│   │   ├── src/middleware/     handleAuth, handleTokenAuth, validate, obrada grešaka
│   │   ├── src/routes/         /api (javne i privatne rute), /apix (MCP, OAuth)
│   │   └── openapi.json        specifikacija generisana iz koda
│   ├── web/                    Next.js 16, PWA (manifest, servisni radnik)
│   └── native/                 Expo SDK 57, Expo Router (iOS, Android)
│
└── packages/
    ├── db-schema/              Drizzle tabele i relacije, izvor istine      [api]
    ├── db/                     klijent baze, SQL migracije                  [api]
    ├── contract/               Zod šeme, tipovi, tipizovane greške          [api, web, native]
    ├── api-client/             Orval hook-ovi, Axios instanca sa tokenima   [web, native]
    ├── shared/                 obrada grešaka, lokalizovane poruke          [web, native]
    ├── i18n/                   prevodi (sr, en)                             [web, native]
    ├── ui-theme/               vrednosti dizajn tokena                      [web¹, native]
    ├── ui-web/                 shadcn/ui, Radix, Tailwind CSS 4             [web]
    ├── ui-native/              NativeWind, Tailwind CSS 3                   [native]
    └── typescript-config/, eslint-config/, scripts/

¹ posredno, preko ui-web
```

Slika 5.2 prikazuje tok zavisnosti i podataka između ovih delova.

_Slika 5.2: Tok podataka od šeme baze do klijenata_

```text
  db-schema ──(drizzle-zod)──▶ contract ──▶ api (validacija zahteva)
      │                            │
 (drizzle-kit)                     │
      ▼                            ▼
  SQL migracije ──▶ PostgreSQL ◀── api (upiti) ──▶ Supabase Auth
                    (Supabase)     │
                                   ▼
                             openapi.json ──(Orval)──▶ api-client
                                                           │
                                                   ┌───────┴───────┐
                                                   ▼               ▼
                                               web (PWA)     native (Expo)
```

Iz slika se vide četiri projektne odluke:

1. **Poslovna logika postoji samo na serveru.** Klijenti ne pristupaju bazi ni Supabase-u; i prijava ide preko putanja `/v1/auth/*`. Razdvajanje prezentacije, domenske logike i pristupa podacima omogućava da isti domenski sloj opslužuje više prezentacija, npr. web i mobilnu aplikaciju [112], pa pravila poput toga ko sme da vidi lekciju važe jednako za oba klijenta.
2. **Zavisnosti idu u jednom smeru.** Aplikacije zavise od paketa, nikada obrnuto. Pakete `db-schema` i `db` koristi samo server, pa klijentima stižu samo izvedene šeme iz paketa `contract`.
3. **Granica deljenja je korisnički interfejs.** Paketi za podatke, komunikaciju sa serverom i prevode zajednički su, a komponente su podeljene na `ui-web` i `ui-native`, koje dele samo vrednosti tokena (poglavlje 6).
4. **Nova aplikacija je nov korisnik istih paketa.** Administratorska aplikacija bila bi nov direktorijum u `apps/` sa zavisnostima `workspace:*` na `contract`, `api-client`, `shared`, `i18n` i `ui-web`. Rute za upravljanje korisnicima, zaštićene međuslojem `validateAdminRole`, već postoje, kao i njihovi generisani hook-ovi (`useGetUsers`, `useCreateUser`, `useDeleteUser`), pa bi se pisale samo stranice sklopljene od postojećih komponenti.

Server izlaže dve grupe putanja sa različitom autentifikacijom (odeljak 5.4): `/api` za klijente sistema, podeljene na javne (katalog, recenzije) i privatne, i `/apix` za spoljne sisteme, tj. MCP server i OAuth putanje za asistente zasnovane na VI.

## 5.2 Model podataka

Model podataka opisan je modelom entiteta i veza (eng. _Entity-Relationship_ – ER), koji je uveo Peter Chen 1976. godine [113]. Šema ima 18 tabela (slika 5.3). Primarni ključevi su tipa UUID (eng. _Universally Unique Identifier_) i generiše ih baza.

_Slika 5.3: Pojednostavljeni ER dijagram baze podataka_

```text
┌──────────────────┐       ┌───────────┐       ┌──────────────────────────┐
│ user_preferences ├─ 1:1 ─┤   users   ├─ 1:N ─┤ api_tokens               │
└──────────────────┘       └─────┬─────┘       │ push_subscriptions       │
                                 │             │ notifications            │
                                 │ 1:N         │ notification_preferences │
                                 │ (kreator)   └──────────────────────────┘
                                 │
┌────────────────────┐     ┌─────┴─────┐       ┌──────────────────────────┐
│ course_invitations ├ N:1 ┤  courses  ├───────┤ videos       0..1        │
└────────────────────┘     └─────┬─────┘       │ quizzes      0..1        │
                                 │ 1:N         │ documents    0..N        │
                           ┌─────┴─────┐       │                          │
                           │  topics   ├───────┤ roditelj je tačno        │
                           └─────┬─────┘       │ jedan od: courses,       │
                                 │ 1:N         │ topics ili lessons       │
                           ┌─────┴─────┐       │                          │
                           │  lessons  ├───────┤                          │
                           └───────────┘       └──────────────────────────┘

Vezne tabele (korisnik × sadržaj):
  course_enrollments, course_progress, course_reviews    users ↔ courses
  lesson_progress                                        users ↔ lessons
  quiz_responses                                         users ↔ quizzes
```

Atributi su izostavljeni. Vezne tabele povezuju korisnika sa jednim entitetom sadržaja i imaju jedinstven par ključeva, npr. (korisnik, kurs). Tabela 5.1 daje pravila po grupama tabela.

_Tabela 5.1: Tabele baze podataka po grupama_

| Grupa                | Tabele                                                                                         | Ključna pravila                                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Korisnici            | `users`, `user_preferences`, `api_tokens`                                                      | Veza sa Supabase Auth-om preko `auth_user_id`; lozinke i sesije čuva Supabase. Podešavanja 1:1, upisuju se u istoj transakciji kao korisnik. Od tokena za MCP čuvaju se samo heš i prefiks. |
| Sadržaj              | `courses`, `topics`, `lessons`                                                                 | Hijerarhija 1:N sa kaskadnim brisanjem; redosled u polju `position`. Kurs ima javni identifikator `public_id` za adrese, status, vidljivost i `ai_access_enabled` (FZ-13).                  |
| Materijali i kvizovi | `videos`, `documents`, `quizzes`                                                               | Pripadaju tačno jednom roditelju: kursu, temi ili lekciji. Najviše jedan video i jedan kviz po roditelju; dokumenata više.                                                                  |
| Učenje               | `course_enrollments`, `course_progress`, `lesson_progress`, `quiz_responses`, `course_reviews` | Jedinstven par (korisnik, kurs) ili (korisnik, lekcija). Odjava popunjava `withdrawn_at` umesto brisanja. Status teme i kursa izvodi se iz statusa lekcija. Ocena recenzije 1–5.            |
| Pozivnice            | `course_invitations`                                                                           | Tip (e-pošta, link), nasumični token, status i rok važenja.                                                                                                                                 |
| Obaveštenja          | `push_subscriptions`, `notifications`, `notification_preferences`                              | Web Push pretplate, istorija i podešavanja; `course_id = NULL` u podešavanjima znači „svi kursevi“.                                                                                         |

Projektne odluke:

- **Tačno jedan roditelj.** Tabele `videos`, `documents` i `quizzes` imaju tri opciona strana ključa i ograničenje `CHECK (num_nonnulls(course_id, topic_id, lesson_id) = 1)`, gde `num_nonnulls` vraća broj argumenata različitih od `NULL` [114]. Za razliku od generičkog polja „roditelj“, pravi strani ključevi omogućavaju bazi da garantuje postojanje roditelja i kaskadno brisanje.
- **Pitanja kviza u `jsonb`.** Pitanja se uvek čitaju zajedno sa kvizom, pa se čuvaju kao niz u jednoj koloni [67]; strukturu proverava Zod šema pre upisa. Odgovori polaznika (`quiz_responses`) čuvaju se bez rezultata, a rezultat se računa pri čitanju, pa ispravka tačnog odgovora važi za sve polaznike.
- **Denormalizovana ocena.** Prosečna ocena i broj recenzija čuvaju se i u tabeli `courses`, da upit nad katalogom ne bi grupisao recenzije; ponovo se računaju u transakciji pri svakom čuvanju recenzije.
- **Zabranjeno brisanje.** Veze kursa sa kreatorom i dokumenta sa autorom imaju pravilo `restrict`, da se brisanjem naloga ne bi obrisao sadržaj; ostale veze brišu se kaskadno ili postavljaju na `NULL`.

Šema je nastala i menjana kroz 15 SQL migracija koje je generisao `drizzle-kit`.

## 5.3 Slojevi serverske aplikacije

Serverska aplikacija sledi princip razdvajanja odgovornosti (eng. _Separation of Concerns_), koji je Edsger Dijkstra 1974. godine opisao kao razmatranje jednog aspekta problema nezavisno od ostalih [115]. Svaka funkcionalna oblast je modul u `apps/api/src/modules/` (17 modula) sa istim slojevima (tabela 5.2), a autentifikacija, validacija, beleženje i obrada grešaka su zajednički međuslojevi u `src/middleware/`. Poslovna pravila nalaze se samo u domenskim servisima, a ostali slojevi rade samo svoj posao: ruta povezuje putanju sa međuslojevima, kontroler prevodi HTTP zahtev u poziv servisa, a repozitorijum izvršava upit. Svaki modul se zato čita na isti način, a izmena ostaje na jednom mestu: promena upita menja repozitorijum, promena pravila servis, a promena formata greške jedan međusloj.

_Tabela 5.2: Slojevi modula serverske aplikacije_

| Sloj          | Direktorijum   | Odgovornost                                                                              |
| ------------- | -------------- | ---------------------------------------------------------------------------------------- |
| Rute          | `routes/`      | Putanja, HTTP metoda i lanac međuslojeva; validacija parametara, upita i tela Zod šemama |
| Kontroler     | `controllers/` | Čita proverene podatke iz `res.locals`, poziva servis, šalje odgovor                     |
| Servis        | `services/`    | Poslovna pravila (vlasništvo, upis, životni ciklus kursa); baca tipizovane greške        |
| Repozitorijum | `repository/`  | Samo upiti nad bazom (Drizzle ORM), sa eksplicitnim povratnim tipom                      |
| OpenAPI       | `openapi/`     | Opis putanja nad istim Zod šemama koje koriste rute                                      |

Repozitorijum prati istoimeni obrazac, koji posreduje između domenske logike i mapiranja podataka i nudi interfejs nalik kolekciji [116]. Eksplicitni povratni tip čini da promena oblika upita postane greška u tipovima u repozitorijumu, a ne u servisu.

Na primeru čuvanja recenzije (`PUT /api/v1/reviews/courses/{publicId}`) zahtev prolazi sledeće korake:

1. Zajednički međuslojevi iz `server.ts`: CORS (eng. _Cross-Origin Resource Sharing_), parsiranje JSON tela i beleženje zahteva.
2. `handleAuth` proverava pristupni token (odeljak 5.4).
3. `validate` proverava parametre putanje, a zatim telo, i proverene vrednosti upisuje u `res.locals.params` i `res.locals.body`. Kontroler nikada ne čita sirovi `req.body`.
4. Servis proverava da je kurs objavljen i da je korisnik upisan.
5. Repozitorijum u jednoj transakciji upisuje ili menja recenziju i ponovo računa prosečnu ocenu kursa.

Transakcije se koriste gde god jedna radnja menja više tabela: pri registraciji, pravljenju kursa sa temama i lekcijama preko MCP-a, čuvanju napretka i radu sa dokumentima.

Greške se obrađuju na jednom mestu. Servis baca tipizovanu grešku iz paketa `@repo/contract` (npr. `NotFoundError` sa kodom `NOT_ENROLLED`), Express 5 je prosleđuje završnom međusloju [62], a on je pretvara u JSON odgovor sa statusom greške. Nepredviđene greške baze vraćaju se sa statusom 422, ostale sa 500. Pošto su kodovi grešaka u zajedničkom paketu, klijenti ih prevode u lokalizovane poruke (poglavlje 6).

Podela nije apsolutno stroga: servis može da koristi repozitorijum drugog modula (servis recenzija čita kurs i upis iz repozitorijuma kurseva i upisa). Time se izbegavaju posredni pozivi, ali se neke provere, poput one da je kurs objavljen, ponavljaju u više servisa.

## 5.4 Autentifikacija i autorizacija

Autentifikacija koristi uobičajeni model sa pristupnim tokenom i tokenom za osvežavanje. Na zahtev `POST /v1/auth/login` server preko Supabase Auth-a izdaje kratkotrajni pristupni token (JWT) i jednokratni token za osvežavanje [69, 70]. Klijent šalje pristupni token u zaglavlju `Authorization: Bearer <token>`. Međusloj `handleAuth` primenjen je na sve privatne putanje pri priključivanju na `/api` i token proverava pozivom `supabase.auth.getUser`, koji se obraća Supabase Auth serveru [117]. MCP server koristi lične pristupne tokene (poglavlje 9).

Za višeplatformski sistem bitna je podela odgovornosti. Osvežavanje je napisano jednom, u Axios presretaču paketa `@repo/api-client` [59]: na odgovor 401 šalje token za osvežavanje na `POST /v1/auth/refresh` i ponavlja zahtev, a ako osvežavanje ne uspe, vraća korisnika na prijavu. Klijent funkcijom `configureTokenProviders` određuje samo gde se tokeni čuvaju: web u `localStorage`, a nativna aplikacija u `expo-secure-store` (iOS Keychain, Android Keystore) [91]. `localStorage` je izabran radi jednostavnosti, iako OWASP preporučuje kolačiće sa oznakom `httpOnly`, jer je `localStorage` dostupan svakom skriptu na stranici, pa i onom ubačenom napadom XSS (eng. _Cross-Site Scripting_) [118].

Autorizacija se proverava u servisima: izmene sadržaja dozvoljene su samo kreatoru kursa (u suprotnom status 403), a kviz, napredak i recenzije samo upisanom polazniku. Pošto su pravila na serveru, važe jednako za oba klijenta i za MCP.

## 5.5 Jedan izvor istine: od šeme baze do klijenata

Slika 5.4 prikazuje tok sa slike 5.2 detaljnije, na primeru recenzije kursa. Iz paketa `@repo/contract` polaze dve vrste šema: šema odgovora, izvedena iz tabele, i šema zahteva, koja opisuje šta klijent šalje.

_Slika 5.4: Put šema recenzije od tabele do klijenata_

```text
 packages/db-schema                 packages/contract
┌────────────────────┐ drizzle-zod ┌──────────────────────────────────────┐
│ courseReviews      │────────────▶│ CourseReviewSchema         (odgovor) │
│ (Drizzle tabela)   │             │ SaveCourseReviewBodySchema (zahtev)  │
└─────────┬──────────┘             └──────┬─────────────┬─────────────┬───┘
          │ drizzle-kit                   │             │             │
          ▼                               ▼             ▼             ▼
   SQL migracija                   registerPath()   validate()   zodResolver()
          │                         (apps/api)      (apps/api)   forme web i
          ▼                               │                      nativnog
     PostgreSQL                           │ generate:openapi     klijenta
                                          ▼
                                    openapi.json
                                          │ Orval
                                          ▼
                                   @repo/api-client
                                 useSaveCourseReview()
                                          │
                                ┌─────────┴─────────┐
                                ▼                   ▼
                            apps/web           apps/native
```

1. **Tabela.** `course_reviews` je definisana u `packages/db-schema/src/schemas/course-reviews.ts`, a `drizzle-kit` iz nje generiše SQL migraciju [73].
2. **Šema odgovora.** `CourseReviewSchema` se izvodi iz tabele funkcijom `createSelectSchema` biblioteke `drizzle-zod` [74] (listing 5.1): biraju se polja koja klijent sme da vidi i dodaju pravila koja tabela ne izražava, poput opsega ocene. Tipovi se dobijaju pomoću `z.infer`.
3. **Šema zahteva.** `SaveCourseReviewBodySchema` (ocena i komentar) piše se direktno u Zod-u, jer se oblik zahteva razlikuje od reda u tabeli. Ista šema se koristi na tri mesta: za validaciju u ruti (`validate`), za opis tela zahteva u specifikaciji (`registry.registerPath` [56]) i u formama oba klijenta, preko adaptera `zodResolver` za biblioteku React Hook Form [119]. Korisnik zato dobija grešku pre slanja, po istim pravilima kao na serveru, koji proveru ipak ponavlja jer ne sme da veruje klijentu.
4. **Specifikacija i klijent.** `pnpm api-client:generate` generiše `openapi.json` (trenutno 62 putanje i 82 operacije), a Orval iz njega paket `@repo/api-client` [57]. Za operaciju `saveCourseReview` nastaje hook `useSaveCourseReview`, tipizovan obema šemama.
5. **Klijenti.** Web i nativni klijent uvoze isti hook. Ako se polje u tabeli ili oblik rute promeni, posle ponovnog generisanja svako mesto koje ih koristi u oba klijenta, od tipova do šema u formama, postaje greška u tipovima (NFZ-10).

_Listing 5.1: Izvođenje šeme odgovora iz tabele (`packages/contract/src/reviews/schemas.ts`)_

```ts
export const CourseReviewSchema = createSelectSchema(courseReviews, {
  rating: z.number().int().min(1).max(5),
})
  .pick({ id: true, rating: true, comment: true, reply: true,
          repliedAt: true, createdAt: true, updatedAt: true })
  .extend({ author: CourseCreatorSchema });

export type CourseReview = z.infer<typeof CourseReviewSchema>;
```

Tok ima dva ograničenja. Migraciju i generisanje pokreće programer, a kontinuirana integracija ne proverava da li `openapi.json` odgovara kodu. Struktura pitanja kviza (`jsonb`) opisana je dvaput, kao TypeScript tip u šemi baze i kao Zod šema u ugovoru, jer `drizzle-zod` ne može iz tipa kolone da izvede pravila validacije.

## 5.6 Navigacija i korisnički interfejs po platformama

Navigacija je namerno projektovana posebno za svaku platformu, ali obe prate istu podelu: učenje (katalog i upisani kursevi), kreiranje (kursevi i lekcije), obaveštenja i profil.

**Web.** Na ekranima širim od 768 px (granica `md` u Tailwind CSS-u [120]) prikazuje se bočni meni iz shadcn/ui [94], a na užim zaglavlje i donja traka, čije grupe „Učenje“ i „Kreiranje“ otvaraju fioku (eng. _drawer_) sa dna ekrana. Tailwind polazi od mobilnog prikaza: klase bez prefiksa važe za sve širine, a klase sa `md:` od granice naviše [120], pa jedan kod opslužuje računar i telefon (NFZ-4).

**Nativni klijent.** Korenski stek Expo Router-a [88] ima grupe ekrana `(auth)` i `(app)`, koje `Stack.Protected` prikazuje prema tome da li je korisnik prijavljen; posle odjave zaštićeni ekrani se uklanjaju iz istorije navigacije [121]. Grupa `(app)` ima pet tabova (početna, učenje, kursevi, obaveštenja, profil), od kojih su poslednja tri za sada placeholderi (odeljak 4.2). Stablo lekcija prikazuje se kao `Modal` sa stilom `pageSheet`: na iOS-u kao kartica koja se zatvara prevlačenjem nadole, a na Androidu preko celog ekrana [122].

> **[Slika 5.5: Snimci ekrana istog kursa — web na računaru (bočni meni), web na telefonu (donja traka, fioka „Učenje“) i nativni klijent (tabovi, stablo lekcija kao kartica).]**

_Tabela 5.3: Navigacija po platformama_

| Element               | Web, računar                    | Web, telefon                    | Nativni klijent                        |
| --------------------- | ------------------------------- | ------------------------------- | -------------------------------------- |
| Glavna navigacija     | Bočni meni sa grupama           | Donja traka i fioka             | Donja traka sa pet tabova              |
| Stablo kursa          | Bočna traka promenljive širine  | Panel preko sadržaja            | Modalna kartica (`pageSheet` na iOS-u) |
| Kretanje kroz lekcije | Stablo i dugmad                 | Prethodna, sadržaj, sledeća     | Prethodna, sadržaj, sledeća            |
| Rutiranje             | Next.js App Router              | Next.js App Router              | Expo Router                            |
| Adresa lekcije        | `/learn/<publicId>?lesson=<id>` | `/learn/<publicId>?lesson=<id>` | `learn/<publicId>?lesson=<id>`         |
| Komponente            | `@repo/ui-web`                  | `@repo/ui-web`                  | `@repo/ui-native`                      |

Zajednički su struktura sadržaja, oblik adrese (isti link iz obaveštenja otvara istu lekciju na obe platforme, FZ-5) i ključevi prevoda iz `@repo/i18n`; razlikuju se komponente i obrasci navigacije.

# 6. Ponovna upotreba koda između platformi

Poslovna logika postoji samo na serveru (odeljak 5.1), pa je klijenti koriste bez dupliranja. Ovo poglavlje opisuje deljenje između samih klijenata: šta je zajedničko, šta mora biti posebno, koje izmene je tražila druga platforma i koliki je udeo zajedničkog koda.

## 6.1 Zajednički paketi

_Slika 6.1: Zajednički i platformski delovi klijenata_

```text
        ┌──────────────── zajedničko za oba klijenta ────────────────┐
        │ @repo/contract     Zod šeme, tipovi, kodovi grešaka        │
        │ @repo/api-client   generisani hook-ovi, Axios, osvežavanje │
        │ @repo/shared       greške → prevedene poruke, Zod poruke   │
        │ @repo/i18n         prevodi (sr, en), isti ključevi         │
        │ @repo/ui-theme     vrednosti dizajn tokena                 │
        └───────────┬───────────────────────────────────────┬────────┘
                    ▼                                       ▼
  ┌────────────── web ───────────────┐    ┌──────── nativni klijent ─────────┐
  │ @repo/ui-web (shadcn/ui, Radix)  │    │ @repo/ui-native (NativeWind)     │
  │ Next.js App Router               │    │ Expo Router                      │
  │ localStorage, <video>            │    │ expo-secure-store, expo-video    │
  │ vibrate(), canvas-confetti       │    │ expo-haptics, Reanimated         │
  └──────────────────────────────────┘    └──────────────────────────────────┘
```

Zajednički paketi pokrivaju sve što ne zavisi od načina iscrtavanja. Ekranu podatke daje generisani hook iz `@repo/api-client`, formu validira šema iz `@repo/contract`, grešku sa servera u prevedenu poruku pretvara `@repo/shared` (`useErrorHandlingForm`, `useErrorHandlingQuery`, `useErrorHandlingAction`), a tekst daje ključ iz `@repo/i18n`, sa posebnim ulaznim tačkama za web i nativni klijent. Na klijentu ostaje raspored komponenti.

Komponente nisu zajedničke, ali imaju zajednički oblik. Od 31 komponente u `@repo/ui-web` i 27 u `@repo/ui-native`, 23 imaju isto ime (npr. `button`, `dialog`, `select`, `questionnaire`), a NativeWind preset iz `@repo/ui-theme` pretvara tokene u iste Tailwind klase (`bg-primary`, `text-muted-foreground`) [96]. Stranica se zato na obe platforme sklapa od istih gradivnih elemenata i gotovo istog JSX-a, iako su implementacije različite: na webu shadcn/ui i Radix [94, 95], a na nativnoj strani biblioteke `@rn-primitives/*`.

## 6.2 Kod specifičan za platformu

Tabela 6.1 prikazuje mesta na kojima web API ne postoji u React Native okruženju, pa je zamenjen nativnim modulom.

_Tabela 6.1: Zamena web API-ja na nativnoj platformi_

| Namena                                     | Web klijent                                           | Nativni klijent                                                  |
| ------------------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------- |
| Čuvanje tokena                             | `localStorage`                                        | `expo-secure-store` [91]                                         |
| Video lekcije (HLS sa Cloudflare Stream-a) | element `<video>`                                     | `expo-video` [92]                                                |
| Haptička povratna informacija              | `navigator.vibrate` [41]; na iOS-u zaobilazno rešenje | `expo-haptics` (haptički sistem iOS-a, vibracija Androida) [123] |
| Konfete pri završetku kursa                | `canvas-confetti`                                     | sopstvena komponenta na biblioteci Reanimated [124]              |
| Otvaranje dokumenta                        | link sa `target="_blank"`                             | `expo-web-browser` (`openBrowserAsync`) [125]                    |
| Rutiranje                                  | Next.js App Router                                    | Expo Router [88]                                                 |
| Push obaveštenja                           | Web Push (VAPID)                                      | nije implementirano; zahteva Expo push tokene na serveru         |

Zamene čuvaju ponašanje, a ne samo funkciju: nativne konfete primaju iste opcije i boje kao `canvas-confetti`, nativni plejer je podešen da poziciju javlja jednom u sekundi, a web koristi događaj `timeupdate`, pa se pozicija u snimku čuva po istom pravilu, a haptika je na obe platforme duža pri tačnom kvizu i kratka inače.

## 6.3 Izmene zbog druge platforme

Zajednički paketi su prvobitno pisani za web. Paket `@repo/api-client` već je bio nezavisan od platforme, jer čuvanje tokena prepušta aplikaciji preko funkcije `configureTokenProviders` (odeljak 5.4). Uvođenje nativnog klijenta zahtevalo je tri izmene:

1. **Promenljive okruženja.** Next.js u klijentski kod ugrađuje samo promenljive sa prefiksom `NEXT_PUBLIC_` i samo pri statičkom pristupu `process.env.X` [126], a Expo samo promenljive sa prefiksom `EXPO_PUBLIC_`, takođe pri statičkom pristupu [127]. Fajl `packages/api-client/src/env.ts` zato čita adresu API-ja kao `process.env.NEXT_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_API_URL`, pa oba alata za pakovanje mogu da ugrade vrednost.
2. **Jedna kopija React Query-ja.** `@repo/api-client` ponovo izvozi `useQueryClient` i `useInfiniteQuery`, a aplikacije ih uvoze odatle. Druga kopija biblioteke u aplikaciji ne bi videla `QueryClient` koji postavlja `ApiClientProvider` i bacila bi grešku „No QueryClient set“.
3. **Jedna verzija nativnih zavisnosti.** Expo navodi da dve verzije React-a u jednoj aplikaciji izazivaju greške pri izvršavanju i da nativni moduli ne smeju biti duplirani [128]. Zato su `react`, `react-dom`, `react-native-safe-area-context` i `react-native-svg` fiksirani u `overrides` fajla `pnpm-workspace.yaml`, instalacija je ravna (`nodeLinker: hoisted`, odeljak 3.8.1), a `metro.config.js` paket `@react-navigation/native` razrešava iz `expo-router`, da ne bi nastala druga kopija.

Deljenje ima i cenu. Vrednosti tokena postoje dvaput, u `src/native/tokens.ts` i `src/web/index.css` paketa `@repo/ui-theme`, i usklađuju se ručno, jer NativeWind 4 zahteva Tailwind CSS 3, a web koristi Tailwind CSS 4 (odeljak 3.7.3). Izmena zajedničkog paketa mora se proveriti na oba klijenta, a automatskih testova nema (poglavlje 12).

## 6.4 Udeo zajedničkog koda

Udeo je izmeren alatom `cloc` (verzija 2.06) nad stanjem repozitorijuma u komitu `7a5a806`. Meri se broj linija koda bez praznih redova i komentara. Postupak ima četiri koraka:

1. **Šta se broji.** Uračunati su samo fajlovi napisani u jezicima TypeScript (`.ts`, `.tsx`) i CSS, jer u njima je sav kod aplikacije. Izostavljeni su JSON fajlovi (`package.json`, `tsconfig.json`, generisani `openapi.json`), JavaScript fajlovi (konfiguracije alata i servisni radnik `sw.js`, 75 linija), konfiguracioni fajlovi `*.config.*`, deklaracije tipova `*.d.ts`, kao i direktorijumi sa zavisnostima i izlazom izgradnje (`node_modules`, `dist`, `.next`, `.expo`, `.turbo`, `ios`, `android`, `build`).
2. **Merenje po paketu.** Za svaki paket i aplikaciju pokrenuta je ista komanda (slika 6.2), a iz rezultata je uzet zbir kolone `code`. Generisani deo paketa `@repo/api-client` izmeren je posebno, nad direktorijumom `src/generated`, a ručno pisan deo je razlika do ukupnog broja za paket.
3. **Razvrstavanje.** Paketi koje koriste oba klijenta (`@repo/contract`, `@repo/i18n`, `@repo/shared`, `@repo/ui-theme`, `@repo/api-client`) svrstani su u zajednički kod. Aplikacija i njena biblioteka komponenti čine kod specifičan za platformu: `apps/web` i `@repo/ui-web` za web, a `apps/native` i `@repo/ui-native` za nativni klijent. Serverski kod je prikazan radi poređenja, ali ne ulazi u udeo, jer ga klijenti ne uključuju, već ga pozivaju preko API-ja.
4. **Udeo.** Za svaki klijent udeo zajedničkog koda je _Z_ / (_Z_ + _K_), gde je _Z_ ukupan zajednički kod, a _K_ kod specifičan za taj klijent. Generisani kod je uračunat u _Z_, jer ga klijenti koriste kao i ručno pisan kod.

_Slika 6.2: Komanda za merenje jednog paketa_

```text
cloc --quiet --include-lang=TypeScript,CSS \
     --exclude-dir=node_modules,dist,.next,.expo,.turbo,ios,android,build \
     --not-match-f='\.config\.|\.d\.ts$' <putanja paketa>
```

Rezultati su u tabeli 6.2.

_Tabela 6.2: Linije koda po delovima sistema_

| Deo                                                    | Linije koda |
| ------------------------------------------------------ | ----------: |
| `@repo/contract`                                       |       1 350 |
| `@repo/i18n` (prevodi 1 952, kod 76)                   |       2 028 |
| `@repo/shared`                                         |         472 |
| `@repo/ui-theme`                                       |         251 |
| `@repo/api-client`, ručno pisan                        |          96 |
| **Zajedničko, bez generisanog koda**                   |   **4 197** |
| `@repo/api-client`, generisan (Orval)                  |      10 610 |
| **Zajedničko, ukupno**                                 |  **14 807** |
| Web: `apps/web` 11 732 + `@repo/ui-web` 3 259          |      14 991 |
| Server: `apps/api` 8 552 + `@repo/db-schema` 662       |       9 214 |
| Nativni: `apps/native` 3 920 + `@repo/ui-native` 2 300 |       6 220 |

Uvrštavanjem vrednosti iz tabele 6.2 u formulu iz koraka 4 dobija se:

- **Web klijent:** 14 807 / (14 807 + 14 991) = 14 807 / 29 798 = 49,7% zajedničkog koda, a ostalih 50,3% je specifično za web platformu.
- **Nativni klijent:** 14 807 / (14 807 + 6 220) = 14 807 / 21 027 = 70,4% zajedničkog koda, a ostalih 29,6% je specifično za nativnu platformu.

Brojke treba tumačiti uz tri ograde:

1. **Klijenti nemaju isti obim.** Web klijent sadrži i deo za kreatora, a nativni samo deo za polaznika (odeljak 4.2). Udeo kod nativnog klijenta zato bolje opisuje deo aplikacije koji postoji na obe platforme.
2. **Nativni klijent ne koristi sav zajednički kod.** Generisani hook-ovi pokrivaju svih 82 operacije API-ja, a prevodi i ekrane koji postoje samo na webu, pa je 70,4% gornja granica udela koji nativni klijent zaista koristi.
3. **Većina zajedničkog koda je generisana.** Od 14 807 zajedničkih linija 10 610 generiše Orval, a ručno je pisano 4 197. Ušteda u pisanju koda je zato manja od udela, ali ni generisani kod ne mora da se piše ni održava posebno za svaku platformu.

Nativni klijent nije morao ponovo da implementira nijedan poziv API-ja, šemu validacije, poruku o grešci ni prevod: njegovih 6 220 linija čine ekrani, komponente i zamene iz tabele 6.1.

# 7. Implementacija serverske strane i web aplikacije

Ovo poglavlje opisuje kako su funkcionalni zahtevi ostvareni na serveru i u web klijentu; VI je opisana u poglavlju 9.

## 7.1 Kursevi, teme i lekcije

Kurs, tema i lekcija imaju iste operacije (`POST`, `GET`, `PUT`, `DELETE` na `/v1/courses`, `/v1/topics` i `/v1/lessons`), a izmene dozvoljava samo kreator kursa (FZ-9). Web editor (`/courses/add` i `/courses/<publicId>/edit`) ima dva dela: levo je stablo kursa, u kome se redosled tema i lekcija menja prevlačenjem (biblioteka `@dnd-kit`), a desno forma za izabrani element.

Ponašanje editora određuju četiri pravila:

1. **Automatsko čuvanje.** Forma čuva polje pri gubitku fokusa, ako je polje izmenjeno i ako je automatsko čuvanje uključeno; prekidač je u zaglavlju editora i podrazumevano je uključen.
2. **Pražnjenje pre radnje.** Pre ručnog čuvanja i pre objave forma se prazni (`flush`), pa nijedna izmena ne ostaje nesačuvana.
3. **Kurs nastaje pri prvom čuvanju.** Nov kurs se upisuje u bazu tek pri prvoj izmeni (`ensureCourseId`), pa napušten prazan editor ne ostavlja red u bazi.
4. **Dupliranje kopira samo element.** Kopija kursa, teme ili lekcije dobija naziv i opis originala, ali ne i podređene elemente ni materijale.

Promena statusa iz nacrta u objavljen upisuje `published_at` i šalje obaveštenje polaznicima kreatora; svaka sledeća izmena objavljenog kursa šalje obaveštenje upisanim polaznicima (odeljak 7.6).

## 7.2 Multimedija

Video snimci i dokumenti otpremaju se direktno u Cloudflare, mimo servera (NFZ-7): server izdaje jednokratnu adresu za otpremanje [77] i vodi status fajla (slika 7.1).

_Slika 7.1: Otpremanje video snimka_

```text
Web klijent                  API                      Cloudflare Stream
  │                           │                               │
  │─ 1. POST /videos/uploads ▶│                               │
  │                           │─ 2. directUpload.create ─────▶│
  │                           │◀ uid, uploadURL ──────────────│
  │                           │ 3. videos: uploading          │
  │◀ id, uploadUrl ───────────│                               │
  │─ 4. otpremanje fajla direktno ───────────────────────────▶│
  │─ 5. POST .../complete ───▶│                               │
  │                           │ videos: processing            │
  │                           │◀ 6. webhook, HMAC ────────────│
  │                           │ videos: ready | error         │
```

Ako roditelj već ima video, server na prvi zahtev odgovara statusom 409. Dok traje obrada, čitanje videa vraća i procenat obrade sa Cloudflare-a, a webhook se prihvata samo sa ispravnim HMAC potpisom nad izvornim telom zahteva [78].

Za reprodukciju server vraća adresu HLS manifesta (`.../manifest/video.m3u8`). Dokumenti prate isti obrazac, uz skladište R2: server izdaje potpisanu adresu za otpremanje koja važi 15 minuta [80], ključ objekta je `<korisnik>/course-content/<tip>/<id>/<UUID>`, a roditelj može imati najviše 20 dokumenata. Pri završetku otpremanja server čita metapodatke objekta iz R2 i dokument označava kao spreman samo ako se veličina i tip sadržaja poklapaju sa prijavljenim.

## 7.3 Upis, pozivnice i privatni kursevi

Na javni objavljen kurs polaznik se upisuje jednim zahtevom, a kreator dobija obaveštenje (FZ-4). Ponovni upis posle odjave ponovo aktivira postojeći red u `course_enrollments`. Pokušaj upisa na privatni kurs odbija se statusom 409 (`COURSE_PRIVATE`), a kreator dobija obaveštenje o pokušaju.

Na privatni kurs upisuje se samo preko pozivnice (FZ-11). Pozivnicu pravi kreator, samo za privatni kurs, u jednom od dva oblika:

- **vezana za e-poštu:** prihvatiti je može samo nalog sa tom adresom (u suprotnom 403, `EMAIL_MISMATCH`);
- **link:** prihvatiti je može bilo koji prijavljen korisnik.

Obe vrste nose nasumični token od 48 heksadecimalnih znakova, važe 7 dana i mogu se iskoristiti jednom; kreator ih može opozvati dok nisu prihvaćene. Sistem ne šalje e-poštu: web klijent link pozivnice kopira u međuspremnik, a kreator ga sam prosleđuje. Stranica `/invite/<token>` je javna, pa posetilac pre prijave vidi o kom kursu je reč; prihvatanje upisuje polaznika i označava pozivnicu kao prihvaćenu.

## 7.4 Praćenje napretka

Napredak se čuva po lekciji, a status teme i kursa izvodi se pri čitanju (FZ-6):

- tema ili kurs je **završen** ako su sve njegove lekcije završene;
- **nije započet** ako nijedna lekcija nije započeta;
- inače je **u toku**.

Lekcija postaje završena automatski kada je ispunjen uslov za oba dela sadržaja: video (ako postoji) je odgledan do kraja, a u kvizu (ako postoji) su svi ocenjivi odgovori tačni. Status se ponovo izračunava pri svakom čuvanju ili brisanju odgovora na kviz, pa brisanje odgovora vraća lekciju u status „u toku“. Polaznik status lekcije može postaviti i ručno.

Web klijent poziciju u snimku čuva najviše jednom u 10 sekundi, kao i pri pauzi i napuštanju lekcije, a pri sledećem otvaranju nastavlja od nje (FZ-6). Kada se završi poslednja lekcija, kreator dobija obaveštenje, a polaznik vidi čestitku sa konfetama i ponudu da oceni kurs.

## 7.5 Kvizovi i recenzije

Kviz može pripadati kursu, temi ili lekciji i ima pitanja tri vrste: jedan tačan odgovor, više tačnih odgovora i slobodan tekst (FZ-7, FZ-10). Kreator kviz pravi u formi sa pitanjima koja se mogu prevlačiti, ručno ili iz predloga jezičkog modela. Polaznik dobija kviz preko javne putanje iz koje su uklonjene oznake tačnih odgovora, pa tačni odgovori ne stižu do klijenta pre predaje (NFZ-5). Posle predaje server čuva odgovore, ocenjuje ih funkcijom `scoreQuiz` prema trenutnim pitanjima i vraća rezultat; odgovori na pitanja sa slobodnim tekstom se čuvaju, ali se ne ocenjuju.

Recenzije su opisane u odeljcima 5.2 i 5.3: polaznik ima jednu recenziju po kursu (ocena 1–5 i komentar), kreator jedan odgovor na nju, a prosečna ocena kursa ponovo se računa u istoj transakciji.

## 7.6 Obaveštenja

Obaveštenja rade po principu uključivanja (eng. _opt-in_): šalju se samo korisnicima koji su za datu kategoriju uključili obaveštenja, za jedan kurs ili za sve. Web klijent nudi uključivanje u trenutku kada je obaveštenje korisno, na primer posle upisa ili objave kursa; tek tada traži dozvolu pretraživača i registruje pretplatu (`pushManager.subscribe`). Tabela 7.1 prikazuje kategorije.

_Tabela 7.1: Kategorije obaveštenja_

| Kategorija               | Događaj                         | Primalac                     |
| ------------------------ | ------------------------------- | ---------------------------- |
| `course_enrolled`        | Upis polaznika; završetak kursa | Kreator                      |
| `private_course_attempt` | Pokušaj upisa na privatni kurs  | Kreator                      |
| `course_updated`         | Izmena objavljenog kursa        | Upisani polaznici            |
| `creator_new_course`     | Objava novog kursa              | Polaznici kursa tog kreatora |

Slanje se odvija u tri koraka:

1. Server pronalazi primaoce i za svakog upisuje red u istoriju (`notifications`), čak i ako nema pretplatu.
2. Tekst se prevodi na jezik primaoca iz njegovih podešavanja, a ne na jezik korisnika koji je izazvao događaj.
3. Poruka se šalje na sve pretplate primaoca bibliotekom `web-push`. Pretplata za koju servis za isporuku vrati status 404, kojim RFC 8030 označava isteklu pretplatu [48], ili 410, briše se.

Slanje se ne čeka (eng. _fire-and-forget_): greška pri slanju ne prekida upis, objavu ili drugu radnju koja ga je pokrenula (NFZ-9). Servisni radnik prikazuje poruku, a klik na nju otvara adresu iz poruke u postojećem ili novom prozoru aplikacije. Istorija obaveštenja je stranica `/notifications`, sa brojem nepročitanih u navigaciji (FZ-12).

## 7.7 Lokalizacija i teme

Jezik nije deo adrese (`localeInPath: false`): proxy iz fajla `proxy.ts` (odeljak 3.4.2) određuje jezik iz kolačića, pa ista adresa radi na oba jezika. Prevodi su u `@repo/i18n`, a podrazumevani jezik je srpski. Tema (svetla, tamna ili sistemska) primenjuje se bibliotekom `next-themes`. Jezik i tema čuvaju se i na serveru (`user_preferences`) i primenjuju se posle prijave, pa korisnik ima ista podešavanja na svakom uređaju (FZ-2).

## 7.8 PWA

Web klijent ispunjava uslove za instalaciju iz odeljka 3.5: manifest (`app/manifest.ts`) ima naziv, prikaz `standalone` i ikone 192 i 512 piksela, uključujući varijante za maske (eng. _maskable_). Servisni radnik (`public/sw.js`) ima tri uloge:

- pri instalaciji kešira stranicu `offline.html` i ikone, a pri aktivaciji briše keš starih verzija;
- za zahtev za stranicom koji ne uspe zbog mreže vraća `offline.html`; ostali zahtevi idu direktno na mrežu, pa se sadržaj lekcija ne kešira (odeljak 4.3);
- prima push poruke i obrađuje klik na obaveštenje.

U samoj aplikaciji komponenta `NetworkProvider` prati događaje `offline` i `online`: pri gubitku veze prikazuje obaveštenje, a po povratku osvežava podatke stranice. Prilagođavanje veličini ekrana opisano je u odeljku 5.6, a haptička povratna informacija u odeljku 6.2.

> **[Slika 7.2: Snimci ekrana web klijenta — editor kursa sa stablom i automatskim čuvanjem, kviz posle predaje i istorija obaveštenja.]**

# 8. Implementacija nativne aplikacije

Ovo poglavlje opisuje kako nativni klijent (`apps/native`) ostvaruje deo za polaznika iz tabele 4.1. Zamene web API-ja opisane su u odeljku 6.2, a navigacija u odeljku 5.6.

## 8.1 Integracija u monorepo

Nativni klijent koristi pet zajedničkih paketa sa slike 6.1 (prevode preko ulazne tačke `@repo/i18n/native`, a tokene iz `@repo/ui-theme` kao Tailwind preset) i biblioteku komponenti `@repo/ui-native`, nativni par paketa `@repo/ui-web`. Struktura aplikacije prikazana je na slici 8.1.

_Slika 8.1: Struktura nativnog klijenta_

```text
apps/native/
├─ app.json               naziv, šema coursehub, Expo dodaci
├─ metro.config.js        Metro + NativeWind
├─ tailwind.config.js     preset iz @repo/ui-theme
└─ src/
   ├─ app/                ekrani; putanja fajla = ruta (Expo Router)
   │  ├─ _layout.tsx      provajderi, Stack.Protected
   │  ├─ (auth)/          login, signup
   │  └─ (app)/           (tabs)/ i learn/[publicId]/ (detalji kursa, recenzije)
   ├─ modules/            auth, learn, learn-course, reviews
   ├─ components/         komponente koje koristi više modula
   ├─ providers/          AuthProvider, PreferencesSync
   └─ hooks/, utils/      useInfiniteList, čuvanje tokena…
          │
          ▼ workspace:*
packages/  contract · api-client · shared · i18n · ui-theme · ui-native
```

Ekrani u `src/app/` su tanki: sastavljaju komponente i hook-ove iz `src/modules/`, a podatke dobijaju iz `@repo/api-client`. Zavisnosti `workspace:*` pokazuju na izvorni kod paketa, pa izmena paketa odmah važi u aplikaciji. Izmene koje je zahtevalo deljenje paketa (`overrides`, razrešavanje u Metro-u) opisane su u odeljku 6.3.

## 8.2 Prijava i autorizacija

Tok prijave i autorizovanog zahteva prikazan je na slici 8.2.

_Slika 8.2: Prijava i autorizovan zahtev u nativnom klijentu_

```text
Pokretanje ── ekran za pokretanje ── loadAuthTokens() iz SecureStore
                                          │
                       tokeni postoje? ───┴─── ne ──▶ (auth): prijava
                              │ da                        │
                              ▼                           │ POST /v1/auth/login
                       (app): tabovi ◀── saveAuthTokens ◀─┘ (tokeni + podešavanja)
                              │
       zahtev ── presretač: Authorization: Bearer <pristupni token>
                              │
                 401? ── da ──▶ refreshTokens() ── POST /v1/auth/refresh
                  │                  │ uspeh: novi tokeni → ponovljen zahtev
                  ne                 │ neuspeh: signOut() → (auth)
                  ▼
               odgovor
```

Ekran za pokretanje ostaje vidljiv dok se tokeni ne učitaju [129], pa se ekran za prijavu ne pojavljuje na trenutak kod već prijavljenog korisnika. Presretač i ponavljanje zahteva nalaze se u `@repo/api-client` i isti su za oba klijenta. Aplikacija preko `configureTokenProviders` određuje samo odakle se čita token, kako se osvežava i šta se dešava pri neuspehu (listing 8.1).

_Listing 8.1: Povezivanje nativnog čuvanja tokena sa zajedničkim API klijentom (`src/providers/auth-provider.tsx`)_

```tsx
const signOut = useCallback(async () => {
  await clearAuthTokens(); // briše tokene iz SecureStore-a
  queryClient.clear(); // podaci prethodnog korisnika ne ostaju u kešu
  applyPreferences({ language: deviceLocale, theme: "system" });
  setStatus("signedOut");
}, [queryClient, applyPreferences]);

useEffect(() => {
  configureTokenProviders({
    getToken: async () => getAccessToken(), // kopija u memoriji, ne Keychain pri svakom zahtevu
    onRefresh: refreshTokens, // jedno osvežavanje za sve istovremene odgovore 401
    onUnauthorized: () => void signOut(),
  });
}, [signOut]);
```

Iz zajedničkog koda dolaze `configureTokenProviders`, presretač i generisana funkcija `authRefreshToken`, kao i Zod šema i obrada grešaka u formi za prijavu. Specifično za nativni klijent je skladište `expo-secure-store` (iOS Keychain, Android Keystore) [91]. Tu je i funkcija `refreshTokens`, koja svim istovremenim pozivaocima vraća isto obećanje (eng. _promise_), pa se jednokratni token za osvežavanje (odeljak 5.4) šalje samo jednom.

## 8.3 Katalog i beskonačna lista

Katalog i lista upisanih kurseva prikazuju se kao beskonačna lista, jer je na telefonu pomeranje osnovni način kretanja, a dugmad za stranice su sitne mete. Upit vraća po 10 kurseva, pa se preko mobilne mreže prenosi samo ono što korisnik pregleda, a `FlatList` iscrtava stavke postepeno da bi ograničio potrošnju memorije [131].

Orval generiše samo hook-ove za `useQuery`, pa je beskonačna lista napisana jednom, u hook-u `useInfiniteList` (listing 8.2).

_Listing 8.2: Beskonačna lista nad generisanim API funkcijama (`src/hooks/use-infinite-list.ts`, `src/modules/learn/components/explore-course-list.tsx`)_

```tsx
export function useInfiniteList<T>({ queryKey, fetchPage }: UseInfiniteListArgs<T>) {
  const query = useInfiniteQuery({
    queryKey: [...queryKey, "infinite"], // ne deli keš sa običnim useQuery iste putanje
    queryFn: ({ pageParam, signal }) => fetchPage(pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: ({ pagination }) =>
      (pagination.page + 1) * pagination.limit < pagination.total ? pagination.page + 1 : undefined,
  });
  return { ...query, items: query.data?.pages.flatMap((page) => page.data) ?? [] };
}

// Upotreba: katalog objavljenih kurseva na koje korisnik nije upisan
const list = useInfiniteList({
  queryKey: getGetCoursesQueryKey(params),
  fetchPage: (page, signal) => getCourses({ ...params, page }, undefined, signal),
});
```

Vrednost `undefined` iz `getNextPageParam` znači da stranica više nema [130]. Komponenta `CourseList` traži sledeću stranicu kada kraj sadržaja bude na polovini visine liste (`onEndReachedThreshold={0.5}`) [131]. Pretraga se šalje 300 ms posle poslednjeg unetog znaka, a povlačenje nadole osvežava listu. Isti hook koriste i lista upisanih kurseva i recenzije.

Funkcija `getCourses`, ključ `getGetCoursesQueryKey` i `useInfiniteQuery` dolaze iz `@repo/api-client`, a oblik odgovora sa `pagination` iz `@repo/contract`. Specifični za nativni klijent su `FlatList` i sam hook `useInfiniteList`, jer web koristi mrežu sa stranicama.

## 8.4 Detalji kursa

Stranica `learn/[publicId]` prikazuje detalje kursa: polaznik bira temu ili lekciju iz stabla i dobija njen sadržaj, odnosno opis, video, dokumente, kviz i status napretka. Neupisani korisnik vidi samo javni pregled kursa i dugme za upis.

Izabrani element čuva se u parametrima adrese, kao na webu (tabela 5.3), pa link `coursehub://learn/<publicId>?lesson=<id>` otvara lekciju direktno [132] (listing 8.3).

_Listing 8.3: Izbor lekcije u parametrima adrese (`src/modules/learn-course/hooks/use-selection-param.ts`)_

```tsx
export function useSelectionParam(): [Selection, (selection: Selection) => void] {
  const { lesson, topic } = useLocalSearchParams<{ lesson?: string; topic?: string }>();

  const selection = useMemo<Selection>(() => {
    if (lesson) {
      return { type: "lesson", id: lesson };
    }
    if (topic) {
      return { type: "topic", id: topic };
    }
    return { type: "course" };
  }, [lesson, topic]);

  function setSelection(next: Selection) {
    // setParams ne dodaje unos u istoriju, pa „nazad“ napušta detalje kursa
    router.setParams({
      lesson: next.type === "lesson" ? next.id : undefined,
      topic: next.type === "topic" ? next.id : undefined,
    });
  }

  return [selection, setSelection];
}
```

Kada se kurs otvori bez parametra, stranica nastavlja od poslednje aktivne lekcije (`lastLessonId` iz napretka), osim ako je kurs završen. Hook `useLearnCourse` bira izvor stabla prema statusu upisa: javne putanje (`/v1/public/courses/<publicId>/topics` i `/lessons`) za neupisanog korisnika, a pun sadržaj za upisanog polaznika. Svojstvo `enabled` uključuje samo jedan par upita, pa se posle upisa sadržaj učitava bez ponovnog otvaranja ekrana.

Hook-ovi za kurs, stablo, upis i napredak dolaze iz `@repo/api-client`, a tekstovi iz `@repo/i18n`, sa istim ključevima kao na webu. Specifični za nativni klijent su Expo Router (`useLocalSearchParams`, `router.setParams`) i prikaz stabla u modalnoj kartici (odeljak 5.6).

## 8.5 Video, napredak, kvizovi i recenzije

Video lekcija reprodukuje se komponentom `VideoView` iz `expo-video` [92], a napredak se čuva po pravilima iz odeljka 7.4. Tabela 8.1 prikazuje kako se događaji plejera prevode u zahteve.

_Tabela 8.1: Događaji plejera i čuvanje napretka_

| Događaj `expo-video` [92]    | Radnja                                                             |
| ---------------------------- | ------------------------------------------------------------------ |
| `sourceLoad`                 | skok na sačuvanu poziciju, ako je manja od trajanja za više od 1 s |
| `playingChange` (početak)    | status lekcije `in_progress`, ako je bila `todo`                   |
| `playingChange` (pauza)      | čuvanje pozicije                                                   |
| `timeUpdate` (svake sekunde) | pamćenje pozicije; čuvanje ako je od prethodnog prošlo bar 10 s    |
| `playToEnd`                  | `videoWatched: true`, pozicija 0; server izvodi status lekcije     |
| napuštanje lekcije           | čuvanje poslednje zapamćene pozicije                               |

_Listing 8.4: Praćenje pozicije u snimku (`src/modules/learn-course/components/lesson-video-player.tsx`, `hooks/use-lesson-progress.ts`)_

```tsx
const player = useVideoPlayer(playbackUrl, (videoPlayer) => {
  videoPlayer.timeUpdateEventInterval = 1; // podrazumevano 0: timeUpdate se ne emituje
});

useEventListener(player, "timeUpdate", ({ currentTime }) => {
  pendingRef.current = { lessonId, seconds: Math.floor(currentTime) };
  if (Date.now() - lastSavedAtRef.current >= LESSON_VIDEO_SAVE_INTERVAL) {
    flushPosition(); // PUT /v1/progress/lessons/<id>, najviše jednom u 10 s
  }
});

useEventListener(player, "playToEnd", () => {
  pendingRef.current = null;
  onSave(lessonId, { videoWatched: true, progressSeconds: 0 });
});
```

Plejer se oslobađa pri uklanjanju komponente [92], pa se pozicija pri napuštanju lekcije uzima iz poslednjeg događaja `timeUpdate`, a ne iz plejera. Mutacija `useUpdateLessonProgress`, ključ keša napretka i pravila o statusu (na serveru) zajednički su za oba klijenta. Plejer i njegovi događaji su specifični za nativni klijent, dok web isto ponašanje ostvaruje događajem `timeupdate` elementa `<video>`.

Kviz koristi javnu putanju bez tačnih odgovora (odeljak 7.5) i komponentu `questionnaire` iz `@repo/ui-native`. Posle predaje sa svim tačnim odgovorima prikazuju se konfete i pokreće haptika `Success`, a inače kratka haptika `Light` (tabela 6.1). Recenzije su ekran `learn/[publicId]/reviews` sa beskonačnom listom iz odeljka 8.3, dijalogom za ocenu i odgovorom kreatora. Dijalog se podiže iznad tastature za njenu visinu, koju na iOS-u javlja događaj `keyboardWillShow`, a na Androidu `keyboardDidShow`, jer Android nema događaje `keyboardWill*`.

## 8.6 Sinhronizacija podešavanja

Jezik i tema prate korisnika sa servera, pa nativni klijent posle prijave izgleda isto kao web (FZ-2). Pri pokretanju jezik se postavlja prema uređaju: `expo-localization` vraća jezike redom iz podešavanja uređaja [133], a uzima se prvi koji aplikacija podržava, inače srpski. Posle prijave komponenta `PreferencesSync` dohvata sačuvana podešavanja (`GET /v1/users/preferences`) i primenjuje ih (listing 8.5).

_Listing 8.5: Primena jezika i teme (`src/hooks/use-apply-preferences.ts`)_

```tsx
export function useApplyPreferences() {
  const { i18n } = useTranslation(); // @repo/i18n/native
  const { setColorScheme } = useColorScheme(); // NativeWind; "system" prati uređaj

  return useCallback(
    ({ language, theme }: Preferences) => {
      setColorScheme(theme);
      if (i18n.language !== language) {
        void i18n.changeLanguage(language);
      }
    },
    [i18n, setColorScheme]
  );
}
```

Isti hook se poziva pri prijavi, sa podešavanjima iz odgovora na `POST /v1/auth/login`, i pri odjavi, sa jezikom uređaja i sistemskom temom (listing 8.1). Prevodi i hook `useGetUserPreferences` dolaze iz zajedničkih paketa, a `expo-localization` i `setColorScheme` iz NativeWind-a su specifični za nativni klijent. Podešavanja se na nativnoj strani za sada samo čitaju, jer je ekran profila placeholder (tabela 4.1).

> **[Slika 8.3: Snimci ekrana nativnog klijenta na iOS-u i Androidu — katalog sa pretragom, detalji kursa sa stablom lekcija u kartici, video lekcija i kviz posle predaje.]**

# 9. Integracija veštačke inteligencije

VI u sistemu Course Hub pomaže u tri radnje: pisanju kursa, istraživanju teme i učenju. Ni u jednoj ne odlučuje sama. Jezički modeli mogu da pomognu u pravljenju obrazovnog sadržaja, ali njihov izlaz može biti netačan ili pristrasan, pa literatura traži ljudski nadzor i proveru činjenica [134]. Zato u sistemu važi pravilo „VI predlaže, čovek proverava i odlučuje“: ništa što VI napravi ne stiže do polaznika dok to ne pregleda i ne sačuva kreator.

## 9.1 Uloge VI

_Tabela 9.1: Namene VI i uloga čoveka_

| Namena       | Korisnik          | Šta VI radi                                                                                  | Šta proverava čovek                                                          |
| ------------ | ----------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Pisanje      | Kreator           | Predlaže pitanja za kviz; pravi nacrt kursa sa temama i lekcijama.                           | Kreator menja i čuva kviz, a kurs objavljuje sam.                            |
| Istraživanje | Kreator, polaznik | Proširuje kurs, temu ili lekciju objašnjenjima i izvorima; predlaže izmene postojećeg kursa. | Korisnik proverava izvore; predložene izmene primenjuju se tek uz odobrenje. |
| Učenje       | Polaznik          | Objašnjava gradivo upisanog kursa i pomaže u pripremi ispita.                                | Polaznik odgovore poredi sa materijalom kursa i proverava kvizom.            |

Pisanje i istraživanje skraćuju posao kreatora, a učenje polazniku daje sagovornika uz kurs. Kvizovi ostaju glavna provera znanja: znanje se proverava pitanjima koja je odobrio kreator, a ne odgovorima modela, što je u skladu sa efektom testiranja iz odeljka 1.1 [5].

## 9.2 Arhitektura

VI ulazi u sistem na dva puta (slika 9.1). U prvom server sam poziva model Claude, pa trošak snosi platforma. U drugom korisnik koristi svog asistenta zasnovanog na VI (npr. Claude ili Claude Code), koji preko MCP servera poziva funkcije sistema; model i njegov trošak tada pripadaju korisniku. Oba puta završavaju u istim servisima, pa važe ista pravila autorizacije kao za web i nativni klijent (odeljak 5.4).

_Slika 9.1: Dva puta integracije VI_

```text
        Kreator (web klijent)                       Korisnik u svom asistentu
                │ „Napravi kviz uz VI“                       │ „Napravi kurs o…“, „Objasni lekciju…“
                ▼                                            ▼
   ┌─────────────────────────┐                  ┌─────────────────────────┐
   │ API: predlog kviza      │                  │ API: MCP server         │
   │ (limit 20 dnevno)       │                  │ (alati i šabloni)       │
   └──────┬──────────▲───────┘                  └──────┬──────────▲───────┘
          ▼          │ predlog                         ▼          │ rezultat
     Claude API ─────┘                       servisi kurseva, tema, lekcija,
                                             upisa i kvizova ──► PostgreSQL
          │
          ▼
   forma kviza ──► kreator menja ──► čuvanje
```

## 9.3 Tok 1: predlog kviza

1. Kreator u uređivaču kursa bira pravljenje kviza uz VI i po želji dodaje uputstvo (težina, fokus).
2. Server proverava da je korisnik kreator i da nije potrošio dnevni limit od 20 predloga (NFZ-8).
3. Server modelu šalje nazive i opise kursa, teme ili lekcije i jezik korisnika, sa zahtevom za 3–5 pitanja.
4. Odgovor se traži kao strukturisan izlaz (eng. _structured output_) prema Zod šemi iz `@repo/contract`, što garantuje JSON saglasan šemi [135]. Server ga ponovo proverava i vraća, a u bazu ne upisuje ništa.
5. Predlog se otvara u istoj formi kao ručno pravljen kviz, gde ga kreator menja, dopunjuje i čuva (FZ-10).

Ovakav predlog je realan oslonac: u poređenju 651 pitanja koja je napisao GPT-4 i 449 pitanja koja su napisali ljudi, generisana pitanja imala su jasan jezik, jedan tačan odgovor i kvalitetne netačne ponude [136]. Ipak, model zna samo nazive i opise lekcija, pa je pregled kreatora obavezan korak, a ne formalnost.

## 9.4 Tok 2: asistent preko MCP-a

MCP je otvoreni standard kompanije Anthropic iz novembra 2024. godine za povezivanje aplikacija zasnovanih na VI sa spoljnim sistemima [137], koji od decembra 2025. vodi Agentic AI Foundation u okviru Linux Foundation [138]. Server opisuje svoje alate (eng. _tools_), tj. funkcije koje model sme da pozove, i šablone poruka (eng. _prompts_) za česte zadatke, a poruke se razmenjuju u formatu JSON-RPC 2.0 (eng. _Remote Procedure Call_ – RPC) [139]. Za Course Hub je asistent još jedan klijent: korisnik kursevima pristupa iz alata koji već koristi. Server ne čuva stanje između zahteva, pa radi iza bilo koje instance [140].

1. **Povezivanje.** Korisnik na stranici `/ai-connect` pravi lični pristupni token, ili se asistent sam prijavljuje preko OAuth-a: korisnik se preusmerava na web klijent, gde odobrava pristup, po postupku koji propisuje specifikacija MCP-a [141–145]. Pristup se u svakom trenutku može opozvati.
2. **Otkrivanje.** Asistent od servera dobija listu od 14 alata (pregled, pravljenje i izmena kurseva, tema, lekcija i kvizova, i čitanje upisanih kurseva) i tri šablona: `ch_generate_course` (pisanje), `ch_review_course` i `ch_research_course` (istraživanje i učenje).
3. **Rad.** Model na osnovu zahteva korisnika bira alate i poziva ih; server ih izvršava u ime korisnika, preko istih servisa i provera kao REST API.
4. **Granice.** Asistent ne može da objavi ni da obriše kurs, već pravi nacrt koji kreator pregleda i objavljuje. Polaznik upisani kurs čita preko asistenta samo ako je kreator to dozvolio (FZ-13), jer sadržaj tada odlazi spoljnom modelu.

## 9.5 Ograničenja

- Kvalitet predloga nije sistematski meren; oslanja se na pregled kreatora i proveru korisnika.
- Dnevni limit se broji u memoriji servera, pa se briše pri postavljanju nove verzije.
- Pristupni tokeni nemaju rok važenja ni ovlašćenja po alatu, iako specifikacija preporučuje kratkotrajne tokene [141], a verzija specifikacije 2026-07-28 zastarelom proglašava dinamičku registraciju klijenata koju sistem koristi [146].

# 10. Prikaz rada aplikacije

Rad aplikacije prikazan je na jednom toku, rešavanju kviza na kraju lekcije, na računaru, mobilnom webu, iOS-u i Androidu. Ovaj tok je izabran jer postoji na svim klijentima (FZ-7). Na sva četiri snimka su isti korisnik i ista lekcija, pa se vidi i da se odgovori i napredak dele između uređaja (NFZ-2).

## 10.1 Tok rešavanja kviza

1. Polaznik otvara lekciju preko stabla kursa ili linka `?lesson=` (FZ-5). Kviz je kartica ispod sadržaja lekcije.
2. Prvi odgovor menja status lekcije iz „nije započeta“ u „u toku“.
3. Posle predaje server ocenjuje odgovore (odeljak 7.5), a klijent prikazuje rezultat i tačne odgovore.
4. Ako su svi ocenjivi odgovori tačni, prikazuju se konfete i uređaj vibrira. Lekcija je završena ako je i video odgledan do kraja (FZ-6).
5. Polaznik može da obriše odgovore i reši kviz ponovo.

> **[Slika 10.1: Kviz pre predaje — web na računaru, web na telefonu, iOS i Android, jedan pored drugog.]**

> **[Slika 10.2: Rezultat kviza sa tačnim odgovorima i konfetama posle predaje sa svim tačnim odgovorima — iste četiri platforme.]**

## 10.2 Razlike po platformama

Tok i izgled su isti na sve četiri platforme, a razlikuju se samo delovi iz tabele 10.1.

_Tabela 10.1: Razlike u toku kviza po platformama_

| Deo            | Web, računar                         | Web, telefon                                                  | iOS i Android                                     |
| -------------- | ------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------- |
| Stablo lekcija | bočni meni                           | fioka sa dna ekrana                                           | `Modal` (kartica na iOS-u, ceo ekran na Androidu) |
| Komponente     | `@repo/ui-web`                       | `@repo/ui-web`                                                | `@repo/ui-native`                                 |
| Konfete        | `canvas-confetti`, iz sredine ekrana | `canvas-confetti`, sa dna ekrana                              | Reanimated                                        |
| Vibracija      | nema                                 | `navigator.vibrate` na Androidu; na iOS 18+ zaobilaznim putem | `expo-haptics`                                    |

Komponenta `LearnQuiz` ima na webu 146, a na nativnom klijentu 145 linija. Razlikuje se 19 linija nativne verzije, uglavnom uvozi i povratna informacija posle predaje (listing 10.1).

_Listing 10.1: Reakcija na rezultat kviza na webu i nativnom klijentu (`apps/web/app/learn/[publicId]/components/quiz/learn-quiz.tsx`, `apps/native/src/modules/learn-course/components/quiz/learn-quiz.tsx`)_

```tsx
const { mutate: saveResponse } = useSaveQuizResponse(); // isto: @repo/api-client
// …
onSuccess: (saved) => {
  queryClient.setQueryData(responseQueryKey, saved); // isto
  const result = saved.response?.result;
  if (result && result.total > 0 && result.score === result.total) {
    // web:     celebrate(isMobile); vibrate([80, 60, 80, 60, 160]);
    // nativno: celebrate(); Haptics.notificationAsync(NotificationFeedbackType.Success);
  } else {
    // web:     vibrate(40);
    // nativno: Haptics.impactAsync(ImpactFeedbackStyle.Light);
  }
},
```

Iz zajedničkih paketa dolaze hook-ovi za kviz i ključ keša (`@repo/api-client`), tipovi odgovora (`@repo/contract`), obrada grešaka (`@repo/shared`) i prevodi (`@repo/i18n`), a ocenjivanje je na serveru. Specifični za platformu su samo komponente, konfete i vibracija. Za ceo kviz (`learn-quiz`, `quiz-questionnaire`, `quiz-result`, `public-quiz`) nativna verzija ima 312 linija, od kojih se 62 razlikuju od web verzije.

# 11. Postavljanje u produkciju i cena održavanja

## 11.1 Postavljanje

API i web klijent su dva servisa na Railway-u, baza i autentifikacija su na Supabase-u, a video i fajlovi na Cloudflare-u (slika 11.1). Kontinuirana integracija (eng. _Continuous Integration_ – CI) na GitHub Actions proverava da se oba servisa grade. Nativni klijent još nije objavljen; predviđena je izgradnja pomoću EAS-a [90].

_Slika 11.1: Tok od izmene koda do produkcije i produkcioni sistem_

```text
 git push (grana master)
   ├──► GitHub Actions (CI): pnpm turbo build --filter=api...
   │                         pnpm turbo build --filter=web...
   └──► Railway, za svaki servis: izmenjen fajl iz njegovih obrazaca?
           ├─ da ──► izgradnja ──► nova verzija servisa
           └─ ne ──► servis se ne gradi

 Pretraživač / PWA ──► web (Next.js, Railway)   stranice i JavaScript
        │
        └────────────► api (Express, Railway) ──► Supabase: PostgreSQL + Auth
 nativni klijent ────►      ▲    ▲              ──► Cloudflare R2: dokumenti, slike
 MCP klijenti (/apix) ──────┘    └── webhook ── ──► Cloudflare Stream: video
                                                ──► Claude API: predlog kviza
```

_Tabela 11.1: Servisi na Railway-u_

| Servis | Komanda za izgradnju               | Obrasci koji pokreću izgradnju                                                             |
| ------ | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| `api`  | `pnpm turbo build --filter=api...` | `apps/api`, `packages/contract`, `packages/db`                                             |
| `web`  | `pnpm turbo build --filter=web...` | `apps/web`, `packages/ui-web`, `packages/contract`, `packages/api-client`, `packages/i18n` |

Railway preskače izgradnju servisa kada izmena ne odgovara njegovim obrascima [148]. Podešavanja se unose ručno, jer se konfiguracioni fajlovi nisu pouzdano primenjivali. Pri promeni domena oba servisa se ponovo postavljaju, jer se `NEXT_PUBLIC_API_URL` ugrađuje u web klijent, a API prihvata samo porekla iz `CORS_ENABLED_URL`.

## 11.2 Cena održavanja

Trošak je procenjen po javnim cenovnicima (tabela 11.2) i pretpostavkama iz tabele 11.3, a mera korišćenja je broj mesečno aktivnih korisnika (eng. _Monthly Active Users_ – MAU). Resursi servera i baze nisu izmereni, pa rezultat pokazuje red veličine.

_Tabela 11.2: Cene korišćenih servisa (USD, pristupljeno 14.10.2026.)_

| Servis                        | Namena                | Cena                                                                                                                                                                                   |
| ----------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Railway Pro [147]             | `api` i `web`         | $20 mesečno, uključuje $20 potrošnje; virtuelni procesor (vCPU) ≈ $20 i 1 GB radne memorije (RAM) ≈ $10 mesečno; odlazni saobraćaj $0,05/GB                                            |
| Supabase [149]                | baza, autentifikacija | Free: 500 MB baze, 50 000 MAU, 5 GB saobraćaja. Pro: $25 (8 GB, 100 000 MAU, 250 GB, instanca Micro); preko toga $0,00325/MAU, $0,125/GB baze, $0,09/GB; instance Medium $60, 2XL $410 |
| Cloudflare Stream [150]       | video                 | $5 na 1 000 min uskladištenog videa (unapred), $1 na 1 000 min isporučenog; kodiranje besplatno                                                                                        |
| Cloudflare R2 [151]           | dokumenti, slike      | $0,015/GB mesečno, prvih 10 GB besplatno; odlazni saobraćaj besplatan                                                                                                                  |
| Claude Sonnet 5 [152]         | predlog kviza         | $2 na milion ulaznih i $10 na milion izlaznih tokena                                                                                                                                   |
| Apple Developer Program [155] | iOS prodavnica        | $99 godišnje                                                                                                                                                                           |
| Google Play [156]             | Android prodavnica    | $25 jednokratno                                                                                                                                                                        |
| EAS [153], Expo push [154]    | izgradnja, push       | Free: 15 iOS i 15 Android izgradnji mesečno; slanje push obaveštenja besplatno                                                                                                         |

_Tabela 11.3: Pretpostavke modela (N – broj registrovanih korisnika)_

| Veličina          | Pretpostavka                                                                                           | Rezultat             |
| ----------------- | ------------------------------------------------------------------------------------------------------ | -------------------- |
| Aktivni korisnici | 30 % registrovanih                                                                                     | 0,3 N MAU            |
| Video kreatora    | 1 % korisnika su kreatori, sa po 5 h videa                                                             | 3 N min uskladišteno |
| Gledanje          | 60 min videa po MAU                                                                                    | 18 N min isporučeno  |
| Predlog kviza     | 5 mesečno po kreatoru; ~2 000 ulaznih i ~1 500 izlaznih tokena (procena iz upita u `quizGenerator.ts`) | 0,05 N × $0,019      |
| Fajlovi           | 200 MB po kreatoru                                                                                     | 0,002 N GB           |
| Saobraćaj         | 30 MB po MAU sa Railway-a (API i web), 10 MB po MAU iz baze ka API-ju                                  | —                    |
| Baza              | 20 KB po korisniku                                                                                     | 0,02 N MB            |

_Tabela 11.4: Procena mesečnog troška (USD)_

| Stavka                               | 100 korisnika   | 1 000 korisnika  | 10 000 korisnika | 100 000 korisnika | 1 000 000 korisnika |
| ------------------------------------ | --------------- | ---------------- | ---------------- | ----------------- | ------------------- |
| Railway (pretp. vCPU / GB RAM)       | $20 (0,2 / 0,5) | $20 (0,3 / 0,75) | $45 (1 / 2)      | $285 (6 / 12)     | $2 050 (40 / 80)    |
| Supabase                             | $0 (Free)       | $0 (Free)        | $25 (Pro)        | $80 (Pro, Medium) | $1 334 (Pro, 2XL)   |
| Cloudflare Stream: skladište         | $5              | $15              | $150             | $1 500            | $15 000             |
| Cloudflare Stream: isporuka          | $2              | $18              | $180             | $1 800            | $18 000             |
| Claude API                           | $0,10           | $1               | $10              | $95               | $950                |
| Cloudflare R2                        | $0              | $0               | $0,20            | $3                | $30                 |
| Apple Developer Program ($99 / 12)   | $8              | $8               | $8               | $8                | $8                  |
| MAU (eng. _Monthly Active Users_)    | 30              | 300              | 3 000            | 30 000            | 300 000             |
| **Trošak po korisniku mesečno**      | **$0,35**       | **$0,06**        | **$0,042**       | **$0,038**        | **$0,037**          |
| Trošak po aktivnom korisniku mesečno | $1,17           | $0,21            | $0,14            | $0,13             | $0,12               |
| **Ukupan trošak mesečno**            | **≈ $35**       | **≈ $60**        | **≈ $420**       | **≈ $3 800**      | **≈ $37 400**       |
| Udeo videa u ukupnom trošku          | 19 %            | 53 %             | 79 %             | 88 %              | 88 %                |

Do 1 000 korisnika preovlađuju fiksni troškovi. Od 10 000 korisnika trošak je oko $0,04 po korisniku, od čega 79–88 % čini Cloudflare Stream, koji se plaća po minutu videa; VI čini 2,5 %. Prelomne tačke:

1. **10 000 korisnika:** saobraćaj iz baze (30 GB) prelazi Free plan Supabase-a (5 GB).
2. **100 000 korisnika:** baza prelazi na instancu Medium, a API na više instanci; dnevni limit za VI tada važi po instanci (odeljak 9.5).
3. **1 000 000 korisnika:** 200 000 MAU iznad Pro plana košta $650 mesečno, a baza traži instancu 2XL.

Course Hub nema naplatu, pa je isplativost računata uz pretpostavku da svaki kreator plaća $50 mesečno preko weba, jer deo za kreatore postoji samo tamo, a polaznici ne plaćaju.

_Tabela 11.5: Mesečni rezultat uz pretplatu kreatora od $50 (USD)_

| Korisnika | Kreatora (1 %) | Prihod mesečno | Ukupan trošak mesečno | Mesečna zarada (+) ili odliv (−) | Najniža pretplata po kreatoru |
| --------- | -------------- | -------------- | --------------------- | -------------------------------- | ----------------------------- |
| 100       | 1              | $50            | ≈ $35                 | +$15                             | $35,14                        |
| 1 000     | 10             | $500           | ≈ $60                 | +$438                            | $6,22                         |
| 10 000    | 100            | $5 000         | ≈ $420                | +$4 583                          | $4,17                         |
| 100 000   | 1 000          | $50 000        | ≈ $3 800              | +$46 229                         | $3,77                         |
| 1 000 000 | 10 000         | $500 000       | ≈ $37 400             | +$462 628                        | $3,74                         |

Pretplata pokriva infrastrukturu na svakom nivou; na 1 000 000 korisnika dovoljno je 748 kreatora (0,07 %). Razvoj, podrška, porezi i naknada platnog servisa nisu uračunati.
