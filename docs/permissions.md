# DarkLight Events V2 Roller og Permissions

DarkLight Events V2 bruger roller til grundadgang og permissions til særlige ekstrarettigheder. Badges er kun visuel status og giver aldrig adgang.

## Roller

### SUPER_ADMIN

SUPER_ADMIN har fuld adgang til hele systemet.

Bør have:

- Alle permissions.
- Adgang til alle adminområder.
- Adgang til Settings Center.
- Mulighed for at styre roller, badges og permissions.
- Mulighed for at registrere og rette resultater.

### ADMIN

ADMIN har næsten fuld adgang.

Bør have:

- `MANAGE_USERS`
- `MANAGE_BADGES`
- `MANAGE_PERMISSIONS`
- `MANAGE_EVENTS`
- `MANAGE_RESULTS`
- `MANAGE_GALLERY`
- `MANAGE_SETTINGS`, hvis Super Admin tillader det

ADMIN bør ikke kunne fjerne sidste SUPER_ADMIN eller give højere adgang end tilladt.

### EVENT_MANAGER

EVENT_MANAGER styrer events og eventafvikling.

Bør have:

- `MANAGE_EVENTS`

EVENT_MANAGER bør ikke have:

- `MANAGE_USERS`
- `MANAGE_BADGES`
- `MANAGE_PERMISSIONS`
- `MANAGE_RESULTS`
- `MANAGE_SETTINGS`

### USER

USER er normal bruger.

Bør have:

- Ingen adminpermissions som standard.
- Adgang til egen profil.
- Adgang til egne bookinger.
- Adgang til egne resultater og badges.

## Permissions

### MANAGE_USERS

Giver adgang til at se og administrere brugere.

Anbefalet til:

- SUPER_ADMIN
- ADMIN

### MANAGE_BADGES

Giver adgang til at oprette, redigere, give og fjerne badges.

Anbefalet til:

- SUPER_ADMIN
- ADMIN

### MANAGE_PERMISSIONS

Giver adgang til at give og fjerne permissions.

Anbefalet til:

- SUPER_ADMIN
- ADMIN

Denne permission skal bruges forsigtigt, fordi den kan ændre adgangsniveauer.

### MANAGE_EVENTS

Giver adgang til at oprette, redigere og styre events.

Anbefalet til:

- SUPER_ADMIN
- ADMIN
- EVENT_MANAGER

### MANAGE_RESULTS

Giver adgang til at registrere, redigere, godkende og slette resultater.

Anbefalet til:

- SUPER_ADMIN
- ADMIN

EVENT_MANAGER bør ikke have denne permission som standard.

### MANAGE_GALLERY

Giver adgang til at administrere galleri og eventbilleder.

Anbefalet til:

- SUPER_ADMIN
- ADMIN

Kan senere gives individuelt til en fotografansvarlig bruger.

### MANAGE_SETTINGS

Giver adgang til Settings Center.

Anbefalet til:

- SUPER_ADMIN
- ADMIN efter behov

Settings kan påvirke store dele af systemet og bør derfor være begrænset.

## Badge-regler

- Badges giver ikke adgang.
- Sponsor er badge, ikke rolle.
- Staff kan være badge, men systemadgang skal stadig styres med rolle eller permission.
- VIP er badge, ikke adgangsniveau.
- Hall of Fame er badge eller visuel status, ikke systemadgang.
