"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "حدث خطأ ما");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold">أنشئ حسابك ✨</h1>
      <p className="mt-1.5 text-xs text-slate-400">ابدأ بتحميل فيديوهاتك المفضلة خلال ثوانٍ.</p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3.5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">الاسم الكامل</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark w-full rounded-xl px-4 py-3 text-sm"
            placeholder="اسمك"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">البريد الإلكتروني</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-dark w-full rounded-xl px-4 py-3 text-sm"
            placeholder="example@mail.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">كلمة المرور</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark w-full rounded-xl px-4 py-3 text-sm"
            placeholder="6 أحرف على الأقل"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="gold-btn mt-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          إنشاء الحساب
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-400">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="font-bold text-[#f5c518] hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
