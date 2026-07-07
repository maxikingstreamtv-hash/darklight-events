import { eventLogs, type EventLog, type EventLogSeverity } from "@/data/events-log";

export type NewEventLog = Omit<EventLog, "id"> & {
  id?: string;
};

function createLogId(logs: EventLog[]) {
  return `LOG-${String(logs.length + 1).padStart(3, "0")}`;
}

export function addLog(log: NewEventLog, logs: EventLog[] = eventLogs): EventLog[] {
  return [
    {
      id: log.id ?? createLogId(logs),
      time: log.time,
      category: log.category,
      message: log.message,
      severity: log.severity,
    },
    ...logs,
  ];
}

export function getLogs(logs: EventLog[] = eventLogs) {
  return [...logs];
}

export function getLatestLogs(limit: number, logs: EventLog[] = eventLogs) {
  return [...logs].slice(0, limit);
}

export function getLogsByCategory(category: string, logs: EventLog[] = eventLogs) {
  return logs.filter(
    (log) => log.category.toLowerCase() === category.toLowerCase()
  );
}

export function clearLogs() {
  return [] as EventLog[];
}

export function getLogsBySeverity(
  severity: EventLogSeverity,
  logs: EventLog[] = eventLogs
) {
  return logs.filter((log) => log.severity === severity);
}
