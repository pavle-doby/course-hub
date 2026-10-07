---
name: pisanje-diplomskog
description: Pisanje diplomskog rada „Razvoj višeplatformske aplikacije za kurseve korišćenjem web tehnologija“ u folderu `diplomski/`, sekciju po sekciju. Koristi ovaj skill kad god korisnik traži da se napiše, nastavi, prepravi ili proširi neka sekcija diplomskog (uvod, poglavlje, sažetak, zaključak…), da se doda referenca ili skraćenica, ili pomene diplomski.md, Reference.md ili Skracenice.md — čak i kad samo kaže „nastavi“ ili „sledeća sekcija“ u kontekstu rada.
---

# Pisanje diplomskog rada

Rad opisuje `course-hub` monorepo: jedan API (Express), web klijent (Next.js PWA) i nativni klijent (Expo / React Native) nad zajedničkim paketima. Piše se na srpskom, latinicom, sekciju po sekciju, uz povratnu informaciju autora posle svake sekcije.

## Fajlovi (svi u `diplomski/`)

| Fajl             | Uloga                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `plan.md`        | Sadržaj rada i oznake obaveznosti. Polazna tačka za redosled i obim sekcija.            |
| `diplomski.md`   | Sam tekst rada. Sekcije se dodaju redom iz plana.                                        |
| `Reference.md`   | Svi korišćeni izvori, numerisani `[1]`, `[2]`… Obavezan.                                 |
| `Skracenice.md`  | Sve skraćenice iz rada, abecedno, sa punim nazivom i kratkim objašnjenjem. Obavezan.     |
| `istrazivanje/`  | Beleške iz `deep-research` pokretanja, jedna po poglavlju (`2-pristupi.md`…).            |

Ako `Reference.md` ili `Skracenice.md` ne postoje, napravi ih pre pisanja prve sekcije.

## Ciljevi rada (svaka sekcija treba da im služi)

Iz ugla tehnologije:
- opisati različite pristupe razvoju višeplatformske aplikacije za učenje korišćenjem web tehnologija;
- objasniti zašto je izabrana monorepo arhitektura;
- objasniti zašto je aplikacija organizovana baš ovako (slojevi, zajednički paketi, jedan izvor istine);
- istaći prednosti takvog pristupa (i pošteno navesti ograničenja).

Iz ugla funkcionalnosti:
- učenje treba da bude što pristupačnije — što više platformi, to bolje;
- veštačka inteligencija (VI) pomaže i polazniku pri učenju i kreatoru pri pravljenju kursa;
- kvizovi su dodatna motivacija da se kurs nastavi i način da se proveri znanje.

## Tok rada za jednu sekciju

1. **Pročitaj kontekst.** `plan.md`, dosadašnji `diplomski.md`, `Reference.md` i `Skracenice.md`, da nastaviš numeraciju i ton i ne ponavljaš već rečeno.
2. **Istraži pre pisanja o tehnologiji.** Svaka tvrdnja o tehnologiji, pristupu, standardu ili statistici mora imati izvor. Razlog: komisija proverava tvrdnje, a zastarele ili izmišljene činjenice (verzije, datumi, brojke) su najčešća greška u ovakvim radovima. Dubinu istraživanja biraj po sekciji (vidi „Istraživanje“ ispod):
   - Za poglavlja koja porede pristupe ili pregledaju literaturu pokreni `anthropic-skills:deep-research` sa brifom iz [references/deep-research.md](references/deep-research.md).
   - Za pojedinačne tvrdnje o tehnologijama koristi zvaničnu dokumentaciju i specifikacije (react.dev, nextjs.org, docs.expo.dev, reactnative.dev, web.dev, MDN, W3C, turbo.build, pnpm.io, orm.drizzle.team…) preko WebSearch/WebFetch.
   - Za pedagoške i opšte tvrdnje (e-učenje, kvizovi, VI u obrazovanju) traži naučne radove ili izveštaje priznatih institucija.
   - Za tvrdnje o samom projektu izvor je kod: pročitaj relevantne fajlove (CodeGraph ako postoji `.codegraph/`, inače fajlovi) i `ARCHITECTURE.md`, `FEATURES.md`, `apps/native/spec/`. Opisuj ono što kod zaista radi; ne tvrdi da postoji nešto što je u planu ili je placeholder.
