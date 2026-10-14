import { redirect } from "next/navigation";

export default function LegacyFoldersRedirect() {
  redirect("/dashboard/files");
}
