import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import LogoutButton from "@/components/auth/LogoutButton";
import { getDashboardPath } from "@/lib/auth/rbac";
import { getRolePermissions } from "@/lib/auth/permissions";
import { requireCurrentUser } from "@/lib/auth/session";

const quickLinks = [
  { href: "/events", label: "Se events" },
  { href: "/booking", label: "Book event" },
  { href: "/profile", label: "Profil" },
  { href: "/achievements", label: "Præstationer" },
];

const roleLabels = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EVENT_MANAGER: "Event Manager",
  USER: "Bruger",
};

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const rolePermissions = getRolePermissions(user.role);
  const dashboardPath = getDashboardPath(user.role);
  const showRoleDashboardLink = dashboardPath !== "/dashboard";

  return (
    <AppShell wide>
          <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">Spiller-dashboard</p>
              <h1 className="text-5xl font-black md:text-7xl">Velkommen, {user.displayName}</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">
                Dit sikre V2-overblik over DarkLight Events, rolle, badges og fremtidige bookinger i DreamLight.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {showRoleDashboardLink ? (
                <Link href={dashboardPath} className="rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
                  Åbn rolleområde
                </Link>
              ) : null}
              <LogoutButton />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-zinc-500">DarkLight profil</p>
              <h2 className="mt-4 text-3xl font-black">{user.displayName}</h2>
              <p className="mt-2 text-sm text-zinc-500">@{user.username}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black">
                  {roleLabels[user.role]}
                </span>
                {user.badges.length > 0 ? (
                  user.badges.map((badge) => (
                    <span key={badge.id} className="rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300">
                      {badge.label}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                    Ingen badges endnu
                  </span>
                )}
              </div>
              <p className="mt-6 text-sm leading-6 text-zinc-400">
                Badges er visuel status. Adgang styres af rolle og permissions.
              </p>
            </article>

            <div className="grid gap-4 md:grid-cols-2">
              <Panel title="Rolle" text={`Din aktive rolle er ${roleLabels[user.role]}. En bruger har kun én rolle i V2.`} actionHref="/profile" action="Se profil" />
              <Panel title="Badges" text={user.badges.length > 0 ? `${user.badges.length} badges er knyttet til profilen.` : "Ingen badges er knyttet til profilen endnu."} actionHref="/profile" action="Se badges" />
              <Panel title="Permissions" text={user.permissions.length > 0 ? `${user.permissions.length} individuelle permissions er aktive.` : "Ingen individuelle permissions er aktive."} actionHref="/profile" action="Se adgang" />
              <Panel title="Standardadgang" text={rolePermissions.length > 0 ? `${rolePermissions.length} permissions følger rollen.` : "Denne rolle har ingen adminadgang som standard."} actionHref="/events" action="Se events" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 font-black transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.07]">
                {link.label}
              </Link>
            ))}
          </div>
    </AppShell>
  );
}

function Panel({ title, text, actionHref, action }: { title: string; text: string; actionHref: string; action: string }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-400">{text}</p>
      <Link href={actionHref} className="mt-6 inline-flex rounded-full border border-white/10 px-5 py-2.5 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
        {action}
      </Link>
    </article>
  );
}
