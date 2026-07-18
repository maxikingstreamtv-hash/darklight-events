# DarkLight Events V2 User Management

Dette dokument beskriver noter for Sprint 2 user management.

## Implementeret uden schemaændringer

- Admin/Super Admin kan se brugeroversigt.
- Admin/Super Admin kan oprette brugere.
- Adgangskoder hashes med Argon2.
- Roller kan redigeres efter RBAC-regler.
- Badges kan tildeles og fjernes.
- Permissions kan tildeles og fjernes.
- Ændringer skrives til `AuditLog`.
- `passwordHash` vises ikke i UI.

## Aktivering/deaktivering

Det nuværende `User` schema har ikke et felt til aktivering eller deaktivering.

Nødvendig schemaændring senere:

```prisma
model User {
  isActive Boolean @default(true)
}
```

Auth-flowet skal derefter afvise login for brugere med `isActive = false`.

## Soft delete

Det nuværende `User` schema har ikke felter til soft delete.

Mulige schemafelter senere:

```prisma
model User {
  deletedAt DateTime?
  deletedBy String?
}
```

User queries skal derefter filtrere `deletedAt = null`, og admin UI skal vise slettede brugere separat hvis ønsket.

## Vigtige regler

- Sponsor er badge, ikke rolle.
- Dommer er ikke en rolle i systemet.
- Badges giver ikke adgang.
- Permissions kan give individuelle ekstrarettigheder.
- ADMIN må ikke oprette eller tildele `SUPER_ADMIN`.
- Kun `SUPER_ADMIN` og `ADMIN` må administrere brugere.
