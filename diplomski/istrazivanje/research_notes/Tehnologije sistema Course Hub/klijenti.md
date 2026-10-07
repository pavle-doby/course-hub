# Klijentske tehnologije sistema Course Hub (stanje: septembar 2026.)

Napomena: sve stranice su otvorene 30.09.2026. putem alata za preuzimanje web stranica (sažetak stranice, ne sirov HTML). Verzije koje koristi sam projekat Course Hub preuzete su iz `apps/*/package.json` i `packages/*/package.json` repozitorijuma (web: `next` 16.3.2, `react`/`react-dom` 19.2.3, `tailwindcss` ^4.3.3, `radix-ui` ^1.6.7, `shadcn` ^4.21.0, `i18next` ^26.4.0, `react-i18next` ^17.0.12; native: `expo` ~57.0.25, `expo-router` ~57.0.23, `expo-secure-store` ~57.0.4, `expo-video` ~57.0.5, `react-native` 0.86.3, `nativewind` ^4.2.6, `tailwindcss` ^3.4.19).

## React (Meta / React Foundation): React 19 i React Foundation

### Takeaway
React 19 je objavljen 5. decembra 2024. (Actions, `useActionState`, `useOptimistic`, `use`, stabilni Server Components/Server Actions, `ref` kao prop). Najnovija verzija na dan 30.09.2026. je React 19.3 (9. septembar 2026). React i React Native od 24. februara 2026. formalno pripadaju React Foundation, nezavisnoj fondaciji pod okriljem Linux Foundation (namera najavljena oktobra 2025).

