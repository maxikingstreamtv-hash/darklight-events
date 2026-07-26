"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { eventImageFitClass, eventImageObjectPosition, getRenderableEventImageUrl } from "@/lib/events/event-images";

export default function EventImage({
  src,
  alt,
  className = "",
  variant = "card",
  focusX = 50,
  focusY = 50,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  variant?: "banner" | "card";
  focusX?: number;
  focusY?: number;
}) {
  const [failed, setFailed] = useState(false);
  const renderableSrc = getRenderableEventImageUrl(src);
  if (!renderableSrc || failed) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_55%)] p-6 text-center ${className}`}>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-zinc-600">DarkLight</p>
          <p className="mt-2 text-lg font-black text-zinc-300">Events</p>
        </div>
      </div>
    );
  }
  return (
    <img
      src={renderableSrc}
      alt={alt}
      className={`block h-full w-full rounded-[inherit] ${eventImageFitClass(variant)} ${className}`}
      style={variant === "card" ? { objectPosition: eventImageObjectPosition(focusX, focusY) } : undefined}
      onError={() => setFailed(true)}
    />
  );
}
