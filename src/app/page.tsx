import Link from "next/link";
import { StiphantubeLogo } from "@/components/logo";
import UrlBar from "@/components/url-bar";
import { InlineAd } from "@/components/ad-slot";

export const dynamic = "force-dynamic";

export default function SplashPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[#050506] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[#f5c518]/12 blur-[120px]" />
      </div>
      <div className="relative z-10 w-full max-w-[430px]">
        <div className="flex flex-col items-center text-center">
          <div className="drop-shadow-[0_18px_40px_rgba(245,197,24,0.35)]">
            <StiphantubeLogo size={100} />
          </div>
          <h1 className="gold-text mt-5 text-5xl font-extrabold tracking-tight">Stiphantube</h1>
          <p className="mt-3 text-sm text-slate-300">حمّل الفيديوهات والصوت بسهولة من المنصات المدعومة</p>
        </div>

        <div className="mt-8 rounded-3xl border border-[#242428] bg-[#101012] p-4 shadow-2xl">
          <UrlBar />
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-[10px] font-semibold text-slate-500">
            <span>Instagram</span><span>•</span><span>TikTok</span><span>•</span><span>YouTube</span><span>•</span><span>Facebook</span>
          </div>
        </div>

        <div className="mt-5">
          <InlineAd seed={0} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/login" className="rounded-2xl border border-white/10 px-4 py-3 text-center text-xs font-bold text-slate-300">حسابي</Link>
          <Link href="/register" className="gold-btn rounded-2xl px-4 py-3 text-center text-xs font-extrabold">إنشاء حساب</Link>
        </div>

        <p className="mt-8 text-center text-[10px] leading-relaxed text-slate-600">
          استخدم الروابط والمحتوى الذي تملك حق تنزيله أو المسموح بتنزيله من المنصة.
        </p>
      </div>
    </main>
  );
}
