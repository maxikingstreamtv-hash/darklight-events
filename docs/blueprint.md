# DarkLight Events V2 Blueprint

DarkLight Events er et fiktivt eventfirma til DreamLight FiveM RP. Projektet skal understotte events, booking, deltagere, resultater, badges, galleri og administration i et samlet system. Det er ikke en virkelig virksomhed, og systemet skal ikke bruge IRL-data.

## 1. Projektmal

DarkLight Events V2 skal bygge videre pa V1 og flytte al vigtig data fra lokal browserlagring til en rigtig database. Malet er et stabilt, professionelt og rollestyret event-system til DreamLight RP, hvor brugere kan tilmelde sig events, admins kan styre indhold, og resultater kan gemmes permanent.

V2 skal fokusere pa:

- En rigtig PostgreSQL database som datakilde.
- Login og brugerroller.
- Admin-styring af events, bookinger, resultater, badges og tilladelser.
- Synkroniserede public sider, sa forsiden, events, rangliste og Hall of Fame viser samme data som adminsystemet.
- Klar adskillelse mellem roller, badges og permissions.
- Ingen brug af localStorage til permanent data.

## 2. Teknisk stack

V2 skal bygges med folgende teknologier:

- Next.js til frontend, routing og serverfunktionalitet.
- TypeScript til typesikker kode.
- Tailwind CSS til styling og eksisterende designsystem.
- PostgreSQL som primar database.
- Prisma som ORM og migrationslag.
- Vercel til deployment.
- GitHub til versionsstyring, commits og release-flow.

## 3. Roller

Roller bestemmer brugerens grundadgang i systemet.

### SUPER_ADMIN

SUPER_ADMIN har fuld adgang til hele systemet. Rollen kan styre brugere, roller, badges, permissions, events, resultater, bookinger, galleri, sponsorer, Hall of Fame, settings og systemdata.

### ADMIN

ADMIN har naesten fuld adgang. Rollen kan styre events, brugere, badges, permissions, resultater, bookinger, galleri, sponsorer og indhold. ADMIN bor ikke kunne fjerne eller overtage SUPER_ADMIN uden ekstra sikkerhed.

### EVENT_MANAGER

EVENT_MANAGER kan oprette og styre events. Rollen kan arbejde med eventdetaljer, deltagere, check-in og eventafvikling, men har ikke fuld systemadgang.

### USER

USER er en normal bruger. Rollen kan oprette profil, logge ind, booke events, deltage i events og se egne resultater, statistikker, badges og historik.

## 4. Badges

Badges giver ikke adgang i systemet. De er kun visuel status pa en brugerprofil eller i offentlige visninger.

En bruger kan have flere badges. Badges kan bruges til at vise tilknytning, status, historik eller anerkendelse.

Eksempler pa badges:

- Founder
- Sponsor
- Staff
- VIP
- Event Winner
- Hall of Fame
- Photographer
- Host

Badges ma ikke bruges som erstatning for roller eller permissions. Hvis en bruger skal have adgang til en funktion, skal det styres med rolle eller permission.

## 5. Permissions

Permissions er ekstra rettigheder, som kan gives til brugere udover deres rolle.

SUPER_ADMIN og ADMIN kan give og fjerne:

- Badges
- Permissions
- Roller

Permissions kan bruges til saerlige rettigheder senere, for eksempel adgang til bestemte adminmoduler, saerlige handlinger eller fremtidige features.

Permissions skal vaere fleksible, men ma ikke skabe forvirring omkring hovedrollerne. Roller er grundadgang, permissions er ekstra rettigheder, og badges er kun visuel status.

## 6. Database-modeller

### User

User reprasenterer en konto i systemet. Modellen skal indeholde loginoplysninger, visningsnavn, rolle, profiloplysninger og relationer til badges, permissions, bookinger, resultater og audit logs.

### Badge

Badge beskriver en visuel status, som kan tildeles brugere. Den kan have navn, label, beskrivelse, ikon og farve.

### UserBadge

UserBadge forbinder en bruger med et badge. En bruger kan have mange badges, og et badge kan bruges pa mange brugere.

### Permission

Permission beskriver en saerlig rettighed i systemet. Den kan bruges til fremtidige adgangsregler uden at oprette nye roller.

