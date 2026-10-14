import { NextResponse } from "next/server";
import { getVideoInfo } from "@/lib/yt-dlp";
import { isValidUrl } from "@/lib/platform";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (typeof url !== "string" || !isValidUrl(url)) return NextResponse.json({ error: "رابط غير صالح" }, { status: 400 });
    const info = await getVideoInfo(url);
    return NextResponse.json({
      ok: true,
      url,
      title: info.title || "فيديو",
      author: info.uploader || info.channel || "",
      thumbnailUrl: info.thumbnail || "",
      durationSeconds: info.duration || 0,
      formats: (info.formats || []).filter(f => f.vcodec && f.height).slice(-20),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "تعذر قراءة الفيديو" }, { status: 500 });
  }
}
