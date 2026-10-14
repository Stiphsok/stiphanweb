import { NextResponse } from "next/server";
import { downloadToFile } from "@/lib/yt-dlp";
import { isValidUrl } from "@/lib/platform";
import { rm } from "node:fs/promises";
import { createReadStream } from "node:fs";

export const runtime = "nodejs";
export const maxDuration = 900;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = body?.url;
    const quality = typeof body?.quality === "string" ? body.quality : "720p";
    const format = body?.format === "mp3" ? "mp3" : "mp4";
    if (typeof url !== "string" || !isValidUrl(url)) return NextResponse.json({ error: "رابط غير صالح" }, { status: 400 });
    const result = await downloadToFile(url, quality, format);
    const contentType = format === "mp3" ? "audio/mpeg" : "video/mp4";
    const stream = createReadStream(result.filePath);
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(new Uint8Array(chunk)));
        stream.on("end", async () => {
          controller.close();
          await rm(result.dir, { recursive: true, force: true });
        });
        stream.on("error", async (error) => {
          controller.error(error);
          await rm(result.dir, { recursive: true, force: true });
        });
      },
      cancel() {
        stream.destroy();
        void rm(result.dir, { recursive: true, force: true });
      },
    });
    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(result.fileName)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "فشل التحميل" }, { status: 500 });
  }
}
