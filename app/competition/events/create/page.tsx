import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { createCompetitionEventAction } from "@/app/competition/events/actions";

export default function CreateEventPage() {
  return (
    <>
      <CompetitionLayout>
        <section className="bg-black px-6 py-28 text-white">
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight EventOS</p>
            <h1 className="text-4xl font-black md:text-6xl">Opret event</h1>
            <p className="mt-5 max-w-2xl text-zinc-400">
              Eventet gemmes i PostgreSQL og vises for alle admins efter refresh.
            </p>

            <form action={createCompetitionEventAction} className="mt-10 grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
              <TextInput name="title" label="Titel" required />
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Beskrivelse</span>
                <textarea name="description" required className="min-h-32 rounded-2xl border border-white/10 bg-black px-4 py-3 text-white" />
              </label>
              <div className="grid gap-5 md:grid-cols-2">
                <TextInput name="location" label="Lokation" />
                <TextInput name="startsAt" label="Dato og tid" type="datetime-local" required />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Status</span>
                  <select name="status" defaultValue="DRAFT" className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white">
                    <option value="DRAFT">Kladde</option>
                    <option value="UPCOMING">Kommende</option>
                    <option value="ACTIVE">Aktiv</option>
                    <option value="COMPLETED">Afsluttet</option>
                    <option value="CANCELLED">Aflyst</option>
                  </select>
                </label>
                <TextInput name="sortOrder" label="Sortering" type="number" defaultValue="0" />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <TextInput name="imageUrl" label="Billed-URL" />
                <TextInput name="imageAlt" label="Alt-tekst" />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black px-4 py-3">
                  <input name="active" type="checkbox" defaultChecked />
                  <span className="font-black">Aktiv</span>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black px-4 py-3">
                  <input name="public" type="checkbox" defaultChecked />
                  <span className="font-black">Public</span>
                </label>
              </div>
              <button className="w-fit rounded-full bg-white px-7 py-3 font-black text-black transition hover:bg-zinc-300">
                Gem event
              </button>
            </form>
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </>
  );
}

function TextInput({
  name,
  label,
  type = "text",
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <input name={name} type={type} required={required} defaultValue={defaultValue} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white" />
    </label>
  );
}
