# DarkLight Events V2 Roadmap

DarkLight Events V2 skal flytte projektet fra lokal V1-logik til en databasebaseret, rollestyret og professionel RP-eventplatform til DreamLight FiveM.

## 1. Foundation

Formål: etablere den tekniske bund.

- PostgreSQL/Neon som database.
- Prisma schema og migrations.
- Grundlæggende projektstruktur.
- Miljøvariabler og sikker konfiguration.
- Dokumentation for V2-regler.

## 2. Authentication

Formål: sikre login og sessions.

- Login med brugernavn og adgangskode.
- Argon2 password hashing.
- Sessionhåndtering.
- Logout.
- Route protection.
- Dashboard redirect efter rolle.

## 3. User Management

Formål: give admins kontrol over brugere.

- Opret, rediger og deaktiver brugere.
- Tildel rolle.
- Tildel badges.
- Tildel permissions.
- Vis brugerhistorik og relevante audit logs.
- Vis tildelte køretøjer på brugerens adminprofil.

## 4. Admin Dashboard

Formål: samle systemstyring i et rent adminmiljø.

- Oversigt over events, bookinger, brugere og resultater.
- Hurtige statuskort.
- Adminnavigation.
- Bekræftelser ved destruktive handlinger.
- AuditLog-visning.

## 5. Event Management

Formål: styre alle events fra databasen.

- Opret event.
- Rediger event.
- Arkiver event.
- Slet event med bekræftelse.
- Publicer event til public `/events`.
- Knyt konkurrencer, deltagere og galleri til event.

## 6. Booking

Formål: gøre tilmelding og booking databasebaseret.

- USER kan booke events.
- Admin kan godkende, afvise og annullere bookinger.
- Bruger kan se egne bookinger.
- Eventdetaljer viser korrekt bookingstatus.

## 7. Competitions

Formål: strukturere konkurrencer under events.

- Opret konkurrencer pr. event.
- Vælg konkurrencetype.
- Tilføj og rediger deltagere.
- Check-in flow for deltagere.
- Event Manager kan styre eventafvikling.

## 8. Results

Formål: registrere og styre resultater korrekt.

- Kun SUPER_ADMIN og ADMIN kan registrere resultater.
- Resultater knyttes til competition og participant.
- Rediger og slet resultater med bekræftelse.
- Rangliste opdateres fra godkendte resultater.
- Undgå dubletter.

## 9. Hall of Fame

Formål: vise officielle vindere og historiske højdepunkter.

- Hall of Fame opdateres først ved offentliggørelse.
- Knyt Hall of Fame-indslag til event.
- Vis titel, vinder, år, billede og noter.
- Hold public visning synkroniseret med databasen.

## 10. Gallery

Formål: samle eventbilleder og DarkLight stemningsbilleder.

- Upload eller registrer billeder.
- Knyt billeder til events.
- Vis billeder på public galleri.
- Gør fotograf-badge og fotografnavn muligt.

## 11. Sponsors

Formål: vise sponsorer i RP-konteksten.

- Sponsor er badge, ikke rolle.
- Sponsorer kan vises på public sponsorområde.
- Admin kan styre sponsorindhold.
- Sponsorvisning skal ikke give systemadgang.

## 12. Vehicle Profiles

Formål: gøre køretøjsprofiler og inspektioner databasebaserede.

- SUPER_ADMIN og ADMIN kan tildele køretøjer til brugere.
- EVENT_MANAGER kan se køretøjer og inspektionsstatus read-only.
- USER kan se egne køretøjer på profilen.
- Inspektioner kan have checklist items, status og adminnoter.
- Checklist templates kan genbruges på flere inspektioner.
- Virkelige bilmærker må ikke bruges i UI, demoindhold eller profiler.

## 13. Settings Center

Formål: gøre V2 konfigurerbar uden kodeændringer.

- Badges.
- Konkurrencetyper.
- Eventkategorier.
- Forsidetekster.
- Sponsorindhold.
- Hall of Fame-tekster.
- Generelle tekster.
- Fremtidige køretøjsklasser og checklist defaults.

## 14. Future Discord OAuth

Formål: planlægge fremtidig Discord-login uden at implementere det nu.

- Login via Discord som fremtidig mulighed.
- Knyt Discord-id til eksisterende User.
- Discord må ikke give adminadgang automatisk.
- Roller, badges og permissions styres fortsat i DarkLight adminsystemet.
