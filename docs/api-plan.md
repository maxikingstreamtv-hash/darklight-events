# DarkLight Events V2 API-plan

Dette dokument beskriver planlagte API-områder for DarkLight Events V2. Ruterne er kun planlagt her og skal ikke implementeres som del af dette dokument.

## Auth

Formål: login, logout og sessions.

Mulige routes:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `POST /api/auth/register`

Regler:

- Login sker med brugernavn, ikke email.
- Passwords hashes med Argon2.
- Session må ikke eksponere password hash.

## Users

Formål: brugeradministration og profil.

Mulige routes:

- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/me`
- `PATCH /api/me`

Adgang:

- SUPER_ADMIN og ADMIN kan administrere brugere.
- USER kan kun administrere egen profil.

## Badges

Formål: administrere visuelle brugerbadges.

Mulige routes:

- `GET /api/badges`
- `POST /api/badges`
- `PATCH /api/badges/:id`
- `DELETE /api/badges/:id`
- `POST /api/users/:id/badges`
- `DELETE /api/users/:id/badges/:badgeId`

Adgang:

- SUPER_ADMIN og ADMIN.

## Permissions

Formål: administrere individuelle ekstrarettigheder.

Mulige routes:

- `GET /api/permissions`
- `POST /api/permissions`
- `PATCH /api/permissions/:id`
- `DELETE /api/permissions/:id`
- `POST /api/users/:id/permissions`
- `DELETE /api/users/:id/permissions/:permissionId`

Adgang:

- SUPER_ADMIN og ADMIN.

## Events

Formål: oprette og styre events.

Mulige routes:

- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/events`
- `PATCH /api/events/:id`
- `DELETE /api/events/:id`
- `POST /api/events/:id/archive`

Adgang:

- Public kan læse public events.
- SUPER_ADMIN, ADMIN og EVENT_MANAGER kan styre events.

## Bookings

Formål: håndtere tilmeldinger og bookinger.

Mulige routes:

- `GET /api/bookings`
- `GET /api/bookings/:id`
- `POST /api/bookings`
- `PATCH /api/bookings/:id`
- `POST /api/bookings/:id/approve`
- `POST /api/bookings/:id/reject`
- `POST /api/bookings/:id/cancel`

Adgang:

- USER kan oprette og se egne bookinger.
- SUPER_ADMIN og ADMIN kan administrere alle bookinger.

## Competitions

Formål: styre konkurrencer under events.

Mulige routes:

- `GET /api/competitions`
- `GET /api/competitions/:id`
- `POST /api/competitions`
- `PATCH /api/competitions/:id`
- `DELETE /api/competitions/:id`
- `POST /api/competitions/:id/participants`
- `PATCH /api/participants/:id`
- `DELETE /api/participants/:id`

Adgang:

- SUPER_ADMIN, ADMIN og EVENT_MANAGER.

## Results

Formål: registrere og vedligeholde resultater.

Mulige routes:

- `GET /api/results`
- `GET /api/results/:id`
- `POST /api/results`
- `PATCH /api/results/:id`
- `DELETE /api/results/:id`
- `POST /api/results/:id/approve`
- `POST /api/results/:id/reject`

Adgang:

- SUPER_ADMIN og ADMIN.

## Hall of Fame

Formål: offentliggøre vindere og historiske højdepunkter.

Mulige routes:

- `GET /api/hall-of-fame`
- `POST /api/hall-of-fame`
- `PATCH /api/hall-of-fame/:id`
- `DELETE /api/hall-of-fame/:id`
- `POST /api/events/:id/publish-winners`

Adgang:

- Public kan læse offentlig Hall of Fame.
- SUPER_ADMIN og ADMIN kan administrere.

## Gallery

Formål: administrere billeder.

Mulige routes:

- `GET /api/gallery`
- `POST /api/gallery`
- `PATCH /api/gallery/:id`
- `DELETE /api/gallery/:id`

Adgang:

- Public kan læse public galleri.
- SUPER_ADMIN og ADMIN kan administrere.
- Særlig galleri-permission kan gives senere.

## Settings

Formål: konfigurere systemindhold.

Mulige routes:

- `GET /api/settings`
- `PATCH /api/settings`
- `GET /api/settings/badges`
- `GET /api/settings/event-categories`
- `GET /api/settings/competition-types`

Adgang:

- SUPER_ADMIN.
- ADMIN kun hvis brugeren har `MANAGE_SETTINGS`.
