# Serverske tehnologije i tehnologije podataka (Course Hub) — stanje septembar 2026.

Sve navedene stranice su otvorene 30.09.2026. Bibliografski podaci su u pododeljku "Izvori (bibliografija)" na kraju svakog pitanja. Datum pristupa za sve izvore: 30.09.2026.

## Node.js: šta je, održavalac, osnovni koncepti, LTS linije 2026.

### Takeaway
Node.js je asinhrono, događajima vođeno JavaScript okruženje za izvršavanje (runtime), namenjeno skalabilnim mrežnim aplikacijama. U septembru 2026. v26 je "Current", a v24 (Krypton) i v22 (Jod) su LTS linije. Uslov projekta Node >= 22 zato odgovara podržanim LTS izdanjima.

### Cited Findings
- Node.js se opisuje kao "an asynchronous event-driven JavaScript runtime, designed to build scalable network applications" — [Node.js, About](https://nodejs.org/en/about)
- Petlja događaja (event loop) je deo samog okruženja, a ne biblioteka. Node.js ulazi u petlju događaja posle izvršavanja ulazne skripte i izlazi kad više nema povratnih poziva (callback-ova) — [Node.js, About](https://nodejs.org/en/about)
- Gotovo nijedna funkcija u Node.js-u ne izvršava I/O direktno, pa proces ne blokira, osim kod sinhronih metoda. Zbog toga je razvoj skalabilnih sistema "very reasonable". Nema zaključavanja (locks), pa nema ni deadlock-a procesa — [Node.js, About](https://nodejs.org/en/about)
- HTTP je "first-class citizen", projektovan sa naglaskom na strimovanje i malo kašnjenje — [Node.js, About](https://nodejs.org/en/about)
- Status linija izdanja (stanje stranice u septembru 2026):
  - v26: Current, prvo izdanje 05.05.2026.
  - v24 "Krypton": LTS, prvo izdanje 06.05.2025.
  - v22 "Jod": LTS, prvo izdanje 24.04.2024, poslednje ažuriranje 23.09.2026.
  - v20 "Iron" i v18 "Hydrogen": EOL.

  — [Node.js, Previous Releases](https://nodejs.org/en/about/previous-releases)
- Ciklus podrške: izdanje je 6 meseci u fazi Current, zatim prelazi u Active LTS, a potom u Maintenance LTS, uz ukupno 30 meseci podrške. Za produkciju se preporučuju samo Active ili Maintenance LTS izdanja — [Node.js, Previous Releases](https://nodejs.org/en/about/previous-releases)
- Od Node.js 27 izdanja postaju godišnja. Svaka glavna verzija prelazi u LTS, uvodi se Alpha faza, a neparne verzije se više ne izdaju — [Node.js, Previous Releases](https://nodejs.org/en/about/previous-releases)

### Inferences
- Zahtev `engines: node >=22` pokriva obe LTS linije (22 i 24) i aktuelnu v26.
- Stranica "About" ne pominje V8 eksplicitno. Za tvrdnju "Node.js je izgrađen na V8 mašini" treba citirati drugi zvanični izvor. Opšte je poznato da Node.js koristi Google-ov V8, ali to nije potvrđeno otvorenim izvorom u ovom istraživanju.
- Održavalac: projekat Node.js u okviru OpenJS Foundation. Stranica o izdanjima pominje "OpenJS Ecosystem Sustainability Program", ali nije otvorena posebna stranica koja potvrđuje upravljačku strukturu.

### Gaps
- Nije otvoren zvaničan izvor koji eksplicitno navodi V8 i OpenJS Foundation kao održavaoca, na primer nodejs.org/en/learn ili openjsf.org.
- Tačna oznaka faze (Active nasuprot Maintenance LTS) za v22 i v24 nije precizirana u prikazanoj tabeli. Obe su samo označene kao "LTS".

### Izvori (bibliografija)
- OpenJS Foundation / Node.js project, „About Node.js®", nodejs.org, 2026. [Online]. Dostupno: https://nodejs.org/en/about (pristupljeno 30.09.2026.)
- OpenJS Foundation / Node.js project, „Node.js Releases (Previous Releases)", nodejs.org, 2026. [Online]. Dostupno: https://nodejs.org/en/about/previous-releases (pristupljeno 30.09.2026.)

## Express 5: šta je, datum izdanja, ključne izmene, status

### Takeaway
Express v5 je zvanično objavljen 15.10.2024. Glavne izmene su prosleđivanje odbijenih promise-a (async/await) error middleware-u, ažuriran path-to-regexp sa novom sintaksom ruta (zbog zaštite od ReDoS napada), uklanjanje zastarelih API-ja i Node.js >= 18. Verzija 5.1.0 je 31.03.2025. postala podrazumevana (`latest`) na npm-u i ušla u fazu ACTIVE.

### Cited Findings
- Blog post "Introducing Express v5: A New Era for the Node.js Framework" (autori: Wes Todd i Express Technical Committee, 15.10.2024) — [Express blog](https://expressjs.com/en/blog/2024-10-15-v5-release)
- v5 napušta podršku za Node.js verzije starije od v18 — [Express blog](https://expressjs.com/en/blog/2024-10-15-v5-release)
- Ruter hvata odbijene promise-e iz middleware-a i tretira ih kao `next(err)`, pa `async` middleware ne zahteva eksplicitni try/catch — [Express blog](https://expressjs.com/en/blog/2024-10-15-v5-release)
- Izmene u path-to-regexp:
  - uklonjeni su regex podizrazi (npr. `/:foo(\\d+)`) zbog ReDoS-a;
  - opcioni parametar `:name?` sada se piše `{:name}`;
  - splat `*` sada se piše `*name`;
  - svi parametri moraju biti imenovani.

  — [Express blog](https://expressjs.com/en/blog/2024-10-15-v5-release)
- Uklonjeni ili preimenovani API-ji:
  - `res.redirect('back')`
  - `res.send(status, body)`, zamenjen sa `res.status().send()`
  - `app.del()`, zamenjen sa `app.delete()`
  - `res.sendfile`, zamenjen sa `res.sendFile`
  - `req.acceptsCharset` i srodni, zamenjeni oblicima u množini

  — [Express blog](https://expressjs.com/en/blog/2024-10-15-v5-release)
- Bezbednost: ublažavanje CVE-2024-45590 (podesiva dubina `urlencoded` tela, podrazumevano 32), Threat Model dokumentacija i radna grupa za bezbednost — [Express blog](https://expressjs.com/en/blog/2024-10-15-v5-release)
- v5 je prvobitno objavljen pod npm oznakom `next`, a ne `latest` — [Express blog](https://expressjs.com/en/blog/2024-10-15-v5-release)
- "Express@5.1.0: Now the Default on npm with LTS Timeline" (Express Technical Committee, 31.03.2025): 5.1.0 je označen kao `latest`, a v5 prelazi iz faze CURRENT u ACTIVE. Faze podrške su CURRENT (≥3 meseca), ACTIVE (≥12 meseci) i MAINTENANCE (12 meseci). EOL za 5.x je "no sooner than 2027-04-01", a za 4.x "no sooner than 2026-10-01" — [Express blog](https://expressjs.com/en/blog/2025-03-31-v5-1-latest-release)
- Najnovije izdanje na GitHub stranici izdanja je v5.2.1 (vraćena izmena vezana za extended query parser). Pre njega je v5.2.0 sa bezbednosnom ispravkom CVE-2024-51999 — [GitHub, expressjs/express releases](https://github.com/expressjs/express/releases)

### Inferences
- Datum 15.10.2024. je potvrđen zvaničnim blogom. Tabela LTS-a navodi 2024-09-11 kao početak faze CURRENT za 5.x, verovatno datum objave 5.0.0 na npm-u pod oznakom `next`. Datum zvanične najave je 15.10.2024.
- Za Course Hub je najvažnija izmena ta da async kontroleri mogu da bacaju tipizovane greške (`BadRequestError` itd.), koje stižu do centralnog error middleware-a bez omotača.

### Gaps
- Tačan datum izdanja v5.2.0 i v5.2.1 nije pouzdan. Sažetak GitHub stranice je naveo "December 1, 2024", što je nemoguće jer je 5.1.0 izašao 31.03.2025. Verovatno je reč o 1. decembru 2025, ali to nije potvrđeno. Stranica npmjs.com je vratila 403. U radu treba navesti "5.2.x" bez datuma ili proveriti ručno.
- Da li je v6 najavljen do septembra 2026: nije pronađeno.

### Izvori (bibliografija)
- W. Todd, Express Technical Committee, „Introducing Express v5: A New Era for the Node.js Framework", expressjs.com, 15.10.2024. [Online]. Dostupno: https://expressjs.com/en/blog/2024-10-15-v5-release (pristupljeno 30.09.2026.)
- Express Technical Committee, „Express@5.1.0: Now the Default on npm with LTS Timeline", expressjs.com, 31.03.2025. [Online]. Dostupno: https://expressjs.com/en/blog/2025-03-31-v5-1-latest-release (pristupljeno 30.09.2026.)
- expressjs, „Releases · expressjs/express", GitHub, 2026. [Online]. Dostupno: https://github.com/expressjs/express/releases (pristupljeno 30.09.2026.)

## PostgreSQL: šta je, održavalac, ACID, JSONB, aktuelna verzija

### Takeaway
PostgreSQL je open-source objektno-relacioni sistem za upravljanje bazama podataka, ACID-usklađen od 2001. godine, a održava ga PostgreSQL Global Development Group. Najnovija stabilna glavna verzija u septembru 2026. je PostgreSQL 18 (manja verzija 18.6, prvo izdanje 25.09.2025). PostgreSQL 19 je u beta fazi (Beta 4, 24.09.2026).

### Cited Findings
- PostgreSQL se opisuje kao "a powerful, open source object-relational database system that uses and extends the SQL language" — [PostgreSQL, About](https://www.postgresql.org/about/)
- Poreklo je projekat POSTGRES na UC Berkeley iz 1986. godine. Sistem je ACID-usklađen od 2001, zadovoljava 170+ od 177 obaveznih osobina SQL:2023 Core, a razvija ga PostgreSQL Global Development Group — [PostgreSQL, About](https://www.postgresql.org/about/)
- Podržane glavne verzije:
  - 18 (18.6): izdata 25.09.2025, podrška do 14.11.2030.
  - 17 (17.11), 16 (16.15), 15 (15.19) i 14 (14.24): verzija 14 ima podršku do 12.11.2026.
  - Svaka verzija ima 5 godina podrške. Manja izdanja izlaze najmanje jednom u tri meseca.
  - PostgreSQL 19 je u beta fazi (Beta 4, 24.09.2026).

  — [PostgreSQL, Versioning Policy](https://www.postgresql.org/support/versioning/)
- Razlike između `json` i `jsonb`:
  - `json` čuva tačnu kopiju tekstualnog ulaza.
  - `jsonb` čuva podatke u dekomponovanom binarnom formatu. Unos je nešto sporiji, ali je obrada znatno brža jer nema ponovnog parsiranja.
  - `jsonb` ne čuva razmake ni redosled ključeva. Kod duplih ključeva zadržava se poslednja vrednost.
  - `jsonb` podržava indeksiranje.
  - Dokumentacija preporučuje `jsonb` za većinu aplikacija.

  — [PostgreSQL 18 Docs, 8.14 JSON Types](https://www.postgresql.org/docs/current/datatype-json.html)
- `jsonb` podržava GIN indekse (`jsonb_ops` i `jsonb_path_ops`) i operator sadržavanja `@>` — [PostgreSQL 18 Docs, 8.14 JSON Types](https://www.postgresql.org/docs/current/datatype-json.html)

### Inferences
- Čuvanje pitanja kviza kao `jsonb` omogućava fleksibilnu strukturu pitanja i odgovora bez posebnih tabela, uz mogućnost upita i indeksiranja.
- Supabase hostuje PostgreSQL. Tačna verzija Postgresa na konkretnom Supabase projektu nije proverena.

### Gaps
- Koju glavnu verziju PostgreSQL-a Supabase podrazumevano koristi za nove projekte u 2026: nije provereno.

### Izvori (bibliografija)
- The PostgreSQL Global Development Group, „About PostgreSQL", postgresql.org, 2026. [Online]. Dostupno: https://www.postgresql.org/about/ (pristupljeno 30.09.2026.)
- The PostgreSQL Global Development Group, „Versioning Policy", postgresql.org, 2026. [Online]. Dostupno: https://www.postgresql.org/support/versioning/ (pristupljeno 30.09.2026.)
- The PostgreSQL Global Development Group, „PostgreSQL 18 Documentation: 8.14. JSON Types", postgresql.org, 2026. [Online]. Dostupno: https://www.postgresql.org/docs/current/datatype-json.html (pristupljeno 30.09.2026.)

## Supabase: šta je, Auth, JWT (access + refresh tokeni)

### Takeaway
Supabase je open-source platforma izgrađena na PostgreSQL-u. Svaki projekat je puna Postgres baza, a platforma nudi i Auth, Storage, Realtime i Edge Functions. Supabase Auth izdaje kratkotrajan JWT access token (podrazumevano 1 h) i refresh token za jednokratnu upotrebu, sa detekcijom ponovne upotrebe. Access token se na backendu verifikuje preko JWKS krajnje tačke.

### Cited Findings
- "Every project is a full Postgres database" sa automatski generisanim REST i GraphQL API-jima. Ostali proizvodi:
  - Auth: email, socijalne mreže, MFA, magic link;
  - Storage: CDN, S3 kompatibilnost;
  - Realtime: WebSocket;
  - Edge Functions: TypeScript/Deno.

  — [Supabase Docs, Features](https://supabase.com/docs/guides/getting-started/features)
- Platforma naglašava open-source razvoj (~110,9 hiljada GitHub zvezdica, prema stranici) — [Supabase Docs, Features](https://supabase.com/docs/guides/getting-started/features)
- Sesija se sastoji od kratkotrajnog access tokena (JWT) i refresh tokena (jedinstveni string). JWT sadrži claim `session_id`. Preporučeno podrazumevano trajanje access tokena je 1 sat — [Supabase Docs, User sessions](https://supabase.com/docs/guides/auth/sessions)
- Refresh token se može iskoristiti samo jednom:
  - Ponovna upotreba je dozvoljena u prozoru od 10 s (npr. zbog SSR-a).
  - Ponovna upotreba van dozvoljenih izuzetaka gasi celu sesiju i opoziva sve njene refresh tokene.

  — [Supabase Docs, User sessions](https://supabase.com/docs/guides/auth/sessions)
- JWT claims:
  - `sub`: ID korisnika;
  - `role`: Postgres uloga za RLS;
  - `exp`: vreme isteka;
  - `iss`: izdavalac tokena.

  — [Supabase Docs, JWTs](https://supabase.com/docs/guides/auth/jwts)
- Verifikacija tokena:
  - Supabase podržava asimetrične ključeve (RSA, eliptičke krive), a javni ključevi su na `/.well-known/jwks.json`, keširani 10 minuta.
  - Backend treba da verifikuje JWT preko JWKS-a sa bibliotekom kao što je `jose` ili preko `supabase.auth.getClaims()`.
  - Deljeni tajni ključevi (HS256) se ne preporučuju.

  — [Supabase Docs, JWTs](https://supabase.com/docs/guides/auth/jwts)

### Inferences
- Za Course Hub: Express API validira Supabase JWT u `handleAuth` middleware-u. Kratkotrajni access token i refresh tokeni sa rotacijom smanjuju posledice krađe tokena.

### Gaps
- Nije otvoren zvaničan izvor sa formulacijom "open source Firebase alternative" ni sa podatkom o kompaniji koja održava Supabase (Supabase Inc.). Formulacija se često koristi, ali nije potvrđena u ovom istraživanju.

### Izvori (bibliografija)
- Supabase Inc., „Features", Supabase Docs, 2026. [Online]. Dostupno: https://supabase.com/docs/guides/getting-started/features (pristupljeno 30.09.2026.)
- Supabase Inc., „User sessions", Supabase Docs, 2026. [Online]. Dostupno: https://supabase.com/docs/guides/auth/sessions (pristupljeno 30.09.2026.)
- Supabase Inc., „JSON Web Token (JWT)", Supabase Docs, 2026. [Online]. Dostupno: https://supabase.com/docs/guides/auth/jwts (pristupljeno 30.09.2026.)

## Drizzle ORM, drizzle-kit i drizzle-zod

### Takeaway
Drizzle je "headless TypeScript ORM with a head", SQL-orijentisan ("If you know SQL, you know Drizzle"), sa SQL-like i relacionim API-jem za upite. drizzle-kit generiše SQL migracije iz TypeScript šeme (code-first). drizzle-zod izvodi Zod šeme iz tabela, a sada je dostupan i kao `drizzle-orm/zod`. Stabilna linija u septembru 2026. je 0.45.x (0.45.3, 21.09.), a v1.0 je u fazi release candidate (rc.4).

### Cited Findings
- Drizzle se opisuje kao "a headless TypeScript ORM with a head", "lightweight, performant, typesafe" i "serverless-ready by design". Ima nula zavisnosti — [Drizzle, Overview](https://orm.drizzle.team/docs/overview)
- "If you know SQL, you know Drizzle". To je "the only ORM with both relational and SQL-like query APIs". Relacioni upiti "always outputs exactly 1 SQL query" — [Drizzle, Overview](https://orm.drizzle.team/docs/overview)
- drizzle-kit komande:
  - `generate`: poredi TypeScript šemu sa prethodnim migracijama i pravi SQL migracione fajlove i snapshot-ove;
  - `migrate`: primenjuje neprimenjene migracije;
  - `push`: primenjuje šemu direktno, bez SQL fajlova;
  - `pull`: iz baze generiše TypeScript šemu.

  — [Drizzle, Migrations](https://orm.drizzle.team/docs/migrations)
- drizzle-zod nudi `createSelectSchema`, `createInsertSchema` i `createUpdateSchema`, sa refinement-ima i factory funkcijama. Integrisan je u Drizzle ORM kao `drizzle-orm/zod` — [Drizzle, drizzle-zod](https://orm.drizzle.team/docs/zod)
- Najnovija izdanja na GitHub-u:
  - drizzle-orm 0.45.3 (21. septembar): Netlify DB driver;
  - drizzle-kit 0.31.11 (21. septembar);
  - v1.0.0-rc.4 (27. jun, pre-release).
  - Stabilnog v1.0 još nema.

  — [GitHub, drizzle-orm releases](https://github.com/drizzle-team/drizzle-orm/releases)

### Inferences
- Projekat koristi zaseban paket `drizzle-zod@0.8.3` (sa patch-om) umesto integrisanog `drizzle-orm/zod`. U radu se može pomenuti da noviji Drizzle nudi integrisanu varijantu.
- Tok rada u Course Hub-u odgovara code-first pristupu: šema u `@repo/db-schema`, zatim `drizzle-kit generate`, pa SQL migracije u repozitorijumu.

### Gaps
- Održavalac: tim Drizzle Team (GitHub organizacija `drizzle-team`). Nije otvorena stranica sa formalnim nazivom organizacije.
- Godina uz datume izdanja na GitHub-u nije eksplicitno prikazana u sažetku. Iz konteksta je 2026, ali to nije potvrđeno.

### Izvori (bibliografija)
- Drizzle Team, „Drizzle ORM — Overview", orm.drizzle.team, 2026. [Online]. Dostupno: https://orm.drizzle.team/docs/overview (pristupljeno 30.09.2026.)
- Drizzle Team, „Drizzle migrations fundamentals", orm.drizzle.team, 2026. [Online]. Dostupno: https://orm.drizzle.team/docs/migrations (pristupljeno 30.09.2026.)
- Drizzle Team, „drizzle-zod", orm.drizzle.team, 2026. [Online]. Dostupno: https://orm.drizzle.team/docs/zod (pristupljeno 30.09.2026.)
- Drizzle Team, „Releases · drizzle-team/drizzle-orm", GitHub, 2026. [Online]. Dostupno: https://github.com/drizzle-team/drizzle-orm/releases (pristupljeno 30.09.2026.)

## Cloudflare Stream i Cloudflare R2

### Takeaway
Cloudflare Stream je serverless servis za video na zahtev i uživo. Automatski enkoduje video (H.264, adaptivni bitrate 360p–1080p) i isporučuje ga preko HLS (`.m3u8`) i DASH (`.mpd`) manifesta. Podržava direct creator uploads (jednokratni URL za otpremanje) i webhook-ove potpisane HMAC-SHA256 potpisom. R2 je objektno skladište bez naknada za odlazni saobraćaj (egress), sa S3-kompatibilnim presigned URL-ovima (SigV4, važenje do 7 dana).

### Cited Findings
- Stream: "Serverless live and on-demand video streaming with adaptive bitrate encoding and global delivery". Otpremanje, skladištenje, enkodovanje i isporuka idu kroz jedan API. Servis podržava i H.264 ABR 360p–1080p, Signed URLs za ograničen pristup, direct creator uploads i analitiku — [Cloudflare Docs, Stream](https://developers.cloudflare.com/stream/)
- Manifesti:
  - HLS: `https://customer-<CODE>.cloudflarestream.com/<UID>/manifest/video.m3u8`
  - DASH: `.../manifest/video.mpd`

  Stream je kompatibilan sa svim plejerima koji podržavaju HLS i DASH — [Cloudflare Docs, Use your own player](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/)
- Direct creator uploads:
  - Backend poziva `direct_upload` API i dobija `uploadURL` i `uid`. Klijent otprema video direktno na Stream, bez izlaganja API tokena.
  - `maxDurationSeconds` rezerviše prostor.
  - Osnovni POST služi za fajlove manje od 200 MB. Za veće fajlove i nestabilne veze koristi se tus (nastavljivo otpremanje).

  — [Cloudflare Docs, Direct creator uploads](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/)
- Webhook-ovi:
  - Stream šalje POST kada se obrada videa završi, uspešno ili neuspešno. Dozvoljena je jedna pretplata po nalogu.
  - Zaglavlje `Webhook-Signature` sadrži `time` i `sig1`.
  - Izvorni string je `time + "." + telo zahteva`, bez izmena. Na njega se primenjuje HMAC-SHA256 sa tajnom webhook-a (hex).
  - Rezultat se poredi sa `sig1` u konstantnom vremenu.

  — [Cloudflare Docs, Use webhooks](https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/)
- R2: "Object storage for all your data", bez "costly egress bandwidth fees" tipičnih za cloud skladišta — [Cloudflare Docs, R2](https://developers.cloudflare.com/r2/)
- R2 presigned URL-ovi:
  - Daju privremeni pristup objektima bez izlaganja kredencijala.
  - Podržane metode su GET, HEAD, PUT i DELETE. POST (multipart form) nije podržan.
  - Važenje je od 1 s do 7 dana (604.800 s).
  - Potpisuju se algoritmom AWS Signature Version 4, lokalno, bez komunikacije sa R2.
  - Rade samo na S3 API domenu `<ACCOUNT_ID>.r2.cloudflarestorage.com`, a ne na prilagođenim domenima.

  — [Cloudflare Docs, R2 Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)

### Inferences
- Zbog verifikacije potpisa nad nepromenjenim telom Course Hub prima webhook preko raw-body rute, pre `express.json()`.
- S3 kompatibilnost R2 proističe iz toga što presigned URL-ovi koriste SigV4 na "S3 API" domenu. Početna R2 stranica S3 kompatibilnost ne ističe eksplicitno.

### Gaps
- Nije otvorena posebna stranica "S3 API compatibility" za R2 ni stranica o cenama, koja bi potvrdila tačnu formulaciju "zero egress fees".
- Datumi pokretanja servisa (Stream, R2 GA) nisu istraženi.

### Izvori (bibliografija)
- Cloudflare, Inc., „Cloudflare Stream", Cloudflare Docs, 2026. [Online]. Dostupno: https://developers.cloudflare.com/stream/ (pristupljeno 30.09.2026.)
- Cloudflare, Inc., „Use your own player", Cloudflare Docs, 2026. [Online]. Dostupno: https://developers.cloudflare.com/stream/viewing-videos/using-own-player/ (pristupljeno 30.09.2026.)
- Cloudflare, Inc., „Direct creator uploads", Cloudflare Docs, 2026. [Online]. Dostupno: https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/ (pristupljeno 30.09.2026.)
- Cloudflare, Inc., „Use webhooks", Cloudflare Docs, 2026. [Online]. Dostupno: https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/ (pristupljeno 30.09.2026.)
- Cloudflare, Inc., „Cloudflare R2", Cloudflare Docs, 2026. [Online]. Dostupno: https://developers.cloudflare.com/r2/ (pristupljeno 30.09.2026.)
- Cloudflare, Inc., „Presigned URLs", Cloudflare R2 Docs, 2026. [Online]. Dostupno: https://developers.cloudflare.com/r2/api/s3/presigned-urls/ (pristupljeno 30.09.2026.)

## Railway (platforma za deployment)

### Takeaway
Railway se opisuje kao "an all-in-one intelligent cloud provider that makes it easy to provision infrastructure, develop locally, and deploy to the cloud".

### Cited Findings
- Citat iz Takeaway-a — [Railway Docs](https://docs.railway.com/)

### Inferences
- Course Hub se na Railway-u postavlja kao dva servisa (API i web), prema README.deploy.md u repozitorijumu.

### Gaps
- Kompanija koja održava platformu (Railway Corp.) nije potvrđena otvorenim izvorom.

### Izvori (bibliografija)
- Railway, „Railway Docs", docs.railway.com, 2026. [Online]. Dostupno: https://docs.railway.com/ (pristupljeno 30.09.2026.)
