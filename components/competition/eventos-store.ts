"use client";

import {
  createContext,
  createElement,
  useEffect,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { eventLogs, type EventLog } from "@/data/events-log";
import { managedEvents, type ManagedEvent } from "@/data/event-manager";
import { heats as initialHeats, type Heat } from "@/data/heats";
import { participants as initialParticipants, type Participant } from "@/data/participants";
import {
  publishedHallOfFameWinners,
  resultScores,
  type PublishedHallOfFameWinner,
  type ResultScore,
  type ResultStatus,
} from "@/data/results";

type NewEventLog = Omit<EventLog, "id"> & {
  id?: string;
};

export type EventSponsor = {
  id: string;
  eventId: string;
  name: string;
  level: "Platinum" | "Gold" | "Silver" | "Partner";
  status: "Aktiv" | "Afventer" | "Deaktiveret";
  logoInitials: string;
  logoUrl?: string;
  description: string;
  supportedEvents: string;
  contactPerson: string;
  notes?: string;
};

export const EVENTOS_STATE_STORAGE_KEY = "darklight-eventos-state";
export const EVENTOS_BOOKING_STORAGE_KEY = "darklight-booking-requests";
export const EVENTOS_CONTACT_STORAGE_KEY = "darklight-contact-messages";
export const EVENTOS_ADMIN_SPONSOR_STORAGE_KEY = "darklight-admin-sponsors";
export const EVENTOS_ADMIN_PERMISSION_STORAGE_KEY = "darklight-admin-permissions";
export const EVENTOS_ADMIN_GALLERY_STORAGE_KEY = "darklight-admin-gallery";

type EventOSState = {
  activeEventId: string;
  currentHeatId: string;
  events: ManagedEvent[];
  participants: Participant[];
  heats: Heat[];
  results: ResultScore[];
  hallOfFameWinners: PublishedHallOfFameWinner[];
  eventSponsors: EventSponsor[];
  logs: EventLog[];
  selectedDriverId?: string;
};

export type EventOSResetScope =
  | "leaderboard"
  | "results"
  | "hallOfFame"
  | "season"
  | "achievements"
  | "participants"
  | "checkIns"
  | "logs"
  | "bookings"
  | "contacts"
  | "sponsors"
  | "permissions"
  | "gallery"
  | "all";

export type EventOSSingleEventResetScope =
  | "participants"
  | "results"
  | "leaderboard"
  | "winners"
  | "history"
  | "all";

export type EventOSDriverResetScope = "statistics" | "achievements" | "career";

type EventOSContextValue = EventOSState & {
  setActiveEvent: (eventId: string) => void;
  updateEventStatus: (eventId: string, status: ManagedEvent["status"]) => void;
  setCurrentHeat: (heatId: string) => void;
  createEvent: (event: ManagedEvent) => void;
  deleteEvent: (eventId: string, actor?: string) => void;
  startHeat: (heatId: string) => void;
  finishHeat: (heatId: string) => void;
  addResult: (result: ResultScore) => void;
  updateResult: (resultId: string, updatedData: Partial<Omit<ResultScore, "id">>) => void;
  deleteResult: (resultId: string) => void;
  approveResult: (resultId: string) => void;
  rejectResult: (resultId: string) => void;
  publishHallOfFameWinner: (winner: PublishedHallOfFameWinner) => void;
  addSponsorToEvent: (eventId: string, sponsorData: Omit<EventSponsor, "id" | "eventId">, actor?: string) => void;
  updateEventSponsor: (eventId: string, sponsorId: string, updatedData: Partial<Omit<EventSponsor, "id" | "eventId">>, actor?: string) => void;
  removeSponsorFromEvent: (eventId: string, sponsorId: string, actor?: string) => void;
  addParticipant: (eventId: string, driverId: string) => void;
  removeParticipant: (participantId: string, actor?: string) => void;
  addEventLog: (log: NewEventLog) => void;
  selectDriver: (driverId?: string) => void;
  setParticipantCheckIn: (participantId: string, checkedIn: boolean) => void;
  resetEventData: (scope: EventOSResetScope, actor?: string) => void;
  resetSingleEventData: (eventId: string, scope: EventOSSingleEventResetScope, actor?: string) => void;
  resetDriverData: (driverId: string, scope: EventOSDriverResetScope, actor?: string) => void;
};

const defaultActiveEventId = managedEvents[0]?.id ?? "drift-championship-01";
const defaultCurrentHeatId =
  initialHeats.find((heat) => heat.status === "active")?.id ??
  initialHeats.find((heat) => heat.status === "ready")?.id ??
  initialHeats[0]?.id ??
  "heat-1";

const EventOSContext = createContext<EventOSContextValue | undefined>(undefined);

function createLogId(logs: EventLog[]) {
  return `LOG-${String(logs.length + 1).padStart(3, "0")}`;
}

function getCurrentTimeLabel() {
  return new Intl.DateTimeFormat("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function formatActorLabel(actor: string) {
  return actor.startsWith("[") ? actor : `[${actor}]`;
}

function updateResultStatus(
  results: ResultScore[],
  resultId: string,
  status: ResultStatus
) {
  return results.map((result) =>
    result.id === resultId ? { ...result, status } : result
  );
}

function createInitialState(): EventOSState {
  return {
    activeEventId: defaultActiveEventId,
    currentHeatId: defaultCurrentHeatId,
    events: managedEvents,
    participants: initialParticipants,
    heats: initialHeats,
    results: resultScores,
    hallOfFameWinners: publishedHallOfFameWinners,
    eventSponsors: [],
    logs: eventLogs,
    selectedDriverId: undefined,
  };
}

function readStoredState() {
  if (typeof window === "undefined") return createInitialState();

  try {
    const stored = window.localStorage.getItem(EVENTOS_STATE_STORAGE_KEY);
    return stored ? ({ ...createInitialState(), ...JSON.parse(stored) } as EventOSState) : createInitialState();
  } catch {
    return createInitialState();
  }
}

function clearStorageKeys(scope: EventOSResetScope) {
  if (typeof window === "undefined") return;

  if (scope === "bookings" || scope === "all") {
    window.localStorage.removeItem(EVENTOS_BOOKING_STORAGE_KEY);
  }

  if (scope === "contacts" || scope === "all") {
    window.localStorage.removeItem(EVENTOS_CONTACT_STORAGE_KEY);
  }

  if (scope === "sponsors" || scope === "all") {
    window.localStorage.removeItem(EVENTOS_ADMIN_SPONSOR_STORAGE_KEY);
  }

  if (scope === "permissions" || scope === "all") {
    window.localStorage.removeItem(EVENTOS_ADMIN_PERMISSION_STORAGE_KEY);
  }

  if (scope === "gallery" || scope === "all") {
    window.localStorage.removeItem(EVENTOS_ADMIN_GALLERY_STORAGE_KEY);
  }

  if (scope === "all") {
    window.localStorage.removeItem(EVENTOS_STATE_STORAGE_KEY);
  }
}

function prependLog(logs: EventLog[], log: Omit<EventLog, "id"> & { id?: string }) {
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

export function EventOSProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EventOSState>(readStoredState);

  useEffect(() => {
    window.localStorage.setItem(EVENTOS_STATE_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<EventOSContextValue>(
    () => ({
      ...state,
      setActiveEvent: (eventId) => {
        setState((current) => ({
          ...current,
          activeEventId: eventId,
          logs: prependLog(current.logs, {
            time: getCurrentTimeLabel(),
            category: "Eventkontrol",
            message: `${eventId} er valgt som aktivt EventOS-event.`,
            severity: "info",
          }),
        }));
      },
      updateEventStatus: (eventId, status) => {
        setState((current) => {
          const event = current.events.find((item) => item.id === eventId);
          return {
            ...current,
            events: current.events.map((item) =>
              item.id === eventId ? { ...item, status } : item
            ),
            logs: prependLog(current.logs, {
              time: getCurrentTimeLabel(),
            category: "Eventkontrol",
            message: `${event?.title ?? eventId} er sat til ${status} i manuel eventdrift.`,
              severity: status === "Live" ? "success" : status === "Finished" || status === "Archived" ? "warning" : "info",
            }),
          };
        });
      },
      setCurrentHeat: (heatId) => {
        setState((current) => ({
          ...current,
          currentHeatId: heatId,
          heats: current.heats.map((heat) => {
            if (heat.id === heatId && heat.status !== "finished") {
              return { ...heat, status: "active" };
            }

            if (heat.id !== heatId && heat.status === "active") {
              return { ...heat, status: "ready" };
            }

            return heat;
          }),
        }));
      },
      createEvent: (event) => {
        setState((current) => ({
          ...current,
          activeEventId: event.id,
          events: [event, ...current.events.filter((item) => item.id !== event.id)],
          logs: prependLog(current.logs, {
            time: getCurrentTimeLabel(),
            category: "Eventoversigt",
            message: `${event.title} er oprettet i EventOS fra template og klar til staff-flow.`,
            severity: "success",
          }),
        }));
      },
      deleteEvent: (eventId, actor = "DarkLight staff") => {
        setState((current) => {
          const event = current.events.find((item) => item.id === eventId);

          return {
            ...current,
            activeEventId: current.activeEventId === eventId ? current.events.find((item) => item.id !== eventId)?.id ?? defaultActiveEventId : current.activeEventId,
            events: current.events.filter((item) => item.id !== eventId),
            participants: current.participants.filter((participant) => participant.eventId !== eventId),
            heats: current.heats.filter((heat) => heat.eventId !== eventId),
            results: current.results.filter((result) => result.eventId !== eventId),
            hallOfFameWinners: current.hallOfFameWinners.filter((winner) => winner.eventId !== eventId),
            eventSponsors: current.eventSponsors.filter((sponsor) => sponsor.eventId !== eventId),
            logs: prependLog(current.logs, {
              time: getCurrentTimeLabel(),
              category: "Eventoversigt",
              message: `${actor} slettede ${event?.title ?? eventId} og tilhørende lokale eventdata.`,
              severity: "warning",
            }),
          };
        });
      },
      startHeat: (heatId) => {
        setState((current) => ({
          ...current,
          currentHeatId: heatId,
          heats: current.heats.map((heat) => {
            if (heat.id === heatId) {
              return {
                ...heat,
                status: "active",
                currentDriver: heat.currentDriver ?? heat.driverIds[0],
              };
            }

            if (heat.status === "active") {
              return { ...heat, status: "ready" };
            }

            return heat;
          }),
          logs: prependLog(current.logs, {
            time: getCurrentTimeLabel(),
            category: "Heat",
            message: `${heatId} er startet af løbskontrol.`,
            severity: "success",
          }),
        }));
      },
      finishHeat: (heatId) => {
        setState((current) => ({
          ...current,
          heats: current.heats.map((heat) =>
            heat.id === heatId
              ? {
                  ...heat,
                  status: "finished",
                  completedRuns: Math.max(heat.completedRuns, heat.driverIds.length),
                }
              : heat
          ),
          logs: prependLog(current.logs, {
            time: getCurrentTimeLabel(),
            category: "Heat",
            message: `${heatId} er afsluttet og sendt til dommerpanelet.`,
            severity: "info",
          }),
        }));
      },
      addResult: (result) => {
        setState((current) => {
          const driverLabel = result.driverId;
          const resultLabel = result.resultType === "time" ? "tid" : "score";
          const duplicate = current.results.find(
            (item) =>
              item.id !== result.id &&
              item.eventId === result.eventId &&
              item.driverId === result.driverId &&
              item.heatId === result.heatId &&
              item.runNumber === result.runNumber &&
              (item.resultType ?? "score") === (result.resultType ?? "score")
          );
          const storedResult = duplicate ? { ...duplicate, ...result, id: duplicate.id, createdAt: new Date().toISOString() } : result;

          return {
            ...current,
            results: [
              storedResult,
              ...current.results.filter((item) => item.id !== result.id && item.id !== duplicate?.id),
            ],
            logs: prependLog(current.logs, {
              time: getCurrentTimeLabel(),
              category: "Resultat",
              message: duplicate
                ? `Manuel ${resultLabel} for ${driverLabel} opdaterede samme opgørsel uden dublet.`
                : `Manuel ${resultLabel} for ${driverLabel} er registreret og ${result.status}.`,
              severity: result.status === "approved" ? "success" : result.status === "rejected" ? "warning" : "info",
            }),
          };
        });
      },
      updateResult: (resultId, updatedData) => {
        setState((current) => {
          const existing = current.results.find((result) => result.id === resultId);

          return {
            ...current,
            results: current.results.map((result) =>
              result.id === resultId
                ? {
                    ...result,
                    ...updatedData,
                    id: result.id,
                    createdAt: updatedData.createdAt ?? new Date().toISOString(),
                  }
                : result
            ),
            logs: prependLog(current.logs, {
              time: getCurrentTimeLabel(),
              category: "Admin",
              message: `${existing?.judge ?? "DarkLight staff"} redigerede resultat ${resultId}. Samme resultatlinje er opdateret uden dublet.`,
              severity: "info",
            }),
          };
        });
      },
      deleteResult: (resultId) => {
        setState((current) => ({
          ...current,
          results: current.results.filter((result) => result.id !== resultId),
          logs: prependLog(current.logs, {
            time: getCurrentTimeLabel(),
            category: "Admin",
            message: `DarkLight staff slettede resultat ${resultId}.`,
            severity: "warning",
          }),
        }));
      },
      approveResult: (resultId) => {
        setState((current) => ({
          ...current,
          results: updateResultStatus(current.results, resultId, "approved"),
          logs: prependLog(current.logs, {
            time: getCurrentTimeLabel(),
            category: "Score",
            message: `${resultId} er godkendt og vises nu på live ranglisten, profiler, statistik og Hall of Fame-preview.`,
            severity: "success",
          }),
        }));
      },
      rejectResult: (resultId) => {
        setState((current) => ({
          ...current,
          results: updateResultStatus(current.results, resultId, "rejected"),
          logs: prependLog(current.logs, {
            time: getCurrentTimeLabel(),
            category: "Score",
            message: `${resultId} er afvist og kræver staff-gennemgang.`,
            severity: "warning",
          }),
        }));
      },
      publishHallOfFameWinner: (winner) => {
        setState((current) => ({
          ...current,
          hallOfFameWinners: [
            winner,
            ...current.hallOfFameWinners.filter(
              (item) => !(item.eventId === winner.eventId && item.placement === winner.placement)
            ),
          ].sort((a, b) => a.placement - b.placement),
          logs: prependLog(current.logs, {
            time: getCurrentTimeLabel(),
            category: "Hall of Fame",
            message: `${winner.publishedBy} har offentliggjort P${winner.placement} for ${winner.driverId}.`,
            severity: "success",
          }),
        }));
      },
      addSponsorToEvent: (eventId, sponsorData, actor = "DarkLight staff") => {
        setState((current) => {
          const sponsor: EventSponsor = {
            ...sponsorData,
            id: `SP-${Date.now()}`,
            eventId,
          };
          const actorLabel = formatActorLabel(actor);

          return {
            ...current,
            eventSponsors: [sponsor, ...current.eventSponsors],
            logs: prependLog(current.logs, {
              time: getCurrentTimeLabel(),
              category: "Sponsor",
              message: `${actorLabel} tilføjede sponsor ${sponsor.name}.`,
              severity: "success",
            }),
          };
        });
      },
      updateEventSponsor: (eventId, sponsorId, updatedData, actor = "DarkLight staff") => {
        setState((current) => {
          const existing = current.eventSponsors.find((sponsor) => sponsor.eventId === eventId && sponsor.id === sponsorId);
          const nextName = updatedData.name ?? existing?.name ?? sponsorId;
          const actorLabel = formatActorLabel(actor);

          return {
            ...current,
            eventSponsors: current.eventSponsors.map((sponsor) =>
              sponsor.eventId === eventId && sponsor.id === sponsorId
                ? { ...sponsor, ...updatedData, id: sponsor.id, eventId: sponsor.eventId }
                : sponsor
            ),
            logs: prependLog(current.logs, {
              time: getCurrentTimeLabel(),
              category: "Sponsor",
              message: `${actorLabel} redigerede sponsor ${nextName}.`,
              severity: "info",
            }),
          };
        });
      },
      removeSponsorFromEvent: (eventId, sponsorId, actor = "DarkLight staff") => {
        setState((current) => {
          const sponsor = current.eventSponsors.find((item) => item.eventId === eventId && item.id === sponsorId);
          const actorLabel = formatActorLabel(actor);

          return {
            ...current,
            eventSponsors: current.eventSponsors.filter((item) => !(item.eventId === eventId && item.id === sponsorId)),
            logs: prependLog(current.logs, {
              time: getCurrentTimeLabel(),
              category: "Sponsor",
              message: `${actorLabel} fjernede sponsor ${sponsor?.name ?? sponsorId}.`,
              severity: "warning",
            }),
          };
        });
      },
      addParticipant: (eventId, driverId) => {
        setState((current) => {
          const participantId = `P-${String(current.participants.length + 1).padStart(3, "0")}`;
          const alreadyRegistered = current.participants.some(
            (participant) => participant.eventId === eventId && participant.driverId === driverId
          );
          const eventHeats = current.heats.filter((heat) => heat.eventId === eventId);
          const targetHeat = eventHeats[0];

          return {
            ...current,
            participants: alreadyRegistered
              ? current.participants
              : [
                  {
                    id: participantId,
                    eventId,
                    driverId,
                    checkedIn: false,
                  },
                  ...current.participants,
                ],
            events: current.events.map((event) =>
              event.id === eventId && !alreadyRegistered
                ? { ...event, participants: event.participants + 1 }
                : event
            ),
            heats: targetHeat && !targetHeat.driverIds.includes(driverId)
              ? current.heats.map((heat) =>
                  heat.id === targetHeat.id
                    ? {
                        ...heat,
                        driverIds: [...heat.driverIds, driverId],
                        currentDriver: heat.currentDriver ?? driverId,
                      }
                    : heat
                )
              : current.heats,
            logs: prependLog(current.logs, {
              time: getCurrentTimeLabel(),
              category: "Tilmelding",
              message: alreadyRegistered
                ? `${driverId} er allerede tilmeldt ${eventId}.`
                : `${driverId} er tilmeldt ${eventId} og lagt i første heat.`,
              severity: alreadyRegistered ? "warning" : "success",
            }),
          };
        });
      },
      removeParticipant: (participantId, actor = "DarkLight staff") => {
        setState((current) => {
          const participant = current.participants.find((item) => item.id === participantId);
          const event = participant ? current.events.find((item) => item.id === participant.eventId) : undefined;

          return {
            ...current,
            participants: current.participants.filter((item) => item.id !== participantId),
            events: participant
              ? current.events.map((item) =>
                  item.id === participant.eventId
                    ? { ...item, participants: Math.max(item.participants - 1, 0) }
                    : item
                )
              : current.events,
            heats: participant
              ? current.heats.map((heat) =>
                  heat.eventId === participant.eventId
                    ? {
                        ...heat,
                        driverIds: heat.driverIds.filter((driverId) => driverId !== participant.driverId),
                        currentDriver: heat.currentDriver === participant.driverId ? undefined : heat.currentDriver,
                      }
                    : heat
                )
              : current.heats,
            logs: prependLog(current.logs, {
              time: getCurrentTimeLabel(),
              category: "Deltager",
              message: participant
                ? `${actor} fjernede ${participant.driverId} fra ${event?.title ?? "eventet"}. Driverprofilen er bevaret.`
                : `${actor} forsøgte at fjerne en deltager, men deltageren blev ikke fundet.`,
              severity: participant ? "warning" : "danger",
            }),
          };
        });
      },
      addEventLog: (log) => {
        setState((current) => ({
          ...current,
          logs: prependLog(current.logs, log),
        }));
      },
      selectDriver: (driverId) => {
        setState((current) => ({ ...current, selectedDriverId: driverId }));
      },
      setParticipantCheckIn: (participantId, checkedIn) => {
        setState((current) => ({
          ...current,
          participants: current.participants.map((participant) =>
            participant.id === participantId ? { ...participant, checkedIn } : participant
          ),
          logs: prependLog(current.logs, {
            time: getCurrentTimeLabel(),
            category: "Check-in",
            message: `${participantId} er ${checkedIn ? "checket ind" : "fjernet fra check-in"} i EventOS.`,
            severity: checkedIn ? "success" : "warning",
          }),
        }));
      },
      resetEventData: (scope, actor = "DarkLight staff") => {
        clearStorageKeys(scope);
        setState((current) => {
          const initial = createInitialState();
          const logMessage = `${actor} nulstillede ${scope}.`;
          const resetLog = {
            time: getCurrentTimeLabel(),
            category: "Admin reset",
            message: logMessage,
            severity: "warning" as const,
          };

          if (scope === "leaderboard") {
            return {
              ...current,
              results: current.results.filter((result) => result.status !== "approved"),
              hallOfFameWinners: [],
              logs: prependLog(current.logs, resetLog),
            };
          }

          if (scope === "results" || scope === "season" || scope === "achievements") {
            return {
              ...current,
              results: [],
              hallOfFameWinners: scope === "results" ? [] : current.hallOfFameWinners,
              logs: prependLog(current.logs, resetLog),
            };
          }

          if (scope === "hallOfFame") {
            return { ...current, hallOfFameWinners: [], logs: prependLog(current.logs, resetLog) };
          }

          if (scope === "participants") {
            return { ...current, participants: [], logs: prependLog(current.logs, resetLog) };
          }

          if (scope === "checkIns") {
            return {
              ...current,
              participants: current.participants.map((participant) => ({ ...participant, checkedIn: false })),
              logs: prependLog(current.logs, resetLog),
            };
          }

          if (scope === "logs") {
            return { ...current, logs: [prependLog([], resetLog)[0]!] };
          }

          if (scope === "bookings" || scope === "contacts" || scope === "sponsors" || scope === "permissions" || scope === "gallery") {
            return { ...current, logs: prependLog(current.logs, resetLog) };
          }

          return {
            ...initial,
            logs: prependLog([], resetLog),
          };
        });
      },
      resetSingleEventData: (eventId, scope, actor = "DarkLight staff") => {
        setState((current) => {
          const event = current.events.find((item) => item.id === eventId);
          const resetLog = {
            time: getCurrentTimeLabel(),
            category: "Admin reset",
            message: `${actor} nulstillede ${scope} for ${event?.title ?? eventId}.`,
            severity: "warning" as const,
          };
          const shouldResetAll = scope === "all";
          const shouldResetParticipants = scope === "participants" || shouldResetAll;
          const shouldResetResults = scope === "results" || scope === "leaderboard" || shouldResetAll;
          const shouldResetWinners = scope === "winners" || shouldResetAll;
          const shouldResetHistory = scope === "history" || shouldResetAll;

          return {
            ...current,
            events: shouldResetParticipants || shouldResetAll
              ? current.events.map((item) =>
                  item.id === eventId
                    ? { ...item, participants: 0, status: shouldResetAll ? "Ready" : item.status }
                    : item
                )
              : current.events,
            participants: shouldResetParticipants
              ? current.participants.filter((participant) => participant.eventId !== eventId)
              : current.participants,
            heats: shouldResetParticipants
              ? current.heats.map((heat) =>
                  heat.eventId === eventId
                    ? { ...heat, driverIds: [], currentDriver: undefined, completedRuns: 0, status: "ready" }
                    : heat
                )
              : current.heats,
            results: shouldResetResults
              ? current.results.filter((result) => result.eventId !== eventId)
              : current.results,
            hallOfFameWinners: shouldResetWinners
              ? current.hallOfFameWinners.filter((winner) => winner.eventId !== eventId)
              : current.hallOfFameWinners,
            logs: shouldResetHistory ? [prependLog([], resetLog)[0]!] : prependLog(current.logs, resetLog),
          };
        });
      },
      resetDriverData: (driverId, scope, actor = "DarkLight staff") => {
        setState((current) => ({
          ...current,
          results: current.results.filter((result) => result.driverId !== driverId),
          logs: prependLog(current.logs, {
            time: getCurrentTimeLabel(),
            category: "Admin driver",
            message: `${actor} nulstillede ${scope} for ${driverId}. Driverprofilen er bevaret.`,
            severity: "warning",
          }),
        }));
      },
    }),
    [state]
  );

  return createElement(EventOSContext.Provider, { value }, children);
}

export function useEventOSStore() {
  const context = useContext(EventOSContext);

  if (!context) {
    throw new Error("useEventOSStore must be used inside EventOSProvider");
  }

  return context;
}

export function useEventOSEvents() {
  const { activeEventId, events, setActiveEvent, createEvent } = useEventOSStore();
  return { activeEventId, events, setActiveEvent, createEvent };
}

export function useEventOSHeats() {
  const { currentHeatId, heats, setCurrentHeat, startHeat, finishHeat } = useEventOSStore();
  return { currentHeatId, heats, setCurrentHeat, startHeat, finishHeat };
}

export function useEventOSResults() {
  const { results, approveResult, rejectResult, updateResult, deleteResult } = useEventOSStore();
  return { results, approveResult, rejectResult, updateResult, deleteResult };
}

export function useEventOSLogs() {
  const { logs, addEventLog } = useEventOSStore();
  return { logs, addEventLog };
}

export function useEventOSParticipants() {
  const { participants, setParticipantCheckIn, selectedDriverId, selectDriver, removeParticipant } = useEventOSStore();
  return { participants, setParticipantCheckIn, selectedDriverId, selectDriver, removeParticipant };
}
