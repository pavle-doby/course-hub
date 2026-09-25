export const common = {
  helloWorld: "Zdravo, Svete!",
  hello: "Zdravo, {{name}}!",
  languageSwitcher: {
    sr: "SR",
    en: "EN",
  },
  errors: {
    offline: {
      title: "Nema internet konekcije",
      message: "Niste povezani na internet. Proverite konekciju i pokušajte ponovo.",
    },
    backOnline: {
      title: "Ponovo ste povezani",
    },
    shared: {
      FORBIDDEN: { title: "Pristup odbijen", message: "Nemate dozvolu za izvršavanje ove radnje." },
      UNAUTHORIZED: {
        title: "Neovlašćen pristup",
        message: "Morate biti prijavljeni da biste izvršili ovu radnju.",
      },
      NOT_FOUND: { title: "Nije pronađeno", message: "Traženi resurs nije pronađen." },
      SERVER_ERROR: {
        title: "Greška servera",
        message: "Došlo je do neočekivane greške. Pokušajte ponovo kasnije.",
      },
      NOT_FOUND_ENDPOINT: { title: "Nije pronađeno", message: "Tražena putanja ne postoji." },
      NO_TOKEN: { title: "Sesija obavezna", message: "Molimo prijavite se da biste nastavili." },
      INVALID_TOKEN: {
        title: "Nevažeća sesija",
        message: "Vaša sesija je nevažeća ili je istekla. Molimo prijavite se ponovo.",
      },
      AUTH_CHECK_FAILED: {
        title: "Autentifikacija neuspešna",
        message: "Nismo mogli da verifikujemo vaš identitet. Molimo prijavite se ponovo.",
      },
      VALIDATION_ERROR: {
        title: "Greška validacije",
        message: "Neka polja su nevažeća. Proverite unos i pokušajte ponovo.",
      },
      INVALID_PAGINATION_PARAMS: {
        title: "Neispravan zahtev",
        message: "Parametri paginacije koji su prosleđeni su nevažeći.",
      },
    },
    auth: {
      INVALID_CREDENTIALS: {
        title: "Nevažeći podaci",
        message: "Email adresa ili lozinka koju ste uneli je neispravna.",
      },
      UNAUTHORIZED: {
        title: "Neovlašćen pristup",
        message: "Niste ovlašćeni za izvršavanje ove radnje.",
      },
      USER_EXISTS: {
        title: "Nalog već postoji",
        message: "Nalog sa ovom email adresom već postoji.",
      },
      NO_REFRESH_TOKEN: {
        title: "Sesija istekla",
        message: "Vaša sesija je istekla. Molimo prijavite se ponovo.",
      },
      INVALID_REFRESH_TOKEN: {
        title: "Nevažeća sesija",
        message: "Vaša sesija je nevažeća. Molimo prijavite se ponovo.",
      },
      USER_NOT_FOUND: {
        title: "Korisnik nije pronađen",
        message: "Nije pronađen nalog sa navedenim podacima.",
      },
      BAD_REQUEST: {
        title: "Neispravan zahtev",
        message: "Zahtev nije mogao biti obrađen. Pokušajte ponovo.",
      },
      RATE_LIMIT_EXCEEDED: {
        title: "Previše pokušaja",
        message: "Napravili ste previše pokušaja. Pokušajte ponovo kasnije.",
      },
    },
    user: {
      NOT_FOUND: { title: "Korisnik nije pronađen", message: "Traženi korisnik nije pronađen." },
      ALREADY_EXISTS: {
        title: "Korisnik već postoji",
        message: "Nalog sa ovim podacima već postoji.",
      },
    },
    video: {
      NOT_FOUND: { title: "Video nije pronađen", message: "Traženi video nije pronađen." },
      NOT_READY: { title: "Video se obrađuje", message: "Video još nije spreman za reprodukciju." },
      UPLOAD_FAILED: {
        title: "Otpremanje videa nije dostupno",
        message: "Video se već otprema ili otpremanje nije moglo biti pokrenuto.",
      },
    },
    document: {
      NOT_FOUND: { title: "Dokument nije pronađen", message: "Traženi dokument nije pronađen." },
      INVALID_PARENT: {
        title: "Sadržaj nije pronađen",
        message: "Izabrana stavka kursa više ne postoji.",
      },
      UNSUPPORTED_TYPE: {
        title: "Nepodržana datoteka",
        message: "Dozvoljeni su samo JPEG, PNG, WebP i PDF fajlovi.",
      },
      FILE_TOO_LARGE: {
        title: "Datoteka je prevelika",
        message: "Ova datoteka prelazi dozvoljenu veličinu.",
      },
      LIMIT_EXCEEDED: {
        title: "Dostignut limit priloga",
        message: "Ova stavka kursa već ima maksimalan broj dokumenata.",
      },
      UPLOAD_NOT_READY: {
        title: "Otpremanje nije spremno",
        message: "Datoteka još nije zakačena. Pokušajte ponovo.",
      },
      UPLOAD_FAILED: {
        title: "Otpremanje nije uspelo",
        message: "Zakačena datoteka nije mogla biti proverena.",
      },
    },
    invitation: {
      COURSE_NOT_FOUND: {
        title: "Kurs nije pronađen",
        message: "Kurs za ovu pozivnicu nije pronađen.",
      },
      COURSE_NOT_PRIVATE: {
        title: "Pozivnice nisu dostupne",
        message: "Ovaj kurs nije privatan, pa se pozivnice ne mogu koristiti.",
      },
      INVALID_TOKEN: {
        title: "Nevažeća pozivnica",
        message: "Ova pozivnica nije važeća.",
      },
      EXPIRED: {
        title: "Pozivnica je istekla",
        message: "Ova pozivnica je istekla.",
      },
      ALREADY_USED: {
        title: "Pozivnica nije dostupna",
        message: "Ova pozivnica je već iskorišćena ili opozvana.",
      },
      NOT_FOUND: {
        title: "Pozivnica nije pronađena",
        message: "Tražena pozivnica nije pronađena.",
      },
      EMAIL_MISMATCH: {
        title: "Email se ne poklapa",
        message:
          "Ova pozivnica je poslata na drugu email adresu. Prijavite se sa tom adresom da biste je prihvatili.",
      },
    },
    course: {
      NOT_FOUND: {
        title: "Kurs nije pronađen",
        message: "Traženi kurs nije pronađen.",
      },
    },
    enrollment: {
      ALREADY_ENROLLED: {
        title: "Već ste upisani",
        message: "Već ste upisani na ovaj kurs.",
      },
      COURSE_NOT_FOUND: {
        title: "Kurs nije pronađen",
        message: "Kurs na koji pokušavate da se upišete nije pronađen.",
      },
      COURSE_PRIVATE: {
        title: "Kurs je privatan",
        message: "Ovaj kurs je privatan. Potrebna vam je pozivnica da biste se upisali.",
      },
      NOT_ENROLLED: {
        title: "Niste upisani",
        message: "Niste upisani na ovaj kurs.",
      },
      AI_ACCESS_DISABLED: {
        title: "AI pristup je isključen",
        message: "Autor ovog kursa nije dozvolio njegovo korišćenje u AI agentima.",
      },
    },
    lesson: {
      NOT_FOUND: {
        title: "Lekcija nije pronađena",
        message: "Tražena lekcija nije pronađena.",
      },
    },
    topic: {
      NOT_FOUND: {
        title: "Tema nije pronađena",
        message: "Tražena tema nije pronađena.",
      },
    },
    notification: {
      SUBSCRIPTION_NOT_FOUND: {
        title: "Pretplata nije pronađena",
        message: "Pretplata na obaveštenja nije pronađena.",
      },
    },
    ai: {
      INVALID_TOKEN: {
        title: "Nevažeći token",
        message: "Token je nevažeći ili je opozvan.",
      },
      LIMIT_REACHED: {
        title: "Dnevni AI limit je dostignut",
        message: "Iskoristili ste sva AI generisanja za danas. Pokušajte ponovo sutra.",
      },
      GENERATION_FAILED: {
        title: "AI generisanje nije uspelo",
        message:
          "AI ovog puta nije uspeo da napravi pitanja. Pokušajte ponovo ili ih napravite ručno.",
      },
    },
    apiToken: {
      NOT_FOUND: {
        title: "Token nije pronađen",
        message: "Token nije pronađen.",
      },
    },
    review: {
      NOT_FOUND: {
        title: "Recenzija nije pronađena",
        message: "Recenzija nije pronađena.",
      },
    },
    quiz: {
      NOT_FOUND: {
        title: "Kviz nije pronađen",
        message: "Kviz nije pronađen.",
      },
      PARENT_NOT_FOUND: {
        title: "Sadržaj nije pronađen",
        message: "Kurs, tema ili lekcija za ovaj kviz nije pronađena.",
      },
    },
    oauth: {
      INVALID_CLIENT: {
        title: "Nevažeći zahtev za povezivanje",
        message:
          "Aplikacija koja traži pristup nije ispravno registrovana. Pokušajte ponovo da se povežete.",
      },
    },
    progress: {
      LESSON_NOT_FOUND: {
        title: "Lekcija nije pronađena",
        message: "Lekcija za koju pratite napredak nije pronađena.",
      },
    },
  },
  notifications: {
    title: "Omoguciti obavestenja?",
    cancel: "Ne sada",
    enable: "Omoguci",
    creatorPrompt: "Omoguciti obavestenja kada se polaznici upisu na ovaj kurs ili ga zavrse?",
    learnerPrompt: "Omoguciti obavestenja kada ovaj kurs ili njegov autor imaju nov sadrzaj?",
    osReminderTitle: "Sve je spremno!",
    osReminderDescription:
      "Proverite da su obaveštenja omogućena na {{currentOS}} za {{currentBrowserName}}, kako bi se prikazivala kada ih dobijete.",
    osReminderConfirm: "Razumem",
    push: {
      courseEnrolled: {
        title: "Novi upis na kurs",
        body: "{{email}} se upisao/la na kurs {{courseName}}.",
      },
      courseCompleted: {
        title: "Kurs je završen! 🎉",
        body: "{{email}} je završio/la kurs {{courseName}} ✅",
      },
      privateCourseAttempt: {
        title: "Pokusaj upisa na privatni kurs",
        body: "{{email}} je pokusao/la da se upise na kurs {{courseName}}.",
      },
      courseUpdated: {
        title: "Kurs je azuriran",
        body: "Kurs {{courseName}} je azuriran.",
      },
      creatorNewCourse: {
        title: "Novi kurs",
        body: "Kurs {{courseName}} je sada dostupan.",
      },
    },
  },
};
