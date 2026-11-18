// One-time: synthesizes royalty-free background music → public/music/<style>.wav.
//   node scripts/music.mjs            chiptune: 120 BPM, I–V–vi–IV in C, square-wave arp + lead (voxel)
//   node scripts/music.mjs lofi       lofi: 88 BPM, Fmaj7–Em7–Dm7–Cmaj7, soft e-piano + bell + swung drums (calm/smart topics)
//   node scripts/music.mjs bounce     bounce: 108 BPM, F–Dm–Bb–C, marimba plucks + staccato bass + snaps/shaker + whistle lead (playful, cartoon/pop skin)
//   node scripts/music.mjs groove     groove: 116 BPM, Am–F–C–G, four-on-the-floor + offbeat stabs + pluck hook (upbeat product demos)
// Sections: A (no lead) and B (+ melody), alternating every 8 bars.
import { mkdirSync, writeFileSync } from "node:fs";

const STYLE = process.argv[2] ?? "chiptune";
if (!["chiptune", "lofi", "groove", "bounce"].includes(STYLE)) throw new Error(`unknown style ${STYLE}`);
const SR = 44100;
const BEAT = STYLE === "lofi" ? 60 / 88 : STYLE === "groove" ? 60 / 116 : STYLE === "bounce" ? 60 / 108 : 0.5;
const BAR = 4 * BEAT;
const LEN = 48 * BAR;
const out = new Float32Array(Math.ceil(LEN * SR));
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

let seed = 1;
const noise = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x3fffffff) - 1;

// Adds one note: wave(phase) shaped by an exponential decay, gated to `len` seconds.
const note = (start, len, f, vol, wave, decay = 6) => {
  const s0 = Math.floor(start * SR);
  const n = Math.floor((len + 0.03) * SR);
  for (let i = 0; i < n && s0 + i < out.length; i++) {
    const t = i / SR;
    const gate = t < len ? 1 : 1 - (t - len) / 0.03;
    out[s0 + i] += wave(t * f, t) * vol * Math.min(1, t / 0.004) * Math.exp(-decay * t) * gate;
  }
};
const random01 = (k) => ((Math.sin(k * 12.9898) * 43758.5453) % 1 + 1) % 1;
const pulse = (duty) => (ph) => ((ph % 1) < duty ? 1 : -1);
const tri = (ph) => 4 * Math.abs((ph % 1) - 0.5) - 1;

const kick = (start) => {
  const s0 = Math.floor(start * SR);
  for (let i = 0; i < 0.25 * SR; i++) {
    const t = i / SR;
    out[s0 + i] += Math.sin(2 * Math.PI * (45 * t + (105 / 30) * (1 - Math.exp(-30 * t)))) * Math.exp(-12 * t) * 0.55;
  }
};
const hitNoise = (start, len, vol, decay, high) => {
  const s0 = Math.floor(start * SR);
  let prev = 0;
  for (let i = 0; i < len * SR; i++) {
    const x = noise();
    out[s0 + i] += (high ? x - prev : x) * vol * Math.exp(-decay * (i / SR));
    prev = x;
  }
};

const CHORDS = [
  { root: 36, arp: [72, 76, 79, 84] }, // C
  { root: 43, arp: [71, 74, 79, 83] }, // G
  { root: 45, arp: [69, 72, 76, 81] }, // Am
  { root: 41, arp: [69, 72, 77, 81] }, // F
];
// [beat in 8-bar phrase, midi, length in beats]
const MELODY = [
  [0, 76, 1], [1, 79, 1], [2, 76, 0.5], [2.5, 74, 0.5], [3, 72, 1],
  [4, 74, 1], [5, 71, 1], [6, 74, 1], [7, 79, 1],
  [8, 72, 1], [9, 76, 1], [10, 81, 1.5], [11.5, 79, 0.5],
  [12, 77, 1], [13, 76, 1], [14, 72, 2],
  [16, 76, 0.5], [16.5, 76, 0.5], [17, 79, 1], [18, 84, 1], [19, 79, 1],
  [20, 83, 1], [21, 81, 0.5], [21.5, 79, 0.5], [22, 74, 2],
  [24, 76, 1], [25, 81, 1], [26, 84, 1], [27, 83, 1],
  [28, 81, 1], [29, 79, 1], [30, 76, 2],
];

