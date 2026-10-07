# Ažuriranje ovog skilla pomoću `anthropic-skills:skill-creator`

Skill je živ dokument: kad autor da primedbu koja važi za ceo rad, ona treba da se upiše ovde, da je buduće sekcije poštuju bez ponovnog podsećanja.

## Kada ažurirati

- Primedba o stilu, pismu, tonu, dužini, strukturi naslova ili formatu referenci.
- Nova odluka o sadržaju koja važi za više poglavlja (npr. „nativnu aplikaciju opisuj kao aplikaciju za polaznike“).
- Promena u projektu koja menja ciljeve ili stanje opisano u SKILL.md (npr. nativna aplikacija dobila deo za kreatora).
- Novi alat ili izvor koji treba stalno koristiti.

Ne ažuriraj skill zbog jednokratne ispravke rečenice u jednoj sekciji.

## Kako

Pokreni `anthropic-skills:skill-creator` sa argumentom:

```text
Ažuriraj postojeći projektni skill `.claude/skills/pisanje-diplomskog` (zadrži ime i putanju).
Promena: <autorova primedba, doslovno>.
Obim: samo izmena SKILL.md i/ili references/, bez evaluacionog ciklusa i benchmarka —
provera je autorova povratna informacija na sledećoj sekciji.
Zadrži SKILL.md ispod ~200 linija; detalje premesti u references/.
```

Posle izmene kratko javi autoru šta je promenjeno u skillu (jedna do dve rečenice), pa nastavi sa radom.
