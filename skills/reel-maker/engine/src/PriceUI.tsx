// "Trik harga" visuals: hanging price tags, left-digit reading, menu losing its "Rp", coin stacks, popcorn decoy,
// puppet cart, follow card, minimarket aisle. Timing props are seconds from the start of the visual (matched to the VO).
import { Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "./sfx";
import { C, F, clamp } from "./theme";
import { Icon } from "./Visuals";

export const GREY = "#9CA3AF";
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  // bouncy spring (overshoots) so things land with life instead of sliding in
  const sp = (s: number, damping = 9) => spring({ frame: frame - f(s), fps, config: { damping, stiffness: 160, mass: 0.8 } });
  return { frame, fps, f, sp };
};
// Decaying pendulum, re-kicked at every start frame.
export const swing = (frame: number, starts: number[], amp = 14, w = 0.22, decay = 26) =>
  starts.reduce((a, s) => (frame < s ? a : a + amp * Math.exp(-(frame - s) / decay) * Math.sin((frame - s) * w)), 0);
// Landing squash impulse.
export const squash = (frame: number, land: number, k = 0.28) => {
  const t = frame - land;
  const v = t < 0 ? 0 : Math.exp(-t / 6) * Math.cos(t * 0.6) * k;
  return `scale(${1 + v}, ${1 - v})`;
};
export const float = (frame: number, k = 0, amp = 10) => Math.sin(frame / 14 + k) * amp;
export const grow = (s: number, rise = 50): React.CSSProperties => ({ opacity: Math.min(1, Math.max(0, s * 2)), transform: `translateY(${(1 - Math.min(s, 1)) * rise}px) scale(${Math.max(0, s)})` });
export const stamp = (s: number, rot = -8, size = 110): React.CSSProperties => ({
  transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [2.6, 1])})`, opacity: Math.min(1, s * 2.5), fontSize: size,
  border: `9px solid ${C.ink}`, color: C.ink, fontFamily: F.stamp, padding: "0 34px", borderRadius: 18, background: C.emBg, whiteSpace: "nowrap", boxShadow: `10px 10px 0 ${C.ink}`,
});

export const Coin: React.FC<{ size?: number; label?: string }> = ({ size = 70, label = "Rp" }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: C.emBg, border: `${Math.max(3, size / 16)}px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.stamp, fontSize: size * (label.length > 3 ? 0.26 : 0.38), color: C.em, boxShadow: `inset -${size / 10}px -${size / 10}px 0 #84CC16` }}>{label}</div>
);

// Projectile particles from (x, y) starting at frame `at`.
export const Particles: React.FC<{ at: number; n: number; seed: string; x: number; y: number; speed?: number; up?: number; g?: number; life?: number; item: (i: number) => React.ReactNode }> = ({ at, n, seed, x, y, speed = 14, up = 10, g = 0.9, life = 40, item }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > life) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const v = speed * (0.5 + random(`${seed}v${i}`));
        const px = x + Math.cos(a) * v * t;
        const py = y + (Math.sin(a) * v - up) * t + (g * t * t) / 2;
        const rot = (random(`${seed}r${i}`) - 0.5) * 30 * t;
        return <div key={i} style={{ position: "absolute", left: px, top: py, transform: `translate(-50%,-50%) rotate(${rot}deg)`, opacity: interpolate(t, [life - 12, life], [1, 0], clamp), pointerEvents: "none" }}>{item(i)}</div>;
      })}
    </>
  );
};
export const Spark: React.FC<{ size?: number; color?: string }> = ({ size = 34, color = C.emBg }) => (
  <svg width={size} height={size} viewBox="0 0 20 20"><path d="M10 0 L12.5 7.5 L20 10 L12.5 12.5 L10 20 L7.5 12.5 L0 10 L7.5 7.5 Z" fill={color} stroke={C.ink} strokeWidth={1.2} /></svg>
);

// Soft lime shapes drifting behind every visual.
export const Deco: React.FC<{ seed: string; w: number; h: number; n?: number }> = ({ seed, w, h, n = 7 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const r = (k: string) => random(`${seed}${k}${i}`);
        const size = 30 + r("s") * 70;
        const ring = r("t") > 0.55;
        const x = r("x") * w + Math.sin(frame / (40 + r("p") * 30) + i) * 30;
        const y = r("y") * h + Math.cos(frame / (50 + r("q") * 30) + i) * 24;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", background: ring ? "transparent" : `${C.emBg}55`, border: ring ? `6px solid ${C.emBg}88` : "none", transform: `scale(${0.9 + Math.sin(frame / 20 + i) * 0.1})` }} />;
      })}
    </>
  );
};

