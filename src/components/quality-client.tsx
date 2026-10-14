"use client";

import { useState } from "react";
import { Play, Download, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/components/toast";
import { formatDuration } from "@/db/schema-client";

type QualityOption = { quality: string; label: string; sizeMb: number };

export default function QualityClient({
  url,
  title,
  author,
  thumbnailUrl,
  durationSeconds,
  options,
  folderId,
}: {
  url: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  durationSeconds: number;
  options: QualityOption[];
  folderId: string | null;
}) {
  const { showToast } = useToast();
  const [selected, setSelected] = useState("720p");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function startDownload() {
    if (state === "loading") return;
    setState("loading");
    try {
      const isMp3 = selected === "mp3";
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, quality: isMp3 ? "720p" : selected, format: isMp3 ? "mp3" : "mp4" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "تعذر بدء التحميل");
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${title || "stiphantube-download"}.${isMp3 ? "mp3" : "mp4"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      setState("done");
      showToast("تم التحميل بنجاح ⬇️", "success");
    } catch (e) {
      setState("error");
      showToast(e instanceof Error ? e.message : "تعذر الاتصال بالخادم", "error");
    }
  }

  return (
    <div>
      {/* thumbnail */}
      <div className="relative overflow-hidden rounded-2xl bg-[#141416]">
        {thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt={title} className="h-44 w-full object-cover" />
        )}
        <div className="absolute inset-0 grid place-items-center bg-black/25">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-black/60 backdrop-blur">
            <Play className="h-5 w-5 translate-x-[-1px] fill-white text-white" />
          </span>
        </div>
        <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {formatDuration(durationSeconds)}
        </span>
      </div>

      {/* meta */}
      <h2 className="mt-4 text-center text-base font-extrabold leading-relaxed text-white">{title}</h2>
      <div className="mt-2 flex items-center justify-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-[#ffd966] to-[#d9a406] text-[9px] font-extrabold text-black">
          {(author || "ST").slice(0, 2).toUpperCase()}
        </span>
        <span className="text-xs font-bold text-slate-300">{author}</span>
      </div>
      <p className="mt-1 text-center text-[11px] text-slate-500">تم المشاهدة قبل 6 أشهر</p>

      {/* quality picker */}
      <div className="mt-5 rounded-2xl border border-[#242428] bg-[#141416] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white">اختر جودة التحميل</h3>
          <XCircle className="h-4 w-4 text-slate-600" />
        </div>

        <div className="flex flex-col gap-2">
          {options.map((option) => {
            const active = selected === option.quality;
            return (
              <button
                key={option.quality}
                onClick={() => setSelected(option.quality)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${
                  active
                    ? "border-[#f5c518] bg-[#f5c518]/[0.07]"
                    : "border-[#242428] bg-[#1a1a1d] hover:border-[#3a3a40]"
                }`}
              >
                <span className={`text-sm font-bold ${active ? "text-[#f5c518]" : "text-slate-200"}`}>
                  {option.label}
                </span>
                <span className="flex items-center gap-2.5">
                  <span className="text-[11px] font-semibold text-slate-500">{option.sizeMb} MB</span>
                  <span
                    className={`grid h-4 w-4 place-items-center rounded-full border-2 ${
                      active ? "border-[#f5c518]" : "border-[#3a3a40]"
                    }`}
                  >
                    {active && <span className="h-2 w-2 rounded-full bg-[#f5c518]" />}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={startDownload}
        disabled={state === "loading"}
        className="gold-btn mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-extrabold disabled:opacity-70"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري التحميل...
          </>
        ) : state === "done" ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            تم التحميل — تحميل مرة أخرى
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            تحميل
          </>
        )}
      </button>

      <p className="mt-3 text-center text-[10px] text-slate-600">
        بالضغط على تحميل فأنت توافق على شروط الاستخدام
      </p>
    </div>
  );
}
