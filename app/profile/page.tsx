import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";

type ProfileVehicle = {
  id: string;
  displayName: string;
  licensePlate: string | null;
  vehicleClass: string | null;
  status: string;
  inspections: {
    id: string;
    title: string;
    status: string;
    items: {
      id: string;
      category: string;
      label: string;
      description: string | null;
      result: string;
      required: boolean;
      sortOrder: number;
    }[];
  }[];
};

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DriverPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string | string[]; error?: string | string[] }>;
}) {
  const user = await requireCurrentUser();
  const query = await searchParams;
  const ok = readParam(query.ok);
  const error = readParam(query.error);
  const [profile, vehicles] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        bio: true,
        avatar: true,
        darklightId: true,
      },
    }),
    prisma.vehicle.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        displayName: true,
        licensePlate: true,
        vehicleClass: true,
        status: true,
        inspections: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            title: true,
            status: true,
            items: {
              orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
              select: {
                id: true,
                category: true,
                label: true,
                description: true,
                result: true,
                required: true,
                sortOrder: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight spillerportal</p>
              <h1 className="text-5xl font-black md:text-7xl">Profil</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">
                Dine tildelte FiveM-køretøjer og seneste inspektionskrav. Køretøjer administreres af DarkLight staff.
              </p>
            </div>
            <Link href="/events" className="w-fit rounded-full border border-white/15 px-6 py-3 font-black text-zinc-200 transition hover:border-white/40 hover:bg-white hover:text-black">
              Se events
            </Link>
          </div>

          {ok ? <Message tone="ok" text={ok} /> : null}
          {error ? <Message tone="error" text={error} /> : null}

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <Avatar avatar={profile?.avatar ?? ""} displayName={user.displayName} />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.32em] text-zinc-500">Konto</p>
                <h2 className="mt-4 text-3xl font-black">{user.displayName}</h2>
                <p className="mt-2 text-sm text-zinc-500">@{user.username} / {user.role}</p>
                <p className="mt-1 text-sm text-zinc-500">DarkLight ID: {profile?.darklightId ?? "Ikke tildelt"}</p>
                {profile?.bio ? <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-300">{profile.bio}</p> : null}
              </div>
            </div>
          </div>

          <ProfileEditForm initialBio={profile?.bio ?? ""} initialAvatar={profile?.avatar ?? ""} displayName={user.displayName} />

          <div className="mt-8 grid gap-5">
            <h2 className="text-3xl font-black">Mine køretøjer</h2>
            {vehicles.length === 0 ? (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
                <p className="font-black">Ingen køretøjer tildelt endnu</p>
                <p className="mt-2 text-sm text-zinc-400">Kontakt DarkLight staff, hvis et køretøj skal tilknyttes din profil.</p>
              </div>
            ) : (
              vehicles.map((vehicle: ProfileVehicle) => {
                const latest = vehicle.inspections[0];
                const performanceItems = latest?.items.filter((item) => item.category === "PERFORMANCE") ?? [];
                const engineItems = latest?.items.filter((item) => item.category === "ENGINE") ?? [];
                const equipmentItems = latest?.items.filter((item) => item.category === "REQUIRED_EQUIPMENT") ?? [];
                const otherItems = latest?.items.filter((item) => item.category !== "PERFORMANCE" && item.category !== "ENGINE" && item.category !== "REQUIRED_EQUIPMENT") ?? [];

                return (
                  <article key={vehicle.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <h3 className="text-2xl font-black">{vehicle.displayName}</h3>
                        <p className="mt-2 text-sm text-zinc-400">{vehicle.licensePlate ?? "Ingen plade"} / {vehicle.vehicleClass ?? "Klasse ikke sat"}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300">
                        {latest?.status ?? "Ingen inspektion"}
                      </span>
                    </div>

                    {latest ? (
                      <div className="mt-6 grid gap-5 lg:grid-cols-3">
                        <ChecklistGroup title="Performance" items={performanceItems} />
                        <ChecklistGroup title="Motor og ydelse" items={engineItems} />
                        <ChecklistGroup title="Obligatorisk udstyr" items={equipmentItems} />
                        <ChecklistGroup title="Øvrige krav" items={otherItems} />
                      </div>
                    ) : (
                      <p className="mt-5 text-sm text-zinc-500">Ingen checklist er oprettet endnu.</p>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function ChecklistGroup({ title, items }: { title: string; items: ProfileVehicle["inspections"][number]["items"] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <h4 className="font-black">{title}</h4>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">Ingen krav i denne sektion.</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
              <p className="text-sm font-black">{item.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{item.description ?? "Ingen beskrivelse."}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-zinc-400">{item.result}{item.required ? " / Påkrævet" : ""}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Message({ tone, text }: { tone: "ok" | "error"; text: string }) {
  return <div className={`mb-5 rounded-2xl border px-5 py-4 text-sm ${tone === "ok" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-red-400/20 bg-red-400/10 text-red-200"}`}>{text}</div>;
}

function Avatar({ avatar, displayName }: { avatar: string; displayName: string }) {
  const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  if (avatar) {
    return (
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-neutral-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} alt={`${displayName} avatar`} className="h-full w-full object-cover" />
      </div>
    );
  }

  return <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-neutral-950 text-2xl font-black text-white">{initials}</div>;
}