// ── 1. Hook: two shelf tags hang on strings; 10.000 slams in, a Rp100 coin rolls under, "BEDA" stamp.
const Label: React.FC<{ price: string; dim?: boolean }> = ({ price, dim }) => (
  <div style={{ width: 400, background: C.card, border: `6px solid ${C.ink}`, borderRadius: 20, boxShadow: `12px 12px 0 ${C.ink}`, overflow: "hidden" }}>
    <div style={{ background: dim ? GREY : C.red, color: "#fff", fontFamily: F.stamp, fontSize: 44, padding: "8px 0", textAlign: "center", letterSpacing: 6 }}>HARGA</div>
    <div style={{ fontFamily: F.stamp, fontSize: 118, textAlign: "center", color: dim ? GREY : C.ink, padding: "6px 0 16px" }}><span style={{ fontSize: 52 }}>Rp </span>{price}</div>
  </div>
);
export const Tag: React.FC<{ price: string; vs: string; diff: string; at: [number, number] }> = ({ price, vs, diff, at }) => {
  const { frame, f, sp } = useT();
  const a0 = f(0.15), a1 = f(at[0]), a2 = f(at[1]);
  const dropL = sp(0.15, 10), dropR = sp(at[0], 10);
  const roll = interpolate(frame, [a2 - 14, a2 + 6], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const hang = (x: number, drop: number, kicks: number[], k: number, child: React.ReactNode) => {
    const ang = swing(frame, kicks, 12) + Math.sin(frame / 22 + k) * 2;
    return (
      <div style={{ position: "absolute", left: x, top: (1 - drop) * -800, width: 400, transformOrigin: "50% 0", transform: `rotate(${ang}deg)` }}>
        <div style={{ margin: "0 auto", width: 6, height: 170, background: C.ink }} />
        <div style={{ margin: "-14px auto 0", width: 28, height: 28, borderRadius: "50%", background: C.emBg, border: `5px solid ${C.ink}`, position: "relative", zIndex: 1 }} />
        <div style={{ marginTop: -10 }}>{child}</div>
      </div>
    );
  };
  return (
    <div style={{ width: 960, height: 900, position: "relative" }}>
      <Deco seed="tag" w={960} h={900} />
      <Sfx name="whoosh" at={a0} volume={0.45} />
      <Sfx name="punch" at={a0 + 9} volume={0.4} />
      <Sfx name="whip" at={a1 - 4} volume={0.5} />
      <Sfx name="punch" at={a1 + 8} volume={0.55} />
      <Sfx name="error" at={a1 + 12} volume={0.25} />
      {[0, 5, 10, 15].map((k) => <Sfx key={k} name="tick" at={a2 - 14 + k} volume={0.3} />)}
      <Sfx name="coin" at={a2 + 4} volume={0.55} />
      <Sfx name="stamp" at={a2 + 10} volume={0.7} />
      <div style={{ position: "absolute", left: 40, right: 40, top: 0, height: 14, background: C.ink, borderRadius: 7 }} />
      {hang(40, dropL, [a0 + 8, a1 + 8], 0, <div style={{ transform: squash(frame, a0 + 9) }}><Label price={price} /></div>)}
      {frame >= a1 - 10 && hang(520, dropR, [a1 + 8], 2, <div style={{ transform: squash(frame, a1 + 9) }}><Label price={vs} dim /></div>)}
      <Particles at={a1 + 8} n={8} seed="tagS" x={720} y={240} speed={12} item={() => <Spark size={30} />} />
      {frame >= a2 - 14 && (
        <div style={{ position: "absolute", top: 560, left: interpolate(roll, [0, 1], [-160, 400]), transform: `rotate(${roll * 720}deg) translateY(${Math.abs(Math.sin(roll * 9)) * -20}px)` }}>
          <Coin size={150} label={diff} />
        </div>
      )}
      <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", justifyContent: "center" }}><div style={stamp(sp(at[1] + 0.33, 12), -5, 74)}>BEDA {diff}</div></div>
    </div>
  );
};

// ── 2. The eye wanders in from the left, overshoots, snaps back to the first digit; the rest crumbles and dims.
const SLOTS: { ch: string; w: number; size?: number }[] = [{ ch: "Rp", w: 170, size: 120 }, { ch: "9", w: 170 }, { ch: ".", w: 80 }, { ch: "9", w: 170 }, { ch: "0", w: 170 }, { ch: "0", w: 170 }];
const slotX = SLOTS.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + SLOTS[i - 1].w : 15], []);
export const Scan: React.FC<{ at: [number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const a0 = f(at[0]), a1 = f(at[1]);
  const first = slotX[1] + 85;
  // eye path: off-screen → past the 9 (curious) → spring back onto the 9 at the lock word
  const wander = interpolate(frame, [a0, a1 - 6], [-120, first + 260], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const back = sp(at[1], 10);
  const eyeX = frame < a1 ? wander : interpolate(back, [0, 1], [first + 260, first]);
  const blink = [40, 95, 150, 210].some((b) => frame >= b && frame < b + 6) ? 0.15 : 1;
  const lock = sp(at[1], 14);
  const ring = interpolate(frame, [a1, a1 + 14], [1, 0], clamp);
  return (
    <div style={{ width: 960, height: 760, position: "relative" }}>
      <Deco seed="scan" w={960} h={760} />
      {SLOTS.map((_, i) => <Sfx key={i} name="pop" at={3 + i * 4} volume={0.4} />)}
      <Sfx name="slide" at={a0} volume={0.45} />
      {[0, 8, 16, 24].map((k) => <Sfx key={k} name="blip" at={a0 + k} volume={0.22} />)}
      <Sfx name="whip" at={a1} volume={0.45} />
      <Sfx name="ring" at={a1 + 4} volume={0.6} />
      <Sfx name="x" at={a1 + 8} volume={0.3} />
      {SLOTS.map((s, i) => {
        const d = sp(0.1 + i * 0.13, 8);
        const off = i !== 1;
        const shake = off && frame >= a1 && frame < a1 + 12 ? Math.sin(frame * 2.5) * 10 : 0;
        return (
          <div key={i} style={{ position: "absolute", left: slotX[i], top: 270, width: s.w, height: 360, display: "flex", alignItems: "flex-end", justifyContent: "center", fontFamily: F.stamp, fontSize: s.size ?? 330, lineHeight: 0.9, color: C.ink,
            transform: `translate(${shake}px, ${(1 - d) * -500 + (off ? lock * 40 : 0)}px) rotate(${off ? lock * (i % 2 ? 6 : -5) : 0}deg)`, opacity: Math.min(1, d * 2) * (off ? 1 - lock * 0.72 : 1), filter: `blur(${off ? lock * 5 : 0}px)` }}>
            {s.ch}
          </div>
        );
      })}
      <svg width={300} height={420} style={{ position: "absolute", left: first - 150, top: 240, overflow: "visible" }}>
        <ellipse cx={150} cy={210} rx={125} ry={185} fill="none" stroke={C.emBg} strokeWidth={22} pathLength={1} strokeDasharray="1 1" strokeDashoffset={ring} transform="rotate(-8 150 210)" />
        <ellipse cx={150} cy={210} rx={125} ry={185} fill="none" stroke={C.ink} strokeWidth={6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={ring} transform="rotate(-8 150 210)" />
      </svg>
      <Particles at={a1 + 6} n={10} seed="scanS" x={first} y={300} speed={13} item={() => <Spark size={32} />} />
      {/* reading beam + eye */}
      <div style={{ position: "absolute", left: eyeX - 60, top: 200, width: 120, height: 90, background: `linear-gradient(${C.emBg}aa, transparent)`, clipPath: "polygon(35% 0, 65% 0, 100% 100%, 0 100%)", opacity: frame > a0 ? 1 : 0 }} />
      <div style={{ position: "absolute", left: eyeX - 85, top: 40 + float(frame, 0, 8), width: 170, height: 170, borderRadius: "50%", background: lock > 0.5 ? C.emBg : C.card, border: `6px solid ${C.ink}`, boxShadow: `8px 8px 0 ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scaleY(${blink}) rotate(${frame < a1 ? Math.sin(frame / 4) * 6 : 0}deg)` }}>
        <Icon name="eye" size={110} color={C.ink} stroke={2.2} />
      </div>
    </div>
  );
};

// ── 3. ".900" shatters into flying digits, "RIBUAN" bounces in letter by letter, coins rain with the MURAH stamp.
export const Fade: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const a0 = f(at[0]), a1 = f(at[1]), a2 = f(at[2]);
  const breathe = 1 + Math.sin(frame / 8) * 0.025;
  const rest = ".900".split("");
  const word = "RIBUAN".split("");
  return (
    <div style={{ width: 960, height: 780, position: "relative" }}>
      <Deco seed="fade" w={960} h={780} />
      <Sfx name="pop" at={3} volume={0.45} />
      <Sfx name="whoosh" at={a0} volume={0.55} />
      {rest.map((_, i) => <Sfx key={i} name="tick" at={a0 + i * 2} volume={0.35} />)}
      {word.map((_, i) => <Sfx key={`w${i}`} name="pop" at={a1 + i * 2} volume={0.3} />)}
      <Sfx name="stamp" at={a2} volume={0.7} />
      {[0, 4, 9, 14, 20].map((k) => <Sfx key={`c${k}`} name="coin" at={a2 + 4 + k} volume={0.3} />)}
      <div style={{ position: "absolute", left: 60, top: 150, fontFamily: F.stamp, fontSize: 340, lineHeight: 1, color: C.ink, transform: `scale(${breathe})`, transformOrigin: "50% 80%" }}>9</div>
      {rest.map((ch, i) => {
        const t = Math.max(0, frame - a0 - i * 2);
        const vx = [-10, 4, 14, 24][i], vy = [-26, -14, -22, -10][i];
        return <div key={i} style={{ position: "absolute", left: 260 + [0, 50, 200, 350][i], top: 150, fontFamily: F.stamp, fontSize: 340, lineHeight: 1, color: GREY, transform: `translate(${vx * t}px, ${vy * t + 0.9 * t * t}px) rotate(${t * (i % 2 ? 9 : -7)}deg)`, opacity: interpolate(t, [0, 18], [1, 0], clamp) }}>{ch}</div>;
      })}
      <div style={{ position: "absolute", left: 270, top: 230, display: "flex" }}>
        {word.map((ch, i) => {
          const s = sp(at[1] + i * 0.06, 7);
          const g = grow(s, 80);
          return <span key={i} style={{ display: "inline-block", fontFamily: F.stamp, fontSize: 180, color: C.red, ...g, transform: `${g.transform} rotate(${Math.sin(frame / 7 + i) * 3}deg)` }}>{ch}</span>;
        })}
      </div>
      {frame >= a2 && Array.from({ length: 12 }, (_, i) => {
        const t = frame - a2 - i * 1.5;
        if (t < 0) return null;
        return <div key={i} style={{ position: "absolute", left: 40 + random(`fc${i}`) * 860, top: -120 + t * t * 0.7, transform: `rotateY(${t * 25}deg)` }}><Coin size={70} /></div>;
      })}
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, display: "flex", justifyContent: "center" }}><div style={stamp(sp(at[2], 12), -7, 140)}>MURAH!</div></div>
    </div>
  );
};

