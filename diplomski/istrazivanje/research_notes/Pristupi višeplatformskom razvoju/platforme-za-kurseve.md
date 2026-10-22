# Postojeće platforme za onlajn učenje i klijentske platforme na kojima rade

Stanje na dan 30.09.2026. Svi izvori su otvoreni 30.09.2026. osim tamo gde je izričito naznačeno "(nije otvoreno)". Sažetke je u beleške preneo alat za preuzimanje stranica (WebFetch), pa bi doslovne citate trebalo proveriti pre nego što se stave u rad.

## Kategorija platformi i ko kreira sadržaj

### Takeaway
Moodle i Canvas su LMS sistemi (institucija i nastavnik kreiraju sadržaj). Coursera i edX su MOOC platforme sa sadržajem univerziteta i kompanija. Udemy je tržište (marketplace) nezavisnih instruktora, a od 11.05.2026. je u vlasništvu Coursera. Teachable je platforma za kreatore koji prave sopstvene "škole". Khan Academy je neprofitna organizacija koja sama pravi sadržaj.

### Cited Findings
- **Moodle**: zvanična mobilna aplikacija je klijent za Moodle sajt; traži Moodle 3.5 ili noviji na strani servera. Dakle, Moodle je LMS koji institucija sama instalira i hostuje. — [Moodle HQ, "Moodle App Overview", moodledev.io](https://moodledev.io/general/app/overview)
- **Coursera**: "approximately 197 million learners from over 230 countries and territories as of December 31, 2025". Sadržaj pravi "more than 200 universities and 175 industry leaders". Katalog ima 13.500+ kurseva, 1.900+ specijalizacija i 185+ sertifikata (stanje 31.12.2025). — [Coursera, Inc., Form 10-K za fiskalnu 2025, SEC EDGAR](https://www.sec.gov/Archives/edgar/data/1651562/000165156226000015/cour-20251231.htm)
- Coursera 10-K navodi i 54,4 miliona upisa na kurseve u 2025 (+10% u odnosu na 2024) i 657 miliona pogledanih predavanja (+12%). Ove brojke su iz sažetka pretrage za isti 10-K. Stranicu sam otvorio, ali prompt nije izvukao baš ove brojke, pa ih pre citiranja treba proveriti u dokumentu. — [Coursera 10-K FY2025](https://www.sec.gov/Archives/edgar/data/1651562/000165156226000015/cour-20251231.htm)
- **Udemy → Coursera**: Coursera je 17.12.2025. pristala da preuzme Udemy transakcijom isključivo u akcijama (0,800 akcija Coursera za svaku akciju Udemy). — [Coursera 10-K FY2025](https://www.sec.gov/Archives/edgar/data/1651562/000165156226000015/cour-20251231.htm)
- "on May 11, 2026, we completed our combination with Udemy, Inc." Udemy nastavlja kao "wholly owned subsidiary" kompanije Coursera. — [Coursera, Inc., Form 8-K/A, 11.05.2026, SEC EDGAR](https://www.sec.gov/Archives/edgar/data/0001651562/000165156226000050/cour-20260511.htm)
- Brojke za spojenu kompaniju (290+ miliona polaznika, 95.000 kreatora sadržaja) i to da obe platforme posle spajanja rade odvojeno nađene su samo u sekundarnoj vesti (letsdatascience.com, nije otvoreno). Ne koristiti ih bez provere u primarnom izvoru.
- **edX**: aplikacije služe za upis na kurseve i praćenje kurseva sa Open edX platforme. edX koristi Open edX, platformu otvorenog koda. — [edX / Open edX, "If You Use the edX Mobile App", Open edX Learner's Guide, edx.readthedocs.io](https://edx.readthedocs.io/projects/open-edx-learner-guide/en/latest/SFD_mobile.html)
- **Teachable**: kreator ima svoju "školu", a polaznik se u aplikaciju prijavljuje emailom koji koristi za svoju Teachable školu (ili škole). Na iOS aplikaciji "You cannot register for courses from the iOS app". — [Teachable, "Use the iOS App as a Student", support.teachable.com](https://support.teachable.com/en/articles/11682426-use-the-ios-app-as-a-student)
- **Canvas (Instructure)**: postoje zasebne aplikacije Student, Teacher i Parent, što odgovara ulogama u LMS-u. — [Instructure, canvas-android, GitHub](https://github.com/instructure/canvas-android)
- **Khan Academy**: Khanmigo je "from trusted education nonprofit Khan Academy". — [Khan Academy, Khanmigo, khanmigo.ai (marketinška stranica)](https://www.khanmigo.ai/)

### Inferences
- Za rad je korisna ova podela: LMS koji instalira sama institucija (Moodle, Canvas), MOOC sa partnerskim institucijama (Coursera, edX), marketplace (Udemy), platforma za kreatore (Teachable) i neprofitna organizacija koja sama pravi sadržaj (Khan Academy). Course Hub, sa kreatorima kurseva i polaznicima, najviše liči na marketplace i model za kreatore.
- Spajanje Coursera i Udemy pokazuje da se tržište ukrupnjava. Ovo je zaključak autora beleški, ne tvrdnja iz izvora.

### Gaps
- Nisam tražio zvanične brojke o obimu za Moodle (statistika registrovanih sajtova), Udemy (poslednji godišnji izveštaj pre spajanja), edX, Teachable, Canvas i Khan Academy.

## Klijentske platforme i offline učenje

### Takeaway
Svih šest platformi ima web verziju i zvanične iOS i Android aplikacije. Moodle, Coursera, edX i Teachable (iOS i Android) zvanično podržavaju preuzimanje sadržaja za offline učenje. Za Udemy to piše u zvaničnoj pomoći, ali stranica nije mogla da se otvori (403).

### Cited Findings
- **Moodle App**: minimum su "Android 7 (with Webview 79 or higher) and iOS 13". Offline rad: podaci sa nekih web servisa se automatski keširaju "so that the application works offline", a "entire courses can be downloaded manually. This is referred to as 'prefetching.'" — [Moodle HQ, "Moodle App Overview", moodledev.io](https://moodledev.io/general/app/overview)
- **Coursera**: "A mobile app that enables course downloads for offline learning, which is important for learners with limited or intermittent internet connectivity or power." — [Coursera 10-K FY2025](https://www.sec.gov/Archives/edgar/data/1651562/000165156226000015/cour-20251231.htm)
- **edX**: aplikacije za pametne telefone i tablete (Google Play, App Store) mogu da "Download course videos for watching when you do not have an internet connection". Graded zadatke edX preporučuje da se rade u pretraživaču na računaru, a "You cannot take timed exams or proctored exams using the mobile app". Aplikacija podržava tipove zadataka kao što su multiple choice, checkbox, dropdown, drag-and-drop, numerički unos i unos teksta. — [Open edX Learner's Guide, "If You Use the edX Mobile App"](https://edx.readthedocs.io/projects/open-edx-learner-guide/en/latest/SFD_mobile.html)
- **Teachable**: postoje iOS i Android aplikacije. iOS traži "iOS 15.0 or later". Napredak se sinhronizuje sa webom. — [Teachable, "Use our iOS and Android mobile apps", support.teachable.com](https://support.teachable.com/en/articles/12499640-use-our-ios-and-android-mobile-apps)
- **Teachable iOS**: "Download courses and individual lessons for offline viewing". "Locked lessons (due to drip or completion settings) won't be downloaded." — [Teachable, "Use the iOS App as a Student"](https://support.teachable.com/en/articles/11682426-use-the-ios-app-as-a-student)
- Za Teachable Android offline režim postoji zasebna zvanična stranica pomoći ("Teachable Android App Student Guide", support.teachable.com/en/articles/12069681). Pojavila se samo u rezultatima pretrage i nije otvorena.
- **Udemy**: zvanični članak pomoći "Downloading Courses on iOS and Android" (support.udemy.com/hc/articles/229603928) vratio je HTTP 403 i nije otvoren. Prema sažetku pretrage, u mobilnoj aplikaciji može da se preuzme ceo kurs, sekcija ili predavanje. Preuzeti kursevi su šifrovani i dostupni samo u aplikaciji, a nisu svi kursevi i resursi (npr. practice tests) dostupni za preuzimanje. Pre citiranja proveriti ručno u pretraživaču.
- **Canvas**: native aplikacije Student, Teacher i Parent za Android i iOS. — [Instructure, canvas-android](https://github.com/instructure/canvas-android); [Instructure, canvas-ios](https://github.com/instructure/canvas-ios)

### Inferences
- Obrazac je isti kod svih: web je potpuni klijent, a mobilne aplikacije su za konzumiranje sadržaja, sa offline preuzimanjem kao ključnom mobilnom funkcijom. Zahtevnije ocenjivanje ostaje na webu, što je zvanično navedeno za edX. Teachable iOS ne dozvoljava upis na kurs iz aplikacije.
- Nijedan izvor ne pominje namenske desktop aplikacije za ove platforme. Na desktopu se koriste preko pretraživača. Ovo nije potvrđeno, pa pre tvrdnje u radu treba proveriti.

### Gaps
- Udemy help centar je blokirao preuzimanje (403), pa tvrdnje o Udemy offline radu nisu proverene u primarnom izvoru.
- Nisu provereni offline mogućnosti Canvas aplikacije, zvanične stranice Khan Academy aplikacije, ni postojanje desktop klijenata ili PWA verzije.

## Tehnologija mobilnih aplikacija

### Takeaway
Moodle App je potvrđeno hibridna aplikacija: Angular + Ionic + TypeScript, kompajlirana preko Cordove (bez Capacitora), licenca Apache 2.0. Canvas aplikacije su native (Swift na iOS-u, Kotlin/Java na Androidu), a na iOS-u postepeno izbacuju stari React Native kod. Za Coursera, Udemy, Teachable i zvaničnu edX aplikaciju nisam našao pouzdan izvor o tehnologiji.

### Cited Findings
- "The Moodle app is a hybrid app built using Angular and Ionic Framework. The main coding language used in the app is Typescript." "The Cordova framework is used to use native features and to compile the Android and iOS apps." — [Moodle HQ, "Moodle App Overview", moodledev.io](https://moodledev.io/general/app/overview)
- Repozitorij je "the primary repository of source code for the official mobile app for Moodle", licenca Apache 2.0. — [moodlehq/moodleapp, GitHub](https://github.com/moodlehq/moodleapp)
- `package.json` na grani `main` (stanje 30.09.2026): verzija aplikacije 5.3.0, @angular/core 20.3.31, @ionic/angular 8.8.19, cordova-android 15.0.0, cordova-ios 8.1.1, typescript 5.9.3. Capacitor nije među zavisnostima. — [moodlehq/moodleapp, package.json, GitHub](https://raw.githubusercontent.com/moodlehq/moodleapp/main/package.json)
- **Canvas Android**: Student, Teacher i Parent aplikacije pisane su u Javi i Kotlinu (Gradle, Android Studio, zajednička biblioteka `pandautils`). — [instructure/canvas-android, GitHub](https://github.com/instructure/canvas-android)
- **Canvas iOS**: glavni jezik je Swift. README navodi: "One day React Native, Cocoapods, and other old frameworks will be fully replaced by the swift architecture in Core." — [instructure/canvas-ios, GitHub](https://github.com/instructure/canvas-ios)
- **Open edX**: repozitorij openedx-app-ios je "Modern vision of the mobile application for the Open edX platform from Raccoon Gang", licenca Apache 2.0. To je aplikacija zajednice Open edX, ne potvrđeno zvanična edX.org aplikacija. Na naslovnoj strani repozitorija jezik (Swift/SwiftUI) nije izričito naveden. — [openedx/openedx-app-ios, GitHub](https://github.com/openedx/openedx-app-ios)

### Inferences
- Moodle je dobar primer za rad: velika LMS platforma namerno bira web tehnologije (Angular/Ionic u WebView-u) da bi iz jednog koda izbacila Android i iOS aplikaciju. Canvas bira suprotan put, native kod po platformi, i napušta raniji hibridni React Native kod.

### Gaps
- Coursera, Udemy, Teachable, Khan Academy i zvanična edX.org aplikacija: nisam našao zvaničan inženjerski blog ni izvorni kod koji potvrđuje tehnologiju u 2026. Ne pisati da koriste React Native, Flutter ili native bez primarnog izvora.
- Tačan jezik openedx-app-ios nije potvrđen sa naslovne strane (za to bi trebalo pogledati GitHub statistiku jezika ili fajlove projekta).

## Kvizovi i AI funkcije

### Takeaway
Kvizove i ocenjivanje imaju sve platforme za koje sam proverio (edX, Teachable, Coursera, Moodle). AI funkcije: Moodle AI podsistem (od verzije 4.5), Coursera Coach i Khanmigo (Khan Academy).

### Cited Findings
- **Moodle AI podsistem**: "AI introduced in 4.5", sa "AI enhancements in 5.0". Arhitektura ima tri dela: placements, actions i providers. "Any open source or commercial large language model (LLM) can be supported via provider plugins". Primeri provajdera su OpenAI, Azure AI i Ollama. Funkcije uključuju generisanje teksta i slika u editoru i "summarising and explaining course content". Podešava se u Site administration > General > AI. — [Moodle Docs, "AI subsystem", docs.moodle.org](https://docs.moodle.org/en/AI_subsystem)
- **Coursera Coach**: polaznici dobijaju "pre-quiz practice questions and personalized, interactive instruction through text-based Coach dialogues". — [Coursera 10-K FY2025](https://www.sec.gov/Archives/edgar/data/1651562/000165156226000015/cour-20251231.htm)
- **Khanmigo**: "an AI-powered personal tutor and teaching assistant from trusted education nonprofit Khan Academy". Ne daje gotove odgovore, već "guides learners to find the answer themselves". Nastavnicima pomaže u planiranju lekcija, pravljenju rubrika i kvizova. Za nastavnike je besplatan. Roditelji i polaznici plaćaju pretplatu, moraju biti punoletni i imati američku adresu za naplatu. (Marketinška stranica.) — [Khan Academy, Khanmigo, khanmigo.ai](https://www.khanmigo.ai/)
- **edX**: aplikacija podržava multiple choice, checkbox, dropdown, drag-and-drop, numerički i tekstualni unos. Timed i proctored ispiti nisu mogući u aplikaciji. — [Open edX Learner's Guide](https://edx.readthedocs.io/projects/open-edx-learner-guide/en/latest/SFD_mobile.html)
- **Teachable iOS**: studenti mogu da "Take quizzes and view their results" i "Participate in open-ended assessments". — [Teachable, "Use the iOS App as a Student"](https://support.teachable.com/en/articles/11682426-use-the-ios-app-as-a-student)

### Inferences
- AI asistent vezan za sadržaj kursa (Coursera Coach, Khanmigo, Moodle-ovo "summarise/explain") postaje standardna funkcija. To je koristan kontekst za rad, čak i ako Course Hub nema AI funkcije u samoj aplikaciji.

### Gaps
- Nisam proverio AI funkcije za Udemy, Teachable, Canvas i edX, ni zvanične stranice o kvizovima za Udemy (npr. practice tests) i Canvas.

---

## Bibliografija (datum pristupa za sve: 30.09.2026.)

1. Coursera, Inc. *Form 10-K, Annual Report for the fiscal year ended December 31, 2025.* U.S. SEC EDGAR, 2026. https://www.sec.gov/Archives/edgar/data/1651562/000165156226000015/cour-20251231.htm (zvanični izveštaj)
2. Coursera, Inc. *Form 8-K/A (Udemy combination completed, May 11, 2026).* U.S. SEC EDGAR, 2026. https://www.sec.gov/Archives/edgar/data/0001651562/000165156226000050/cour-20260511.htm (zvanični izveštaj)
3. Moodle HQ. *Moodle App Overview.* Moodle Developer Resources (moodledev.io), n.d. https://moodledev.io/general/app/overview (zvanična dokumentacija)
4. Moodle HQ. *moodlehq/moodleapp: Moodle official app.* GitHub, 2026. https://github.com/moodlehq/moodleapp (izvorni kod)
5. Moodle HQ. *package.json (moodleapp, grana main).* GitHub, 2026. https://raw.githubusercontent.com/moodlehq/moodleapp/main/package.json (izvorni kod)
6. Moodle. *AI subsystem.* MoodleDocs (docs.moodle.org), dokumentacija za verziju 5.2, n.d. https://docs.moodle.org/en/AI_subsystem (zvanična dokumentacija)
7. Open edX / edX. *If You Use the edX Mobile App.* Open edX Learner's Guide, Read the Docs, n.d. https://edx.readthedocs.io/projects/open-edx-learner-guide/en/latest/SFD_mobile.html (zvanična dokumentacija)
8. Raccoon Gang / Open edX. *openedx/openedx-app-ios.* GitHub, n.d. https://github.com/openedx/openedx-app-ios (izvorni kod)
9. Teachable. *Use our iOS and Android mobile apps.* Teachable Help Center, n.d. https://support.teachable.com/en/articles/12499640-use-our-ios-and-android-mobile-apps (zvanična pomoć)
10. Teachable. *Use the iOS App as a Student.* Teachable Help Center, n.d. https://support.teachable.com/en/articles/11682426-use-the-ios-app-as-a-student (zvanična pomoć)
11. Instructure. *instructure/canvas-android.* GitHub, n.d. https://github.com/instructure/canvas-android (izvorni kod)
12. Instructure. *instructure/canvas-ios.* GitHub, n.d. https://github.com/instructure/canvas-ios (izvorni kod)
13. Khan Academy. *Khanmigo.* khanmigo.ai, n.d. https://www.khanmigo.ai/ (marketinška stranica)

Nije otvoreno (samo rezultat pretrage, ne citirati bez ručne provere): Udemy, *Downloading Courses on iOS and Android*, support.udemy.com/hc/articles/229603928 (HTTP 403); Udemy Business, *Save Courses for Offline Viewing*, business-support.udemy.com/hc/articles/115005536308 (HTTP 403).
