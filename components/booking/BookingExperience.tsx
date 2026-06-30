"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bookingEvents, BookingEvent } from "@/data/booking-events";

const steps = [
  "Event",
  "Dato",
  "Services",
  "Kontakt",
  "Kontrakt",
];

const extras = [
  { title: "DJ / Musik", icon: "🎧", desc: "Skab stemning med musik og vært." },
  { title: "Sikkerhed", icon: "🛡️", desc: "Kontrolleret adgang og ro omkring eventet." },
  { title: "VIP-område", icon: "🥂", desc: "Eksklusivt område til særlige gæster." },
  { title: "Scene", icon: "🎤", desc: "Perfekt til koncerter, taler og awards." },
  { title: "Lys & effekter", icon: "✨", desc: "Cinematic stemning med lys og visuel effekt." },
  { title: "Køretøjer", icon: "🚘", desc: "Indgang, escort eller showkøretøjer." },
  { title: "Fotograf", icon: "📸", desc: "Fang de bedste øjeblikke fra eventet." },
  { title: "Vært", icon: "🎙️", desc: "Professionel styring af eventets flow." },
  { title: "Præmier", icon: "🏆", desc: "Belønninger til konkurrencer og deltagere." },
];

export default function BookingExperience() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    duration: "",
    guests: "",
    location: "",
    extras: [] as string[],
    name: "",
    characterName: "",
    phone: "",
    group: "",
    message: "",
  });

  const progress = useMemo(
    () => ((currentStep + 1) / steps.length) * 100,
    [currentStep]
  );

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const toggleExtra = (extra: string) => {
    setBookingData((prev) => ({
      ...prev,
      extras: prev.extras.includes(extra)
        ? prev.extras.filter((item) => item !== extra)
        : [...prev.extras, extra],
    }));
  };

  const canContinue =
    currentStep === 0 ? !!selectedEvent :
    currentStep === 1 ? !!bookingData.date && !!bookingData.time :
    currentStep === 3 ? !!bookingData.name && !!bookingData.phone :
    true;

  return (
    <section className="relative min-h-screen overflow-hidden bg-black px-5 py-24 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:70px_70px] opacity-20" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
            DarkLight Events
          </p>

          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            Premium Booking
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
            Book et eksklusivt FiveM-event med cinematic flow, live preview og
            DarkLight-kontrakt før afsendelse.
          </p>
        </motion.div>

        <div className="mb-10 rounded-full border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
          <div className="relative h-3 overflow-hidden rounded-full bg-black">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full bg-white"
            />
          </div>
        </div>

        <div className="mb-10 grid gap-3 md:grid-cols-5">
          {steps.map((step, index) => (
            <button
              key={step}
              onClick={() => index <= currentStep && setCurrentStep(index)}
              className={`rounded-2xl border p-4 text-left transition ${
                index === currentStep
                  ? "border-white bg-white text-black"
                  : index < currentStep
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 bg-white/[0.03] text-zinc-600"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.25em] opacity-60">
                Step {index + 1}
              </p>
              <p className="mt-1 font-bold">{step}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <main className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl md:p-8">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[520px] flex-col items-center justify-center text-center"
                >
                  <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-white bg-white text-5xl text-black">
                    ✓
                  </div>
                  <h2 className="text-4xl font-black md:text-6xl">
                    Booking modtaget
                  </h2>
                  <p className="mt-5 max-w-xl text-zinc-400">
                    Tak fordi du valgte DarkLight Events. Vi kontakter dig
                    hurtigst muligt in-game eller via telefon.
                  </p>
                </motion.div>
              ) : currentStep === 0 ? (
                <motion.div
                  key="event"
                  initial={{ opacity: 0, x: 35 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -35 }}
                >
                  <h2 className="mb-2 text-3xl font-black">Vælg eventtype</h2>
                  <p className="mb-8 text-zinc-500">
                    Start med at vælge den oplevelse, DarkLight skal skabe.
                  </p>

                  <div className="grid gap-6 md:grid-cols-2">
                    {bookingEvents.map((event) => (
                      <motion.button
                        whileHover={{ y: -8 }}
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`group overflow-hidden rounded-[2rem] border text-left transition ${
                          selectedEvent?.id === event.id
                            ? "border-white bg-white text-black"
                            : "border-white/10 bg-black text-white hover:border-white/60"
                        }`}
                      >
                        <div className="relative h-64 overflow-hidden">
                          <div
                            className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${event.image})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                          <div className="absolute bottom-5 left-5 right-5">
                            <p className="text-xs uppercase tracking-[0.35em] text-zinc-300">
                              {event.category}
                            </p>
                            <h3 className="mt-2 text-3xl font-black text-white">
                              {event.title}
                            </h3>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="mb-4 flex flex-wrap gap-2">
                            <span className="rounded-full border border-current px-3 py-1 text-xs">
                              {event.priceLevel}
                            </span>
                            <span className="rounded-full border border-current px-3 py-1 text-xs">
                              {event.duration}
                            </span>
                          </div>
                          <p className="text-sm opacity-70">
                            {event.description}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : currentStep === 1 ? (
                <motion.div
                  key="datetime"
                  initial={{ opacity: 0, x: 35 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -35 }}
                >
                  <h2 className="mb-2 text-3xl font-black">Dato & tid</h2>
                  <p className="mb-8 text-zinc-500">
                    Vælg hvornår eventet skal afholdes.
                  </p>

                  <div className="grid gap-5 md:grid-cols-2">
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, date: e.target.value })
                      }
                      className="rounded-3xl border border-white/10 bg-black p-5 text-white outline-none transition focus:border-white"
                    />

                    <input
                      type="time"
                      value={bookingData.time}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, time: e.target.value })
                      }
                      className="rounded-3xl border border-white/10 bg-black p-5 text-white outline-none transition focus:border-white"
                    />

                    <input
                      type="text"
                      placeholder="Forventet varighed"
                      value={bookingData.duration}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          duration: e.target.value,
                        })
                      }
                      className="rounded-3xl border border-white/10 bg-black p-5 text-white outline-none transition focus:border-white"
                    />

                    <input
                      type="text"
                      placeholder="Ønsket lokation"
                      value={bookingData.location}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          location: e.target.value,
                        })
                      }
                      className="rounded-3xl border border-white/10 bg-black p-5 text-white outline-none transition focus:border-white"
                    />
                  </div>
                </motion.div>
              ) : currentStep === 2 ? (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, x: 35 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -35 }}
                >
                  <h2 className="mb-2 text-3xl font-black">Ekstra services</h2>
                  <p className="mb-8 text-zinc-500">
                    Tilføj de elementer, der gør eventet større.
                  </p>

                  <input
                    type="number"
                    placeholder="Forventet antal gæster"
                    value={bookingData.guests}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, guests: e.target.value })
                    }
                    className="mb-6 w-full rounded-3xl border border-white/10 bg-black p-5 text-white outline-none transition focus:border-white"
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    {extras.map((extra) => {
                      const active = bookingData.extras.includes(extra.title);

                      return (
                        <motion.button
                          whileHover={{ y: -5 }}
                          key={extra.title}
                          onClick={() => toggleExtra(extra.title)}
                          className={`relative rounded-3xl border p-5 text-left transition ${
                            active
                              ? "border-white bg-white text-black"
                              : "border-white/10 bg-black text-white hover:border-white/60"
                          }`}
                        >
                          <div className="mb-4 text-3xl">{extra.icon}</div>
                          <h3 className="font-black">{extra.title}</h3>
                          <p className="mt-2 text-sm opacity-60">
                            {extra.desc}
                          </p>

                          {active && (
                            <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-black text-sm text-white">
                              ✓
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : currentStep === 3 ? (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, x: 35 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -35 }}
                >
                  <h2 className="mb-2 text-3xl font-black">Kontakt</h2>
                  <p className="mb-8 text-zinc-500">
                    Hvem skal DarkLight kontakte omkring bookingen?
                  </p>

                  <div className="grid gap-5 md:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Dit navn"
                      value={bookingData.name}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, name: e.target.value })
                      }
                      className="rounded-3xl border border-white/10 bg-black p-5 text-white outline-none transition focus:border-white"
                    />

                    <input
                      type="text"
                      placeholder="Karakter-navn"
                      value={bookingData.characterName}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          characterName: e.target.value,
                        })
                      }
                      className="rounded-3xl border border-white/10 bg-black p-5 text-white outline-none transition focus:border-white"
                    />

                    <input
                      type="text"
                      placeholder="Telefonnummer"
                      value={bookingData.phone}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, phone: e.target.value })
                      }
                      className="rounded-3xl border border-white/10 bg-black p-5 text-white outline-none transition focus:border-white"
                    />

                    <input
                      type="text"
                      placeholder="Firma / gruppe / organisation"
                      value={bookingData.group}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, group: e.target.value })
                      }
                      className="rounded-3xl border border-white/10 bg-black p-5 text-white outline-none transition focus:border-white"
                    />

                    <textarea
                      placeholder="Fortæl kort om dit event..."
                      value={bookingData.message}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          message: e.target.value,
                        })
                      }
                      className="min-h-44 rounded-3xl border border-white/10 bg-black p-5 text-white outline-none transition focus:border-white md:col-span-2"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="contract"
                  initial={{ opacity: 0, x: 35 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -35 }}
                >
                  <h2 className="mb-2 text-3xl font-black">
                    DarkLight-kontrakt
                  </h2>
                  <p className="mb-8 text-zinc-500">
                    Gennemgå din booking før den sendes.
                  </p>

                  <div className="rounded-[2rem] border border-white/15 bg-black p-8">
                    <div className="mb-8 border-b border-white/10 pb-6">
                      <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">
                        Booking Request
                      </p>
                      <h3 className="mt-2 text-4xl font-black">
                        DarkLight Events
                      </h3>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <Info title="Event" value={selectedEvent?.title} />
                      <Info title="Kategori" value={selectedEvent?.category} />
                      <Info title="Dato" value={bookingData.date} />
                      <Info title="Tidspunkt" value={bookingData.time} />
                      <Info title="Lokation" value={bookingData.location} />
                      <Info title="Varighed" value={bookingData.duration} />
                      <Info title="Gæster" value={bookingData.guests} />
                      <Info title="Kontakt" value={bookingData.name} />
                      <Info title="Karakter" value={bookingData.characterName} />
                      <Info title="Telefon" value={bookingData.phone} />
                    </div>

                    <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                      <p className="mb-2 text-sm uppercase tracking-[0.25em] text-zinc-500">
                        Services
                      </p>
                      <p>
                        {bookingData.extras.length > 0
                          ? bookingData.extras.join(", ")
                          : "Ingen ekstra services valgt"}
                      </p>
                    </div>

                    {bookingData.message && (
                      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-zinc-500">
                          Besked
                        </p>
                        <p className="text-zinc-300">{bookingData.message}</p>
                      </div>
                    )}

                    <button
                      onClick={() => setSubmitted(true)}
                      className="mt-8 w-full rounded-3xl bg-white px-6 py-5 font-black text-black transition hover:bg-zinc-300"
                    >
                      Bekræft booking
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!submitted && (
              <div className="mt-10 flex justify-between gap-4">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="rounded-2xl border border-white/15 px-6 py-3 font-bold text-white transition hover:border-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Tilbage
                </button>

                {currentStep < steps.length - 1 && (
                  <button
                    onClick={nextStep}
                    disabled={!canContinue}
                    className="rounded-2xl bg-white px-8 py-3 font-black text-black transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Fortsæt
                  </button>
                )}
              </div>
            )}
          </main>

          <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl lg:sticky lg:top-24">
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-zinc-500">
              Live Preview
            </p>

            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
              <div
                className="h-48 bg-cover bg-center"
                style={{
                  backgroundImage: selectedEvent
                    ? `url(${selectedEvent.image})`
                    : "linear-gradient(135deg,#18181b,#000)",
                }}
              />

              <div className="p-5">
                <h3 className="text-2xl font-black">
                  {selectedEvent?.title || "Vælg event"}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {selectedEvent?.category || "DarkLight Events"}
                </p>

                <div className="mt-6 space-y-4 text-sm">
                  <PreviewLine label="Dato" value={bookingData.date} />
                  <PreviewLine label="Tid" value={bookingData.time} />
                  <PreviewLine label="Lokation" value={bookingData.location} />
                  <PreviewLine label="Gæster" value={bookingData.guests} />
                  <PreviewLine
                    label="Services"
                    value={
                      bookingData.extras.length
                        ? `${bookingData.extras.length} valgt`
                        : ""
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black p-5">
              <p className="text-sm text-zinc-500">
                Dette er en FiveM RP-bookingforespørgsel. DarkLight Events
                kontakter dig efterfølgende for at aftale de sidste detaljer.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Info({ title, value }: { title: string; value?: string | null }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="mb-2 text-sm uppercase tracking-[0.25em] text-zinc-500">
        {title}
      </p>
      <p className="font-semibold">{value || "Ikke udfyldt"}</p>
    </div>
  );
}

function PreviewLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-semibold">{value || "—"}</span>
    </div>
  );
}