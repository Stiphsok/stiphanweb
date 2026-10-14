"use client";

import { useMemo, useState } from "react";
import { FolderPlus, Folder as FolderIcon, Pencil, Trash2, DownloadCloud, CheckCircle2 } from "lucide-react";
import VideoList from "@/components/video-list";
import FolderModal from "@/components/folder-modal";
import ConfirmDialog from "@/components/confirm-dialog";
import { InlineAd } from "@/components/ad-slot";
import { useToast } from "@/components/toast";
import type { Download } from "@/db/schema-client";

type FolderWithCount = { id: string; name: string; color: string; downloadsCount: number };

type Tab = "active" | "done";

export default function FilesClient({
  initialItems,
  initialFolders,
}: {
  initialItems: Download[];
  initialFolders: { id: string; name: string }[];
}) {
  const { showToast } = useToast();
  const [items] = useState(initialItems);
  const [folders, setFolders] = useState<FolderWithCount[]>(
    initialFolders.map((f) => ({
      ...f,
      color: "#f5c518",
      downloadsCount: initialItems.filter((d) => d.folderId === f.id).length,
    })),
  );
  const [tab, setTab] = useState<Tab>("active");
  const [folderModal, setFolderModal] = useState<{ open: boolean; editing: FolderWithCount | null }>({
    open: false,
    editing: null,
  });
  const [deleteFolder, setDeleteFolder] = useState<FolderWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activeItems = useMemo(
    () => items.filter((d) => d.status === "processing" || d.status === "queued"),
    [items],
  );
  const doneItems = useMemo(
    () => items.filter((d) => d.status === "completed" || d.status === "failed"),
    [items],
  );

  async function submitFolder(name: string, color: string) {
    const editing = folderModal.editing;
    if (editing) {
      const prev = folders;
      setFolders((f) => f.map((x) => (x.id === editing.id ? { ...x, name, color } : x)));
      try {
        const res = await fetch(`/api/folders/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color }),
        });
        if (!res.ok) throw new Error();
        showToast("تم تحديث المجلد", "success");
      } catch {
        setFolders(prev);
        showToast("تعذر التحديث", "error");
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      setFolders((f) => [...f, { id: tempId, name, color, downloadsCount: 0 }]);
      try {
        const res = await fetch("/api/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error();
        setFolders((f) => f.map((x) => (x.id === tempId ? data.folder : x)));
        showToast("تم إنشاء المجلد", "success");
      } catch {
        setFolders((f) => f.filter((x) => x.id !== tempId));
        showToast("تعذر الإنشاء", "error");
      }
    }
    setFolderModal({ open: false, editing: null });
  }

  async function confirmDeleteFolder() {
    if (!deleteFolder) return;
    setDeleting(true);
    const prev = folders;
    setFolders((f) => f.filter((x) => x.id !== deleteFolder.id));
    try {
      const res = await fetch(`/api/folders/${deleteFolder.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("تم حذف المجلد", "success");
    } catch {
      setFolders(prev);
      showToast("تعذر الحذف", "error");
    } finally {
      setDeleting(false);
      setDeleteFolder(null);
    }
  }

  return (
    <div>
      {/* tabs */}
      <div className="flex gap-2 rounded-full border border-[#242428] bg-[#141416] p-1">
        <button
          onClick={() => setTab("active")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-extrabold transition ${
            tab === "active" ? "bg-[#f5c518] text-black" : "text-slate-400"
          }`}
        >
          <DownloadCloud className="h-4 w-4" />
          جاري التحميل
          <span
            className={`rounded-full px-1.5 text-[10px] ${
              tab === "active" ? "bg-black/20" : "bg-[#2b2b30] text-slate-300"
            }`}
          >
            {activeItems.length}
          </span>
        </button>
        <button
          onClick={() => setTab("done")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-extrabold transition ${
            tab === "done" ? "bg-[#f5c518] text-black" : "text-slate-400"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          تم التحميل
          <span
            className={`rounded-full px-1.5 text-[10px] ${
              tab === "done" ? "bg-black/20" : "bg-[#2b2b30] text-slate-300"
            }`}
          >
            {doneItems.length}
          </span>
        </button>
      </div>

      <div className="mt-4">
        {tab === "active" ? (
          <VideoList
            items={activeItems}
            folders={initialFolders}
            showProgress
            emptyHint="لا توجد تحميلات جارية — ألصق رابطًا في الرئيسية للبدء."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            <VideoList items={doneItems.slice(0, 2)} folders={initialFolders} emptyHint="لم تحمّل أي فيديو بعد." />
            <InlineAd seed={1} />
            <VideoList items={doneItems.slice(2)} folders={initialFolders} emptyHint="لم تحمّل أي فيديو بعد." />
          </div>
        )}
      </div>

      {/* folders */}
      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white">المجلدات</h2>
          <button
            onClick={() => setFolderModal({ open: true, editing: null })}
            className="flex items-center gap-1.5 rounded-full border border-[#f5c518]/40 bg-[#f5c518]/10 px-3 py-1.5 text-[11px] font-extrabold text-[#f5c518]"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            جديد
          </button>
        </div>

        {folders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2c2c31] bg-[#111113] px-6 py-8 text-center">
            <p className="text-sm font-bold text-slate-300">لا توجد مجلدات</p>
            <p className="mt-1 text-xs text-slate-500">أنشئ مجلدًا لتنظيم تحميلاتك.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="row-dark flex items-center gap-3 rounded-2xl px-4 py-3"
              >
                <div
                  className="grid h-9 w-9 place-items-center rounded-xl"
                  style={{ backgroundColor: `${folder.color}26`, color: folder.color }}
                >
                  <FolderIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{folder.name}</p>
                  <p className="text-[11px] text-slate-500">{folder.downloadsCount} ملف</p>
                </div>
                <button
                  onClick={() => setFolderModal({ open: true, editing: folder })}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-[#2c2c31] text-slate-400"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleteFolder(folder)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-[#2c2c31] text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <FolderModal
        open={folderModal.open}
        initialName={folderModal.editing?.name}
        initialColor={folderModal.editing?.color}
        onSubmit={submitFolder}
        onClose={() => setFolderModal({ open: false, editing: null })}
      />

      <ConfirmDialog
        open={!!deleteFolder}
        title={`حذف مجلد "${deleteFolder?.name ?? ""}"؟`}
        description="الملفات بداخله لن تُحذف لكنها ستصبح بدون مجلد."
        loading={deleting}
        onConfirm={confirmDeleteFolder}
        onCancel={() => setDeleteFolder(null)}
      />
    </div>
  );
}