### Cited Findings
- React 19 objavljen 5. decembra 2024. („The React Team“). — [React v19](https://react.dev/blog/2024/12/05/react-19)
- **Actions**: asinhrone funkcije u tranzicijama koje automatski upravljaju stanjem čekanja (pending), greškama, optimističkim ažuriranjima i resetovanjem formi. — [React v19](https://react.dev/blog/2024/12/05/react-19)
- **`useActionState`** vraća `[state, submitAction, isPending]`; **`useOptimistic`** prikazuje optimističko stanje dok zahtev traje. — [React v19](https://react.dev/blog/2024/12/05/react-19)
- **`use()`** čita promise ili kontekst tokom renderovanja, uz integraciju sa Suspense; može se pozvati uslovno. — [React v19](https://react.dev/blog/2024/12/05/react-19)
- **Server Components** se renderuju unapred, u build vremenu ili po zahtevu, u okruženju odvojenom od klijenta; **Server Actions** (direktiva `"use server"`) su asinhrone funkcije koje se izvršavaju na serveru, a pozivaju iz klijentskih komponenti. — [React v19](https://react.dev/blog/2024/12/05/react-19)
- Ostale novine: `ref` kao prop (bez `forwardRef`), podrška za `<title>/<meta>/<link>` u komponentama, API-ji za preload resursa, bolji izveštaji o greškama hidracije. — [React v19](https://react.dev/blog/2024/12/05/react-19)
- Hronologija sa React bloga: React 19.2 (1.10.2025), React Compiler v1.0 i „Introducing the React Foundation“ (7.10.2025), bezbednosne objave o ranjivostima u React Server Components (3.12. i 11.12.2025), „The React Foundation: A New Home for React Hosted by the Linux Foundation“ (24.2.2026), React 19.3 (9.9.2026). — [React Blog](https://react.dev/blog)
- React 19.3 (9.9.2026): stabilni `<ViewTransition>` i Fragment refs, `browser()` API u React DOM-u, podrška za Trusted Types, Server Components mogu direktno renderovati Context iz `'use client'` modula. — [React 19.3](https://react.dev/blog/2026/09/09/react-19-3)
- React Foundation zvanično pokrenuta 24.2.2026. (namera najavljena u oktobru 2025); fondacija je vlasnik i upravlja projektima React, React Native i JSX, koji su ranije bili u vlasništvu kompanije Meta. Njen domaćin je Linux Foundation. Platinasti osnivači: Amazon, Callstack, Expo, Huawei, Meta, Microsoft, Software Mansion, Vercel. Izvršni direktor je Seth Webster. Tehničko upravljanje ostaje nezavisno od upravnog odbora (privremeni savet za tehničko vođstvo). Autor objave je Matt Carroll. — [The React Foundation (react.dev)](https://react.dev/blog/2026/02/24/the-react-foundation)

### Inferences
- Za teze: „održavalac“ Reacta je od 2026. React Foundation (Linux Foundation), a Meta je jedan od članova. Za period razvoja pre 2026. korektno je reći da ga je razvila kompanija Meta.
- Projekat koristi React 19.2.3, a ne 19.3, jer Next.js App Router isporučuje sopstveni React Canary, a Expo SDK 57 koristi React 19.2.

### Gaps
- Objavu „Introducing the React Foundation“ (7.10.2025) nisam otvorio posebno. Datum sam video samo u listi na blogu, a sadržaj znam iz objave od 24.2.2026.
- Početni opis Reacta kao biblioteke („library for web and native user interfaces“) nisam proverio na početnoj stranici react.dev. Taj opšti opis se u tezi može navesti bez citata ili uz naslovnu stranu react.dev (neproverena).

## Next.js (Vercel): App Router, RSC, SSR i Next.js 16

### Takeaway
Next.js 16 je objavljen 21. oktobra 2025. Turbopack je postao podrazumevani bundler, `proxy.ts` je zamenio `middleware.ts` (koji je sada zastareo), a uvedeni su Cache Components (`"use cache"`), stabilna podrška za React Compiler i React 19.2. Na dan 30.09.2026. najnovija minor verzija je 16.3 (3. avgust 2026). Next.js 17 još nije objavljen.

### Cited Findings
- Next.js 16 objavljen 21.10.2025. Autori objave: Jimmy Lai, Josh Story, Sebastian Markbåge, Tim Neutkens. — [Next.js 16](https://nextjs.org/blog/next-16)
- Turbopack je stabilan i podrazumevani bundler za sve aplikacije: 2–5× brži produkcioni build i do 10× brži Fast Refresh. Webpack i dalje može da se koristi uz `next dev --webpack` / `next build --webpack`. — [Next.js 16](https://nextjs.org/blog/next-16)
- „`proxy.ts` replaces `middleware.ts` and makes the app's network boundary explicit“. `proxy.ts` radi na Node.js runtime-u, a `middleware.ts` je zastareo (ostaje za Edge i biće uklonjen). — [Next.js 16](https://nextjs.org/blog/next-16)
- Cache Components: direktiva `"use cache"`, keširanje je sada potpuno opciono (opt-in), a dinamički kod se podrazumevano izvršava pri zahtevu. Ovim je zaokružen Partial Prerendering (PPR). — [Next.js 16](https://nextjs.org/blog/next-16)
- Ostalo: stabilna podrška za React Compiler (`reactCompiler: true`, nije podrazumevano uključena), App Router koristi React Canary sa React 19.2 funkcijama (View Transitions, `useEffectEvent`, `<Activity/>`), novi API-ji `updateTag()`/`refresh()`, obavezno asinhrono `params`/`cookies()`/`headers()`, minimalno Node.js 20.9 i TypeScript 5.1, uklonjeni AMP i `next lint`. — [Next.js 16](https://nextjs.org/blog/next-16)
- Kasnije verzije: 16.1 (18.12.2025), 16.2 (18.3.2026), 16.3 (3.8.2026). Bezbednosna izdanja: jul, avgust i septembar 2026. (poslednje 30.9.2026). — [Next.js Blog](https://nextjs.org/blog)

### Inferences
- `apps/web/proxy.ts` u projektu (i18n rutiranje) direktno odgovara novoj konvenciji iz Next.js 16. To je dobar primer za tezu.
- App Router/Server Components/SSR: koncept Server Components potiče iz Reacta (videti React v19), a Next.js App Router je okvir koji ga primenjuje.

### Gaps
- Stranice dokumentacije o App Routeru (file-system routing, `layout.tsx`/`page.tsx`) i o renderovanju (SSR/SSG) nisam posebno otvarao. Za definiciju rutiranja zasnovanog na fajl sistemu treba otvoriti nextjs.org/docs/app pre citiranja.
- Sadržaj objave za Next.js 16.3 (3.8.2026) nisam otvarao. Znam samo naslov i datum.

## React Native (Meta / React Foundation): nova arhitektura

### Takeaway
React Native renderuje nativne UI komponente pomoću Reacta. Nova arhitektura (JSI, Fabric, TurboModules) je podrazumevana od verzije 0.76 (23.10.2024), a 0.82 (8.10.2025) je prvo izdanje koje radi isključivo na novoj arhitekturi. Najnovija verzija na dan 30.09.2026. je **0.87** (11.8.2026), a ne 0.86. Projekat koristi 0.86.3 preko Expo SDK 57.

### Cited Findings
- 0.76 (23.10.2024): nova arhitektura podrazumevano uključena, spremna za produkciju nakon 6 godina rada. U istom izdanju su i stabilni React Native DevTools i Metro rezolver oko 15× brži. Autori: Blake Friedman, Riccardo Cipolleschi, Frank Calise, Gabriel Donadel Dall'Agnol. — [React Native 0.76 (reactnative.dev)](https://reactnative.dev/blog/2024/10/23/release-0.76-new-architecture)
- **JSI** zamenjuje asinhroni most (bridge) i omogućava JavaScriptu da drži direktne reference na C++ objekte i poziva metode bez serijalizacije. **Fabric** je novi renderer sa podrškom za konkurentno renderovanje (React 18+: Suspense, `useTransition`, automatsko grupisanje ažuriranja). **TurboModules** su novi sistem nativnih modula. Novi su i sinhroni layout i efekti (`useLayoutEffect` meri i ažurira u jednom commit-u). Opcija uključivanja nove arhitekture postoji od verzije 0.68. — [About the New Architecture (reactnative.dev)](https://reactnative.dev/architecture/landing-page)
- Izdanja: 0.80 (12.6.2025; React 19.1, stara arhitektura zamrznuta), 0.82 (8.10.2025; „first release entirely on New Architecture“), 0.83 (10.12.2025; React 19.2), 0.84 (11.2.2026; Hermes V1 podrazumevan), 0.85 (7.4.2026), 0.86 (11.6.2026; edge-to-edge na Androidu 15+, bez breaking changes), 0.87 (11.8.2026; striktni TypeScript API podrazumevan, Metro 0.87). — [React Native Blog](https://reactnative.dev/blog)
- Stranica „Get Started“ preporučuje razvoj uz framework: „if you're building a new app with React Native, we recommend using a Framework“. Kao takav framework navodi Expo („a production-grade React Native Framework“ sa rutiranjem zasnovanim na fajlovima i standardnom bibliotekom nativnih modula). Novi projekat se pravi komandom `npx create-expo-app@latest`. — [Get Started with React Native](https://reactnative.dev/docs/environment-setup)

### Inferences
- React Native je (kao i React) od 2026. pod okriljem React Foundation. Videti izvor iz prvog odeljka.

### Gaps
- Stranica o arhitekturi (sažetak) navodi „As of React Native 0.76 (March 2026)“. Datum mart 2026. je verovatno datum ažuriranja stranice ili greška pri sažimanju, jer je 0.76 objavljen 23.10.2024. U tezi treba koristiti datum iz release objave.
- Sažetak release objave za 0.76 ne navodi eksplicitno komponente (JSI/Fabric/TurboModules) nego upućuje na posebnu objavu „The New Architecture is Here“, koju nisam otvorio. Za komponente citirati stranicu o arhitekturi.

## Expo (Expo / 650 Industries): SDK 57, Expo Router, CNG, EAS, expo-secure-store, expo-video

### Takeaway
Expo SDK 57 je objavljen 30. juna 2026. (React Native 0.86, React 19.2). SDK 58 je u beta fazi od 15.9.2026, pa je SDK 57 poslednja stabilna verzija na dan 30.09.2026. Expo Router pravi rute od fajlova u direktorijumu `app`, po istom modelu kao Next.js. CNG/prebuild generiše nativne projekte iz konfiguracije, a EAS čine cloud servisi za build, submit i OTA ažuriranja.

### Cited Findings
- Expo SDK 57: 30.6.2026, autori Brent Vatne i Alan Hughes. Uključuje React Native 0.86 i React 19.2 (isto kao SDK 56), a donosi i ažuriranja za expo-router (`Stack.Toolbar.Badge`), expo-image (API za keš) i Reanimated 4.5. — [Expo SDK 57 changelog](https://expo.dev/changelog/sdk-57)
- SDK 56: 21.5.2026, SDK 58 beta: 15.9.2026. — [Expo Changelog](https://expo.dev/changelog)
- Expo Router je „an open-source routing library for Universal React Native applications built with Expo“. Fajlovi u direktorijumu `app` postaju rute, isti model važi za Android, iOS i web, „every screen in your app is automatically deep linkable“. Za nativnu navigaciju koristi React Native Screens, a na webu podržava statičko renderovanje i tipizirane rute. — [Expo Router introduction](https://docs.expo.dev/router/introduction/)
- Continuous Native Generation (CNG): nativni projekti se ne održavaju trajno, već se generišu po potrebi iz konfiguracije aplikacije, šablona SDK verzije, autolinkinga i config plugina. `npx expo prebuild` generiše direktorijume `android`/`ios`, a config plugini su funkcije koje menjaju nativni projekat tokom prebuild-a. EAS Build pokreće prebuild ako nativni direktorijumi ne postoje. — [Continuous Native Generation (Expo docs)](https://docs.expo.dev/workflow/continuous-native-generation/)
- EAS („deeply integrated cloud services for Expo and React Native apps“) obuhvata: Build (kompajliranje i potpisivanje u oblaku), Submit (slanje na App Store / Google Play), Update (ažuriranja bez ponovnog objavljivanja u prodavnici), Workflows (CI/CD), Hosting, Observe, a u preview fazi i Metadata i Insights. — [Expo Application Services](https://docs.expo.dev/eas/)
- expo-secure-store „provides a way to encrypt and securely store key-value pairs locally on the device“. Na iOS-u koristi Keychain (`kSecClassGenericPassword`, podaci mogu ostati posle deinstalacije), a na Androidu Keystore sa vrednostima u SharedPreferences. Neke verzije iOS-a istorijski su odbijale vrednosti veće od oko 2048 bajtova. — [SecureStore (Expo docs)](https://docs.expo.dev/versions/latest/sdk/securestore/)
- expo-video: višeplatformska reprodukcija videa (Android, iOS, tvOS, Web). Komponenta `VideoView` i hook `useVideoPlayer`, podrška za HLS, DASH i SmoothStreaming (`contentType: 'hls'`), PiP i fullscreen. — [Video (Expo docs)](https://docs.expo.dev/versions/latest/sdk/video/)

### Inferences
- Expo SDK 57 donosi React 19.2, pa web i native klijent u projektu dele istu minor verziju Reacta (19.2.x).
- Podrška za HLS u expo-video važna je za Cloudflare Stream (koji isporučuje HLS/DASH). To treba potvrditi u delu teze o backendu.

### Gaps
- Održavaoca (kompanija Expo, pravno 650 Industries) nisam potvrdio na zvaničnoj stranici. Changelog navodi samo autore objava. Stranice o nameri RN Foundation navode Expo kao člana osnivača.
- Tačan broj verzije Expo Routera (u projektu ~57.0.x, u skladu sa novom šemom verzionisanja po SDK-u) nije naveden u objavi za SDK 57.

## Tailwind CSS 4 i NativeWind 4

### Takeaway
Tailwind CSS v4.0 (22.1.2025, Adam Wathan) doneo je novi engine prepisan od nule, konfiguraciju u CSS-u (`@import "tailwindcss"` + `@theme`) i automatsko otkrivanje izvornih fajlova. Najnovija verzija je v4.3 (8.5.2026), a Tailwind Labs se 9.9.2026. pridružio Shopify-ju. NativeWind (Ronin Software) prenosi Tailwind na React Native. Stabilna verzija v4.2.x zahteva Tailwind CSS v3 (`tailwindcss@^3.4.17`), dok je v5 u pre-release fazi.

### Cited Findings
- Tailwind v4.0 objavljen 22.1.2025, autor Adam Wathan. Engine je napisan ispočetka: pun build 3,78× brži, inkrementalni 8,8× brži. — [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4)
- Konfiguracija u CSS-u umesto `tailwind.config.js` (`@import "tailwindcss"` i `@theme { --color-...: ... }`), svi tokeni dostupni kao CSS promenljive, automatsko otkrivanje sadržaja (poštuje `.gitignore`, direktiva `@source`), cascade layers, `@property`, `color-mix()`, paleta u OKLCH, ugrađeni container queries i prvi zvanični Vite plugin. — [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4)
- v4.1 (3.4.2025), v4.3 (8.5.2026, trenutno poslednja), „Tailwind Labs is joining Shopify“ (9.9.2026). — [Tailwind CSS Blog](https://tailwindcss.com/blog)
- NativeWind: „style your React Native apps using Tailwind CSS“, „Built by Ronin Software“, a na sajtu piše „Pre-release v5 of Nativewind is now available!“. — [NativeWind](https://www.nativewind.dev/)
- NativeWind v4.2.7 je „the stable release and uses Tailwind CSS v3“ i zahteva `tailwindcss@^3.4.17`. Radi preko Babel preseta (`nativewind/babel`) i Metro integracije `withNativeWind()` sa `global.css`, a klase iz `className` se u build fazi prevode u React Native StyleSheet objekte. — [NativeWind installation](https://www.nativewind.dev/docs/getting-started/installation)

### Inferences
- Zbog toga projekat ima dve verzije Tailwinda (web ^4.3.3, native ^3.4.19), a zajednički su samo tokeni iz `@repo/ui-theme`. Ovo se u tezi može obrazložiti upravo ograničenjem NativeWind v4.
- „Oxide“ je interni naziv novog engine-a, ali ga objava za v4.0 (po sažetku) ne pominje eksplicitno. Bolje je pisati „novi engine visokih performansi“.

### Gaps
- Objava za v4.2 se ne pojavljuje u sažetku liste bloga. Moguće je da je v4.2 objavljena bez posebne objave ili da je sažetak nije obuhvatio, pa to nisam potvrdio.
- Naziv „Oxide“ nije potvrđen u otvorenom izvoru.

## shadcn/ui i Radix UI

### Takeaway
shadcn/ui nije klasična biblioteka komponenti, već skup otvorenog koda komponenti koje CLI kopira u projekat, pa ih korisnik može menjati. Napravio ga je shadcn (Vercel), a zasnovan je na Radix UI (ili Base UI) primitivima i Tailwind CSS-u. Radix Primitives su nestilizovane, pristupačne komponente niskog nivoa koje prate WAI-ARIA obrasce.

### Cited Findings
- „This is not a component library. It is how you build your component library.“ Principi: Open Code, Composition, Distribution (flat-file šema + CLI), Beautiful Defaults, AI-Ready. Autor je shadcn (Vercel). — [shadcn/ui Introduction](https://ui.shadcn.com/docs)
- Radix Primitives: „a low-level UI component library with a focus on accessibility, customization and developer experience“. Komponente su nestilizovane, prate WAI-ARIA obrasce, same rešavaju aria/role atribute, upravljanje fokusom i navigaciju tastaturom, imaju prop `asChild` i punu podršku za TypeScript. — [Radix Primitives Introduction](https://www.radix-ui.com/primitives/docs/overview/introduction)

### Inferences
- Projekat koristi objedinjeni paket `radix-ui` (^1.6.7) i CLI `shadcn` (^4.21.0).

### Gaps
- Održavaoca Radixa (WorkOS) otvorena stranica ne navodi, pa to nije potvrđeno.
- Tvrdnja da shadcn/ui koristi Radix/Base UI potiče iz sažetka ostatka dokumentacije, a ne iz eksplicitnog citata. Pre citiranja proveriti na ui.shadcn.com/docs (odeljak o primitivima).

## i18next / react-i18next

### Takeaway
i18next je „the internationalization framework for JavaScript“ („learn once – translate everywhere“). Održava ga Locize, a react-i18next je njegova integracija za React.

### Cited Findings
- Mogućnosti: množina (plurals), kontekst, interpolacija, formatiranje, plugin arhitektura (detekcija jezika, učitavanje i keširanje prevoda), namespaces za podelu prevoda i učitavanje po potrebi. Integracije: React (react-i18next), Angular, Vue, Node.js, iOS, Android. Održava ga Locize (servis „localization as a service“). Koristi se na „at least 1,500+ of the world's top 100,000 websites“. — [i18next](https://www.i18next.com/)

### Inferences
- Projekat koristi i18next ^26.4.0 i react-i18next ^17.0.12 (lokali `en` i `sr`).

### Gaps
- Dokumentaciju react-i18next (react.i18next.com) i datume izdanja nisam otvarao.

## Bibliografski podaci (pristupljeno 30.09.2026.)

1. The React Team, „React v19“, React Blog, react.dev, 2024. https://react.dev/blog/2024/12/05/react-19 (pristupljeno 30.09.2026.)
2. React Team, „React Blog“ (lista objava), react.dev, 2026. https://react.dev/blog (pristupljeno 30.09.2026.)
3. The React Team, „React 19.3“, React Blog, react.dev, 2026. https://react.dev/blog/2026/09/09/react-19-3 (pristupljeno 30.09.2026.)
4. M. Carroll, „The React Foundation: A New Home for React Hosted by the Linux Foundation“, React Blog, react.dev, 2026. https://react.dev/blog/2026/02/24/the-react-foundation (pristupljeno 30.09.2026.)
5. J. Lai, J. Story, S. Markbåge, T. Neutkens, „Next.js 16“, Next.js Blog, Vercel, 2025. https://nextjs.org/blog/next-16 (pristupljeno 30.09.2026.)
6. Vercel, „Next.js Blog“ (lista objava), nextjs.org, 2026. https://nextjs.org/blog (pristupljeno 30.09.2026.)
7. B. Friedman, R. Cipolleschi, F. Calise, G. Donadel Dall'Agnol, „React Native 0.76 – New Architecture by default, React Native DevTools, and more“, React Native Blog, reactnative.dev, 2024. https://reactnative.dev/blog/2024/10/23/release-0.76-new-architecture (pristupljeno 30.09.2026.). Tačan naslov proveriti na stranici.
8. React Native Team, „React Native Blog“ (lista objava), reactnative.dev, 2026. https://reactnative.dev/blog (pristupljeno 30.09.2026.)
9. React Native Team, „About the New Architecture“, React Native, reactnative.dev. https://reactnative.dev/architecture/landing-page (pristupljeno 30.09.2026.)
10. React Native Team, „Get Started with React Native“, React Native Docs, reactnative.dev. https://reactnative.dev/docs/environment-setup (pristupljeno 30.09.2026.)
11. B. Vatne, A. Hughes, „Expo SDK 57“, Expo Changelog, expo.dev, 2026. https://expo.dev/changelog/sdk-57 (pristupljeno 30.09.2026.)
12. Expo, „Changelog“, expo.dev, 2026. https://expo.dev/changelog (pristupljeno 30.09.2026.)
13. Expo, „Introduction to Expo Router“, Expo Documentation, docs.expo.dev. https://docs.expo.dev/router/introduction/ (pristupljeno 30.09.2026.)
14. Expo, „Continuous Native Generation (CNG)“, Expo Documentation, docs.expo.dev. https://docs.expo.dev/workflow/continuous-native-generation/ (pristupljeno 30.09.2026.)
15. Expo, „Expo Application Services“, Expo Documentation, docs.expo.dev. https://docs.expo.dev/eas/ (pristupljeno 30.09.2026.)
16. Expo, „SecureStore“, Expo Documentation, docs.expo.dev. https://docs.expo.dev/versions/latest/sdk/securestore/ (pristupljeno 30.09.2026.)
17. Expo, „Video (expo-video)“, Expo Documentation, docs.expo.dev. https://docs.expo.dev/versions/latest/sdk/video/ (pristupljeno 30.09.2026.)
18. A. Wathan, „Tailwind CSS v4.0“, Tailwind CSS Blog, Tailwind Labs, 2025. https://tailwindcss.com/blog/tailwindcss-v4 (pristupljeno 30.09.2026.)
19. Tailwind Labs, „Tailwind CSS Blog“ (lista objava), tailwindcss.com, 2026. https://tailwindcss.com/blog (pristupljeno 30.09.2026.)
20. Ronin Software, „Nativewind“, nativewind.dev. https://www.nativewind.dev/ (pristupljeno 30.09.2026.)
21. Ronin Software, „Installation – Nativewind v4“, nativewind.dev. https://www.nativewind.dev/docs/getting-started/installation (pristupljeno 30.09.2026.)
22. shadcn, „Introduction – shadcn/ui“, ui.shadcn.com. https://ui.shadcn.com/docs (pristupljeno 30.09.2026.)
23. Radix UI (WorkOS, nepotvrđeno), „Introduction – Radix Primitives“, radix-ui.com. https://www.radix-ui.com/primitives/docs/overview/introduction (pristupljeno 30.09.2026.)
24. Locize, „Introduction – i18next documentation“, i18next.com. https://www.i18next.com/ (pristupljeno 30.09.2026.)
