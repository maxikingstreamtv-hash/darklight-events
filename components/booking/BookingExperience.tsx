"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { createBookingRequestAction } from "@/app/booking/actions";
import { bookingEvents } from "@/data/booking-events";

const initialBooking = {
  characterName: "",
  ingamePhone: "",
  eventType: bookingEvents[0]?.title ?? "Drift Event",
  desiredDate: "",
  desiredTime: "",
  ingameLocation: "",
  participants: "",
  ingameBudget: "",
  description: "",
};

type BookingData = typeof initialBooking;

export default function BookingExperience({ initialCharacterName = "" }: { initialCharacterName?: string }) {
  const [bookingData, setBookingData] = useState<BookingData>({
    ...initialBooking,
    characterName: initialCharacterName,
  });
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(field: keyof BookingData, value: string) {
    setBookingData((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(formData: FormData) {
    const result = await createBookingRequestAction(formData);
    setMessage(result.message);
    setSubmitted(result.ok);
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-black px-5 py-28 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_35%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight Events</p>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">Booking</h1>
          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
            Send en booking til motorsport, shows, private events eller større oplevelser i DreamLight.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <form action={handleSubmit} className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.02] backdrop-blur-xl md:p-8">
            {submitted ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-white bg-white text-3xl font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.16)]">
                  OK
                </div>
                <h2 className="text-4xl font-black md:text-6xl">Booking modtaget</h2>
                <p className="mt-5 max-w-xl text-zinc-400">{message || "DarkLight staff har modtaget din booking og følger op ingame."}</p>
                <button
                  type="button"
                  onClick={() => {
                    setBookingData({ ...initialBooking, characterName: initialCharacterName });
                    setSubmitted(false);
                    setMessage("");
                  }}
                  className="mt-8 rounded-full border border-white/15 px-6 py-3 font-black transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-black"
                >
                  Opret ny booking
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Bookingforespørgsel</p>
                  <h2 className="mt-3 text-3xl font-black">Eventdetaljer</h2>
                </div>

                {message ? <p className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">{message}</p> : null}

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Character navn">
                    <input required name="characterName" value={bookingData.characterName} onChange={(event) => updateField("characterName", event.target.value)} className="field" placeholder="Cole Kane" />
                  </Field>
                  <Field label="Ingame phone">
                    <input required name="ingamePhone" value={bookingData.ingamePhone} onChange={(event) => updateField("ingamePhone", event.target.value)} className="field" placeholder="555-0142" />
                  </Field>
                  <Field label="Eventtype">
                    <select name="eventType" value={bookingData.eventType} onChange={(event) => updateField("eventType", event.target.value)} className="field">
                      {bookingEvents.map((event) => (
                        <option key={event.id} value={event.title} className="bg-black">{event.title}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Lokation">
                    <input required name="ingameLocation" value={bookingData.ingameLocation} onChange={(event) => updateField("ingameLocation", event.target.value)} className="field" placeholder="Vinewood Track" />
                  </Field>
                  <Field label="Dato">
                    <input required name="desiredDate" type="date" value={bookingData.desiredDate} onChange={(event) => updateField("desiredDate", event.target.value)} className="field" />
                  </Field>
                  <Field label="Tid">
                    <input required name="desiredTime" type="time" value={bookingData.desiredTime} onChange={(event) => updateField("desiredTime", event.target.value)} className="field" />
                  </Field>
                  <Field label="Deltagere">
                    <input required name="participants" type="number" min="1" value={bookingData.participants} onChange={(event) => updateField("participants", event.target.value)} className="field" placeholder="24" />
                  </Field>
                  <Field label="Budget">
                    <input name="ingameBudget" value={bookingData.ingameBudget} onChange={(event) => updateField("ingameBudget", event.target.value)} className="field" placeholder="$50,000" />
                  </Field>
                  <Field label="Beskrivelse" wide>
                    <textarea required name="description" value={bookingData.description} onChange={(event) => updateField("description", event.target.value)} className="field min-h-40" placeholder="Beskriv eventet, formatet, stemningen, staff-behov og præmier." />
                  </Field>
                </div>

                <button className="mt-8 w-full rounded-full bg-white px-8 py-4 font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-300">
                  Send booking
                </button>
              </>
            )}
          </form>

          <aside className="h-fit rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.02] backdrop-blur-xl lg:sticky lg:top-28">
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Preview</p>
            <h3 className="mt-3 text-3xl font-black">Bookingoversigt</h3>
            <div className="mt-6 space-y-4 text-sm">
              <PreviewLine label="Character" value={bookingData.characterName} />
              <PreviewLine label="Phone" value={bookingData.ingamePhone} />
              <PreviewLine label="Event" value={bookingData.eventType} />
              <PreviewLine label="Dato" value={bookingData.desiredDate} />
              <PreviewLine label="Tid" value={bookingData.desiredTime} />
              <PreviewLine label="Lokation" value={bookingData.ingameLocation} />
              <PreviewLine label="Deltagere" value={bookingData.participants} />
            </div>
            <div className="mt-6 rounded-3xl border border-white/10 bg-black p-5">
              <p className="text-sm leading-6 text-zinc-500">
                Bookinger håndteres af DarkLight staff og gemmes i DarkLight databasen.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`grid gap-2 ${wide ? "md:col-span-2" : ""}`}>
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

function PreviewLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-semibold">{value || "Ikke valgt"}</span>
    </div>
  );
}
