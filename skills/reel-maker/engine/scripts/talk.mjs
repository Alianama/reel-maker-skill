// Usage: npm run talk -- <slug>
// talks/<slug>/raw.(mp4|mov) → clean audio + 1080x1920 → transcript (whisper) → jump cuts (silence + edit.json "cut")
// → public/talks/<slug>/data.json → out/talks/<slug>.mp4 + out/talks/<slug>-check.jpg
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname } from "node:path";

const FPS = 30;
const slug = process.argv[2];
const src = `talks/${slug}`;
const raw = slug && existsSync(src) && readdirSync(src).find((f) => /^raw\.(mp4|mov|m4v)$/i.test(f));
if (!raw) {
  console.error("Usage: npm run talk -- <seri>/<judul>   (needs talks/<seri>/<judul>/raw.mp4)");
  process.exit(1);
}
const pub = `public/talks/${slug}`;
const out = `out/talks/${slug}`;
mkdirSync(pub, { recursive: true });
mkdirSync(dirname(out), { recursive: true });
const run = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 26 });
const newer = (a, b) => existsSync(a) && statSync(a).mtimeMs >= statSync(b).mtimeMs;

// 1. Vertical 1080x1920 @30fps, keyframe every second (fast seeking), voice cleaned: rumble cut, denoise, gentle compression.
const video = `${pub}/src.mp4`;
if (!newer(video, `${src}/${raw}`)) {
  console.log("🎬 menyiapkan video + membersihkan suara…");
  run("ffmpeg", ["-v", "error", "-y", "-i", `${src}/${raw}`,
    "-vf", `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=${FPS}`,
    "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-g", String(FPS), "-pix_fmt", "yuv420p",
    "-af", "highpass=f=80,afftdn=nf=-25,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2",
    "-ar", "48000", "-c:a", "aac", "-b:a", "192k", video]);
}

// 2. Word timestamps with whisper.cpp (Indonesian). Prefers the better "small" model when downloaded.
const models = ["small", "base"].map((m) => [m, `${homedir()}/.cache/whisper/ggml-${m}.bin`]).filter(([, p]) => existsSync(p));
if (!models.length) throw new Error("Model whisper tidak ada. Unduh: curl -L -o ~/.cache/whisper/ggml-small.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin");
const tjson = `${src}/transcript.json`;
if (!newer(tjson, video)) {
  console.log(`📝 transkrip (whisper ${models[0][0]})…`);
  run("ffmpeg", ["-v", "error", "-y", "-i", video, "-ac", "1", "-ar", "16000", `${pub}/16k.wav`]);
  run("whisper-cli", ["-m", models[0][1], "-l", "id", "-ml", "1", "-sow", "-dtw", models[0][0], "-oj", "-of", `${pub}/whisper`, "-f", `${pub}/16k.wav`]);
  const words = JSON.parse(readFileSync(`${pub}/whisper.json`, "utf8")).transcription
    .map((s) => ({ w: s.text.trim(), start: s.offsets.from / 1000, end: s.offsets.to / 1000 }))
    .filter((x) => x.w && !/^\[.*\]$/.test(x.w)); // drop [MUSIC]-style tags
  writeFileSync(tjson, JSON.stringify(words));
  // Human/Claude-readable: one line per ~sentence with the raw-video second it starts at.
  let txt = "", line = [];
  for (const [i, x] of words.entries()) {
    line.push(x);
    if (/[.?!]$/.test(x.w) || line.length >= 14 || i === words.length - 1) {
      txt += `[${line[0].start.toFixed(2)}–${x.end.toFixed(2)}] ${line.map((y) => y.w).join(" ")}\n`;
      line = [];
    }
  }
  writeFileSync(`${src}/transcript.txt`, txt);
  rmSync(`${pub}/16k.wav`);
  rmSync(`${pub}/whisper.json`);
}
const words = JSON.parse(readFileSync(tjson, "utf8"));

const editFile = `${src}/edit.json`;
if (!existsSync(editFile)) {
  writeFileSync(editFile, JSON.stringify({ title: slug, style: "paper", music: "music/lofi.wav", cut: [], fix: {}, em: [], events: [] }, null, 2) + "\n");
  console.log(`\n📝 ${src}/transcript.txt siap. Isi ${editFile} (cut, fix, em, events) lalu jalankan lagi.`);
  process.exit(0);
}
const edit = JSON.parse(readFileSync(editFile, "utf8"));

