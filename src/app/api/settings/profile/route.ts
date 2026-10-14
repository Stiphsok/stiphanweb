import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, toSafeUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(60),
  avatarColor: z.string().trim().min(1),
});

export async function PATCH(request: Request) {
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

  const [updated] = await db
    .update(users)
    .set({ name: parsed.data.name, avatarColor: parsed.data.avatarColor })
    .where(eq(users.id, user.id))
    .returning();

  return NextResponse.json({ user: toSafeUser(updated) });
}
