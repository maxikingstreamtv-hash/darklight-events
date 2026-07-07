export type GalleryCategory =
  | "Drift"
  | "Drag Race"
  | "Biltræf"
  | "Show & Shine"
  | "Koncert"
  | "Bryllup"
  | "Festival"
  | "Offroad";

export type GalleryItem = {
  id: string;
  title: string;
  category: GalleryCategory;
  eventRef: string;
  date: string;
  description: string;
  image: string;
};

export const galleryCategories: GalleryCategory[] = [
  "Drift",
  "Drag Race",
  "Biltræf",
  "Show & Shine",
  "Koncert",
  "Bryllup",
  "Festival",
  "Offroad",
];

export const galleryItems: GalleryItem[] = [
  {
    id: "gallery-carmeet",
    title: "Night meet preview",
    category: "Biltræf",
    eventRef: "Car Meet Night",
    date: "2026-07-02",
    description: "Stemning fra DarkLight biltræf-universet med parkering, crew og lys.",
    image: "/images/events/car-meetup.png",
  },
  {
    id: "gallery-drift",
    title: "Drift staging",
    category: "Drift",
    eventRef: "Drift Championship",
    date: "2026-07-02",
    description: "Staging, dommere og kørerkø før første heat.",
    image: "/images/events/races.png",
  },
  {
    id: "gallery-stage",
    title: "Stage lights",
    category: "Koncert",
    eventRef: "Festival Night",
    date: "2026-07-02",
    description: "Lys, lyd og crowd control til større events.",
    image: "/images/events/dj-events.png",
  },
];

