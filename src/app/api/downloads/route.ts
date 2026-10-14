import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { downloads, folders } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { isValidUrl } from "@/lib/platform";
import { estimateFileSizeMb, resolveVideoMeta } from "@/lib/video-meta";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(downloads)
    .where(eq(downloads.userId, user.id))
    .orderBy(desc(downloads.createdAt));

  return NextResponse.json({ downloads: rows });
}

const schema = z.object({
  url: z.string().trim().min(1, "الرابط مطلوب"),
  quality: z.enum(["360p", "480p", "720p", "1080p", "4k"]).default("720p"),
  format: z.enum(["mp4", "mp3"]).default("mp4"),
  folderId: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 },
    );
  }

  const { url, quality, format, folderId } = parsed.data;

  if (!isValidUrl(url)) {
    return NextResponse.json({ error: "الرجاء إدخال رابط صحيح يبدأ بـ http أو https" }, { status: 400 });
  }

  if (folderId) {
    const [folder] = await db
      .select({ id: folders.id })
      .from(folders)
      .where(and(eq(folders.id, folderId), eq(folders.userId, user.id)))
      .limit(1);
    if (!folder) {
      return NextResponse.json({ error: "المجلد غير موجود" }, { status: 404 });
    }
  }

  const { platform, meta } = await resolveVideoMeta(url);
  const fileSizeMb = estimateFileSizeMb(meta.durationSeconds, quality, format);

  // Simulate a rare failure for realism (e.g. private/unavailable video)
  const willFail = Math.random() < 0.06;

  const [created] = await db
    .insert(downloads)
    .values({
      userId: user.id,
      folderId: folderId || null,
      sourceUrl: url,
      platform,
      title: meta.title,
      author: meta.author,
      thumbnailUrl: meta.thumbnailUrl,
      durationSeconds: meta.durationSeconds,
      quality,
      format,
      fileSizeMb,
      status: willFail ? "failed" : "completed",
      progress: willFail ? 0 : 100,
      errorMessage: willFail ? "تعذر جلب الفيديو، قد يكون خاصًا أو محذوفًا" : null,
      completedAt: willFail ? null : new Date(),
    })
    .returning();

  return NextResponse.json({ download: created }, { status: 201 });
}
