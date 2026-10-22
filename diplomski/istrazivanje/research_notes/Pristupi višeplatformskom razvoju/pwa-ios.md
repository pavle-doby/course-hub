# PWA mogućnosti i razlike između platformi (iOS/iPadOS vs. Android vs. desktop), stanje septembar 2026.

Napomena o izvorima: svi izvori ispod su otvoreni 30.09.2026. Oznake: [PRIMARNI] = proizvođač/standardizaciono telo; [BLOG-PROIZVOĐAČ] = zvanični inženjerski blog (WebKit, web.dev); [ŠTAMPA] = novinski/tehnološki portal. Podaci o podršci API-ja uzeti su direktno iz MDN browser-compat-data (paket `@mdn/browser-compat-data` v8.1.3, generisan 24.09.2026.), što je isti skup podataka koji prikazuju MDN tabele kompatibilnosti.

## 1. Instalacija (Android/Chrome, desktop Chrome/Edge, iOS Safari, macOS Safari)

### Takeaway
Na Androidu i desktop Chromium pretraživačima instalacija je podržana programski (`beforeinstallprompt`, Android „WebAPK“), dok na iOS/iPadOS nema sistemskog install prompta: korisnik ručno bira Share → „Add to Home Screen“. Od iOS/iPadOS 26 (Safari 26, jesen 2025) svaki sajt dodat na početni ekran podrazumevano se otvara kao web-aplikacija; macOS Sonoma (Safari 17, sept. 2023) uveo je „Add to Dock“.

