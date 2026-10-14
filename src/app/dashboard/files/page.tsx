import { db } from "@/db";
import { downloads, folders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageHeader from "@/components/page-header";
import FilesClient from "@/components/files-client";

export const dynamic = "force-dynamic";

export default async function FilesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [rows, folderRows] = await Promise.all([
    db.select().from(downloads).where(eq(downloads.userId, user.id)).orderBy(desc(downloads.createdAt)),
    db.select({ id: folders.id, name: folders.name }).from(folders).where(eq(folders.userId, user.id)),
  ]);

  return (
    <div>
      <PageHeader showBack title="ملفاتي" />
      <div className="px-4 pt-4">
        <FilesClient initialItems={rows} initialFolders={folderRows} />
      </div>
    </div>
  );
}
