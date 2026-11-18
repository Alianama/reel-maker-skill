// "Kenapa logo bank biru" visuals (pop skin): flat sticker illustrations, thick charcoal outlines, real bank logos.
// Timing props are seconds from the start of the visual (matched to the VO).
import { Img, interpolate, random, staticFile } from "remotion";
import { Particles, Spark, float, grow, squash, stamp, swing, useT } from "./PriceUI";
import { Sfx } from "./sfx";
import { F, clamp } from "./theme";
import { Icon } from "./Visuals";

const INK = "#111827", LIME = "#A3E635", DEEP = "#365314", CREAM = "#F7FEE7", BLUE = "#2563EB", SKY = "#7DD3FC", PINK = "#FF2DA6";
const box = (extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", background: "#fff", border: `6px solid ${INK}`, borderRadius: 30, boxShadow: `10px 10px 0 ${INK}`, ...extra });
const Stage: React.FC<{ children: React.ReactNode; h?: number }> = ({ children, h = 960 }) => <div style={{ width: 960, height: h, position: "relative" }}>{children}</div>;
const LOGOS = ["bca", "bri", "mandiri"] as const;
const Logo: React.FC<{ name: string; w: number }> = ({ name, w }) => <Img src={staticFile(`img/bank/${name}.png`)} style={{ width: w, height: w * 0.36, objectFit: "contain" }} />;

// Flat bank building: columns + pediment; `sign` colour fills the roof.
const Building: React.FC<{ w?: number; sign: string; glow?: boolean }> = ({ w = 260, sign, glow }) => (
  <svg width={w} height={w * 1.1} viewBox="0 0 200 220" style={{ overflow: "visible", filter: glow ? `drop-shadow(0 0 22px ${sign})` : undefined }}>
    <path d="M10 70 L100 12 L190 70 Z" fill={sign} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <rect x={18} y={70} width={164} height={20} fill="#fff" stroke={INK} strokeWidth={6} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={32 + i * 40} y={92} width={18} height={92} fill="#fff" stroke={INK} strokeWidth={6} />)}
    <rect x={10} y={184} width={180} height={24} rx={4} fill={sign} stroke={INK} strokeWidth={6} />
  </svg>
);

// ── 1. Hook: three bank buildings pop up grey, then all roofs splash blue at once; a "?" wobbles.
export const Banks: React.FC<{ at: number }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const paint = f(at);
  return (
    <Stage>
      {[0, 1, 2].map((i) => <Sfx key={i} name="p-boing" at={f(0.2 + i * 0.3)} volume={0.45} />)}
      <Sfx name="p-confetti" at={paint} volume={0.5} />
      <Sfx name="p-chime" at={paint + 10} volume={0.4} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: 20, background: INK, borderRadius: 10 }} />
      {[0, 1, 2].map((i) => {
        const s = sp(0.2 + i * 0.3, 8);
        const on = frame >= paint + i * 2;
        return (
          <div key={i} style={{ position: "absolute", left: 20 + i * 310, top: 90, transformOrigin: "50% 100%", transform: `scale(${s}) ${on ? squash(frame, paint + i * 2, 0.2) : ""}` }}>
            <Building sign={on ? BLUE : "#D1D5DB"} />
          </div>
        );
      })}
      <Particles at={paint} n={16} seed="bkS" x={480} y={150} speed={15} item={(i) => <div style={{ width: 34, height: 34, borderRadius: "50%", background: i % 3 ? BLUE : SKY, border: `4px solid ${INK}` }} />} />
      <div style={{ position: "absolute", left: 380, top: 470, width: 200, height: 200, ...box({ borderRadius: "50%", background: LIME }), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.stamp, fontSize: 170, color: INK, transform: `scale(${sp(at + 0.3, 7)}) rotate(${swing(frame, [paint + 10], 16) + Math.sin(frame / 10) * 4}deg)` }}>?</div>
    </Stage>
  );
};

