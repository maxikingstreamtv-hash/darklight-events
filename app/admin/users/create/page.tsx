import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { AdminCard, Field, fieldClassName } from "@/components/admin/AdminUi";
import { getAssignableRoles, requireAdminUser } from "@/lib/admin/access";
import { createUserAction } from "../actions";

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CreateUserPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const admin = await requireAdminUser();
  const roles = getAssignableRoles(admin);
  const params = await searchParams;
  const error = readParam(params.error);

  return (
    <AdminShell
      eyebrow="Brugerstyring"
      title="Opret bruger"
      action={
        <Link href="/admin/users" className="rounded-full border border-white/10 px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
          Tilbage
        </Link>
      }
    >
      <AdminCard>
        {error ? <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">{error}</div> : null}
        <form action={createUserAction} className="grid gap-5 lg:grid-cols-2">
          <Field label="Brugernavn">
            <input name="username" className={fieldClassName} required minLength={3} autoComplete="username" />
          </Field>
          <Field label="Visningsnavn">
            <input name="displayName" className={fieldClassName} required minLength={2} />
          </Field>
          <Field label="Adgangskode">
            <input name="password" type="password" className={fieldClassName} required minLength={8} autoComplete="new-password" />
          </Field>
          <Field label="Rolle">
            <select name="role" className={fieldClassName} defaultValue="USER">
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Avatar URL">
            <input name="avatar" className={fieldClassName} placeholder="Valgfrit" />
          </Field>
          <Field label="Bio">
            <textarea name="bio" className={fieldClassName} rows={4} placeholder="Valgfrit" />
          </Field>
          <div className="lg:col-span-2">
            <button className="rounded-full bg-white px-7 py-4 font-black text-black transition hover:bg-zinc-300">Opret bruger</button>
          </div>
        </form>
      </AdminCard>
    </AdminShell>
  );
}
