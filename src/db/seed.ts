import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "@/db";
import { users, folders, downloads } from "@/db/schema";

const DEMO_EMAIL = "demo@tahmil.app";

function daysAgo(days: number, hours = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  return date;
}

async function main() {
  console.log("🌱 Seeding database...");

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, DEMO_EMAIL));
  if (existing) {
    console.log("↺ Removing previous demo account...");
    await db.delete(users).where(eq(users.id, existing.id));
  }

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const [demoUser] = await db
    .insert(users)
    .values({
      name: "سارة أحمد",
      email: DEMO_EMAIL,
      passwordHash,
      avatarColor: "#6d5efc",
      plan: "مميز",
      createdAt: daysAgo(60),
    })
    .returning();

  console.log(`✓ Created demo user: ${demoUser.email}`);

  const [favFolder] = await db
    .insert(folders)
    .values({ userId: demoUser.id, name: "المفضلة", color: "#f5497e", createdAt: daysAgo(55) })
    .returning();
  const [musicFolder] = await db
    .insert(folders)
    .values({ userId: demoUser.id, name: "موسيقى وصوتيات", color: "#0ea5a5", createdAt: daysAgo(40) })
    .returning();
  const [tutorialsFolder] = await db
    .insert(folders)
    .values({ userId: demoUser.id, name: "دروس تعليمية", color: "#3b82f6", createdAt: daysAgo(30) })
    .returning();
  const [funnyFolder] = await db
    .insert(folders)
    .values({ userId: demoUser.id, name: "مقاطع مضحكة", color: "#f59e0b", createdAt: daysAgo(20) })
    .returning();

  console.log("✓ Created folders");

  const demoDownloads = [
    {
      sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      platform: "youtube" as const,
      title: "أفضل 10 نصائح للبرمجة في 2026",
      author: "قناة التقنية",
      thumbnailUrl: "https://picsum.photos/seed/tahmil-1/480/270",
      durationSeconds: 612,
      quality: "1080p",
      format: "mp4" as const,
      fileSizeMb: 142.5,
      status: "completed" as const,
      progress: 100,
      isFavorite: true,
      folderId: tutorialsFolder.id,
      createdAt: daysAgo(1, 3),
      completedAt: daysAgo(1, 3),
    },
    {
      sourceUrl: "https://www.tiktok.com/@user/video/7123456789",
      platform: "tiktok" as const,
      title: "تحدي جديد فيرال 🔥",
      author: "@fun.clips",
      thumbnailUrl: "https://picsum.photos/seed/tahmil-2/480/270",
      durationSeconds: 34,
      quality: "720p",
      format: "mp4" as const,
      fileSizeMb: 8.4,
      status: "completed" as const,
      progress: 100,
      isFavorite: true,
      folderId: funnyFolder.id,
      createdAt: daysAgo(2, 5),
      completedAt: daysAgo(2, 5),
    },
    {
      sourceUrl: "https://www.instagram.com/reel/CxAmpleReel",
      platform: "instagram" as const,
      title: "reel: يوم في حياتي 🌸",
      author: "@lama.style",
      thumbnailUrl: "https://picsum.photos/seed/tahmil-3/480/270",
      durationSeconds: 58,
      quality: "1080p",
      format: "mp4" as const,
      fileSizeMb: 21.7,
      status: "completed" as const,
      progress: 100,
      isFavorite: false,
      folderId: favFolder.id,
      createdAt: daysAgo(3, 1),
      completedAt: daysAgo(3, 1),
    },
    {
      sourceUrl: "https://www.facebook.com/watch/?v=1234567890",
      platform: "facebook" as const,
      title: "لحظات مؤثرة من حفل التخرج",
      author: "صفحة الأخبار اليومية",
      thumbnailUrl: "https://picsum.photos/seed/tahmil-4/480/270",
      durationSeconds: 245,
      quality: "720p",
      format: "mp4" as const,
      fileSizeMb: 63.2,
      status: "completed" as const,
      progress: 100,
      isFavorite: false,
      folderId: null,
      createdAt: daysAgo(4, 8),
      completedAt: daysAgo(4, 8),
    },
    {
      sourceUrl: "https://www.youtube.com/watch?v=abcd1234",
      platform: "youtube" as const,
      title: "بودكاست: كيف تبدأ مشروعك الخاص",
      author: "أكاديمية البرمجة",
      thumbnailUrl: "https://picsum.photos/seed/tahmil-5/480/270",
      durationSeconds: 1830,
      quality: "720p",
      format: "mp3" as const,
      fileSizeMb: 33.6,
      status: "completed" as const,
      progress: 100,
      isFavorite: true,
      folderId: musicFolder.id,
      createdAt: daysAgo(5, 2),
      completedAt: daysAgo(5, 2),
    },
    {
      sourceUrl: "https://www.tiktok.com/@user/video/7998877665",
      platform: "tiktok" as const,
      title: "خدعة مطبخ توفر عليك الوقت",
      author: "@chef.sara",
      thumbnailUrl: "https://picsum.photos/seed/tahmil-6/480/270",
      durationSeconds: 47,
      quality: "480p",
      format: "mp4" as const,
      fileSizeMb: 6.1,
      status: "failed" as const,
      progress: 0,
      isFavorite: false,
      errorMessage: "تعذر جلب الفيديو، قد يكون خاصًا أو محذوفًا",
      folderId: null,
      createdAt: daysAgo(6, 4),
      completedAt: null,
    },
    {
      sourceUrl: "https://www.instagram.com/reel/AnotherReel",
      platform: "instagram" as const,
      title: "وصفة حلى سريعة 🍰",
      author: "@fit.with.omar",
      thumbnailUrl: "https://picsum.photos/seed/tahmil-7/480/270",
      durationSeconds: 72,
      quality: "1080p",
      format: "mp4" as const,
      fileSizeMb: 27.9,
      status: "completed" as const,
      progress: 100,
      isFavorite: false,
      folderId: null,
      createdAt: daysAgo(7, 1),
      completedAt: daysAgo(7, 1),
    },
    {
      sourceUrl: "https://www.youtube.com/watch?v=xyz98765",
      platform: "youtube" as const,
      title: "مراجعة شاملة لأقوى لابتوب لعام 2026",
      author: "عالم الطبخ",
      thumbnailUrl: "https://picsum.photos/seed/tahmil-8/480/270",
      durationSeconds: 921,
      quality: "4k",
      format: "mp4" as const,
      fileSizeMb: 512.4,
      status: "completed" as const,
      progress: 100,
      isFavorite: true,
      folderId: tutorialsFolder.id,
      createdAt: daysAgo(9, 6),
      completedAt: daysAgo(9, 6),
    },
    {
      sourceUrl: "https://fb.watch/xyz123",
      platform: "facebook" as const,
      title: "إعلان جديد لمنتج مميز",
      author: "منوعات وطرائف",
      thumbnailUrl: "https://picsum.photos/seed/tahmil-9/480/270",
      durationSeconds: 38,
      quality: "720p",
      format: "mp4" as const,
      fileSizeMb: 9.8,
      status: "processing" as const,
      progress: 65,
      isFavorite: false,
      folderId: null,
      createdAt: daysAgo(0, 1),
      completedAt: null,
    },
    {
      sourceUrl: "https://www.tiktok.com/@user/video/711223344",
      platform: "tiktok" as const,
      title: "رقصة اليوم مع الأصدقاء",
      author: "@dance.crew",
      thumbnailUrl: "https://picsum.photos/seed/tahmil-10/480/270",
      durationSeconds: 29,
      quality: "1080p",
      format: "mp4" as const,
      fileSizeMb: 11.3,
      status: "completed" as const,
      progress: 100,
      isFavorite: false,
      folderId: funnyFolder.id,
      createdAt: daysAgo(10, 3),
      completedAt: daysAgo(10, 3),
    },
    {
      sourceUrl: "https://www.youtube.com/watch?v=queued001",
      platform: "youtube" as const,
      title: "شرح مفصل لأدوات الذكاء الاصطناعي الجديدة",
      author: "قناة التقنية",
      thumbnailUrl: "https://picsum.photos/seed/tahmil-11/480/270",
      durationSeconds: 480,
      quality: "1080p",
      format: "mp4" as const,
      fileSizeMb: 0,
      status: "queued" as const,
      progress: 0,
      isFavorite: false,
      folderId: null,
      createdAt: daysAgo(0, 0),
      completedAt: null,
    },
    {
      sourceUrl: "https://www.instagram.com/reel/TravelReel",
      platform: "instagram" as const,
      title: "لحظات من رحلتي الأخيرة ✈️",
      author: "@travel.stories",
      thumbnailUrl: "https://picsum.photos/seed/tahmil-12/480/270",
      durationSeconds: 95,
      quality: "1080p",
      format: "mp4" as const,
      fileSizeMb: 38.2,
      status: "completed" as const,
      progress: 100,
      isFavorite: true,
      folderId: favFolder.id,
      createdAt: daysAgo(14, 2),
      completedAt: daysAgo(14, 2),
    },
  ];

  await db.insert(downloads).values(demoDownloads.map((d) => ({ ...d, userId: demoUser.id })));

  console.log(`✓ Created ${demoDownloads.length} demo downloads`);
  console.log("🎉 Seeding complete!");
  console.log("");
  console.log("   Demo login → email: demo@tahmil.app | password: demo1234");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
