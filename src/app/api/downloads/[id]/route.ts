import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { downloads, folders } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  isFavorite: z.boolean().optional(),
  folderId: z.string().nullable().optional(),
  status: z.enum(["queued", "processing", "completed"]).optional(),
});

async function findOwnedDownload(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(downloads)
    .where(and(eq(downloads.id, id), eq(downloads.userId, userId)))
    .limit(1);
  return row;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await findOwnedDownload(user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 },
    );
  }

  const { title, isFavorite, folderId, status } = parsed.data;

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

  const [updated] = await db
    .update(downloads)
    .set({
      ...(title !== undefined ? { title } : {}),
      ...(isFavorite !== undefined ? { isFavorite } : {}),
      ...(folderId !== undefined ? { folderId: folderId || null } : {}),
      ...(status !== undefined
        ? { status, progress: status === "completed" ? 100 : undefined }
        : {}),
    })
    .where(and(eq(downloads.id, id), eq(downloads.userId, user.id)))
    .returning();

  return NextResponse.json({ download: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await findOwnedDownload(user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });
  }

  await db.delete(downloads).where(and(eq(downloads.id, id), eq(downloads.userId, user.id)));

  return NextResponse.json({ ok: true });
}
