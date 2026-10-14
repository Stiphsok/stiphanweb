"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, ListVideo, Radio, PlaySquare, Folder } from "lucide-react";
import VideoList from "@/components/video-list";
import { InlineAd } from "@/components/ad-slot";
import { PLATFORM_LABELS, type Platform } from "@/lib/platform";
import type { Download } from "@/db/schema-client";

type FolderOption = { id: string; name: string };

const TABS = [
  { key: "all", label: "الكل", icon: ListVideo },
  { key: "videos", label: "فيديوهات", icon: PlaySquare },
  { key: "channels", label: "قنوات", icon: Radio },
  { key: "playlists", label: "قوائم التشغيل", icon: Folder },
] as const;

export default function SearchClient({
  initialItems,
  folders,
  initialPlatform,
  favoritesOnly,
}: {
  initialItems: Download[];
  folders: FolderOption[];
  initialPlatform?: string;
  favoritesOnly?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const platform = (initialPlatform as Platform | undefined) ?? null;

  const items = useMemo(() => {
    let list = initialItems;
    if (favoritesOnly) list = list.filter((d) => d.isFavorite);
    if (platform) list = list.filter((d) => d.platform === platform);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.author ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [initialItems, favoritesOnly, platform, query]);

  const channels = useMemo(() => {
    const map = new Map<string, { name: string; count: number; cover: string | null }>();
    for (const d of items) {
      const name = d.author ?? "Stiphantube";
      const entry = map.get(name) ?? { name, count: 0, cover: null };
      entry.count += 1;
      if (!entry.cover) entry.cover = d.thumbnailUrl;
      map.set(name, entry);
    }
    return [...map.values()];
  }, [items]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="موسيقى"
            className="input-dark w-full rounded-full py-3 pr-10 pl-9 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[#2b2b30] p-1 text-slate-400"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {platform && (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f5c518]/40 bg-[#f5c518]/10 px-3 py-1 text-[11px] font-bold text-[#f5c518]">
            {PLATFORM_LABELS[platform]}
            <Link href="/dashboard/search" className="hover:text-white">
              ✕
            </Link>
          </span>
        </div>
      )}

      {!favoritesOnly && (
        <div className="mt-4 flex gap-1.5 overflow-x-auto border-b border-[#1a1a1d] pb-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-bold transition ${
                tab === t.key
                  ? "border-[#f5c518] text-[#f5c518]"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4">
        {tab === "channels" && !favoritesOnly ? (
          channels.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#2c2c31] bg-[#111113] px-6 py-10 text-center">
              <p className="text-sm font-bold text-slate-300">لا توجد قنوات</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {channels.map((channel) => (
                <div
                  key={channel.name}
                  className="flex items-center gap-3 rounded-2xl border border-[#242428] bg-[#141416] p-3"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#f5c518] to-[#d9a406] text-sm font-extrabold text-black">
                    {channel.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{channel.name}</p>
                    <p className="text-[11px] text-slate-500">{channel.count} فيديو</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === "playlists" && !favoritesOnly ? (
          folders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#2c2c31] bg-[#111113] px-6 py-10 text-center">
              <p className="text-sm font-bold text-slate-300">لا توجد قوائم تشغيل</p>
              <p className="mt-1 text-xs text-slate-500">أنشئ مجلداتك من صفحة ملفاتي.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {folders.map((folder) => (
                <Link
                  key={folder.id}
                  href="/dashboard/files"
                  className="rounded-2xl border border-[#242428] bg-[#141416] p-4"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5c518]/12">
                    <Folder className="h-5 w-5 text-[#f5c518]" />
                  </div>
                  <p className="mt-3 truncate text-sm font-bold text-white">{folder.name}</p>
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-2.5">
            <VideoList
              items={items.slice(0, 3)}
              folders={folders}
              emptyHint={favoritesOnly ? "لم تُضف أي فيديو للمفضلة بعد." : "لا توجد نتائج مطابقة."}
            />
            {items.length > 3 && <InlineAd seed={2} />}
            <VideoList
              items={items.slice(3)}
              folders={folders}
              emptyHint={favoritesOnly ? "لم تُضف أي فيديو للمفضلة بعد." : "لا توجد نتائج مطابقة."}
            />
          </div>
        )}
      </div>
    </div>
  );
}
