import { events as publicEvents } from "@/data/events";
import { managedEvents } from "@/data/event-manager";
import { eventTemplates } from "@/data/event-templates";
import { permissions } from "@/data/permissions";
import { sponsors } from "@/data/sponsors";
import { upcomingEvents } from "@/data/upcoming-events";

export type PublicEventStatus = "Åben" | "Få pladser" | "Fuld" | "Afsluttet";

export type PublicEventRoute = {
  id: string;
  href: string;
  aliases: string[];
  title: string;
  type: string;
  category: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  status: PublicEventStatus;
  image: string;
  description: string;
  participants: number;
  maxParticipants: number;
  popularity: number;
  managed: boolean;
  rules: string[];
  prizes: string[];
  gallery: string[];
  permission?: (typeof permissions)[number];
  sponsors: typeof sponsors;
  template?: (typeof eventTemplates)[number];
};

const eventImages: Record<string, string> = {
  Drift: "/images/events/drift-events.png",
  Race: "/images/events/races.png",
  Drag: "/images/events/drag-race.png",
  "Car Show": "/images/events/car-show.png",
  "Car Meet": "/images/events/car-meetup.png",
  Offroad: "/images/events/motorcross.png",
};

export function slugifyEvent(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getHrefSegment(value?: string) {
  if (!value) return "";
  return value.split("/").filter(Boolean).at(-1) ?? "";
}

function createAliases(event: { id: string; title: string; href?: string }) {
  return Array.from(
    new Set(
      [
        event.id,
        slugifyEvent(event.id),
        event.title,
        slugifyEvent(event.title),
        getHrefSegment(event.href),
        slugifyEvent(getHrefSegment(event.href)),
      ].filter(Boolean)
    )
  );
}

function normalizeCategory(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes("biltræf") || lower.includes("car meet") || lower.includes("automotive")) return "Biltræf";
  if (lower.includes("drift")) return "Drift";
  if (lower.includes("drag")) return "Drag Race";
  if (lower.includes("race") || lower.includes("motorsport")) return "Race";
  if (lower.includes("car show") || lower.includes("show")) return "Car Show";
  if (lower.includes("bryllup")) return "Bryllup";
  if (lower.includes("firma")) return "Firmafest";
  if (lower.includes("festival") || lower.includes("party") || lower.includes("fest")) return "Festival";
  return "Special Event";
}

function getEventStatus(event: {
  date: string;
  status?: string;
  participants: number;
  maxParticipants: number;
}): PublicEventStatus {
  if (event.status === "Finished" || event.status === "Archived" || event.status === "Afsluttet") return "Afsluttet";

  const eventTime = Date.parse(event.date);
  if (!Number.isNaN(eventTime) && eventTime < Date.now()) return "Afsluttet";

  const available = event.maxParticipants - event.participants;
  if (available <= 0) return "Fuld";
  if (available <= Math.max(3, Math.ceil(event.maxParticipants * 0.15))) return "Få pladser";
  return "Åben";
}

function getMatchingPermission(title: string, category: string) {
  const haystack = `${title} ${category}`.toLowerCase();
  return permissions.find((permission) => {
    const needle = `${permission.event} ${permission.location}`.toLowerCase();
    return haystack.split(" ").some((part) => part.length > 3 && needle.includes(part));
  });
}

function getMatchingSponsors(category: string) {
  const lowerCategory = category.toLowerCase();
  const matched = sponsors.filter((sponsor) =>
    sponsor.eventsSupported.some((eventName) => {
      const lowerEvent = eventName.toLowerCase();
      return lowerEvent.includes(lowerCategory) || lowerCategory.includes(lowerEvent.split(" ")[0] ?? "");
    })
  );

  return (matched.length > 0 ? matched : sponsors.filter((sponsor) => sponsor.status === "Aktiv")).slice(0, 3);
}

function defaultRules(category: string) {
  return [
    "Følg DarkLight staff og eventets briefing.",
    "Hold området ryddet og respekter afspærringer.",
    category === "Drag Race" || category === "Race"
      ? "Tider tages ingame og registreres manuelt af staff."
      : "Resultater og placeringer offentliggøres af DarkLight staff.",
  ];
}