// 3. Keep = speech (from ffmpeg silencedetect, which is more exact than whisper) minus edit.cut, padded a little.
const dur = Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]).trim());
// silencedetect logs to stderr.
const err = spawnSync("ffmpeg", ["-i", video, "-af", `silencedetect=noise=${edit.silenceDb ?? -35}dB:d=${edit.maxPause ?? 0.35}`, "-f", "null", "-"], { encoding: "utf8" }).stderr;
const silences = [...err.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
const PADS = 0.12; // breath kept around each cut so word ends aren't clipped
let keep = [];
let t0 = 0;
for (const [a, b] of silences) {
  if (a > t0) keep.push([Math.max(0, t0 - PADS), Math.min(dur, a + PADS)]);
  t0 = b;
}
if (t0 < dur) keep.push([Math.max(0, t0 - PADS), dur]);
for (const [a, b] of edit.cut ?? []) keep = keep.flatMap(([x, y]) => (b <= x || a >= y ? [[x, y]] : [[x, a], [b, y]].filter(([p, q]) => q - p > 0.15)));
keep = keep.filter(([x, y]) => y - x >= 0.2);

// Segments in output frames; raw second → output frame.
let f = 0;
const segments = keep.map(([from, to]) => {
  const s = { from, to, start: f, len: Math.max(1, Math.round((to - from) * FPS)) };
  f += s.len;
  return s;
});
const toOut = (t) => {
  const s = segments.find((x) => t < x.to) ?? segments[segments.length - 1];
  return s.start + Math.max(0, Math.round((Math.min(t, s.to) - s.from) * FPS));
};
// Whisper word times swallow the pauses around them, so only manual cuts drop words (silence just shifts them).
const inCut = (t) => (edit.cut ?? []).some(([a, b]) => t >= a && t < b);

const fix = Object.entries(edit.fix ?? {});
const em = (edit.em ?? []).map((x) => x.toLowerCase());
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");
const outWords = words
  .filter((x) => !inCut((x.start + x.end) / 2))
  .map((x) => {
    let w = x.w;
    for (const [a, b] of fix) if (norm(w) === norm(a)) w = w.replace(new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), b);
    return { w, em: em.includes(norm(w)), f: toOut(x.start) };
  });

// Event `at`: raw-video seconds (from transcript.txt) or the first spoken word containing that text.
const atFrame = (at, label) => {
  if (typeof at === "number") return toOut(at);
  const hit = outWords.find((x) => norm(x.w).includes(norm(at)));
  if (!hit) console.warn(`⚠️  ${label}: "at": "${at}" tidak ada di transkrip yang tersisa`);
  return hit ? hit.f : 0;
};
const events = (edit.events ?? []).map((e, i) => {
  const from = atFrame(e.at, `event ${i + 1}`);
  const until = e.until !== undefined ? atFrame(e.until, `event ${i + 1} until`) : from + Math.round((e.dur ?? 2.5) * FPS);
  return { ...e, from, len: Math.max(6, until - from) };
});

writeFileSync(`${pub}/data.json`, JSON.stringify({ ...edit, video: `talks/${slug}/src.mp4`, segments, words: outWords, events }, null, 2));
console.log(`✂️  ${dur.toFixed(1)} dtk → ${(f / FPS).toFixed(1)} dtk (${segments.length} potongan)`);

execFileSync("npx", ["remotion", "render", "Talk", `${out}.raw.mp4`, `--props=${JSON.stringify({ slug })}`], { stdio: "inherit" });
run("ffmpeg", ["-v", "error", "-y", "-i", `${out}.raw.mp4`, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", `${out}.mp4`]);
rmSync(`${out}.raw.mp4`);

// Self-check: a frame in the middle of every event + evenly spaced frames, tiled.
const total = f / FPS;
const times = [...events.map((e) => (e.from + e.len / 2) / FPS), ...Array.from({ length: 6 }, (_, i) => ((i + 0.5) * total) / 6)].sort((a, b) => a - b).slice(0, 18);
const cols = Math.min(times.length, 6);
const select = times.map((x) => `lt(prev_t\\,${x.toFixed(2)})*gte(t\\,${x.toFixed(2)})`).join("+");
run("ffmpeg", ["-v", "error", "-y", "-i", `${out}.mp4`, "-vf", `select='${select}',scale=360:-1,tile=${cols}x${Math.ceil(times.length / cols)}`, "-frames:v", "1", "-fps_mode", "vfr", `${out}-check.jpg`]);
console.log(`\n✅ ${out}.mp4\n🔎 ${out}-check.jpg`);
