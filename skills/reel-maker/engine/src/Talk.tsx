import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FxView } from "./Fx";
import { Headline } from "./Reel";
import { Sfx } from "./sfx";
import { C, F, Fx, Skin, Visual, bgStyle, clamp, pop, setSkin } from "./theme";
import { VisualView } from "./Visuals";

// Written by scripts/talk.mjs: raw video cut into segments; words and events already in output frames.
type Seg = { from: number; to: number; start: number; len: number };
type TWord = { w: string; em: boolean; f: number };
type Ev = { from: number; len: number } & (
  | { type: "zoom"; scale?: number }
  | { type: "headline"; text: string; num?: number }
  | { type: "broll"; mode?: "full" | "split"; visual?: Visual; clip?: string; image?: string }
  | { type: Fx["type"]; text?: string; x?: number; y?: number }
);
export type TalkData = { style?: Skin; music?: string; faceY?: number; video: string; segments: Seg[]; words: TWord[]; events: Ev[] };
export type TalkProps = { slug: string; data?: TalkData };

const ease = (x: number) => 1 - (1 - x) ** 3;
// 0→1 in, hold, 1→0 out over an event's frames.
const env = (frame: number, e: Ev, k = 8) => interpolate(frame, [e.from, e.from + k, e.from + e.len - k, e.from + e.len], [0, 1, 1, 0], { ...clamp, easing: ease });

export const Talk: React.FC<TalkProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: total } = useVideoConfig();
  if (!data) return null;
  setSkin(data.style);
  const ev = data.events;
  const brolls = ev.filter((e) => e.type === "broll") as Extract<Ev, { type: "broll" }>[];
  const broll = brolls.find((e) => frame >= e.from && frame < e.from + e.len);
  const split = broll && broll.mode === "split";

  // Camera: every jump cut alternates wide/close (hides the cut), slow push-in, smooth zoom events, punch on fx.
  const seg = data.segments.findIndex((s) => frame >= s.start && frame < s.start + s.len);
  const zoom = ev.reduce((a, e) => (e.type === "zoom" ? a + env(frame, e, 10) * ((e.scale ?? 1.3) - 1) : a), 0);
  const kick = ev.reduce((a, e) => (e.type !== "zoom" && e.type !== "broll" && frame >= e.from ? a + interpolate(frame - e.from, [0, 3, 14], [0, 0.04, 0], clamp) : a), 0);
  const scale = (seg % 2 ? 1.12 : 1) + interpolate(frame - (data.segments[seg]?.start ?? 0), [0, 90], [0, 0.03], clamp) + zoom + kick;
  const faceY = data.faceY ?? 38;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {data.music && <Audio src={staticFile(data.music)} volume={(f) => interpolate(f, [0, 15, total - 45, total], [0, 0.08, 0.08, 0], clamp)} />}

      {/* Speaker; in split b-roll it moves to the bottom half. */}
      <AbsoluteFill style={split ? { top: 960, overflow: "hidden" } : undefined}>
        <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: `50% ${faceY}%`, ...(split ? { top: -480, height: 1920 } : {}) }}>
          {data.segments.map((s, i) => (
            <Sequence key={i} from={s.start} durationInFrames={s.len} premountFor={15}>
              <OffthreadVideo src={staticFile(data.video)} trimBefore={Math.round(s.from * fps)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Sequence>
          ))}
        </AbsoluteFill>
      </AbsoluteFill>

      {brolls.map((e, i) => (
        <Sequence key={`b${i}`} from={e.from} durationInFrames={e.len}>
          <Broll e={e} />
          <Sfx name="whoosh" volume={0.4} />
        </Sequence>
      ))}

      {ev.map((e, i) =>
        e.type === "headline" ? (
          <Sequence key={`h${i}`} from={e.from} durationInFrames={e.len}>
            <div style={{ opacity: interpolate(frame, [e.from + e.len - 6, e.from + e.len], [1, 0], clamp), filter: "drop-shadow(0 6px 14px #000c)" }}>
              <Headline text={e.text} num={e.num} dark />
            </div>
            {e.text.replace(/[\s*]/g, "").split("").map((_, j) => <Sfx key={j} name="tick" at={j * 1.5} volume={0.25} />)}
            <Sfx name="stamp" at={e.text.length * 1.5} volume={0.6} />
          </Sequence>
        ) : e.type === "zoom" ? (
          <Sequence key={`z${i}`} from={e.from} layout="none"><Sfx name="punch" volume={0.4} /></Sequence>
        ) : e.type !== "broll" ? (
          <Sequence key={`f${i}`} from={e.from} durationInFrames={e.len}>
            <AbsoluteFill style={{ top: 300, bottom: 700, height: "auto" }}><FxView fx={{ ...e, at: i }} /></AbsoluteFill>
            <Sfx name={e.type} />
          </Sequence>
        ) : null,
      )}

      <Captions words={data.words} y={split ? 900 : 1260} />
    </AbsoluteFill>
  );
};

