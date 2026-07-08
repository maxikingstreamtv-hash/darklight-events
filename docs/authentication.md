# DarkLight Events V2 Authentication Architecture

DarkLight Events er et fiktivt eventfirma til DreamLight FiveM RP. Denne arkitektur beskriver login, sessions, roller, permissions, badges og route protection for V2. Dokumentet beskriver den planlagte struktur og aendrer ikke eksisterende app-kode.

## 1. Login flow

Brugere logger ind med brugernavn og adgangskode. DarkLight Events V2 bruger ikke email som loginfelt.

Loginflow:

1. Brugeren indtaster brugernavn og adgangskode.
2. Systemet finder brugeren i PostgreSQL via `username`.
3. Hvis brugeren ikke findes, returneres en neutral fejlbesked.
4. Hvis brugeren findes, sammenlignes adgangskoden med det gemte password hash.
5. Hvis adgangskoden er korrekt, oprettes en session.
6. Brugerens `lastLoginAt` opdateres.
7. Brugeren sendes videre til korrekt dashboard baseret pa rolle.

Fejlbeskeder skal vaere sikre og generelle. Systemet ma ikke afslore, om brugernavnet eller adgangskoden var forkert.

## 2. Session flow

Sessionen bruges til at holde brugeren logget ind mellem requests.

Sessionen skal indeholde:

- Brugerens id
- Brugernavn
- Rolle
- Eventuelle permissions
- Eventuelle badges til visuel visning

Sessionen skal ikke indeholde adgangskode, password hash eller unodvendige private data.

Sessionflow:

1. Efter korrekt login oprettes en serverstyret session.
2. Sessionen gemmes sikkert via cookie eller tilsvarende sikker sessionmekanisme.
3. Ved hver beskyttet request valideres sessionen.
4. Hvis sessionen er gyldig, hentes eller valideres brugerens adgang.
5. Hvis sessionen mangler eller er udlobet, sendes brugeren til login.
6. Ved logout slettes sessionen.

Sessions skal have udlobstid og kunne fornyes pa en kontrolleret made.

## 3. Password hashing med Argon2

Adgangskoder skal aldrig gemmes i klartekst. V2 skal bruge Argon2 til password hashing.

Ved registrering eller adgangskodeaendring:

1. Brugeren vaelger en adgangskode.
2. Systemet validerer adgangskodens minimumskrav.
3. Adgangskoden hashes med Argon2.
4. Kun password hash gemmes i databasen.

Ved login:

1. Brugeren indtaster adgangskode.
2. Systemet henter brugerens password hash.
3. Argon2 verifierer adgangskoden mod hash.
4. Login accepteres kun, hvis verifikationen lykkes.

Password hashing skal kores server-side. Klienten ma aldrig modtage eller arbejde med password hash.

## 4. Role Based Access Control (RBAC)

DarkLight Events V2 bruger Role Based Access Control til grundadgang.

En bruger har kun en rolle ad gangen.

Roller:

- `SUPER_ADMIN`
- `ADMIN`
- `EVENT_MANAGER`
- `USER`

### SUPER_ADMIN

SUPER_ADMIN har fuld adgang til systemet. Rollen kan styre brugere, roller, badges, permissions, events, bookinger, resultater, galleri, Hall of Fame, sponsorer, settings og audit logs.

### ADMIN

ADMIN har naesten fuld adgang. Rollen kan styre de fleste adminfunktioner, herunder brugere, roller, badges, permissions, events, bookinger og resultater. ADMIN bor ikke kunne fjerne sidste SUPER_ADMIN.

### EVENT_MANAGER

EVENT_MANAGER kan oprette og styre events. Rollen kan arbejde med eventindhold, deltagere, check-in og eventafvikling, men ma ikke styre globale roller, badges, permissions eller systemsettings.

### USER

USER er normal bruger. Rollen kan styre egen profil, lave bookinger, deltage i events og se egne resultater, badges og historik.

## 5. Permission system

Permissions er individuelle ekstrarettigheder, som kan gives til en bruger udover brugerens rolle.

Permissions kan bruges til saerlige rettigheder senere, for eksempel:

- Adgang til et bestemt adminmodul
- Mulighed for at redigere galleri
- Mulighed for at se audit logs
- Mulighed for at administrere sponsorer

