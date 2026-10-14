import { db } from "@/db";
import { downloads, folders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageHeader from "@/components/page-header";
import UrlBar from "@/components/url-bar";
import VideoList from "@/components/video-list";
import { InlineAd } from "@/components/ad-slot";
import {
  YoutubeIcon,
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
} from "@/components/brand-icons";
import { MoreHorizontal } from "lucide-react";

export const dynamic = "force-dynamic";

const PLATFORM_LINKS = [
  { name: "YouTube", icon: YoutubeIcon, bg: "#FF0000", filter: "youtube" },
  { name: "TikTok", icon: TiktokIcon, bg: "#000000", filter: "tiktok", ring: true },
  { name: "Facebook", icon: FacebookIcon, bg: "#1877F2", filter: "facebook" },
  { name: "Instagram", icon: InstagramIcon, bg: "linear-gradient(45deg,#f09433,#dc2743,#bc1888)", filter: "instagram" },
  { name: "المزيد", icon: MoreHorizontal, bg: "#1a1a1d", filter: "other", ring: true },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [rows, folderRows] = await Promise.all([
    db.select().from(downloads).where(eq(downloads.userId, user.id)).orderBy(desc(downloads.createdAt)),
    db.select({ id: folders.id, name: folders.name }).from(folders).where(eq(folders.userId, user.id)),
  ]);

  const trending = rows.slice(0, 8);

  return (
    <div>
      <PageHeader brand />

      <div className="px-4 pt-4">
        <UrlBar />

        {/* platform circles */}
        <div className="mt-5 grid grid-cols-5 gap-2">
          {PLATFORM_LINKS.map((p) => (
            <a
              key={p.name}
              href={`/dashboard/search?platform=${p.filter}`}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className={`grid h-13 w-13 place-items-center rounded-full p-3.5 ${p.ring ? "border border-[#2c2c31]" : ""}`}
                style={{ background: p.bg }}
              >
                <p.icon className="h-5 w-5 text-white" />
              </span>
              <span className="text-[10px] font-semibold text-slate-400">{p.name}</span>
            </a>
          ))}
        </div>

        {/* trending */}
        <div className="mt-6 flex items-center gap-1.5">
          <span className="text-base">🔥</span>
          <h2 className="text-sm font-extrabold text-white">الفيديوهات الشائعة</h2>
        </div>

        <div className="mt-3 flex flex-col gap-2.5">
          <VideoList items={trending.slice(0, 2)} folders={folderRows} emptyHint="ألصق أول رابط لك للبدء." />
          <InlineAd seed={0} />
          <VideoList items={trending.slice(2)} folders={folderRows} emptyHint="ألصق أول رابط لك للبدء." />
        </div>
      </div>
    </div>
  );
}
