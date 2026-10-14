import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { downloads, folders } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: folders.id,
      name: folders.name,
      color: folders.color,
      createdAt: folders.createdAt,
      downloadsCount: count(downloads.id),
    })
    .from(folders)
    .leftJoin(downloads, eq(downloads.folderId, folders.id))
    .where(eq(folders.userId, user.id))
    .groupBy(folders.id)
    .orderBy(folders.createdAt);

  return NextResponse.json({ folders: rows });
}

const schema = z.object({
  name: z.string().trim().min(1, "اسم المجلد مطلوب").max(60),
  color: z.string().trim().default("#6d5efc"),
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

  const [created] = await db
    .insert(folders)
    .values({ userId: user.id, name: parsed.data.name, color: parsed.data.color })
    .returning();

  return NextResponse.json({ folder: { ...created, downloadsCount: 0 } }, { status: 201 });
}
