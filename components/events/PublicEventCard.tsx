import Link from "next/link";
import EventImage from "@/components/events/EventImage";
import { getPublicEventCardStatus, getPublicPrizeIndicator, publicEventHref, publicEventRegistrationHref, type PublicUpcomingEvent, UPCOMING_EVENT_CTA, UPCOMING_EVENT_DETAILS_CTA } from "@/lib/events/public-events";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default function PublicEventCard({ event, wide = false }: { event: PublicUpcomingEvent; wide?: boolean }) {
  const occupied = event.registrations.length;
  const prizeIndicator = getPublicPrizeIndicator(event);
  const votingOpen = ["PUBLIC_VOTE_ONLY", "JUDGE_AND_PUBLIC_VOTE"].includes(event.resultMethod) && Boolean(event.votingOpenAt && event.votingOpenAt <= new Date() && (!event.votingCloseAt || event.votingCloseAt > new Date()) && !event.resultsPublishedAt);
  return (
    <article className={`group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-white/30 ${wide ? "grid md:grid-cols-2" : "p-5"}`}>
      <Link href={publicEventHref(event.id)} aria-label={`Se ${event.title}`} className={`relative block overflow-hidden border-white/10 bg-black outline-none ring-white transition focus-visible:ring-2 ${wide ? "aspect-video md:aspect-auto md:min-h-96 md:border-r" : "aspect-video rounded-[1.5rem] border"}`}>
          <EventImage src={event.thumbnailUrl ?? event.bannerUrl} alt={event.imageAlt ?? event.title} focusX={event.imageFocusX} focusY={event.imageFocusY} className="opacity-90 transition group-hover:scale-[1.02]" />
      </Link>
      <div className={wide ? "flex flex-col justify-center p-8 md:p-10" : ""}>
        <div className={`${wide ? "" : "mt-5"} flex flex-wrap gap-2`}>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-zinc-300">{getPublicEventCardStatus(event)}</span>
          {prizeIndicator ? (
            <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-100">
              🏆 {prizeIndicator}
            </span>
          ) : null}
        </div>
        <h2 className={`${wide ? "mt-5 text-4xl" : "mt-4 text-2xl"} font-black`}><Link href={publicEventHref(event.id)} className="outline-none decoration-zinc-500 underline-offset-4 hover:underline focus-visible:underline">{event.title}</Link></h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">{event.description}</p>
        <div className="mt-5 grid gap-2 text-sm text-zinc-500">
          <p>{formatDate(event.startsAt)}</p>
          <p>{event.location ?? "Lokation ikke angivet"}</p>
          {event.usesParticipantRegistration ? (
            <p>{occupied} af {event.maxParticipants ?? "ubegrænset"} pladser optaget</p>
          ) : null}
          {votingOpen ? <Link href={`/events/${event.id}/vote`} className="inline-flex w-fit rounded-full bg-violet-300 px-7 py-3 font-black text-black transition hover:bg-violet-200">Stem nu</Link> : null}
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={publicEventHref(event.id)} className="inline-flex w-fit rounded-full bg-white px-7 py-3 font-black text-black transition hover:bg-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            {UPCOMING_EVENT_DETAILS_CTA}
          </Link>
          {event.usesParticipantRegistration ? (
            <Link href={publicEventRegistrationHref(event.id)} className="inline-flex w-fit rounded-full border border-white/15 px-7 py-3 font-black text-white transition hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              {UPCOMING_EVENT_CTA}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
