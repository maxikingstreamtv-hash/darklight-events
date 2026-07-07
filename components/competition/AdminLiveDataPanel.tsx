"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getAvailableDrivers } from "@/components/auth/driver-directory";
import {
  EVENTOS_ADMIN_GALLERY_STORAGE_KEY,
  EVENTOS_ADMIN_PERMISSION_STORAGE_KEY,
  EVENTOS_ADMIN_SPONSOR_STORAGE_KEY,
  EVENTOS_BOOKING_STORAGE_KEY,
  EVENTOS_CONTACT_STORAGE_KEY,
  EVENTOS_STATE_STORAGE_KEY,
  useEventOSStore,
} from "@/components/competition/eventos-store";
import type { ManagedEvent } from "@/data/event-manager";
import { drivers } from "@/data/drivers";
import { galleryItems, type GalleryItem } from "@/data/gallery";
import { permissions, type PermissionItem, type PermissionStatus } from "@/data/permissions";
import { sponsors, type Sponsor, type SponsorLevel } from "@/data/sponsors";

type AdminTab = "overview" | "events" | "drivers" | "results" | "inbox" | "partners" | "media" | "logs" | "io";
type BookingStatus = "Afventer" | "Godkendt" | "Afvist" | "Arkiveret";
type ContactStatus = "Ny" | "Læst" | "Besvaret" | "Arkiveret";

type BookingRequest = {
  id: string;
  characterName?: string;
  ingamePhone?: string;
  eventType?: string;
  desiredDate?: string;
  desiredTime?: string;
  ingameLocation?: string;
  participants?: string;
  description?: string;
  status?: BookingStatus | string;
  createdAt?: string;
};

type ContactMessage = {
  id: string;
  characterName?: string;
  ingamePhone?: string;
  subject?: string;
  message?: string;
  status?: ContactStatus | string;
  createdAt?: string;
};

type AdminSponsor = Sponsor & {
  logoUrl?: string;
};

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "overview", label: "Overblik" },
  { id: "events", label: "Events" },
  { id: "drivers", label: "Drivers" },
  { id: "results", label: "Resultater" },
  { id: "inbox", label: "Indbakke" },
  { id: "partners", label: "Partnere" },
  { id: "media", label: "Galleri" },
  { id: "logs", label: "Logs" },
  { id: "io", label: "Import/eksport" },
];