### UserPermission

UserPermission forbinder en bruger med en permission. Den bruges til at give individuelle ekstrarettigheder.

### Event

Event beskriver et DarkLight event. Modellen skal indeholde titel, slug, beskrivelse, billede/banner, lokation, starttid, sluttid, deltagergranse, status og relationer til bookinger, konkurrencer, galleri og Hall of Fame.

### Booking

Booking beskriver en brugers tilmelding eller foresporgsel til et event. Den skal kunne have status som afventende, godkendt, afvist eller annulleret.

### Competition

Competition beskriver en konkurrence under et event. Et event kan have flere konkurrencer, for eksempel drift, race, drag, car show eller burnout.

### Participant

Participant beskriver en deltager i en konkurrence. Modellen skal kunne indeholde navn, koeretoj, nummer, team og relation til resultater.

### Result

Result beskriver et resultat for en deltager i en konkurrence. Modellen skal indeholde placering, point, noter og hvem der har registreret resultatet.

### HallOfFame

HallOfFame beskriver offentliggjorte vindere eller historiske hojdepunkter. Data skal forst vises offentligt, nar vindere er offentliggjort.

### GalleryImage

GalleryImage beskriver billeder i galleriet. Billeder kan knyttes til et event eller vaere generelle DarkLight billeder.

### AuditLog

AuditLog gemmer vigtige adminhandlinger. Den skal bruges til sporbarhed, sa man kan se hvem der har oprettet, redigeret, slettet eller aendret vigtige data.

## 7. Regler

- Sponsor er et badge, ikke en rolle.
- Dommer er ikke en rolle i systemet.
- Kun SUPER_ADMIN og ADMIN kan registrere resultater.
- EVENT_MANAGER kan styre events.
- USER kan booke og deltage.
- Alt permanent data skal gemmes i PostgreSQL.
- Ingen localStorage i V2.
- Badges giver aldrig adgang.
- Roller og permissions styrer adgang.
- Public sider ma kun vise data fra databasen.
- Destruktive adminhandlinger skal have bekraeftelse.

## 8. Roadmap

### Fase 1: Database og Prisma

Opsaet PostgreSQL, Prisma schema, migrations og grundmodeller. Sikr at databasen kan versioneres og deployes korrekt.

### Fase 2: Login

Byg login, registrering, sessioner og sikker adgang til brugerdata. Brugere skal kunne logge ind og se egen profil.

### Fase 3: Roller, badges og permissions

Implementer rollebaseret adgang, badge-tildeling og permissions. Gør det tydeligt i admin, hvad der er rolle, badge og permission.

### Fase 4: Admin dashboard

Byg et samlet admin dashboard til styring af systemets vigtigste data. Dashboardet skal have klare handlinger, bekraeftelser og audit logs.

### Fase 5: Events

Flyt eventstyring til databasen. Events skal kunne oprettes, redigeres, arkiveres og vises offentligt.

### Fase 6: Booking

Implementer bookingflow, hvor brugere kan tilmelde sig events, og admins kan godkende, afvise eller annullere bookinger.

### Fase 7: Resultater og Hall of Fame

Implementer resultatregistrering, rangliste og Hall of Fame. Hall of Fame skal kun opdateres, nar vindere offentliggores.

### Fase 8: Galleri

Implementer galleri med billeder knyttet til events eller generelle DarkLight visninger.

### Fase 9: Sponsorer

Implementer sponsorvisning baseret pa badges og/eller sponsorindhold. Sponsor er ikke en rolle.

### Fase 10: Settings Center

Byg et Settings Center, hvor SUPER_ADMIN kan konfigurere systemets indhold og valgmuligheder uden kodeaendringer.

## 9. Settings Center

Settings Center skal pa sigt give SUPER_ADMIN mulighed for at konfigurere centrale dele af DarkLight Events uden at aendre kode.

SUPER_ADMIN skal senere kunne konfigurere:

- Badges
- Konkurrencetyper
- Eventkategorier
- Forsiden
- Sponsorer
- Hall of Fame
- Generelle tekster

Settings Center skal vaere et kontrolleret adminomrade. Aendringer skal gemmes i PostgreSQL og gerne logges i AuditLog, sa vigtige aendringer kan spores.
