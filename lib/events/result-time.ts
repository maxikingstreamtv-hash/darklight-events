const TIME_FORMAT_ERROR = "Indtast tiden som SS, MM:SS eller HH:MM:SS.";

export function parseResultTime(value: string | null | undefined): number | null {
  const input = value?.trim() ?? "";
  if (!input) return null;
  if (input.startsWith("-")) throw new Error("Tid må ikke være negativ.");

  const parts = input.split(":");
  if (parts.length < 1 || parts.length > 3 || parts.some((part) => part === "")) throw new Error(TIME_FORMAT_ERROR);
  const secondsPart = parts.at(-1);
  if (!secondsPart || !/^\d+(?:[.,]\d{1,3})?$/.test(secondsPart)) throw new Error(TIME_FORMAT_ERROR);
  const wholeParts = parts.slice(0, -1);
  if (wholeParts.some((part) => !/^\d+$/.test(part))) throw new Error(TIME_FORMAT_ERROR);

  const seconds = Number(secondsPart.replace(",", "."));
  const minutes = parts.length >= 2 ? Number(parts.at(-2)) : 0;
  const hours = parts.length === 3 ? Number(parts[0]) : 0;
  if (!Number.isFinite(seconds) || seconds >= 60 || (parts.length === 3 && minutes >= 60)) throw new Error(TIME_FORMAT_ERROR);

  const milliseconds = Math.round(((hours * 3600) + (minutes * 60) + seconds) * 1000);
  if (!Number.isSafeInteger(milliseconds) || milliseconds < 0) throw new Error("Tid må ikke være negativ.");
  return milliseconds;
}

export function formatResultTime(milliseconds: number | null | undefined): string | null {
  if (milliseconds == null || !Number.isFinite(milliseconds) || milliseconds < 0) return null;
  const total = Math.round(milliseconds);
  const hours = Math.floor(total / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  const fraction = total % 1000;
  const secondsText = `${String(seconds).padStart(2, "0")}${fraction ? `.${String(fraction).padStart(3, "0")}` : ""}`;
  if (hours > 0) return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${secondsText}`;
  return `${String(minutes).padStart(2, "0")}:${secondsText}`;
}

export function getResultDisplayValues(result: { placement: number; points: number | null; finishTimeMs: number | null }) {
  return [
    ...(result.placement > 0 ? [{ label: "Placering", value: String(result.placement) }] : []),
    ...(result.finishTimeMs != null ? [{ label: "Tid", value: formatResultTime(result.finishTimeMs) ?? "" }] : []),
    ...(result.points != null ? [{ label: "Point", value: String(result.points) }] : []),
  ];
}
