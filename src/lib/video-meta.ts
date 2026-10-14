import "server-only";
import { detectPlatform, type Platform } from "@/lib/platform";
import { getVideoInfo } from "@/lib/yt-dlp";

export type VideoMeta = { title: string; author: string; thumbnailUrl: string; durationSeconds: number };

export async function resolveVideoMeta(sourceUrl: string): Promise<{ platform: Platform; meta: VideoMeta }> {
  const platform = detectPlatform(sourceUrl);
  try {
    const info = await getVideoInfo(sourceUrl);
    return {
      platform,
      meta: {
        title: info.title || "فيديو",
        author: info.uploader || info.channel || "",
        thumbnailUrl: info.thumbnail || "",
        durationSeconds: Math.max(0, Math.round(info.duration || 0)),
      },
    };
  } catch {
    return { platform, meta: { title: "فيديو", author: "", thumbnailUrl: "", durationSeconds: 0 } };
  }
}

export function estimateFileSizeMb(durationSeconds: number, quality: string, format: string) {
  const bitrateMbps: Record<string, number> = { "360p": 0.7, "480p": 1.2, "720p": 2.5, "1080p": 5 };
  if (format === "mp3") return Number(((durationSeconds * 128) / 8 / 1024).toFixed(1));
  return Number((((durationSeconds * (bitrateMbps[quality] ?? 2.5)) / 8)).toFixed(1));
}
