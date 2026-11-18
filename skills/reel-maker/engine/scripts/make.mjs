// Usage: npm run make -- <slug>
// reels/<slug>/script.json → voiceover per scene → public/reels/<slug>/data.json → out/<slug>.mp4 + out/<slug>-check.jpg
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const PAD = 0.35; // keep in sync with PAD in src/Reel.tsx
const slug = process.argv[2];
if (!slug || !existsSync(`reels/${slug}/script.json`)) {
  console.error("Usage: npm run make -- <slug>   (needs reels/<slug>/script.json)");
  process.exit(1);
}

const script = JSON.parse(readFileSync(`reels/${slug}/script.json`, "utf8"));
const silent = script.voice === false; // no narration: captions are on-screen text only
const voice = script.voice || {};
const key = process.env.ELEVENLABS_API_KEY;
const useEleven = Boolean(key && voice.elevenlabsVoiceId) && !voice.file;
const dir = `public/reels/${slug}`;
mkdirSync(dir, { recursive: true });
mkdirSync(dirname(`out/${slug}`), { recursive: true }); // slug may be nested: <produk>/<judul>

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: "utf8", ...opts });

async function tts(text, file) {
  if (useEleven) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.elevenlabsVoiceId}`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    return;
  }
  const aiff = file.replace(/\.mp3$/, ".aiff");
  run("say", ["-v", voice.sayVoice ?? "Damayanti", "-r", String(voice.sayRate ?? 185), "-o", aiff, text]);
  run("ffmpeg", ["-v", "error", "-y", "-i", aiff, "-af", `apad=pad_dur=${PAD}`, "-ar", "44100", "-b:a", "160k", file]);
  rmSync(aiff);
}

// Warn about `at` words that don't occur in the text (they would fire at 0s).
function warnAt(s, text, i) {
  const spoken = text.toLowerCase();
  for (const a of [...(s.beats ?? []).slice(1).map((b) => b.at), ...(s.fx ?? []).map((f) => f.at), s.headline?.at]) {
    if (typeof a === "string" && !spoken.includes(a.toLowerCase())) console.warn(`⚠️  scene ${i + 1}: "at": "${a}" not found in text`);
  }
}

const scenes = [];
for (const [i, s] of script.scenes.entries()) {
  const text = s.text.replace(/\*/g, "");
  if (silent) {
    // Reading time: ~0.4 s per word + a beat to look at the visual (override with scene "duration").
    const duration = s.duration ?? Math.max(3, text.split(/\s+/).length * 0.4 + 1.6);
    warnAt(s, text, i);
    scenes.push({ ...s, duration });
    continue;
  }
  const name = `${String(i + 1).padStart(2, "0")}.mp3`;
  const file = `${dir}/${name}`;
  // voice.file: one pre-recorded voiceover, cut at each scene's `start` (seconds) up to the next scene's.
  const end = script.scenes[i + 1]?.start;
  const stamp = voice.file ? `${voice.file}|${s.start}|${end}` : `${useEleven ? voice.elevenlabsVoiceId : voice.sayVoice ?? "Damayanti"}|${voice.sayRate ?? ""}|${text}`;
  // Only re-record scenes whose text or voice changed.
  if (!existsSync(file) || !existsSync(`${file}.txt`) || readFileSync(`${file}.txt`, "utf8") !== stamp) {
    console.log(`🎙  scene ${i + 1}: ${text}`);
    if (voice.file) {
      if (typeof s.start !== "number") throw new Error(`scene ${i + 1}: voice.file needs a numeric "start"`);
      run("ffmpeg", ["-v", "error", "-y", "-i", voice.file, "-ss", String(s.start), ...(end ? ["-to", String(end)] : []), "-ar", "44100", "-b:a", "192k", file]);
    } else await tts(text, file);
    writeFileSync(`${file}.txt`, stamp);
  }
  let duration = Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).trim());
  if (useEleven && !voice.file) duration += PAD; // ElevenLabs audio has no padding baked in
  // Loudness per video frame (30fps) → avatar mouth + word timing.
  const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", "3000", "-f", "s16le", "-"]);
  const amp = [];
  for (let o = 0; o + 200 <= pcm.length; o += 200) {
    let sum = 0;
    for (let j = o; j < o + 200; j += 2) sum += (pcm.readInt16LE(j) / 32768) ** 2;
    amp.push(Math.round(Math.min(1, Math.sqrt(sum / 100) * 4) * 100) / 100);
  }
  warnAt(s, text, i);
  scenes.push({ ...s, audio: `reels/${slug}/${name}`, duration, amp });
}
writeFileSync(`${dir}/data.json`, JSON.stringify({ ...script, scenes }, null, 2));

const props = JSON.stringify({ slug });
execFileSync("npx", ["remotion", "render", "Reel", `out/${slug}.raw.mp4`, `--props=${props}`], { stdio: "inherit" });
// Loudness to the social-media norm (-14 LUFS), video stream copied untouched.
run("ffmpeg", ["-v", "error", "-y", "-i", `out/${slug}.raw.mp4`, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", `out/${slug}.mp4`]);
rmSync(`out/${slug}.raw.mp4`);

// Self-check: one frame near the end of every scene, tiled into a contact sheet.
let t = 0;
const times = scenes.flatMap((s) => ((t += s.duration), [t - s.duration * 0.55, t - Math.min(0.5, s.duration / 4)]));
const cols = Math.min(times.length, 6);
const rows = Math.ceil(times.length / cols);
const select = times.map((x) => `lt(prev_t\\,${x.toFixed(2)})*gte(t\\,${x.toFixed(2)})`).join("+");
run("ffmpeg", ["-v", "error", "-y", "-i", `out/${slug}.mp4`, "-vf", `select='${select}',scale=360:-1,tile=${cols}x${rows}`, "-frames:v", "1", "-fps_mode", "vfr", `out/${slug}-check.jpg`]);
console.log(`\n✅ out/${slug}.mp4\n🔎 out/${slug}-check.jpg (2 frames per scene)\n🎙  voice: ${silent ? "none (silent)" : voice.file ? voice.file : useEleven ? "ElevenLabs" : "macOS say (" + (voice.sayVoice ?? "Damayanti") + ")"}`);
