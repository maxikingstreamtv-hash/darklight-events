export type Vehicle = {
  id: string;
  ownerDriverId: string;
  model: string;
  class: string;
  color: string;
  registration: string;
  nickname: string;
  image: string;
  active: boolean;
};

export const vehicles: Vehicle[] = [
  { id: "veh-001", ownerDriverId: "cole-kane", model: "Elegy Retro Custom", class: "Drift", color: "Pearl White", registration: "DL-CK-001", nickname: "Moonblade", image: "/garage/placeholder-car.png", active: true },
  { id: "veh-002", ownerDriverId: "cole-kane", model: "Sultan RS", class: "Street", color: "Silver", registration: "DL-CK-002", nickname: "Apex", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-003", ownerDriverId: "cole-kane", model: "Jester Classic", class: "Drift", color: "Black", registration: "DL-CK-003", nickname: "Nightspin", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-004", ownerDriverId: "cole-kane", model: "Dominator", class: "Track", color: "Graphite", registration: "DL-CK-004", nickname: "Silverline", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-005", ownerDriverId: "cole-kane", model: "Banshee", class: "Rally", color: "White", registration: "DL-CK-005", nickname: "Stormcall", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-006", ownerDriverId: "cole-kane", model: "Comet Retro", class: "Race", color: "Blue Silver", registration: "DL-CK-006", nickname: "Ghostline", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-007", ownerDriverId: "izadora-solis", model: "Jester Classic", class: "Show", color: "Chrome Red", registration: "DL-IS-001", nickname: "Velvet", image: "/garage/placeholder-car.png", active: true },
  { id: "veh-008", ownerDriverId: "izadora-solis", model: "Tempesta", class: "Super", color: "Silver", registration: "DL-IS-002", nickname: "Mirage", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-009", ownerDriverId: "izadora-solis", model: "Itali GTO", class: "Street", color: "White", registration: "DL-IS-003", nickname: "Halo", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-010", ownerDriverId: "izadora-solis", model: "Paragon R", class: "Luxury", color: "Black", registration: "DL-IS-004", nickname: "Monarch", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-011", ownerDriverId: "izadora-solis", model: "Comet S2", class: "Show", color: "Pearl", registration: "DL-IS-005", nickname: "Starlace", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-012", ownerDriverId: "izadora-solis", model: "Corsita", class: "Sprint", color: "Wine Red", registration: "DL-IS-006", nickname: "Roseline", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-013", ownerDriverId: "alex-corleone", model: "Sultan Classic", class: "Race", color: "Matte Black", registration: "DL-AC-001", nickname: "Blackout", image: "/garage/placeholder-car.png", active: true },
  { id: "veh-014", ownerDriverId: "alex-corleone", model: "Banshee 900R", class: "Drag", color: "Silver", registration: "DL-AC-002", nickname: "Needle", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-015", ownerDriverId: "alex-corleone", model: "Dominator ASP", class: "Muscle", color: "Dark Grey", registration: "DL-AC-003", nickname: "Grinder", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-016", ownerDriverId: "alex-corleone", model: "10F", class: "Street", color: "White", registration: "DL-AC-004", nickname: "Vector", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-017", ownerDriverId: "alex-corleone", model: "Kamacho", class: "Offroad", color: "Sand", registration: "DL-AC-005", nickname: "Ridge", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-018", ownerDriverId: "alex-corleone", model: "Everon", class: "Offroad", color: "Black", registration: "DL-AC-006", nickname: "Trailguard", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-019", ownerDriverId: "cole-kane", model: "Drift Tampa", class: "Drift", color: "Silver Smoke", registration: "DL-CK-007", nickname: "Sideways", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-020", ownerDriverId: "izadora-solis", model: "Cypher", class: "Meet", color: "Ice White", registration: "DL-IS-007", nickname: "Crystal", image: "/garage/placeholder-car.png", active: false },
];
