import AdminShell from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminUi";

export default function UsersLoading() {
  return (
    <AdminShell eyebrow="Admin" title="Brugere">
      <AdminCard>
        <p className="text-zinc-400">Indlæser brugerstyring...</p>
      </AdminCard>
    </AdminShell>
  );
}
