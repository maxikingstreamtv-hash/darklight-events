"use client";

import { useState } from "react";
import Footer from "@/components/layout/Footer";
import { createContactMessageAction } from "./actions";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    characterName: "",
    ingamePhone: "",
    subject: "",
    message: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(formData: FormData) {
    const result = await createContactMessageAction(formData);
    setSent(result.ok);
    setMessage(result.message);

    if (result.ok) {
      setForm({ characterName: "", ingamePhone: "", subject: "", message: "" });
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden px-6 py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_520px] lg:items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">Kontakt</p>
            <h1 className="mt-4 text-5xl font-black md:text-7xl">Kontakt DarkLight</h1>
            <p className="mt-6 max-w-2xl text-zinc-400">
              Send en besked til DarkLight Events om booking, eventspørgsmål, staff-koordinering eller samarbejde.
            </p>

            <div className="mt-10 grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-zinc-300 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p>Founder / CEO: Cole Kane</p>
              <p>Co-Founder: Izadora Solis</p>
              <p>Lokation: DreamLight</p>
              <p>Kontakt: ingame phone eller byens kanaler</p>
            </div>
          </div>

          <form action={handleSubmit} className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.02] backdrop-blur-xl">
            <div className="grid gap-5">
              <Field name="characterName" label="Character navn" value={form.characterName} onChange={(value) => update("characterName", value)} placeholder="Cole Kane" />
              <Field name="ingamePhone" label="Ingame phone" value={form.ingamePhone} onChange={(value) => update("ingamePhone", value)} placeholder="555-0142" />
              <Field name="subject" label="Emne" value={form.subject} onChange={(value) => update("subject", value)} placeholder="Booking, eventønske, staff-spørgsmål..." />

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Besked</span>
                <textarea
                  required
                  name="message"
                  value={form.message}
                  onChange={(event) => update("message", event.target.value)}
                  className="field min-h-40"
                  placeholder="Skriv din besked til DarkLight staff."
                />
              </label>

              {message ? (
                <p className={`rounded-2xl border px-5 py-4 text-sm ${sent ? "border-green-500/20 bg-green-500/10 text-green-300" : "border-red-500/20 bg-red-500/10 text-red-200"}`}>
                  {message}
                </p>
              ) : null}

              <button className="rounded-full bg-white px-8 py-4 font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.10)] transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-300">
                Send besked
              </button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Field({ name, label, value, onChange, placeholder }: { name: string; label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <input required name={name} value={value} onChange={(event) => onChange(event.target.value)} className="field" placeholder={placeholder} />
    </label>
  );
}
