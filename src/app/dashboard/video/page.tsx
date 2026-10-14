import { db } from "@/db";
import { downloads } from "@/db/schema";
import { desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { eq as drizzleEq } from "drizzle-orm";
import PageHeader from "@/components/page-header";
import QualityClient from "@/components/quality-client";
import { resolveVideoMeta, estimateFileSizeMb } from "@/lib/video-meta";
import type { Download } from "@/db/schema";

export const dynamic = "force-dynamic";

const QUALITIES = ["1080p", "720p", "480p", "360p"] as const;

export default async function VideoPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; id?: string }>;
}) {
  const user = await getCurrentUser();

  const params = await searchParams;

  let existing: Download | null = null;
  if (params.id) {
    const [row] = await db
      .select()
      .from(downloads)
      .where(drizzleEq(downloads.id, params.id))
      .limit(1);
    if (!row || !user || row.userId !== user.id) notFound();
    existing = row;
  }

  let meta = {
    url: existing?.sourceUrl ?? "",
    title: existing?.title ?? "",
    author: existing?.author ?? "",
    thumbnailUrl: existing?.thumbnailUrl ?? "",
    durationSeconds: existing?.durationSeconds ?? 0,
    views: "",
  };

  if (!existing && params.url) {
    const resolved = await resolveVideoMeta(params.url);
    meta = {
      url: params.url,
      title: resolved.meta.title,
      author: resolved.meta.author,
      thumbnailUrl: resolved.meta.thumbnailUrl,
      durationSeconds: resolved.meta.durationSeconds,
      views: "",
    };
  }

  if (!meta.url) notFound();

  const folderRows = user
    ? await db.select({ id: downloads.id }).from(downloads).where(drizzleEq(downloads.userId, user.id)).limit(1)
    : [];

  const options = QUALITIES.map((quality) => ({
    quality,
    label: `MP4 - ${quality}${quality === "1080p" ? " (Full HD)" : quality === "720p" ? " (HD)" : ""}`,
    sizeMb: Number(estimateFileSizeMb(meta.durationSeconds, quality, "mp4").toFixed(0)),
  }));
  options.push({
    quality: "mp3" as (typeof QUALITIES)[number],
    label: "صوت فقط MP3",
    sizeMb: Number(estimateFileSizeMb(meta.durationSeconds, "720p", "mp3").toFixed(0)),
  });

  return (
    <div className="min-h-screen">
      <PageHeader showBack title="" right={<span />} />

      <div className="px-4 pt-4">
        <QualityClient
          url={meta.url}
          title={meta.title}
          author={meta.author}
          thumbnailUrl={meta.thumbnailUrl}
          durationSeconds={meta.durationSeconds}
          options={options}
          folderId={folderRows.length ? existing?.folderId ?? null : null}
        />
      </div>
    </div>
  );
}
