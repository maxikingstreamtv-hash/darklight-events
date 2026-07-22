import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { cancelEventRegistrationAction, registerForEventAction } from "@/app/competition/eventos-actions";
import { COUNTED_REGISTRATION_STATUSES, getEventRegistrationLoginHref, getRegistrationState, type RegistrationState } from "@/lib/events/registration-state";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      bannerUrl: true,
      imageAlt: true,
      location: true,
      startsAt: true,
      endsAt: true,
      status: true,
      active: true,
      public: true,
      maxParticipants: true,
      registrationOpenAt: true,
      registrationCloseAt: true,
      registrations: {
        orderBy: [{ createdAt: "asc" }],
        select: {
          id: true,
          userId: true,
          status: true,
          checkedInAt: true,
          createdAt: true,
          user: {
            select: {
              displayName: true,
              darklightId: true,
              avatar: true,
            },
          },
        },
      },
      competitions: {
        select: {
          id: true,
          title: true,
          type: true,
          description: true,
          participants: { select: { id: true } },
        },
      },
    },
  });

  if (!event || !event.active || !event.public) {
    notFound();
  }

  const activeRegistrations = event.registrations.filter((registration) =>
    COUNTED_REGISTRATION_STATUSES.some((status) => status === registration.status),
  ).length;
  const userRegistration = currentUser ? event.registrations.find((registration) => registration.userId === currentUser.id) : null;
  const registrationState = getRegistrationState({
    ...event,
    registeredParticipants: activeRegistrations,
    userRegistrationStatus: userRegistration?.status,
  });
  const available = registrationState.remainingSpots ?? "Ubegrænset";
  const registerAction = registerForEventAction.bind(null, event.id);
  const cancelAction = cancelEventRegistrationAction.bind(null, event.id);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
            <div>
              <div className="mb-5 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-300">{registrationState.label}</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-300">{event.competitions[0]?.type ?? "Event"}</span>
              </div>
              <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight Event</p>
              <h1 className="text-5xl font-black md:text-7xl">{event.title}</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">{event.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/events" className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
                  Alle events
                </Link>
                <RegistrationCta
                  registrationState={registrationState}
                  currentUserExists={Boolean(currentUser)}
                  userRegistrationStatus={userRegistration?.status}
                  loginHref={getEventRegistrationLoginHref(id)}
                  registerAction={registerAction}
                  cancelAction={cancelAction}
                />
              </div>
            </div>
            <div className="group relative h-80 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.4)] md:h-[460px]">
              {event.bannerUrl ? (
                <Image src={event.bannerUrl} alt={event.imageAlt ?? event.title} fill unoptimized className="object-cover opacity-85 transition duration-700 group-hover:scale-105" sizes="(min-width: 1280px) 44vw, 100vw" />
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center text-zinc-500">Intet eventbillede</div>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Stat label="Dato" value={formatDate(event.startsAt)} />
            <Stat label="Lokation" value={event.location ?? "Ikke sat"} />
            <Stat label="Ledige pladser" value={available} />
            <Stat label="Tilmeldinger" value={activeRegistrations} />
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_420px]">
            <Panel title="Eventinfo">
              <InfoLine label="Status" value={registrationState.label} />
              <InfoLine label="Maks deltagere" value={event.maxParticipants ? String(event.maxParticipants) : "Ubegrænset"} />
              <InfoLine label="Slutter" value={event.endsAt ? formatDate(event.endsAt) : "Ikke sat"} />
              <InfoLine label="Kapacitet" value={`${activeRegistrations} af ${event.maxParticipants ?? "uendeligt"} pladser optaget`} />
            </Panel>

            <Panel title="Konkurrencer">
              {event.competitions.length === 0 ? (
                <p className="text-sm text-zinc-500">Ingen konkurrencer er tilknyttet endnu.</p>
              ) : event.competitions.map((competition) => (
                <div key={competition.id} className="rounded-2xl border border-white/10 bg-black p-4">
                  <p className="font-black">{competition.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">{competition.type} · {competition.participants.length} deltagere</p>
                </div>
              ))}
            </Panel>
          </div>

          <section className="mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl">
            <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-black">Tilmeldte deltagere</h2>
                <p className="mt-2 text-sm text-zinc-500">
                  {activeRegistrations} af {event.maxParticipants ?? "uendeligt"} pladser optaget.
                </p>
              </div>
              <div className="grid gap-2 text-sm text-zinc-400 sm:grid-cols-3">
                <span className="rounded-full border border-white/10 bg-black px-4 py-2">Tilmeldinger: {event.registrations.length}</span>
                <span className="rounded-full border border-white/10 bg-black px-4 py-2">Godkendte: {event.registrations.filter((registration) => registration.status === "APPROVED" || registration.status === "CHECKED_IN").length}</span>
                <span className="rounded-full border border-white/10 bg-black px-4 py-2">Ledige: {available}</span>
              </div>
            </div>

            {event.registrations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {event.registrations.map((registration) => (
                  <article key={registration.id} className="flex gap-4 rounded-2xl border border-white/10 bg-black p-5">
                    <Avatar name={registration.user.displayName} src={registration.user.avatar} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-black">{registration.user.displayName}</h3>
                        <StatusBadge status={registration.status} />
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">{registration.user.darklightId ?? "DarkLight ID ikke tildelt"}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-600">
                        {registration.checkedInAt ? "Tjekket ind" : "Ikke tjekket ind"} · {formatDate(registration.createdAt)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black p-6 text-center text-sm font-bold text-zinc-400">
                Ingen deltagere er tilmeldt endnu.
              </div>
            )}
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function RegistrationCta({
  registrationState,
  currentUserExists,
  userRegistrationStatus,
  loginHref,
  registerAction,
  cancelAction,
}: {
  registrationState: RegistrationState;
  currentUserExists: boolean;
  userRegistrationStatus?: string;
  loginHref: string;
  registerAction: (formData: FormData) => void | Promise<void>;
  cancelAction: (formData: FormData) => void | Promise<void>;
}) {
  if (userRegistrationStatus === "PENDING") {
    return (
      <div className="flex flex-wrap gap-3">
        <DisabledCta>Tilmelding afventer godkendelse</DisabledCta>
        {registrationState.isOpen ? (
          <form action={cancelAction}>
            <SecondaryCta>Afmeld event</SecondaryCta>
          </form>
        ) : null}
      </div>
    );
  }

  if (userRegistrationStatus === "APPROVED" || userRegistrationStatus === "CHECKED_IN") {
    return (
      <div className="flex flex-wrap gap-3">
        <DisabledCta>Du er tilmeldt</DisabledCta>
        {registrationState.isOpen ? (
          <form action={cancelAction}>
            <SecondaryCta>Afmeld event</SecondaryCta>
          </form>
        ) : null}
      </div>
    );
  }

  if (userRegistrationStatus === "REJECTED") {
    return <DisabledCta>Tilmelding afvist</DisabledCta>;
  }

  if (!registrationState.isOpen) {
    return <DisabledCta>{registrationState.label}</DisabledCta>;
  }

  if (!currentUserExists) {
    return (
      <Link href={loginHref} className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 py-3 font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.10)] transition hover:bg-zinc-300">
        Log ind for at tilmelde
      </Link>
    );
  }

  return (
    <form action={registerAction}>
      <button className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 py-3 font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.10)] transition hover:bg-zinc-300" type="submit">
        Tilmeld event
      </button>
    </form>
  );
}

function DisabledCta({ children }: { children: React.ReactNode }) {
  return (
    <button disabled className="inline-flex shrink-0 cursor-not-allowed items-center justify-center whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 font-black text-zinc-400 shadow-[0_18px_45px_rgba(255,255,255,0.04)]" type="button">
      {children}
    </button>
  );
}

function SecondaryCta({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black" type="submit">
      {children}
    </button>
  );
}

function Avatar({ name, src }: { name: string; src: string | null }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-black text-zinc-300">
      {initials || "DL"}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    PENDING: "Afventer godkendelse",
    APPROVED: "Godkendt",
    REJECTED: "Afvist",
    CHECKED_IN: "Tjekket ind",
    CANCELLED: "Afmeldt",
  };
  const tone =
    status === "APPROVED" || status === "CHECKED_IN"
      ? "border-green-400/20 bg-green-400/10 text-green-300"
      : status === "PENDING"
        ? "border-yellow-400/20 bg-yellow-400/10 text-yellow-200"
        : status === "REJECTED"
          ? "border-red-400/20 bg-red-400/10 text-red-200"
          : "border-white/10 bg-white/[0.04] text-zinc-400";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black ${tone}`}>
      {labels[status] ?? status}
    </span>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl">
      <h2 className="mb-7 text-3xl font-black">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{label}</p>
      <p className="mt-4 text-2xl font-black">{value}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-right font-black text-zinc-200">{value}</p>
    </div>
  );
}
