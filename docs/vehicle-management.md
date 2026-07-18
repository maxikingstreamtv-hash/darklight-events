# DarkLight Events V2 Vehicle Management

Vehicle Management beskriver køretøjsprofiler og inspektionschecklister for DarkLight Events V2. Modulet er bygget til en fiktiv FiveM / DreamLight RP-kontekst og må ikke bruge virkelige bilmærker eller producentnavne.

## Formål

Køretøjsmodulet skal gøre det muligt at:

- tildele køretøjer til brugere
- vise køretøjer på brugerprofiler
- oprette flere inspektioner pr. køretøj
- styre checklist items pr. inspektion
- bruge checklist templates som baseline
- logge vigtige ændringer i `AuditLog`

Alt køretøjsdata skal gemmes i PostgreSQL via Prisma.

## Adgang

### SUPER_ADMIN

Har fuld adgang til køretøjer, inspektioner og checklist templates.

### ADMIN

Har adgang til at oprette, redigere, deaktivere og inspicere køretøjer.

### EVENT_MANAGER

Har read-only adgang til adminoversigten. Rollen kan se køretøjer og inspektionsstatus, men kan ikke ændre data.

### USER

Kan se egne tildelte køretøjer på profilen. USER kan læse checklist krav og seneste inspektionsstatus, men kan ikke redigere køretøjer eller checklister.

## Roller og badges

Køretøjsadgang styres af roller og server-side checks.

- Badges giver aldrig adgang.
- Sponsor er badge, ikke rolle.
- Dommer er ikke en systemrolle.

## Database

Modulet bruger:

- `Vehicle`
- `VehicleInspection`
- `VehicleChecklistItem`
- `VehicleChecklistTemplate`
- `VehicleChecklistTemplateItem`

Se `docs/database.md` for feltbeskrivelser og relationer.

## Admin-routes

### `/admin/vehicles`

Oversigt over køretøjer med:

- søgning på navn, spawncode og nummerplade
- filter på ejer
- filter på køretøjsstatus
- filter på inspektionsstatus
- adgang til checklist templates

### `/admin/vehicles/create`

Formular til at tildele et køretøj til en bruger.

### `/admin/vehicles/[id]`

Detaljeside med:

- køretøjsredigering
- deaktivering
- inspektionsoprettelse
- inspektionsstatus
- checklist item editor
- adminnoter pr. checklist item

## Brugerprofil

`/profile` viser kun køretøjer, som er tildelt den aktuelle bruger.

Profilen viser:

- køretøjsnavn
- nummerplade
- klasse
- status
- seneste inspektionsstatus
- læsbare checklist krav

Brugeren kan ikke redigere data herfra.

## Checklist templates

Admins kan oprette genbrugelige templates, som senere kan anvendes på inspektioner.

En template består af:

- navn
- beskrivelse
- kategorier
- checklist items
- required flag
- sort order

Indbygget Performance-template:

- Motor Tier
- Bil Class
- Nitro
- Bremser
- Armor

## Køretøjsnavne

Brug kun neutrale FiveM-/in-game-navne, for eksempel:

- Elegy Retro Custom
- Sultan RS
- Jester Classic
- Dominator
- Banshee

Undgå altid virkelige bilmærker og producentnavne.

## Audit logs

Følgende handlinger skal logges:

- vehicle assigned
- vehicle edited
- vehicle removed/deactivated
- inspection created
- checklist changed
- inspection approved/rejected

Audit logs skal gemme aktør, action, target type, target id og metadata uden at lække følsomme data.

## Vigtige regler

- Ingen `localStorage` til køretøjsdata.
- Ingen hardcodede køretøjsprofiler i V2.
- Alle writes skal beskyttes server-side.
- Frontend må gerne skjule knapper, men sikkerheden skal ligge på serveren.
- Deaktivering foretrækkes frem for destruktiv sletning.
- Virkelige bilmærker må ikke optræde i platformens køretøjsprofiler eller demoindhold.
