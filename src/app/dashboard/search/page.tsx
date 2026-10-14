import { db } from "@/db";
import { downloads, folders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageHeader from "@/components/page-header";
import SearchClient from "@/components/search-client";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; fav?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  const [rows, folderRows] = await Promise.all([
    db.select().from(downloads).where(eq(downloads.userId, user.id)).orderBy(desc(downloads.createdAt)),
    db.select({ id: folders.id, name: folders.name }).from(folders).where(eq(folders.userId, user.id)),
  ]);

  const favoritesOnly = params.fav === "1";

  return (
    <div>
      <PageHeader showBack={!favoritesOnly} title={favoritesOnly ? "المفضلة" : undefined} brand={!favoritesOnly} />
      <div className="px-4 pt-4">
        <SearchClient
          initialItems={rows}
          folders={folderRows}
          initialPlatform={params.platform}
          favoritesOnly={favoritesOnly}
        />
      </div>
    </div>
  );
}
