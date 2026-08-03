"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { formatTimingMs } from "@/lib/timing/timing";

type ClockProps = {
  startedAt: string | null;
  elapsedMs?: number | null;
  running?: boolean;
  serverNow: string;
  className?: string;
};

export function TimingClock({ startedAt, elapsedMs, running = false, serverNow, className = "" }: ClockProps) {
  const [now, setNow] = useState(() => new Date(serverNow).getTime());

  useEffect(() => {
    if (!running || !startedAt) return;
    const offset = new Date(serverNow).getTime() - Date.now();
    const timer = window.setInterval(() => setNow(Date.now() + offset), 75);
    return () => window.clearInterval(timer);
  }, [running, serverNow, startedAt]);

  const value = elapsedMs ?? (startedAt && running ? Math.max(0, now - new Date(startedAt).getTime()) : 0);
  return <span className={`font-mono tabular-nums ${className}`}>{formatTimingMs(value)}</span>;
}

export function TimingConnection({ active }: { active: boolean }) {
  const router = useRouter();
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    if (!active) return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
    const timer = window.setInterval(() => {
      if (navigator.onLine) {
        router.refresh();
        setLastSync(new Date());
      }
    }, 3000);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [active, router]);

  return (
    <span className={`text-xs font-bold ${online ? "text-emerald-400" : "text-amber-400"}`}>
      {online ? "Forbundet" : "Genopretter"}{lastSync ? ` · Sidst synkroniseret ${lastSync.toLocaleTimeString("da-DK")}` : ""}
    </span>
  );
}

export function TimingSubmitButton({ children, disabled = false, className = "" }: { children: React.ReactNode; disabled?: boolean; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={disabled || pending} className={`${className} disabled:cursor-not-allowed disabled:opacity-40`}>
      {pending ? "Arbejder…" : children}
    </button>
  );
}
