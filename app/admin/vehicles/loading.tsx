import AdminShell from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminUi";

export default function VehiclesLoading() {
  return (
    <AdminShell eyebrow="VehicleOS" title="Køretøjer">
      <AdminCard>
        <p className="text-zinc-400">Indlæser køretøjer...</p>
      </AdminCard>
    </AdminShell>
  );
}
