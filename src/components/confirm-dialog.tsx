"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "تأكيد الحذف",
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 sm:items-center">
      <div className="w-full max-w-xs animate-fade-in-up rounded-t-3xl border border-[#2c2c31] bg-[#141416] p-6 sm:rounded-3xl">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-500/15 text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-center text-base font-extrabold text-white">{title}</h3>
        <p className="mt-1.5 text-center text-xs text-slate-400">{description}</p>
        <div className="mt-6 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#2c2c31] px-4 py-2.5 text-xs font-bold text-slate-300"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
