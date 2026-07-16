"use client";

import { useState } from "react";
import { updateOwnProfileAction } from "@/app/profile/actions";

export default function ProfileEditForm({
  initialBio,
  initialAvatar,
  displayName,
}: {
  initialBio: string;
  initialAvatar: string;
  displayName: string;
}) {
  const [avatar, setAvatar] = useState(initialAvatar);

  return (
    <form action={updateOwnProfileAction} className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <AvatarPreview avatar={avatar} displayName={displayName} />
        <div className="grid flex-1 gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-zinc-500">Rediger profil</p>
            <h2 className="mt-3 text-3xl font-black">Bio og avatar</h2>
            <p className="mt-2 text-sm text-zinc-400">Du kan kun ændre bio og avatar her. Roller, badges og DarkLight ID styres af staff.</p>
          </div>
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Avatar URL</span>
            <input
              name="avatar"
              value={avatar}
              onChange={(event) => setAvatar(event.target.value)}
              placeholder="https://..."
              className="field"
            />
          </label>
          <button
            type="button"
            onClick={() => setAvatar("")}
            className="w-fit rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black"
          >
            Fjern avatar
          </button>
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Bio</span>
            <textarea
              name="bio"
              defaultValue={initialBio}
              maxLength={800}
              rows={5}
              className="field"
              placeholder="Fortæl kort om din RP-karakter eller eventstil."
            />
          </label>
          <button className="w-fit rounded-full bg-white px-7 py-3 font-black text-black transition hover:bg-zinc-300">
            Gem profil
          </button>
        </div>
      </div>
    </form>
  );
}

function AvatarPreview({ avatar, displayName }: { avatar: string; displayName: string }) {
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatar) {
    return (
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-neutral-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} alt={`${displayName} avatar`} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-neutral-950 text-3xl font-black text-white">
      {initials}
    </div>
  );
}
