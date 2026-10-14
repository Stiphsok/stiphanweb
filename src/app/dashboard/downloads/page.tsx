import { redirect } from "next/navigation";

export default function LegacyDownloadsRedirect() {
  redirect("/dashboard/files");
}
