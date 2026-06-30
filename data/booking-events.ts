export type BookingEvent = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  priceLevel: "Standard" | "Premium" | "Elite";
  duration: string;
};

export const bookingEvents: BookingEvent[] = [
  {
    id: "car-meet",
    title: "Biltræf",
    category: "Køretøjsevent",
    description:
      "Et stilrent biltræf med plads til show cars, præmier, musik og professionel eventstyring.",
    image: "/images/events/car-meet.jpg",
    priceLevel: "Standard",
    duration: "1-2 timer",
  },
  {
    id: "concert",
    title: "Koncert",
    category: "Sceneevent",
    description:
      "En eksklusiv koncertoplevelse med scene, lys, crowd control og stærk DarkLight-stemning.",
    image: "/images/events/concert.jpg",
    priceLevel: "Elite",
    duration: "2-3 timer",
  },
  {
    id: "wedding",
    title: "Bryllup",
    category: "Privat event",
    description:
      "Et elegant RP-bryllup med lokation, opsætning, indgang, ceremoni og afterparty.",
    image: "/images/events/wedding.jpg",
    priceLevel: "Premium",
    duration: "2 timer",
  },
  {
    id: "company-party",
    title: "Firmafest",
    category: "Firmaevent",
    description:
      "En gennemført fest for virksomheder, grupper eller organisationer på serveren.",
    image: "/images/events/company-party.jpg",
    priceLevel: "Premium",
    duration: "2-4 timer",
  },
  {
    id: "race-event",
    title: "Racerløb",
    category: "Motorsport",
    description:
      "Et kontrolleret racerløb med rute, startområde, præmier og eventpersonale.",
    image: "/images/events/race.jpg",
    priceLevel: "Elite",
    duration: "1-2 timer",
  },
  {
    id: "drift-event",
    title: "Drift Event",
    category: "Motorsport",
    description:
      "Et actionfyldt drift-event med pointsystem, dommere og fed publikumsoplevelse.",
    image: "/images/events/drift.jpg",
    priceLevel: "Premium",
    duration: "1-2 timer",
  },
  {
    id: "debate",
    title: "Debat",
    category: "Samfundsevent",
    description:
      "Et seriøst debatarrangement med scene, struktur, vært og kontrolleret publikumsflow.",
    image: "/images/events/debate.jpg",
    priceLevel: "Standard",
    duration: "1 time",
  },
  {
    id: "pool-party",
    title: "Poolparty",
    category: "Festevent",
    description:
      "Et luksuriøst poolparty med musik, drinks, VIP-område og stærk Los Santos vibe.",
    image: "/images/events/pool-party.jpg",
    priceLevel: "Premium",
    duration: "2 timer",
  },
];