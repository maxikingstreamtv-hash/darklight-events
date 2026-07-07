export type Vehicle = {
  id: string;
  ownerDriverId: string;
  brand: string;
  model: string;
  class: string;
  color: string;
  registration: string;
  nickname: string;
  image: string;
  active: boolean;
};

export const vehicles: Vehicle[] = [
  { id: "veh-001", ownerDriverId: "cole-kane", brand: "Nissan", model: "Silvia S15", class: "Drift", color: "Pearl White", registration: "DL-CK-001", nickname: "Moonblade", image: "/garage/placeholder-car.png", active: true },
  { id: "veh-002", ownerDriverId: "cole-kane", brand: "BMW", model: "M3 E46", class: "Street", color: "Silver", registration: "DL-CK-002", nickname: "Apex", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-003", ownerDriverId: "cole-kane", brand: "Mazda", model: "RX-7", class: "Drift", color: "Black", registration: "DL-CK-003", nickname: "Nightspin", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-004", ownerDriverId: "cole-kane", brand: "Dinka", model: "Jester RR", class: "Track", color: "Graphite", registration: "DL-CK-004", nickname: "Silverline", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-005", ownerDriverId: "cole-kane", brand: "Karin", model: "Sultan RS", class: "Rally", color: "White", registration: "DL-CK-005", nickname: "Stormcall", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-006", ownerDriverId: "cole-kane", brand: "Annis", model: "Elegy RH8", class: "Race", color: "Blue Silver", registration: "DL-CK-006", nickname: "Ghostline", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-007", ownerDriverId: "izadora-solis", brand: "Benefactor", model: "Schlagen GT", class: "Show", color: "Chrome Red", registration: "DL-IS-001", nickname: "Velvet", image: "/garage/placeholder-car.png", active: true },
  { id: "veh-008", ownerDriverId: "izadora-solis", brand: "Pegassi", model: "Tempesta", class: "Super", color: "Silver", registration: "DL-IS-002", nickname: "Mirage", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-009", ownerDriverId: "izadora-solis", brand: "Grotti", model: "Itali GTO", class: "Street", color: "White", registration: "DL-IS-003", nickname: "Halo", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-010", ownerDriverId: "izadora-solis", brand: "Enus", model: "Paragon R", class: "Luxury", color: "Black", registration: "DL-IS-004", nickname: "Monarch", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-011", ownerDriverId: "izadora-solis", brand: "Pfister", model: "Comet S2", class: "Show", color: "Pearl", registration: "DL-IS-005", nickname: "Starlace", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-012", ownerDriverId: "izadora-solis", brand: "Lampadati", model: "Corsita", class: "Sprint", color: "Wine Red", registration: "DL-IS-006", nickname: "Roseline", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-013", ownerDriverId: "alex-corleone", brand: "BMW", model: "M3", class: "Race", color: "Matte Black", registration: "DL-AC-001", nickname: "Blackout", image: "/garage/placeholder-car.png", active: true },
  { id: "veh-014", ownerDriverId: "alex-corleone", brand: "Bravado", model: "Banshee 900R", class: "Drag", color: "Silver", registration: "DL-AC-002", nickname: "Needle", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-015", ownerDriverId: "alex-corleone", brand: "Vapid", model: "Dominator ASP", class: "Muscle", color: "Dark Grey", registration: "DL-AC-003", nickname: "Grinder", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-016", ownerDriverId: "alex-corleone", brand: "Obey", model: "10F", class: "Street", color: "White", registration: "DL-AC-004", nickname: "Vector", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-017", ownerDriverId: "alex-corleone", brand: "Canis", model: "Kamacho", class: "Offroad", color: "Sand", registration: "DL-AC-005", nickname: "Ridge", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-018", ownerDriverId: "alex-corleone", brand: "Karin", model: "Everon", class: "Offroad", color: "Black", registration: "DL-AC-006", nickname: "Trailguard", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-019", ownerDriverId: "cole-kane", brand: "Declasse", model: "Drift Tampa", class: "Drift", color: "Silver Smoke", registration: "DL-CK-007", nickname: "Sideways", image: "/garage/placeholder-car.png", active: false },
  { id: "veh-020", ownerDriverId: "izadora-solis", brand: "Ubermacht", model: "Cypher", class: "Meet", color: "Ice White", registration: "DL-IS-007", nickname: "Crystal", image: "/garage/placeholder-car.png", active: false },
];
