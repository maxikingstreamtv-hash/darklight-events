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
