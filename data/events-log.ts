export type EventLogSeverity = "info" | "success" | "warning" | "danger";

export type EventLog = {
  id: string;
  time: string;
  category: string;
  message: string;
  severity: EventLogSeverity;
};

export const cleanEventLogs: EventLog[] = [];

export const demoEventLogs: EventLog[] = [
  {
    id: "LOG-001",
    time: "20:03",
    category: "Heat",
    message: "Heat 3 er startet på Vinewood Track.",
    severity: "success",
  },
  {
    id: "LOG-002",
    time: "20:04",
    category: "Driver",
    message: "Cole Kane er klar ved startlinjen.",
    severity: "info",
  },
  {
    id: "LOG-003",
    time: "20:06",
    category: "Judge",
    message: "Dommerpanel har godkendt seneste run.",
    severity: "success",
  },
  {
    id: "LOG-004",
    time: "20:08",
    category: "Check-in",
    message: "Check-in lukket for dette event.",
    severity: "warning",
  },
  {
    id: "LOG-005",
    time: "20:10",
    category: "Løbskontrol",
    message: "Officials melder banen fri efter restart ved Legion Square.",
    severity: "info",
  },
  {
    id: "LOG-006",
    time: "20:12",
    category: "Safety",
    message: "Safety car står standby ved Vinewood pit exit.",
    severity: "warning",
  },
  {
    id: "LOG-007",
    time: "20:14",
    category: "Score",
    message: "Ny top score registreret i Drift Championship #01.",
    severity: "success",
  },
  {
    id: "LOG-008",
    time: "20:15",
    category: "Radio",
    message: "Løbskontrol har sendt besked til alle event staff på radioen.",
    severity: "info",
  },
];

export const eventLogs: EventLog[] = cleanEventLogs;