// ── 2. Real logos slam in one by one, each with a blue swatch; at "kompak" they bounce in sync, a handshake pops.
export const Logos: React.FC<{ at: [number, number, number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const sync = f(at[3]), deal = f(at[4]);
  return (
    <Stage>
      {[0, 1, 2].map((i) => <Sfx key={i} name="p-thump" at={f(at[i])} volume={0.6} />)}
      {[0, 1, 2].map((i) => <Sfx key={`c${i}`} name="p-tick" at={f(at[i]) + 6} volume={0.35} />)}
      {[0, 12, 24].map((k) => <Sfx key={`b${k}`} name="p-boing" at={sync + k} volume={0.35} />)}
      <Sfx name="p-yay" at={deal} volume={0.45} />
      {LOGOS.map((n, i) => {
        const s = sp(at[i], 9);
        const hop = frame >= sync ? -Math.abs(Math.sin((frame - sync) / 6)) * 40 : 0;
        return (
          <div key={n} style={{ ...box(), left: 70, right: 70, top: 20 + i * 220, height: 180, display: "flex", alignItems: "center", gap: 30, padding: "0 40px", transform: `translateX(${(1 - Math.min(s, 1)) * (i % 2 ? 1100 : -1100)}px) translateY(${hop}px) rotate(${(i - 1) * 2 + Math.sin(frame / 14 + i) * 1.2}deg)` }}>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}><Logo name={n} w={420} /></div>
            <div style={{ width: 120, height: 120, borderRadius: 24, background: BLUE, border: `6px solid ${INK}`, transform: `scale(${sp(at[i] + 0.2, 7)})` }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 360, top: 690, width: 240, height: 240, ...box({ borderRadius: "50%", background: LIME }), display: "flex", alignItems: "center", justifyContent: "center", ...grow(sp(at[4], 8), 60) }}>
        <Icon name="handshake" size={150} color={INK} stroke={2.2} />
      </div>
      <Particles at={deal + 4} n={10} seed="lgH" x={480} y={790} speed={12} item={(i) => (i % 2 ? <Icon name="heart" size={46} color={PINK} stroke={2.5} /> : <Spark size={34} color={LIME} />)} />
    </Stage>
  );
};

// ── 3. Sky & sea: sun, drifting clouds, the sea rises with waves; an hourglass spins (it never changed).
export const SkySea: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const sky = sp(at[0], 12), sea = interpolate(frame, [f(at[1]), f(at[1]) + 16], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const wave = (y: number, k: number, c: string) => {
    const ph = frame / 6 + k;
    const d = Array.from({ length: 13 }, (_, i) => `${i * 80} ${y + Math.sin(ph + i) * 14}`).join(" L");
    return <path d={`M${d} L960 600 L0 600 Z`} fill={c} stroke={INK} strokeWidth={6} />;
  };
  return (
    <Stage>
      <Sfx name="p-swoosh" at={f(at[0])} volume={0.45} />
      <Sfx name="p-chime" at={f(at[0]) + 6} volume={0.35} />
      <Sfx name="p-slide" at={f(at[1])} volume={0.5} />
      <Sfx name="p-bubble" at={f(at[1]) + 10} volume={0.45} />
      {[0, 7, 14, 21].map((k) => <Sfx key={k} name="p-tick" at={f(at[2]) + k} volume={0.35} />)}
      <div style={{ ...box({ background: SKY, overflow: "hidden" }), left: 40, right: 40, top: 20, height: 760, opacity: Math.min(1, sky * 2), transform: `scale(${0.8 + 0.2 * Math.min(sky, 1)})` }}>
        <div style={{ position: "absolute", left: 620, top: 70 + float(frame, 0, 8), width: 150, height: 150, borderRadius: "50%", background: "#FDE047", border: `6px solid ${INK}` }} />
        {[0, 1].map((i) => (
          <div key={i} style={{ position: "absolute", top: 90 + i * 140, left: ((frame * (1.5 + i) + i * 400) % 1200) - 240 }}>
            <svg width={220} height={100} viewBox="0 0 220 100"><path d="M30 90 a30 30 0 0 1 10 -58 a42 42 0 0 1 80 -12 a34 34 0 0 1 64 22 a26 26 0 0 1 6 48 Z" fill="#fff" stroke={INK} strokeWidth={6} /></svg>
          </div>
        ))}
        <svg width={880} height={600} style={{ position: "absolute", left: 0, top: 760 - 600 * (0.1 + 0.55 * sea) }}>
          {wave(40, 0, "#38BDF8")}
          {wave(110, 2, BLUE)}
        </svg>
      </div>
      <div style={{ ...box({ borderRadius: "50%", background: LIME }), left: 380, top: 690, width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", ...grow(sp(at[2], 8), 50) }}>
        <div style={{ transform: `rotate(${frame >= f(at[2]) ? Math.floor((frame - f(at[2])) / 7) * 180 : 0}deg)`, transition: "none" }}><Icon name="hourglass" size={120} color={INK} stroke={2.2} /></div>
      </div>
    </Stage>
  );
};

// ── 4. Brain learns: a blue brain sticker, three feeling badges pop out (shield, smile, handshake).
export const BlueBrain: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const badges = [{ icon: "shield-check", x: 60, y: 560 }, { icon: "face-slightly-smiling", x: 370, y: 640 }, { icon: "handshake", x: 680, y: 560 }];
  return (
    <Stage>
      <Sfx name="p-bubble" at={3} volume={0.45} />
      {badges.map((_, i) => <Sfx key={i} name={i === 2 ? "p-yay" : "p-ding"} at={f(at[i])} volume={0.5} />)}
      <div style={{ ...box({ borderRadius: "50%", background: SKY }), left: 280, top: 60 + float(frame, 0, 10), width: 400, height: 400, display: "flex", alignItems: "center", justifyContent: "center", ...grow(sp(0.05, 9), 60) }}>
        <div style={{ transform: `rotate(${Math.sin(frame / 14) * 6}deg)` }}><Icon name="brain" size={260} color={BLUE} stroke={2} /></div>
      </div>
      <svg width={960} height={960} style={{ position: "absolute", inset: 0 }}>
        {badges.map((b, i) => frame >= f(at[i]) && <line key={i} x1={480} y1={440} x2={b.x + 110} y2={b.y + 40} stroke={INK} strokeWidth={6} strokeDasharray="14 10" strokeDashoffset={-frame * 2} />)}
      </svg>
      {badges.map((b, i) => (
        <div key={i} style={{ ...box({ borderRadius: "50%", background: i === 1 ? LIME : "#fff" }), left: b.x, top: b.y, width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(at[i], 7)}) rotate(${swing(frame, [f(at[i])], 12)}deg)` }}>
          <Icon name={b.icon} size={130} color={BLUE} stroke={2.4} />
        </div>
      ))}
      {badges.map((b, i) => <Particles key={i} at={f(at[i]) + 3} n={6} seed={`bb${i}`} x={b.x + 110} y={b.y + 110} speed={10} item={() => <Spark size={28} color={LIME} />} />)}
    </Stage>
  );
};

// ── 5. What does a bank sell? A gift box with a "?" tag shakes, bursts open: a glowing handshake.
export const Sells: React.FC<{ at: number }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const open = f(at);
  const lid = interpolate(frame, [open, open + 10], [0, 1], clamp);
  const shake = frame < open ? Math.sin(frame * 1.6) * interpolate(frame, [0, open], [2, 10], clamp) : 0;
  return (
    <Stage h={900}>
      <Sfx name="p-slide" at={2} volume={0.4} />
      {[0, 8, 16, 24, 32].map((k) => <Sfx key={k} name="p-creak" at={Math.max(1, open - 40 + k)} volume={0.2} />)}
      <Sfx name="p-confetti" at={open} volume={0.55} />
      <Sfx name="p-heart" at={open + 8} volume={0.45} />
      <div style={{ position: "absolute", left: 270, top: 320, width: 420, transform: `rotate(${shake}deg)`, ...grow(sp(0.05, 9), 80) }}>
        <div style={{ ...box({ position: "relative", height: 300, background: LIME, borderRadius: 20 }) }}>
          <div style={{ position: "absolute", left: 175, top: 0, bottom: 0, width: 60, background: BLUE, borderLeft: `6px solid ${INK}`, borderRight: `6px solid ${INK}` }} />
        </div>
        <div style={{ ...box({ height: 80, left: -20, right: -20, top: -70, background: LIME, borderRadius: 16 }), transformOrigin: "0 100%", transform: `translate(${lid * -120}px, ${lid * -160}px) rotate(${lid * -40}deg)` }} />
      </div>
      {frame < open && (
        <div style={{ ...box({ background: "#fff", borderRadius: 16 }), left: 620, top: 230, width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.stamp, fontSize: 90, color: INK, transform: `rotate(${12 + Math.sin(frame / 6) * 10}deg)` }}>?</div>
      )}
      <div style={{ ...box({ borderRadius: "50%", background: "#fff", boxShadow: `0 0 ${50 + Math.sin(frame / 5) * 20}px ${SKY}, 10px 10px 0 ${INK}` }), left: 330, top: 0, width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${(1 - Math.min(1, sp(at, 8))) * 300}px) scale(${sp(at, 8)})` }}>
        <Icon name="handshake" size={190} color={BLUE} stroke={2.2} />
      </div>
      <Particles at={open + 2} n={16} seed="selC" x={480} y={300} speed={15} item={(i) => (i % 3 ? <Spark size={36} color={i % 2 ? LIME : SKY} /> : <Icon name="heart" size={44} color={PINK} stroke={2.5} />)} />
    </Stage>
  );
};

// ── 6. Handing money to a stranger: a money bag slides toward a grey "?" figure, which turns blue and calm.
export const Stranger: React.FC<{ at: [number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const give = interpolate(frame, [f(at[0]), f(at[0]) + 30], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const calm = frame >= f(at[1]);
  return (
    <Stage h={900}>
      <Sfx name="p-run" at={f(at[0])} volume={0.4} />
      <Sfx name="cash" at={f(at[0]) + 28} volume={0.45} />
      <Sfx name="p-ghost" at={f(0.2)} volume={0.25} />
      <Sfx name="p-chime" at={f(at[1])} volume={0.5} />
      <Sfx name="p-heart" at={f(at[1]) + 6} volume={0.35} />
      {/* stranger */}
      <div style={{ position: "absolute", left: 560, top: 120, ...grow(sp(0.1, 9), 60), transform: `${calm ? squash(frame, f(at[1]), 0.2) : ""}` }}>
        <div style={{ margin: "0 auto", width: 190, height: 190, borderRadius: "50%", background: calm ? SKY : "#D1D5DB", border: `6px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.stamp, fontSize: 130, color: INK }}>
          {calm ? <Icon name="face-slightly-smiling" size={150} color={INK} stroke={2} /> : "?"}
        </div>
        <div style={{ marginTop: -8, width: 320, height: 300, borderRadius: "160px 160px 30px 30px", background: calm ? BLUE : "#9CA3AF", border: `6px solid ${INK}` }} />
      </div>
      {calm && <Particles at={f(at[1]) + 2} n={10} seed="strS" x={720} y={200} speed={11} item={() => <Spark size={32} color={LIME} />} />}
      {/* money bag */}
      <div style={{ position: "absolute", left: interpolate(give, [0, 1], [60, 440]), top: 420 + Math.sin(give * Math.PI) * -120, transform: `rotate(${give * 360 * 0.15 - 6}deg)`, ...grow(sp(0.2, 9), 50) }}>
        <svg width={220} height={240} viewBox="0 0 100 110" style={{ overflow: "visible" }}>
          <path d="M35 20 L65 20 L58 34 Q92 50 90 82 Q88 106 50 106 Q12 106 10 82 Q8 50 42 34 Z" fill={LIME} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M40 32 H60" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <text x={50} y={86} textAnchor="middle" fontFamily={F.stamp} fontSize={30} fill={INK}>Rp</text>
        </svg>
      </div>
    </Stage>
  );
};

// ── 7. Neon pink bank: a building sign flickers from blue to neon pink; buzzing neon tube.
export const Neon: React.FC<{ at: number }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const t = f(at);
  const flick = frame < t ? false : frame > t + 16 ? true : random(`n${frame}`) > 0.4;
  return (
    <Stage h={900}>
      <Sfx name="p-zip" at={2} volume={0.35} />
      <Sfx name="buzz" at={t} volume={0.35} />
      <Sfx name="p-buzzer" at={t + 4} volume={0.25} />
      <Sfx name="p-boing" at={t + 16} volume={0.45} />
      <div style={{ position: "absolute", left: 230, top: 140, transformOrigin: "50% 100%", ...grow(sp(0.05, 9), 80) }}>
        <div style={{ transform: frame >= t + 16 ? squash(frame, t + 16, 0.25) : undefined }}><Building w={500} sign={flick ? PINK : BLUE} glow={flick} /></div>
      </div>
      {flick && [0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + frame / 20;
        return <div key={i} style={{ position: "absolute", left: 480 + Math.cos(a) * 380 - 20, top: 420 + Math.sin(a) * 300 - 20 }}><Spark size={44} color={PINK} /></div>;
      })}
    </Stage>
  );
};

// ── 8. Cosmetics shop?: neon storefront fills with lipstick/perfume stickers; the wallet comes close and runs away.
export const Cosmetic: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const items = ["sparkles", "spray-can", "gem", "heart", "flower"];
  const come = f(at[1]), back = f(at[2]);
  const wx = frame < back ? interpolate(frame, [come, come + 18], [-300, 300], clamp) : interpolate(frame, [back, back + 14], [300, -400], clamp);
  return (
    <Stage h={900}>
      {items.map((_, i) => <Sfx key={i} name="p-bubble" at={f(at[0]) + i * 4} volume={0.35} />)}
      <Sfx name="p-run" at={come} volume={0.35} />
      <Sfx name="p-buzzer" at={back} volume={0.45} />
      <Sfx name="p-swoosh" at={back + 2} volume={0.4} />
      <div style={{ ...box({ background: "#FFE4F3", boxShadow: `0 0 50px ${PINK}, 10px 10px 0 ${INK}` }), left: 60, right: 60, top: 20, height: 520 }}>
        <div style={{ height: 90, display: "flex", borderBottom: `6px solid ${INK}`, overflow: "hidden", borderRadius: "24px 24px 0 0" }}>
          {Array.from({ length: 8 }, (_, i) => <div key={i} style={{ flex: 1, background: i % 2 ? "#fff" : PINK }} />)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 30, padding: 40 }}>
          {items.map((n, i) => (
            <div key={n} style={{ width: 150, height: 150, borderRadius: 26, background: "#fff", border: `5px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(at[0] + i * 0.13, 7)}) rotate(${Math.sin(frame / 9 + i) * 6}deg)` }}>
              <Icon name={n} size={90} color={PINK} stroke={2.4} />
            </div>
          ))}
        </div>
      </div>
      {frame >= come && (
        <div style={{ position: "absolute", left: 480 - 110 + wx * 0.5, top: 600, transform: `rotate(${frame >= back ? -20 : Math.sin(frame / 4) * 6}deg) scaleX(${frame >= back ? -1 : 1})` }}>
          <div style={{ ...box({ position: "relative", background: LIME }), width: 220, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="wallet" size={130} color={INK} stroke={2.2} />
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: 540, top: 700, ...stamp(sp(at[2] + 0.2, 10), 6, 60) }}>2X MIKIR</div>
    </Stage>
  );
};

// ── 9. Bond: the three real logos orbit a heart, tied to it with blue strings.
export const Bond: React.FC<{ dur: number }> = ({ dur }) => {
  const { frame, sp } = useT();
  return (
    <Stage>
      <Sfx name="p-heart" at={3} volume={0.45} />
      {LOGOS.map((_, i) => <Sfx key={i} name="p-tap" at={10 + i * 8} volume={0.4} />)}
      <Sfx name="p-chime" at={Math.round(dur * 0.6)} volume={0.35} />
      {(() => {
        const pts = LOGOS.map((_, i) => { const a = (i / 3) * Math.PI * 2 + frame / 45 - Math.PI / 2; return { x: 480 + Math.cos(a) * 330, y: 470 + Math.sin(a) * 310 }; });
        return (
          <>
            <svg width={960} height={960} style={{ position: "absolute", inset: 0 }}>
              {pts.map((p, i) => <line key={i} x1={480} y1={470} x2={p.x} y2={p.y} stroke={BLUE} strokeWidth={8} strokeDasharray="16 10" strokeDashoffset={-frame * 2} opacity={Math.min(1, sp(0.4 + i * 0.27, 10))} />)}
            </svg>
            {pts.map((p, i) => (
              <div key={i} style={{ ...box({ borderRadius: 26 }), left: p.x - 150, top: p.y - 70, width: 300, height: 140, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(0.3 + i * 0.27, 8)})` }}>
                <Logo name={LOGOS[i]} w={240} />
              </div>
            ))}
          </>
        );
      })()}
      <div style={{ position: "absolute", left: 360, top: 350, transform: `scale(${sp(0.05, 7) * (1 + Math.abs(Math.sin(frame / 8)) * 0.08)})` }}>
        <svg width={240} height={240} viewBox="0 0 24 24"><path d="M12 21 C5 15.5 2 12.5 2 8.5 A5 5 0 0 1 12 6 A5 5 0 0 1 22 8.5 C22 12.5 19 15.5 12 21 Z" fill={BLUE} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" /></svg>
      </div>
    </Stage>
  );
};

// ── 10. Paint palette: swatches fan out, "cakep" — then crossed by the beat change.
export const Palette: React.FC = () => {
  const { frame, sp } = useT();
  const cols = [PINK, "#F97316", "#FDE047", LIME, BLUE];
  return (
    <Stage h={900}>
      {cols.map((_, i) => <Sfx key={i} name="p-tap" at={4 + i * 4} volume={0.4} />)}
      {cols.map((c, i) => (
        <div key={i} style={{ ...box({ background: c, borderRadius: 24 }), left: 330, top: 220, width: 300, height: 480, transformOrigin: "50% 95%", transform: `rotate(${(i - 2) * 16 * Math.min(1, sp(0.1 + i * 0.13, 10)) + Math.sin(frame / 15) * 2}deg)` }}>
          <div style={{ position: "absolute", left: 120, bottom: 24, width: 50, height: 50, borderRadius: "50%", background: CREAM, border: `5px solid ${INK}` }} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 380, top: 40, transform: `rotate(${-10 + Math.sin(frame / 8) * 8}deg)`, ...grow(sp(0.6, 8), 40) }}><Icon name="paintbrush" size={180} color={DEEP} stroke={2.2} /></div>
    </Stage>
  );
};
