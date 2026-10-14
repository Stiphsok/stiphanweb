import "server-only";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export type YtDlpMeta = {
  id?: string;
  title?: string;
  uploader?: string;
  channel?: string;
  duration?: number;
  thumbnail?: string;
  webpage_url?: string;
  ext?: string;
  filesize?: number;
  formats?: Array<{ format_id?: string; height?: number; ext?: string; acodec?: string; vcodec?: string; filesize?: number; tbr?: number }>;
};

function commandName() {
  return process.env.YTDLP_BIN || "yt-dlp";
}

export function runYtDlp(args: string[], options: { cwd?: string; timeoutMs?: number } = {}) {
  return new Promise<{ stdout: string; stderr: string; code: number }>((resolve, reject) => {
    const child = spawn(commandName(), args, { cwd: options.cwd });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => child.kill("SIGKILL"), options.timeoutMs ?? 120_000);
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => { clearTimeout(timeout); reject(err); });
    child.on("close", (code) => { clearTimeout(timeout); resolve({ stdout, stderr, code: code ?? 1 }); });
  });
}

export async function getVideoInfo(url: string): Promise<YtDlpMeta> {
  const result = await runYtDlp(["--no-playlist", "--dump-single-json", "--no-warnings", "--skip-download", url]);
  if (result.code !== 0) throw new Error(result.stderr || "yt-dlp failed");
  return JSON.parse(result.stdout) as YtDlpMeta;
}

export function formatSelector(quality: string, format: "mp4" | "mp3") {
  if (format === "mp3") return "bestaudio/best";
  const height = Number.parseInt(quality.replace("p", ""), 10);
  const max = Number.isFinite(height) ? height : 720;
  return `bestvideo[height<=${max}]+bestaudio/best[height<=${max}]/best`;
}

export async function downloadToFile(url: string, quality: string, format: "mp4" | "mp3") {
  const dir = await mkdtemp(path.join(tmpdir(), "stiphantube-"));
  const ext = format === "mp3" ? "mp3" : "mp4";
  const output = path.join(dir, `%(title).80s-%(id)s.${ext}`);
  const args = ["--no-playlist", "--no-warnings", "--restrict-filenames", "-f", formatSelector(quality, format)];
  if (format === "mp3") args.push("-x", "--audio-format", "mp3");
  else args.push("--merge-output-format", "mp4");
  args.push("-o", output, url);
  const result = await runYtDlp(args, { timeoutMs: 15 * 60 * 1000 });
  if (result.code !== 0) {
    await rm(dir, { recursive: true, force: true });
    throw new Error(result.stderr || "Download failed");
  }
  const { readdir } = await import("node:fs/promises");
  const files = await readdir(dir);
  const file = files.find((name) => name.toLowerCase().endsWith(`.${ext}`));
  if (!file) {
    await rm(dir, { recursive: true, force: true });
    throw new Error("Downloaded file was not created");
  }
  return { dir, filePath: path.join(dir, file), fileName: file };
}
