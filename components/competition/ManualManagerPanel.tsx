"use client";

import { useMemo, useState } from "react";

export type ManualManagerItem = {
  id: string;
  title: string;
  status?: string;
  meta?: string;
  description?: string;
};

type ManualManagerPanelProps = {
  title: string;
  description: string;
  storageKey: string;
  items: ManualManagerItem[];
};

export default function ManualManagerPanel({ title, description, storageKey, items }: ManualManagerPanelProps) {
  const [localItems, setLocalItems] = useState(items);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const activeItems = useMemo(() => localItems.filter((item) => item.status !== "Arkiveret"), [localItems]);

  function persist(nextItems: ManualManagerItem[], nextMessage: string) {
    setLocalItems(nextItems);
    localStorage.setItem(storageKey, JSON.stringify(nextItems));
    setMessage(nextMessage);
  }

  function createItem() {
    if (!name.trim()) {
      setMessage("Skriv et navn før du opretter.");
      return;
    }

    const nextItem: ManualManagerItem = {
      id: `${storageKey}-${Date.now()}`,
      title: name.trim(),
      status: "Aktiv",
      meta: "Oprettet manuelt",
      description: note.trim() || "Klar til staff-gennemgang.",
    };

    persist([nextItem, ...localItems], `${name.trim()} er oprettet.`);
    setName("");
    setNote("");
  }

  function archiveItem(id: string) {
    const nextItems = localItems.map((item) => (item.id === id ? { ...item, status: "Arkiveret" } : item));
    persist(nextItems, "Elementet er arkiveret lokalt.");
  }

  function editItem(id: string) {
    const nextItems = localItems.map((item) =>
      item.id === id ? { ...item, status: "Opdateret", meta: "Redigeret manuelt" } : item
    );
    persist(nextItems, "Elementet er markeret som opdateret.");
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h3 className="text-2xl font-black text-white">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{description}</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
          {activeItems.length} aktive
        </span>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Navn eller titel"
          className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
        />
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Kort note"
          className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
        />
        <button
          type="button"
          onClick={createItem}
          className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-zinc-300"
        >
          Opret
        </button>
      </div>

      {message ? (
        <p className="mt-4 rounded-2xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm font-black text-green-300">
          {message}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3">
        {localItems.length ? (
          localItems.slice(0, 5).map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-black/70 p-4">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="font-black text-white">{item.title}</h4>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-black text-zinc-300">
                      {item.status || "Aktiv"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">{item.meta || item.description || "Klar til håndtering."}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => editItem(item.id)} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-200 transition hover:bg-white hover:text-black">
                    Rediger
                  </button>
                  <button type="button" onClick={() => archiveItem(item.id)} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-200 transition hover:bg-white hover:text-black">
                    Arkiver
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-2xl border border-white/10 bg-black/60 p-5 text-sm text-zinc-500">Ingen elementer endnu.</p>
        )}
      </div>
    </section>
  );
}

