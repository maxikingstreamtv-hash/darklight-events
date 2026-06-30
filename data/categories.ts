export type EventCategory = {
  id: string;
  title: string;
  icon: string;
  description: string;
  features: string[];
};

export const eventCategories: EventCategory[] = [
  {
    id: "car-meets",
    title: "Biltræf",
    icon: "🚗",
    description: "Stilrene biltræf med struktur, præmier og stærk serverstemning.",
    features: ["Show cars", "Præmier", "Eventpersonale", "Fotografering"],
  },
  {
    id: "concerts",
    title: "Koncerter",
    icon: "🎤",
    description: "Sceneevents med musik, crowd control og cinematic DarkLight-stemning.",
    features: ["Scene", "Lys", "Vært", "Publikumsflow"],
  },
  {
    id: "weddings",
    title: "Bryllupper",
    icon: "💍",
    description: "Elegante RP-bryllupper med ceremoni, lokation og afterparty.",
    features: ["Ceremoni", "Lokation", "VIP", "Afterparty"],
  },
  {
    id: "races",
    title: "Racerløb",
    icon: "🏁",
    description: "Kontrollerede racerløb med rute, startområde og præmier.",
    features: ["Rute", "Startområde", "Dommere", "Præmier"],
  },
  {
    id: "drift",
    title: "Drift Events",
    icon: "💨",
    description: "Actionfyldte drift-events med pointsystem og publikumsoplevelse.",
    features: ["Pointsystem", "Dommere", "Publikum", "Showområde"],
  },
  {
    id: "private",
    title: "Private Events",
    icon: "🥂",
    description: "Eksklusive fester, firmaaftener og specialevents til grupper.",
    features: ["VIP", "DJ", "Sikkerhed", "Tilpasning"],
  },
];