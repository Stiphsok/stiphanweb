import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { folders } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  color: z.string().trim().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 },
    );
  }

  const [existing] = await db
    .select({ id: folders.id })
    .from(folders)
    .where(and(eq(folders.id, id), eq(folders.userId, user.id)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "المجلد غير موجود" }, { status: 404 });
  }

  const [updated] = await db
    .update(folders)
    .set(parsed.data)
    .where(and(eq(folders.id, id), eq(folders.userId, user.id)))
    .returning();

  return NextResponse.json({ folder: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { id } = await params;

  const [existing] = await db
    .select({ id: folders.id })
    .from(folders)
    .where(and(eq(folders.id, id), eq(folders.userId, user.id)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "المجلد غير موجود" }, { status: 404 });
  }

  await db.delete(folders).where(and(eq(folders.id, id), eq(folders.userId, user.id)));

  return NextResponse.json({ ok: true });
}
