import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageHeader from "@/components/page-header";
import SettingsClient from "@/components/settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div>
      <PageHeader showBack title="الإعدادات" />
      <div className="px-4 pt-4">
        <SettingsClient name={user.name} avatarColor={user.avatarColor} email={user.email} />
      </div>
    </div>
  );
}
