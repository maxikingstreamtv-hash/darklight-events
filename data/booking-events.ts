export type BookingEvent = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  priceLevel: "Standard" | "Premium" | "Elite";
  duration: string;
};

export const bookingEvents: BookingEvent[] = [
  {
    id: "car-meet",
    title: "Car Meetup",
    category: "Automotive",
    description:
      "A clean car meet with show cars, prizes, music and DarkLight event coordination.",
    image: "/images/events/car-meetup.png",
    priceLevel: "Standard",
    duration: "1-2 hours",
  },
  {
    id: "concert",
    title: "DJ Event",
    category: "Stage Event",
    description:
      "A cinematic music event with lights, crowd control and a strong DarkLight atmosphere.",
    image: "/images/events/dj-events.png",
    priceLevel: "Elite",
    duration: "2-3 hours",
  },
  {
    id: "wedding",
    title: "Wedding",
    category: "Private Event",
    description:
      "An elegant wedding setup with location, entry, ceremony flow and afterparty.",
    image: "/images/events/brylluper.png",
    priceLevel: "Premium",
    duration: "2 hours",
  },
  {
    id: "company-party",
    title: "Group Party",
    category: "Social Event",
    description:
      "A polished party setup for companies, crews, groups or city organizations.",
    image: "/images/events/firmafester.png",
    priceLevel: "Premium",
    duration: "2-4 hours",
  },
  {
    id: "race-event",
    title: "Race Event",
    category: "Motorsport",
    description:
      "A controlled race event with route planning, staging, prizes and event staff.",
    image: "/images/events/races.png",
    priceLevel: "Elite",
    duration: "1-2 hours",
  },
  {
    id: "drift-event",
    title: "Drift Event",
    category: "Motorsport",
    description:
      "A high-energy drift event with scoring, judges and a strong spectator experience.",
    image: "/images/events/drift-events.png",
    priceLevel: "Premium",
    duration: "1-2 hours",
  },
  {
    id: "debate",
    title: "Debate Night",
    category: "Stage Event",
    description:
      "A structured debate event with stage setup, host flow and controlled audience format.",
    image: "/images/events/debat-events.png",
    priceLevel: "Standard",
    duration: "1 hour",
  },
  {
    id: "pool-party",
    title: "Pool Party",
    category: "Social Event",
    description:
      "A premium pool party with music, VIP areas and a strong Los Santos vibe.",
    image: "/images/events/pool-party.png",
    priceLevel: "Premium",
    duration: "2 hours",
  },
];
