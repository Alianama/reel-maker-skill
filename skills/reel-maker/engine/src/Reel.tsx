import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FxView, Halftone } from "./Fx";
import { Sfx } from "./sfx";
import { parseWords, splitEm, timeOf, Word } from "./text";
import { bgStyle, Beat, C, F, ReelData, Scene, brand, clamp, pixelShadow, pop, setSkin, skin } from "./theme";
import { NumBadge, VisualView } from "./Visuals";
import { Rail } from "./SellUI";
import { VoxelBg } from "./voxel";
import { PopBg } from "./ChaseUI";

export type ReelProps = { slug: string; data?: ReelData };

// Silence appended after each scene's speech (must match PAD in scripts/make.mjs).
export const PAD = 0.35;


// Handle that glides between edge spots every few seconds, so it can't be cropped or blurred out in one place.
const WM_SPOTS: [number, number, number][] = [[70, 150, 0], [1010, 760, 90], [70, 1180, -90], [1010, 230, 90], [640, 1560, 0], [70, 620, -90]];
const Watermark: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hold = 4 * fps, move = 0.6 * fps;
  const i = Math.floor(frame / hold);
  const k = interpolate(frame % hold, [hold - move, hold], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const [a, b] = [WM_SPOTS[i % WM_SPOTS.length], WM_SPOTS[(i + 1) % WM_SPOTS.length]];
  const lerp = (n: number) => a[n] + (b[n] - a[n]) * k;
  return (
    <div style={{ position: "absolute", left: lerp(0), top: lerp(1), transform: `translate(${lerp(0) > 540 ? "-100%" : "0"}, -50%) rotate(${lerp(2)}deg)`, transformOrigin: lerp(0) > 540 ? "100% 50%" : "0 50%", fontFamily: F.sans, fontWeight: 700, fontSize: 40, color: "#fff", opacity: 0.75, WebkitTextStroke: "2px rgba(0,0,0,0.6)", textShadow: "0 2px 10px rgba(0,0,0,0.5)", whiteSpace: "nowrap", pointerEvents: "none" }}>
      {text}
    </div>
  );
};

export const Reel: React.FC<ReelProps> = ({ data }) => {
  const { fps } = useVideoConfig();
  if (!data) return null;
  setSkin(data.style);
  const lens = data.scenes.map((s) => Math.ceil(s.duration * fps));
  const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
  const total = lens.reduce((a, b) => a + b, 0);
  // Background music: louder when there is no narration; fades in/out.
  const mv = data.scenes.some((s) => s.audio) ? 0.1 : 0.32;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {data.music && <Audio src={staticFile(data.music)} volume={(f) => interpolate(f, [0, 15, total - 45, total], [0, mv, mv, 0], clamp)} />}
      {skin === "voxel" && <style>{"* { border-radius: 0 !important; }"}</style>}
      {data.scenes.map((s, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={lens[i]}>
          <SceneView scene={s} index={i} dur={lens[i]} />
          {data.rail && s.railStep !== undefined && <Rail steps={data.rail} active={s.railStep} />}
        </Sequence>
      ))}
      {data.scenes.map((s, i) =>
        i > 0 && s.transition === "halftone" ? (
          <Sequence key={`h${i}`} from={starts[i] - 12} durationInFrames={26}>
            <Halftone />
            <Sfx name="halftone" />
          </Sequence>
        ) : null,
      )}
      {data.watermark && <Watermark text={data.watermark} />}
    </AbsoluteFill>
  );
};

const bump = (frame: number, at: number, size: number) => (frame >= at ? interpolate(frame - at, [0, 3, 14], [0, size, 0], clamp) : 0);

