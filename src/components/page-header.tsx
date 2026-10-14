"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { openMenu, openPremium } from "@/components/app-shell";
import { StiphantubeLogo } from "@/components/logo";
import { Crown, Menu, Settings } from "lucide-react";

/** Sticky header used across app screens (design: black bar, gold accents). */
export default function PageHeader({
  title,
  showBack,
  brand,
  right,
}: {
  title?: string;
  showBack?: boolean;
  brand?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[#1a1a1d] bg-[#0b0b0d]/95 px-4 py-3.5 backdrop-blur">
      <div className="flex items-center gap-2.5">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[#242428] text-slate-300"
            aria-label="رجوع"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
        {brand && (
          <>
            <StiphantubeLogo size={32} />
            <span className="gold-text text-lg font-extrabold">Stiphantube</span>
          </>
        )}
        {title && !brand && <h1 className="text-lg font-extrabold text-white">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        {right}
        {!right && (
          <>
            <button
              onClick={openMenu}
              className="grid h-9 w-9 place-items-center rounded-xl border border-[#242428] text-slate-300"
              aria-label="القائمة"
            >
              <Menu className="h-4 w-4" />
            </button>
            <button
              onClick={openPremium}
              className="grid h-9 w-9 place-items-center rounded-xl border border-[#f5c518]/40 bg-[#f5c518]/10 text-[#f5c518]"
              aria-label="النسخة المميزة"
            >
              <Crown className="h-4 w-4" />
            </button>
            <a
              href="/dashboard/settings"
              className="grid h-9 w-9 place-items-center rounded-xl border border-[#242428] text-slate-300"
              aria-label="الإعدادات"
            >
              <Settings className="h-4 w-4" />
            </a>
          </>
        )}
      </div>
    </header>
  );
}
