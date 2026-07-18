import Link from "next/link";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";
import {
  createAnnouncementAction,
  saveResultAction,
  updateRegistrationStatusAction,
} from "@/app/competition/eventos-actions";

export const dynamic = "force-dynamic";

export default async function EventTabletPage() {
  const activeEvent = await prisma.event.findFirst({
    where: { active: true, status: { in: ["ACTIVE", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "UPCOMING"] } },
    orderBy: [{ status: "asc" }, { startsAt: "desc" }],
    include: {
      registrations: {
        orderBy: [{ status: "asc" }, { createdAt: "asc" }],
        include: {
          user: { select: { displayName: true, darklightId: true } },
          vehicle: { select: { displayName: true, licensePlate: true } },
        },
      },
      competitions: {
        include: {
          participants: { orderBy: [{ seed: "asc" }, { createdAt: "asc" }] },
          heats: {
            orderBy: [{ round: "asc" }, { heatNumber: "asc" }],
            include: { entries: { orderBy: { startPosition: "asc" }, include: { participant: true } } },
          },
          brackets: {
            include: {
              matches: {
                orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
                include: { participantA: true, participantB: true, winner: true },
              },
            },
          },
        },
      },
      announcements: { where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 5 },
    },
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <CompetitionLayout>
        <section className="relative overflow-hidden px-4 py-20 md:px-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />
          <div className="relative mx-auto max-w-[1500px]">
            <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="mb-3 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight Event Tablet</p>
                <h1 className="text-4xl font-black md:text-6xl">Event Tablet</h1>
                <p className="mt-4 max-w-3xl text-zinc-400">Touch-venlig staffflade til check-in, liveoverblik, resultater og announcements.</p>
              </div>
              <Link href="/competition/control-center" className="w-fit rounded-full border border-white/10 px-6 py-4 font-black text-zinc-200 transition hover:bg-white hover:text-black">
                Kontrolcenter
              </Link>
            </div>

            {!activeEvent ? (
              <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Tom-state</p>
                <h2 className="mt-4 text-3xl font-black">Ingen aktivt event</h2>
                <p className="mx-auto mt-4 max-w-2xl text-zinc-500">Start eller publicér et event i EventOS, så tabletfladen kan bruges.</p>
              </div>
            ) : (
              <>
                <div className="mb-8 grid gap-5 md:grid-cols-4">
                  <Stat title="Event" value={activeEvent.title} />
                  <Stat title="Status" value={activeEvent.status} />
                  <Stat title="Tilmeldinger" value={activeEvent.registrations.length} />
                  <Stat title="Konkurrencer" value={activeEvent.competitions.length} />
                </div>

                <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
                  <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6">
                    <h2 className="mb-6 text-3xl font-black">Check-in</h2>
                    <div className="grid gap-4">
                      {activeEvent.registrations.map((registration) => (
                        <article key={registration.id} className="grid gap-4 rounded-2xl border border-white/10 bg-black p-5 md:grid-cols-[1fr_auto] md:items-center">
                          <div>
                            <h3 className="text-2xl font-black">{registration.user.displayName}</h3>
                            <p className="mt-1 text-sm text-zinc-500">
                              {registration.user.darklightId ?? "DarkLight ID mangler"} · {registration.vehicle?.displayName ?? "Køretøj ikke valgt"} · {registration.status}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <form action={updateRegistrationStatusAction.bind(null, registration.id, "APPROVED")}><TouchButton>Godkend</TouchButton></form>
                            <form action={updateRegistrationStatusAction.bind(null, registration.id, "CHECKED_IN")}><TouchButton>Check ind</TouchButton></form>
                            <form action={updateRegistrationStatusAction.bind(null, registration.id, "REJECTED")}><TouchButton danger>Afvis</TouchButton></form>
                          </div>
                        </article>
                      ))}
                      {activeEvent.registrations.length === 0 ? <p className="text-zinc-500">Ingen tilmeldinger endnu.</p> : null}
                    </div>
                  </section>

                  <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6">
                    <h2 className="mb-6 text-3xl font-black">Announcement</h2>
                    <form action={createAnnouncementAction.bind(null, activeEvent.id)} className="grid gap-4">
                      <input name="title" placeholder="Titel" className="rounded-2xl border border-white/10 bg-black px-5 py-4 text-lg text-white outline-none" />
                      <textarea name="message" placeholder="Besked til livecenter" rows={5} className="rounded-2xl border border-white/10 bg-black px-5 py-4 text-lg text-white outline-none" />
                      <label className="flex items-center gap-3 font-bold text-zinc-300"><input type="checkbox" name="publish" defaultChecked /> Publicér straks</label>
                      <button className="rounded-full bg-white px-6 py-4 text-lg font-black text-black" type="submit">Send</button>
                    </form>
                  </section>
                </div>

                <section className="mt-8 grid gap-8 xl:grid-cols-2">
                  {activeEvent.competitions.map((competition) => (
                    <article key={competition.id} className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6">
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{competition.type}</p>
                      <h2 className="mt-3 text-3xl font-black">{competition.title}</h2>
                      <div className="mt-6 grid gap-4">
                        {competition.heats.map((heat) => (
                          <div key={heat.id} className="rounded-2xl border border-white/10 bg-black p-5">
                            <p className="text-xl font-black">{heat.title} · {heat.status}</p>
                            <p className="mt-2 text-sm text-zinc-500">{heat.entries.map((entry) => `${entry.startPosition}. ${entry.participant.name}`).join(" / ") || "Ingen deltagere"}</p>
                          </div>
                        ))}
                        {competition.heats.length === 0 ? <p className="text-zinc-500">Ingen køreliste endnu.</p> : null}
                      </div>
                      <form action={saveResultAction.bind(null, competition.id)} className="mt-6 grid gap-3 md:grid-cols-[1fr_120px_120px_120px_150px_auto]">
                        <select name="participantId" className="rounded-2xl border border-white/10 bg-black px-4 py-4 text-white">
                          <option value="">Vælg deltager</option>
                          {competition.participants.map((participant) => (
                            <option key={participant.id} value={participant.id}>{participant.name}</option>
                          ))}
                        </select>
                        <input name="placement" type="number" min="1" placeholder="Plads" className="rounded-2xl border border-white/10 bg-black px-4 py-4 text-white" />
                        <input name="points" type="number" min="0" placeholder="Point" className="rounded-2xl border border-white/10 bg-black px-4 py-4 text-white" />
                        <input name="finishTimeMs" type="number" min="0" placeholder="Tid ms" className="rounded-2xl border border-white/10 bg-black px-4 py-4 text-white" />
                        <select name="status" defaultValue="APPROVED" className="rounded-2xl border border-white/10 bg-black px-4 py-4 text-white">
                          <option value="APPROVED">Godkendt</option>
                          <option value="DNF">DNF</option>
                          <option value="DNS">DNS</option>
                          <option value="DISQUALIFIED">Diskvalificér</option>
                        </select>
                        <button className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 py-4 font-black text-black" type="submit">Gem</button>
                      </form>
                    </article>
                  ))}
                </section>
              </>
            )}
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{title}</p>
      <p className="mt-3 text-2xl font-black">{value}</p>
    </div>
  );
}

function TouchButton({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <button className={`rounded-full px-5 py-4 text-base font-black ${danger ? "bg-red-500 text-white" : "bg-white text-black"}`} type="submit">
      {children}
    </button>
  );
}
