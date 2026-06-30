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
    subtitle: "Tournament Bracket",
    description:
      "Turnering med battles, brackets og finaler mellem de bedste driftere.",
    icon: "💨",
    href: "/competition/drift",
    status: "Klar",
  },

  {
    id: "race",
    title: "Street Racing",
    subtitle: "Leaderboard",
    description:
      "Race-resultater med omgangstider, placeringer og mesterskabspoint.",
    icon: "🏁",
    href: "/competition/race",
    status: "Klar",
  },

  {
    id: "drag",
    title: "Drag Racing",
    subtitle: "Ladder System",
    description:
      "Knockout drag-racing med heats, semifinaler og finaler.",
    icon: "🚀",
    href: "/competition/drag",
    status: "Klar",
  },

  {
    id: "carshow",
    title: "Car Show",
    subtitle: "Judge Scoring",
    description:
      "Dommersystem med point for design, finish, detaljer og originalitet.",
    icon: "🚗",
    href: "/competition/carshow",
    status: "Klar",
  },

  {
    id: "golfcart",
    title: "Golf Cart Race",
    subtitle: "Leaderboard",
    description:
      "Resultater fra golfvognsløb med tider, placeringer og point.",
    icon: "⛳",
    href: "/competition/golfcart",
    status: "Kommer snart",
  },

  {
    id: "lawnmower",
    title: "Lawnmower Race",
    subtitle: "Leaderboard",
    description:
      "Græsslåmaskineræs med omgangstider og samlet stilling.",
    icon: "🚜",
    href: "/competition/lawnmower",
    status: "Kommer snart",
  },

  {
    id: "derby",
    title: "Demolition Derby",
    subtitle: "Elimination",
    description:
      "Point for overlevelse, elimineringer og sidste bil på banen.",
    icon: "💥",
    href: "/competition/derby",
    status: "Kommer snart",
  },

  {
    id: "motocross",
    title: "Motocross",
    subtitle: "Leaderboard",
    description:
      "Motocross-resultater med heat, samlet tid og mesterskabspoint.",
    icon: "🏍️",
    href: "/competition/motocross",
    status: "Kommer snart",
  },

  {
    id: "mrdreamlight",
    title: "Mr. DreamLight",
    subtitle: "Judge Scoring",
    description:
      "Konkurrence med dommerpoint for stil, personlighed og præsentation.",
    icon: "🤵",
    href: "/competition/mrdreamlight",
    status: "Kommer snart",
  },

  {
    id: "missdreamlight",
    title: "Miss DreamLight",
    subtitle: "Judge Scoring",
    description:
      "Skønhedskonkurrence med dommerpoint for præsentation, kreativitet og stil.",
    icon: "👑",
    href: "/competition/missdreamlight",
    status: "Kommer snart",
  },

  {
    id: "burnout",
    title: "Burnout Competition",
    subtitle: "Judge Scoring",
    description:
      "Bedømmelse af røg, stil, kontrol og publikumsrespons.",
    icon: "🔥",
    href: "/competition/burnout",
    status: "Kommer snart",
  },

  {
    id: "timeattack",
    title: "Time Attack",
    subtitle: "Leaderboard",
    description:
      "Kør den hurtigste omgang og kæmp om førstepladsen.",
    icon: "⏱️",
    href: "/competition/timeattack",
    status: "Kommer snart",
  },

  {
    id: "offroad",
    title: "Offroad Challenge",
    subtitle: "Checkpoint Race",
    description:
      "Terrænløb med checkpoints, tider og fejlpoint.",
    icon: "🏔️",
    href: "/competition/offroad",
    status: "Kommer snart",
  },
];