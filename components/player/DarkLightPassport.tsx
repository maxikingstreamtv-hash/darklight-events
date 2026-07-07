type DarkLightPassportProps = {
  characterName: string;
  darklightId: string;
  role?: string;
  status?: string;
  phone?: string;
  crewAccess?: boolean;
};

export default function DarkLightPassport({
  characterName,
  darklightId,
  role = "Kører",
  status = "Aktiv",
  phone,
  crewAccess = false,
}: DarkLightPassportProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-white/[0.06]" />
      <div className="relative flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">DarkLight Passport</p>
          <h2 className="mt-3 text-3xl font-black text-white">{characterName}</h2>
          <p className="mt-2 text-sm font-black text-zinc-300">{darklightId}</p>
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black text-xl font-black">
          {characterName
            .split(" ")
            .map((part) => part.charAt(0))
            .join("")
            .slice(0, 2)}
        </div>
      </div>

      <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
        <Info label="Rolle" value={role} />
        <Info label="Status" value={status} />
        <Info label="Ingame phone" value={phone || "Ikke angivet"} />
        <Info label="EventOS" value={crewAccess ? "Staff adgang" : "Spilleradgang"} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>
  );
}

