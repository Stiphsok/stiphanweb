import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users, folders, downloads } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";
import { setSessionCookie, toSafeUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(60),
  email: z.string().trim().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

const AVATAR_COLORS = ["#6d5efc", "#f5497e", "#0ea5a5", "#f59e0b", "#3b82f6"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: "هذا البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const [user] = await db
    .insert(users)
    .values({ name, email: normalizedEmail, passwordHash, avatarColor })
    .returning();

  const [folder] = await db
    .insert(folders)
    .values({ userId: user.id, name: "المفضلة", color: "#f5497e" })
    .returning();

  await db.insert(downloads).values({
    userId: user.id,
    folderId: folder.id,
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    platform: "youtube",
    title: "مرحبًا بك في تحميل 🎉 - فيديو تجريبي",
    author: "فريق تحميل",
    thumbnailUrl: "https://picsum.photos/seed/tahmil-welcome/480/270",
    durationSeconds: 212,
    quality: "1080p",
    format: "mp4",
    fileSizeMb: 48.6,
    status: "completed",
    progress: 100,
    isFavorite: true,
    completedAt: new Date(),
  });

  await setSessionCookie(user.id);

  return NextResponse.json({ user: toSafeUser(user) }, { status: 201 });
}
