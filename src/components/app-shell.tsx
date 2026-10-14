"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  Folder,
  User,
  Crown,
  Settings,
  Star,
  X,
  Menu,
  LogOut,
  Loader2,
} from "lucide-react";
import { StiphantubeLogo } from "@/components/logo";
import { ToastProvider, useToast } from "@/components/toast";

type SafeUser = {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  plan: string;
};

const PremiumContext = createContext<{ openPremium: () => void }>({ openPremium: () => {} });
export const usePremium = () => useContext(PremiumContext);

const TAB_ITEMS = [
  { href: "/dashboard", label: "الرئيسية", icon: Home, exact: true },
  { href: "/dashboard/search", label: "بحث", icon: Search, exact: false },
  { href: "/dashboard/files", label: "ملفاتي", icon: Folder, exact: false },
  { href: "/dashboard/account", label: "حسابي", icon: User, exact: false },
];

const DRAWER_ITEMS = [
  { href: "/dashboard", label: "الرئيسية", icon: Home, exact: true },
  { href: "/dashboard/search", label: "بحث", icon: Search, exact: false },
  { href: "/dashboard/files", label: "ملفاتي", icon: Folder, exact: false },
  { href: "/dashboard/search?fav=1", label: "المفضلة", icon: Star, exact: false, fav: true },
  { href: "/dashboard/account", label: "حسابي", icon: User, exact: false },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings, exact: false },
];

function PremiumSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useToast();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 sm:items-center">
      <div className="w-full max-w-sm animate-fade-in-up rounded-t-3xl border border-[#f5c518]/40 bg-[#141416] p-6 sm:rounded-3xl">
        <div className="flex items-start justify-between">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f5c518]/15">
            <Crown className="h-6 w-6 text-[#f5c518]" />
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="mt-4 text-lg font-extrabold">النسخة المميزة</h3>
        <p className="mt-1 text-sm text-slate-400">افتح كل المزايا واحمّل بدون حدود.</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {["تحميل بدون إعلانات", "جودة عالية حتى 4K", "تحميلات غير محدودة", "أولوية في السرعة"].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f5c518]" />
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={() => {
            onClose();
            showToast("الترقية ستتوفر قريبًا 🔜", "info");
          }}
          className="gold-btn mt-6 w-full rounded-xl py-3 text-sm font-extrabold"
        >
          احصل على النسخة المميزة
        </button>
      </div>
    </div>
  );
}

function Shell({ user, children }: { user: SafeUser; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isImmersive = pathname.startsWith("/dashboard/video");

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isActive = (href: string, exact?: boolean) => {
    const clean = href.split("?")[0];
    return exact ? pathname === clean : pathname.startsWith(clean);
  };

  const drawer = (
    <div className="flex h-full flex-col bg-[#0b0b0d]">
      <div className="flex items-center justify-between border-b border-[#242428] px-5 py-5">
        <div className="flex items-center gap-2.5">
          <StiphantubeLogo size={36} />
          <span className="gold-text text-lg font-extrabold">Stiphantube</span>
        </div>
        <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5">
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-5">
        {DRAWER_ITEMS.map((item) => {
          const active = item.fav
            ? pathname.startsWith("/dashboard/search") && pathname.includes("fav")
            : isActive(item.href, item.exact);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "border border-[#f5c518]/50 bg-[#f5c518]/10 text-[#f5c518]"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
        >
          {loggingOut ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <LogOut className="h-4.5 w-4.5" />}
          تسجيل الخروج
        </button>
      </nav>

      <div className="p-4">
        <div className="rounded-2xl border border-[#f5c518]/40 bg-gradient-to-b from-[#f5c518]/12 to-transparent p-4 text-center">
          <Crown className="mx-auto h-6 w-6 text-[#f5c518]" />
          <p className="mt-2 text-sm font-extrabold text-[#f5c518]">احصل على النسخة المميزة</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">تحميل بدون إعلانات • جودة أعلى</p>
          <button
            onClick={() => {
              setDrawerOpen(false);
              setPremiumOpen(true);
            }}
            className="gold-btn mt-3 w-full rounded-xl py-2.5 text-xs font-extrabold"
          >
            ترقية الآن
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <PremiumContext.Provider value={{ openPremium: () => setPremiumOpen(true) }}>
      <div className="relative mx-auto min-h-screen w-full max-w-[430px] bg-[#0b0b0d] shadow-[0_0_100px_rgba(245,197,24,0.06)] sm:border-x sm:border-[#1a1a1d]">
        {children}

        {/* Bottom tab bar */}
        {!isImmersive && (
          <nav className="sticky bottom-0 z-40 mt-6 border-t border-[#1e1e22] bg-[#0e0e10]/95 backdrop-blur">
            <div className="grid grid-cols-4">
              {TAB_ITEMS.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                      active ? "text-[#f5c518]" : "text-[#7a7a83]"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

        {/* Drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/70" onClick={() => setDrawerOpen(false)} />
            <aside className="absolute inset-y-0 right-0 w-[290px] border-l border-[#f5c518]/30 animate-fade-in-up">
              {drawer}
            </aside>
          </div>
        )}

        <PremiumSheet open={premiumOpen} onClose={() => setPremiumOpen(false)} />
      </div>

      {/* helpers exposed through context-free props on children via data attributes */}
      <ShellControls
        onMenu={() => setDrawerOpen(true)}
        onPremium={() => setPremiumOpen(true)}
        initials={initials}
        user={user}
      />
    </PremiumContext.Provider>
  );
}

/**
 * Off-screen controls shared with page headers:
 * pages render <HeaderControls /> by reading the same module-level store.
 */
const controls: {
  onMenu?: () => void;
  onPremium?: () => void;
  initials?: string;
  user?: SafeUser;
} = {};

function ShellControls({
  onMenu,
  onPremium,
  initials,
  user,
}: {
  onMenu: () => void;
  onPremium: () => void;
  initials: string;
  user: SafeUser;
}) {
  controls.onMenu = onMenu;
  controls.onPremium = onPremium;
  controls.initials = initials;
  controls.user = user;
  return null;
}

export function openMenu() {
  controls.onMenu?.();
}
export function openPremium() {
  controls.onPremium?.();
}
export function shellInitials() {
  return controls.initials ?? "S";
}

export default function AppShell({ user, children }: { user: SafeUser; children: ReactNode }) {
  return (
    <ToastProvider>
      <Shell user={user}>{children}</Shell>
    </ToastProvider>
  );
}