// B-roll: a reel visual, a photo or a clip; full screen, or the top half above the speaker.
const Broll: React.FC<{ e: Extract<Ev, { type: "broll" }> }> = ({ e }) => {
  const frame = useCurrentFrame();
  const k = env(frame + e.from, e, 7);
  const split = e.mode === "split";
  return (
    <AbsoluteFill style={{ bottom: split ? 960 : 0, height: "auto", overflow: "hidden", opacity: k, transform: `scale(${1.15 - k * 0.15})`, ...bgStyle("paper") }}>
      {e.clip && <OffthreadVideo src={e.clip.startsWith("http") ? e.clip : staticFile(e.clip)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      {e.image && <Img src={e.image.startsWith("http") ? e.image : staticFile(e.image)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1 + frame / 600})` }} />}
      {e.visual && (
        <AbsoluteFill style={// split: the reel stage (1240 tall) scaled into the 960px top half
          split ? { height: 1240, top: -140, transform: "scale(0.74)" } : { top: 300, bottom: 760, height: "auto" }}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", color: C.ink }}>
            <VisualView visual={e.visual} dur={e.len} />
          </AbsoluteFill>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// Viral-style captions: 1–3 words at a time, white with heavy outline, the spoken word pops in the accent colour.
const chunk = (words: TWord[]) => {
  const out: TWord[][] = [];
  for (const [i, w] of words.entries()) {
    const cur = out[out.length - 1];
    const gap = i > 0 && w.f - words[i - 1].f > 18;
    const len = cur ? cur.reduce((a, c) => a + c.w.length + 1, 0) : 0;
    if (!cur || cur.length >= 3 || len + w.w.length > 16 || gap || /[.,?!]$/.test(words[i - 1]?.w ?? "")) out.push([w]);
    else cur.push(w);
  }
  return out;
};

const Captions: React.FC<{ words: TWord[]; y: number }> = ({ words, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chunks = chunk(words);
  const line = [...chunks].reverse().find((c) => c[0].f <= frame);
  if (!line) return null;
  const last = line[line.length - 1];
  const next = words[words.indexOf(last) + 1];
  if (frame > (next ? next.f : last.f + 30) + 6 && frame - last.f > 24) return null; // hide in long pauses
  const s = pop(frame, fps, line[0].f);
  return (
    <div style={{ position: "absolute", top: y, left: 60, right: 60, textAlign: "center", transform: `scale(${0.85 + 0.15 * s})`, opacity: Math.min(1, s * 2) }}>
      {line.map((w, i) => {
        const on = frame >= w.f && (line[i + 1] ? frame < line[i + 1].f : true);
        const k = pop(frame, fps, w.f);
        return (
          <span key={i} style={{ display: "inline-block", margin: "0 12px", fontFamily: w.em ? F.serif : F.sans, fontWeight: w.em ? 400 : 700, fontSize: w.em ? 118 : 100, lineHeight: 1.1, textTransform: w.em ? "none" : "uppercase", color: w.em || on ? (C.emBg !== "transparent" ? C.emBg : C.sticky) : "#fff", opacity: frame >= w.f ? 1 : 0.55, transform: `scale(${on ? 1 + 0.08 * k : 1}) rotate(${on ? (i % 2 ? 1.5 : -1.5) : 0}deg)`, WebkitTextStroke: "14px #000", paintOrder: "stroke fill", textShadow: "0 8px 0 #000, 0 12px 30px #000a" }}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
