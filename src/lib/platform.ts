export type Platform = "youtube" | "facebook" | "instagram" | "tiktok" | "other";
export type DownloadStatus = "queued" | "processing" | "completed" | "failed";
export type MediaFormat = "mp4" | "mp3";

export const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: "يوتيوب",
  facebook: "فيسبوك",
  instagram: "إنستغرام",
  tiktok: "تيك توك",
  other: "منصة أخرى",
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  youtube: "#FF0000",
  facebook: "#1877F2",
  instagram: "#E1306C",
  tiktok: "#000000",
  other: "#6d5efc",
};

export const STATUS_LABELS: Record<DownloadStatus, string> = {
  queued: "في الانتظار",
  processing: "جاري المعالجة",
  completed: "مكتمل",
  failed: "فشل",
};

export function detectPlatform(url: string): Platform {
  const normalized = url.toLowerCase();
  if (normalized.includes("youtube.com") || normalized.includes("youtu.be")) {
    return "youtube";
  }
  if (normalized.includes("facebook.com") || normalized.includes("fb.watch")) {
    return "facebook";
  }
  if (normalized.includes("instagram.com")) {
    return "instagram";
  }
  if (normalized.includes("tiktok.com")) {
    return "tiktok";
  }
  return "other";
}

export function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function formatFileSize(mb: number) {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
}

export function formatRelativeTime(date: Date | string) {
  const target = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - target.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];
  const rtf = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });
  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffSec) >= secondsInUnit || unit === "second") {
      const value = Math.round(diffSec / secondsInUnit);
      return rtf.format(-value, unit);
    }
  }
  return rtf.format(0, "second");
}
