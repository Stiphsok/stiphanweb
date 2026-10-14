import { db } from "@/db";
import { downloads, folders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Crown,
  ChevronLeft,
  Download,
  Star,
  Folder,
  LifeBuoy,
  Info,
  Settings,
} from "lucide-react";
import PageHeader from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [allDownloads, folderRows] = await Promise.all([
    db.select().from(downloads).where(eq(downloads.userId, user.id)),
    db.select({ id: folders.id }).from(folders).where(eq(folders.userId, user.id)),
  ]);

  const favorites = allDownloads.filter((d) => d.isFavorite).length;

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const menu = [
    {
      href: "/dashboard/files",
      icon: Download,
      label: "إحصائيات التحميل",
      value: `${allDownloads.length} تحميل`,
    },
    { href: "/dashboard/search?fav=1", icon: Star, label: "المفضلة", value: `${favorites} فيديوهات` },
    { href: "/dashboard/files", icon: Folder, label: "المجلدات", value: `${folderRows.length} مجلد` },
    { href: "mailto:support@stiphantube.app", icon: LifeBuoy, label: "المساعدة والدعم", value: "" },
    { href: "/dashboard/settings#about", icon: Info, label: "عن التطبيق", value: "v1.0.0" },
  ];

  return (
    <div>
      <PageHeader
        title="حسابي"
        right={
          <a
            href="/dashboard/settings"
            className="grid h-9 w-9 place-items-center rounded-xl border border-[#242428] text-slate-300"
          >
            <Settings className="h-4 w-4" />
          </a>
        }
      />

      <div className="px-4 pt-6">
        {/* profile */}
        <div className="flex items-center gap-4">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-xl font-extrabold text-black"
            style={{
              background: "linear-gradient(180deg, #ffd966, #f5c518 50%, #d9a406)",
            }}
          >
            {initials || "U"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-[#f5c518]/40 bg-[#f5c518]/10 px-2.5 py-1 text-[10px] font-extrabold text-[#f5c518]">
              <Crown className="h-3 w-3" />
              خطة {user.plan}
            </span>
          </div>
        </div>

        {/* menu */}
        <div className="mt-7 flex flex-col gap-2">
          {menu.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="row-dark flex items-center gap-3 rounded-2xl px-4 py-3.5"
            >
              <item.icon className="h-4.5 w-4.5 text-[#f5c518]" />
              <span className="flex-1 text-sm font-bold text-white">{item.label}</span>
              {item.value && <span className="text-xs text-slate-500">{item.value}</span>}
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </a>
          ))}
        </div>

        <p className="mt-8 text-center text-[11px] text-slate-600">Stiphantube v1.0.0</p>
      </div>
    </div>
  );
}
