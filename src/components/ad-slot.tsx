"use client";

import { useEffect, useState } from "react";
import { X, ShieldCheck, Zap, Sparkles } from "lucide-react";

type Ad = {
  brand: string;
  title: string;
  body: string;
  cta: string;
  icon: typeof ShieldCheck;
  accent: string;
};

const ADS: Ad[] = [
  {
    brand: "نُت — تخزين سحابي",
    title: "احفظ تحميلاتك في مكان آمن",
    body: "٥٠ جيجا مجانًا لأول ٣٠ يومًا ومزامنة فورية عبر أجهزتك.",
    cta: "جرّب مجانًا",
    icon: ShieldCheck,
    accent: "#0ea5a5",
  },
  {
    brand: "راوتر ProX",
    title: "إنترنت أسرع بنسبة ٣أضعاف",
    body: "تغطية كاملة للمنزل بلا انقطاع — عرض إطلاق هذا الأسبوع.",
    cta: "اطلب الآن",
    icon: Zap,
    accent: "#f59e0b",
  },
  {
    brand: "استوديو بلَش",
    title: "حرّر مقاطعك بذكاء",
    body: "قص وتلوين تلقائي بالذكاء الاصطناعي خلال ثوانٍ.",
    cta: "شاهد العرض",
    icon: Sparkles,
    accent: "#f5c518",
  },
];

function useAdsEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(localStorage.getItem("st_show_ads") !== "0");
  }, []);
  return enabled;
}

function AdTag() {
  return (
    <span className="rounded-md border border-[#2c2c31] bg-[#1a1a1d] px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
      إعلان
    </span>
  );
}

/** Native inline ad card — dark + gold, clearly labeled, dismissible. */
export function InlineAd({ seed = 1 }: { seed?: number }) {
  const [dismissed, setDismissed] = useState(false);
  const enabled = useAdsEnabled();
  const ad = ADS[seed % ADS.length];
  if (!enabled || dismissed) return null;

  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-dashed border-[#3a3428] bg-gradient-to-l from-[#f5c518]/[0.06] to-transparent p-3.5">
      <button
        onClick={() => setDismissed(true)}
        aria-label="إخفاء الإعلان"
        className="absolute left-2 top-2 rounded-md p-1 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
      >
        <X className="h-3 w-3" />
      </button>
      <div
        className="grid h-14 w-14 shrink-0 place-items-center rounded-xl"
        style={{ background: `radial-gradient(circle at 30% 25%, ${ad.accent}55, transparent 70%), #1a1a1d` }}
      >
        <ad.icon className="h-6 w-6" style={{ color: ad.accent }} />
      </div>
      <div className="min-w-0 flex-1 pl-6">
        <div className="mb-0.5 flex items-center gap-2">
          <AdTag />
          <span className="truncate text-[10px] font-semibold text-slate-500">{ad.brand}</span>
        </div>
        <p className="truncate text-xs font-extrabold text-white">{ad.title}</p>
        <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">{ad.body}</p>
      </div>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="gold-btn shrink-0 rounded-xl px-3.5 py-2 text-[10px] font-extrabold"
      >
        {ad.cta}
      </a>
    </div>
  );
}

// Production ad-network integration: set NEXT_PUBLIC_ADSENSE_CLIENT and slot IDs when the site is approved.