3. **Upiši izvore u `Reference.md`** pre nego što ih citiraš (format ispod). Ako je izvor već tu, koristi postojeći broj.
4. **Napiši sekciju u `diplomski.md`**, uz citate `[n]` u tekstu.
5. **Ažuriraj `Skracenice.md`** za svaku novu skraćenicu.
6. **Stani i traži povratnu informaciju.** Posle svake sekcije najvišeg nivoa (npr. „1. Uvod“) prekini i pitaj autora šta da se promeni. Ne prelazi na sledeću sekciju dok autor ne potvrdi. U poruci kratko navedi: šta sekcija pokriva, koje izvore si dodao, koje odluke si doneo sam (da autor može da ih ispravi) i šta je ostalo otvoreno (npr. slike koje autor treba da doda).
7. **Pretoči trajnu povratnu informaciju u skill.** Ako autorova primedba važi i za buduće sekcije (stil, pismo, struktura, izbor izvora), a ne samo za ovu, ažuriraj ovaj skill pomoću `anthropic-skills:skill-creator` po uputstvu u [references/skill-creator.md](references/skill-creator.md). Jednokratne ispravke teksta samo primeni u `diplomski.md`.

## Istraživanje: koji alat za koje poglavlje

| Poglavlje (iz `plan.md`)                          | Glavni izvor                                  | Alat                                     |
| ------------------------------------------------- | --------------------------------------------- | ---------------------------------------- |
| 2. Problem i srodna rešenja                       | Naučni radovi, uporedne studije, dokumentacija | `deep-research` (obavezno)               |
| 3. Korišćene tehnologije                          | Zvanična dokumentacija i specifikacije         | `deep-research` za 3 kao celinu, WebFetch za dopune |
| 9. Integracija VI                                 | Radovi o VI u obrazovanju + MCP specifikacija  | `deep-research`                          |
| 13. Diskusija                                     | Postojeće reference + kod                      | WebSearch po potrebi                     |
| 1, 4–8, 10–12, 14 (o samom projektu)              | Kod repozitorijuma                             | CodeGraph / čitanje fajlova, WebFetch za pojedinačne tvrdnje |

`deep-research` je skup i spor (pokreće više pomoćnih agenata), pa ga koristi jednom po poglavlju, ne po podsekciji. Rezultat sačuvaj u `diplomski/istrazivanje/<broj>-<tema>.md`, da ga naredne sekcije i ispravke mogu ponovo koristiti bez novog istraživanja. Pre pokretanja proveri da li beleška za to poglavlje već postoji.

## Stil pisanja

- Srpski, **latinica** (autor je potvrdio), ekavica. Akademski ton, bezlične ili pasivne konstrukcije („U radu je prikazano…“, „Izabran je pristup…“), kao u radovima sa ETF-a.
- Stručni termin na engleskom se pri prvom pominjanju navodi u zagradi: „jednostranična aplikacija (eng. *single-page application*)“. Posle toga koristi se srpski termin ili ustaljena skraćenica.
- Skraćenica se pri prvom pominjanju piše u punom obliku sa skraćenicom u zagradi, npr. „progresivna web aplikacija (eng. *Progressive Web App* – PWA)“, i upisuje se u `Skracenice.md`.
- Nazivi biblioteka, paketa, fajlova i komandi idu u `kod` formatu.
- Pasusi su celoviti i povezani. Nabrajanja koristi samo gde je sadržaj zaista lista (zahtevi, koraci, poređenja). Tabele za poređenja pristupa.
- Brojevi i tvrdnje se ne ulepšavaju. Ograničenja projekta (nema automatskih testova, nativna aplikacija nije kompletna) navode se otvoreno tamo gde su relevantna.
- Mesta za slike, dijagrame i snimke ekrana označi ovako, da ih autor kasnije doda:
  `> **[Slika X.Y: opis šta slika treba da prikaže]**`
- Numeracija naslova prati `plan.md`: `# 1. Uvod`, `## 1.1 Motivacija`…

## Format `Reference.md`

Numerisana lista po redosledu prvog citiranja u radu:

```markdown
[1] Autor(i) ili organizacija, „Naslov“, izdavač/sajt, godina. Dostupno na: URL (pristupljeno DD.MM.GGGG.)
```

Za naučne radove: autori, naslov, časopis/konferencija, volumen, strane, godina, DOI ako postoji. Ne upisuj izvor koji nisi zaista otvorio ili pronašao pretragom.

## Format `Skracenice.md`

Tabela sortirana abecedno:

```markdown
| Skraćenica | Pun naziv (eng.)          | Objašnjenje                                   |
| ---------- | ------------------------- | --------------------------------------------- |
| API        | Application Programming Interface | Programski interfejs za komunikaciju između softverskih komponenti |
```
