import { archiveSponsorAction, deleteSponsorAction, saveSponsorAction } from "@/app/competition/admin/sponsor-actions";
import Card from "@/components/competition/ui/Card";

type SponsorManagerItem = {
  id: string;
  slug: string;
  name: string;
  level: string;
  sponsorType: string;
  isMainSponsor: boolean;
  contactPerson: string | null;
  eventsSupported: string[];
  description: string;
  logoInitials: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  ctaLabel: string | null;
  sortOrder: number;
  active: boolean;
  status: string;
};

const field = "rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white";

export default function SponsorDbManagerPanel({ sponsors, canDelete }: { sponsors: SponsorManagerItem[]; canDelete: boolean }) {
  return (
    <section id="sponsor-manager" className="mt-8 grid gap-6">
      <Card padded="lg">
        <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Sponsor Manager V2</p>
        <h2 className="mt-3 text-3xl font-black">Database-sponsorer</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Sponsorer gemmes i PostgreSQL og vises offentligt på /sponsorer. Kun én aktiv hovedsponsor kan være valgt ad gangen.
        </p>
        <SponsorForm />
      </Card>

      {sponsors.length === 0 ? (
        <Card padded="lg" className="text-center">
          <h3 className="text-2xl font-black">Ingen sponsorer i databasen</h3>
          <p className="mt-3 text-sm text-zinc-500">Opret den første sponsor ovenfor.</p>
        </Card>
      ) : sponsors.map((sponsor) => (
        <Card key={sponsor.id} padded="lg">
          <SponsorForm sponsor={sponsor} />
          <div className="mt-5 flex flex-wrap gap-3">
            <form action={archiveSponsorAction.bind(null, sponsor.id)}>
              <button className="rounded-full border border-white/10 px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
                {sponsor.active && sponsor.status === "ACTIVE" ? "Arkivér" : "Aktivér"}
              </button>
            </form>
            {canDelete ? (
              <form action={deleteSponsorAction.bind(null, sponsor.id)} className="flex flex-wrap gap-3">
                <input name="confirmation" className={field} placeholder={`SLET ${sponsor.name}`} />
                <button className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 font-black text-red-200 transition hover:bg-red-500 hover:text-white">
                  Slet permanent
                </button>
              </form>
            ) : null}
          </div>
        </Card>
      ))}
    </section>
  );
}

function SponsorForm({ sponsor }: { sponsor?: SponsorManagerItem }) {
  return (
    <form action={saveSponsorAction} className="mt-6 grid gap-4 lg:grid-cols-2">
      <input name="id" type="hidden" defaultValue={sponsor?.id ?? ""} />
      <Label text="Navn">
        <input name="name" className={field} defaultValue={sponsor?.name ?? ""} required />
      </Label>
      <Label text="Slug">
        <input name="slug" className={field} defaultValue={sponsor?.slug ?? ""} placeholder="auto hvis tom" />
      </Label>
      <Label text="Niveau">
        <select name="level" className={field} defaultValue={sponsor?.level ?? "SILVER"}>
          <option value="PLATINUM">Platinum</option>
          <option value="GOLD">Gold</option>
          <option value="SILVER">Silver</option>
          <option value="PARTNER">Partner</option>
        </select>
      </Label>
      <Label text="Type">
        <select name="sponsorType" className={field} defaultValue={sponsor?.sponsorType ?? "SPONSOR"}>
          <option value="MAIN_SPONSOR">Hovedsponsor</option>
          <option value="SPONSOR">Sponsor</option>
          <option value="PARTNER">Partner</option>
        </select>
      </Label>
      <Label text="Status">
        <select name="status" className={field} defaultValue={sponsor?.status ?? "ACTIVE"}>
          <option value="ACTIVE">Aktiv</option>
          <option value="PENDING">Afventer</option>
          <option value="ARCHIVED">Arkiveret</option>
        </select>
      </Label>
      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-zinc-300">
        <input name="isMainSponsor" type="checkbox" defaultChecked={sponsor?.isMainSponsor ?? false} />
        Hovedsponsor
      </label>
      <Label text="Logo URL">
        <input name="logoUrl" className={field} defaultValue={sponsor?.logoUrl ?? ""} />
      </Label>
      <Label text="Initialer">
        <input name="logoInitials" className={field} defaultValue={sponsor?.logoInitials ?? ""} />
      </Label>
      <Label text="Website URL">
        <input name="websiteUrl" className={field} defaultValue={sponsor?.websiteUrl ?? ""} />
      </Label>
      <Label text="CTA-label">
        <input name="ctaLabel" className={field} defaultValue={sponsor?.ctaLabel ?? ""} />
      </Label>
      <Label text="Kontaktperson">
        <input name="contactPerson" className={field} defaultValue={sponsor?.contactPerson ?? ""} />
      </Label>
      <Label text="Sortering">
        <input name="sortOrder" type="number" className={field} defaultValue={sponsor?.sortOrder ?? 0} />
      </Label>
      <Label text="Events">
        <input name="eventsSupported" className={field} defaultValue={sponsor?.eventsSupported.join(", ") ?? ""} />
      </Label>
      <Label text="Beskrivelse">
        <textarea name="description" className={field} rows={4} defaultValue={sponsor?.description ?? ""} />
      </Label>
      <div className="lg:col-span-2">
        <button className="rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
          {sponsor ? "Gem sponsor" : "Opret sponsor"}
        </button>
      </div>
    </form>
  );
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{text}</span>
      {children}
    </label>
  );
}
