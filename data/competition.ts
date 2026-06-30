export type CompetitionType = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  href: string;
  status: "Klar" | "Kommer snart";
};

export const competitions: CompetitionType[] = [
  {
    id: "drift",
    title: "Drift Championship",
    subtitle: "Top 32 Bracket",
    description:
      "Turneringstavle til drift-events med battles, finaler og vinderplaceringer.",
    icon: "💨",
    href: "/competition/drift",
    status: "Klar",
  },
  {
    id: "race",
    title: "Street Racing",
    subtitle: "Leaderboard",
    description:
      "Resultatliste til racerløb med tider, køretøjer, positioner og point.",
    icon: "🏁",
    href: "/competition/race",
    status: "Kommer snart",
  },
  {
    id: "drag",
    title: "Drag Racing",
    subtitle: "Ladder System",
    description:
      "Drag ladder til heats, semifinaler og finaler med reaktionstid og sluttid.",
    icon: "🚀",
    href: "/competition/drag",
    status: "Kommer snart",
  },
  {
    id: "carshow",
    title: "Car Show",
    subtitle: "Judge Scoring",
    description:
      "Bedømmelsessystem til carshows med design, originalitet, detaljer og total score.",
    icon: "🚗",
    href: "/competition/carshow",
    status: "Kommer snart",
  },
];