// ── 4. Café chalkboard swings in on chains; "Rp" flicks off, the dot bounces away, the zeros roll off like wheels.
export const Menu: React.FC<{ items: { name: string; price: string }[]; at: [number, number, number, number] }> = ({ items, at }) => {
  const { frame, f, sp } = useT();
  const [h, a1, a2, a3] = at.map(f);
  const drop = sp(0, 11);
  const ang = swing(frame, [10], 9, 0.2, 30) + Math.sin(frame / 25) * 1.2;
  const hi = interpolate(frame, [h, h + 10], [0, 1], clamp);
  const flick = (i: number): React.CSSProperties => {
    const t = Math.max(0, frame - a1 - i * 2);
    return { display: "inline-block", transform: `translate(${-14 * t}px, ${-22 * t + 1.3 * t * t}px) rotate(${-t * 16}deg)`, opacity: interpolate(t, [0, 26], [1, 0], clamp) };
  };
  const dot = (i: number): React.CSSProperties => {
    const t = Math.max(0, frame - a2 - i * 2);
    const bounce = Math.abs(Math.sin(t / 5)) * -60 * Math.exp(-t / 18) + Math.min(t * 18, 330);
    return { display: "inline-block", transform: `translate(${t * 4}px, ${bounce}px)`, opacity: interpolate(t, [20, 34], [1, 0], clamp) };
  };
  const wheel = (i: number, k: number): React.CSSProperties => {
    const t = Math.max(0, frame - a3 - i * 2 - k * 3);
    return { display: "inline-block", transform: `translateX(${t * t * 1.4}px) rotate(${t * t * 2.2}deg)`, opacity: interpolate(t, [10, 22], [1, 0], clamp) };
  };
  const pulse = frame > a3 + 10 ? 1 + Math.sin((frame - a3) / 4) * 0.06 * Math.exp(-(frame - a3 - 10) / 40) : 1;
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="menu" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.45} />
      <Sfx name="punch" at={12} volume={0.4} />
      {items.map((_, i) => <Sfx key={i} name="slide" at={14 + i * 6} volume={0.3} />)}
      <Sfx name="slide" at={h} volume={0.5} />
      <Sfx name="whip" at={a1} volume={0.5} />
      {[0, 6, 12].map((k) => <Sfx key={`d${k}`} name="tick" at={a2 + k} volume={0.4} />)}
      {[0, 3, 6].map((k) => <Sfx key={`z${k}`} name="whoosh" at={a3 + k} volume={0.25} />)}
      <Sfx name="ding" at={a3 + 12} volume={0.5} />
      <div style={{ position: "absolute", left: 30, top: (1 - drop) * -900, width: 900, transformOrigin: "50% 0", transform: `rotate(${ang}deg)` }}>
        <svg width={900} height={120} style={{ display: "block" }}><path d="M450 10 L170 120 M450 10 L730 120" stroke={C.ink} strokeWidth={6} fill="none" /><circle cx={450} cy={12} r={14} fill={C.emBg} stroke={C.ink} strokeWidth={5} /></svg>
        <div style={{ background: C.dark, border: `16px solid ${C.em}`, borderRadius: 26, boxShadow: `14px 14px 0 ${C.ink}`, padding: "30px 50px 50px", position: "relative" }}>
          <div style={{ position: "absolute", right: 46, top: 20, transform: `rotate(${Math.sin(frame / 10) * 6}deg)` }}>
            <Icon name="coffee" size={90} color={C.emBg} stroke={2} />
            {[0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", left: 20 + k * 18, top: -20 - ((frame + k * 12) % 36), width: 8, height: 26, borderRadius: 4, background: `${C.emBg}88`, opacity: 1 - ((frame + k * 12) % 36) / 36 }} />)}
          </div>
          <div style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 92, color: "#F7FEE7", marginBottom: 20 }}>Menu</div>
          {items.map((it, i) => {
            const s = sp(0.4 + i * 0.2, 10);
            return (
              <div key={i} style={{ position: "relative", display: "flex", alignItems: "baseline", gap: 20, padding: "16px 0", borderBottom: "3px dashed #F7FEE744", opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * -200}px)` }}>
                {i === 0 && <div style={{ position: "absolute", left: -16, right: -16, top: 10, bottom: 10, background: `${C.emBg}44`, borderRadius: 12, transformOrigin: "0 50%", transform: `scaleX(${hi})` }} />}
                <span style={{ flex: 1, fontFamily: F.sans, fontWeight: 700, fontSize: 56, color: "#F7FEE7", position: "relative" }}>{it.name}</span>
                <span style={{ fontFamily: F.stamp, fontSize: 84, color: C.emBg, whiteSpace: "nowrap", position: "relative" }}>
                  <span style={flick(i)}>Rp&nbsp;</span>
                  <span style={{ display: "inline-block", transform: `scale(${pulse})` }}>{it.price}</span>
                  <span style={dot(i)}>.</span>
                  {"000".split("").map((z, k) => <span key={k} style={wheel(i, k)}>{z}</span>)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <Particles at={a3 + 12} n={10} seed="menuS" x={760} y={330} speed={12} item={() => <Spark size={30} />} />
    </div>
  );
};

// ── 5. Cornell, shown qualitatively: coins hop from each wallet onto a stack; the "no Rp" stack grows taller (no numbers on purpose).
export const Spend: React.FC<{ left: string; right: string; dur: number }> = ({ left, right, dur }) => {
  const { frame, sp } = useT();
  const span = Math.round(dur * 0.5);
  const col = (label: string, n: number, x: number, hot: boolean, seed: string) => {
    const gap = (span - 10) / n;
    return (
      <div style={{ position: "absolute", left: x, top: 0, width: 380, height: 900 }}>
        {Array.from({ length: n }, (_, i) => {
          const t0 = 10 + i * gap;
          const t = interpolate(frame, [t0, t0 + 12], [0, 1], clamp);
          if (t <= 0) return null;
          const y = interpolate(t, [0, 1], [760, 560 - i * 46]) - Math.sin(t * Math.PI) * 160;
          return <div key={i} style={{ position: "absolute", left: 100, top: y, width: 180, height: 60, borderRadius: "50%", background: hot ? C.emBg : "#E5E7EB", border: `5px solid ${C.ink}`, boxShadow: `0 8px 0 ${hot ? "#84CC16" : GREY}`, transform: squash(frame, t0 + 12, 0.18) }} />;
        })}
        <div style={{ position: "absolute", left: 40, top: 650, width: 300, textAlign: "center", background: C.dark, color: "#F7FEE7", border: `10px solid ${C.em}`, borderRadius: 20, padding: "8px 0", fontFamily: F.stamp, fontSize: 64, whiteSpace: "nowrap", boxShadow: `8px 8px 0 ${C.ink}`, transform: `rotate(${hot ? 2 : -2}deg)` }}>{label}</div>
        <div style={{ position: "absolute", left: 140, top: 800, transform: `rotate(${Math.sin(frame / 5 + x) * (frame < span ? 8 : 2)}deg)` }}><Icon name="wallet" size={100} color={hot ? C.red : GREY} stroke={2} /></div>
        {hot && <div style={{ position: "absolute", left: 270, top: 60 + float(frame, 1, 8), ...grow(sp(span / 30 + 0.2, 8)) }}><Icon name="trending-up" size={130} color={C.red} stroke={3} /></div>}
        {hot && <Particles at={span + 6} n={10} seed={seed} x={190} y={160} speed={12} item={() => <Spark size={30} />} />}
      </div>
    );
  };
  const nL = 4, nR = 9;
  return (
    <div style={{ width: 960, height: 920, position: "relative" }}>
      <Deco seed="spend" w={960} h={920} />
      {Array.from({ length: nL }, (_, i) => <Sfx key={`l${i}`} name="coin" at={22 + i * ((span - 10) / nL)} volume={0.25} />)}
      {Array.from({ length: nR }, (_, i) => <Sfx key={`r${i}`} name="coin" at={22 + i * ((span - 10) / nR)} volume={0.3} />)}
      <Sfx name="ding" at={span + 6} volume={0.55} />
      {col(left, nL, 40, false, "spL")}
      {col(right, nR, 520, true, "spR")}
    </div>
  );
};

// Striped popcorn bucket in SVG.
const Bucket: React.FC<{ size: number; grey?: boolean }> = ({ size, grey }) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 100 125">
    {[[22, 30], [38, 20], [55, 18], [72, 26], [30, 14], [62, 10], [47, 8]].map(([x, y], i) => <circle key={i} cx={x} cy={y + 12} r={13} fill={grey ? "#E5E7EB" : "#FEF9C3"} stroke={C.ink} strokeWidth={3} />)}
    <path d="M10 40 H90 L80 120 H20 Z" fill="#fff" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    {[0, 1, 2].map((k) => <path key={k} d={`M${18 + k * 25} 40 H${30 + k * 25} L${29 + k * 21} 120 H${21 + k * 21} Z`} fill={grey ? GREY : k === 1 ? C.emBg : C.red} />)}
    <path d="M10 40 H90 L80 120 H20 Z" fill="none" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
  </svg>
);
const Kernel = () => <div style={{ width: 30, height: 26, borderRadius: "50% 45% 50% 40%", background: "#FEF9C3", border: `3px solid ${C.ink}` }} />;

// ── 6. Popcorn: buckets drop and keep popping kernels; with `decoy` the medium shakes "no", gets crossed, the large gets the spotlight.
export const Popcorn: React.FC<{ items: { label: string; price: string; size: number; at?: number }[]; decoy?: { cross: number; win: number; stamp: number; tag: string }; dur: number }> = ({ items, decoy, dur }) => {
  const { frame, f, sp } = useT();
  const xs = [80, 330, 620];
  const cross = decoy ? f(decoy.cross) : 1e9;
  const win = decoy ? f(decoy.win) : 1e9;
  const xDraw = interpolate(frame, [cross, cross + 10], [0, 1], clamp);
  const light = interpolate(frame, [win, win + 10], [0, 1], clamp);
  const pops = Array.from({ length: Math.floor(dur / 14) }, (_, k) => 14 + k * 14);
  return (
    <div style={{ width: 960, height: 940, position: "relative" }}>
      <Deco seed="pop" w={960} h={940} />
      {items.map((it, i) => <Sfx key={i} name="whoosh" at={f(it.at ?? 0.05 + i * 0.12)} volume={0.3} />)}
      {items.map((it, i) => <Sfx key={`p${i}`} name="punch" at={f(it.at ?? 0.05 + i * 0.12) + 9} volume={0.35} />)}
      {pops.map((k, j) => <Sfx key={`k${j}`} name="pop" at={k} volume={0.12} />)}
      {decoy && <><Sfx name="error" at={cross - 12} volume={0.35} /><Sfx name="x" at={cross} volume={0.6} /><Sfx name="ring" at={win} volume={0.5} /><Sfx name="ding" at={win + 6} volume={0.5} /><Sfx name="stamp" at={f(decoy.stamp)} volume={0.7} /></>}
      {/* spotlight on the winner */}
      {decoy && <div style={{ position: "absolute", left: xs[2] - 80, top: -40, width: 420, height: 940, background: `linear-gradient(${C.emBg}cc, ${C.emBg}00 85%)`, clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)", opacity: light * (0.8 + Math.sin(frame / 6) * 0.1) }} />}
      {items.map((it, i) => {
        const t = it.at ?? 0.05 + i * 0.12;
        const land = f(t) + 9;
        const d = sp(t, 11);
        if (frame < f(t)) return null;
        const isMid = i === 1, big = i === 2;
        const no = isMid && frame >= cross - 12 && frame < cross ? Math.sin(frame * 1.8) * 14 : 0;
        const tagFlip = interpolate(frame, [land + 4, land + 14], [90, 0], clamp);
        const grey = isMid && xDraw > 0.5;
        return (
          <div key={i} style={{ position: "absolute", left: xs[i] + (290 - it.size) / 2, bottom: 40, width: it.size, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: grey ? 0.6 : 1, transform: `translate(${no}px, ${(1 - d) * -900 + float(frame, i, 5)}px) rotate(${no / 3}deg)` }}>
            {!grey && pops.filter((k) => k >= land && frame >= k && frame < k + 30 && (k / 14 + i) % 3 === 0).map((k) => (
              <Particles key={k} at={k} n={2} seed={`k${i}${k}`} x={it.size / 2} y={30} speed={6} up={14} g={1} life={30} item={() => <Kernel />} />
            ))}
            <div style={{ transformOrigin: "50% 100%", transform: squash(frame, land) }}><Bucket size={it.size} grey={grey} /></div>
            <div style={{ background: big && light > 0.5 ? C.emBg : C.card, color: C.ink, border: `5px solid ${C.ink}`, borderRadius: 18, padding: "8px 22px", textAlign: "center", boxShadow: `6px 6px 0 ${C.ink}`, transform: `perspective(600px) rotateX(${tagFlip}deg)` }}>
              <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 34 }}>{it.label}</div>
              <div style={{ fontFamily: F.stamp, fontSize: 64, lineHeight: 1 }}>{it.price}</div>
            </div>
            {isMid && decoy && <svg width={320} height={320} viewBox="0 0 100 100" style={{ position: "absolute", top: 20 }}>
              <path d="M12 12 L88 88" stroke={C.ink} strokeWidth={13} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.min(1, xDraw * 2)} />
              <path d="M88 12 L12 88" stroke={C.ink} strokeWidth={13} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.max(0, xDraw * 2 - 1)} />
            </svg>}
            {big && decoy && frame >= win && <div style={{ position: "absolute", top: -150, transformOrigin: "50% 0", transform: `rotate(${swing(frame, [win], 16)}deg)` }}>
              <div style={{ margin: "0 auto", width: 5, height: 40, background: C.ink }} />
              <div style={{ background: C.emBg, border: `5px solid ${C.ink}`, borderRadius: 16, padding: "4px 20px", fontFamily: F.stamp, fontSize: 54, color: C.ink, whiteSpace: "nowrap", boxShadow: `6px 6px 0 ${C.ink}` }}>{decoy.tag}</div>
            </div>}
          </div>
        );
      })}
      {decoy && <Particles at={win + 4} n={12} seed="popW" x={xs[2] + 145} y={420} speed={14} item={() => <Spark size={34} />} />}
      {decoy && <div style={{ position: "absolute", top: 10, left: 0, right: 0, display: "flex", justifyContent: "center" }}><div style={stamp(sp(decoy.stamp, 12), -6, 96)}>MURAH BANGET?</div></div>}
    </div>
  );
};

// ── 7. Marionette: a brain pulls the strings of a shopping cart.
export const Puppet: React.FC = () => {
  const { frame, sp } = useT();
  const s = sp(0.1, 10);
  const ang = Math.sin(frame / 9) * 12;
  const lift = Math.sin(frame / 9 + 1) * 30;
  const hand = Math.sin(frame / 9) * 40;
  const cartX = 480 + hand * 1.5, cartY = 640 + lift;
  const rad = (ang * 0.6 * Math.PI) / 180;
  return (
    <div style={{ width: 960, height: 980, position: "relative", opacity: Math.min(1, s * 2) }}>
      <Sfx name="whoosh" at={3} volume={0.45} />
      {[0, 1, 2, 3, 4].map((k) => <Sfx key={k} name="tick" at={20 + k * 28} volume={0.25} />)}
      <Sfx name="ding" at={30} volume={0.35} />
      <div style={{ position: "absolute", left: 480 - 150 + hand, top: 60 + (1 - s) * -400, width: 300, transform: `rotate(${ang * 0.6}deg)` }}>
        <div style={{ margin: "0 auto", width: 190, height: 190, borderRadius: "50%", background: C.emBg, border: `6px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${60 + Math.sin(frame / 6) * 20}px ${C.emBg}` }}>
          <Icon name="brain" size={120} color={C.ink} stroke={2} />
        </div>
        <div style={{ marginTop: 14, height: 18, background: "#F7FEE7", border: `5px solid ${C.ink}`, borderRadius: 9 }} />
      </div>
      <svg width={960} height={980} style={{ position: "absolute", inset: 0 }}>
        {[-110, 0, 110].map((dx, k) => <line key={k} x1={480 + hand + dx * Math.cos(rad)} y1={290 + dx * Math.sin(rad)} x2={cartX + dx * 0.9} y2={cartY - 40} stroke="#F7FEE7" strokeWidth={4} strokeDasharray="10 8" />)}
      </svg>
      <div style={{ position: "absolute", left: cartX - 150, top: cartY - 60, width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "#F7FEE7", borderRadius: 40, border: `6px solid ${C.ink}`, boxShadow: `12px 12px 0 ${C.emBg}`, transform: `rotate(${-ang}deg)` }}>
        <Icon name="shopping-cart" size={200} color={C.ink} stroke={2} />
      </div>
      {[0, 1, 2].map((k) => {
        const t = (frame + k * 20) % 60;
        return <div key={k} style={{ position: "absolute", left: cartX + (k - 1) * 90 - 35, top: cartY - 120 - t * 3, opacity: 1 - t / 60, transform: `rotate(${t * 4}deg)` }}><Coin size={70} /></div>;
      })}
    </div>
  );
};

// ── 8. Save + follow: a cursor taps the bookmark, then "Ikuti"; hearts burst out.
export const Follow: React.FC<{ name: string; dur: number }> = ({ name, dur }) => {
  const { frame, sp } = useT();
  const save = Math.round(dur * 0.18), tap = Math.round(dur * 0.58);
  const saved = frame >= save, followed = frame >= tap;
  const card = sp(0.05, 10);
  const bm = { x: 790, y: 470 }, btn = { x: 400, y: 470 }, home = { x: 900, y: 860 };
  const ease = { ...clamp, easing: (x: number) => 1 - (1 - x) ** 3 };
  const k1 = interpolate(frame, [6, save - 2], [0, 1], ease), k2 = interpolate(frame, [save + 10, tap - 2], [0, 1], ease);
  const cx = frame < save + 10 ? interpolate(k1, [0, 1], [home.x, bm.x]) : interpolate(k2, [0, 1], [bm.x, btn.x]);
  const cy = frame < save + 10 ? interpolate(k1, [0, 1], [home.y, bm.y]) : interpolate(k2, [0, 1], [bm.y, btn.y]);
  const press = (t: number) => interpolate(frame, [t - 2, t, t + 6], [1, 0.85, 1], clamp);
  const ripple = (t: number, x: number, y: number) => frame >= t && frame < t + 18 && <div style={{ position: "absolute", left: x - 70, top: y - 70, width: 140, height: 140, borderRadius: "50%", border: `6px solid ${C.emBg}`, transform: `scale(${(frame - t) / 9})`, opacity: 1 - (frame - t) / 18 }} />;
  const g = grow(card, 100);
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="fol" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      <Sfx name="slide" at={8} volume={0.3} />
      <Sfx name="tap" at={save} volume={0.6} />
      <Sfx name="ding" at={save + 3} volume={0.45} />
      <Sfx name="slide" at={save + 10} volume={0.3} />
      <Sfx name="tap" at={tap} volume={0.6} />
      <Sfx name="coin" at={tap + 3} volume={0.5} />
      <Sfx name="boom" at={tap + 4} volume={0.3} />
      <div style={{ position: "absolute", left: 30, top: 220, width: 900, background: C.card, border: `6px solid ${C.ink}`, borderRadius: 36, boxShadow: `14px 14px 0 ${C.ink}`, padding: 44, ...g }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <Img src={staticFile("img/almeli-logo.png")} style={{ width: 160, height: 160, borderRadius: "50%", background: "#fff", transform: `rotate(${Math.sin(frame / 10) * 5}deg)` }} />
          <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 64, color: C.ink }}>{name}</div>
        </div>
        <div style={{ display: "flex", gap: 26, marginTop: 40 }}>
          <div style={{ flex: 1, textAlign: "center", padding: "24px 0", borderRadius: 22, fontFamily: F.sans, fontWeight: 700, fontSize: 48, background: followed ? C.card : C.red, color: followed ? C.ink : "#fff", border: `5px solid ${C.ink}`, transform: `scale(${press(tap)})` }}>{followed ? "Mengikuti" : "Ikuti"}</div>
          <div style={{ width: 130, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 22, border: `5px solid ${C.ink}`, background: saved ? C.emBg : C.card, transform: `scale(${press(save)})` }}>
            <Icon name={saved ? "bookmark-check" : "bookmark"} size={64} color={C.ink} />
          </div>
        </div>
      </div>
      {ripple(save, bm.x, bm.y)}
      {ripple(tap, btn.x, btn.y)}
      <Particles at={tap + 2} n={12} seed="folH" x={btn.x} y={btn.y} speed={13} item={(i) => (i % 2 ? <Icon name="heart" size={50} color={C.red} stroke={2.5} /> : <Spark size={34} />)} />
      <div style={{ position: "absolute", left: cx - 10, top: cy - 6 }}><Icon name="mouse-pointer-2" size={90} color={C.ink} stroke={2.2} /></div>
    </div>
  );
};

// ── 9. Teaser: the aisle slides in, a cart rolls along the path all the way to the milk fridge at the back, "?" bounces.
export const Shelf: React.FC<{ at: [number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const a0 = f(at[0]), a1 = f(at[1]);
  const path = interpolate(frame, [a0 - 10, a0 + 22], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const sideIn = sp(0.05, 12);
  const q = sp(at[1], 7);
  const colors = ["#F4A261", "#5AA8F0", C.emBg, "#FDE68A", C.red];
  const side = (flip: boolean) => (
    <div style={{ position: "absolute", top: 330, [flip ? "right" : "left"]: (1 - sideIn) * -400, width: 230, display: "flex", flexDirection: "column", gap: 26 }}>
      {[0, 1, 2, 3].map((r) => (
        <div key={r} style={{ display: "flex", gap: 8, padding: 8, background: C.card, border: `4px solid ${C.ink}`, borderRadius: 10, boxShadow: `6px 6px 0 ${C.ink}` }}>
          {[0, 1, 2].map((k) => <div key={k} style={{ flex: 1, height: 70, background: colors[(r + k + (flip ? 2 : 0)) % 5], border: `3px solid ${C.ink}`, borderRadius: 6, transform: `translateY(${Math.max(0, Math.sin(frame / 6 + r + k * 2)) * -6}px)` }} />)}
        </div>
      ))}
    </div>
  );
  const cy = interpolate(path, [0, 1], [900, 330]);
  const g = grow(q, 60);
  return (
    <div style={{ width: 960, height: 980, position: "relative" }}>
      <Sfx name="whoosh" at={3} volume={0.45} />
      <Sfx name="slide" at={6} volume={0.4} />
      {[0, 6, 12, 18, 24].map((k) => <Sfx key={k} name="tick" at={a0 - 10 + k} volume={0.3} />)}
      <Sfx name="ding" at={a0 + 22} volume={0.5} />
      <Sfx name="boom" at={a1} volume={0.55} />
      <Sfx name="pop" at={a1 + 3} volume={0.5} />
      <div style={{ position: "absolute", top: 20 + (1 - sp(0, 12)) * -400, left: 250, right: 250, height: 280, background: "#ECFCCB", border: `6px solid ${C.ink}`, borderRadius: 16, boxShadow: `0 0 ${path >= 1 ? 50 + Math.sin(frame / 5) * 20 : 0}px ${C.emBg}`, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 18, padding: 20 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: 70, height: 130, background: "#fff", border: `4px solid ${C.ink}`, borderRadius: "10px 10px 6px 6px", position: "relative", transform: `rotate(${path >= 1 ? Math.sin(frame / 3 + i) * 5 : 0}deg)` }}>
            <div style={{ position: "absolute", top: 50, left: 0, right: 0, height: 34, background: C.emBg }} />
          </div>
        ))}
      </div>
      {side(false)}
      {side(true)}
      <svg width={960} height={980} style={{ position: "absolute", inset: 0 }}>
        <path d="M480 960 L480 320" stroke={C.red} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${path} 1`} fill="none" />
      </svg>
      {frame >= a0 - 10 && <div style={{ position: "absolute", left: 480 - 60, top: cy - 60, transform: `rotate(${Math.sin(frame) * 3}deg)` }}><Icon name="shopping-cart" size={120} color={C.ink} stroke={2.2} /></div>}
      <div style={{ position: "absolute", left: 530, top: 440, fontFamily: F.stamp, fontSize: 280, color: C.red, textShadow: `10px 10px 0 ${C.emBg}`, ...g, transform: `${g.transform} rotate(${Math.sin(frame / 8) * 8}deg)` }}>?</div>
      <Particles at={a1 + 2} n={10} seed="shQ" x={680} y={620} speed={12} item={() => <Spark size={30} />} />
    </div>
  );
};
