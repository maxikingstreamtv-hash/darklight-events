import { UPCOMING_EVENTS_EMPTY_TEXT, UPCOMING_EVENTS_EMPTY_TITLE } from "@/lib/events/public-events";

export default function UpcomingEventsEmpty() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <h2 className="text-3xl font-black">{UPCOMING_EVENTS_EMPTY_TITLE}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-zinc-400">{UPCOMING_EVENTS_EMPTY_TEXT}</p>
    </div>
  );
}
