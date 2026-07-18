# DarkLight Events V2 Udviklingsregler

DarkLight Events er et fiktivt eventfirma til DreamLight FiveM RP. Systemet må ikke beskrives som en virkelig virksomhed, og indholdet skal holde sig i RP-universet.

## Grundregler

- V2 må ikke bruge `localStorage` til applikationsdata.
- Al permanent data skal gemmes i PostgreSQL.
- Prisma skal bruges som ORM og migrationslag.
- Next.js, TypeScript og Tailwind CSS er standard for appen.
- Koden skal holdes enkel, stabil og vedligeholdbar.
- Nye features skal passe til DreamLight/FiveM RP-konteksten.
- Tekster må ikke lyde som en IRL-virksomhed.

## Dataregler

- PostgreSQL er den primære datakilde.
- Prisma schema og migrations styrer databasestrukturen.
- Public sider skal vise data fra databasen.
- Adminhandlinger skal gemmes server-side.
- Ingen vigtig bruger-, event-, booking- eller resultatdata må kun findes i browseren.

## Roller

- En bruger har præcis én rolle.
- Roller styrer grundadgang.
- Gyldige roller er `SUPER_ADMIN`, `ADMIN`, `EVENT_MANAGER` og `USER`.

## Badges

- En bruger kan have flere badges.
- Badges er kun visuel status.
- Badges giver aldrig permissions eller adgang.
- Sponsor er et badge, ikke en rolle.
- Eksempler: Founder, Sponsor, Staff, VIP, Event Winner, Hall of Fame, Photographer og Host.

## Permissions

- Permissions er individuelle ekstrarettigheder.
- Kun `SUPER_ADMIN` og `ADMIN` kan administrere roller, badges og permissions.
- Permissions må ikke bruges som erstatning for hovedrollerne.
- Permissions skal kunne udvides senere uden at ødelægge RBAC-strukturen.

## Event- og resultatregler

- Kun `SUPER_ADMIN` og `ADMIN` kan registrere resultater.
- `EVENT_MANAGER` må kun styre events og eventafvikling.
- `EVENT_MANAGER` må ikke administrere roller, badges, permissions eller globale settings.
- `USER` kan styre egen profil, booke events og deltage.

## Sikkerhed og drift

- Destruktive handlinger skal kræve bekræftelse.
- Adminhandlinger bør logges i `AuditLog`.
- Login skal ske med brugernavn, ikke email.
- Adgangskoder skal hashes server-side med Argon2.
- `.env` må aldrig committes.

## Dokumentationsregler

- Dokumentation skal skrives på dansk.
- Dokumentation skal være praktisk for fremtidige Codex-opgaver.
- Dokumentation skal skelne tydeligt mellem eksisterende V1, planlagt V2 og fremtidige udvidelser.
