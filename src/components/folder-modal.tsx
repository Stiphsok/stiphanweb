"use client";

import { useEffect, useState } from "react";
import { Loader2, X, FolderInput } from "lucide-react";

const COLORS = ["#f5c518", "#f5497e", "#0ea5a5", "#3b82f6", "#22c55e", "#a855f7", "#ff8a3d"];

export default function FolderModal({
  open,
  initialName,
  initialColor,
  onSubmit,
  onClose,
  picker,
  options,
  onPick,
}: {
  open: boolean;
  initialName?: string;
  initialColor?: string;
  onSubmit?: (name: string, color: string) => Promise<void>;
  onClose: () => void;
  picker?: boolean;
  options?: { id: string; name: string }[];
  onPick?: (folderId: string) => void;
}) {
  const [name, setName] = useState(initialName ?? "");
  const [color, setColor] = useState(initialColor ?? COLORS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialName ?? "");
      setColor(initialColor ?? COLORS[0]);
    }
  }, [open, initialName, initialColor]);

  if (!open) return null;

  async function handleSubmit() {
    if (!name.trim() || !onSubmit) return;
    setLoading(true);
    try {
      await onSubmit(name.trim(), color);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 sm:items-center">
      <div className="w-full max-w-sm animate-fade-in-up rounded-t-3xl border border-[#2c2c31] bg-[#141416] p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white">
            {picker ? "نقل إلى مجلد" : initialName ? "تعديل المجلد" : "مجلد جديد"}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>

        {picker ? (
          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {options?.map((folder) => (
              <button
                key={folder.id}
                onClick={() => onPick?.(folder.id)}
                className="row-dark flex items-center gap-2.5 rounded-xl px-4 py-3 text-right text-sm font-semibold text-slate-200"
              >
                <FolderInput className="h-4 w-4 text-[#f5c518]" />
                {folder.name}
              </button>
            ))}
            {options?.length === 0 && (
              <p className="py-4 text-center text-xs text-slate-500">لا توجد مجلدات بعد.</p>
            )}
          </div>
        ) : (
          <>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">اسم المجلد</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="مثال: موسيقى"
              className="input-dark w-full rounded-xl px-4 py-2.5 text-sm"
            />

            <p className="mb-2 mt-4 text-xs font-semibold text-slate-400">اللون</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition ${color === c ? "ring-2 ring-offset-2 ring-[#141416]" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-[#2c2c31] px-4 py-2.5 text-xs font-bold text-slate-300"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !name.trim()}
                className="gold-btn flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold disabled:opacity-60"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                حفظ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
