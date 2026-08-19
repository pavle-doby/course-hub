export const common = {
  helloWorld: "Zdravo, Svete!",
  hello: "Zdravo, {{name}}!",
  languageSwitcher: {
    sr: "SR",
    en: "EN",
  },
  errors: {
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
  },
};
