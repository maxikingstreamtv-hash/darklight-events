export type EventOSDataMode = "clean" | "demo";

export const eventOSDataMode: EventOSDataMode = "clean";

export const dataModeCopy = {
  clean: {
    title: "Ren start aktiv",
    description:
      "Ren start betyder, at DarkLight Events starter uden tidligere resultater. Alle point, tider og vindere oprettes manuelt af staff under events.",
  },
  demo: {
    title: "Testtilstand",
    description:
      "Testtilstand viser testdata til design og workflow. Det må ikke bruges som officiel eventhistorik.",
  },
} satisfies Record<EventOSDataMode, { title: string; description: string }>;

