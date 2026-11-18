import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, Fx, cardShadow, clamp, pop, skin } from "./theme";

export const FxView: React.FC<{ fx: Fx }> = ({ fx }) => {
  const style: React.CSSProperties = { position: "absolute", left: "50%", top: "50%", transform: `translate(${fx.x ?? 0}px, ${fx.y ?? 0}px)` };
  return (
    <div style={style}>
      {fx.type === "burst" && <Burst seed={String(fx.at)} />}
      {fx.type === "ring" && <Ring />}
      {fx.type === "x" && <Cross />}
      {fx.type === "check" && <Check />}
      {fx.type === "note" && <Note text={fx.text ?? ""} />}
    </div>
  );
};

// Confetti of red/black bits flying out with gravity.
const Burst: React.FC<{ seed: string }> = ({ seed }) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 22 }, (_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const v = 18 + random(`${seed}v${i}`) * 26;
        const x = Math.cos(a) * v * f;
        const y = Math.sin(a) * v * f + 1.6 * f * f;
        const size = 10 + random(`${seed}s${i}`) * 18;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size * (i % 3 === 0 ? 1 : 0.5), background: i % 3 === 1 ? C.ink : C.red, borderRadius: i % 4 === 0 ? size : 2, transform: `rotate(${f * (8 + i * 3)}deg)`, opacity: interpolate(f, [14, 26], [1, 0], clamp) }} />
        );
      })}
    </>
  );
};

const Ring: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {[0, 6].map((d) => {
        const k = interpolate(f - d, [0, 22], [0, 1], clamp);
        const r = 60 + k * 300;
        return <div key={d} style={{ position: "absolute", left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: r, border: `${6 * (1 - k) + 1}px solid ${C.red}`, opacity: 1 - k }} />;
      })}
    </>
  );
};

const Stroke: React.FC<{ d: string; delay: number; len: number; width?: number; color?: string }> = ({ d, delay, len, width = 26, color = C.red }) => {
  const f = useCurrentFrame();
  const k = interpolate(f - delay, [0, 6], [0, 1], clamp);
  return <path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - k)} />;
};

const Cross: React.FC = () => (
  <svg width={560} height={560} style={{ position: "absolute", left: -280, top: -280, overflow: "visible", filter: "drop-shadow(0 6px 8px #0003)" }}>
    <Stroke d="M40 40 L520 520" delay={0} len={680} />
    <Stroke d="M520 40 L40 520" delay={5} len={680} />
  </svg>
);

const Check: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, fps);
  return (
    <div style={{ position: "absolute", left: -70, top: -70, width: 140, height: 140, borderRadius: 70, background: C.red, boxShadow: cardShadow, transform: `scale(${s}) rotate(${(1 - s) * -90}deg)`, border: "6px solid #fff" }}>
      <svg width={128} height={128} style={{ overflow: "visible" }}>
        <Stroke d="M32 66 L56 90 L98 40" delay={3} len={110} width={16} color={C.onRed} />
      </svg>
    </div>
  );
};

const Note: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, fps);
  return (
    <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${interpolate(s, [0, 1], [1.6, 1])}) rotate(${-4 + Math.sin(f / 10) * 1.5}deg)`, opacity: Math.min(1, s * 2), background: C.sticky, padding: "22px 30px", boxShadow: "0 14px 24px #0003", fontFamily: F.serif, fontSize: 64, color: C.ink, whiteSpace: "nowrap" }}>
      <div style={{ position: "absolute", top: -14, left: "42%", width: 80, height: 28, background: "#ffffff88", transform: "rotate(-3deg)" }} />
      {text}
    </div>
  );
};

// Black halftone dots sweeping diagonally over the cut between two scenes.
export const Halftone: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const gap = 46;
  const cols = Math.ceil(width / gap) + 1;
  const rows = Math.ceil(height / gap) + 1;
  if (skin === "pop") return <IrisWipe />;
  const dots = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const d = ((x / cols) * 0.4 + (y / rows) * 0.6) * 7;
      const k = interpolate(f - d, [0, 6, 10, 16], [0, 1, 1, 0], clamp);
      if (k <= 0.01) continue;
      // Voxel skin: square pixel blocks (some lime) instead of round dots.
      if (skin === "voxel") dots.push(<rect key={`${x}-${y}`} x={x * gap - (k * gap) / 2} y={y * gap - (k * gap) / 2} width={k * gap + 1} height={k * gap + 1} fill={random(`h${x}-${y}`) < 0.22 ? C.emBg : C.ink} />);
      else dots.push(<circle key={`${x}-${y}`} cx={x * gap} cy={y * gap} r={k * gap * 0.72} fill={skin === "lime" && random(`h${x}-${y}`) < 0.3 ? C.emBg : skin === "lime" ? C.red : C.ink} />);
    }
  }
  return <svg width={width} height={height} style={{ position: "absolute" }}>{dots}</svg>;
};

// Pop skin transition: lime then charcoal circles grow from the centre, cover the cut, and shrink away with a sparkle.
const IrisWipe: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const R = Math.hypot(width, height) / 2 + 40;
  const r = (d: number) => R * interpolate(f - d, [0, 9, 14, 24], [0, 1, 1, 0], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  return (
    <svg width={width} height={height} style={{ position: "absolute" }}>
      <circle cx={width / 2} cy={height * 0.45} r={r(0)} fill={C.emBg} />
      <circle cx={width / 2} cy={height * 0.45} r={r(3)} fill={C.ink} />
    </svg>
  );
};
