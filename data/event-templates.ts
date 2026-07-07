import type { ManagedEvent } from "@/data/event-manager";

export type EventTemplate = {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: string;
  defaultHeats: number;
  defaultMaxParticipants: number;
  recommendedJudges: number;
  defaultStatus: ManagedEvent["status"];
  defaultLocation: string;
  defaultRules: string[];
  defaultSchedule: string[];
  defaultPointSystem: string[];
};

export const eventTemplates: EventTemplate[] = [
  {
    id: "drift-championship",
    name: "Drift Championship",
    icon: "💨",
    description: "Bracket-baseret drift event med tandem battles og dommerpanel.",
    type: "Drift",
    defaultHeats: 4,
    defaultMaxParticipants: 32,
    recommendedJudges: 3,
    defaultStatus: "Ready",
    defaultLocation: "Los Santos Car Meet",
    defaultRules: [
      "Alle drivers møder ind ved pitområdet før briefing.",
      "Kontakt, blocking og fail RP vurderes af dommerpanelet.",
      "Kun godkendte RP-køretøjer må bruges i bracket.",
    ],
    defaultSchedule: [
      "20:00 Staff briefing",
      "20:15 Driver check-in",
      "20:30 Heat 1 starter",
      "21:45 Finaler og podium",
    ],
    defaultPointSystem: [
      "Style 25 pts",
      "Speed 25 pts",
      "Angle 25 pts",
      "Line 25 pts",
      "Penalties trækkes fra totalen",
    ],
  },
  {
    id: "street-race",
    name: "Street Race",
    icon: "🏁",
    description: "FiveM street race med checkpoints, live rangliste og løbskontrol.",
    type: "Race",
    defaultHeats: 5,
    defaultMaxParticipants: 24,
    recommendedJudges: 2,
    defaultStatus: "Ready",
    defaultLocation: "Vinewood Track",
    defaultRules: [
      "Kørere skal følge markeret rute og checkpoint-kald.",
      "Ingen pit maneuver medmindre event rules tillader kontakt.",
      "Restart kræver godkendelse fra løbskontrol.",
    ],
    defaultSchedule: [
      "19:45 Route briefing",
      "20:00 Check-in lukker",
      "20:10 Qualifying heats",
      "21:00 Finale heat",
    ],
    defaultPointSystem: [
      "1. plads 25 pts",
      "2. plads 18 pts",
      "3. plads 15 pts",
      "Fastest clean lap +5 pts",
    ],
  },
  {
    id: "drag-race",
    name: "Drag Race",
    icon: "🚀",
    description: "Knockout drag event med startlinje, reaction calls og ladder finale.",
    type: "Drag",
    defaultHeats: 6,
    defaultMaxParticipants: 16,
    recommendedJudges: 2,
    defaultStatus: "Ready",
    defaultLocation: "Sandy Shores Airfield",
    defaultRules: [
      "False start giver rerun eller diskvalifikation efter staff call.",
      "Kørere bliver kaldt frem via løbskontrol.",
      "Kun biler godkendt ved staging må starte.",
    ],
    defaultSchedule: [
      "20:00 Vehicle tech check",
      "20:20 Ladder draw",
      "20:30 Round 1",
      "21:15 Finals",
    ],
    defaultPointSystem: [
      "Win +10 pts",
      "Clean launch +3 pts",
      "Final win +15 pts",
      "False start -5 pts",
    ],
  },
  {
    id: "car-meet",
    name: "Car Meet",
    icon: "🚗",
    description: "Social RP car meet med crew parking, photos og light judging.",
    type: "Car Meet",
    defaultHeats: 2,
    defaultMaxParticipants: 50,
    recommendedJudges: 2,
    defaultStatus: "Ready",
    defaultLocation: "Vinewood Parking",
    defaultRules: [
      "Ingen våben eller hostile RP på eventområdet.",
      "Parkering følger staff anvisninger.",
      "Burnouts kræver særskilt tilladelse fra event staff.",
    ],
    defaultSchedule: [
      "20:00 Gates open",
      "20:30 Crew photos",
      "21:00 Showcase walk",
      "21:30 Awards",
    ],
    defaultPointSystem: [
      "Presence 20 pts",
      "Build quality 30 pts",
      "Theme 25 pts",
      "RP presentation 25 pts",
    ],
  },
  {
    id: "offroad-challenge",
    name: "Offroad Challenge",
    icon: "⛰️",
    description: "Checkpoint-baseret offroad RP event med recovery calls og stage times.",
    type: "Offroad",
    defaultHeats: 4,
    defaultMaxParticipants: 20,
    recommendedJudges: 3,
    defaultStatus: "Ready",
    defaultLocation: "Mount Chiliad Trail",
    defaultRules: [
      "Recovery RP skal respekteres ved rollover eller damage.",
      "Missing checkpoint giver tidsstraf.",
      "Crew radio calls håndteres af løbskontrol.",
    ],
    defaultSchedule: [
      "19:30 Trail briefing",
      "20:00 Stage 1",
      "20:45 Stage 2",
      "21:30 Results review",
    ],
    defaultPointSystem: [
      "Stage completion 40 pts",
      "Clean checkpoints 30 pts",
      "Recovery discipline 20 pts",
      "Penalties -10 pts",
    ],
  },
  {
    id: "car-show",
    name: "Car Show",
    icon: "🏆",
    description: "Premium RP car show med judges, presentation og awards.",
    type: "Car Show",
    defaultHeats: 3,
    defaultMaxParticipants: 40,
    recommendedJudges: 4,
    defaultStatus: "Ready",
    defaultLocation: "Rockford Plaza",
    defaultRules: [
      "Hver deltager får en kort RP-præsentation af bilen.",
      "Dommerne vurderer build, tema og detaljer.",
      "Trolling, blocking og fail RP giver diskvalifikation.",
    ],
    defaultSchedule: [
      "20:00 Roll-in",
      "20:30 Judge walkthrough",
      "21:15 Finalists",
      "21:45 Awards og photos",
    ],
    defaultPointSystem: [
      "Design 25 pts",
      "Finish 25 pts",
      "Details 25 pts",
      "RP presentation 25 pts",
    ],
  },
];
