export type CompetitionType = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  href: string;
  status: "Klar" | "Ikke aktiv endnu";
};

export const competitions: CompetitionType[] = [
  {
    id: "drift",
    title: "Drift Championship",
    subtitle: "Turneringsbracket",
    description: "Turnering med battles, brackets og finaler mellem de bedste driftere.",
    icon: "DR",
    href: "/competition/drift",
    status: "Klar",
  },
  {
    id: "race",
    title: "Street Racing",
    subtitle: "Rangliste",
    description: "Race-resultater med omgangstider, placeringer og mesterskabspoint.",
    icon: "RA",
    href: "/competition/race",
    status: "Klar",
  },
  {
    id: "drag",
    title: "Drag Racing",
    subtitle: "Ladder-system",
    description: "Knockout drag-racing med heats, semifinaler og finaler.",
    icon: "DG",
    href: "/competition/drag",
    status: "Klar",
  },
  {
    id: "carshow",
    title: "Car Show",
    subtitle: "Dommerpoint",
    description: "Dommersystem med point for design, finish, detaljer og originalitet.",
    icon: "CS",
    href: "/competition/carshow",
    status: "Klar",
  },
  {
    id: "golfcart",
    title: "Golf Cart Race",
    subtitle: "Rangliste",
    description: "Resultater fra golfvognsløb med tider, placeringer og point.",
    icon: "GC",
    href: "/competition/golfcart",
    status: "Ikke aktiv endnu",
  },
  {
    id: "lawnmower",
    title: "Lawnmower Race",
    subtitle: "Rangliste",
    description: "Græsslåmaskineræs med omgangstider og samlet stilling.",
    icon: "LM",
    href: "/competition/lawnmower",
    status: "Ikke aktiv endnu",
  },
  {
    id: "derby",
    title: "Crash Derby",
    subtitle: "Eliminering",
    description: "Point for overlevelse, elimineringer og sidste bil på banen.",
    icon: "CD",
    href: "/competition/derby",
    status: "Ikke aktiv endnu",
  },
  {
    id: "motocross",
    title: "Motocross",
    subtitle: "Rangliste",
    description: "Motocross-resultater med heat, samlet tid og mesterskabspoint.",
    icon: "MX",
    href: "/competition/motocross",
    status: "Ikke aktiv endnu",
  },
  {
    id: "mrdreamlight",
    title: "Mr. DreamLight",
    subtitle: "Dommerpoint",
    description: "Konkurrence med dommerpoint for stil, personlighed og præsentation.",
    icon: "MR",
    href: "/competition/mrdreamlight",
    status: "Ikke aktiv endnu",
  },
  {
    id: "missdreamlight",
    title: "Miss DreamLight",
    subtitle: "Dommerpoint",
    description: "Skønhedskonkurrence med dommerpoint for præsentation, kreativitet og stil.",
    icon: "MS",
    href: "/competition/missdreamlight",
    status: "Ikke aktiv endnu",
  },
  {
    id: "burnout",
    title: "Burnout Competition",
    subtitle: "Dommerpoint",
    description: "Bedømmelse af røg, stil, kontrol og publikumsrespons.",
    icon: "BO",
    href: "/competition/burnout",
    status: "Ikke aktiv endnu",
  },
  {
    id: "timeattack",
    title: "Time Attack",
    subtitle: "Rangliste",
    description: "Kør den hurtigste omgang og kæmp om førstepladsen.",
    icon: "TA",
    href: "/competition/timeattack",
    status: "Ikke aktiv endnu",
  },
  {
    id: "offroad",
    title: "Offroad Challenge",
    subtitle: "Checkpoint Race",
    description: "Terrænløb med checkpoints, tider og fejlpoint.",
    icon: "OR",
    href: "/competition/offroad",
    status: "Ikke aktiv endnu",
  },
];

