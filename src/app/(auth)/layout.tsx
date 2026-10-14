import type { ReactNode } from "react";
import Link from "next/link";
import { StiphantubeLogo } from "@/components/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050506] px-4 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-[640px] -translate-x-1/2 rounded-full bg-[#f5c518]/10 blur-[110px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <Link href="/" className="mb-8 flex flex-col items-center gap-3">
          <StiphantubeLogo size={64} />
          <span className="gold-text text-2xl font-extrabold">Stiphantube</span>
        </Link>
        <div className="card-dark rounded-3xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
          {children}
        </div>
      </div>
    </main>
  );
}