### Cited Findings
- Android Chrome instalira PWA kao **WebAPK** koji generiše („mint“) Google-ov server; WebAPK ima ikonu u launcheru i na početnom ekranu i podržava badging i prečice aplikacije. Samsung Internet takođe pravi WebAPK na Samsung uređajima, a na ostalim uređajima pravi prečicu. — [web.dev, Learn PWA: Installation](https://web.dev/learn/pwa/installation) [BLOG-PROIZVOĐAČ]
- Desktop instalacija u Chrome/Edge podržana je na Windows, macOS, Linux i ChromeOS; ikonica za instalaciju pojavljuje se u adresnoj traci, uz opciju u meniju. — [web.dev, Learn PWA: Installation](https://web.dev/learn/pwa/installation)
- Chrome kriterijumi za instalabilnost (za `beforeinstallprompt`): HTTPS; aplikacija nije već instalirana; korisnik je bar jednom kliknuo/dodirnuo stranicu i proveo najmanje 30 s; manifest sa `short_name` ili `name`, ikonama 192 px i 512 px, `start_url`, `display` ∈ {`fullscreen`, `standalone`, `minimal-ui`, `window-controls-overlay`}, i `prefer_related_applications` odsutan ili `false`. — [Pete LePage, „What does it take to be installable?“, web.dev, ažurirano 19.09.2024.](https://web.dev/articles/install-criteria)
- Događaj `beforeinstallprompt`: Chrome 61+, Chrome Android 61+, Edge 79+, Samsung Internet 8.0+; **nije podržan** u Firefox-u, Safari-ju ni Safari-ju na iOS-u. — [MDN BCD, Window: beforeinstallprompt event](https://developer.mozilla.org/docs/Web/API/Window/beforeinstallprompt_event)
- iOS/iPadOS Safari: nema automatskog prompta; korisnik ručno dodaje aplikaciju kroz Share meni → „Add to Home Screen“. — [web.dev, Learn PWA: Installation](https://web.dev/learn/pwa/installation)
- iOS/iPadOS 16.4 (beta 1, najava 16.02.2023.): pretraživači trećih strana (Chrome, Edge, Firefox… na iOS-u) dobili su mogućnost da ponude „Add to Home Screen“ iz Share menija, ako imaju odgovarajući Apple entitlement. U istoj verziji uvedena je podrška za `id` član manifesta. — [Brady Eidson, Jen Simmons, „Web Push for Web Apps on iOS and iPadOS“, WebKit blog, 16.02.2023.](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) [BLOG-PROIZVOĐAČ]
- Safari 17.0 / macOS Sonoma (18.09.2023.): bilo koji sajt može se dodati u Dock (File → Add to Dock); web-aplikacija na Mac-u podržava Web Push, badging i service worker; Safari pri dodavanju kopira kolačiće sajta u web-aplikaciju pa korisnik ostaje prijavljen. — [Jen Simmons i Safari/WebKit tim, „WebKit Features in Safari 17.0“, WebKit blog, 18.09.2023.](https://webkit.org/blog/14445/webkit-features-in-safari-17-0/)
- Safari 26 beta (najava WWDC25, 09.06.2025.): na iOS/iPadOS 26 „by default, every website added to the Home Screen opens as a web app“; korisnik može isključiti prekidač „Open as Web App“. Manifest i dalje važi (ikone, itd.), ali više nije uslov — isti pristup koji je Apple na macOS-u usvojio 2023. — [Jen Simmons i dr., „News from WWDC25: Web technology coming this fall in Safari 26 beta“, WebKit blog, 09.06.2025.](https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/)
- **Neslaganje izvora**: web.dev stranica „Learn PWA: Installation“ tvrdi da „macOS Safari ne podržava instalabilnost“, što je zastarelo u odnosu na WebKit blog o Safari 17.0 (Add to Dock, 2023). U radu koristiti WebKit izvor. — [web.dev](https://web.dev/learn/pwa/installation) vs. [WebKit, Safari 17.0](https://webkit.org/blog/14445/webkit-features-in-safari-17-0/)
- Dodatno za Android: Trusted Web Activity (Chrome 72+) omogućava da se PWA objavi u Google Play kao Android aplikacija (povezivanje preko Digital Asset Links). — [Chrome for Developers, „Trusted Web Activity overview“](https://developer.chrome.com/docs/android/trusted-web-activity/) [PRIMARNI]

### Inferences
- Za Next.js PWA iz rada: na Androidu/desktopu može se prikazati sopstveno „Instaliraj“ dugme preko `beforeinstallprompt`; na iOS-u je potrebno uputstvo korisniku (Share → Add to Home Screen), jer programski prompt ne postoji.
- Od iOS 26 manifest nije uslov za „web app“ režim na iOS-u, ali i dalje određuje ikone, ime, `display` i `id`.

### Gaps
- Nisam pronašao primarni izvor koji potvrđuje od kog datuma/verzije konkretno Chrome ili Edge za iOS stvarno nude „Add to Home Screen“ (WebKit navodi samo da je mogućnost otvorena od 16.4 uz entitlement).
- Za iOS 17.4/18 nisam našao posebne promene u instalaciji osim DMA epizode (tačka 3) i Declarative Web Push-a (tačka 2).

## 2. Web Push (iOS/iPadOS 16.4 i Android/desktop)

### Takeaway
Web Push na iOS/iPadOS postoji od verzije 16.4 (mart 2023.), ali **samo za web-aplikacije dodate na početni ekran**, uz dozvolu koja mora biti tražena na korisnički gest. Na Androidu i desktopu (Chrome, Edge, Firefox) Push API postoji od 2015–2016. i radi i bez instalacije. Svi zasnivaju na W3C Push API + IETF RFC 8030 / RFC 8292 (VAPID).

### Cited Findings
- iOS/iPadOS 16.4 beta 1 (blog 16.02.2023.) donosi Web Push za web-aplikacije na početnom ekranu; manifest mora imati `display` = `standalone` ili `fullscreen`. — [Eidson & Simmons, WebKit blog, 16.02.2023.](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- Zahtev za dozvolu mora biti pokrenut direktnom interakcijom korisnika (npr. dodir na dugme „subscribe“). — [isto](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- Obaveštenja su integrisana sa Focus režimima i sinhronizuju se između uređaja preko manifest `id`. — [isto](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- MDN BCD, `PushManager`: Chrome 42, Chrome Android 42, Edge 17, Firefox 44, Firefox Android 48, Samsung Internet 4.0, Safari (macOS) 16 („Notifications are supported on macOS Ventura and later“), Safari iOS 16.4 („Notifications are supported in web apps saved to the home screen“). — [MDN, PushManager](https://developer.mozilla.org/docs/Web/API/PushManager)
- MDN BCD, `Notification` na Safari iOS 16.4: delimična implementacija — „The Notification interface is undefined, unless the page is a web app saved to the home screen. The app's manifest must have a non-default display value.“ Na Chrome Android obaveštenje se može prikazati samo iz service workera (`ServiceWorkerRegistration.showNotification()`). — [MDN, Notification](https://developer.mozilla.org/docs/Web/API/Notification)
- Declarative Web Push (iOS 18.4, iPadOS 18.4, macOS 15.5 beta; blog 27.03.2025.): push poruke u standardizovanom JSON formatu koje sistem prikazuje bez service workera; obaveštenja moraju uvek biti vidljiva korisniku — tihi (silent) push nije dozvoljen. — [Brady Eidson, „Meet Declarative Web Push“, WebKit blog, 27.03.2025.](https://webkit.org/blog/16535/meet-declarative-web-push/)
- Badging API (`navigator.setAppBadge`): Safari iOS 16.4 („for web apps saved to the home screen“), Safari macOS 17 (instalirane web-aplikacije, Sonoma+), Chrome/Edge desktop 81 (Windows, macOS; ChromeOS od 91; Linux ne), **nije** podržan u Chrome za Android, Samsung Internet ni Firefox-u prema MDN BCD. — [MDN, Navigator.setAppBadge](https://developer.mozilla.org/docs/Web/API/Navigator/setAppBadge). Napomena: web.dev navodi da WebAPK „podržava badging“ — verovatno se odnosi na sistemske tačke obaveštenja na Androidu, ne na `setAppBadge` sa brojem. — [web.dev](https://web.dev/learn/pwa/installation)

### Inferences
- Za aplikaciju iz rada: na iOS-u korisnik mora prvo instalirati PWA na početni ekran pa tek onda pritisnuti dugme za uključivanje obaveštenja; `Notification`/`PushManager` treba detektovati (feature detection) pre prikaza dugmeta.
- Serverski deo (VAPID, `web-push` biblioteka) je isti za sve platforme; Apple koristi sopstveni push servis, ali preko istog standardnog protokola (RFC 8030/8292).

### Gaps
- Nisam otvorio Apple dokumentaciju o push servisu (web.push.apple.com) niti RFC 8291 (šifrovanje sadržaja poruke); ako se u radu pominju, treba ih posebno proveriti.

## 3. EU Digital Markets Act epizoda (februar–mart 2024.)

### Takeaway
U beta verzijama iOS 17.4 (februar 2024.) Apple je u EU uklonio Home Screen web-aplikacije (otvarale su se kao obične Safari prečice), obrazlažući to DMA obavezom podrške alternativnim pretraživačkim engine-ima; 1. marta 2024. Apple je objavio da zadržava postojeću funkcionalnost, zasnovanu na WebKit-u.

### Cited Findings
- Sredinom februara 2024. Apple je najavio uklanjanje Home Screen web-aplikacija u iOS 17.4 u EU; krajem februara usledila je najava istrage EU i kritike (npr. Open Web Advocacy); 01.03.2024. Apple je preokrenuo odluku. Apple-ova izjava sa Developer sajta: „We have received requests to continue to offer support for Home Screen web apps in iOS, therefore we will continue to offer the existing Home Screen web apps capability in the EU.“ Web-aplikacije će nastaviti da budu „built directly on WebKit“. — [Chance Miller, „Apple says iOS 17.4 won't remove Home Screen web apps in the EU after all“, 9to5Mac, 01.03.2024.](https://9to5mac.com/2024/03/01/apple-home-screen-web-apps-ios-17-eu/) [ŠTAMPA]
- Prvobitno Apple-ovo obrazloženje (februar 2024.): zlonamerne web-aplikacije bi mogle čitati podatke drugih web-aplikacija, a obezbeđivanje ove funkcije za pretraživače trećih strana „was not practical to undertake given the other demands of the DMA“; naveden je i nizak stepen korišćenja. Uklanjanje se prvo pojavilo u iOS 17.4 beta, pre zvanične objave. Izjava pri preokretu: korisnici i programeri pogođeni uklanjanjem u beta verziji „can expect the return of the existing functionality … with the availability of iOS 17.4 in early March“. — [Michael Simon, „Home Screen web apps are not going away after all“, Macworld, 01.03.2024.](https://www.macworld.com/article/2238869/ios-17-4-home-screen-web-apps-digital-markets-act-eu.html) [ŠTAMPA]

### Inferences
- Epizoda ilustruje da je sudbina PWA na iOS-u u potpunosti uslovljena odlukama Apple-a, što je argument u poglavlju o rizicima PWA pristupa.

### Gaps
- Apple-ov primarni tekst (Q&A na developer.apple.com/support/dma-and-apps-in-the-eu/) više ne sadrži deo o Home Screen web-aplikacijama (proverio sam trenutnu verziju stranice 30.09.2026.), a web.archive.org nije bio dostupan alatu. Izjave su zato citirane preko štampe (9to5Mac, Macworld). The Verge i Ars Technica nisu bili dostupni za preuzimanje, pa se ne citiraju.

## 4. Skladište, offline i pozadinska sinhronizacija

### Takeaway
Service Worker i Cache Storage rade na svim glavnim platformama (Safari od 11.1/iOS 11.3). Na iOS/Safari-ju postoji ITP pravilo brisanja skript-upisivog skladišta nakon 7 dana korišćenja Safari-ja bez interakcije sa sajtom (od 2020.), od kojeg su web-aplikacije na početnom ekranu faktički izuzete; Safari 17 (2023.) je uveo nove kvote. Background Sync, Periodic Background Sync i Background Fetch postoje samo u Chromium pretraživačima.

### Cited Findings
- 24.03.2020. (ITP): „deleting all of a website's script-writable storage after seven days of Safari use without user interaction on the site“ — obuhvata IndexedDB, LocalStorage, Media keys, SessionStorage, registracije service workera i njihov keš. Web-aplikacije na početnom ekranu „are not part of Safari and thus have their own counter of days of use“. — [John Wilander, „Full Third-Party Cookie Blocking and More“, WebKit blog, 24.03.2020.](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
- Safari 17.0 (iOS 17, iPadOS 17, macOS Sonoma), blog 10.08.2023.: kvota po poreklu (origin) do 60% ukupnog diska za pretraživače (15% za ostale aplikacije koje ugrađuju WebView); ukupna kvota do 80% diska za pretraživače (20% za ostale); cross-origin frame 10% kvote glavnog origina. Brisanje po LRU politici; podrazumevano „best-effort“ režim. `navigator.storage.persist()` se odobrava heuristikom, npr. „whether the website is opened as a Home Screen Web App“. — [Sihui Liu, „Updates to Storage Policy“, WebKit blog, 10.08.2023.](https://webkit.org/blog/14403/updates-to-storage-policy/)
- `StorageManager.persist()`: Chrome 55, Firefox 57, Safari/Safari iOS 15.2. — [MDN, StorageManager.persist](https://developer.mozilla.org/docs/Web/API/StorageManager/persist)
- `ServiceWorker`: Chrome 40, Edge 17, Firefox 44, Safari 11.1, Safari iOS 11.3. `CacheStorage`: Chrome 43, Firefox 41, Safari 11.1, Safari iOS 11.3. — [MDN, ServiceWorker](https://developer.mozilla.org/docs/Web/API/ServiceWorker); [MDN, CacheStorage](https://developer.mozilla.org/docs/Web/API/CacheStorage)
- Background Sync (`SyncManager`): Chrome/Chrome Android 49, Edge 79, Samsung 5.0; **nema** u Firefox-u i Safari-ju (macOS i iOS). — [MDN, SyncManager](https://developer.mozilla.org/docs/Web/API/SyncManager)
- Periodic Background Sync (`PeriodicSyncManager`, eksperimentalno): Chrome/Edge 80, Samsung 13.0; nema u Firefox-u ni Safari-ju. — [MDN, PeriodicSyncManager](https://developer.mozilla.org/docs/Web/API/PeriodicSyncManager)
- Background Fetch (`BackgroundFetchManager`, eksperimentalno): Chrome/Chrome Android 74, Edge 79, Samsung 11.0; nema u Firefox-u ni Safari-ju. — [MDN, BackgroundFetchManager](https://developer.mozilla.org/docs/Web/API/BackgroundFetchManager)

### Inferences
- Offline stranica preko service workera + Cache Storage radi i na iOS-u; ali slanje podataka „kad se veza vrati“ mora na iOS-u da se radi pri sledećem otvaranju aplikacije (npr. `online` događaj), ne preko Background Sync.
- Instalacija na početni ekran na iOS-u je bitna i za trajnost podataka (poseban brojač dana, veća verovatnoća odobrenja `persist()`).

### Gaps
- Nisam našao noviji WebKit izvor (posle 2023.) koji menja pravilo od 7 dana ili kvote; pretpostavlja se da važe, ali to nije eksplicitno potvrđeno za iOS 26.

## 5. Ostali nedostaci (Vibration, Badging, Bluetooth, USB, NFC, Wake Lock, Share)

### Takeaway
Hardverski API-ji (Web Bluetooth, WebUSB, Web NFC) i Vibration API postoje samo u Chromium pretraživačima (neki samo na Androidu), a nijedan u Safari-ju/iOS-u; Safari na iOS-u podržava Badging (16.4, samo početni ekran), Screen Wake Lock (18.4) i Web Share (12.2).

### Cited Findings (MDN BCD v8.1.3, 24.09.2026.)
- `navigator.vibrate`: Chrome 32, Chrome Android 32 (od Chrome 60 zahteva korisnički gest), Samsung 2.0; Firefox za Android 79 — delimično (vibracija je isključena, metoda vraća `true` bez efekta); **Safari i Safari iOS: nije podržano**. — [MDN, Navigator.vibrate](https://developer.mozilla.org/docs/Web/API/Navigator/vibrate)
- Web Bluetooth (`Bluetooth`, eksperimentalno): Chrome 70 desktop (na Linuxu nije podrazumevano uključen), Chrome Android 56, Edge 79, Samsung 6.0; nema u Firefox-u ni Safari-ju. — [MDN, Bluetooth](https://developer.mozilla.org/docs/Web/API/Bluetooth)
- WebUSB (`USB`, eksperimentalno): Chrome 61, Chrome Android 61, Edge 79; nema u Firefox-u ni Safari-ju. — [MDN, USB](https://developer.mozilla.org/docs/Web/API/USB)
- Web NFC (`NDEFReader`, eksperimentalno): samo Chrome Android 89 i Samsung 15.0. — [MDN, NDEFReader](https://developer.mozilla.org/docs/Web/API/NDEFReader)
- Screen Wake Lock (`navigator.wakeLock`): Chrome/Edge 84, Firefox 126, Safari 16.4, Safari iOS 18.4. — [MDN, Navigator.wakeLock](https://developer.mozilla.org/docs/Web/API/Navigator/wakeLock)
- Web Share (`navigator.share`): Chrome Android 61, Chrome desktop 128, Edge 93, Safari 12.1, Safari iOS 12.2; Firefox desktop samo iza zastavice. — [MDN, Navigator.share](https://developer.mozilla.org/docs/Web/API/Navigator/share)
- Badging: videti tačku 2. — [MDN, Navigator.setAppBadge](https://developer.mozilla.org/docs/Web/API/Navigator/setAppBadge)

### Inferences
- Za aplikaciju za kurseve ovi nedostaci su uglavnom nebitni (ne koristi Bluetooth/NFC); relevantno je da vibracija uz obaveštenje ne radi na iOS-u i da pozadinska sinhronizacija nije dostupna.

### Gaps
- caniuse.com nije posebno otvaran (podaci su uzeti iz MDN BCD, koji caniuse i sam delimično koristi).

## 6. Ključne specifikacije (status i URL)

### Takeaway
Nijedna od W3C PWA specifikacija nije finalna Preporuka (Recommendation): Manifest i Push API su Working Draft, Service Workers je Candidate Recommendation Draft; protokolski deo (RFC 8030, RFC 8292) je IETF Proposed Standard (Standards Track).

### Cited Findings
- **Web Application Manifest** — W3C Working Draft, 13.08.2026.; urednici Marcos Cáceres (Apple), Daniel Murphy (Google), Christian Liebel (Thinktecture AG). https://www.w3.org/TR/appmanifest/ (verzija https://www.w3.org/TR/2026/WD-appmanifest-20260813/) — [W3C](https://www.w3.org/TR/appmanifest/) [PRIMARNI]
- **Service Workers** (naslov stranice „Service Workers Nightly“) — W3C Candidate Recommendation Draft, 17.09.2026.; urednici Monica Chintala (Microsoft), Yoshisato Yanagisawa (Google); bivši urednici uključuju Alex Russell i Jake Archibald (Google). https://www.w3.org/TR/service-workers/ (verzija https://www.w3.org/TR/2026/CRD-service-workers-20260917/) — [W3C](https://www.w3.org/TR/service-workers/)
- **Push API** — W3C Working Draft, 01.12.2025.; urednici Marcos Caceres (Apple Inc.), Kagami Rosylight (Mozilla Foundation); bivši: Peter Beverloo (Google), Martin Thomson (Mozilla) do 25.09.2025. https://www.w3.org/TR/push-api/ (verzija https://www.w3.org/TR/2025/WD-push-api-20251201/) — [W3C](https://www.w3.org/TR/push-api/)
- **RFC 8030**, „Generic Event Delivery Using HTTP Push“, M. Thomson (Mozilla), E. Damaggio, B. Raymor, Ed. (Microsoft), IETF, decembar 2016., Standards Track. https://www.rfc-editor.org/rfc/rfc8030 — [RFC Editor](https://www.rfc-editor.org/rfc/rfc8030.txt)
- **RFC 8292**, „Voluntary Application Server Identification (VAPID) for Web Push“, M. Thomson (Mozilla), P. Beverloo (Google), IETF, novembar 2017., Standards Track. VAPID omogućava serveru aplikacije da se identifikuje push servisu potpisanim tokenom i ograniči upotrebu pretplate na jedan server aplikacije. https://www.rfc-editor.org/rfc/rfc8292 — [RFC Editor](https://www.rfc-editor.org/rfc/rfc8292.txt)

### Inferences
- U radu je korektno reći da su PWA tehnologije „de facto“ standard implementiran u pretraživačima, ali formalno još u statusu nacrta kod W3C.

### Gaps
- RFC 8291 (Message Encryption for Web Push) nije otvaran.

---

## Bibliografija (pristupljeno 30.09.2026.)

1. Eidson, B., Simmons, J. „Web Push for Web Apps on iOS and iPadOS“. WebKit blog, Apple/WebKit, 16.02.2023. https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/ [blog proizvođača]
2. Eidson, B. „Meet Declarative Web Push“. WebKit blog, 27.03.2025. https://webkit.org/blog/16535/meet-declarative-web-push/ [blog proizvođača]
3. Wilander, J. „Full Third-Party Cookie Blocking and More“. WebKit blog, 24.03.2020. https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/ [blog proizvođača]
4. Liu, S. „Updates to Storage Policy“. WebKit blog, 10.08.2023. https://webkit.org/blog/14403/updates-to-storage-policy/ [blog proizvođača]
5. Simmons, J. i Safari/WebKit tim. „WebKit Features in Safari 17.0“. WebKit blog, 18.09.2023. https://webkit.org/blog/14445/webkit-features-in-safari-17-0/ [blog proizvođača]
6. Simmons, J., Yitbarek, S., Davis, J. i dr. „News from WWDC25: Web technology coming this fall in Safari 26 beta“. WebKit blog, 09.06.2025. https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/ [blog proizvođača]
7. Google (web.dev). „Learn PWA: Installation“. web.dev, bez datuma na stranici. https://web.dev/learn/pwa/installation [blog/dokumentacija proizvođača]
8. LePage, P. „What does it take to be installable?“. web.dev, Google, ažurirano 19.09.2024. https://web.dev/articles/install-criteria [dokumentacija proizvođača]
9. Google (Chrome for Developers). „Trusted Web Activity overview“. developer.chrome.com. https://developer.chrome.com/docs/android/trusted-web-activity/ [dokumentacija proizvođača]
10. Miller, C. „Apple says iOS 17.4 won't remove Home Screen web apps in the EU after all“. 9to5Mac, 01.03.2024. https://9to5mac.com/2024/03/01/apple-home-screen-web-apps-ios-17-eu/ [štampa]
11. Simon, M. „Home Screen web apps are not going away after all“. Macworld, 01.03.2024. https://www.macworld.com/article/2238869/ios-17-4-home-screen-web-apps-digital-markets-act-eu.html [štampa]
12. Mozilla i saradnici. MDN Web Docs / browser-compat-data v8.1.3 (24.09.2026.): Navigator.vibrate, Navigator.setAppBadge, PushManager, Notification, ServiceWorker, CacheStorage, SyncManager, PeriodicSyncManager, BackgroundFetchManager, Bluetooth, USB, NDEFReader, Navigator.wakeLock, Navigator.share, StorageManager.persist, Window: beforeinstallprompt event. https://developer.mozilla.org/docs/Web/API/ (pojedinačni URL-ovi navedeni uz nalaze)
13. W3C. „Web Application Manifest“, W3C Working Draft, 13.08.2026. Ur. M. Cáceres, D. Murphy, C. Liebel. https://www.w3.org/TR/appmanifest/
14. W3C. „Service Workers“, W3C Candidate Recommendation Draft, 17.09.2026. Ur. M. Chintala, Y. Yanagisawa. https://www.w3.org/TR/service-workers/
15. W3C. „Push API“, W3C Working Draft, 01.12.2025. Ur. M. Caceres, K. Rosylight. https://www.w3.org/TR/push-api/
16. Thomson, M., Damaggio, E., Raymor, B. (ur.). „Generic Event Delivery Using HTTP Push“. RFC 8030, IETF, decembar 2016. https://www.rfc-editor.org/rfc/rfc8030
17. Thomson, M., Beverloo, P. „Voluntary Application Server Identification (VAPID) for Web Push“. RFC 8292, IETF, novembar 2017. https://www.rfc-editor.org/rfc/rfc8292
