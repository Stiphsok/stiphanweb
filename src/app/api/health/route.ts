import { NextResponse } from "next/server";
import { spawn } from "node:child_process";

export async function GET() {
  return new Promise<Response>((resolve) => {
    const p = spawn(process.env.YTDLP_BIN || "yt-dlp", ["--version"]);
    let out = "";
    p.stdout.on("data", d => out += d.toString());
    p.on("error", () => resolve(NextResponse.json({ ok: false, ytDlp: false }, { status: 503 })));
    p.on("close", code => resolve(NextResponse.json({ ok: code === 0, ytDlp: code === 0, version: out.trim() })));
  });
}