function defaultPrizes(category: string) {
  if (["Drift", "Drag Race", "Race", "Car Show"].includes(category)) {
    return [
      "Top 3 kan offentliggøres i Hall of Fame.",
      "Præmier afhænger af sponsor- og staffaftaler.",
      "Særlige titler kan gives i DreamLight-universet.",
    ];
  }

  return [
    "Særlige RP-aftaler kan annonceres af staff.",
    "Udvalgte deltagere kan fremhæves efter eventet.",
    "Præmier afhænger af eventtypen.",
  ];
}

function buildRoute(base: Omit<PublicEventRoute, "aliases" | "href"> & { href?: string }): PublicEventRoute {
  const href = base.href ?? `/events/${base.id}`;

  return {
    ...base,
    href,
    aliases: createAliases({ id: base.id, title: base.title, href }),
  };
}

export function getPublicEventRoutes(): PublicEventRoute[] {
  const managed = managedEvents.map(managedEventToPublicRoute);

  const publicCatalog = publicEvents.map((event) => {
    const id = slugifyEvent(event.title);
    const category = normalizeCategory(`${event.title} ${event.category}`);

    return buildRoute({
      id,
      title: event.title,
      type: event.category,
      category,
      date: "Dato følger",
      time: "RP-tid annonceres",
      location: "DreamLight",
      organizer: "DarkLight Events",
      status: "Åben",
      image: event.image,
      description: event.description,
      participants: 0,
      maxParticipants: 40,
      popularity: 0,
      managed: false,
      rules: defaultRules(category),
      prizes: defaultPrizes(category),
      gallery: [],
      permission: getMatchingPermission(event.title, category),
      sponsors: getMatchingSponsors(category),
      template: undefined,
    });
  });

  const upcoming = upcomingEvents.map((event) => {
    const id = slugifyEvent(event.title);
    const category = normalizeCategory(`${event.title} ${event.status}`);

    return buildRoute({
      id,
      title: event.title,
      type: event.status,
      category,
      date: event.date,
      time: "RP-tid annonceres",
      location: event.location,
      organizer: "DarkLight Events",
      status: getEventStatus({ ...event, participants: 0, maxParticipants: 40 }),
      image: event.image,
      description: "Offentligt event fra DarkLight kalenderen. Detaljer styres manuelt af staff.",
      participants: 0,
      maxParticipants: 40,
      popularity: 0,
      managed: false,
      rules: defaultRules(category),
      prizes: defaultPrizes(category),
      gallery: [],
      permission: getMatchingPermission(event.title, category),
      sponsors: getMatchingSponsors(category),
      template: undefined,
    });
  });

  const byId = new Map<string, PublicEventRoute>();
  [...managed, ...publicCatalog, ...upcoming].forEach((event) => {
    if (!byId.has(event.id)) {
      byId.set(event.id, event);
    }
  });

  return [...byId.values()];
}

export function managedEventToPublicRoute(event: (typeof managedEvents)[number]): PublicEventRoute {
  const id = event.id || slugifyEvent(event.title);
  const category = normalizeCategory(event.type);
  const template = eventTemplates.find((item) => item.type === event.type);

  return buildRoute({
    id,
    title: event.title,
    type: event.type,
    category,
    date: event.date,
    time: event.time,
    location: event.location,
    organizer: "DarkLight Events",
    status: getEventStatus(event),
    image: eventImages[event.type] ?? "/images/events/races.png",
    description: `Officielt DarkLight ${event.type}-event med staff, check-in og manuel resultatstyring.`,
    participants: event.participants,
    maxParticipants: event.maxParticipants,
    popularity: event.participants,
    managed: true,
    rules: template?.defaultRules ?? defaultRules(category),
    prizes: defaultPrizes(category),
    gallery: [],
    permission: getMatchingPermission(event.title, category),
    sponsors: getMatchingSponsors(category),
    template,
  });
}

export function getPublicEventRoute(id: string) {
  const decodedId = decodeURIComponent(id);
  const candidates = new Set([
    id,
    decodedId,
    getHrefSegment(decodedId),
    slugifyEvent(id),
    slugifyEvent(decodedId),
    slugifyEvent(getHrefSegment(decodedId)),
  ]);

  return getPublicEventRoutes().find((event) =>
    event.aliases.some((alias) => candidates.has(alias) || candidates.has(slugifyEvent(alias)))
  );
}