Regler:

- SUPER_ADMIN og ADMIN kan give og fjerne permissions.
- Permissions skal gemmes i PostgreSQL.
- Permissions skal kobles til brugere via `UserPermission`.
- Permissions ma ikke erstatte hovedrollerne.
- Permissions bruges kun, nar en funktion kraever mere nuanceret adgang end rollen alene.

## 6. Badge system

Badges er visuel status og giver ikke adgang.

En bruger kan have flere badges.

Eksempler:

- Founder
- Sponsor
- Staff
- VIP
- Event Winner
- Hall of Fame
- Photographer
- Host

Regler:

- Badges giver aldrig adgang til routes eller handlinger.
- Badges kan vises pa profil, deltagerkort, leaderboard eller Hall of Fame.
- SUPER_ADMIN og ADMIN kan give og fjerne badges.
- Badges gemmes i PostgreSQL og kobles til brugere via `UserBadge`.
- Sponsor er et badge, ikke en rolle.

## 7. Route protection

Beskyttede routes skal kontrollere session, rolle og eventuelle permissions.

Public routes:

- Forside
- Events
- Eventdetaljer
- Rangliste
- Hall of Fame
- Galleri
- Sponsorer
- Login
- Registrering
- FAQ og generelle informationssider

Brugerbeskyttede routes:

- Profil
- Egne bookinger
- Egne resultater
- Tilmelding til events

Adminbeskyttede routes:

- Admin dashboard
- Brugerstyring
- Roller
- Badges
- Permissions
- Resultater
- Bookinger
- Settings

Event Manager routes:

- EventOS
- Eventoprettelse
- Eventredigering
- Deltagerstyring
- Check-in

Hvis en bruger ikke har adgang, skal systemet enten sende brugeren til login eller vise en dansk adgangsfejl.

## 8. Middleware flow

Middleware skal bruges til at beskytte routes tidligt i request-flowet.

Middlewareflow:

1. Request rammer en route.
2. Middleware vurderer, om routen er public eller beskyttet.
3. Hvis routen er public, fortsatter requesten.
4. Hvis routen er beskyttet, kontrolleres session.
5. Hvis session mangler eller er ugyldig, redirectes brugeren til login.
6. Hvis session findes, kontrolleres rolle.
7. Hvis routen kraever permission, kontrolleres brugerens permissions.
8. Hvis brugeren har adgang, fortsatter requesten.
9. Hvis brugeren ikke har adgang, redirectes brugeren til passende dashboard eller en adgangsfejlside.

Middleware skal vaere enkel og forudsigelig. Komplekse adgangsregler kan placeres i helper-funktioner, sa logikken kan genbruges pa server actions, API routes og sider.

## 9. Dashboard routing efter login

Efter login skal brugeren sendes til det dashboard, der passer til rollen.

Routing:

- `SUPER_ADMIN` sendes til admin dashboard.
- `ADMIN` sendes til admin dashboard.
- `EVENT_MANAGER` sendes til EventOS eller event dashboard.
- `USER` sendes til profil eller brugerens bookingoversigt.

Hvis en bruger forsogte at abne en beskyttet side for login, kan systemet gemme en sikker `returnTo` destination og sende brugeren tilbage efter login, hvis brugeren har adgang.

Hvis brugeren ikke har adgang til `returnTo`, sendes brugeren til standarddashboardet for rollen.

## 10. Future Discord OAuth support

Discord OAuth kan understottes senere, men skal ikke implementeres i forste V2-auth fase.

Fremtidig Discord OAuth kan bruges til:

- Login via Discord
- Knytning af Discord-id til eksisterende DarkLight konto
- Visning af Discord-avatar
- Lettere brugeroprettelse for DreamLight RP spillere

Regler for fremtidig Discord OAuth:

- Username-login skal stadig kunne fungere.
- Discord ma ikke automatisk give adminadgang.
- Roller, permissions og badges skal stadig styres i DarkLight adminsystemet.
- En Discord-konto skal kunne kobles til en eksisterende bruger.
- Hvis Discord OAuth bruges til oprettelse, skal systemet stadig oprette en normal `User` i PostgreSQL.

Discord OAuth er en fremtidig udvidelse og ikke en del af den nuvaerende implementation.
