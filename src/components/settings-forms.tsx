"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Save, KeyRound } from "lucide-react";
import { useToast } from "@/components/toast";

const AVATAR_COLORS = ["#6d5efc", "#f5497e", "#0ea5a5", "#f59e0b", "#3b82f6", "#22c55e", "#a855f7"];

export function ProfileForm({
  initialName,
  initialColor,
  email,
}: {
  initialName: string;
  initialColor: string;
  email: string;
}) {
  const { showToast } = useToast();
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarColor: color }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "تعذر حفظ التغييرات", "error");
        return;
      }
      showToast("تم حفظ الملف الشخصي", "success");
    } catch {
      showToast("تعذر الاتصال بالخادم", "error");
    } finally {
      setLoading(false);
    }
  }

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-slate-900">الملف الشخصي</h2>
      <p className="mt-1 text-sm text-slate-500">قم بتحديث اسمك ولون صورتك الرمزية.</p>

      <div className="mt-5 flex items-center gap-4">
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-xl font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {initials || "U"}
        </div>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full transition ${color === c ? "ring-2 ring-offset-2 ring-slate-400" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-600">الاسم الكامل</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#6d5efc] focus:outline-none focus:ring-2 focus:ring-[#6d5efc]/20"
        />
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-600">البريد الإلكتروني</label>
        <input
          value={email}
          disabled
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-l from-[#6d5efc] to-[#8b7bff] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#6d5efc]/30 transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        حفظ التغييرات
      </button>
    </form>
  );
}

export function PasswordForm() {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "تعذر تحديث كلمة المرور", "error");
        return;
      }
      showToast("تم تحديث كلمة المرور بنجاح", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      showToast("تعذر الاتصال بالخادم", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-slate-900">كلمة المرور</h2>
      <p className="mt-1 text-sm text-slate-500">قم بتحديث كلمة المرور الخاصة بحسابك بانتظام لحمايته.</p>

      <div className="mt-5 flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">كلمة المرور الحالية</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#6d5efc] focus:outline-none focus:ring-2 focus:ring-[#6d5efc]/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">كلمة المرور الجديدة</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#6d5efc] focus:outline-none focus:ring-2 focus:ring-[#6d5efc]/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        تحديث كلمة المرور
      </button>
    </form>
  );
}
