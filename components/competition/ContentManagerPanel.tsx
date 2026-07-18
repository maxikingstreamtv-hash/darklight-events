"use client";

import { useState, useTransition } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  archiveFaqItemAction,
  archiveRuleSetAction,
  updateFaqItemAction,
  updateRuleSetAction,
  type ContentActionResult,
} from "@/app/competition/admin/content-actions";

type FaqManagerItem = {
  id: string;
  question: string;
  category: string;
  note: string | null;
  answer: string;
  active: boolean;
  status: string;
  sortOrder: number;
};

type RuleManagerItem = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  summary: string;
  content: string;
  active: boolean;
  status: string;
  sortOrder: number;
};

type Message = ContentActionResult | null;

export function FaqManagerPanel({ items }: { items: FaqManagerItem[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const activeCount = items.filter((item: FaqManagerItem) => item.active && item.status !== "ARCHIVED").length;

  function handleSave(itemId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPendingId(itemId);

    startTransition(async () => {
      const result = await updateFaqItemAction(itemId, formData);
      setMessage(result);
      setPendingId(null);

      if (result.ok) {
        setEditingId(null);
        router.refresh();
      }
    });
  }

  function handleArchive(itemId: string) {
    setPendingId(itemId);

    startTransition(async () => {
      const result = await archiveFaqItemAction(itemId);
      setMessage(result);
      setPendingId(null);

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <ContentShell title="FAQ Manager" description="Rediger spørgsmål og svar til spillere og bookere. Ændringer gemmes i PostgreSQL." activeCount={activeCount} message={message}>
      {items.length === 0 ? <Empty /> : items.map((item: FaqManagerItem) => (
        <article key={item.id} className="rounded-2xl border border-white/10 bg-black/70 p-4">
          {editingId === item.id ? (
            <form onSubmit={(event) => handleSave(item.id, event)} className="grid gap-3">
              <Field label="Spørgsmål / titel">
                <input name="question" defaultValue={item.question} className="field" required />
              </Field>
              <Field label="Kategori">
                <input name="category" defaultValue={item.category} className="field" />
              </Field>
              <Field label="Kort note">
                <input name="note" defaultValue={item.note ?? ""} className="field" />
              </Field>
              <Field label="Fuldt svar / indhold">
                <textarea name="answer" defaultValue={item.answer} className="field min-h-32" required />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Status">
                  <select name="status" defaultValue={item.active && item.status !== "ARCHIVED" ? "ACTIVE" : "ARCHIVED"} className="field">
                    <option value="ACTIVE">Aktiv</option>
                    <option value="ARCHIVED">Arkiveret</option>
                  </select>
                </Field>
                <Field label="Sortering">
                  <input name="sortOrder" type="number" defaultValue={item.sortOrder} className="field" />
                </Field>
              </div>
              <div className="flex flex-wrap gap-2">
                <SaveButton pending={isPending && pendingId === item.id} />
                <button type="button" onClick={() => setEditingId(null)} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-200 transition hover:bg-white hover:text-black">Annuller</button>
              </div>
            </form>
          ) : (
            <ContentPreview
              title={item.question}
              active={item.active && item.status !== "ARCHIVED"}
              meta={item.note ?? item.answer}
              onEdit={() => {
                setMessage(null);
                setEditingId(item.id);
              }}
              onArchive={() => handleArchive(item.id)}
              archiveLabel={item.active && item.status !== "ARCHIVED" ? "Arkiver" : "Aktivér"}
              pending={isPending && pendingId === item.id}
            />
          )}
        </article>
      ))}
    </ContentShell>
  );
}

export function RulesManagerPanel({ items }: { items: RuleManagerItem[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const activeCount = items.filter((item: RuleManagerItem) => item.active && item.status !== "ARCHIVED").length;

  function handleSave(itemId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPendingId(itemId);

    startTransition(async () => {
      const result = await updateRuleSetAction(itemId, formData);
      setMessage(result);
      setPendingId(null);

      if (result.ok) {
        setEditingId(null);
        router.refresh();
      }
    });
  }

  function handleArchive(itemId: string) {
    setPendingId(itemId);

    startTransition(async () => {
      const result = await archiveRuleSetAction(itemId);
      setMessage(result);
      setPendingId(null);

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <ContentShell title="Regelsæt Manager" description="Rediger regler og public tekst. Ændringer gemmes i PostgreSQL." activeCount={activeCount} message={message}>
      {items.length === 0 ? <Empty /> : items.map((item: RuleManagerItem) => (
        <article key={item.id} className="rounded-2xl border border-white/10 bg-black/70 p-4">
          {editingId === item.id ? (
            <form onSubmit={(event) => handleSave(item.id, event)} className="grid gap-3">
              <Field label="Titel">
                <input name="title" defaultValue={item.title} className="field" required />
              </Field>
              <Field label="Kategori">
                <input name="category" defaultValue={item.category} className="field" />
              </Field>
              <Field label="Kort beskrivelse">
                <input name="summary" defaultValue={item.description ?? item.summary} className="field" required />
              </Field>
              <Field label="Fuldt regelindhold">
                <textarea name="content" defaultValue={item.content} className="field min-h-40" required />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Status">
                  <select name="status" defaultValue={item.active && item.status !== "ARCHIVED" ? "ACTIVE" : "ARCHIVED"} className="field">
                    <option value="ACTIVE">Aktiv</option>
                    <option value="ARCHIVED">Arkiveret</option>
                  </select>
                </Field>
                <Field label="Sortering">
                  <input name="sortOrder" type="number" defaultValue={item.sortOrder} className="field" />
                </Field>
              </div>
              <div className="flex flex-wrap gap-2">
                <SaveButton pending={isPending && pendingId === item.id} />
                <button type="button" onClick={() => setEditingId(null)} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-200 transition hover:bg-white hover:text-black">Annuller</button>
              </div>
            </form>
          ) : (
            <ContentPreview
              title={item.title}
              active={item.active && item.status !== "ARCHIVED"}
              meta={item.summary}
              onEdit={() => {
                setMessage(null);
                setEditingId(item.id);
              }}
              onArchive={() => handleArchive(item.id)}
              archiveLabel={item.active && item.status !== "ARCHIVED" ? "Arkiver" : "Aktivér"}
              pending={isPending && pendingId === item.id}
            />
          )}
        </article>
      ))}
    </ContentShell>
  );
}

function ContentShell({ title, description, activeCount, message, children }: { title: string; description: string; activeCount: number; message: Message; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h3 className="text-2xl font-black text-white">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{description}</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
          {activeCount} aktive
        </span>
      </div>
      {message ? (
        <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-black ${message.ok ? "border-green-400/20 bg-green-400/10 text-green-300" : "border-red-400/20 bg-red-400/10 text-red-200"}`}>
          {message.message}
        </p>
      ) : null}
      <div className="mt-6 grid gap-3">{children}</div>
    </section>
  );
}

function ContentPreview({ title, active, meta, onEdit, onArchive, archiveLabel, pending }: { title: string; active: boolean; meta: string; onEdit: () => void; onArchive: () => void; archiveLabel: string; pending: boolean }) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="font-black text-white">{title}</h4>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-black text-zinc-300">
            {active ? "Aktiv" : "Arkiveret"}
          </span>
        </div>
        <p className="mt-2 text-sm text-zinc-500">{meta}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button type="button" onClick={onEdit} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-200 transition hover:bg-white hover:text-black">
          Rediger
        </button>
        <button type="button" disabled={pending} onClick={onArchive} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-200 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50">
          {pending ? "Gemmer..." : archiveLabel}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

function SaveButton({ pending }: { pending: boolean }) {
  return (
    <button disabled={pending} className="rounded-full bg-white px-4 py-2 text-xs font-black text-black transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50">
      {pending ? "Gemmer..." : "Gem ændringer"}
    </button>
  );
}

function Empty() {
  return <p className="rounded-2xl border border-white/10 bg-black/60 p-5 text-sm text-zinc-500">Ingen elementer endnu.</p>;
}
