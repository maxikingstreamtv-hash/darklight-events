import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { AdminCard, Field, StatusBadge, fieldClassName } from "@/components/admin/AdminUi";
import { prisma } from "@/lib/prisma";
import { canAdminManageTarget, getAssignableRoles, requireAdminUser } from "@/lib/admin/access";
import { isAppRole, type AppRole } from "@/lib/auth/types";
import { grantBadgeAction, grantPermissionAction, removeBadgeAction, removePermissionAction, updateUserAction } from "../actions";

type BadgeOption = {
  id: string;
  name: string;
  label: string;
};

type PermissionOption = {
  id: string;
  key: string;
  label: string;
};

type AuditLogEntry = {
  id: string;
  action: string;
  details: string | null;
  createdAt: Date;
  actor: {
    displayName: string;
    username: string;
  } | null;
};

type UserVehicleSummary = {
  id: string;
  displayName: string;
  licensePlate: string | null;
  vehicleClass: string | null;
  status: string;
  inspections: { status: string; createdAt: Date }[];
};

type UserBadgeAssignment = {
  badgeId: string;
  badge: {
    id: string;
    name: string;
    label: string;
    color: string | null;
  };
};

type UserPermissionAssignment = {
  permissionId: string;
  permission: {
    id: string;
    key: string;
    label: string;
  };
};

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function UserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[]; ok?: string | string[] }>;
}) {
  const admin = await requireAdminUser();
  const { id } = await params;
  const query = await searchParams;
  const error = readParam(query.error);
  const ok = readParam(query.ok);

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      badges: {
        select: {
          badgeId: true,
          badge: { select: { id: true, name: true, label: true, color: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      permissions: {
        select: {
          permissionId: true,
          permission: { select: { id: true, key: true, label: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      vehicles: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          displayName: true,
          licensePlate: true,
          vehicleClass: true,
          status: true,
          inspections: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, createdAt: true } },
        },
      },
    },
  });

  if (!user || !isAppRole(user.role)) {
    notFound();
  }

  const canManage = canAdminManageTarget(admin, user.role);
  const assignableRoles = getAssignableRoles(admin);
  const [badges, permissions, auditLogs] = await Promise.all([
    prisma.badge.findMany({ orderBy: { label: "asc" }, select: { id: true, name: true, label: true } }),
    prisma.permission.findMany({ orderBy: { key: "asc" }, select: { id: true, key: true, label: true } }),
    prisma.auditLog.findMany({
      where: { target: `user:${user.id}` },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        action: true,
        details: true,
        createdAt: true,
        actor: { select: { displayName: true, username: true } },
      },
    }),
  ]);

  const assignedBadgeIds = new Set(user.badges.map((item: UserBadgeAssignment) => item.badgeId));
  const assignedPermissionIds = new Set(user.permissions.map((item: UserPermissionAssignment) => item.permissionId));
  const availableBadges = badges.filter((badge: BadgeOption) => !assignedBadgeIds.has(badge.id));
  const availablePermissions = permissions.filter((permission: PermissionOption) => !assignedPermissionIds.has(permission.id));

  return (
    <AdminShell
      eyebrow="Brugerstyring"
      title={user.displayName}
      action={
        <Link href="/admin/users" className="rounded-full border border-white/10 px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
          Tilbage
        </Link>
      }
    >
      <div className="grid gap-6">
        {ok ? <Message tone="ok" text={ok} /> : null}
        {error ? <Message tone="error" text={error} /> : null}
        {!canManage ? <Message tone="error" text="Denne bruger er SUPER_ADMIN og kan kun redigeres af SUPER_ADMIN." /> : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <AdminCard>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <StatusBadge tone={user.role === "SUPER_ADMIN" ? "strong" : "neutral"}>{user.role}</StatusBadge>
              <span className="text-sm text-zinc-500">@{user.username}</span>
            </div>

            <form action={updateUserAction.bind(null, user.id)} className="grid gap-5 lg:grid-cols-2">
              <Field label="Brugernavn">
                <input value={user.username} className={fieldClassName} disabled />
              </Field>
              <Field label="Visningsnavn">
                <input name="displayName" defaultValue={user.displayName} className={fieldClassName} required minLength={2} disabled={!canManage} />
              </Field>
              <Field label="Ny adgangskode">
                <input name="password" type="password" className={fieldClassName} minLength={8} placeholder="Udfyld kun ved ændring" disabled={!canManage} />
              </Field>
              <Field label="Rolle">
                <select name="role" defaultValue={user.role} className={fieldClassName} disabled={!canManage}>
                  {assignableRoles.map((role: AppRole) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Avatar URL">
                <input name="avatar" defaultValue={user.avatar ?? ""} className={fieldClassName} placeholder="Valgfrit" disabled={!canManage} />
              </Field>
              <Field label="Bio">
                <textarea name="bio" defaultValue={user.bio ?? ""} className={fieldClassName} rows={4} placeholder="Valgfrit" disabled={!canManage} />
              </Field>
              <div className="lg:col-span-2">
                <button disabled={!canManage} className="rounded-full bg-white px-7 py-4 font-black text-black transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50">
                  Gem bruger
                </button>
              </div>
            </form>
          </AdminCard>

          <AdminCard>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">Metadata</p>
            <dl className="mt-5 grid gap-4 text-sm">
              <div>
                <dt className="text-zinc-500">Oprettet</dt>
                <dd className="mt-1 font-black">{user.createdAt.toLocaleString("da-DK")}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Opdateret</dt>
                <dd className="mt-1 font-black">{user.updatedAt.toLocaleString("da-DK")}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Status</dt>
                <dd className="mt-1 text-zinc-300">Aktivering og soft delete kræver schemafelter. Se docs.</dd>
              </div>
            </dl>
          </AdminCard>
        </div>

        <AdminCard>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">Køretøjer</h2>
              <p className="mt-2 text-sm text-zinc-400">Kun Admin og Super Admin kan tildele og ændre køretøjer. Brugeren kan kun læse egne køretøjer på profilen.</p>
            </div>
            <Link href={`/admin/vehicles/create?ownerId=${user.id}`} className="w-fit rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">
              Tildel køretøj
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {user.vehicles.length === 0 ? (
              <p className="text-sm text-zinc-500">Ingen køretøjer tildelt.</p>
            ) : (
              user.vehicles.map((vehicle: UserVehicleSummary) => (
                <Link key={vehicle.id} href={`/admin/vehicles/${vehicle.id}`} className="rounded-2xl border border-white/10 bg-black p-4 transition hover:border-white/30">
                  <p className="font-black">{vehicle.displayName}</p>
                  <p className="mt-1 text-sm text-zinc-500">{vehicle.licensePlate ?? "Ingen plade"} · {vehicle.vehicleClass ?? "Klasse ikke sat"}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-400">Status: {vehicle.status} · Inspektion: {vehicle.inspections[0]?.status ?? "Ingen"}</p>
                </Link>
              ))
            )}
          </div>
        </AdminCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <AdminCard>
            <h2 className="text-2xl font-black">Badges</h2>
            <p className="mt-2 text-sm text-zinc-400">Badges er kun visuel status og giver ikke adgang.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {user.badges.length > 0 ? (
                user.badges.map(({ badge }: UserBadgeAssignment) => (
                  <form key={badge.id} action={removeBadgeAction.bind(null, user.id, badge.id)}>
                    <button disabled={!canManage} className="rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50">
                      Fjern {badge.label}
                    </button>
                  </form>
                ))
              ) : (
                <p className="text-sm text-zinc-500">Ingen badges tildelt.</p>
              )}
            </div>
            <form action={grantBadgeAction.bind(null, user.id)} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <select name="badgeId" className={fieldClassName} disabled={!canManage || availableBadges.length === 0}>
                <option value="">Vælg badge</option>
                {availableBadges.map((badge: BadgeOption) => (
                  <option key={badge.id} value={badge.id}>
                    {badge.label}
                  </option>
                ))}
              </select>
              <button disabled={!canManage || availableBadges.length === 0} className="rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50">
                Tildel
              </button>
            </form>
            {badges.length === 0 ? <p className="mt-4 text-sm text-zinc-500">Ingen badges findes endnu. Settings Center skal senere styre badge-kataloget.</p> : null}
          </AdminCard>

          <AdminCard>
            <h2 className="text-2xl font-black">Permissions</h2>
            <p className="mt-2 text-sm text-zinc-400">Permissions kan give individuelle ekstrarettigheder. Badges gør ikke.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {user.permissions.length > 0 ? (
                user.permissions.map(({ permission }: UserPermissionAssignment) => (
                  <form key={permission.id} action={removePermissionAction.bind(null, user.id, permission.id)}>
                    <button disabled={!canManage} className="rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50">
                      Fjern {permission.key}
                    </button>
                  </form>
                ))
              ) : (
                <p className="text-sm text-zinc-500">Ingen individuelle permissions tildelt.</p>
              )}
            </div>
            <form action={grantPermissionAction.bind(null, user.id)} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <select name="permissionId" className={fieldClassName} disabled={!canManage || availablePermissions.length === 0}>
                <option value="">Vælg permission</option>
                {availablePermissions.map((permission: PermissionOption) => (
                  <option key={permission.id} value={permission.id}>
                    {permission.key}
                  </option>
                ))}
              </select>
              <button disabled={!canManage || availablePermissions.length === 0} className="rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50">
                Tildel
              </button>
            </form>
            {permissions.length === 0 ? <p className="mt-4 text-sm text-zinc-500">Ingen permissions findes endnu. Settings Center skal senere styre permission-kataloget.</p> : null}
          </AdminCard>
        </div>

        <AdminCard>
          <h2 className="text-2xl font-black">Audit log</h2>
          {auditLogs.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">Ingen audit logs for denne bruger endnu.</p>
          ) : (
            <div className="mt-5 grid gap-3">
              {auditLogs.map((log: AuditLogEntry) => (
                <div key={log.id} className="rounded-2xl border border-white/10 bg-black px-4 py-3">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <p className="font-black">{log.action}</p>
                    <p className="text-xs text-zinc-500">{log.createdAt.toLocaleString("da-DK")}</p>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">Aktør: {log.actor?.displayName ?? log.actor?.username ?? "Ukendt"}</p>
                  {log.details ? <p className="mt-2 break-words text-xs text-zinc-400">{log.details}</p> : null}
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      </div>
    </AdminShell>
  );
}

function Message({ tone, text }: { tone: "ok" | "error"; text: string }) {
  return <div className={`rounded-2xl border px-5 py-4 text-sm ${tone === "ok" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-red-400/20 bg-red-400/10 text-red-200"}`}>{text}</div>;
}
