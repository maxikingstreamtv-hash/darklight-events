export type RuleSection = {
  id: string;
  title: string;
  summary: string;
  rules: string[];
};

export const ruleSections: RuleSection[] = [
  {
    id: "general",
    title: "Generelle eventregler",
    summary: "Regler for alle DarkLight Events i DreamLight.",
    rules: ["Følg staff-kald.", "Respekter eventområdet.", "Tilmeldte kørere skal checke ind før start.", "Fail RP kan give DNF, DNS eller diskvalifikation."],
  },
  {
    id: "drift",
    title: "Drift",
    summary: "Scorebaseret drift med fokus på style, speed, angle og line.",
    rules: ["Kun godkendte runs tæller.", "Penalties trækkes fra totalscoren.", "Dommerpanelets afgørelse er gældende."],
  },
  {
    id: "drag",
    title: "Drag Race",
    summary: "Tidsbaseret ladder med staging og startkald.",
    rules: ["False start kan give rerun eller diskvalifikation.", "Laveste godkendte sluttid rangerer bedst.", "Kørere skal følge staging-køen."],
  },
  {
    id: "carmeet",
    title: "Biltræf",
    summary: "Sociale events med fokus på biler, parkering og stemning.",
    rules: ["Parkering følger staff-anvisninger.", "Burnouts kræver tilladelse.", "Hold området åbent og roligt."],
  },
  {
    id: "showshine",
    title: "Show & Shine",
    summary: "Bedømmelse af design, tema, detaljer og præsentation.",
    rules: ["Køreren skal kunne præsentere bilen.", "Tema og detaljer vægter højt.", "Trolling kan give diskvalifikation."],
  },
  {
    id: "offroad",
    title: "Offroad",
    summary: "Checkpoint-events med recovery og tidsstraf.",
    rules: ["Missing checkpoint giver tidsstraf.", "Recovery RP skal respekteres.", "Laveste sluttid rangerer bedst."],
  },
  {
    id: "stage",
    title: "Koncert/Festival",
    summary: "Publikumsflow, stage-område og crew-kontrol.",
    rules: ["Respekter stage-zoner.", "Følg crew-anvisninger.", "Hold køretøjer væk fra publikumsområder."],
  },
  {
    id: "special",
    title: "Bryllup/Special Events",
    summary: "Private eller specialbyggede RP-events.",
    rules: ["Format aftales med booker.", "Staff planlægger flow og roller.", "Gæster følger værts- og staff-kald."],
  },
  {
    id: "judges",
    title: "Dommerregler",
    summary: "Hvordan resultater vurderes og godkendes.",
    rules: ["Noter skal være konkrete.", "Resultater tæller først efter godkendelse.", "Afviste resultater kan gennemgås af staff."],
  },
  {
    id: "safety",
    title: "Sikkerhed",
    summary: "Sikker eventafvikling i DreamLight.",
    rules: ["Hold flugtveje åbne.", "Publikum holdes væk fra aktive baner.", "Staff kan pause eventet ved uro."],
  },
];

