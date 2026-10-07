# Razvoj višeplatformske aplikacije za kurseve korišćenjem web tehnologija

# 1. Uvod

## 1.1 Motivacija

Učenje se danas u velikoj meri odvija van učionice. Polaznik koji prati onlajn kurs ne sedi uvek za istim računarom: jednu lekciju pogleda na laptopu, sledeću na telefonu dok putuje, a test na kraju poglavlja reši na tabletu. Podaci o korišćenju weba potvrđuju da je ovakva raznolikost uređaja postala pravilo, a ne izuzetak. Prema servisu [Statcounter](https://gs.statcounter.com/platform-market-share/desktop-mobile-tablet/worldwide), u septembru 2026. godine mobilni uređaji činili su 58.99% svetskog web saobraćaja, desktop računari 39.26%, a tableti 1.76% [1]. Drugim rečima, aplikacija za učenje koja dobro radi samo na jednoj vrsti uređaja unapred gubi približno polovinu potencijalnih korisnika.

Iz ovoga proizlazi osnovni zahtev koji se postavlja pred savremenu platformu za kurseve: učenje treba da bude što pristupačnije, a to znači dostupno na što većem broju platformi — u pretraživaču na webu, telefonu i kao aplikaciji na mobilnom uređaju. Za razvojni tim, međutim, svaka dodatna platforma tradicionalno znači i dodatnu aplikaciju: posebnu web aplikaciju, posebnu aplikaciju za iOS pisanu u jeziku Swift i posebnu aplikaciju za Android pisanu u jeziku Kotlin. Tri odvojene kodne baze znače trostruko održavanje, trostruko ispravljanje grešaka i stalnu opasnost da se ponašanje aplikacije na različitim platformama vremenom razide.

Web tehnologije nude drugačiji put. Progresivna web aplikacija (eng. _Progressive Web App_ – PWA) je aplikacija napravljena standardnim web tehnologijama koja korisniku pruža iskustvo slično aplikaciji namenjenoj određenoj platformi: može se instalirati na uređaj, raditi bez interneta i primati direktna obaveštenja (push notifikacije) sa servera, a sve to iz jedne kodne baze [2]. Sa druge strane, React Native omogućava da se aplikacija piše u jeziku JavaScript ili TypeScript, u istom programskom modelu kao web biblioteka React, a da se korisnički interfejs iscrtava nativnim komponentama sistema Android i iOS [3]. Platforma Expo, izgrađena nad React Native-om, ide korak dalje i postavlja cilj da jedan JavaScript/TypeScript projekat radi nativno na Android-u, iOS-u i webu [4]. Ove tehnologije čine realnim da jedan programer ili mali tim razvije i održava aplikaciju za kurseve na svim značajnim platformama.

Pored dostupnosti, na način na koji se uči i na koji se pravi nastavni sadržaj snažno utiču još dva činioca. Prvi je provera znanja. Istraživanja iz kognitivne psihologije pokazuju da aktivno prisećanje gradiva kroz testiranje bolje učvršćuje znanje od ponovnog čitanja: u eksperimentu Roedigera i Karpickea studenti koji su gradivo ponavljali kroz testove posle nedelju dana su se sećali 61% teksta, u poređenju sa 40% kod studenata koji su tekst samo ponovo čitali [5]. Ovaj efekat testiranja (eng. _testing effect_) daje kvizima u kursu dvostruku ulogu: oni su način da polaznik proveri šta je naučio, ali i dodatna motivacija da nastavi dalje. Drugi činilac je veštačka inteligencija (VI), koja može pomoći na obe strane kursa: kreatoru pri pravljenju sadržaja i pitanja, a polazniku pri učenju.

## 1.2 Problem

Iz izloženog proizlazi problem kojim se ovaj rad bavi: kako razviti aplikaciju za onlajn kurseve koja je dostupna na webu, na iOS-u i na Android-u, a da se pri tome ne razvijaju i ne održavaju tri nezavisna sistema.

Problem ima nekoliko slojeva. Na nivou klijenta treba izabrati pristup višeplatformskom razvoju. Mogućnosti se kreću od potpuno nativnih aplikacija, preko hibridnih aplikacija koje web sadržaj prikazuju unutar nativnog okvira, do radnih okvira kao što je React Native i progresivnih web aplikacija. Svaki pristup drugačije odmerava količinu zajedničkog koda, performanse, pristup mogućnostima uređaja i način distribucije. Na nivou servera treba obezbediti jedan programski interfejs (eng. _Application Programming Interface_ – API) koji podjednako dobro opslužuje sve klijente. Na nivou organizacije koda treba odlučiti kako deliti tipove podataka, pravila validacije, pozive ka serveru, prevode i vizuelni identitet između klijenata, tako da promena na jednom mestu ne ostavi ostale delove sistema u nesaglasnom stanju.

Uz tehnički problem ide i funkcionalni. Aplikacija treba da pokrije ceo životni ciklus kursa: kreator pravi kurs sastavljen od tema i lekcija, dodaje video snimke, dokumente i kvizove i objavljuje ga, a polaznik pronalazi kurs, upisuje se, prati lekcije, rešava kvizove, prati sopstveni napredak i ocenjuje kurs. Sve ovo treba da bude dostupno na više platformi, dopunjeno obaveštenjima i podrškom veštačke inteligencije.

## 1.3 Cilj rada

Cilj rada je razvoj višeplatformske aplikacije za kurseve korišćenjem web tehnologija, kao i analiza i obrazloženje tehničkih odluka donetih tokom razvoja. Rad ima dve grupe ciljeva.

Ciljevi iz ugla tehnologije su:

- opisati različite pristupe razvoju višeplatformske aplikacije za učenje korišćenjem web tehnologija i uporediti njihove prednosti i nedostatke;
- obrazložiti izbor monorepo arhitekture, u kojoj se svi delovi sistema nalaze u jednom repozitorijumu koda;
- objasniti zašto je aplikacija organizovana na opisani način: zajednički paketi, jedan izvor istine za model podataka i slojevita serverska aplikacija;
- prikazati prednosti ovakvog pristupa, ali i njegova ograničenja.

Ciljevi iz ugla funkcionalnosti su:

- učiniti učenje što pristupačnijim, dostupnim u web pretraživaču na svim uređajima i kao nativna aplikacija na iOS-u i Android-u;
- iskoristiti veštačku inteligenciju kao pomoć i pri pravljenju kursa i pri učenju;
- uvesti kvizove kao način provere znanja i kao dodatnu motivaciju da polaznik nastavi i završi kurs.

## 1.4 Doprinos rada

Praktični doprinos rada je sistem _Course Hub_, realizovan kao monorepo sa jednom serverskom aplikacijom i dva klijenta. Serverska aplikacija, napisana u Node.js okruženju pomoću radnog okvira Express, izlaže REST (eng. _Representational State Transfer_) API opisan specifikacijom OpenAPI i koristi PostgreSQL bazu podataka. Web klijent je napravljen radnim okvirom Next.js i radi kao progresivna web aplikacija, sa mogućnošću instalacije i push obaveštenjima. Nativni klijent za iOS i Android napravljen je pomoću platforme Expo i React Native-a i koristi isti API.

Oba klijenta, kao i server, pisani su u jeziku TypeScript i dele zajedničke pakete: šeme i tipove podataka, klijent za API koji se automatski generiše iz OpenAPI specifikacije, obradu grešaka, prevode na srpski i engleski jezik i vrednosti dizajn tokena. Ideja monorepo pristupa, u kome se sav kod čuva u jednom repozitorijumu radi zajedničkog verzionisanja i lakše ponovne upotrebe koda, poznata je iz prakse velikih kompanija kao što je Google [6]. Rad pokazuje kako se ista ideja može primeniti u manjem projektu, uz savremene alate.

Funkcionalno, web aplikacija pokriva ceo životni ciklus kursa, i za kreatora i za polaznika. Nativna aplikacija u trenutnoj fazi razvoja pokriva iskustvo polaznika: prijavu, katalog kurseva, čitanje lekcija, video snimke, praćenje napretka, kvizove i recenzije. Veštačka inteligencija je u sistem uključena na dva načina. Kreator može da zatraži od jezičkog modela Claude predlog pitanja za kviz na osnovu naziva i opisa lekcije. Pored toga, sistem izlaže MCP server (eng. _Model Context Protocol_) preko koga asistenti zasnovani na VI mogu da prave nacrte kurseva u ime kreatora, a polaznici mogu da koriste sadržaj kurseva na koje su upisani, ukoliko je kreator to dozvolio.

Pored samog sistema, doprinos rada je i analiza: uporedni prikaz pristupa višeplatformskom razvoju, obrazloženje arhitektonskih odluka i procena koliki deo koda je zaista moguće deliti između web i nativnog klijenta, a koji deo mora ostati specifičan za platformu.

## 1.5 Organizacija rada

Rad je organizovan u četrnaest poglavlja. Nakon uvoda, u drugom poglavlju opisane su postojeće platforme za onlajn kurseve i različiti pristupi razvoju višeplatformskih aplikacija, uz njihovo poređenje i pozicioniranje ovog rada. U trećem poglavlju predstavljene su tehnologije korišćene u radu, od jezika TypeScript i specifikacije OpenAPI, preko serverskih tehnologija i baze podataka, do radnih okvira Next.js i React Native, progresivnih web aplikacija i alata za upravljanje monorepom.

Četvrto poglavlje sadrži analizu zahteva: aktere sistema, funkcionalne i nefunkcionalne zahteve i slučajeve korišćenja. U petom poglavlju opisano je projektovanje sistema: arhitektura, model podataka, organizacija serverske aplikacije, autentifikacija i tok podataka od šeme baze do klijenata. Šesto poglavlje posvećeno je ponovnoj upotrebi koda između platformi: šta klijenti dele, šta mora biti posebno za svaku platformu i koliko je koda zaista zajedničko.

Sedmo i osmo poglavlje opisuju implementaciju: sedmo serverski deo i web aplikaciju, a osmo nativnu aplikaciju. U devetom poglavlju prikazana je integracija veštačke inteligencije, a u desetom rad aplikacije kroz snimke ekrana na različitim platformama. Jedanaesto poglavlje opisuje način na koji je sistem proveravan, a dvanaesto postavljanje sistema u produkciju. U trinaestom poglavlju diskutovani su rezultati, ograničenja sistema i pravci daljeg razvoja, dok četrnaesto poglavlje sadrži zaključak rada.

# 2. Problem i srodna rešenja

U ovom poglavlju prvo su prikazane postojeće platforme za onlajn kurseve i način na koji su dostupne na različitim uređajima. Zatim su opisani pristupi razvoju višeplatformskih aplikacija, onako kako ih klasifikuje i poredi naučna literatura, uz posebno razmatranje ograničenja progresivnih web aplikacija na operativnom sistemu iOS. Poglavlje se završava uporednom tabelom pristupa i pozicioniranjem ovog rada u odnosu na njih.

## 2.1 Platforme za onlajn kurseve

Platforme za onlajn učenje mogu se podeliti prema tome ko ih koristi i ko pravi sadržaj. Sistemi za upravljanje učenjem (eng. _Learning Management System_ – LMS), kao što su Moodle i Canvas, instalira i održava obrazovna institucija, a sadržaj prave njeni nastavnici. Moodle mobilna aplikacija zato nije samostalan proizvod, već klijent koji se povezuje na Moodle sajt određene institucije [7]. Masovni otvoreni onlajn kursevi (eng. _Massive Open Online Course_ – MOOC), kakve nude Coursera i edX, okupljaju sadržaj univerziteta i kompanija na jednoj platformi. Coursera je u godišnjem izveštaju za 2025. godinu prijavila približno 197 miliona registrovanih polaznika i sadržaj više od 200 univerziteta i 175 kompanija [8]. Udemy je tržište (eng. _marketplace_) na kome kurseve objavljuju nezavisni instruktori; od 11. maja 2026. godine posluje kao podružnica u potpunom vlasništvu kompanije Coursera [9]. Teachable je platforma za kreatore, koji na njoj vode sopstvene „škole“ i prodaju kurseve pod svojim imenom [10].

Iako se razlikuju po modelu, sve navedene platforme imaju isti raspored klijenata: web aplikaciju kao potpuni klijent i zvanične aplikacije za iOS i Android. Mobilne aplikacije su pretežno namenjene praćenju sadržaja, a njihova ključna dodatna funkcija je učenje bez internet konekcije. Moodle aplikacija automatski kešira sadržaj i omogućava ručno preuzimanje celih kurseva unapred [7]. Coursera ističe preuzimanje kurseva kao podršku polaznicima sa ograničenim ili isprekidanim pristupom internetu [8]. edX aplikacija omogućava preuzimanje video snimaka, ali ne i polaganje vremenski ograničenih i nadgledanih ispita, koji ostaju na webu [11]. Teachable iOS aplikacija podržava preuzimanje lekcija i rešavanje kvizova, ali se u kurs ne može upisati iz same aplikacije [10]. Iz ovoga se vidi obrazac: web ostaje mesto za sve funkcionalnosti, dok mobilne aplikacije pokrivaju najčešći scenario, a to je učenje u pokretu.

Tehnologija na kojoj su mobilne aplikacije napravljene pouzdano se može utvrditi samo za aplikacije otvorenog koda. Moodle aplikacija je hibridna aplikacija napravljena pomoću radnih okvira Angular i Ionic, a u aplikacije za Android i iOS prevodi se pomoću alata Cordova [7]; to potvrđuju i zavisnosti u njenom izvornom kodu [12]. Canvas je suprotan primer: aplikacija za Android pisana je u jezicima Java i Kotlin [13], a aplikacija za iOS u jeziku Swift, pri čemu se raniji React Native kod postepeno uklanja [14]. Za aplikacije platformi Coursera, Udemy, Teachable i edX.org nije pronađen primarni izvor o korišćenoj tehnologiji, pa se o njima u ovom radu ne iznose tvrdnje. Već ova dva primera pokazuju da platforme za kurseve isti problem rešavaju na suprotne načine: jedna bira web tehnologije unutar nativnog okvira, a druga potpuno nativni razvoj za svaku platformu.

Veštačka inteligencija je postala deo i ovih platformi. Moodle od verzije 4.5 ima podsistem za VI sa priključcima za različite pružaoce jezičkih modela [15], a Coursera nudi asistenta Coursera Coach, koji polazniku postavlja pitanja za vežbu pre kviza i vodi ga kroz gradivo [8]. To potvrđuje da su i kvizovi i VI deo savremenog očekivanja od platforme za kurseve, a ne dodatak.

## 2.2 Pristupi višeplatformskom razvoju

Problem razvoja aplikacije za više platformi star je koliko i pametni telefoni, pa postoji obimna literatura koja pristupe klasifikuje i poredi. Heitkötter, Hanschke i Majchrzak su 2012. godine dali jedan od prvih široko korišćenih okvira za ocenjivanje, sa kriterijumima podeljenim u dve perspektive: infrastrukturnu (podržane platforme, pristup mogućnostima uređaja, izgled i osećaj korišćenja, brzina, distribucija) i razvojnu (razvojno okruženje, održivost, cena razvoja) [16]. El-Kassas i saradnici su 2017. godine objavili detaljnu taksonomiju pristupa sa stanovišta tehnike implementacije [17]. Za ovaj rad je najpogodnija taksonomija iz preglednog rada Biørn-Hansena, Grønlija i Ghinee u časopisu _ACM Computing Surveys_, koja razlikuje pet kategorija: hibridni, interpretirani, unakrsno kompajlirani, modelom vođeni pristup i progresivne web aplikacije [18]. Uz njih se kao polazne tačke za poređenje posmatraju potpuno nativne aplikacije i obične web aplikacije. U nastavku su ukratko opisani pristupi relevantni za ovaj rad; modelom vođeni pristup, u kome se aplikacija generiše iz apstraktnog modela, uglavnom je predmet akademskih istraživanja i ovde se ne razmatra.

**Nativni pristup.** Za svaku platformu piše se posebna aplikacija u njenom jeziku i sa njenim alatima: Swift i Xcode za iOS, Kotlin i Android Studio za Android. Ovakva aplikacija ima potpun pristup mogućnostima uređaja i izgled koji u potpunosti odgovara platformi, ali zahteva zasebnu kodnu bazu i zasebna znanja za svaku platformu. Razvoj za iOS uz to zahteva računar sa operativnim sistemom macOS [16].

**Web aplikacije i progresivne web aplikacije.** Aplikacija se piše jednom, standardnim web tehnologijama, i radi u svakom pretraživaču. Distribucija je najjednostavnija moguća: korisnik otvara adresu i uvek dobija najnoviju verziju, bez prolaska kroz prodavnice aplikacija [16]. Progresivna web aplikacija dodaje mogućnost instalacije na uređaj, rad bez internet konekcije pomoću servisnog radnika (eng. _service worker_) i push obaveštenja [2]. Majchrzak, Biørn-Hansen i Grønli su 2018. godine PWA prvi put analizirali kao zaseban višeplatformski pristup i na pitanje iz naslova rada, da li je to „konačni“ pristup višeplatformskom razvoju, odgovorili oprezno: PWA teško može postati objedinjujuće rešenje dok ga iOS ne podržava u punoj meri [19]. Kako se ta podrška od tada razvijala, prikazano je u odeljku 2.2.1.

**Hibridni pristup.** Aplikacija se piše web tehnologijama, ali se isporučuje upakovana u nativni projekat, u kome se korisnički interfejs prikazuje unutar ugrađene komponente pretraživača (eng. _WebView_). Pristup mogućnostima uređaja ostvaruje se preko posrednika (mosta) i priključaka [18]. Predstavnici ovog pristupa su Apache Cordova i njegov naslednik Capacitor, koji se opisuje kao nativno okruženje za izvršavanje web aplikacija sa priključcima pisanim u jezicima Swift i Java [20]. Moodle aplikacija, opisana u prethodnom odeljku, primer je ovog pristupa. Heitkötter i saradnici su zaključili da je hibridni pristup upotrebljiv kada se može odreći izgleda koji u potpunosti odgovara nativnom [16].

**Interpretirani pristup.** Kod se piše u jeziku JavaScript ili TypeScript i izvršava na uređaju, ali se korisnički interfejs ne iscrtava kao web stranica, već pomoću stvarnih nativnih komponenti platforme [18]. Najpoznatiji predstavnik je React Native. U klasičnoj arhitekturi React Native-a JavaScript kod je sa nativnim delom komunicirao preko asinhronog mosta koji je serijalizovao svaki poziv, što je bila glavna tačka kritike u literaturi. Od verzije 0.76, objavljene 23. oktobra 2024. godine, podrazumevano je uključena nova arhitektura: sprega JSI (eng. _JavaScript Interface_) omogućava direktne, sinhrone pozive nativnog koda iz JavaScript-a, Fabric je novi mehanizam za iscrtavanje, a TurboModules novi sistem nativnih modula koji se učitavaju po potrebi [21]. Pomoću sprege JSI JavaScript može da poziva metode C++ objekata bez troška serijalizacije [22].

**Unakrsno kompajlirani pristup.** Izvorni kod se prevodi u mašinski kod za svaku platformu, bez posrednika za izvršavanje. Najpoznatiji savremeni predstavnik je Flutter, koji koristi jezik Dart, sopstveni skup komponenti i sopstveni mehanizam za iscrtavanje, pa ne koristi nativne komponente platforme; pristup mogućnostima uređaja ostvaruje se preko kanala ka platformi ili direktnim pozivima nativnih biblioteka [23].

Empirijska poređenja performansi ne potvrđuju jednostavno pravilo da je nativna aplikacija uvek najbrža. Biørn-Hansen i saradnici su na šest Android uređaja i na osnovu 16.290 merenja utvrdili statistički značajan dodatni trošak kod većine radnih okvira u odnosu na nativnu aplikaciju, ali i da React Native u proseku koristi manje memorije od nativne aplikacije za isti zadatak, dok Flutter ima najveću potrošnju memorije u mirovanju, do deset puta veću od nativne [24]. Oliveira i saradnici su utvrdili da Flutter obično ima najmanji, a React Native najveći dodatni trošak u procesorski zahtevnim testovima, ali i da je u aplikaciji sa stalnim animacijama React Native trošio i do 96% manje energije od sledećeg najboljeg okvira; u polovini testova bar jedan radni okvir bio je bolji od nativne implementacije [25]. Horn i saradnici su merili web verzije deset servisa u pretraživaču i utvrdili da one troše oko 53% više energije i oko 49% više procesorskog vremena od nativnih aplikacija istih servisa [26], dok Malavolta i saradnici pokazuju da sam servisni radnik nema značajan uticaj na potrošnju energije progresivne web aplikacije [27]. Važno ograničenje ovih rezultata je da su svi dobijeni na Androidu i da se rezultati za React Native odnose na staru arhitekturu sa asinhronim mostom; nezavisna recenzirana merenja nove arhitekture u trenutku pisanja ovog rada nisu pronađena. Zaključak literature je zato da izbor pristupa zavisi od vrste aplikacije i zahteva, a ne od univerzalne prednosti jednog pristupa [28].

### 2.2.1 Progresivne web aplikacije na različitim platformama

Za aplikaciju za kurseve koja se oslanja na web tehnologije posebno je važno koliko progresivna web aplikacija zaista može da zameni nativnu aplikaciju na svakoj platformi. Odgovor se razlikuje po platformi, pre svega između Androida i desktop pretraživača, sa jedne strane, i iOS-a, sa druge.

**Instalacija.** Na Androidu pretraživač Chrome instalira PWA kao WebAPK, pravi Android paket koji se ponaša kao i druge instalirane aplikacije, a Chrome i Edge na desktop računarima nude instalaciju direktno iz adresne linije [29]. Aplikacija može sama da ponudi dugme za instalaciju preko događaja `beforeinstallprompt`, ali on postoji samo u pretraživačima zasnovanim na Chromium-u, dok ga Safari i Firefox ne podržavaju [30]. Na iOS-u korisnik mora sam da pronađe opciju „Add to Home Screen“ u meniju za deljenje. Od iOS-a i iPadOS-a 26 svaki sajt dodat na početni ekran podrazumevano se otvara kao web aplikacija [31], a na macOS-u je od verzije Safari 17 moguće dodati web aplikaciju u Dock [32]. Na Androidu se PWA može objaviti i u prodavnici Google Play pomoću mehanizma Trusted Web Activity (TWA) [33].

**Direktna (Push) obaveštenja.** Web Push je u pretraživaču Chrome dostupan od 2015. godine, uključujući i Chrome za Android, bez potrebe za instalacijom aplikacije [34]. Na iOS-u i iPadOS-u Web Push je uveden tek u verziji 16.4 (2023. godine) i to samo za web aplikacije dodate na početni ekran, a dozvola za obaveštenja mora se tražiti kao odgovor na radnju korisnika, na primer dodir dugmeta [35]. Od verzije iOS 18.4 postoji i deklarativni Web Push, koji ne zahteva servisnog radnika, ali ni tada nisu dozvoljena „tiha“ obaveštenja koja korisnik ne vidi [36]. Za aplikaciju za kurseve to znači da korisnik iPhone-a ne može da dobije obaveštenje o novom sadržaju kursa dok aplikaciju ne instalira ručno.

**Skladište i rad u pozadini.** Servisni radnik i keš skladište rade u svim savremenim pretraživačima, u Safari-ju na iOS-u od verzije 11.3 [37]. Međutim, mehanizam za sprečavanje praćenja u Safari-ju briše podatke koje je sajt sačuvao ako korisnik sedam dana korišćenja pretraživača nije bio u interakciji sa tim sajtom, pri čemu web aplikacije dodate na početni ekran imaju sopstveni brojač dana korišćenja [38]. Od verzije Safari 17 sajt može da koristi do 60% prostora na disku, a trajno čuvanje podataka odobrava se heuristički, na primer ako je sajt otvoren kao aplikacija sa početnog ekrana [39]. Pozadinska sinhronizacija i pozadinsko preuzimanje (Background Sync, Periodic Background Sync, Background Fetch) postoje samo u pretraživačima zasnovanim na Chromium-u [40]. Isto važi za pojedine mogućnosti uređaja: na primer, API za vibraciju (`navigator.vibrate`) Safari ne podržava [41].

**Zavisnost od odluka proizvođača.** Položaj PWA na iOS-u zavisi od odluka kompanije Apple, što je jasno pokazao događaj iz 2024. godine. U probnim verzijama iOS-a 17.4 Apple je u Evropskoj uniji uklonio web aplikacije sa početnog ekrana, obrazlažući to obavezama iz Zakona o digitalnim tržištima (eng. _Digital Markets Act_ – DMA) [42] i malim brojem korisnika ove funkcije. Posle kritika, Apple je 1. marta 2024. godine odluku povukao [43, 44]. Formalno, nijedna od ključnih specifikacija na kojima PWA počiva još nije dobila status preporuke konzorcijuma W3C: manifest web aplikacije i Push API su radni nacrti, a specifikacija servisnih radnika je nacrt kandidata za preporuku [45, 46, 47]. Sam protokol za isporuku push poruka i identifikacija aplikacionog servera (VAPID) su, sa druge strane, standardi organizacije IETF [48, 49].

## 2.3 Uporedni prikaz pristupa

Tabela 2.1 sažima poređenje pristupa po kriterijumima važnim za aplikaciju za kurseve. Podaci o performansama odnose se na merenja na Androidu; za iOS uporediva akademska merenja nisu pronađena.

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

Iz prethodnih odeljaka proizlazi da nijedan pristup ne dominira po svim kriterijumima. Progresivna web aplikacija je najbolji izbor za distribuciju i deljenje koda i na Androidu i desktop računarima pruža iskustvo blisko instaliranoj aplikaciji. Njena uska grla nisu u performansama, već u ograničenjima koja postavlja platforma iOS: ručna instalacija, push obaveštenja tek posle instalacije, izostanak pozadinske sinhronizacije i neizvesnost koju je pokazao događaj sa DMA. Sa druge strane, React Native omogućava nativnu aplikaciju za iOS i Android u istom jeziku i istom programskom modelu (React) u kome je napisan i web klijent.

Ovaj rad zato ne bira jedan pristup, već kombinaciju dva, nad zajedničkom osnovom. Web klijent sistema Course Hub je progresivna web aplikacija napravljena radnim okvirom Next.js i pokriva sve pretraživače, na računaru i na telefonu. Nativni klijent je napravljen pomoću platforme Expo i React Native-a i namenjen je iOS-u i Android-u, gde nativna aplikacija može da prevaziđe ograničenja web platforme. Oba klijenta koriste isti API i dele pakete sa tipovima, šemama za validaciju, generisanim klijentom za API, prevodima i vrednostima dizajn tokena. Na taj način se cena druge kodne baze, koju literatura od Heitköttera i saradnika navodi kao glavni trošak višeplatformskog razvoja [16], svodi na ono što je zaista specifično za platformu: navigaciju, prikaz i pristup mogućnostima uređaja. Na primer, web klijent za vibraciju pri predaji kviza koristi `navigator.vibrate`, koji iOS ne podržava, dok nativni klijent za istu namenu koristi modul `expo-haptics`. Koliki deo koda je na ovaj način zaista zajednički, analizirano je u poglavlju 6.

U trenutnoj fazi razvoja nativni klijent pokriva iskustvo polaznika, dok su funkcionalnosti za kreatora kursa dostupne samo u web klijentu. Nativna push obaveštenja, koja bi na iOS-u zaobišla ograničenje Web Push-a, planirana su, ali još nisu implementirana; ova ograničenja su detaljnije razmotrena u poglavlju 13.

# 3. Korišćene tehnologije

Tehnologije sistema Course Hub nisu nezavisan spisak alata, već lanac u kome jedna definicija podataka putuje od baze do oba klijenta. Tabele baze podataka opisane su u biblioteci Drizzle ORM, iz njih se izvode šeme za validaciju u biblioteci Zod, iz tih šema se generiše OpenAPI specifikacija serverskog API-ja, a iz specifikacije alat Orval generiše funkcije za pozive API-ja koje koriste i web i nativni klijent. Poglavlje prati taj lanac: prvo su opisani jezik i sredstva za opis ugovora između servera i klijenata, zatim serverske tehnologije i baza podataka, pa klijentske tehnologije i, na kraju, alati za upravljanje monorepom.

Tabela 3.1 daje pregled tehnologija po slojevima sistema.

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

U nastavku poglavlja svaka od ovih tehnologija opisana je zasebno.

## 3.1 TypeScript i Zod

### 3.1.1 TypeScript

TypeScript je programski jezik kompanije Microsoft koji jeziku JavaScript dodaje statički sistem tipova, a zadržava sve njegove mogućnosti [50]. Tipovi se u TypeScript-u porede strukturno: dva tipa su saglasna ako vrednosti imaju isti oblik, bez obzira na to kako su tipovi imenovani [50]. Kod se pre izvršavanja prevodi u JavaScript, pa se greške u tipovima otkrivaju u toku razvoja, a ne kod korisnika. Najnovija verzija jezika je 7.0, objavljena 8. jula 2026. godine, prva sa kompajlerom prepisanim u jeziku Go; verzija 6.0 iz marta 2026. poslednja je zasnovana na prethodnoj implementaciji [51]. Course Hub koristi TypeScript 5.8 u serverskoj i web aplikaciji i TypeScript 6.0 u nativnoj aplikaciji. Za ovaj rad TypeScript je presudan jer je jedini jezik u celom sistemu: isti tipovi opisuju podatke u bazi, na serveru i u oba klijenta.

### 3.1.2 Zod

Tipovi TypeScript-a, međutim, postoje samo u toku prevođenja. Podaci koji stižu preko mreže, na primer telo HTTP zahteva, mogu biti bilo šta, pa ih je potrebno proveriti u toku izvršavanja. Za to služi biblioteka Zod, koja se opisuje kao biblioteka za validaciju šema zasnovana na TypeScript-u, sa statičkim zaključivanjem tipova [52]. Šema se definiše jednom; metoda `.parse()` proverava nepoznate podatke, a TypeScript tip se iz šeme izvodi automatski, pa se validacija i tip ne mogu razići. Verzija Zod 4 donela je znatno brže parsiranje (npr. 14,7 puta brže za niske i 6,5 puta brže za objekte u odnosu na Zod 3), 2,3 puta manji paket i ugrađeno pretvaranje šema u format JSON Schema [53]. U sistemu Course Hub sve šeme zahteva i odgovora nalaze se u zajedničkom paketu `@repo/contract`, koji koriste i server i oba klijenta.

## 3.2 REST, OpenAPI i generisanje klijenta

### 3.2.1 REST

Serverski API sistema Course Hub oblikovan je prema arhitektonskom stilu REST, koji je Roy Fielding definisao u doktorskoj disertaciji 2000. godine [54]. REST propisuje ograničenja: razdvajanje klijenta i servera, komunikaciju bez čuvanja stanja na serveru (eng. _stateless_), mogućnost keširanja odgovora, uniformni interfejs zasnovan na resursima, slojevit sistem i opciono preuzimanje koda sa servera [54]. Course Hub poštuje razdvajanje klijenta i servera, komunikaciju bez stanja (svaki zahtev nosi sopstveni token) i uniformni interfejs sa resursima kao što su `/v1/courses` i standardnim HTTP metodama.

### 3.2.2 OpenAPI

Da bi različiti klijenti mogli pouzdano da koriste isti API, API mora biti opisan u obliku koji mogu da čitaju i ljudi i alati. Specifikacija OpenAPI definiše standardan opis HTTP API-ja nezavisan od programskog jezika; verzija 3.1.0 objavljena je 15. februara 2021. godine pod okriljem organizacije OpenAPI Initiative, koja deluje u okviru Linux fondacije [55]. Takav opis mogu da koriste alati za generisanje dokumentacije, koji prikazuju sve putanje, parametre i šeme zahteva i odgovora, zatim alati za generisanje servera i klijenata u različitim programskim jezicima, kao i alati za testiranje [55]. Za ovaj rad je bitno to što je šema podataka u OpenAPI 3.1 usklađena sa standardom JSON Schema, pa se Zod šeme u nju preslikavaju gotovo bez gubitaka. U sistemu Course Hub opis API-ja se ne piše ručno: biblioteka `@asteasolutions/zod-to-openapi` registruje svaku putanju u kodu (`registry.registerPath`) na osnovu istih Zod šema koje server koristi za validaciju, a zatim generiše dokument `openapi.json` u formatu OpenAPI 3.1 [56]. Course Hub taj dokument za sada koristi samo za generisanje klijenta za API (odeljak 3.2.3), ali bi on mogao da posluži i kao osnova za dokumentaciju API-ja koja bi, pošto nastaje iz koda, uvek odgovarala stvarnom ponašanju servera.

### 3.2.3 Orval

Iz dokumenta `openapi.json` alat Orval generiše klijent za API: tipizovane funkcije i React hook-ove za svaku putanju [57]. Generisani kod nalazi se u paketu `@repo/api-client` i ne menja se ručno, već se posle svake promene API-ja ponovo generiše. Rezultat ovog lanca je da promena Zod šeme na serveru, posle ponovnog generisanja klijenta, postaje greška u tipovima u svakom delu web ili nativnog klijenta koji tu šemu koristi, pre nego što kod stigne do korisnika.

### 3.2.4 TanStack Query

Hook-ovi koje generiše Orval koriste biblioteku TanStack Query, koja upravlja „serverskim stanjem“: dohvatanjem, keširanjem, sinhronizacijom i osvežavanjem podataka sa servera, uz uklanjanje dupliranih zahteva i osvežavanje u pozadini [58]. Komponente zbog toga ne moraju same da vode računa o učitavanju, greškama i zastarelim podacima, već samo pozivaju odgovarajući hook.

### 3.2.5 Axios

Sami HTTP zahtevi šalju se bibliotekom Axios, HTTP klijentom zasnovanim na obećanjima (eng. _promise_) za pretraživač i Node.js, koji podržava presretače zahteva i odgovora [59]. U Course Hub-u presretač automatski dodaje pristupni token svakom zahtevu i osvežava ga kada istekne.

## 3.3 Serverske tehnologije i baza podataka

### 3.3.1 Node.js

Server je napisan za Node.js, asinhrono okruženje za izvršavanje JavaScript-a vođeno događajima, u kome gotovo nijedna funkcija ne obavlja ulazno-izlazne operacije blokirajući proces [60]. Svaka glavna verzija Node.js-a šest meseci je aktuelna, a zatim prelazi u fazu dugoročne podrške (eng. _Long-Term Support_ – LTS); u septembru 2026. godine verzije 22 i 24 su LTS verzije [61], pa uslov projekta da se koristi Node.js 22 ili noviji obuhvata sve podržane linije.

### 3.3.2 Express

HTTP server je napravljen pomoću radnog okvira Express 5, zvanično predstavljenog 15. oktobra 2024. godine [62]. Za ovaj rad je najvažnija novina Express-a 5 to što se greške iz asinhronih funkcija za obradu zahteva automatski prosleđuju centralnom mehanizmu za obradu grešaka [62]. Zahvaljujući tome, servisi sistema Course Hub mogu da bacaju tipizovane greške (npr. `NotFoundError`), koje jedan zajednički međusloj (eng. _middleware_) pretvara u JSON odgovor sa odgovarajućim HTTP statusom.

### 3.3.3 Pino

Za beleženje događaja na serveru (eng. _logging_) koristi se biblioteka Pino, koja se opisuje kao veoma brz alat za beleženje u Node.js-u koji zapise piše u formatu JSON [63]. Zapisi u formatu JSON su strukturisani, pa se mogu pretraživati i filtrirati po poljima. Obrada i slanje zapisa, na primer njihovo formatiranje za čitanje u terminalu, izvršavaju se u transportima, koji od verzije 7 rade u zasebnoj niti (eng. _worker thread_), pa ne opterećuju glavnu nit koja obrađuje zahteve [64]. Svaki HTTP zahtev beleži se pomoću biblioteke `pino-http`, koja uz zahtev zapisuje i statusni kod i vreme odgovora [65]. U sistemu Course Hub svaki zahtev dobija jedinstveni identifikator, koji se klijentu vraća u zaglavlju `X-Request-Id`, odgovori sa statusom 4xx beleže se kao upozorenja, a odgovori sa statusom 5xx kao greške, dok se kolačići iz zaglavlja ne upisuju u zapise. U razvoju se zapisi prikazuju u čitljivom obliku pomoću transporta `pino-pretty`, a u produkciji ostaju u formatu JSON.

### 3.3.4 PostgreSQL

Podaci se čuvaju u sistemu PostgreSQL, objektno-relacionoj bazi podataka otvorenog koda koja koristi i proširuje jezik SQL i koja je u skladu sa svojstvima ACID od 2001. godine [66]. Pored relacionih tabela za kurseve, teme, lekcije, upise i napredak, Course Hub koristi i tip `jsonb` za pitanja u kvizovima. Ovaj tip čuva JSON podatke u binarnom obliku, brže se obrađuje od tipa `json` i podržava indeksiranje, zbog čega ga dokumentacija preporučuje za većinu aplikacija [67].

### 3.3.5 Supabase

Baza je hostovana na platformi Supabase, gde je svaki projekat potpuna PostgreSQL baza, uz dodatne servise kao što su autentifikacija i skladište [68]. Course Hub od Supabase-a koristi bazu i servis za autentifikaciju. Posle prijave, korisnik dobija kratkotrajni pristupni token u formatu JSON Web Token (JWT), koji podrazumevano važi jedan sat, i token za osvežavanje koji se može iskoristiti samo jednom [69]. JWT je standard organizacije IETF za kompaktno prenošenje tvrdnji (eng. _claims_) između dve strane, zaštićenih digitalnim potpisom [70]. Supabase-ov JWT nosi tvrdnje kao što su identifikator korisnika i vreme isteka, a server ga proverava javnim ključem [71]. Na tome radi međusloj `handleAuth`, koji proverava token na svakoj privatnoj ruti API-ja.

### 3.3.6 Drizzle ORM

Pristup bazi ostvaren je bibliotekom Drizzle ORM, koja se opisuje kao TypeScript alat za objektno-relaciono mapiranje (eng. _Object-Relational Mapping_ – ORM) bez dodatnih zavisnosti, sa upitima koji verno prate SQL [72]. Šema baze piše se u TypeScript-u, a alat `drizzle-kit` iz nje generiše SQL migracije [73]. Za ovaj rad je ključna biblioteka `drizzle-zod`, koja iz definicije tabele automatski izvodi Zod šeme za čitanje i upis podataka [74]. Tako definicija tabele u paketu `@repo/db-schema` postaje jedini izvor istine: iz nje nastaju i baza (migracijama) i šeme za validaciju u paketu `@repo/contract`, a iz tih šema OpenAPI opis i klijent za API. Treba napomenuti da Drizzle još nije dostigao verziju 1.0; projekat koristi stabilnu liniju 0.45, dok je verzija 1.0 u fazi kandidata za izdanje [75].

### 3.3.7 Cloudflare Stream

Video snimci lekcija čuvaju se i isporučuju pomoću servisa Cloudflare Stream, koji video automatski kodira u više kvaliteta i isporučuje ga adaptivnim protokolima HLS (eng. _HTTP Live Streaming_) i DASH (eng. _Dynamic Adaptive Streaming over HTTP_) [76]. Kreator kursa video otprema direktno na Cloudflare, preko jednokratne adrese koju mu izda server, pa video ne prolazi kroz server sistema Course Hub [77]. Kada se obrada videa završi, Cloudflare o tome obaveštava server pozivom (eng. _webhook_) potpisanim HMAC-SHA256 potpisom, koji server proverava nad izvornim telom zahteva [78].

### 3.3.8 Cloudflare R2

Ostali fajlovi (dokumenti lekcija i naslovne slike kurseva) čuvaju se u objektnom skladištu Cloudflare R2, koje ne naplaćuje odlazni saobraćaj [79]; klijent im pristupa preko privremenih potpisanih adresa (eng. _presigned URL_) [80].

## 3.4 React i Next.js

### 3.4.1 React

React je JavaScript biblioteka kompanije Facebook (danas Meta) za izradu korisničkih interfejsa od komponenti za višekratnu upotrebu, koje opisuju kako interfejs izgleda za dato stanje [81]. React ne menja objektni model dokumenta (eng. _Document Object Model_ – DOM) direktno, već koristi virtuelni DOM (eng. _virtual DOM_), prikaz interfejsa koji se čuva u memoriji: pri promeni podataka poredi novi virtuelni DOM sa prethodnim i u stvarni DOM upisuje samo razlike, a taj postupak se naziva usklađivanje (eng. _reconciliation_) [81, 82]. Komponente su funkcije koje interfejs opisuju u sintaksi JSX (eng. _JavaScript XML_), sličnoj HTML-u, a podatke primaju preko svojstava (eng. _props_) i čuvaju u stanju (eng. _state_) [83]. Oba klijenta sistema Course Hub koriste React, pa dele isti programski model, iako web klijent iscrtava HTML elemente, a nativni klijent nativne komponente platforme.

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

Nativni klijent koristi biblioteku NativeWind, koja omogućava da se React Native komponente stilizuju istim Tailwind klasama [96]. Stabilna verzija NativeWind 4 zahteva Tailwind CSS 3 [96], pa sistem namerno koristi dve glavne verzije Tailwind-a: verziju 4 na webu i verziju 3 na nativnoj platformi. Zajedničke su im samo vrednosti dizajn tokena (boje, razmaci, zaobljenja) iz paketa `@repo/ui-theme`, pa obe aplikacije imaju isti vizuelni identitet iako se komponente razlikuju. Ovo je primer ograničenja deljenja koda o kome će biti reči u poglavlju 6.

### 3.7.4 i18next

Obe aplikacije su prevedene na srpski i engleski jezik pomoću biblioteke i18next, radnog okvira za internacionalizaciju JavaScript aplikacija koji podržava množinu, kontekst i umetanje vrednosti u tekst [97]. Prevodi se nalaze u zajedničkom paketu `@repo/i18n`, sa posebnom konfiguracijom za web i za nativnu aplikaciju, pa se isti ključ prevoda koristi na obe platforme.

## 3.8 Monorepo: pnpm i Turborepo

Monorepo je repozitorijum koda koji sadrži više zasebnih projekata sa jasno definisanim međusobnim odnosima, koji se mogu nezavisno graditi i postavljati u produkciju, ali se čuvaju i verzionišu zajedno [98]. Najpoznatiji primer je Google, čija se baza koda, koju koriste desetine hiljada programera, čuva u jednom repozitorijumu [6]. Istraživanja kao prednosti monorepa navode bolju vidljivost koda, lakšu ponovnu upotrebu, jednostavnije upravljanje zavisnostima i koordinisane izmene u više projekata, a kao nedostatke slabiju kontrolu pristupa i potrebu ulaganja u alate; kako nije pronađena recenzirana studija koja kvantitativno dokazuje prednost jednog pristupa, izbor monorepa u ovom radu je obrazložena inženjerska odluka [99, 100, 101]. Za Course Hub je ključno to što promena šeme u paketu `@repo/contract` u istom commit-u stiže do servera, generisanog klijenta za API i oba klijenta, dok bi u sistemu sa više repozitorijuma zajednički paketi morali da se objavljuju i verzionišu, pa bi klijenti mogli da koriste međusobno nesaglasne verzije ugovora. Nedostaci koje literatura navodi u projektu ove veličine nisu izraženi, a potrebu za alatima pokrivaju pnpm i Turborepo.

### 3.8.1 pnpm

pnpm je menadžer paketa koji svaki paket čuva samo jednom na disku, u skladištu adresiranom po sadržaju, i u projekte ga povezuje tvrdim vezama; u direktorijum `node_modules` stavlja samo direktne zavisnosti, pa kod ne može slučajno da koristi paket koji nije deklarisao [102]. Radni prostor (eng. _workspace_) se definiše fajlom `pnpm-workspace.yaml`, a interni paketi se referenciraju protokolom `workspace:*`, koji se uvek razrešava na lokalni paket [103]. Course Hub koristi pnpm 11. Zbog nativne aplikacije, čiji alat za pakovanje koda (Metro) očekuje klasičnu strukturu direktorijuma `node_modules`, projekat koristi opciju `nodeLinker: hoisted`, što je svesni kompromis u odnosu na podrazumevanu strogu strukturu.

### 3.8.2 Turborepo

Turborepo je sistem za izgradnju projekata u JavaScript-u i TypeScript-u, napisan u jeziku Rust, koji razvija kompanija Vercel [104]. U fajlu `turbo.json` definišu se zadaci (izgradnja, provera tipova, lint) i njihove zavisnosti, pri čemu oznaka `^build` znači da se pre izgradnje paketa moraju izgraditi paketi od kojih on zavisi [105]. Rezultati zadataka keširaju se prema hešu ulaznih fajlova, pa se zadatak čiji se ulazi nisu promenili ne izvršava ponovo [106]. U kontinuiranoj integraciji Course Hub-a komanda `pnpm turbo build --filter=api...` gradi samo serversku aplikaciju i interne pakete od kojih ona zavisi. Alternativa Turborepo-u je Nx, koji nudi graf projekata i dodatke za različite tehnologije [107]; Turborepo je izabran zbog jednostavnosti, jer se oslanja na postojeće skripte u fajlovima `package.json`.
