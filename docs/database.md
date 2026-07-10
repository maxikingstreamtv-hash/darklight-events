# DarkLight Events V2 Database

Databasen er bygget til PostgreSQL og styres med Prisma. Alle modeller beskriver DarkLight Events som et fiktivt DreamLight FiveM RP-eventsystem, ikke en virkelig virksomhed.

## User

`User` repræsenterer en konto i systemet.

Vigtige relationer:

- En bruger kan have mange `UserBadge`.
- En bruger kan have mange `UserPermission`.
- En bruger kan oprette mange `Event` via relationen `CreatedEvents`.
- En bruger kan have mange `Booking`.
- En bruger kan registrere mange `Result` via relationen `ResultCreatedBy`.
- En bruger kan eje mange `Vehicle`.
- En bruger kan oprette mange `Vehicle`.
- En bruger kan være inspektør på mange `VehicleInspection`.
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

Permissions bruges til ekstra adgang ud over rolle.

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

Participant kan have navn, køretøj, nummer og team. Køretøjsnavne skal være FiveM-/in-game-navne og må ikke bruge virkelige bilmærker.

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

## Sponsor

`Sponsor` beskriver en offentlig sponsorprofil eller RP-partneraftale.

Vigtige felter:

- `slug`: bruges til public detaljeside.
- `name`, `level`, `status`, `description` og `logoInitials`: styrer public sponsorvisning.
- `eventsSupported`: liste over eventnavne eller sponsorområder.

Sponsorprofiler er separate fra Sponsor-badges på brugere. En bruger med Sponsor-badge får ikke automatisk sponsorprofil eller systemadgang.

## BookingRequest

`BookingRequest` beskriver en fri bookingforespørgsel fra public bookingformularen.

Den bruges til henvendelser, hvor der endnu ikke findes et konkret `Event` i databasen. Reset af bookingforespørgsler sletter kun `BookingRequest`, ikke brugere eller eventbookinger.

## ContactMessage

`ContactMessage` beskriver en besked fra public kontaktformularen.

Kontaktbeskeder gemmes i PostgreSQL og kan nulstilles fra Admin Data Control.

## EventPermission

`EventPermission` beskriver en RP-eventtilladelse til public `/tilladelser`.

Den er separat fra auth-modellen `Permission`, som styrer systemadgang. Reset af eventtilladelser må ikke slette brugerpermissions eller roller.

## FaqItem

`FaqItem` beskriver et public FAQ-punkt.

Vigtige felter:

- `question`: spørgsmålet eller titlen.
- `note`: kort intern/offentlig note.
- `answer`: det fulde svar.
- `status`: `ACTIVE` eller `ARCHIVED`.
- `sortOrder`: styrer rækkefølge på public `/faq`.

FAQ redigeres fra adminpanelet og gemmes i PostgreSQL.

## RuleSet

`RuleSet` beskriver et public regelsæt-afsnit.

Vigtige felter:

- `title`: overskrift.
- `summary`: kort beskrivelse.
- `content`: fuldt regelindhold som tekst.
- `rules`: linjeopdelt liste til public visning.
- `status`: `ACTIVE` eller `ARCHIVED`.
- `sortOrder`: styrer rækkefølge på public `/regelsaet`.

Regelsæt redigeres fra adminpanelet og gemmes i PostgreSQL.

## Vehicle

`Vehicle` beskriver et databasegemt køretøj, som er tildelt en brugerprofil.

Vigtige felter:

- `ownerId`: brugeren der ejer eller har fået tildelt køretøjet.
- `displayName`: synligt in-game køretøjsnavn.
- `modelName` og `spawnCode`: valgfri FiveM-/in-game-reference.
- `licensePlate`, `vehicleClass`, `description` og `imageUrl`: valgfri profilfelter.
- `status`: `ACTIVE`, `INACTIVE` eller `SUSPENDED`.
- `createdById`: adminbrugeren der oprettede køretøjet.

Vigtige relationer:

- Ét køretøj tilhører én owner via `VehicleOwner`.
- Ét køretøj er oprettet af én bruger via `VehicleCreatedBy`.
- Ét køretøj kan have mange `VehicleInspection`.

Køretøjsdata skal gemmes i PostgreSQL. V2 må ikke bruge `localStorage` eller hardcodede arrays til køretøjsprofiler.

## VehicleInspection

`VehicleInspection` beskriver en konkret inspektion af et køretøj.

Vigtige felter:

- `vehicleId`: køretøjet der inspiceres.
- `title`: navn på inspektionen.
- `notes`: interne noter.
- `status`: `PENDING`, `IN_PROGRESS`, `APPROVED` eller `REJECTED`.
- `inspectedById` og `inspectedAt`: sættes når en inspektion godkendes eller afvises.

Vigtige relationer:

- Én inspektion tilhører ét `Vehicle`.
- Én inspektion kan have mange `VehicleChecklistItem`.
- Én inspektion kan have én valgfri inspektør.

## VehicleChecklistItem

`VehicleChecklistItem` beskriver ét punkt på en inspektionscheckliste.

Vigtige felter:

- `category`: `PERFORMANCE`, `ENGINE`, `SAFETY`, `DOCUMENTS`, `REQUIRED_EQUIPMENT`, `EXTERIOR` eller `OTHER`.
- `label`: punktets navn.
- `description`: valgfri forklaring.
- `result`: `NOT_CHECKED`, `APPROVED`, `REJECTED` eller `NOT_APPLICABLE`.
- `required`: markerer om punktet er obligatorisk.
- `sortOrder`: styrer rækkefølge.
- `adminNote`: intern adminnote.

Vigtige relationer:

- Ét checklist item tilhører én `VehicleInspection`.

## VehicleChecklistTemplate

`VehicleChecklistTemplate` beskriver en genbrugelig skabelon, som admins kan bruge når de opretter inspektioner.

Vigtige relationer:

- Én template kan have mange `VehicleChecklistTemplateItem`.
- Template-navn er unikt.

Templates er valgfrie og bruges til at standardisere krav som motor, sikkerhed, dokumenter og obligatorisk udstyr.

## VehicleChecklistTemplateItem

`VehicleChecklistTemplateItem` beskriver et standardpunkt i en checklist template.

Vigtige felter:

- `category`
- `label`
- `description`
- `required`
- `sortOrder`

Når en template bruges på en inspektion, kopieres punkterne til konkrete `VehicleChecklistItem`-records.

## AuditLog

`AuditLog` gemmer vigtige systemhandlinger.

Vigtige relationer:

- En audit log kan have én `User` som aktør.
- Hvis brugeren slettes, bevares loggen med `actorId` sat til null.

AuditLog bør bruges til oprettelse, redigering, sletning/deaktivering, rolleændringer, badgeændringer, permissionændringer, resultatændringer, køretøjsændringer og inspektionsændringer.
