# DarkLight Events Changelog

Dette changelog beskriver større projektændringer for DarkLight Events V2.

## V2 setup

Status: igangsat.

Tilføjet:

- PostgreSQL/Neon er forbundet som database.
- Prisma er installeret.
- Initial Prisma schema er migreret til databasen.
- V2 blueprint er oprettet i `docs/blueprint.md`.
- Authentication architecture er dokumenteret i `docs/authentication.md`.
- Udviklingsregler er dokumenteret i `docs/development-rules.md`.
- Roadmap er dokumenteret i `docs/roadmap.md`.
- Databaseoversigt er dokumenteret i `docs/database.md`.
- Roller og permissions er dokumenteret i `docs/permissions.md`.
- API-plan er dokumenteret i `docs/api-plan.md`.
- UI guidelines er dokumenteret i `docs/ui-guidelines.md`.

Bemærkninger:

- `.env` skal forblive lokal og må ikke committes.
- V2 skal bruge PostgreSQL og Prisma til permanent data.
- V2 må ikke bruge `localStorage` til applikationsdata.
- Discord OAuth er kun planlagt som fremtidig mulighed og er ikke implementeret.

## Sprint 2: User Management Foundation

Tilføjet:

- Beskyttet admin user management under `/admin/users`.
- Brugeroversigt med søgning, rollefilter og pagination.
- Opret bruger med Argon2-hashet adgangskode.
- Rediger bruger, rolle, avatar og bio.
- Badge assignment/removal.
- Permission assignment/removal.
- Audit logs for brugerændringer, rolleændringer, badges, permissions og passwordændringer.
- Dokumenteret manglende schemafelter for aktivering/deaktivering og soft delete i `docs/user-management.md`.

## Sprint: Vehicle Profiles and Inspection Checklists

Tilføjet:

- Databasemodeller til køretøjer, køretøjsinspektioner, checklist items og checklist templates.
- Prisma migration `20260710081424_add_vehicle_profiles`.
- Adminområde under `/admin/vehicles`, `/admin/vehicles/create` og `/admin/vehicles/[id]`.
- Søge- og filtermuligheder for køretøjer.
- Server-side beskyttede actions for oprettelse, redigering, deaktivering, inspektioner og checklist ændringer.
- Read-only køretøjsvisning for EVENT_MANAGER.
- Read-only køretøjsoversigt på brugerprofilen.
- Køretøjsoversigt på admin bruger-detaljesiden.
- Audit logs for køretøjer, inspektioner og checklist ændringer.
- Fjernet kendte real-life bilmærker fra eksisterende køretøjs-/driverdemoer.
- Dokumentation i `docs/vehicle-management.md`.

Bemærkninger:

- Køretøjsdata i V2 skal gemmes i PostgreSQL via Prisma.
- Badges giver fortsat ingen adgang.
- Brugere kan se egne køretøjer, men kan ikke redigere dem.

## Sprint: Reset og Data Management

Tilføjet:

- Databasemodeller til `Sponsor`, `BookingRequest`, `ContactMessage` og `EventPermission`.
- Prisma migrationer:
  - `20260710092655_add_data_management_models`
  - `20260710092838_add_event_permissions`
- `/sponsorer` og `/sponsorer/[id]` læser nu kun sponsorer fra PostgreSQL.
- Fjernet hardcodede demo-sponsorer fra `data/sponsors.ts`.
- `/galleri` læser nu `GalleryImage` fra PostgreSQL og viser empty state ved tom database.
- `/tilladelser` og `/tilladelser/[id]` læser nu `EventPermission` fra PostgreSQL og viser empty state ved tom database.
- Bookingformularen gemmer `BookingRequest` i PostgreSQL.
- Kontaktformularen gemmer `ContactMessage` i PostgreSQL.
- Admin Data Control kører reset via server actions med SUPER_ADMIN-check.
- Reset actions skriver `AuditLog` med modul og antal nulstillede databaseposter.

Bemærkninger:

- Reset af Sponsor sletter database-sponsorprofiler og genskaber ikke demo-data.
- Sponsor-badge på brugere er fortsat separat fra sponsorprofiler.
- Legacy EventOS-paneler kan stadig bruge V1 localStorage til lokale live-workflows, men V2-public sponsor, galleri, tilladelser, kontakt og bookingforespørgsler er database-backed.

## Sprint: FAQ og Regelsæt Manager

Tilføjet:

- Databasemodeller til `FaqItem` og `RuleSet`.
- Prisma migration `20260710113041_add_faq_rules_content`.
- One-time content seed via `scripts/seed-content.ts`.
- Public `/faq` læser nu aktive FAQ-punkter fra PostgreSQL.
- Public `/regelsaet` læser nu aktive regelsæt fra PostgreSQL.
- Admin FAQ Manager har inline editor med spørgsmål, note, svar, status og sortering.
- Admin Regelsæt Manager har inline editor med titel, kort beskrivelse, fuldt indhold, status og sortering.
- FAQ/regler gemmes via server actions med SUPER_ADMIN/ADMIN-check.
- FAQ/regler skriver `AuditLog` ved redigering og arkivering.
- Fjernet den falske placeholder-adfærd fra rediger-knapperne.
