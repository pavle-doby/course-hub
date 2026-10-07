# Monorepo arhitektura: literatura (monorepo vs. polyrepo), pnpm workspaces i Turborepo

Stanje na dan 30.09.2026. Svi izvori otvoreni 30.09.2026. (bar stranica sa sažetkom / metapodacima). Napomene o nepotpuno proverenim podacima su u odeljcima "Gaps".

---

## 1. Naučna i stručna literatura: prednosti i mane monorepozitorijuma

### Takeaway
Četiri ključna rada (Potvin i Levenberg 2016; Jaspan i dr. 2018; Brito, Terra i Valente 2018; Brousse 2019) slažu se oko glavnih prednosti monorepozitorijuma: pojednostavljeno upravljanje zavisnostima, atomske izmene preko više projekata, lak refaktoring velikih razmera, vidljivost koda i ponovna upotreba. Kao glavne mane navode potrebu za ulaganjem u alate, performanse build-a, složenost koda i slabiju kontrolu pristupa. Jaspan i dr. naglašavaju da alati mogu biti jednako važni kao sam izbor strukture repozitorijuma.

### Cited Findings

**Potvin, R., Levenberg, J. (2016). Why Google Stores Billions of Lines of Code in a Single Repository. *Communications of the ACM*, 59(7), 78–87. DOI: 10.1145/2854146.** Objavljeno 24.06.2016. — [Crossref metapodaci](https://api.crossref.org/works/10.1145/2854146); [Google Research](https://research.google/pubs/why-google-stores-billions-of-lines-of-code-in-a-single-repository/)
- Rad opisuje zašto Google drži jedinstvenu (monolitnu) bazu koda koju koriste „desetine hiljada programera širom sveta“, kao i infrastrukturu i tokove rada koji to omogućavaju. Analizira i prednosti i ograničenja tog pristupa. — [Google Research](https://research.google/pubs/why-google-stores-billions-of-lines-of-code-in-a-single-repository/)
- Sekundarni izvor (Wikipedia) na osnovu ovog rada navodi da repozitorijum prima „desetine hiljada doprinosa dnevno“ i da je veći od 80 TB. Kao prednosti izdvaja pojednostavljene zavisnosti, atomske commit-ove preko više projekata, refaktoring velikih razmera i saradnju među timovima. Kao mane izdvaja to da svi saradnici podrazumevano imaju pravo čitanja celog koda (protivno principu najmanjih privilegija), veliki prostor za checkout i probleme sa performansama build-a, koje rešavaju alati poput Bazel-a i Pants-a. — [Wikipedia: Monorepo](https://en.wikipedia.org/wiki/Monorepo) (SEKUNDARNI izvor; puni tekst na CACM/ACM DL je vratio 403)

**Jaspan, C., Jorde, M., Knight, A., Sadowski, C., Smith, E. K., Winter, C., Murphy-Hill, E. (2018). Advantages and Disadvantages of a Monolithic Repository: A Case Study at Google. U: *Proceedings of the 40th International Conference on Software Engineering: Software Engineering in Practice (ICSE-SEIP '18)*, ACM. DOI: 10.1145/3183519.3183550.** — [Google Research stranica](https://research.google/pubs/pub47040/); [PDF](https://storage.googleapis.com/gweb-research2023-media/pubtools/4479.pdf); DOI razrešava na [ACM DL](https://dl.acm.org/doi/10.1145/3183519.3183550)
- Metod: anketa inženjera u Google-u i analiza logova korišćenja razvojnih alata. — [Google Research](https://research.google/pubs/pub47040/)
- Nalaz: monolitna baza koda donosi bolju vidljivost/otkrivanje koda, lakšu ponovnu upotrebu API-ja, automatizovana ažuriranja zavisnosti i centralizovano upravljanje. Sa druge strane, više repozitorijuma daje inženjerima veću slobodu u izboru alata, bolju bezbednosnu kontrolu i veću stabilnost. — [Google Research](https://research.google/pubs/pub47040/)
- Zaključak: kompatibilnost alata je ključni faktor koji utiče na to šta inženjeri preferiraju. — [Google Research](https://research.google/pubs/pub47040/)
- Pet tema koje ističe AcaWiki sažetak: (1) vidljivost repozitorijuma značajno utiče na iskustvo programera; (2) alati mogu biti jednako važni kao arhitektura repozitorijuma; (3) postoji tenzija između konzistentnog stila/alata i slobode; (4) postoji tenzija između primoravanja na najnovije verzije zavisnosti i verzionisanih zavisnosti; (5) važno je smanjiti kognitivno opterećenje. Programeri često pretražuju ceo monorepo, i van zajedničkih biblioteka i svoje oblasti odgovornosti. Pretraga i upravljanje zavisnostima mogu se uz odgovarajuće alate postići i u multi-repo okruženju. — [AcaWiki](https://acawiki.org/Advantages_and_Disadvantages_of_a_Monolithic_Repository) (sekundarni sažetak)
- Napomena o naslovu: Google Research stranica navodi naslov „Advantages and Disadvantages of a Monolithic Codebase“, a u ACM zborniku se rad vodi kao „... Monolithic Repository: A Case Study at Google“. — [Google Research](https://research.google/pubs/pub47040/)

**Brito, G., Terra, R., Valente, M. T. (2018). Monorepos: A Multivocal Literature Review. arXiv:1810.09477 [cs.SE]. DOI: 10.48550/arXiv.1810.09477.** Postavljeno 22.10.2018. — [arXiv](https://arxiv.org/abs/1810.09477)
- Pregled uglavnom „sive“ literature (blogovi, industrijski tekstovi) sa četiri nalaza. (1) Monorepo je jedan repozitorijum sa više projekata, povezanih ili nepovezanih, koji dele iste zavisnosti. (2) Ključne karakteristike su centralizacija i standardizacija. (3) Glavne prednosti su pojednostavljene zavisnosti, koordinacija izmena preko više projekata i lak refaktoring. (4) Glavni izazovi su zdravlje koda, složenost baze koda i ulaganje u alate za razvoj i izvršavanje. — [arXiv](https://arxiv.org/abs/1810.09477)

**Brousse, N. (2019). The issue of monorepo and polyrepo in large enterprises. U: *Companion Proceedings of the 3rd International Conference on Art, Science, and Engineering of Programming (Programming '19)*, ACM, str. 1–4. DOI: 10.1145/3328433.3328435.** Autor je iz Adobe-a. Rad je predstavljen na ICW 2019 (Interconnecting Code Workshop), 1. aprila 2019. — [Crossref](https://api.crossref.org/works/10.1145/3328433.3328435); [stranica konferencije](https://2019.programming-conference.org/details/icw-2019-papers/5/The-Issue-Of-Source-Code-Repository-Management-In-Large-Enterprises)
- Na stranici radionice rad nosi naslov „The Issue Of Source Code Repository Management In Large Enterprises“, a u ACM zborniku „The issue of monorepo and polyrepo in large enterprises“. — [Programming 2019](https://2019.programming-conference.org/details/icw-2019-papers/5/The-Issue-Of-Source-Code-Repository-Management-In-Large-Enterprises)
- Rad poredi tri pristupa: više repozitorijuma, monorepo i hibridni model. Ističe da složenost koju donose SOA, mikroservisi i serverless čini strukturu repozitorijuma kritičnom. Tvrdi da monorepo može da „drive high efficiency and enhanced product quality through improved team cognition“ (poveća efikasnost i kvalitet proizvoda kroz bolju timsku kogniciju) jer smanjuje barijere između timova. Objašnjava i da mnoge firme imaju više repozitorijuma zbog organskog rasta, a ne svesnog izbora. — [Programming 2019](https://2019.programming-conference.org/details/icw-2019-papers/5/The-Issue-Of-Source-Code-Repository-Management-In-Large-Enterprises)

**Novija literatura (2020–2026)**
- Lentner, G. R. (2023). Monorepos for Research Software Projects. *USRSE'23 Conference Proceedings*, Zenodo. DOI: 10.5281/zenodo.10426338. „Full-stack“ istraživački softver ima više komponenti i mnogo zavisnosti. Monorepo omogućava da se te komponente razvijaju zajedno, ali cenu plaća složenost nezavisnog deploy-a. Autor upozorava da akademska zajednica ne treba prosto da kopira industrijsku praksu. — [Zenodo](https://zenodo.org/records/10426338)
- Blog „Never Work in Theory“ (2023) postavlja pitanje ima li uopšte empirijskih istraživanja o prednostima i manama monorepozitorijuma. To ukazuje na mali broj novijih empirijskih studija. — [neverworkintheory.org](https://neverworkintheory.org/2023/05/10/the-monorepo-question.html) (samo rezultat pretrage, stranica nije otvorena; ne citirati u radu)

### Inferences
- Prednosti koje se ponavljaju u svim izvorima direktno odgovaraju sistemu Course Hub. Atomske izmene su važne jer promena Zod šeme u `@repo/contract` i regenerisanog API klijenta mora da stigne u API, web i Expo u istom commit-u. Deljenje koda znači da i18n i dizajn tokeni ne moraju da se objavljuju na npm. „Jedna verzija zavisnosti“ odgovara pnpm catalog-ima i override-ima.
- Mane iz literature (access control, skaliranje build-a na milijarde linija, checkout od 80 TB) uglavnom se odnose na organizacije veličine Google-a. Za jednog autora i tri aplikacije realno relevantne ostaju samo potreba za alatima (tu pomažu pnpm i Turborepo), čvršća sprega paketa i duži CI kad nema keširanja.
- Jaspan i dr. tvrde da su alati jednako važni kao struktura repozitorijuma. To je dobar argument zašto rad treba da objasni i pnpm i Turborepo, a ne samo odluku o monorepozitorijumu.

### Gaps
- Tačne statistike iz Potvin i Levenberg (npr. broj fajlova, commit-ova dnevno, programera) nisu provere u originalu jer CACM i ACM DL vraćaju 403. Postoji samo sekundarni navod sa Wikipedia-e (>80 TB, desetine hiljada doprinosa dnevno). Pre citiranja brojeva otvoriti PDF u ACM DL preko fakultetskog pristupa.
- Stranice rada Jaspan i dr. u ICSE-SEIP zborniku nisu potvrđene jer Crossref vraća 429, a PDF nije mogao da se ekstrahuje. Iz sećanja su str. 225–234, Gothenburg, Švedska, ali to treba proveriti na ACM DL pre upisa u Reference.md. Broj ispitanika u anketi i procenti takođe nisu provereni.
- Nije nađena recenzirana empirijska studija iz 2020–2026. koja kvantitativno poredi monorepo i polyrepo (npr. po broju bagova ili brzini isporuke).

---

## 2. monorepo.tools: industrijska definicija (izvor koji održava Nx)

### Takeaway
monorepo.tools definiše monorepo kao jedan repozitorijum sa više zasebnih projekata čiji su međusobni odnosi jasno definisani. Eksplicitno naglašava da monorepo nije isto što i monolit. Sajt održava Nx, pa ga u radu treba označiti kao industrijski (vendorski) izvor.

### Cited Findings
- Definicija: „A monorepo is a single repository containing multiple distinct projects, with well-defined relationships.“ — [monorepo.tools](https://monorepo.tools/)
- Monorepo nije isto što i monolit: sajt piše da je dobar monorepo „the opposite of monolithic“ (suprotnost monolitu), a samo držanje koda na istom mestu bez jasnih odnosa nije monorepo. — [monorepo.tools](https://monorepo.tools/)
- Navedene prednosti u odnosu na polyrepo: deljenje koda bez troška objavljivanja paketa, jedinstven izvor istine (bag se ispravlja jednom), atomski commit-ovi, konvencije koje se mogu nametnuti svim projektima i, u novijoj verziji sajta, prednosti za AI agente (pun kontekst, izmene preko više projekata). — [monorepo.tools](https://monorepo.tools/)
- Sajt održava Nx: „Made with love by Nx“, © 2026 Nx and Contributors. — [monorepo.tools](https://monorepo.tools/)

### Inferences
- Pošto sajt održava proizvođač jednog od alata, definiciju treba citirati kao industrijsku i kombinovati je sa akademskom definicijom Brita i dr. („više projekata ... koji dele iste zavisnosti“).

### Gaps
- Uporedna tabela alata (/compare) nije otvorena.

---

## 3. pnpm: store, strogi node_modules, workspaces, catalogs, verzija

### Takeaway
pnpm čuva sve fajlove paketa jednom, u globalnom content-addressable store-u, i u projekte ih ubacuje preko hard linkova. Pravi strogi (ne-ravan) `node_modules` sa symlinkovima, pa paket ne može da uveze zavisnost koju nije deklarisao („phantom dependency“). Workspace se definiše u `pnpm-workspace.yaml`, lokalni paketi se povezuju protokolom `workspace:`, a verzije zavisnosti se centralizuju catalog-ima. Aktuelna glavna verzija u septembru 2026. je pnpm 12, a Course Hub koristi pnpm 11.

### Cited Findings
- Store i hard linkovi: „All the files are saved in a single place on the disk. When packages are installed, their files are hard-linked from that single place, consuming no additional disk space.“ Kad nova verzija paketa menja samo jedan od 100 fajlova, u store se dodaje samo taj jedan fajl. — [pnpm.io/motivation](https://pnpm.io/motivation)
- Strogi node_modules: „pnpm uses symlinks to add only the direct dependencies of the project into the root of the modules directory“. Zbog toga kod ne može slučajno da zavisi od tranzitivnih paketa koje nije deklarisao. — [pnpm.io/motivation](https://pnpm.io/motivation)
- Workspace zahteva `pnpm-workspace.yaml` u korenu repozitorijuma. Protokol `workspace:` (`workspace:*`, `workspace:^`, `workspace:~`, relativna putanja, alias) garantuje da se zavisnost razrešava isključivo iz workspace-a, bez pada na registry. Pri objavljivanju pnpm zamenjuje `workspace:` konkretnom verzijom (npr. `workspace:^` postaje `^1.5.0`). Podešavanje `linkWorkspacePackages` određuje da li se lokalni paketi automatski linkuju. — [pnpm.io/workspaces](https://pnpm.io/workspaces)
- Catalogs: verzije zavisnosti se definišu kao konstante u `pnpm-workspace.yaml`, a u `package.json` se na njih poziva sa `"react": "catalog:"`. Postoje i imenovani catalog-i (`catalog:ime`). Prednosti su jedinstvena verzija zavisnosti u celom workspace-u („It's usually desirable to have only one version of a dependency in a workspace“), nadogradnja izmenom samo jednog mesta i manje merge konflikata. — [pnpm.io/catalogs](https://pnpm.io/catalogs)
- Verzija: početna strana pnpm.io upućuje na „What's different in pnpm 12“. Tagline je „Fast, disk space efficient package manager“. Na benchmarku sa sajta pnpm je 10,8 s naspram 1 min 28 s za npm na realnom projektu. — [pnpm.io](https://pnpm.io/)
- GitHub releases paralelno održava tri grane: v12.8.2 (najnovija, grana 12), v11.28.3 (grana 11) i v10.34.6 (grana 10). — [GitHub pnpm releases](https://github.com/pnpm/pnpm/releases)
- Dokumentacija pominje funkcije iz 12.x: pnpm 12.7.0+ automatski pravi `pnpm-workspace.yaml` iz polja `workspaces` u `package.json`, catalog-i podržavaju workspace zavisnosti od v12.2.0. — [pnpm.io/workspaces](https://pnpm.io/workspaces); [pnpm.io/catalogs](https://pnpm.io/catalogs)

### Inferences
- Course Hub traži pnpm 11 (`packageManager` u CLAUDE.md projekta), što je i dalje podržana grana. U radu treba napisati „pnpm 11 (aktuelna glavna verzija u trenutku pisanja je 12)“.
- Strogi `node_modules` je u Course Hub-u delimično ublažen podešavanjem `nodeLinker: hoisted` zbog Expo/React Native-a (vidi CLAUDE.md projekta). Ovaj kompromis vredi pomenuti u radu.

### Gaps
- Datumi izdanja: alat za preuzimanje je prikazao datume sa godinom 2024 (npr. v12.8.2 „Sep 30, 2024“), što je gotovo sigurno greška ekstrakcije jer pnpm 10 izlazi tek 2025. Tačne datume treba proveriti direktno na GitHub-u.
- Verzija u kojoj su uvedeni catalog-i (iz sećanja 9.5, 2024) nije potvrđena u otvorenim izvorima.

---

## 4. Turborepo: graf taskova, keširanje, --filter, Rust

### Takeaway
Turborepo (Vercel) je build sistem za JS/TS monorepozitorijume, napisan u Rust-u i objavljen pod MIT licencom. Taskove definiše u `turbo.json`, a iz grafa paketa i `dependsOn` (`^build` = prvo build zavisnosti) izvodi redosled izvršavanja. Rezultate kešira po hešu ulaza, lokalno u `.turbo/cache` ili udaljeno (Vercel Remote Cache ili sopstveni server). Pomoću `--filter` pokreće se samo podskup paketa. Dokumentacija je u međuvremenu prešla sa turbo.build/turborepo.com na turborepo.dev.

### Cited Findings
- GitHub opis: „Build system optimized for JavaScript and TypeScript, written in Rust“. Licenca je MIT, repozitorijum ima oko 31,2 hiljade zvezdica, a održava ga Vercel. — [GitHub vercel/turborepo](https://github.com/vercel/turborepo)
- `turbo.json` ima ključ `tasks`, a za svaki task: `dependsOn`, `outputs`, `inputs` (podrazumevano svi fajlovi pod verzionom kontrolom), `cache` (podrazumevano true), `persistent` (za dugotrajne taskove kao dev serveri) i `env` (promenljive okruženja koje ulaze u heš). Za `^`: turbo „starts at the 'bottom' of the package graph ... It will then run the build task at the end of the dependency chain first, working its way back to the 'top'“. — [turborepo.dev: Configuration reference](https://turborepo.dev/docs/reference/configuration)
- `--filter` podrazumevano radi nad grafom paketa. — [turborepo.dev: Configuration reference](https://turborepo.dev/docs/reference/configuration)
- Keš: Turborepo računa globalni heš i heš taska (fajlovi, lockfile, konfiguracija, env), i ako se „fingerprint“ poklopi, task se ne izvršava ponovo. Kešira `outputs` i logove i pri pogotku ih reprodukuje („restoring those logs to your terminal“). Lokalni keš je u `.turbo/cache`. Udaljeni keš je podrazumevano Vercel Remote Cache (`turbo login` / `turbo link`), a moguć je i sopstveni server preko Remote Caching API-ja. — [turborepo.dev: Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- Stari URL turborepo.com/docs/... preusmerava (301) na turborepo.dev. — [turborepo.dev](https://turborepo.dev/docs/crafting-your-repository/caching)

### Inferences
- U Course Hub-u CI pokreće `pnpm turbo build --filter=api...` / `--filter=web...` (CLAUDE.md projekta). Sufiks `...` uključuje i zavisnosti paketa, tako da se za svaki servis grade samo on i njegovi interni paketi (`contract`, `shared`, `api-client`...), i to redom koji daje `^build`.

### Gaps
- Tačna aktuelna verzija Turborepo-a (2.x) i datum izdanja nisu utvrđeni.

---

## 5. Kratko poređenje: Nx i Lerna

### Takeaway
Nx je širi build sistem za monorepozitorijume sa grafom projekata, komandama „affected“, pluginovima i Nx Cloud-om. Lerna je stariji alat za upravljanje i objavljivanje više npm paketa iz jednog repozitorijuma, danas ga održava Nx i za izvršavanje taskova koristi Nx.

### Cited Findings
- Nx: build sistem za monorepozitorijume koji „helps you develop faster and keep CI fast as your codebase scales“. Ima graf projekata i „affected“ komande, keširanje, orkestraciju taskova, pluginove i Nx Cloud (udaljeni keš, distribuirano izvršavanje). — [nx.dev intro](https://nx.dev/docs/getting-started/intro)
- Lerna: „a fast, modern build system for managing and publishing multiple JavaScript/TypeScript packages from the same repository“. Održava ga Nx (© 2026 Nx), a taskove izvršava preko Nx-a („Powered by Nx“). — [lerna.js.org](https://lerna.js.org/)

### Inferences
- Za Course Hub je Turborepo jednostavniji izbor od Nx-a. Oslanja se na postojeće `package.json` skripte i pnpm workspace i ne uvodi pluginove ni generatore. Lerna je fokusirana na objavljivanje paketa, a Course Hub interne pakete ne objavljuje.

### Gaps
- Nije otvoren nijedan nezavisan (ne-vendorski) benchmark koji poredi Turborepo i Nx.

---

## Bibliografija (pristupljeno 30.09.2026.)

1. R. Potvin, J. Levenberg, „Why Google Stores Billions of Lines of Code in a Single Repository“, *Communications of the ACM*, vol. 59, no. 7, pp. 78–87, 2016. DOI: 10.1145/2854146.
2. C. Jaspan, M. Jorde, A. Knight, C. Sadowski, E. K. Smith, C. Winter, E. Murphy-Hill, „Advantages and Disadvantages of a Monolithic Repository: A Case Study at Google“, *Proc. 40th Int. Conf. on Software Engineering: Software Engineering in Practice (ICSE-SEIP '18)*, ACM, 2018. DOI: 10.1145/3183519.3183550. (stranice proveriti: verovatno 225–234)
3. G. Brito, R. Terra, M. T. Valente, „Monorepos: A Multivocal Literature Review“, arXiv:1810.09477, 2018. DOI: 10.48550/arXiv.1810.09477.
4. N. Brousse, „The issue of monorepo and polyrepo in large enterprises“, *Companion Proc. 3rd Int. Conf. on Art, Science, and Engineering of Programming (Programming '19)*, ACM, 2019, pp. 1–4. DOI: 10.1145/3328433.3328435.
5. G. R. Lentner, „Monorepos for Research Software Projects“, *USRSE'23 Conference Proceedings*, 2023. DOI: 10.5281/zenodo.10426338.
6. Nx and Contributors, „Monorepo Explained“, monorepo.tools, https://monorepo.tools/ (industrijski izvor).
7. pnpm, „Motivation“, „Workspace“, „Catalogs“, https://pnpm.io/motivation, https://pnpm.io/workspaces, https://pnpm.io/catalogs.
8. Vercel, „Turborepo: Caching“, „Configuring turbo.json“, https://turborepo.dev/docs/crafting-your-repository/caching, https://turborepo.dev/docs/reference/configuration; GitHub: https://github.com/vercel/turborepo.
9. Nx, „Intro to Nx“, https://nx.dev/docs/getting-started/intro.
10. Lerna, https://lerna.js.org/.
