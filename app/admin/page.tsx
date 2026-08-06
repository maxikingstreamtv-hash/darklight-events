import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { AdminCard, StatusBadge } from "@/components/admin/AdminUi";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin/access";

export default async function AdminPage() {
  const admin = await requireAdminUser();
  const [users, badges, permissions, auditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.badge.count(),
    prisma.permission.count(),
    prisma.auditLog.count(),
  ]);

  return (
    <AdminShell
      eyebrow="DarkLight admin"
      title="Admin dashboard"
      action={
        <Link href="/admin/users/create" className="rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
          Opret bruger
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat title="Brugere" value={users} />
        <Stat title="Badges" value={badges} />
        <Stat title="Permissions" value={permissions} />
        <Stat title="Audit logs" value={auditLogs} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <AdminCard>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-black">Brugerstyring</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                Administrer brugere, roller, badges og individuelle permissions. Badges er kun visuel status og giver ikke adgang.
              </p>
            </div>
            <Link href="/admin/users" className="w-fit rounded-full border border-white/10 px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
              Åbn brugere
            </Link>
          </div>
        </AdminCard>

        <AdminCard>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">Logget ind som</p>
          <h2 className="mt-4 text-2xl font-black">{admin.displayName}</h2>
          <div className="mt-4">
            <StatusBadge tone="strong">{admin.role}</StatusBadge>
          </div>
        </AdminCard>
      </div>

      <div className="mt-8" id="roller">
        <AdminCard>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">Rolle</p>
          <div className="mt-3 flex flex-wrap items-center gap-3"><h2 className="text-3xl font-black">Dommer</h2><StatusBadge tone="neutral">JUDGE</StatusBadge></div>
          <p className="mt-4 max-w-3xl text-zinc-400">Kan bedømme tildelte events og afgive egne dommerpoint. Kan ikke administrere brugere, roller eller events.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2"><div><h3 className="font-black text-emerald-200">Må</h3><ul className="mt-3 grid gap-2 text-sm text-zinc-300"><li>Åbne Dommerpanel og se tildelte events</li><li>Se kandidater og billeder</li><li>Gemme og indsende egne point</li><li>Redigere egne point, indtil eventet låses</li></ul></div><div><h3 className="font-black text-red-200">Må ikke</h3><ul className="mt-3 grid gap-2 text-sm text-zinc-300"><li>Se andre dommeres skjulte point</li><li>Offentliggøre resultater</li><li>Styre brugere, roller eller events</li><li>Ændre publikumsstemmer eller slette medier</li></ul></div></div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <AdminCard>
      <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{title}</p>
      <p className="mt-4 text-4xl font-black">{value}</p>
    </AdminCard>
  );
}
