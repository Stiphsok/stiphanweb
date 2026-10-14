"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Link2, Search } from "lucide-react";

export default function UrlBar() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("shared_url");
    if (shared) {
      const clean = shared.trim();
      setUrl(clean);
      router.replace(`/dashboard/video?url=${encodeURIComponent(clean)}`);
    }
  }, [router]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = url.trim();
    if (!value) return;
    setUrl("");
    router.push(`/dashboard/video?url=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Link2 className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="text"
          placeholder="ابحث عن فيديو أو ألصق الرابط هنا..."
          className="input-dark w-full rounded-full py-3 pr-10 pl-4 text-sm"
        />
      </div>
      <button
        type="submit"
        className="gold-btn grid h-11 w-11 shrink-0 place-items-center rounded-full"
        aria-label="بحث"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}
