export type NewsCategory = "Event" | "Resultat" | "Sponsor" | "Meddelelse" | "Sæson";

export type NewsItem = {
  id: string;
  title: string;
  category: NewsCategory;
  date: string;
  excerpt: string;
  content: string[];
  image: string;
  author: string;
  featured: boolean;
};

export const news: NewsItem[] = [
  {
    id: "darklight-platform-live",
    title: "DarkLight Events åbner platformen",
    category: "Meddelelse",
    date: "2026-07-02",
    excerpt: "DarkLight Events samler events, booking, ranglister og EventOS i én DreamLight-platform.",
    content: [
      "DarkLight Events er klar med en samlet platform til DreamLight-events.",
      "Spillere kan finde events, booke oplevelser, se Hall of Fame og følge kommende aktiviteter.",
      "Staff kan styre events manuelt gennem EventOS, mens platformen udvikles videre.",
    ],
    image: "/images/events/car-meetup.png",
    author: "Cole Kane",
    featured: true,
  },
  {
    id: "first-champions-soon",
    title: "Første champions kåres snart",
    category: "Sæson",
    date: "2026-07-02",
    excerpt: "Hall of Fame starter rent og opdateres først, når staff offentliggør officielle vindere.",
    content: [
      "DarkLight starter uden gamle champions eller fiktiv historik.",
      "Når de første events er gennemført, kan staff godkende resultater og offentliggøre podiet.",
    ],
    image: "/images/events/races.png",
    author: "Izadora Solis",
    featured: false,
  },
  {
    id: "partners-open",
    title: "Partneraftaler åbner for nye sponsorer",
    category: "Sponsor",
    date: "2026-07-02",
    excerpt: "DreamLight-partnere kan støtte events med præmier, crew, lokation eller mediedækning.",
    content: [
      "Sponsorater håndteres som RP-aftaler i DreamLight-universet.",
      "DarkLight staff vurderer aftaler ud fra eventtype, målgruppe og praktisk afvikling.",
    ],
    image: "/images/events/dj-events.png",
    author: "DarkLight Staff",
    featured: false,
  },
];

