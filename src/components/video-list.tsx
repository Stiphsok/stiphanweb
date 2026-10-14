"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MoreVertical,
  Star,
  Pencil,
  Trash2,
  ExternalLink,
  RotateCcw,
  FolderInput,
  CheckCircle2,
  Pause,
  Play,
  X,
} from "lucide-react";
import ConfirmDialog from "@/components/confirm-dialog";
import FolderModal from "@/components/folder-modal";
import { useToast } from "@/components/toast";
import { formatDuration, formatFileSize, type Download } from "@/db/schema-client";

type FolderOption = { id: string; name: string };

/** Deterministic fake view count so lists feel like the reference design. */
function viewsFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const n = 40_000 + (hash % 2_900_000);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M مشاهدة`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K مشاهدة`;
  return `${n} مشاهدة`;
}

export default function VideoList({
  items,
  folders,
  showProgress,
  emptyHint,
}: {
  items: Download[];
  folders: FolderOption[];
  showProgress?: boolean;
  emptyHint?: string;
}) {
  const { showToast } = useToast();
  const [state, setState] = useState<Download[]>(items);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [moveId, setMoveId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setState(items), [items]);

  // simulate live progress for active downloads
  useEffect(() => {
    if (!showProgress) return;
    const timer = setInterval(() => {
      setState((prev) =>
        prev.map((d) =>
          d.status === "processing" && d.progress < 100
            ? { ...d, progress: Math.min(100, d.progress + 4) }
            : d,
        ),
      );
    }, 1200);
    return () => clearInterval(timer);
  }, [showProgress]);

  function patch(id: string, partial: Partial<Download>) {
    setState((prev) => prev.map((d) => (d.id === id ? { ...d, ...partial } : d)));
  }

  async function api(id: string, body: Record<string, unknown>, successMsg?: string) {
    setBusyIds((p) => new Set(p).add(id));
    try {
      const res = await fetch(`/api/downloads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.download) patch(id, data.download);
      if (successMsg) showToast(successMsg, "success");
      return true;
    } catch {
      showToast("حدث خطأ، حاول مرة أخرى", "error");
      return false;
    } finally {
      setBusyIds((p) => {
        const next = new Set(p);
        next.delete(id);
        return next;
      });
    }
  }

  async function togglePause(item: Download) {
    const next = item.status === "processing" ? "queued" : "processing";
    patch(item.id, { status: next });
    await api(item.id, { status: next });
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const id = deleteId;
    const prev = state;
    setState((s) => s.filter((d) => d.id !== id));
    try {
      const res = await fetch(`/api/downloads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("تم حذف الفيديو", "success");
    } catch {
      setState(prev);
      showToast("تعذر الحذف", "error");
    } finally {
      setDeleting(false);
      setDeleteId(null);
      setMenuId(null);
    }
  }

  async function submitRename() {
    if (!renameId) return;
    const title = draftTitle.trim();
    if (title) {
      patch(renameId, { title });
      await api(renameId, { title }, "تم تحديث العنوان");
    }
    setRenameId(null);
    setMenuId(null);
  }

  if (state.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#2c2c31] bg-[#111113] px-6 py-10 text-center">
        <p className="text-sm font-bold text-slate-300">لا توجد نتائج</p>
        <p className="mt-1 text-xs text-slate-500">{emptyHint ?? "جرّب لاحقًا — القائمة فارغة حاليًا."}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {state.map((item) => {
          const active = item.status === "processing" || item.status === "queued";
          const used = (item.fileSizeMb * item.progress) / 100;
          return (
            <div
              key={item.id}
              className={`relative flex gap-3 rounded-2xl border border-[#242428] bg-[#141416] p-2.5 transition ${
                busyIds.has(item.id) ? "opacity-60" : ""
              }`}
            >
              <Link
                href={`/dashboard/video?id=${item.id}`}
                className="relative h-[64px] w-[104px] shrink-0 overflow-hidden rounded-xl bg-[#1a1a1d]"
              >
                {item.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                )}
                <span className="absolute bottom-1 left-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {formatDuration(item.durationSeconds)}
                </span>
                {item.format === "mp3" && (
                  <span className="absolute right-1 top-1 rounded bg-[#f5c518] px-1 text-[9px] font-extrabold text-black">
                    MP3
                  </span>
                )}
              </Link>

              <div className="min-w-0 flex-1 py-0.5">
                <Link href={`/dashboard/video?id=${item.id}`}>
                  <p className="line-clamp-1 text-[13px] font-bold text-white">{item.title}</p>
                </Link>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                  {item.author ?? "Stiphantube"}
                </p>

                {active ? (
                  <div className="mt-1.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#2b2b30]">
                      <div
                        className="progress-animated h-full rounded-full bg-gradient-to-l from-[#f5c518] to-[#ffd966] transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] font-bold text-[#f5c518]">
                      {item.progress}% • {used.toFixed(1)} MB / {item.fileSizeMb.toFixed(0)} MB
                    </p>
                  </div>
                ) : item.status === "failed" ? (
                  <p className="mt-1 line-clamp-1 text-[10px] font-bold text-red-400">
                    {item.errorMessage ?? "فشل التحميل"}
                  </p>
                ) : (
                  <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    تم التحميل • {formatFileSize(item.fileSizeMb)}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-center justify-between py-0.5">
                {active ? (
                  <button
                    onClick={() => togglePause(item)}
                    className="grid h-8 w-8 place-items-center rounded-full border border-[#3a3a40] text-slate-200"
                    aria-label={item.status === "processing" ? "إيقاف مؤقت" : "استئناف"}
                  >
                    {item.status === "processing" ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                  </button>
                ) : (
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full ${
                      item.status === "failed"
                        ? "border border-red-500/40 text-red-400"
                        : "border border-emerald-500/40 text-emerald-500"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                )}
                <button
                  onClick={() => setMenuId(menuId === item.id ? null : item.id)}
                  className="mt-1.5 grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-white/5"
                  aria-label="خيارات"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {menuId === item.id && (
                <div className="absolute left-2 top-12 z-30 w-44 overflow-hidden rounded-xl border border-[#2c2c31] bg-[#1a1a1d] py-1 shadow-2xl animate-fade-in-up">
                  {item.status === "completed" && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> فتح الرابط
                    </a>
                  )}
                  {item.status === "failed" && (
                    <button
                      onClick={async () => {
                        setMenuId(null);
                        setBusyIds((p) => new Set(p).add(item.id));
                        try {
                          const res = await fetch(`/api/downloads/${item.id}/retry`, { method: "POST" });
                          const data = await res.json();
                          if (res.ok) {
                            patch(item.id, data.download);
                            showToast("أُعيد التحميل بنجاح", "success");
                          } else throw new Error();
                        } catch {
                          showToast("تعذرت إعادة المحاولة", "error");
                        } finally {
                          setBusyIds((p) => {
                            const n = new Set(p);
                            n.delete(item.id);
                            return n;
                          });
                        }
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> إعادة المحاولة
                    </button>
                  )}
                  <button
                    onClick={() => {
                      api(item.id, { isFavorite: !item.isFavorite });
                      setMenuId(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
                  >
                    <Star className={`h-3.5 w-3.5 ${item.isFavorite ? "fill-[#f5c518] text-[#f5c518]" : ""}`} />
                    {item.isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                  </button>
                  <button
                    onClick={() => {
                      setDraftTitle(item.title);
                      setRenameId(item.id);
                      setMenuId(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
                  >
                    <Pencil className="h-3.5 w-3.5" /> إعادة تسمية
                  </button>
                  <button
                    onClick={() => {
                      setMoveId(item.id);
                      setMenuId(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
                  >
                    <FolderInput className="h-3.5 w-3.5" /> نقل إلى مجلد
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> حذف
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* rename dialog */}
      {renameId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xs rounded-2xl border border-[#2c2c31] bg-[#141416] p-5 animate-fade-in-up">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">إعادة تسمية</h3>
              <button onClick={() => setRenameId(null)} className="text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              autoFocus
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitRename()}
              className="input-dark w-full rounded-xl px-3 py-2.5 text-sm"
            />
            <div className="mt-4 flex gap-2">
              <button onClick={() => setRenameId(null)} className="flex-1 rounded-xl border border-[#2c2c31] py-2.5 text-xs font-bold text-slate-300">
                إلغاء
              </button>
              <button onClick={submitRename} className="gold-btn flex-1 rounded-xl py-2.5 text-xs font-extrabold">
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* move dialog */}
      <FolderModal
        open={!!moveId}
        picker
        options={folders}
        onPick={async (folderId) => {
          if (moveId) {
            patch(moveId, { folderId });
            await api(moveId, { folderId }, "تم نقل الفيديو");
          }
          setMoveId(null);
        }}
        onClose={() => setMoveId(null)}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="حذف هذا الفيديو؟"
        description="لا يمكن التراجع عن هذا الإجراء بعد التأكيد."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
