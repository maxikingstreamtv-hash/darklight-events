import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { AdminCard, StatusBadge } from "@/components/admin/AdminUi";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin/access";
import { appRoles, isAppRole, type AppRole } from "@/lib/auth/types";

const pageSize = 10;

type UserListItem = {
  id: string;
  username: string;
  displayName: string;
  role: AppRole;
  createdAt: Date;
  badges: {
    badge: {
      id: string;
      label: string;
    };
  }[];
  permissions: {
    permission: {
      id: string;
      key: string;
    };
  }[];
};

const userListSelect = {
  id: true,
  username: true,
  displayName: true,
  role: true,
  createdAt: true,
  badges: { select: { badge: { select: { id: true, label: true } } } },
  permissions: { select: { permission: { select: { id: true, key: true } } } },
};

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; role?: string | string[]; page?: string | string[]; error?: string | string[]; ok?: string | string[] }>;
}) {
  await requireAdminUser();
  const params = await searchParams;
  const q = (readParam(params.q) ?? "").trim();
  const roleParam = readParam(params.role);
  const role = isAppRole(roleParam) ? roleParam : "";
  const currentPage = Math.max(Number(readParam(params.page) ?? "1") || 1, 1);
  const message = readParam(params.ok);
  const error = readParam(params.error);

  const where = {
    ...(q
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" as const } },
            { displayName: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(role ? { role } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      select: userListSelect,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <AdminShell
      eyebrow="Admin"
      title="Brugere"
      action={
        <Link href="/admin/users/create" className="rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
          Opret bruger
        </Link>
      }
    >
      <div className="grid gap-4">
        {message ? <Message tone="ok" text={message} /> : null}
        {error ? <Message tone="error" text={error} /> : null}

        <AdminCard>
          <form className="grid gap-4 lg:grid-cols-[1fr_220px_auto]" action="/admin/users">
            <input name="q" defaultValue={q} placeholder="Søg efter brugernavn eller visningsnavn" className="field" />
            <select name="role" defaultValue={role} className="field">
              <option value="">Alle roller</option>
              {appRoles.map((item: AppRole) => (
                <option key={item} value={item}>
                  {roleLabel(item)}
                </option>
              ))}
            </select>
            <button className="rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">Filtrer</button>
          </form>
        </AdminCard>

        <AdminCard className="overflow-hidden">
          {users.length === 0 ? (
            <div className="py-10 text-center">
              <h2 className="text-2xl font-black">Ingen brugere fundet</h2>
              <p className="mt-3 text-sm text-zinc-400">Opret den første bruger eller juster søgningen.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  <tr className="border-b border-white/10">
                    <th className="pb-4">Bruger</th>
                    <th className="pb-4">Rolle</th>
                    <th className="pb-4">Badges</th>
                    <th className="pb-4">Permissions</th>
                    <th className="pb-4">Oprettet</th>
                    <th className="pb-4 text-right">Handling</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: UserListItem) => (
                    <tr key={user.id} className="border-b border-white/10 last:border-0">
                      <td className="py-4">
                        <p className="font-black text-white">{user.displayName}</p>
                        <p className="mt-1 text-xs text-zinc-500">@{user.username}</p>
                      </td>
                      <td className="py-4">
                        <StatusBadge tone={user.role === "SUPER_ADMIN" ? "strong" : "neutral"}>{roleLabel(user.role)}</StatusBadge>
                      </td>
                      <td className="py-4 text-zinc-300">{user.badges.length}</td>
                      <td className="py-4 text-zinc-300">{user.permissions.length}</td>
                      <td className="py-4 text-zinc-500">{user.createdAt.toLocaleDateString("da-DK")}</td>
                      <td className="py-4 text-right">
                        <Link href={`/admin/users/${user.id}`} className="rounded-full border border-white/10 px-4 py-2 font-black text-zinc-200 transition hover:bg-white hover:text-black">
                          Åbn
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>

        <div className="flex flex-col justify-between gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center">
          <p>
            Side {currentPage} af {totalPages} · {total} brugere
          </p>
          <div className="flex gap-3">
            <PageLink disabled={currentPage <= 1} page={currentPage - 1} q={q} role={role} label="Forrige" />
            <PageLink disabled={currentPage >= totalPages} page={currentPage + 1} q={q} role={role} label="Næste" />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    EVENT_MANAGER: "Event Manager",
    USER: "Bruger",
  };

  return labels[role] ?? role;
}

function Message({ tone, text }: { tone: "ok" | "error"; text: string }) {
  return <div className={`rounded-2xl border px-5 py-4 text-sm ${tone === "ok" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-red-400/20 bg-red-400/10 text-red-200"}`}>{text}</div>;
}

function PageLink({ disabled, page, q, role, label }: { disabled: boolean; page: number; q: string; role: AppRole | ""; label: string }) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (role) params.set("role", role);
  params.set("page", String(page));

  if (disabled) {
    return <span className="rounded-full border border-white/10 px-5 py-2.5 text-zinc-600">{label}</span>;
  }

  return (
    <Link href={`/admin/users?${params.toString()}`} className="rounded-full border border-white/10 px-5 py-2.5 font-black text-zinc-200 transition hover:bg-white hover:text-black">
      {label}
    </Link>
  );
}