const LOFI = [
  { root: 41, keys: [65, 69, 72, 76] }, // Fmaj7
  { root: 40, keys: [64, 67, 71, 74] }, // Em7
  { root: 38, keys: [62, 65, 69, 72] }, // Dm7
  { root: 36, keys: [60, 64, 67, 71] }, // Cmaj7
];
const BELL = [[0, 81, 1], [1.5, 79, 0.5], [2, 76, 2], [4, 76, 1], [5, 74, 1], [6, 72, 2], [8, 74, 1], [9.5, 76, 0.5], [10, 79, 2], [12, 76, 1.5], [13.5, 74, 0.5], [14, 72, 2],
  [16, 84, 1], [17, 81, 1], [18, 79, 2], [20, 76, 1], [21, 79, 1], [22, 74, 2], [24, 72, 1], [25, 74, 1], [26, 76, 1.5], [27.5, 74, 0.5], [28, 72, 4]];
const epiano = (ph) => Math.sin(2 * Math.PI * ph) + 0.25 * Math.sin(4 * Math.PI * ph) + 0.08 * Math.sin(6 * Math.PI * ph);
const sine = (ph) => Math.sin(2 * Math.PI * ph);
const swing = (e) => (e % 2 ? (e - 1) * (BEAT / 2) + BEAT * 0.62 : e * (BEAT / 2));

for (let bar = 0; STYLE === "lofi" && bar < LEN / BAR; bar++) {
  const t0 = bar * BAR;
  const c = LOFI[bar % 4];
  for (const at of [0, 2.5]) for (const k of c.keys) note(t0 + at * BEAT, BEAT * 1.4, hz(k), 0.045, epiano, 1.8);
  note(t0, BEAT * 1.8, hz(c.root), 0.3, sine, 1.5);
  note(t0 + 2 * BEAT, BEAT * 1.2, hz(c.root + 7), 0.22, sine, 2);
  kick(t0);
  kick(t0 + 2.5 * BEAT);
  for (const b of [1, 3]) hitNoise(t0 + b * BEAT, 0.15, 0.12, 22, false);
  for (let e = 0; e < 8; e++) hitNoise(t0 + swing(e), 0.04, 0.03, 70, true);
  for (let k = 0; k < 6; k++) hitNoise(t0 + random01(bar * 7 + k) * BAR, 0.004, 0.05, 400, true); // vinyl crackle
  if (Math.floor(bar / 8) % 2 === 1 && bar % 8 === 0) for (const [b, m, l] of BELL) note(t0 + b * BEAT, l * BEAT, hz(m), 0.07, sine, 2.5);
}

const GROOVE = [
  { root: 45, stab: [69, 72, 76] }, // Am
  { root: 41, stab: [69, 72, 77] }, // F
  { root: 36, stab: [67, 72, 76] }, // C
  { root: 43, stab: [67, 71, 74] }, // G
];
const HOOK = [[0, 76], [0.75, 79], [1.5, 81], [2.5, 79], [3, 76], [4, 72], [4.75, 74], [5.5, 76], [6.5, 74], [7, 72], [8, 77], [8.75, 76], [9.5, 72], [10.5, 74], [12, 79], [12.75, 81], [13.5, 83], [14.5, 79]];
const saw = (ph) => 2 * (ph % 1) - 1;
for (let bar = 0; STYLE === "groove" && bar < LEN / BAR; bar++) {
  const t0 = bar * BAR;
  const c = GROOVE[bar % 4];
  const section = Math.floor(bar / 8) % 2;
  for (let b = 0; b < 4; b++) {
    kick(t0 + b * BEAT);
    hitNoise(t0 + b * BEAT + BEAT / 2, 0.12, 0.09, 30, true); // open hat
    if (b % 2) for (const d of [0, 0.012, 0.024]) hitNoise(t0 + b * BEAT + d, 0.14, 0.12, 24, false); // clap
    for (const k of c.stab) note(t0 + b * BEAT + BEAT / 2, BEAT * 0.3, hz(k), 0.035, saw, 9);
    note(t0 + b * BEAT + BEAT / 2, BEAT * 0.4, hz(c.root + 12), 0.2, tri, 4);
    note(t0 + b * BEAT + BEAT * 0.75, BEAT * 0.2, hz(c.root + 24), 0.1, tri, 8);
  }
  if (bar % 8 === 7) for (let k = 0; k < 8; k++) hitNoise(t0 + 2 * BEAT + k * BEAT / 4, 0.08, 0.05 + k * 0.015, 28, false);
  if (section === 1 && bar % 4 === 0) for (const [b, m] of HOOK) note(t0 + b * BEAT, BEAT * 0.45, hz(m), 0.08, pulse(0.3), 6);
}

const BOUNCE = [
  { root: 41, keys: [65, 69, 72] }, // F
  { root: 38, keys: [62, 65, 69] }, // Dm
  { root: 46, keys: [65, 70, 74] }, // Bb
  { root: 36, keys: [64, 67, 72] }, // C
];
const WHISTLE = [[0, 77, 0.5], [0.5, 81, 0.5], [1, 84, 1], [2.5, 81, 0.5], [3, 79, 1], [4, 74, 0.5], [4.5, 77, 0.5], [5, 81, 1.5], [7, 79, 1],
  [8, 82, 0.5], [8.5, 81, 0.5], [9, 79, 1], [10, 77, 1], [12, 76, 0.5], [12.5, 77, 0.5], [13, 79, 1], [14, 72, 2]];
