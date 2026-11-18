// Add SFX + music (+ optional voiceover) to an existing video, picture untouched.
// edits/<name>/edit.json → out/edits/<name>.mp4
//   { "video": "../file.mp4", "music": "music/groove.wav", "vo": "vo.mp3", "voAt": 0,
//     "cues": [[sec, "pop", vol], ...], "typing": [[from, to, stepSec], ...] }
// Paths: video/vo relative to the edit folder, music/sfx relative to public/.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const name = process.argv[2];
if (!name) throw new Error("usage: node scripts/overlay.mjs <name>");
const dir = resolve("edits", name);
const edit = JSON.parse(readFileSync(`${dir}/edit.json`, "utf8"));
const video = resolve(dir, edit.video);
const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]).toString().trim());

// typing ranges → one keystroke cue per step, with slight jitter so it sounds human
const cues = [...edit.cues];
for (const [from, to, step = 0.07] of edit.typing ?? []) {
  for (let t = from, i = 0; t < to; t += step * (0.7 + ((i * 37) % 10) / 16), i++) cues.push([+t.toFixed(3), "type", 0.35]);
}
const files = [...new Set(cues.map((c) => c[1]))];
for (const f of files) if (!existsSync(`public/sfx/${f}.wav`)) throw new Error(`sfx not found: ${f}`);

const args = ["-v", "error", "-y", "-i", video];
files.forEach((f) => args.push("-i", `public/sfx/${f}.wav`));
const filters = [];
const mix = [];
files.forEach((f, k) => {
  const mine = cues.filter((c) => c[1] === f);
  filters.push(`[${k + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=${mine.length}${mine.map((_, j) => `[s${k}_${j}]`).join("")}`);
  mine.forEach(([t, , vol = 0.5], j) => {
    filters.push(`[s${k}_${j}]volume=${vol},adelay=${Math.round(t * 1000)}:all=1[c${k}_${j}]`);
    mix.push(`[c${k}_${j}]`);
  });
});
let next = files.length + 1;
const vo = edit.vo ? resolve(dir, edit.vo) : null;
if (edit.music) {
  args.push("-stream_loop", "-1", "-i", `public/${edit.music}`);
  // same convention as make.mjs: quieter under narration
  const vol = edit.musicVolume ?? (vo ? 0.1 : 0.3);
  filters.push(`[${next}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${dur},volume=${vol},afade=t=in:d=0.6,afade=t=out:st=${Math.max(0, dur - 1.5)}:d=1.5[mus]`);
  mix.push("[mus]");
  next++;
}
if (vo) {
  // voParts: [{ from, to, at, tempo }] cuts the VO at its pauses and places each line on its shot (tempo > 1 = faster)
  const parts = edit.voParts ?? [{ from: 0, at: edit.voAt ?? 0 }];
  args.push("-i", vo);
  filters.push(`[${next}:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=${parts.length}${parts.map((_, j) => `[v${j}]`).join("")}`);
  parts.forEach(({ from = 0, to, at = 0, tempo = 1 }, j) => {
    filters.push(`[v${j}]atrim=${from}${to ? `:${to}` : ""},asetpts=PTS-STARTPTS,atempo=${tempo},volume=${edit.voVolume ?? 1},adelay=${Math.round(at * 1000)}:all=1[vp${j}]`);
    mix.push(`[vp${j}]`);
  });
}
filters.push(`${mix.join("")}amix=inputs=${mix.length}:normalize=0:duration=longest,atrim=0:${dur},loudnorm=I=-14:TP=-1.5:LRA=11[out]`);

const out = resolve("out/edits", `${name}.mp4`);
mkdirSync(dirname(out), { recursive: true });
args.push("-filter_complex", filters.join(";"), "-map", "0:v", "-map", "[out]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", String(dur), out);
execFileSync("ffmpeg", args, { stdio: "inherit" });
console.log(`✅ ${out}\n🔊 ${cues.length} sfx cues${edit.music ? " + music" : ""}${vo ? " + vo" : ""}`);
