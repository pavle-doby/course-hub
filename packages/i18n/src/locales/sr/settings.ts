export const settings = {
  title: "Podešavanja",
  preferences: "Preferencije",
  contentBehavior: "Način korišćenja sadržaja",
  contentBehaviorCreate: "Kreiranje",
  contentBehaviorConsume: "Korišćenje",
  contentBehaviorBoth: "Kreiranje i korišćenje",
  theme: "Tema",
  themeLight: "Svetla",
  themeDark: "Tamna",
  themeSystem: "Sistemska",
  language: "Jezik",
  languageEnglish: "Engleski",
  languageSerbian: "Srpski",
  cancel: "Otkaži",
  save: "Sačuvaj",
  updated: "Podešavanja su sačuvana",
  notifications: {
    title: "Obaveštenja",
    allowAll: "Dozvoli sve",
    description: "Izaberite koja obaveštenja dobijate za sve svoje kurseve.",
    categories: {
      course_enrolled: {
        title: "Aktivnost polaznika",
        description: "Kada se polaznici upišu na vaše kurseve ili ih završe.",
      },
      private_course_attempt: {
        title: "Zahtevi za privatne kurseve",
        description: "Kada neko pokuša da se upiše na neki od vaših privatnih kurseva.",
      },
      course_updated: {
        title: "Izmene kurseva",
        description: "Kada se izmeni kurs na koji ste upisani.",
      },
      creator_new_course: {
        title: "Novi kursevi",
        description: "Kada autor od kog učite objavi nov kurs.",
      },
    },
  },
  aiAccess: {
    oauth: {
      title: "Claude konektor",
      description:
        "Povežite Claude (web, desktop ili mobilni) jednim klikom. Claude se prijavljuje preko pregledača i sam upravlja svojim tokenom.",
      empty: "Još nema povezanih aplikacija.",
    },
    manual: {
      title: "MCP - Tokeni",
      description:
        "Za agente bez podrške za konektore, kao što su Claude Code ili Cursor. Kreirajte token i nalepite ga u MCP konfiguraciju agenta.",
    },
    connectorUrl: "URL konektora",
    connectorUrlHint:
      "U <strong>Claude</strong>-u otvorite <strong>Settings</strong> → <connectorsLink>Connectors</connectorsLink> → <strong>Add</strong> → <strong>Add custom connector</strong> i nalepite ovaj URL.",
    empty: "Još nema pristupnih tokena.",
    createToken: "Kreiraj token",
    lastUsed: "Poslednji put korišćen {{date}}",
    neverUsed: "Nije korišćen",
    created: "Kreiran {{date}}",
    details: "Detalji",
    detailsDialog: {
      claudeConnections: "Svoju vezu možete videti ovde:",
      oauthDescription:
        "{{client}} je povezan preko prilagođenog konektora i sam upravlja ovim tokenom, pa nema šta da se podešava. Opozovite ga da biste prekinuli vezu sa {{client}}.",
      description:
        "Čuva se samo heš tokena, pa ne može ponovo da se prikaže. Nalepite token koji ste kopirali pri kreiranju da popunite komande ili kreirajte novi token.",
    },
    revoke: "Opozovi",
    revokeDialog: {
      title: "Opozvati token?",
      description: 'Agenti koji koriste "{{name}}" će odmah izgubiti pristup.',
      cancel: "Otkaži",
      confirm: "Opozovi",
    },
    revokedToast: "Token je opozvan",
    authorize: {
      title: "Povezivanje: {{client}}",
      description:
        "{{client}} želi da čita vaše kurseve i kreira nacrte u vaše ime. Pristup možete opozvati bilo kada u Podešavanjima.",
      redirect: "Bićete vraćeni na {{host}}.",
      invalidTitle: "Nevažeći zahtev za povezivanje",
      invalidDescription:
        "U ovom linku nedostaju podaci. Pokrenite povezivanje ponovo iz aplikacije.",
      unknownClient: "Aplikacija",
      allow: "Dozvoli",
      deny: "Odbij",
    },
    createDialog: {
      title: "Kreiraj pristupni token",
      description: "Dajte tokenu ime kako biste ga kasnije prepoznali.",
      nameLabel: "Naziv",
      namePlaceholder: "Claude Code laptop",
      submit: "Kreiraj",
      createdTitle: "Token je kreiran",
      createdDescription: "Kopirajte token sada. Nećete moći ponovo da ga vidite.",
      token: "Token",
      config: "MCP konfiguracija",
      claudeCode: "Claude Code",
      global: "Globalno",
      globalHint: "Dostupno u svim vašim projektima.",
      localHint: "Dostupno samo u folderu u kojem pokrenete komandu.",
      copy: "Kopiraj",
      copiedToast: "Kopirano",
      done: "Gotovo",
    },
  },
};