const emptyEvent: ManagedEvent = {
  id: "",
  title: "",
  type: "Drift",
  date: "",
  time: "20:00",
  location: "",
  status: "Ready",
  participants: 0,
  maxParticipants: 32,
  href: "",
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function readStorageList<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeStorageList<T>(key: string, items: T[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminLiveDataPanel() {
  const {
    events,
    participants,
    results,
    hallOfFameWinners,
    eventSponsors,
    logs,
    createEvent,
    deleteEvent,
    updateEventStatus,
    removeParticipant,
    resetDriverData,
    approveResult,
    rejectResult,
    updateResult,
    deleteResult,
  } = useEventOSStore();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [bookings, setBookings] = useState<BookingRequest[]>(() => readStorageList(EVENTOS_BOOKING_STORAGE_KEY, []));
  const [contacts, setContacts] = useState<ContactMessage[]>(() => readStorageList(EVENTOS_CONTACT_STORAGE_KEY, []));
  const [localSponsors, setLocalSponsors] = useState<AdminSponsor[]>(() => readStorageList(EVENTOS_ADMIN_SPONSOR_STORAGE_KEY, sponsors));
  const [localPermissions, setLocalPermissions] = useState<PermissionItem[]>(() => readStorageList(EVENTOS_ADMIN_PERMISSION_STORAGE_KEY, permissions));
  const [localGallery, setLocalGallery] = useState<GalleryItem[]>(() => readStorageList(EVENTOS_ADMIN_GALLERY_STORAGE_KEY, galleryItems));
  const [eventDraft, setEventDraft] = useState<ManagedEvent>({ ...emptyEvent, date: today() });
  const [sponsorDraft, setSponsorDraft] = useState<AdminSponsor>(() => ({ ...sponsors[0], id: "", name: "", status: "Aktiv", logoUrl: "" }));
  const [permissionDraft, setPermissionDraft] = useState<PermissionItem>(() => ({ ...permissions[0], id: "", event: "", location: "", status: "Afventer", authority: "Eventkoordinering", applicant: "DarkLight staff", date: today(), comment: "", documentRef: "eventmanual" }));
  const [galleryDraft, setGalleryDraft] = useState<GalleryItem>(() => ({ ...galleryItems[0], id: "", title: "", category: "Drift", eventRef: "", date: today(), description: "", image: "/images/events/races.png" }));
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [resultNote, setResultNote] = useState("");
  const [resultTotal, setResultTotal] = useState(0);
  const [confirmAction, setConfirmAction] = useState<{ label: string; action: () => void } | null>(null);
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");
  const allDrivers = useMemo(() => getAvailableDrivers(), []);

  const approvedResults = useMemo(() => results.filter((result) => result.status === "approved"), [results]);
  const pendingResults = useMemo(() => results.filter((result) => result.status === "pending"), [results]);
  const rejectedResults = useMemo(() => results.filter((result) => result.status === "rejected"), [results]);
  const checkedInCount = useMemo(() => participants.filter((participant) => participant.checkedIn).length, [participants]);

  function setEventField<Key extends keyof ManagedEvent>(key: Key, value: ManagedEvent[Key]) {
    setEventDraft((current) => ({ ...current, [key]: value }));
  }

  function saveEvent() {
    if (!eventDraft.title.trim()) {
      setMessage("Skriv et eventnavn før du gemmer.");
      return;
    }

    const id = eventDraft.id || `${slugify(eventDraft.title)}-${Date.now()}`;
    createEvent({
      ...eventDraft,
      id,
      title: eventDraft.title.trim(),
      href: `/competition/events/${id}`,
      participants: Math.max(0, Number(eventDraft.participants) || 0),
      maxParticipants: Math.max(1, Number(eventDraft.maxParticipants) || 1),
    });
    setEventDraft({ ...emptyEvent, date: today() });
    setMessage("Eventet er gemt i EventOS og vises på den offentlige eventside.");
  }

  function editEvent(event: ManagedEvent) {
    setEventDraft(event);
    setActiveTab("events");
  }

  function archiveEvent(eventId: string) {
    updateEventStatus(eventId, "Archived");
    setMessage("Eventet er arkiveret.");
  }

  function updateBookingStatus(id: string, status: BookingStatus) {
    const next = bookings.map((booking) => (booking.id === id ? { ...booking, status } : booking));
    setBookings(next);
    writeStorageList(EVENTOS_BOOKING_STORAGE_KEY, next);
    setMessage(`Booking ${id} er sat til ${status}.`);
  }

  function deleteBooking(id: string) {
    const next = bookings.filter((booking) => booking.id !== id);
    setBookings(next);
    writeStorageList(EVENTOS_BOOKING_STORAGE_KEY, next);
    setMessage(`Booking ${id} er slettet.`);
  }

  function updateContactStatus(id: string, status: ContactStatus) {
    const next = contacts.map((contact) => (contact.id === id ? { ...contact, status } : contact));
    setContacts(next);
    writeStorageList(EVENTOS_CONTACT_STORAGE_KEY, next);
    setMessage(`Kontaktbesked ${id} er sat til ${status}.`);
  }

  function deleteContact(id: string) {
    const next = contacts.filter((contact) => contact.id !== id);
    setContacts(next);
    writeStorageList(EVENTOS_CONTACT_STORAGE_KEY, next);
    setMessage(`Kontaktbesked ${id} er slettet.`);
  }

  function requestConfirm(label: string, action: () => void) {
    setConfirmAction({ label, action });
  }

  function runConfirmedAction() {
    confirmAction?.action();
    setConfirmAction(null);
  }

  function saveSponsor() {
    if (!sponsorDraft.name.trim()) return;
    const id = sponsorDraft.id || `${slugify(sponsorDraft.name)}-${Date.now()}`;
    const next = [{ ...sponsorDraft, id, partnerSince: sponsorDraft.partnerSince || today(), eventsSupported: sponsorDraft.eventsSupported.length ? sponsorDraft.eventsSupported : ["DarkLight Events"] }, ...localSponsors.filter((sponsor) => sponsor.id !== id)];
    setLocalSponsors(next);
    writeStorageList(EVENTOS_ADMIN_SPONSOR_STORAGE_KEY, next);
    setSponsorDraft({ ...sponsors[0], id: "", name: "", status: "Aktiv", logoUrl: "" });
    setMessage("Sponsor er gemt lokalt.");
  }

  function savePermission() {
    if (!permissionDraft.event.trim() || !permissionDraft.location.trim()) return;
    const id = permissionDraft.id || `${slugify(permissionDraft.event)}-${Date.now()}`;
    const next = [{ ...permissionDraft, id }, ...localPermissions.filter((permission) => permission.id !== id)];
    setLocalPermissions(next);
    writeStorageList(EVENTOS_ADMIN_PERMISSION_STORAGE_KEY, next);
    setPermissionDraft({ ...permissionDraft, id: "", event: "", location: "", comment: "", date: today() });
    setMessage("Tilladelse er gemt lokalt.");
  }

  function saveGalleryItem() {
    if (!galleryDraft.title.trim()) return;
    const id = galleryDraft.id || `${slugify(galleryDraft.title)}-${Date.now()}`;
    const next = [{ ...galleryDraft, id }, ...localGallery.filter((item) => item.id !== id)];
    setLocalGallery(next);
    writeStorageList(EVENTOS_ADMIN_GALLERY_STORAGE_KEY, next);
    setGalleryDraft({ ...galleryDraft, id: "", title: "", eventRef: "", description: "", date: today() });
    setMessage("Galleri-element er gemt lokalt.");
  }

  function archiveLocalItem<T extends { id: string; status?: string }>(items: T[], id: string, key: string, setter: (items: T[]) => void) {
    const next = items.map((item) => (item.id === id ? { ...item, status: "Arkiveret" } : item));
    setter(next);
    writeStorageList(key, next);
    setMessage("Elementet er arkiveret.");
  }

  function removeLocalItem<T extends { id: string }>(items: T[], id: string, key: string, setter: (items: T[]) => void) {
    const next = items.filter((item) => item.id !== id);
    setter(next);
    writeStorageList(key, next);
    setMessage("Elementet er fjernet.");
  }

  function startResultEdit(resultId: string) {
    const result = results.find((item) => item.id === resultId);
    if (!result) return;
    setEditingResultId(result.id);
    setResultNote(result.notes ?? "");
    setResultTotal(result.total ?? 0);
  }

  function saveResultEdit() {
    if (!editingResultId) return;
    updateResult(editingResultId, { notes: resultNote, total: resultTotal });
    setEditingResultId(null);
    setMessage("Resultatet er opdateret på samme resultat-id.");
  }

  function exportEventOS() {
    const payload = {
      exportedAt: new Date().toISOString(),
      eventos: JSON.parse(window.localStorage.getItem(EVENTOS_STATE_STORAGE_KEY) ?? "null"),
      bookings,
      contacts,
      sponsors: localSponsors,
      permissions: localPermissions,
      gallery: localGallery,
    };
    setImportText(JSON.stringify(payload, null, 2));
    setMessage("EventOS JSON er klar i feltet.");
  }

  function importEventOS() {
    try {
      const payload = JSON.parse(importText);
      if (payload.eventos) window.localStorage.setItem(EVENTOS_STATE_STORAGE_KEY, JSON.stringify(payload.eventos));
      if (Array.isArray(payload.bookings)) {
        writeStorageList(EVENTOS_BOOKING_STORAGE_KEY, payload.bookings);
        setBookings(payload.bookings);
      }
      if (Array.isArray(payload.contacts)) {
        writeStorageList(EVENTOS_CONTACT_STORAGE_KEY, payload.contacts);
        setContacts(payload.contacts);
      }
      if (Array.isArray(payload.sponsors)) {
        writeStorageList(EVENTOS_ADMIN_SPONSOR_STORAGE_KEY, payload.sponsors);
        setLocalSponsors(payload.sponsors);
      }
      if (Array.isArray(payload.permissions)) {
        writeStorageList(EVENTOS_ADMIN_PERMISSION_STORAGE_KEY, payload.permissions);
        setLocalPermissions(payload.permissions);
      }
      if (Array.isArray(payload.gallery)) {
        writeStorageList(EVENTOS_ADMIN_GALLERY_STORAGE_KEY, payload.gallery);
        setLocalGallery(payload.gallery);
      }
      setMessage("JSON er importeret. Genindlæs siden for at opdatere hele EventOS-store.");
    } catch {
      setMessage("Import fejlede. Tjek at feltet indeholder gyldig JSON.");
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">Admin kontrolpanel</p>
          <h2 className="mt-3 text-3xl font-black">Styr hele V1-platformen</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Events, deltagere, resultater, indbakke, partnere, galleri og eksport samles her. Data gemmes lokalt i denne version.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={exportEventOS} className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300">
            Eksporter JSON
          </button>
          <button type="button" onClick={importEventOS} className="rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
            Importer JSON
          </button>
        </div>
      </div>

      {message ? <p className="mt-5 rounded-2xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm font-black text-green-300">{message}</p> : null}
      {confirmAction ? (
        <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="font-black text-red-100">Bekræft handling</p>
          <p className="mt-2 text-sm leading-6 text-red-100/80">{confirmAction.label}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={runConfirmedAction} className="rounded-full bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400">
              Bekræft
            </button>
            <button type="button" onClick={() => setConfirmAction(null)} className="rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
              Annuller
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-black p-2">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`shrink-0 rounded-xl px-4 py-3 text-sm font-black transition ${activeTab === tab.id ? "bg-white text-black" : "text-zinc-300 hover:bg-white/[0.08] hover:text-white"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStat label="Events" value={events.length} />
          <AdminStat label="Deltagere" value={participants.length} detail={`${checkedInCount} checket ind`} />
          <AdminStat label="Resultater" value={results.length} detail={`${pendingResults.length} afventer`} />
          <AdminStat label="Rangliste" value={approvedResults.length} detail="Godkendte resultater" />
          <AdminStat label="Hall of Fame" value={hallOfFameWinners.length} />
          <AdminStat label="Bookings" value={bookings.length} />
          <AdminStat label="Kontakt" value={contacts.length} />
          <AdminStat label="Sponsorer" value={localSponsors.length + eventSponsors.length} />
          <AdminStat label="Tilladelser" value={localPermissions.length} />
          <AdminStat label="Galleri" value={localGallery.length} />
          <AdminStat label="Kørere" value={allDrivers.length} />
          <AdminStat label="Historik" value={logs.length} />
        </div>
      ) : null}

      {activeTab === "events" ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
          <DataPanel title="Opret eller rediger event">
            <Input label="Eventnavn" value={eventDraft.title} onChange={(value) => setEventField("title", value)} />
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Type" value={eventDraft.type} onChange={(value) => setEventField("type", value)} />
              <Select label="Status" value={eventDraft.status} onChange={(value) => setEventField("status", value as ManagedEvent["status"])}>
                {(["Ready", "Live", "Paused", "Finished", "Archived"] as ManagedEvent["status"][]).map((status) => <option key={status}>{status}</option>)}
              </Select>
              <Input label="Dato" type="date" value={eventDraft.date} onChange={(value) => setEventField("date", value)} />
              <Input label="Tid" type="time" value={eventDraft.time} onChange={(value) => setEventField("time", value)} />
              <Input label="Lokation" value={eventDraft.location} onChange={(value) => setEventField("location", value)} />
              <Input label="Maks deltagere" type="number" value={String(eventDraft.maxParticipants)} onChange={(value) => setEventField("maxParticipants", Number(value))} />
            </div>
            <button type="button" onClick={saveEvent} className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300">
              Gem event
            </button>
          </DataPanel>
          <DataPanel title="Alle events">
            {events.map((event) => (
              <AdminCard key={event.id} title={event.title} meta={`${event.status} · ${event.date} ${event.time} · ${event.location}`}>
                <SmallButton onClick={() => editEvent(event)}>Rediger</SmallButton>
                <SmallButton onClick={() => updateEventStatus(event.id, "Live")}>Live</SmallButton>
                <SmallButton onClick={() => archiveEvent(event.id)}>Arkiver</SmallButton>
                <SmallButton danger onClick={() => requestConfirm(`Slet eventet "${event.title}" og lokale eventdata?`, () => deleteEvent(event.id, "Admin"))}>Slet</SmallButton>
              </AdminCard>
            ))}
          </DataPanel>
        </div>
      ) : null}

      {activeTab === "drivers" ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <DataPanel title="Tilmeldte deltagere">
            {participants.length > 0 ? participants.map((participant) => (
              <AdminCard key={participant.id} title={getDriverName(participant.driverId)} meta={`${participant.eventId} · ${participant.checkedIn ? "Checket ind" : "Afventer check-in"}`}>
                <SmallButton onClick={() => resetDriverData(participant.driverId, "statistics", "Admin")}>Nulstil statistik</SmallButton>
                <SmallButton danger onClick={() => requestConfirm(`Fjern ${getDriverName(participant.driverId, allDrivers)} fra eventet?`, () => removeParticipant(participant.id, "Admin"))}>Fjern fra event</SmallButton>
              </AdminCard>
            )) : <Empty text="Ingen deltagere registreret." />}
          </DataPanel>
          <DataPanel title="Driverprofiler">
            {allDrivers.map((driver) => (
              <CompactRow key={driver.id} title={driver.name} meta={`${driver.darklightId} · ${driver.favoriteVehicle}`} />
            ))}
          </DataPanel>
        </div>
      ) : null}

      {activeTab === "results" ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
          <DataPanel title="Resultatstatus">
            <CompactRow title="Afventer" meta={String(pendingResults.length)} />
            <CompactRow title="Godkendte" meta={String(approvedResults.length)} />
            <CompactRow title="Afviste" meta={String(rejectedResults.length)} />
            {editingResultId ? (
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-black p-4">
                <Input label="Point" type="number" value={String(resultTotal)} onChange={(value) => setResultTotal(Number(value))} />
                <Input label="Note" value={resultNote} onChange={setResultNote} />
                <button type="button" onClick={saveResultEdit} className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300">
                  Gem resultat
                </button>
              </div>
            ) : null}
          </DataPanel>
          <DataPanel title="Alle resultater">
            {results.length > 0 ? results.map((result) => (
              <AdminCard key={result.id} title={`${result.id} · ${getDriverName(result.driverId)}`} meta={`${result.status} · ${result.eventId} · ${result.total} point`}>
                <SmallButton onClick={() => approveResult(result.id)}>Godkend</SmallButton>
                <SmallButton onClick={() => rejectResult(result.id)}>Afvis</SmallButton>
                <SmallButton onClick={() => startResultEdit(result.id)}>Rediger</SmallButton>
                <SmallButton danger onClick={() => requestConfirm(`Slet resultat ${result.id}?`, () => deleteResult(result.id))}>Slet</SmallButton>
              </AdminCard>
            )) : <Empty text="Ingen resultater endnu." />}
          </DataPanel>
        </div>
      ) : null}

      {activeTab === "inbox" ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <DataPanel title="Bookinger">
            {bookings.length > 0 ? bookings.map((booking) => (
              <AdminCard key={booking.id} title={booking.characterName || "Ukendt karakter"} meta={`${booking.status ?? "Afventer"} · ${booking.eventType ?? "Event"} · ${booking.desiredDate ?? "Ingen dato"}`}>
                {(["Afventer", "Godkendt", "Afvist", "Arkiveret"] as BookingStatus[]).map((status) => <SmallButton key={status} onClick={() => updateBookingStatus(booking.id, status)}>{status}</SmallButton>)}
                <SmallButton danger onClick={() => requestConfirm(`Slet booking ${booking.id}?`, () => deleteBooking(booking.id))}>Slet</SmallButton>
              </AdminCard>
            )) : <Empty text="Ingen bookings gemt endnu." />}
          </DataPanel>
          <DataPanel title="Kontaktbeskeder">
            {contacts.length > 0 ? contacts.map((contact) => (
              <AdminCard key={contact.id} title={contact.subject || "Uden emne"} meta={`${contact.status ?? "Ny"} · ${contact.characterName || "Ukendt"} · ${contact.ingamePhone || "Ingen telefon"}`}>
                {(["Ny", "Læst", "Besvaret", "Arkiveret"] as ContactStatus[]).map((status) => <SmallButton key={status} onClick={() => updateContactStatus(contact.id, status)}>{status}</SmallButton>)}
                <SmallButton danger onClick={() => requestConfirm(`Slet kontaktbesked ${contact.id}?`, () => deleteContact(contact.id))}>Slet</SmallButton>
              </AdminCard>
            )) : <Empty text="Ingen kontaktbeskeder gemt endnu." />}
          </DataPanel>
        </div>
      ) : null}

      {activeTab === "partners" ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <DataPanel title="Sponsor Manager">
            <Input label="Navn" value={sponsorDraft.name} onChange={(value) => setSponsorDraft((current) => ({ ...current, name: value }))} />
            <div className="grid gap-3 md:grid-cols-2">
              <Select label="Niveau" value={sponsorDraft.level} onChange={(value) => setSponsorDraft((current) => ({ ...current, level: value as SponsorLevel }))}>
                {(["Platinum", "Gold", "Silver", "Partner"] as SponsorLevel[]).map((level) => <option key={level}>{level}</option>)}
              </Select>
              <Select label="Status" value={sponsorDraft.status} onChange={(value) => setSponsorDraft((current) => ({ ...current, status: value as Sponsor["status"] }))}>
                {(["Aktiv", "Afventer", "Arkiveret"] as Sponsor["status"][]).map((status) => <option key={status}>{status}</option>)}
              </Select>
              <Input label="Initialer" value={sponsorDraft.logoInitials} onChange={(value) => setSponsorDraft((current) => ({ ...current, logoInitials: value }))} />
              <Input label="Logo URL" value={sponsorDraft.logoUrl ?? ""} onChange={(value) => setSponsorDraft((current) => ({ ...current, logoUrl: value }))} />
              <Input label="RP kontaktperson" value={sponsorDraft.contactPerson} onChange={(value) => setSponsorDraft((current) => ({ ...current, contactPerson: value }))} />
              <Input label="Events" value={sponsorDraft.eventsSupported.join(", ")} onChange={(value) => setSponsorDraft((current) => ({ ...current, eventsSupported: value.split(",").map((item) => item.trim()).filter(Boolean) }))} />
            </div>
            <Input label="Beskrivelse" value={sponsorDraft.description} onChange={(value) => setSponsorDraft((current) => ({ ...current, description: value }))} />
            <button type="button" onClick={saveSponsor} className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300">Gem sponsor</button>
          </DataPanel>
          <DataPanel title="Tilladelses Manager">
            <Input label="Event" value={permissionDraft.event} onChange={(value) => setPermissionDraft((current) => ({ ...current, event: value }))} />
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Lokation" value={permissionDraft.location} onChange={(value) => setPermissionDraft((current) => ({ ...current, location: value }))} />
              <Select label="Status" value={permissionDraft.status} onChange={(value) => setPermissionDraft((current) => ({ ...current, status: value as PermissionStatus }))}>
                {(["Godkendt", "Afventer", "Afvist", "Arkiveret"] as PermissionStatus[]).map((status) => <option key={status}>{status}</option>)}
              </Select>
              <Input label="Myndighed" value={permissionDraft.authority} onChange={(value) => setPermissionDraft((current) => ({ ...current, authority: value }))} />
              <Input label="Dato" type="date" value={permissionDraft.date} onChange={(value) => setPermissionDraft((current) => ({ ...current, date: value }))} />
            </div>
            <Input label="Kommentar" value={permissionDraft.comment} onChange={(value) => setPermissionDraft((current) => ({ ...current, comment: value }))} />
            <button type="button" onClick={savePermission} className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300">Gem tilladelse</button>
          </DataPanel>
          <DataPanel title="Sponsorer">
            {localSponsors.map((sponsor) => (
              <AdminCard key={sponsor.id} title={sponsor.name} meta={`${sponsor.level} · ${sponsor.status}`}>
                <SmallButton onClick={() => setSponsorDraft(sponsor)}>Rediger</SmallButton>
                <SmallButton onClick={() => archiveLocalItem(localSponsors, sponsor.id, EVENTOS_ADMIN_SPONSOR_STORAGE_KEY, setLocalSponsors)}>Arkiver</SmallButton>
                <SmallButton danger onClick={() => requestConfirm(`Fjern sponsor "${sponsor.name}"?`, () => removeLocalItem(localSponsors, sponsor.id, EVENTOS_ADMIN_SPONSOR_STORAGE_KEY, setLocalSponsors))}>Fjern</SmallButton>
              </AdminCard>
            ))}
          </DataPanel>
          <DataPanel title="Tilladelser">
            {localPermissions.map((permission) => (
              <AdminCard key={permission.id} title={permission.event} meta={`${permission.status} · ${permission.location} · ${permission.authority}`}>
                <SmallButton onClick={() => setPermissionDraft(permission)}>Rediger</SmallButton>
                <SmallButton onClick={() => archiveLocalItem(localPermissions, permission.id, EVENTOS_ADMIN_PERMISSION_STORAGE_KEY, setLocalPermissions)}>Arkiver</SmallButton>
                <SmallButton danger onClick={() => requestConfirm(`Fjern tilladelse "${permission.event}"?`, () => removeLocalItem(localPermissions, permission.id, EVENTOS_ADMIN_PERMISSION_STORAGE_KEY, setLocalPermissions))}>Fjern</SmallButton>
              </AdminCard>
            ))}
          </DataPanel>
        </div>
      ) : null}

      {activeTab === "media" ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
          <DataPanel title="Galleri Manager">
            <Input label="Titel" value={galleryDraft.title} onChange={(value) => setGalleryDraft((current) => ({ ...current, title: value }))} />
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Kategori" value={galleryDraft.category} onChange={(value) => setGalleryDraft((current) => ({ ...current, category: value as GalleryItem["category"] }))} />
              <Input label="Event" value={galleryDraft.eventRef} onChange={(value) => setGalleryDraft((current) => ({ ...current, eventRef: value }))} />
              <Input label="Dato" type="date" value={galleryDraft.date} onChange={(value) => setGalleryDraft((current) => ({ ...current, date: value }))} />
              <Input label="Billede URL" value={galleryDraft.image} onChange={(value) => setGalleryDraft((current) => ({ ...current, image: value }))} />
            </div>
            <Input label="Beskrivelse" value={galleryDraft.description} onChange={(value) => setGalleryDraft((current) => ({ ...current, description: value }))} />
            <button type="button" onClick={saveGalleryItem} className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300">Gem billede</button>
          </DataPanel>
          <DataPanel title="Galleri">
            {localGallery.map((item) => (
              <AdminCard key={item.id} title={item.title} meta={`${item.category} · ${item.eventRef} · ${item.date}`}>
                <SmallButton onClick={() => setGalleryDraft(item)}>Rediger</SmallButton>
                <SmallButton danger onClick={() => requestConfirm(`Fjern galleri-element "${item.title}"?`, () => removeLocalItem(localGallery, item.id, EVENTOS_ADMIN_GALLERY_STORAGE_KEY, setLocalGallery))}>Fjern</SmallButton>
              </AdminCard>
            ))}
          </DataPanel>
        </div>
      ) : null}

      {activeTab === "logs" ? (
        <DataPanel title="EventOS logs">
          {logs.length > 0 ? logs.map((log) => <CompactRow key={log.id} title={`${log.time} · ${log.category}`} meta={log.message} />) : <Empty text="Ingen logs endnu." />}
        </DataPanel>
      ) : null}

      {activeTab === "io" ? (
        <div className="mt-6 grid gap-4">
          <textarea value={importText} onChange={(event) => setImportText(event.target.value)} className="min-h-80 rounded-2xl border border-white/10 bg-black px-4 py-3 font-mono text-xs text-zinc-200 outline-none transition focus:border-white" />
          <p className="text-sm leading-6 text-zinc-500">Eksport indeholder EventOS-state, bookinger, kontaktbeskeder, sponsorer, tilladelser og galleri. Import af EventOS-state kræver genindlæsning for at alle views får ny state.</p>
        </div>
      ) : null}
    </section>
  );
}

function getDriverName(driverId: string, driverList = drivers) {
  return driverList.find((driver) => driver.id === driverId)?.name ?? driverId;
}

function AdminStat({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      {detail ? <p className="mt-1 text-sm text-zinc-500">{detail}</p> : null}
    </div>
  );
}

function DataPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/40 p-5">
      <h3 className="mb-4 text-xl font-black">{title}</h3>
      <div className="grid max-h-[620px] gap-3 overflow-auto pr-1">{children}</div>
    </div>
  );
}

function AdminCard({ title, meta, children }: { title: string; meta: string; children: ReactNode }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{meta}</p>
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </article>
  );
}

function CompactRow({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{meta}</p>
    </div>
  );
}

function SmallButton({ children, onClick, danger }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-black transition ${
        danger ? "border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500 hover:text-white" : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white" />
    </label>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white">
        {children}
      </select>
    </label>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-white/10 bg-black p-5 text-sm font-bold text-zinc-500">{text}</p>;
}

