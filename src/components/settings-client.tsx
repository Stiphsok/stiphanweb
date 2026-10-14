"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Globe,
  Gauge,
  Bell,
  FolderOpen,
  Eraser,
  ChevronLeft,
  Crown,
  Save,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/toast";

const QUALITIES = ["360p", "480p", "720p", "1080p", "4k"];
const AVATAR_COLORS = ["#f5c518", "#f5497e", "#0ea5a5", "#3b82f6", "#22c55e", "#a855f7"];

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mb-6">
      <h2 className="mb-2.5 px-1 text-xs font-extrabold tracking-wide text-[#f5c518]">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function Row({
  icon,
  label,
  value,
  action,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="row-dark flex items-center gap-3 rounded-2xl px-4 py-3.5">
      {icon && <span className="text-[#f5c518]">{icon}</span>}
      <span className="flex-1 text-sm font-bold text-white">{label}</span>
      {value && <span className="text-xs text-slate-500">{value}</span>}
      {action}
    </div>
  );
}

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return <button type="button" data-on={on} onClick={onToggle} className="switch" aria-pressed={on} />;
}

export default function SettingsClient({
  name: initialName,
  avatarColor: initialColor,
  email,
}: {
  name: string;
  avatarColor: string;
  email: string;
}) {
  const { showToast } = useToast();
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [savingProfile, setSavingProfile] = useState(false);

  const [defaultQuality, setDefaultQuality] = useState("720p");
  const [adsOn, setAdsOn] = useState(true);
  const [muteNotifs, setMuteNotifs] = useState(false);
  const [ready, setReady] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setDefaultQuality(localStorage.getItem("st_default_quality") ?? "720p");
    setAdsOn(localStorage.getItem("st_show_ads") !== "0");
    setMuteNotifs(localStorage.getItem("st_mute_notifs") === "1");
    setReady(true);
  }, []);

  function persist(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarColor: color }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "تعذر الحفظ", "error");
        return;
      }
      showToast("تم حفظ الملف الشخصي", "success");
    } catch {
      showToast("تعذر الاتصال بالخادم", "error");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    setSavingPassword(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "تعذر التحديث", "error");
        return;
      }
      showToast("تم تحديث كلمة المرور", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      showToast("تعذر الاتصال بالخادم", "error");
    } finally {
      setSavingPassword(false);
    }
  }

  if (!ready) return null;

  return (
    <div>
      <Section title="عام">
        <Row icon={<Globe className="h-4 w-4" />} label="لغة التطبيق" value="العربية" action={<ChevronLeft className="h-4 w-4 text-slate-600" />} />
        <div className="row-dark flex items-center gap-3 rounded-2xl px-4 py-3.5">
          <Gauge className="h-4 w-4 text-[#f5c518]" />
          <span className="flex-1 text-sm font-bold text-white">جودة التحميل الافتراضية</span>
          <select
            value={defaultQuality}
            onChange={(e) => {
              setDefaultQuality(e.target.value);
              persist("st_default_quality", e.target.value);
            }}
            className="select-dark rounded-lg px-2.5 py-1.5 text-xs font-bold"
          >
            {QUALITIES.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
        <div className="row-dark flex items-center gap-3 rounded-2xl px-4 py-3.5">
          <span className="text-[#f5c518]">
            <Crown className="h-4 w-4" />
          </span>
          <span className="flex-1 text-sm font-bold text-white">إظهار الإعلانات</span>
          <Switch
            on={adsOn}
            onToggle={() => {
              const next = !adsOn;
              setAdsOn(next);
              persist("st_show_ads", next ? "1" : "0");
            }}
          />
        </div>
        <div className="row-dark flex items-center gap-3 rounded-2xl px-4 py-3.5">
          <Bell className="h-4 w-4 text-[#f5c518]" />
          <span className="flex-1 text-sm font-bold text-white">كتم إشعارات التنزيل</span>
          <Switch
            on={muteNotifs}
            onToggle={() => {
              const next = !muteNotifs;
              setMuteNotifs(next);
              persist("st_mute_notifs", next ? "1" : "0");
            }}
          />
        </div>
      </Section>

      <Section title="التنزيلات">
        <Row icon={<FolderOpen className="h-4 w-4" />} label="مسار التنزيل" value="Download/Stiphantube" action={<ChevronLeft className="h-4 w-4 text-slate-600" />} />
        <button
          onClick={() => showToast("تم مسح الملفات المؤقتة 🧹", "success")}
          className="row-dark flex items-center gap-3 rounded-2xl px-4 py-3.5 text-right"
        >
          <Eraser className="h-4 w-4 text-[#f5c518]" />
          <span className="flex-1 text-sm font-bold text-white">مسح ملفات المؤقت</span>
        </button>
      </Section>

      <Section title="الحساب">
        <form onSubmit={saveProfile} className="row-dark rounded-2xl p-4">
          <p className="mb-3 text-sm font-extrabold text-white">الملف الشخصي</p>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">الاسم</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark w-full rounded-xl px-3 py-2.5 text-sm"
          />
          <label className="mb-1.5 mt-3 block text-xs font-semibold text-slate-400">البريد الإلكتروني</label>
          <input value={email} disabled className="input-dark w-full rounded-xl px-3 py-2.5 text-sm opacity-60" />
          <div className="mt-3 flex items-center gap-2">
            {AVATAR_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-[#141416]" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="gold-btn mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold disabled:opacity-60"
          >
            {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            حفظ التغييرات
          </button>
        </form>

        <form onSubmit={savePassword} className="row-dark rounded-2xl p-4">
          <p className="mb-3 text-sm font-extrabold text-white">كلمة المرور</p>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">الحالية</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input-dark w-full rounded-xl px-3 py-2.5 text-sm"
          />
          <label className="mb-1.5 mt-3 block text-xs font-semibold text-slate-400">الجديدة</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-dark w-full rounded-xl px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={savingPassword}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#f5c518]/50 bg-[#f5c518]/10 py-2.5 text-xs font-extrabold text-[#f5c518] disabled:opacity-60"
          >
            {savingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
            تحديث كلمة المرور
          </button>
        </form>
      </Section>

      <Section title="حول التطبيق" id="about">
        <Row label="الإصدار" value="v1.0.0" />
        <Row label="الإصدار" value="" action={null} />
      </Section>

      <p className="mb-4 text-center text-[11px] text-slate-600">Stiphantube © {new Date().getFullYear()}</p>
    </div>
  );
}
