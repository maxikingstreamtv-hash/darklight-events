# DarkLight Events V2 Database

Databasen er bygget til PostgreSQL og styres med Prisma. Alle modeller beskriver DarkLight Events som et fiktivt DreamLight FiveM RP-eventsystem.

## User

`User` repræsenterer en konto i systemet.

Vigtige relationer:

- En bruger kan have mange `UserBadge`.
- En bruger kan have mange `UserPermission`.
- En bruger kan oprette mange `Event` via relationen `CreatedEvents`.
- En bruger kan have mange `Booking`.
- En bruger kan registrere mange `Result` via relationen `ResultCreatedBy`.
- En bruger kan være aktør på mange `AuditLog`.

Brugeren har én rolle via `role`.

## Badge

`Badge` beskriver en visuel status, for eksempel Sponsor, VIP eller Hall of Fame.

Vigtige relationer:

- Et badge kan være knyttet til mange brugere via `UserBadge`.

Badges giver ikke adgang.

## UserBadge

`UserBadge` forbinder `User` og `Badge`.

Vigtige relationer:

- Én `UserBadge` tilhører én bruger.
- Én `UserBadge` tilhører ét badge.
- Kombinationen af `userId` og `badgeId` er unik, så samme badge ikke gives to gange til samme bruger.

## Permission

`Permission` beskriver en individuel rettighed, som kan gives til brugere.

Vigtige relationer:

- En permission kan gives til mange brugere via `UserPermission`.

Permissions bruges til ekstra adgang udover rolle.

## UserPermission

`UserPermission` forbinder `User` og `Permission`.

Vigtige relationer:

- Én `UserPermission` tilhører én bruger.
- Én `UserPermission` tilhører én permission.
- Kombinationen af `userId` og `permissionId` er unik.

## Event

`Event` beskriver et DarkLight event.

Vigtige relationer:

- Et event oprettes af én `User`.
- Et event kan have mange `Booking`.
- Et event kan have mange `Competition`.
- Et event kan have mange `GalleryImage`.
- Et event kan have mange `HallOfFame`-indslag.

Eventstatus styrer om eventet er kladde, kommende, aktivt, afsluttet eller annulleret.

## Booking

`Booking` beskriver en brugers tilmelding eller booking til et event.

Vigtige relationer:

- En booking tilhører én `User`.
- En booking tilhører ét `Event`.
- Kombinationen af `userId` og `eventId` er unik, så samme bruger ikke booker samme event flere gange.

Bookingstatus kan være afventende, godkendt, afvist eller annulleret.

## Competition

`Competition` beskriver en konkurrence under et event.

Vigtige relationer:

- En competition tilhører ét `Event`.
- En competition kan have mange `Participant`.
- En competition kan have mange `Result`.

Competition type kan for eksempel være drift, drag, race, car show, burnout, bike meet eller andet.

## Participant

`Participant` beskriver en deltager i en konkurrence.

Vigtige relationer:

- En participant tilhører én `Competition`.
- En participant kan have mange `Result`.

Participant kan have navn, køretøj, nummer og team.

## Result

`Result` beskriver et resultat for en deltager i en konkurrence.

Vigtige relationer:

- Et resultat tilhører én `Competition`.
- Et resultat tilhører én `Participant`.
- Et resultat registreres af én `User`.

Resultater bruges senere til rangliste, profiler og Hall of Fame-flow.

## HallOfFame

`HallOfFame` beskriver offentliggjorte vindere og historiske højdepunkter.

Vigtige relationer:

- Et Hall of Fame-indslag tilhører ét `Event`.

Hall of Fame skal kun vise officielle, offentliggjorte resultater.

## GalleryImage

`GalleryImage` beskriver et billede i galleriet.

Vigtige relationer:

- Et billede kan være knyttet til ét `Event`.
- Hvis eventet slettes, sættes `eventId` til null.

Billeder kan også bruges som generelle DarkLight-galleribilleder uden eventrelation.

## AuditLog

`AuditLog` gemmer vigtige systemhandlinger.

Vigtige relationer:

- En audit log kan have én `User` som aktør.
- Hvis brugeren slettes, bevares loggen med `actorId` sat til null.

AuditLog bør bruges til oprettelse, redigering, sletning, rolleændringer, badgeændringer, permissionændringer og resultatændringer.
