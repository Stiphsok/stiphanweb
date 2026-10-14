import { NextResponse } from "next/server";
import { db } from "@/db";
import { downloads } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { estimateFileSizeMb, resolveVideoMeta } from "@/lib/video-meta";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { id } = await params;

  const [existing] = await db
    .select()
    .from(downloads)
    .where(and(eq(downloads.id, id), eq(downloads.userId, user.id)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });
  }

  const { meta } = await resolveVideoMeta(existing.sourceUrl);
  const fileSizeMb = estimateFileSizeMb(meta.durationSeconds, existing.quality, existing.format);

  const [updated] = await db
    .update(downloads)
    .set({
      status: "completed",
      progress: 100,
      errorMessage: null,
      title: existing.title,
      fileSizeMb,
      completedAt: new Date(),
    })
    .where(and(eq(downloads.id, id), eq(downloads.userId, user.id)))
    .returning();

  return NextResponse.json({ download: updated });
}