const marimba = (ph) => Math.sin(2 * Math.PI * ph) + 0.3 * Math.sin(8 * Math.PI * ph);
for (let bar = 0; STYLE === "bounce" && bar < LEN / BAR; bar++) {
  const t0 = bar * BAR;
  const c = BOUNCE[bar % 4];
  const section = Math.floor(bar / 8) % 2;
  // marimba pattern on 8ths: chord tones bouncing up and down
  const pat = [0, 2, 1, 2, 0, 2, 1, 2];
  for (let e = 0; e < 8; e++) if (e !== 3) note(t0 + e * BEAT / 2, 0.18, hz(c.keys[pat[e]] + (e === 6 ? 12 : 0)), 0.07, marimba, 14);
  for (const b of [0, 1.5, 2, 3.5]) note(t0 + b * BEAT, BEAT * 0.35, hz(c.root + (b === 1.5 ? 7 : b === 3.5 ? 12 : 0)), 0.32, tri, 7);
  kick(t0);
  kick(t0 + 2 * BEAT);
  for (const b of [1, 3]) { hitNoise(t0 + b * BEAT, 0.06, 0.16, 45, true); hitNoise(t0 + b * BEAT + 0.008, 0.05, 0.1, 50, true); } // finger snap
  for (let s16 = 0; s16 < 16; s16++) hitNoise(t0 + s16 * BEAT / 4, 0.03, s16 % 2 ? 0.025 : 0.045, 90, true); // shaker
  if (bar % 8 === 7) for (let k = 0; k < 4; k++) note(t0 + (3 + k / 4) * BEAT, 0.1, hz(84 + k * 2), 0.06, marimba, 18); // fill
  if (section === 1 && bar % 4 === 0) for (const [b, m, l] of WHISTLE) note(t0 + b * BEAT, l * BEAT * 0.85, hz(m), 0.06, (ph, t) => Math.sin(2 * Math.PI * ph * (1 + 0.006 * Math.sin(2 * Math.PI * 5.5 * t))), 1.2);
}

for (let bar = 0; STYLE === "chiptune" && bar < LEN / BAR; bar++) {
  const t0 = bar * BAR;
  const c = CHORDS[bar % 4];
  const section = Math.floor(bar / 8) % 2; // 0 = A, 1 = B (melody)
  for (let e = 0; e < 8; e++) note(t0 + e * BEAT / 2, 0.2, hz(c.root + (e % 2 ? 12 : 0)), 0.22, tri, 3);
  for (let s = 0; s < 16; s++) note(t0 + s * BEAT / 4, 0.11, hz(c.arp[s % 4]), 0.06, pulse(0.25), 12);
  for (let b = 0; b < 4; b++) {
    if (b % 2 === 0) kick(t0 + b * BEAT);
    else {
      hitNoise(t0 + b * BEAT, 0.18, 0.22, 18, false);
      note(t0 + b * BEAT, 0.08, 185, 0.12, tri, 25);
    }
    hitNoise(t0 + b * BEAT + BEAT / 2, 0.05, 0.07, 60, true);
  }
  if (bar % 8 === 7) for (let k = 0; k < 4; k++) hitNoise(t0 + 3 * BEAT + k * BEAT / 4, 0.1, 0.12 + k * 0.03, 25, false); // fill
  if (section === 1 && bar % 8 === 0)
    for (const [b, m, l] of MELODY) note(t0 + b * BEAT, l * BEAT * 0.9, hz(m), 0.09, (ph, t) => pulse(0.5)(ph * (1 + 0.004 * Math.sin(2 * Math.PI * 6 * t))), 1.5);
}

// Soft clip, then 16-bit mono WAV.
const pcm = Buffer.alloc(44 + out.length * 2);
pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + out.length * 2, 4); pcm.write("WAVEfmt ", 8);
pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(SR, 24);
pcm.writeUInt32LE(SR * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write("data", 36); pcm.writeUInt32LE(out.length * 2, 40);
let peak = 0;
for (let i = 0; i < out.length; i++) {
  const v = Math.tanh(out[i] * 1.2) * 0.85;
  peak = Math.max(peak, Math.abs(v));
  pcm.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
}
console.assert(peak > 0.3 && peak <= 0.85, `unexpected peak ${peak}`);
mkdirSync("public/music", { recursive: true });
writeFileSync(`public/music/${STYLE}.wav`, pcm);
console.log(`🎵 public/music/${STYLE}.wav (${LEN}s, peak ${peak.toFixed(2)})`);
