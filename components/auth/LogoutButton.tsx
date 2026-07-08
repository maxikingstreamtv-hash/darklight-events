"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-full border border-white/15 px-6 py-3 font-black text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-black"
    >
      Log ud
    </button>
  );
}