const SceneView: React.FC<{ scene: Scene; index: number; dur: number }> = ({ scene, index, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const speech = scene.duration - PAD;
  const words = parseWords(scene.text, speech, fps, scene.amp);
  const at = (a: Beat["at"]) => Math.round(timeOf(a, words) * fps);

  const beats: Beat[] = scene.beats ?? (scene.visual ? [{ visual: scene.visual }] : []);
  const beatFrames = beats.map((b, i) => (i === 0 ? 0 : at(b.at)));
  const cur = beatFrames.reduce((c, bf, i) => (frame >= bf ? i : c), 0);
  const fxs = (scene.fx ?? []).map((f) => ({ ...f, f: at(f.at) }));
  const head = scene.headline;
  const headFrame = head ? at(head.at) : 0;
  const punches = [...beatFrames.slice(1), ...fxs.map((f) => f.f), ...(head ? [headFrame + head.text.length * 1.5] : [])];

  // Camera: slow push-in, punch on every beat/fx, transition in, zoom-blur out.
  const transition = scene.transition ?? "zoom";
  const push = interpolate(frame, [0, dur], [1, 1.06]);
  const kick = punches.reduce((a, p) => a + bump(frame, p, 0.045), 0);
  // First scene starts sharp: the hook frame must read instantly.
  const inK = index === 0 ? 0 : interpolate(frame, [0, 9], [1, 0], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const outK = interpolate(frame, [dur - 6, dur], [0, 1], clamp);
  const tin = transition === "whip" ? `translateX(${inK * 900}px) skewX(${inK * -12}deg)` : transition === "zoom" ? `scale(${1 + inK * 0.35})` : "";
  const camera: React.CSSProperties = {
    transform: `${tin} scale(${push + kick + outK * 0.25}) rotate(${kick * 8}deg)`,
    filter: `blur(${(transition === "halftone" ? 0 : inK * 22) + outK * 18}px)`,
    opacity: transition === "halftone" ? 1 : 1 - inK * 0.6,
  };
  const dark = scene.bg === "cork" || scene.bg === "dark";
  const stageTop = head ? 520 : 420;
  const nextBeat = (f: number) => beatFrames.find((bf) => bf > f) ?? dur;

  return (
    <AbsoluteFill style={skin === "voxel" ? undefined : bgStyle(scene.bg ?? "paper")}>
      {skin === "voxel" && <VoxelBg kind={scene.bg ?? "paper"} />}
      {skin === "pop" && <PopBg kind={scene.bg ?? "paper"} seed={index} />}
      {scene.audio && <Audio src={staticFile(scene.audio)} />}
      {transition !== "halftone" && <Sfx name={transition} volume={0.45} />}
      {beatFrames.slice(1).map((bf, i) => <Sequence key={`bs${i}`} from={bf} layout="none"><Sfx name="beat" volume={0.4} /></Sequence>)}
      {fxs.map((f, i) => <Sequence key={`fs${i}`} from={f.f} layout="none"><Sfx name={f.type} /></Sequence>)}
      {head && <Sequence from={Math.round(headFrame + head.text.length * 1.5)} layout="none"><Sfx name="stamp" volume={0.6} /></Sequence>}
      {head && head.text.replace(/[\s*]/g, "").split("").map((_, i) => <Sequence key={`tk${i}`} from={Math.round(headFrame + i * 1.5)} layout="none"><Sfx name="tick" volume={0.25} /></Sequence>)}

      <AbsoluteFill style={{ ...camera, transformOrigin: "50% 45%" }}>
        {head && (
          <Sequence from={headFrame} layout="none">
            <Headline {...head} dark={dark} />
          </Sequence>
        )}
        <AbsoluteFill style={{ top: stageTop, bottom: 260, height: "auto", color: dark ? "#fff" : C.ink }}>
          {beats.map((b, i) =>
            i < cur - 1 ? null : (
              <Sequence key={i} from={beatFrames[i]}>
                <BeatView beat={b} dur={nextBeat(beatFrames[i]) - beatFrames[i]} leaving={i < cur ? frame - beatFrames[cur] : -1} />
              </Sequence>
            ),
          )}
          {fxs.map((f, i) => (
            <Sequence key={i} from={f.f} durationInFrames={f.type === "x" || f.type === "check" || f.type === "note" ? Math.max(1, nextBeat(f.f) - f.f) : 40}>
              <FxView fx={f} />
            </Sequence>
          ))}
        </AbsoluteFill>
      </AbsoluteFill>

      <Caption words={words} t={t} dark={dark} />
    </AbsoluteFill>
  );
};

// Previous beat shrinks into the bottom-left corner and stays as a small sticker (crossed out if `cross`).
const BeatView: React.FC<{ beat: Beat; dur: number; leaving: number }> = ({ beat, dur, leaving }) => {
  const k = leaving < 0 ? 0 : interpolate(leaving, [0, 10], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translate(${k * -330}px, ${k * 520}px) scale(${1 - k * 0.68}) rotate(${k * -7}deg)`, filter: `blur(${Math.sin(k * Math.PI) * 8}px)` }}>
      <VisualView visual={beat.visual} dur={dur} />
      {beat.cross && k > 0.9 && (
        <svg width={600} height={600} style={{ position: "absolute" }}>
          <path d="M80 80 L520 520 M520 80 L80 520" stroke={C.red} strokeWidth={48} strokeLinecap="round" />
        </svg>
      )}
    </AbsoluteFill>
  );
};

// Stamp headline typed letter by letter, with a numbered badge on the right.
export const Headline: React.FC<{ text: string; num?: number; dark: boolean }> = ({ text, num, dark }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let n = 0;
  const words = splitEm(text);
  return (
    <div style={{ position: "absolute", top: 370, left: 80, right: 80, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontFamily: F.stamp, fontSize: Math.min(skin === "voxel" ? 150 : 120, Math.floor(((skin === "voxel" ? 150 : 120) * 11) / Math.max(11, text.replace(/\*/g, "").length))), lineHeight: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>
          {words.map((w, wi) => (
            <span key={wi} style={{ marginRight: 26, color: w.em ? (skin === "voxel" ? C.emBg : brand() && dark ? C.emBg : C.red) : dark ? "#fff" : C.ink, textShadow: pixelShadow(w.em || dark ? "#111827" : "#A3E635") }}>
              {w.w.split("").map((ch, ci) => {
                const d = n++ * 1.5;
                const k = interpolate(frame - d, [0, 4], [0, 1], clamp);
                return <span key={ci} style={{ display: "inline-block", opacity: k > 0 ? 1 : 0, transform: `scale(${2 - k}) translateY(${(1 - k) * -20}px)`, filter: `blur(${(1 - k) * 6}px)` }}>{ch}</span>;
              })}
            </span>
          ))}
        </div>
      </div>
      {num !== undefined && (
        <div style={{ transform: `scale(${pop(frame, fps, 4)}) rotate(${(1 - pop(frame, fps, 4)) * 90}deg)` }}>
          <NumBadge n={num} size={110} dots={num} />
        </div>
      )}
    </div>
  );
};

// One short phrase at a time; the next word shows ghosted a moment before it is spoken.
const chunk = (words: Word[]) => {
  const out: Word[][] = [[]];
  for (const w of words) {
    const cur = out[out.length - 1];
    const len = cur.reduce((a, c) => a + c.w.length + 1, 0);
    if (cur.length >= 5 || len + w.w.length > 30) out.push([w]);
    else cur.push(w);
  }
  return out.filter((c) => c.length);
};

const Caption: React.FC<{ words: Word[]; t: number; dark: boolean }> = ({ words, t, dark }) => {
  const chunks = chunk(words);
  const cur = Math.max(0, words.filter((w) => w.start <= t + 0.2).length - 1);
  let seen = 0;
  const line = chunks.find((c) => (seen += c.length) > cur) ?? chunks[chunks.length - 1];
  const ink = dark ? "#fff" : C.ink;
  return (
    <div style={{ position: "absolute", top: 120, left: 70, right: 70, lineHeight: 1.04, letterSpacing: -1.5 }}>
      {line.filter((w) => w.start <= t + 0.2).map((w, i) => {
        const spoken = interpolate(t - w.start, [0, 0.12], [0, 1], clamp);
        const ghost = interpolate(t - w.start, [-0.2, 0], [0, 1], clamp);
        return (
          <span key={i} style={{ display: "inline-block", marginRight: 20, opacity: 0.35 + 0.65 * Math.max(ghost * 0.4, spoken), transform: `translateY(${(1 - ghost) * 12}px)`, fontFamily: w.em ? F.serif : F.sans, fontWeight: w.em && skin !== "voxel" ? 400 : 700, color: spoken > 0.5 ? (w.em ? C.em : ink) : dark ? "#ffffff80" : C.ghost, fontSize: w.em ? 104 : 86, background: w.em && spoken > 0.5 ? C.emBg : undefined, padding: w.em && C.emBg !== "transparent" ? "0 14px" : undefined, textShadow: spoken > 0.5 ? pixelShadow(dark ? "#365314" : "#A3E635", 5) : "none" }}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
