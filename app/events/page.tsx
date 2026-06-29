"use client";

import { useState } from "react";
import EventCard from "@/components/events/EventCard";
import CategoryFilter from "@/components/events/CategoryFilter";
import { events } from "@/data/events";

const categories = [
  "Alle",
  "Sociale Events",
  "Livsbegivenheder",
  "Motorsport",
  "Automotive",
  "Underholdning",
  "Shows & Konkurrencer",
];

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState("Alle");

  const filteredEvents =
    activeCategory === "Alle"
      ? events
      : events.filter((event) => event.category === activeCategory);

  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
          DarkLight Events
        </p>

        <h1 className="mt-4 text-5xl font-black md:text-7xl">
          Vores Events
        </h1>

        <p className="mt-6 max-w-3xl text-gray-400">
          Vælg en kategori og find den oplevelse, der passer bedst til dit event.
        </p>

        <div className="mt-12">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.title} event={event} />
          ))}
        </div>
      </div>
    </main>
  );
}