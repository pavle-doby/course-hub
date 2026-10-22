# Tehnologije zajedničkog ugovora (shared contract): TypeScript, Zod, REST, OpenAPI 3.1, zod-to-openapi, Orval, TanStack Query, Axios, JWT

Stanje: 30.09.2026. Sve izvore ispod sam otvorio (WebFetch) istog dana. Datum pristupa za sve: 30.09.2026.

## TypeScript: definicija, održavalac, trenutna verzija (6.0 / 7.0 Go port)

### Takeaway
TypeScript je JavaScript plus statički sistem tipova sa **strukturnim tipiziranjem** („duck typing“). Održava ga Microsoft. Aktuelna glavna verzija u septembru 2026. je **TypeScript 7.0** (izdat 8. jula 2026), prva verzija sa kompajlerom prepisanim u Go (oko 10 puta brži). **TypeScript 6.0** (23. mart 2026) je poslednja verzija zasnovana na staroj JavaScript bazi koda.

### Cited Findings
- „TypeScript offers all of JavaScript's features, and an additional layer on top of these: TypeScript's type system.“ Takođe: „Your existing working JavaScript code is also TypeScript code.“ — [TypeScript for the New Programmer / TS in 5 minutes, typescriptlang.org](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- Strukturno tipiziranje: „One of TypeScript's core principles is that type checking focuses on the *shape* that values have“ („duck typing“ / „structural typing“). Dva objekta istog oblika smatraju se istim tipom. — [typescriptlang.org handbook](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- Zvanični blog TypeScript tima (Microsoft DevBlogs) navodi ova izdanja: TypeScript 5.9 (1. avg. 2025), 6.0 Beta (11. feb. 2026), 6.0 RC (6. mar. 2026), **6.0 (23. mar. 2026)**, opisan kao „the last release based on the current JavaScript codebase“, 7.0 Beta (21. apr. 2026), 7.0 RC (18. jun 2026) i **TypeScript 7.0 (8. jul 2026)**, opisan kao „a 10x faster native port of TypeScript“ napisan u Go-u, sa višenitnim radom. Autor objava je Daniel Rosenwasser. — [TypeScript DevBlogs, Microsoft](https://devblogs.microsoft.com/typescript/)
- Stranica dokumentacije typescriptlang.org u trenutku pristupa i dalje prikazuje „TypeScript 6.0“ kao najnoviju verziju u meniju beleški o izdanjima. — [typescriptlang.org](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html). Ovo se razlikuje od DevBlogs-a koji objavljuje 7.0 kao konačno izdanje (vidi Inferences).
- Sekundarni izvori (samo pretraga, nisu otvoreni, **ne citirati**): InfoQ „TypeScript 7 released“ (avg. 2026) i Visual Studio Magazine o 7.0 RC (22. jun 2026) navode ubrzanje od 8 do 12 puta i interni naziv „Project Corsa“.

### Inferences
- Za rad: „TypeScript (Microsoft), aktuelna verzija 7.0 (jul 2026), nativni kompajler u Go-u; 6.0 je poslednja verzija na JS bazi.“ Proverite koju verziju projekat stvarno koristi (`typescript` u package.json). Verovatno je to 5.9 ili 6.x, jer ekosistem alata (ESLint/typescript-eslint, Next.js) možda još prelazi na 7.
- Razlika sa typescriptlang.org verovatno znači da dokumentacioni sajt kasni ili da 7.0 ima poseban kanal distribucije. Za verziju kao primarni izvor citirati DevBlogs.

### Gaps
- Nisam otvorio sam članak o izdanju 7.0 (tačan URL članka), već samo indeks bloga. Na npm-u nisam proverio tačnu poslednju zakrpu (7.0.x) ni paket preko kojeg se 7.0 distribuira.
- typescriptlang.org stranica ne pominje eksplicitno „Microsoft“. Održavaoca potvrđuje Microsoft DevBlogs domen.

**Bibliografija:**
- Microsoft, *TypeScript: Documentation – TypeScript for JavaScript Programmers / TypeScript in 5 minutes*, typescriptlang.org, 2026. https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html (pristupljeno 30.09.2026.)
- D. Rosenwasser / Microsoft, *TypeScript (DevBlogs): Announcing TypeScript 7.0; Announcing TypeScript 6.0*, devblogs.microsoft.com, 2026. https://devblogs.microsoft.com/typescript/ (pristupljeno 30.09.2026.)

## Zod: definicija, Zod 4, z.infer

### Takeaway
Zod je „TypeScript-first schema validation with static type inference“. Autor i održavalac je Colin McDonnell (@colinhacks). Zod 4 je stabilan. Poslednje izdanje u trenutku pristupa je v4.6.5 (13. sep. 2026).

### Cited Findings
- Definicija: „TypeScript-first schema validation with static type inference“. Šema se definiše (`z.object()`, `z.string()`…), nepoznati podaci se proveravaju sa `.parse()`, a rezultat automatski nosi ispravan TypeScript tip. Jezgro ima oko 2 kB gzip i nema zavisnosti. Radi u Node.js-u i u pretraživaču. — [zod.dev](https://zod.dev/)
- Održavalac: Colin McDonnell (@colinhacks). „Zod 4 is stable.“ Pominje se i objava za verziju 4.6. — [zod.dev](https://zod.dev/)
- Zod 4 je stabilizovan posle „a year of active development“. U odnosu na Zod 3 parsiranje stringova je 14,71 puta brže, nizova 7,43 puta, a objekata 6,5 puta. Paket je 2,3 puta manji (5,36 kB prema 12,47 kB gzip). **Zod Mini** (1,88 kB) je funkcionalni API koji se dobro „tree-shake“-uje. Zod 4 donosi ugrađeni **`z.toJSONSchema()`**, **metadata registries** i `.meta()`, rekurzivne tipove i i18n grešaka. Autor objave: Colin McDonnell. — [Zod 4 release notes, zod.dev/v4](https://zod.dev/v4)
- Poslednje izdanje: v4.6.5, 13. septembar (2026). — [GitHub releases colinhacks/zod](https://github.com/colinhacks/zod/releases)

### Inferences
- `z.infer<typeof schema>` izvodi statički TS tip iz šeme. To je standardni Zod API koji ilustruje „static type inference“ sa naslovne strane, ali nisam otvorio posebnu stranicu dokumentacije o `z.infer` (vidi Gaps).
- `z.toJSONSchema` i registri metapodataka u Zod 4 su osnova na kojoj zod-to-openapi v8 generiše OpenAPI 3.1 šeme (OAS 3.1 = JSON Schema 2020-12). Tako lanac Drizzle → drizzle-zod → Zod → OpenAPI → Orval ostaje jedan izvor istine.

### Gaps
- Tačan datum izdanja Zod v4.0.0 nisam potvrdio (stranica taga na GitHub-u vratila je 404). Iz sećanja je to jul 2025, ali to nije provereno i ne treba ga citirati bez izvora.
- Stranicu dokumentacije o `z.infer` (zod.dev/basics) nisam otvorio.

**Bibliografija:**
- C. McDonnell, *Zod: Intro*, zod.dev, 2026. https://zod.dev/ (pristupljeno 30.09.2026.)
- C. McDonnell, *Release notes – Zod 4*, zod.dev, 2025. https://zod.dev/v4 (pristupljeno 30.09.2026.)
- colinhacks, *zod – Releases*, GitHub, 2026. https://github.com/colinhacks/zod/releases (pristupljeno 30.09.2026.)

## REST: Fieldingova disertacija i ograničenja

### Takeaway
REST je definisao Roy Thomas Fielding u doktorskoj disertaciji na University of California, Irvine (2000), poglavlje 5. Ograničenja redom: klijent-server, bez stanja (stateless), keš, uniformni interfejs (sa 4 podograničenja), slojeviti sistem i opciono code-on-demand.

### Cited Findings
- Puna citacija: Roy Thomas Fielding, *Architectural Styles and the Design of Network-based Software Architectures*, doktorska disertacija (Doctor of Philosophy in Information and Computer Science), University of California, Irvine, 2000. Predsednik komisije: Prof. Richard N. Taylor. — [Fielding dissertation, title page](https://ics.uci.edu/~fielding/pubs/dissertation/top.htm)
- Ograničenja, redosledom izvođenja u pogl. 5: (1) Client-Server, (2) Stateless, gde svaki zahtev nosi sve potrebne informacije, (3) Cache, gde se odgovori označavaju kao keširajući ili ne, (4) Uniform Interface, sa podograničenjima: identifikacija resursa, manipulacija resursima kroz reprezentacije, samoopisne poruke i hipermedija kao pokretač stanja aplikacije (HATEOAS), (5) Layered System, (6) Code-On-Demand (opciono). — [Fielding, Chapter 5: REST](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
- Fielding: „REST is a hybrid style derived from several of the network-based architectural styles“. Stil naglašava „scalability of component interactions, generality of interfaces, independent deployment of components“. — [Fielding, Chapter 5](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)

### Inferences
- Course Hub API (Express, JSON preko HTTP-a, resursi pod `/api/v1/...`, bez serverske sesije, autentifikacija JWT tokenom u svakom zahtevu) poštuje ograničenja klijent-server, stateless i uniformni interfejs u pragmatičnom smislu. HATEOAS se u praksi, kao i u većini „REST-olikih“ API-ja, ne primenjuje. To je korisno pošteno napomenuti u radu.

### Gaps
- Nema.

**Bibliografija:**
- R. T. Fielding, *Architectural Styles and the Design of Network-based Software Architectures*, doktorska disertacija, University of California, Irvine, 2000. https://ics.uci.edu/~fielding/pubs/dissertation/top.htm (pristupljeno 30.09.2026.)
- R. T. Fielding, „Chapter 5: Representational State Transfer (REST)“, u: *Architectural Styles…*, UC Irvine, 2000. https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm (pristupljeno 30.09.2026.)

## OpenAPI Specification 3.1 (i status 3.1.x / 3.2 u 2026)

### Takeaway
OAS 3.1.0 je objavljen 15. februara 2021. Njegov Schema Object je nadskup JSON Schema Draft 2020-12. U 2026. su najnovije verzije 3.1.2 (grana 3.1) i 3.2.1 (ukupno). OAS 3.2.0 je izašao 19. septembra 2025.

### Cited Findings
- Definicija: „a standard, programming language-agnostic interface description for HTTP APIs, which allows both humans and computers to discover and understand the capabilities of a service without requiring access to source code, additional documentation, or inspection of network traffic.“ — [OAS v3.1.0](https://spec.openapis.org/oas/v3.1.0.html)
- Datum: 15. februar 2021. Nosilac autorskih prava je The Linux Foundation. OpenAPI Initiative je projekat Linux Foundation-a. — [OAS v3.1.0](https://spec.openapis.org/oas/v3.1.0.html)
- „Data types in the OAS are based on the types supported by the JSON Schema Specification Draft 2020-12“ i „the Schema Object … is a superset of JSON Schema Specification Draft 2020-12.“ — [OAS v3.1.0](https://spec.openapis.org/oas/v3.1.0.html)
- Objavljene verzije: 3.2.1 i 3.2.0, 3.1.2, 3.1.1 i 3.1.0, 3.0.0 do 3.0.4, 2.0. Najnovija ukupno je v3.2.1, a u grani 3.1 v3.1.2. JSON šeme imaju datirane iteracije (npr. 2026-08-30). — [spec.openapis.org/oas](https://spec.openapis.org/oas/)
- OAS 3.2.0 je objavljen 19. septembra 2025. Novine su HTTP metod QUERY, proširena podrška za streaming (sekvencijalni tipovi medija, SSE), `additionalOperations` za proizvoljne HTTP metode i OpenAPI Media Type Registry. I dalje je usklađen sa JSON Schema 2020-12. — [OAS v3.2.0](https://spec.openapis.org/oas/v3.2.0.html)

### Inferences
- Projekat generiše 3.1 dokument (OpenApiGeneratorV31). U radu to treba opisati kao „OpenAPI 3.1“ i napomenuti da postoji novija 3.2 koja je kompatibilna naviše, a da prelazak nije bio potreban.

### Gaps
- Tačne datume objave za 3.1.1, 3.1.2 i 3.2.1 nisam otvorio (stranice pojedinačnih verzija).

**Bibliografija:**
- OpenAPI Initiative (The Linux Foundation), *OpenAPI Specification v3.1.0*, spec.openapis.org, 15.02.2021. https://spec.openapis.org/oas/v3.1.0.html (pristupljeno 30.09.2026.)
- OpenAPI Initiative, *OpenAPI Specification v3.2.0*, spec.openapis.org, 19.09.2025. https://spec.openapis.org/oas/v3.2.0.html (pristupljeno 30.09.2026.)
- OpenAPI Initiative, *OpenAPI Specification – versions*, spec.openapis.org, 2026. https://spec.openapis.org/oas/ (pristupljeno 30.09.2026.)

## @asteasolutions/zod-to-openapi (registry.registerPath)

### Takeaway
Biblioteka firme Astea Solutions generiše OpenAPI dokumentaciju iz Zod šema. Putanje se registruju u kodu preko `OpenAPIRegistry.registerPath`, a dokument 3.1 se pravi sa `OpenApiGeneratorV31`. Aktuelne verzije zahtevaju Zod 4.

### Cited Findings
- Opis: „A library that uses zod schemas to generate an Open API Swagger documentation.“ Održava je Astea Solutions. — [GitHub README](https://github.com/asteasolutions/zod-to-openapi)
- `OpenAPIRegistry` prikuplja definicije. `registerPath({ method, path, request: { body, params, query, headers }, responses: { <status>: { description, content } } })` registruje putanju. — [README](https://github.com/asteasolutions/zod-to-openapi)
- `extendZodWithOpenApi(z)` dodaje metod `.openapi()`: `.openapi({ ...metadata })`, `.openapi("SchemaName")` za registraciju imenovane šeme, ili oba zajedno. — [README](https://github.com/asteasolutions/zod-to-openapi)
- `OpenApiGeneratorV31` pravi OpenAPI 3.1.x i koristi nizove tipova (`type: ['string','null']`) umesto `nullable: true` iz 3.0. — [README](https://github.com/asteasolutions/zod-to-openapi)
- Zahteva Zod v4.x. Za Zod v3 postoji verzija 7.3.4, koja više nije aktivno podržana. — [README](https://github.com/asteasolutions/zod-to-openapi)

### Gaps
- Tačna poslednja verzija paketa i njen datum nisu bili vidljivi u README-u. Proverite verziju u `apps/api/package.json`.

**Bibliografija:**
- Astea Solutions, *zod-to-openapi (README)*, GitHub, 2026. https://github.com/asteasolutions/zod-to-openapi (pristupljeno 30.09.2026.)

## Orval

### Takeaway
Orval generiše tipizirane klijente, mock-ove i validatore iz OpenAPI specifikacije: React Query, SWR, Vue/Svelte/Solid Query, Angular, Axios, Fetch, Zod, Hono i MSW. Glavna verzija je v8, a najnovije izdanje u trenutku pristupa je v8.39.0.

### Cited Findings
- Slogan: „Transform your OpenAPI specs into type-safe clients, mocks, and validators. Stop writing boilerplate. Start shipping features.“ — [orval.dev](https://orval.dev/)
- Podržani izlazi: React Query, SWR, Vue Query, Svelte Query, Solid Query, Angular, Axios, Fetch API, Zod (validatori), Hono, MSW mock-ovi (Faker.js). — [orval.dev](https://orval.dev/)
- Razvija ga zajednica (organizacija orval-labs na GitHub-u) uz sponzorstva. Među održavaocima su anymaniax, melloware i soartec-lab. Naslovna strana navodi „v8“. — [orval.dev](https://orval.dev/)
- Poslednje izdanje: **v8.39.0**, objavio github-actions „30 Sep“. Alat za preuzimanje je kao godinu naveo 2024, ali to je gotovo sigurno greška čitanja, jer v8 aktuelan u 2026. i datum odgovara današnjem (30.09.2026). — [GitHub releases orval-labs/orval](https://github.com/orval-labs/orval/releases)

### Inferences
- U Course Hub-u Orval iz `apps/api/openapi.json` generiše React Query hook-ove i Axios mutator u `packages/api-client/src/generated/`, koje koriste i Next.js web i Expo aplikacija. Ovo potiče iz dokumentacije repozitorijuma (CLAUDE.md/AGENTS.md), ne iz spoljnog izvora.

### Gaps
- Datum v8.0.0 nije potvrđen. Godinu izdanja v8.39.0 treba proveriti na npm-u ako je bitna.

**Bibliografija:**
- Orval contributors, *Orval – OpenAPI to TypeScript*, orval.dev, 2026. https://orval.dev/ (pristupljeno 30.09.2026.)
- orval-labs, *orval – Releases*, GitHub, 2026. https://github.com/orval-labs/orval/releases (pristupljeno 30.09.2026.)

## TanStack Query (React Query) v5

### Takeaway
TanStack Query je biblioteka za dohvatanje, keširanje, sinhronizaciju i ažuriranje **serverskog stanja**. Glavna verzija je i dalje v5, a poslednje izdanje je `@tanstack/react-query` 5.104.0 (26. sep. 2026).

### Cited Findings
- Definicija: biblioteka koja čini „fetching, caching, synchronizing and updating server state“ jednostavnim, „the missing data-fetching library for web applications“. — [TanStack Query Overview](https://tanstack.com/query/latest/docs/framework/react/overview)
- Serversko stanje se razlikuje od klijentskog: udaljeno je, zahteva asinhrone API-je, ima deljeno vlasništvo i može zastareti bez znanja klijenta. Klasične biblioteke za stanje „are not so great at working with async or server state“. — [Overview](https://tanstack.com/query/latest/docs/framework/react/overview)
- Rešava keširanje, deduplikaciju zahteva, sinhronizaciju u pozadini, prepoznavanje zastarelih podataka, paginaciju i lenjo učitavanje, garbage collection i memoizaciju rezultata sa structural sharing-om. — [Overview](https://tanstack.com/query/latest/docs/framework/react/overview)
- Poslednje izdanje: **@tanstack/react-query 5.104.0, 26. septembar 2026**. v5 je i dalje glavna verzija. — [GitHub releases TanStack/query](https://github.com/TanStack/query/releases)

### Inferences
- Ključni pojmovi za rad su query keys (identitet keša), `invalidateQueries` posle mutacija, `useInfiniteQuery` za beskonačne liste i staleTime/gcTime. To su standardni v5 API-ji, ali posebne stranice o njima nisam otvorio (vidi Gaps).

### Gaps
- Stranice „Query Keys“, „Query Invalidation“ i „Infinite Queries“ nisam otvorio, pa ih ne treba citirati bez otvaranja.
- Otvorena stranica ne navodi autora. Tanner Linsley kao tvorac nije potvrđen iz otvorenog izvora.

**Bibliografija:**
- TanStack, *TanStack Query – Overview (React)*, tanstack.com, 2026. https://tanstack.com/query/latest/docs/framework/react/overview (pristupljeno 30.09.2026.)
- TanStack, *query – Releases*, GitHub, 2026. https://github.com/TanStack/query/releases (pristupljeno 30.09.2026.)

## Axios

### Takeaway
Axios je „Promise based HTTP client for the browser and node.js“. Podržava interceptore, transformaciju zahteva i odgovora, otkazivanje i automatsku JSON (de)serijalizaciju.

### Cited Findings
- Opis repozitorijuma: „Promise based HTTP client for the browser and node.js“. Koristi XMLHttpRequest u pretraživaču i http modul u Node.js-u. — [GitHub axios/axios](https://github.com/axios/axios)
- Mogućnosti: Promise API, presretanje (interceptori) zahteva i odgovora, transformacija podataka, otkazivanje zahteva, automatski rad sa JSON-om, serijalizacija form-data, zaštita od XSRF-a na klijentu. — [GitHub axios/axios](https://github.com/axios/axios)
- README navodi zvanični sajt https://axios.rest/. Stari https://axios-http.com/docs/intro trajno (301) preusmerava na axios.rest. — [GitHub axios/axios](https://github.com/axios/axios)

### Inferences
- U Course Hub-u Orval koristi Axios instancu (mutator) kao HTTP sloj. Interceptori su logično mesto za dodavanje `Authorization: Bearer <JWT>` zaglavlja.

### Gaps
- Tačna aktuelna verzija nije pouzdano utvrđena. Alat je „1.13.2“ pročitao iz CDN primera u README-u, što ne mora biti poslednje izdanje. Proverite na npm-u ili GitHub Releases.

**Bibliografija:**
- Axios contributors, *axios (README)*, GitHub, 2026. https://github.com/axios/axios (pristupljeno 30.09.2026.)

## JSON Web Token (RFC 7519)

### Takeaway
JWT je standardizovan u RFC 7519 (IETF, maj 2015, Standards Track). Autori su M. Jones, J. Bradley i N. Sakimura.

### Cited Findings
- Puna citacija: M. Jones (Microsoft), J. Bradley (Ping Identity), N. Sakimura (NRI), „JSON Web Token (JWT)“, RFC 7519, Internet Engineering Task Force (IETF), maj 2015, Standards Track, DOI 10.17487/RFC7519. — [RFC Editor](https://www.rfc-editor.org/rfc/rfc7519)
- Definicija: „JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties.“ Tvrdnje (claims) su JSON objekat koji je payload JWS strukture, digitalno potpisan ili zaštićen MAC-om, ili plaintext JWE strukture (šifrovan). — [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519)

### Gaps
- Nema.

**Bibliografija:**
- M. Jones, J. Bradley, N. Sakimura, *JSON Web Token (JWT)*, RFC 7519, IETF, maj 2015. DOI: 10.17487/RFC7519. https://www.rfc-editor.org/rfc/rfc7519 (pristupljeno 30.09.2026.)
