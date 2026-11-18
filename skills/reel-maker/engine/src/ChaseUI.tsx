// "Iklan ngikutin kamu" visuals (pop skin): flat sticker illustrations with thick charcoal outlines.
// Googly-eyed sneaker ads, a tagged shopper, stock alarm, loss-aversion scale, coffee stamp cards, chase, shop, 11.11 calendar.
// Timing props are seconds from the start of the visual (matched to the VO).
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Sfx } from "./sfx";
import { F, clamp } from "./theme";
import { Icon } from "./Visuals";
import { Particles, float, grow, squash, stamp, swing, useT } from "./PriceUI";

const INK = "#111827", LIME = "#A3E635", FOREST = "#4D7C0F", DEEP = "#365314", CREAM = "#F7FEE7", WARN = "#F97316", SKIN = "#E7B08A";
const box = (extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", background: "#fff", border: `6px solid ${INK}`, borderRadius: 30, boxShadow: `10px 10px 0 ${INK}`, ...extra });
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ width: 960, height: 960, position: "relative", transform: "scale(1.1)" }}>{children}</div>;

// ── Background: cream page with drifting doodles (blobs, squiggles, sparkles, plus signs).
export const PopBg: React.FC<{ kind: "paper" | "cork" | "dark"; seed: number }> = ({ kind, seed }) => {
  const frame = useCurrentFrame();
  const a = kind === "paper" ? [`${LIME}66`, `${INK}22`] : kind === "cork" ? [`${LIME}40`, `${CREAM}22`] : [`${LIME}38`, `${CREAM}18`];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <pattern id="grid" width={60} height={60} patternUnits="userSpaceOnUse"><path d="M60 0 H0 V60" fill="none" stroke={a[1]} strokeWidth={2} /></pattern>
        </defs>
        <rect width={1080} height={1920} fill="url(#grid)" opacity={0.6} />
        {Array.from({ length: 14 }, (_, i) => {
          const r = (k: string) => random(`pop${seed}${k}${i}`);
          const x = r("x") * 1080 + Math.sin(frame / (35 + r("p") * 30) + i) * 26;
          const y = r("y") * 1920 + Math.cos(frame / (45 + r("q") * 30) + i) * 22;
          const rot = r("r") * 360 + frame * (r("w") - 0.5) * 1.2;
          const s = 0.7 + r("s") * 1.1;
          const kindOf = Math.floor(r("k") * 4);
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
              {kindOf === 0 && <circle r={50} fill={a[0]} />}
              {kindOf === 1 && <path d="M-50 0 q12 -24 25 0 t25 0 t25 0 t25 0" fill="none" stroke={a[1]} strokeWidth={7} strokeLinecap="round" />}
              {kindOf === 2 && <path d="M0 -26 L6 -6 L26 0 L6 6 L0 26 L-6 6 L-26 0 L-6 -6 Z" fill={a[0]} />}
              {kindOf === 3 && <path d="M-16 0 H16 M0 -16 V16" stroke={a[1]} strokeWidth={8} strokeLinecap="round" />}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ── Drawings ──────────────────────────────────────────────────────────────────────────────
// Lime sneaker with googly eyes; `look` = pupil offset (-1..1), blinks on its own.
export const Sneaker: React.FC<{ w?: number; look?: [number, number]; seed?: number; color?: string }> = ({ w = 300, look = [0, 0], seed = 0, color = LIME }) => {
  const frame = useCurrentFrame();
  const blink = (frame + seed * 17) % 70 < 4 ? 0.1 : 1;
  const eye = (cx: number, cy: number) => (
    <g transform={`translate(${cx} ${cy}) scale(1 ${blink})`}>
      <circle r={15} fill="#fff" stroke={INK} strokeWidth={5} />
      <circle cx={look[0] * 6} cy={look[1] * 6} r={7} fill={INK} />
    </g>
  );
  return (
    <svg width={w} height={w * 0.62} viewBox="0 0 200 124" style={{ overflow: "visible" }}>
      <path d="M14 94 H188 a9 9 0 0 1 0 18 H22 a8 8 0 0 1 -8 -8 z" fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M16 94 C14 62 30 40 62 34 L98 30 C112 52 142 62 174 66 C190 70 192 84 190 94 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M40 82 C70 70 110 84 150 74" fill="none" stroke={DEEP} strokeWidth={9} strokeLinecap="round" />
      <path d="M62 34 C66 20 94 18 98 30" fill="#fff" stroke={INK} strokeWidth={6} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${100 + i * 12} ${40 + i * 6} l12 -8`} stroke={INK} strokeWidth={5} strokeLinecap="round" />)}
      {eye(140, 72)}
      {eye(166, 76)}
    </svg>
  );
};

// Flat shopper: hoodie + jeans. run = leg/arm swing phase in radians (undefined = standing), face = mood.
export const Person: React.FC<{ h?: number; run?: number; face?: "calm" | "panic" | "worry"; flip?: boolean; bag?: boolean }> = ({ h = 420, run, face = "calm", flip, bag }) => {
  const sw = run === undefined ? 0 : Math.sin(run) * 32;
  const leg = (dir: number) => (
    <g transform={`rotate(${sw * dir} 100 236)`}>
      <rect x={86} y={232} width={28} height={92} rx={12} fill={INK} />
      <ellipse cx={108} cy={326} rx={26} ry={13} fill={LIME} stroke={INK} strokeWidth={5} />
    </g>
  );
  return (
    <svg width={h * 0.56} height={h} viewBox="0 0 200 356" style={{ overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }}>
      {leg(1)}
      {leg(-1)}
      <g transform={`rotate(${-sw * 0.8} 100 140)`}><rect x={46} y={130} width={26} height={90} rx={13} fill={FOREST} stroke={INK} strokeWidth={5} /></g>
      <rect x={58} y={118} width={84} height={124} rx={34} fill={FOREST} stroke={INK} strokeWidth={6} />
      <path d="M80 122 Q100 146 120 122" fill="none" stroke={INK} strokeWidth={5} />
      <g transform={`rotate(${sw * 0.8} 100 140)`}>
        <rect x={128} y={130} width={26} height={90} rx={13} fill={FOREST} stroke={INK} strokeWidth={5} />
        {bag && <g><path d="M126 214 q14 -26 28 0" fill="none" stroke={INK} strokeWidth={5} /><rect x={116} y={212} width={50} height={54} rx={8} fill={LIME} stroke={INK} strokeWidth={5} /></g>}
      </g>
      <circle cx={100} cy={70} r={50} fill={SKIN} stroke={INK} strokeWidth={6} />
      <path d="M50 66 C50 20 150 14 152 62 C130 44 90 40 50 66 Z" fill={INK} />
      {face === "panic" ? (
        <g>
          <circle cx={82} cy={74} r={9} fill="#fff" stroke={INK} strokeWidth={4} /><circle cx={82} cy={74} r={3} fill={INK} />
          <circle cx={118} cy={74} r={9} fill="#fff" stroke={INK} strokeWidth={4} /><circle cx={118} cy={74} r={3} fill={INK} />
          <path d="M70 58 l20 6 M130 58 l-20 6" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={100} cy={100} rx={10} ry={13} fill={INK} />
        </g>
      ) : (
        <g>
          <circle cx={84} cy={74} r={5} fill={INK} /><circle cx={116} cy={74} r={5} fill={INK} />
          <path d={face === "worry" ? "M86 102 Q100 92 114 102" : "M84 94 Q100 108 116 94"} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

const Sweat: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  return (
    <>
      {[0, 1].map((i) => {
        const k = ((t + i * 12) % 24) / 24;
        return <svg key={i} width={36} height={50} style={{ position: "absolute", left: x + i * 70, top: y + k * 60, opacity: 1 - k }} viewBox="0 0 36 50"><path d="M18 2 C26 18 34 28 34 34 a16 16 0 0 1 -32 0 C2 28 10 18 18 2 Z" fill="#7DD3FC" stroke={INK} strokeWidth={4} /></svg>;
      })}
    </>
  );
};

// Small framed "ad" stickers: different app chrome around the same sneaker.
const AdFrame: React.FC<{ kind: "post" | "video" | "web" | "story" | "news"; seed: number; look: [number, number] }> = ({ kind, seed, look }) => {
  const w = kind === "story" ? 210 : 300;
  return (
    <div style={{ width: w, background: "#fff", border: `6px solid ${INK}`, borderRadius: 22, boxShadow: `8px 8px 0 ${INK}`, overflow: "hidden" }}>
      <div style={{ height: 44, background: kind === "video" ? INK : kind === "news" ? DEEP : CREAM, borderBottom: `5px solid ${INK}`, display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
        {kind === "web" ? [0, 1, 2].map((i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: i ? LIME : INK }} />) : <Icon name={kind === "video" ? "play" : kind === "news" ? "newspaper" : kind === "story" ? "circle-user" : "camera"} size={30} color={kind === "video" || kind === "news" ? LIME : INK} stroke={2.6} />}
        <div style={{ flex: 1, height: 12, borderRadius: 6, background: kind === "video" || kind === "news" ? "#ffffff44" : `${INK}22` }} />
      </div>
      <div style={{ height: kind === "story" ? 300 : kind === "video" ? 170 : 200, background: kind === "story" ? `linear-gradient(${LIME}, ${CREAM})` : CREAM, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <Sneaker w={kind === "story" ? 170 : 220} look={look} seed={seed} />
        <div style={{ position: "absolute", top: 10, right: 10, background: LIME, border: `4px solid ${INK}`, borderRadius: 10, fontFamily: F.stamp, fontSize: 24, padding: "0 8px", color: INK }}>IKLAN</div>
      </div>
      {kind === "post" && <div style={{ display: "flex", gap: 12, padding: 10 }}><Icon name="heart" size={34} color={INK} stroke={2.6} /><Icon name="message-circle" size={34} color={INK} stroke={2.6} /></div>}
      {kind === "video" && <div style={{ height: 12, background: `${INK}22` }}><div style={{ width: "40%", height: "100%", background: LIME }} /></div>}
    </div>
  );
};

// ── 1. Hook: phone with a sneaker; one tap, then the same sneaker pops up in every app, all eyes on you.
export const Stalk: React.FC<{ tap: number; ads: number[] }> = ({ tap, ads }) => {
  const { frame, f, sp } = useT();
  const intro = interpolate(frame, [0, 8], [2.4, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const tapF = f(tap);
  const spots: { kind: "post" | "video" | "web" | "story" | "news"; x: number; y: number; r: number }[] = [
    { kind: "post", x: -20, y: -10, r: -8 }, { kind: "video", x: 650, y: 20, r: 7 }, { kind: "story", x: 710, y: 520, r: -6 }, { kind: "web", x: -40, y: 600, r: 6 }, { kind: "news", x: 340, y: 760, r: -3 },
  ];
  const lookAt = (x: number, y: number): [number, number] => { const dx = 480 - x, dy = 480 - y, d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };
  const press = interpolate(frame, [tapF - 3, tapF, tapF + 6], [1, 0.9, 1], clamp);
  const fingerK = interpolate(frame, [tapF - 14, tapF, tapF + 10], [0, 1, 0], clamp);
  return (
    <Stage>
      <Sfx name="p-boing" at={1} volume={0.5} />
      <Sfx name="p-tap" at={tapF} volume={0.7} />
      <Sfx name="p-chime" at={tapF + 3} volume={0.35} />
      {ads.map((a, i) => <Sfx key={i} name={i % 2 ? "p-ding" : "p-bubble"} at={f(a)} volume={0.55} />)}
      {/* phone */}
      <div style={{ position: "absolute", left: 300, top: 120, width: 360, height: 680, borderRadius: 54, background: INK, padding: 16, boxShadow: `14px 14px 0 ${DEEP}`, transform: `scale(${intro * press * 1.2}) rotate(${swing(frame, [0, tapF], 4, 0.3, 18)}deg)` }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 40, background: CREAM, overflow: "hidden", position: "relative" }}>
          <div style={{ height: 300, background: LIME, borderBottom: `5px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ transform: `translateY(${float(frame, 0, 8)}px)` }}><Sneaker w={290} look={frame > tapF ? [0, 1] : [Math.sin(frame / 9) * 0.8, 0.3]} /></div>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ height: 26, width: "80%", borderRadius: 13, background: `${INK}cc` }} />
            <div style={{ height: 20, width: "55%", borderRadius: 10, background: `${INK}33`, marginTop: 16 }} />
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>{[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" size={30} color={INK} stroke={2.4} />)}</div>
            <div style={{ marginTop: 40, height: 80, borderRadius: 22, background: INK, border: `5px solid ${INK}` }} />
          </div>
        </div>
      </div>
      {/* finger tap */}
      <div style={{ position: "absolute", left: 470 + (1 - fingerK) * 260, top: 330 + (1 - fingerK) * 380, opacity: frame < tapF + 10 ? Math.min(1, fingerK * 3) : 0 }}><Icon name="pointer" size={140} color={INK} stroke={2} /></div>
      {frame >= tapF && frame < tapF + 18 && <div style={{ position: "absolute", left: 480 - 80, top: 270 - 80, width: 160, height: 160, borderRadius: "50%", border: `8px solid ${LIME}`, transform: `scale(${(frame - tapF) / 8})`, opacity: 1 - (frame - tapF) / 18 }} />}
      {/* ads pop around */}
      {spots.map((s, i) => {
        const k = sp(ads[i] ?? 99, 8);
        if (k <= 0.01) return null;
        return (
          <div key={i} style={{ position: "absolute", left: s.x, top: s.y, transform: `scale(${k}) rotate(${s.r + swing(frame, [f(ads[i])], 10, 0.3, 14) + Math.sin(frame / 8 + i) * 2}deg)`, transformOrigin: "50% 50%" }}>
            <AdFrame kind={s.kind} seed={i + 1} look={lookAt(s.x + 150, s.y + 150)} />
          </div>
        );
      })}
    </Stage>
  );
};

// ── 2. Cursor hovers over BELI but never clicks; it shakes "no" and backs off.
export const NoClick: React.FC<{ at: number }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const a = f(at);
  const btn = sp(0.05, 10);
  const near = interpolate(frame, [4, a - 4], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 2 });
  const back = interpolate(frame, [a + 6, a + 20], [0, 1], clamp);
  const shake = frame > a - 4 && frame < a + 10 ? Math.sin(frame * 2.2) * 18 : 0;
  return (
    <Stage>
      <Sfx name="p-slide" at={4} volume={0.4} />
      <Sfx name="p-buzzer" at={a} volume={0.45} />
      <div style={{ ...box({ left: 180, top: 300, width: 600, height: 230, borderRadius: 60, background: LIME }), display: "flex", alignItems: "center", justifyContent: "center", gap: 26, ...grow(btn) }}>
        <Icon name="shopping-cart" size={110} color={INK} stroke={2.6} />
        <div style={{ fontFamily: F.stamp, fontSize: 130, color: INK }}>BELI</div>
      </div>
      <div style={{ position: "absolute", left: 560 + shake - back * 160 + (1 - near) * 260, top: 520 - near * 120 + back * 220, transform: `rotate(${-10 + shake * 0.5}deg)` }}>
        <Icon name="mouse-pointer-2" size={170} color={INK} stroke={2} />
      </div>
      {[0, 1, 2].map((i) => {
        const k = sp(at + 0.15 + i * 0.12, 8);
        return <div key={i} style={{ position: "absolute", left: 220 + i * 190, top: 640, width: 140, height: 140, borderRadius: 70, border: `6px solid ${INK}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.stamp, fontSize: 90, color: INK, ...grow(k) }}>0</div>;
      })}
    </Stage>
  );
};

// ── 3. Opening a product sticks a target pin on your head; app icons start orbiting it (retargeting).
export const Tagged: React.FC<{ open: number; pin: number; orbit: number }> = ({ open, pin, orbit }) => {
  const { frame, f, sp } = useT();
  const page = sp(open, 9), pinF = f(pin), orbitK = sp(orbit, 12);
  const fly = interpolate(frame, [pinF - 10, pinF], [0, 1], { ...clamp, easing: (x) => x * x });
  const px = interpolate(fly, [0, 1], [700, 300]), py = interpolate(fly, [0, 1], [280, 200]) - Math.sin(fly * Math.PI) * 160;
  const land = frame >= pinF;
  const head = { x: 300, y: 230 };
  return (
    <Stage>
      <Sfx name="p-slide" at={f(open)} volume={0.45} />
      <Sfx name="p-zip" at={pinF - 10} volume={0.4} />
      <Sfx name="p-thump" at={pinF} volume={0.6} />
      <Sfx name="p-chime" at={f(orbit)} volume={0.4} />
      {[0, 1, 2].map((i) => <Sfx key={i} name="p-bubble" at={f(orbit) + 4 + i * 4} volume={0.4} />)}
      {/* radar rings */}
      {land && [0, 20, 40].map((d) => {
        const k = ((frame - pinF + d) % 60) / 60;
        return <div key={d} style={{ position: "absolute", left: head.x - 60 - k * 240, top: head.y - 60 - k * 240, width: 120 + k * 480, height: 120 + k * 480, borderRadius: "50%", border: `6px solid ${LIME}`, opacity: 1 - k }} />;
      })}
      <div style={{ position: "absolute", left: 190, top: 300, transform: squash(frame, pinF, 0.12) }}><Person h={560} face={land ? "worry" : "calm"} /></div>
      {/* product page */}
      <div style={{ ...box({ left: 560, top: 130, width: 360, height: 470 }), overflow: "hidden", ...grow(page) }}>
        <div style={{ height: 220, background: LIME, borderBottom: `5px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Sneaker w={250} look={[-1, 0.2]} /></div>
        <div style={{ padding: 22 }}>
          <div style={{ height: 22, width: "85%", borderRadius: 11, background: `${INK}cc` }} />
          <div style={{ height: 18, width: "50%", borderRadius: 9, background: `${INK}33`, marginTop: 14 }} />
          <div style={{ marginTop: 30, height: 70, borderRadius: 20, background: INK }} />
        </div>
      </div>
      {/* pin */}
      {frame >= pinF - 10 && (
        <div style={{ position: "absolute", left: (land ? head.x : px) - 60, top: (land ? head.y - 230 : py - 120), transform: land ? `${squash(frame, pinF, 0.35)} rotate(${swing(frame, [pinF], 12, 0.3, 16)}deg)` : `rotate(${fly * 360}deg)`, transformOrigin: "50% 100%" }}>
          <svg width={120} height={150} viewBox="0 0 120 150"><path d="M60 146 C40 110 8 86 8 56 a52 52 0 0 1 104 0 C112 86 80 110 60 146 Z" fill={LIME} stroke={INK} strokeWidth={7} /><circle cx={60} cy={56} r={26} fill="#fff" stroke={INK} strokeWidth={6} /><circle cx={60} cy={56} r={11} fill={INK} /></svg>
        </div>
      )}
      {/* orbiting apps */}
      {orbitK > 0.01 && ["camera", "play", "globe", "newspaper"].map((n, i) => {
        const a = frame / 14 + (i * Math.PI) / 2;
        return (
          <div key={n} style={{ position: "absolute", left: head.x - 52 + Math.cos(a) * 250 * orbitK, top: head.y - 120 + Math.sin(a) * 110 * orbitK, width: 104, height: 104, borderRadius: 28, background: i % 2 ? LIME : "#fff", border: `6px solid ${INK}`, boxShadow: `6px 6px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${orbitK})` }}>
            <Icon name={n} size={60} color={INK} stroke={2.6} />
          </div>
        );
      })}
    </Stage>
  );
};

// ── 4. Same sneaker shows up again and again; the love meter fills; then "SAMA" — it never changed.
export const Crush: React.FC<{ seen: number[]; love: number; same: number; stampAt: number }> = ({ seen, love, same, stampAt }) => {
  const { frame, f, sp } = useT();
  const level = seen.filter((s) => frame >= f(s)).length / seen.length;
  const meter = interpolate(frame, [f(seen[0]), f(love)], [0, 1], clamp);
  const fill = Math.min(level, meter + 0.25);
  const heart = sp(love, 6);
  const sameF = f(same);
  const merge = interpolate(frame, [sameF, sameF + 12], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const st = sp(stampAt, 10);
  const beat = 1 + (frame > f(love) ? Math.max(0, Math.sin((frame - f(love)) / 4)) * 0.12 : 0);
  return (
    <Stage>
      {seen.map((s, i) => <Sfx key={i} name="p-bubble" at={f(s)} volume={0.5} />)}
      <Sfx name="p-heart" at={f(love)} volume={0.7} />
      <Sfx name="p-zip" at={sameF} volume={0.4} />
      <Sfx name="p-thump" at={f(stampAt)} volume={0.6} />
      {seen.map((s, i) => {
        const k = sp(s, 9);
        const tx = interpolate(merge, [0, 1], [0, (i % 2 ? 560 : 60) - (60 + (i % 2) * 300)]);
        const ty = interpolate(merge, [0, 1], [0, 300 - (40 + Math.floor(i / 2) * 330)]);
        const hide = i > 1 ? 1 - merge : 1;
        return (
          <div key={i} style={{ position: "absolute", left: 60 + (i % 2) * 300, top: 40 + Math.floor(i / 2) * 330, transform: `translate(${tx}px, ${ty}px) scale(${k}) rotate(${(i % 2 ? 4 : -4) + swing(frame, [f(s)], 8, 0.3, 14)}deg)`, opacity: hide }}>
            <div style={{ width: 260, height: 260, background: CREAM, border: `6px solid ${INK}`, borderRadius: 28, boxShadow: `8px 8px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Sneaker w={220} look={[0.6, 0.4]} seed={i} /></div>
          </div>
        );
      })}
      {merge > 0.5 && <div style={{ position: "absolute", left: 400, top: 360, fontFamily: F.stamp, fontSize: 150, color: INK, transform: `scale(${merge})` }}>=</div>}
      {/* love meter */}
      <div style={{ position: "absolute", right: 30, top: 60, width: 130, height: 620, border: `6px solid ${INK}`, borderRadius: 65, background: "#fff", overflow: "hidden", boxShadow: `8px 8px 0 ${INK}`, opacity: 1 - merge }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${fill * 100}%`, background: LIME, borderTop: `6px solid ${INK}` }} />
      </div>
      <div style={{ position: "absolute", right: -5, top: -40, transform: `scale(${heart * beat})`, opacity: 1 - merge }}><Icon name="heart" size={200} color={INK} stroke={2.4} /></div>
      {st > 0.01 && <div style={{ position: "absolute", left: 250, top: 640, ...stamp(st, -8, 150) }}>SAMA AJA</div>}
    </Stage>
  );
};

// ── Roadmap: three trick stickers; done ones get a check, the active one bounces.
export const Trio: React.FC<{ active: number }> = ({ active }) => {
  const { frame, sp } = useT();
  const items = [{ icon: "eye", t: "Dibuntuti" }, { icon: "hourglass", t: "Stok tipis" }, { icon: "stamp", t: "Kartu poin" }];
  return (
    <Stage>
      {items.map((it, i) => {
        const k = sp(0.05 + i * 0.12, 9);
        const on = active < 0 || i === active, done = active >= 0 && i < active;
        return (
          <div key={i}>
            <Sfx name="p-bubble" at={Math.round(2 + i * 3.6)} volume={0.45} />
            <div style={{ ...box({ left: 40 + i * 300, top: 260 + (i === active ? Math.sin(frame / 5) * 12 : 0), width: 260, height: 360, background: on ? LIME : done ? "#fff" : CREAM, opacity: on || done ? 1 : 0.55 }), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, transform: `scale(${k * (i === active ? 1.08 : 0.94)}) rotate(${(i - 1) * 4}deg)` }}>
              <div style={{ fontFamily: F.stamp, fontSize: 80, color: INK, lineHeight: 1 }}>{i + 1}</div>
              <Icon name={it.icon} size={110} color={INK} stroke={2.4} />
              <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 40, color: INK }}>{it.t}</div>
              {done && <div style={{ position: "absolute", top: -30, right: -30, width: 90, height: 90, borderRadius: 45, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" size={60} color={LIME} stroke={4} /></div>}
            </div>
          </div>
        );
      })}
    </Stage>
  );
};

// ── 6. Stock bar drains to 2, alarm badge flashes, shopper panics.
export const Stock: React.FC<{ two: number; panic: number }> = ({ two, panic }) => {
  const { frame, f, sp } = useT();
  const card = sp(0.02, 10);
  const left = Math.round(interpolate(frame, [4, f(two)], [10, 2], clamp));
  const twoF = f(two), panicF = f(panic);
  const flash = frame >= twoF && Math.floor((frame - twoF) / 5) % 2 === 0;
  const shake = frame >= panicF ? Math.sin(frame * 2.4) * 8 * Math.exp(-(frame - panicF) / 20) : 0;
  return (
    <Stage>
      {Array.from({ length: 8 }, (_, i) => <Sfx key={i} name="p-tick" at={4 + Math.round(((twoF - 4) * i) / 8)} volume={0.45} />)}
      <Sfx name="p-siren" at={twoF} volume={0.5} />
      <Sfx name="p-boing" at={panicF} volume={0.5} />
      <div style={{ ...box({ left: 40, top: 80, width: 520, height: 640 }), overflow: "hidden", ...grow(card) }}>
        <div style={{ height: 300, background: LIME, borderBottom: `5px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Sneaker w={340} look={[0.8, 0.5]} /></div>
        <div style={{ padding: 30 }}>
          <div style={{ display: "flex", gap: 10 }}>{Array.from({ length: 10 }, (_, i) => <div key={i} style={{ flex: 1, height: 70, borderRadius: 12, border: `5px solid ${INK}`, background: i < left ? (left <= 2 ? WARN : FOREST) : "#fff" }} />)}</div>
          <div style={{ marginTop: 34, height: 90, borderRadius: 24, background: INK, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <Icon name="shopping-cart" size={50} color={LIME} stroke={2.6} />
            <div style={{ fontFamily: F.stamp, fontSize: 56, color: LIME }}>BELI</div>
          </div>
        </div>
      </div>
      {frame >= twoF && <div style={{ position: "absolute", left: 300, top: 30, ...stamp(sp(two, 9), 8, 92), background: flash ? WARN : "#fff" }}>SISA 2!</div>}
      <div style={{ position: "absolute", left: 600, top: 300, transform: `translateX(${shake}px)` }}><Person h={540} face={frame >= panicF ? "panic" : "calm"} /></div>
      <Sweat x={640} y={250} at={panicF} />
      <Particles at={twoF} n={8} seed="stk" x={560} y={120} speed={12} item={(i) => <Icon name={i % 2 ? "triangle-alert" : "zap"} size={56} color={INK} stroke={2.4} />} />
    </Stage>
  );
};

// ── 7. Loss aversion: losing drops a ×2 weight, the gain barely moves the scale.
export const Scale: React.FC<{ loss: number; two: number; gain: number }> = ({ loss, two, gain }) => {
  const { frame, f, sp } = useT();
  const L = f(loss), G = f(gain);
  const tiltTarget = frame < L ? 0 : frame < G ? -16 : -11;
  const tilt = tiltTarget + swing(frame, [L, G], 6, 0.35, 14);
  const drop = (at: number) => interpolate(frame, [at - 10, at], [-500, 0], { ...clamp, easing: (x) => x * x });
  const twoK = sp(two, 8);
  const rad = (tilt * Math.PI) / 180;
  const pan = (side: number) => ({ x: 480 + side * 300 * Math.cos(rad), y: 330 + side * 300 * Math.sin(rad) });
  const l = pan(-1), r = pan(1);
  return (
    <Stage>
      <Sfx name="p-creak" at={L} volume={0.5} />
      <Sfx name="p-thump" at={L} volume={0.6} />
      <Sfx name="p-chime" at={f(two)} volume={0.45} />
      <Sfx name="p-bubble" at={G} volume={0.5} />
      <Sfx name="p-creak" at={G} volume={0.3} />
      {/* stand */}
      <div style={{ position: "absolute", left: 455, top: 330, width: 50, height: 480, background: INK, borderRadius: 14 }} />
      <div style={{ position: "absolute", left: 300, top: 790, width: 360, height: 60, background: INK, borderRadius: 30 }} />
      <div style={{ position: "absolute", left: 180, top: 320, width: 600, height: 24, background: FOREST, border: `6px solid ${INK}`, borderRadius: 12, transform: `rotate(${tilt}deg)` }} />
      <div style={{ position: "absolute", left: 440, top: 290, width: 80, height: 80, borderRadius: 40, background: LIME, border: `6px solid ${INK}` }} />
      {[{ p: l, side: -1 }, { p: r, side: 1 }].map(({ p, side }) => (
        <div key={side} style={{ position: "absolute", left: p.x - 140, top: p.y }}>
          <svg width={280} height={260} style={{ position: "absolute", overflow: "visible" }}><path d="M140 0 L30 180 M140 0 L250 180" stroke={INK} strokeWidth={5} /></svg>
          <div style={{ position: "absolute", top: 176, left: 0, width: 280, height: 50, background: "#fff", border: `6px solid ${INK}`, borderRadius: "0 0 140px 140px" }} />
          {side < 0 && frame >= L - 10 && (
            <div style={{ position: "absolute", left: 50, top: 22 + drop(L), width: 180, height: 160, background: INK, borderRadius: "30px 30px 16px 16px", display: "flex", alignItems: "center", justifyContent: "center", transform: squash(frame, L, 0.2) }}>
              <Icon name="heart-crack" size={96} color={LIME} stroke={2.4} />
            </div>
          )}
          {side > 0 && frame >= G - 10 && (
            <div style={{ position: "absolute", left: 90, top: 96 + drop(G), width: 100, height: 80, background: LIME, border: `6px solid ${INK}`, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", transform: squash(frame, G, 0.2) }}>
              <Icon name="coins" size={50} color={INK} stroke={2.6} />
            </div>
          )}
        </div>
      ))}
      {twoK > 0.01 && <div style={{ position: "absolute", left: 40, top: 40, ...stamp(twoK, -10, 170) }}>2×</div>}
    </Stage>
  );
};

// ── 8. Cart: "BUTUH" tag gets buzzed off; a ghost of regret floats out instead.
export const Motive: React.FC<{ need: number; cross: number; ghost: number }> = ({ need, cross, ghost }) => {
  const { frame, f, sp } = useT();
  const cart = sp(0.03, 10), tag = sp(need, 8), g = sp(ghost, 10);
  const crossK = interpolate(frame, [f(cross), f(cross) + 6], [0, 1], clamp);
  const off = interpolate(frame, [f(cross) + 8, f(cross) + 20], [0, 1], { ...clamp, easing: (x) => x * x });
  return (
    <Stage>
      <Sfx name="p-slide" at={2} volume={0.4} />
      <Sfx name="p-bubble" at={f(need)} volume={0.5} />
      <Sfx name="p-buzzer" at={f(cross)} volume={0.45} />
      <Sfx name="p-ghost" at={f(ghost)} volume={0.6} />
      <div style={{ position: "absolute", left: 180, top: 380, ...grow(cart) }}>
        <svg width={520} height={420} viewBox="0 0 260 210">
          <path d="M6 20 H40 L70 140 H210 L236 50 H52" fill={CREAM} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <path d="M60 80 H225 M66 110 H216" stroke={INK} strokeWidth={6} />
          <circle cx={88} cy={178} r={20} fill={LIME} stroke={INK} strokeWidth={7} /><circle cx={196} cy={178} r={20} fill={LIME} stroke={INK} strokeWidth={7} />
        </svg>
      </div>
      {tag > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 140, transform: `translate(${off * -500}px, ${off * 300}px) rotate(${-10 - off * 60}deg)`, opacity: 1 - off }}>
          <div style={{ ...stamp(tag, 0, 110), position: "relative", background: "#fff" }}>
            BUTUH
            {crossK > 0 && <svg width={420} height={160} style={{ position: "absolute", left: 0, top: 0 }}><path d="M10 140 L410 20" stroke={WARN} strokeWidth={22} strokeLinecap="round" strokeDasharray={430} strokeDashoffset={430 * (1 - crossK)} /></svg>}
          </div>
        </div>
      )}
      {g > 0.01 && (
        <div style={{ position: "absolute", left: 360, top: 360 - g * 300 + float(frame, 0, 18), transform: `scale(${g}) rotate(${Math.sin(frame / 8) * 8}deg)` }}>
          <svg width={240} height={280} viewBox="0 0 120 140">
            <path d="M10 60 a50 50 0 0 1 100 0 V130 l-16 -12 l-16 12 l-16 -12 l-16 12 l-16 -12 l-20 12 Z" fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            <ellipse cx={44} cy={58} rx={8} ry={12} fill={INK} /><ellipse cx={76} cy={58} rx={8} ry={12} fill={INK} />
            <ellipse cx={60} cy={88} rx={12} ry={9} fill={INK} />
          </svg>
        </div>
      )}
    </Stage>
  );
};

// ── 9–10. Coffee stamp card: 10 slots; `stamps` = times each slot gets stamped, `think` = "sayang..." bubble.
const Cup: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100"><path d="M18 30 H74 L68 88 H24 Z" fill={LIME} stroke={INK} strokeWidth={6} strokeLinejoin="round" /><path d="M74 42 h8 a12 12 0 0 1 0 24 h-10" fill="none" stroke={INK} strokeWidth={6} /><path d="M34 20 q6 -8 0 -14 M50 20 q6 -8 0 -14" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /></svg>
);
const Card: React.FC<{ slots: number; filled: number; gift?: number; pre?: number; glow?: boolean; w?: number }> = ({ slots, filled, gift = -1, pre = 0, glow, w = 860 }) => {
  const frame = useCurrentFrame();
  const cols = 5, cell = (w - 80) / cols;
  return (
    <div style={{ width: w, background: CREAM, border: `7px solid ${INK}`, borderRadius: 36, boxShadow: `12px 12px 0 ${INK}`, padding: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16 }}>
        <Cup size={80} />
        <div style={{ flex: 1, height: 22, borderRadius: 11, background: `${INK}cc` }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
        {Array.from({ length: slots }, (_, i) => {
          const on = i < filled, last = i === slots - 1;
          const pulse = glow && !on ? 1 + Math.max(0, Math.sin(frame / 4 + i)) * 0.08 : 1;
          return (
            <div key={i} style={{ height: cell - 10, borderRadius: "50%", border: `5px ${on ? "solid" : "dashed"} ${INK}`, background: on ? (i < pre ? FOREST : LIME) : last ? "#fff" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pulse})` }}>
              {on ? <Icon name={i < pre ? "gift" : "coffee"} size={cell * 0.45} color={i < pre ? LIME : INK} stroke={2.6} /> : last || i === gift ? <Icon name="gift" size={cell * 0.45} color={INK} stroke={2.2} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export const StampCard: React.FC<{ stamps?: number[]; think?: number }> = ({ stamps = [], think }) => {
  const { frame, f, sp } = useT();
  const k = sp(0.02, 10);
  const filled = stamps.filter((s) => frame >= f(s)).length;
  const last = stamps.filter((s) => frame >= f(s)).pop();
  const th = think !== undefined ? sp(think, 9) : 0;
  return (
    <Stage>
      <Sfx name="p-slide" at={1} volume={0.4} />
      {stamps.map((s, i) => <Sfx key={i} name="p-thump" at={f(s)} volume={0.35} />)}
      {think !== undefined && <Sfx name="p-bubble" at={f(think)} volume={0.5} />}
      <div style={{ position: "absolute", left: 50, top: think !== undefined ? 360 : 200, transform: `${last !== undefined ? squash(frame, f(last), 0.06) : ""} rotate(${-3 + swing(frame, [0], 4, 0.3, 20)}deg)`, ...grow(k) }}>
        <Card slots={10} filled={filled} glow={filled >= 8} />
      </div>
      {/* rubber stamp hits the newest slot */}
      {last !== undefined && frame - f(last) < 8 && (
        <div style={{ position: "absolute", left: 120 + ((filled - 1) % 5) * 160, top: (think !== undefined ? 360 : 200) + 60 + Math.floor((filled - 1) / 5) * 160 - interpolate(frame - f(last), [0, 3, 8], [0, 0, -120], clamp) }}>
          <Icon name="stamp" size={120} color={INK} stroke={2.4} />
        </div>
      )}
      {th > 0.01 && (
        <div style={{ position: "absolute", left: 240, top: 20, transform: `scale(${th})`, transformOrigin: "30% 100%" }}>
          <div style={{ ...box({ position: "relative", padding: "26px 44px", borderRadius: 80, background: "#fff" }), fontFamily: F.serif, fontSize: 90, color: INK, whiteSpace: "nowrap" }}>sayang...</div>
          {[0, 1].map((i) => <div key={i} style={{ position: "absolute", left: 60 - i * 30, top: 170 + i * 50, width: 40 - i * 14, height: 40 - i * 14, borderRadius: "50%", background: "#fff", border: `5px solid ${INK}` }} />)}
        </div>
      )}
    </Stage>
  );
};

// ── 11. Study: blank 8-slot card vs 10-slot card with 2 free stamps; the head-start card gets finished more; both need 8.
export const Study: React.FC<{ free: number; bars: number; equal: number }> = ({ free, bars, equal }) => {
  const { frame, f, sp } = useT();
  const a = sp(0.1, 10), b = sp(0.35, 10);
  const pre = frame >= f(free) + 6 ? 2 : frame >= f(free) ? 1 : 0;
  const grow1 = interpolate(frame, [f(bars), f(bars) + 30], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const eq = sp(equal, 9);
  const col = (x: number, slots: number, preN: number, k: number, h: number, win: boolean) => (
    <div style={{ position: "absolute", left: x, top: 0, width: 440 }}>
      <div style={{ transform: `scale(${k}) rotate(${win ? 3 : -3}deg)` }}><Card slots={slots} filled={preN} pre={preN} w={440} /></div>
      <div style={{ position: "absolute", left: 120, top: 760 - h * grow1, width: 200, height: h * grow1, background: win ? LIME : "#fff", border: `6px solid ${INK}`, borderRadius: "20px 20px 0 0", boxShadow: `8px 0 0 ${INK}` }} />
      {win && grow1 > 0.9 && <div style={{ position: "absolute", left: 160, top: 760 - h - 120, transform: `rotate(${swing(frame, [f(bars) + 27], 14, 0.3, 14)}deg)` }}><Icon name="crown" size={120} color={INK} stroke={2.4} /></div>}
      {eq > 0.01 && <div style={{ position: "absolute", left: 70, top: 790, ...stamp(eq, win ? 6 : -6, 70), background: "#fff" }}>SISA 8</div>}
    </div>
  );
  return (
    <Stage>
      <Sfx name="p-slide" at={3} volume={0.4} />
      <Sfx name="p-slide" at={10} volume={0.4} />
      <Sfx name="p-thump" at={f(free)} volume={0.55} />
      <Sfx name="p-thump" at={f(free) + 6} volume={0.55} />
      <Sfx name="p-run" at={f(bars)} volume={0.45} />
      <Sfx name="p-yay" at={f(bars) + 27} volume={0.5} />
      <Sfx name="p-chime" at={f(equal)} volume={0.45} />
      <div style={{ position: "absolute", left: 0, top: 760, width: 960, height: 8, background: INK, borderRadius: 4 }} />
      {col(10, 8, 0, a, 200, false)}
      {col(510, 10, pre, b, 380, true)}
      {eq > 0.5 && <div style={{ position: "absolute", left: 445, top: 780, fontFamily: F.stamp, fontSize: 110, color: INK, transform: `scale(${eq})` }}>=</div>}
    </Stage>
  );
};

// ── 12. Shopper runs with a bag; at `chase` the sneaker, stock tag and stamp card burst in behind.
export const Chase: React.FC<{ look: number; chase: number }> = ({ look, chase }) => {
  const { frame, f, sp } = useT();
  const C0 = f(chase), L0 = f(look);
  const running = frame >= C0;
  const ch = sp(chase, 10);
  const bob = running ? Math.abs(Math.sin(frame * 0.5)) * -24 : Math.abs(Math.sin(frame * 0.25)) * -8;
  return (
    <Stage>
      <Sfx name="p-tap" at={L0} volume={0.5} />
      <Sfx name="p-confetti" at={C0} volume={0.5} />
      <Sfx name="p-run" at={C0 + 4} volume={0.5} />
      <Sfx name="p-run" at={C0 + 22} volume={0.4} />
      {/* speed lines */}
      {running && Array.from({ length: 7 }, (_, i) => {
        const x = 960 - (((frame - C0) * 40 + i * 170) % 1200);
        return <div key={i} style={{ position: "absolute", left: x, top: 120 + i * 110, width: 160, height: 10, borderRadius: 5, background: `${LIME}aa` }} />;
      })}
      <div style={{ position: "absolute", left: 80, top: 280 + bob }}><Person h={560} run={running ? frame * 0.5 : frame * 0.25} face={frame >= L0 ? "panic" : "calm"} bag flip={frame >= L0 && frame < C0} /></div>
      {frame >= L0 && <Sweat x={110} y={250} at={L0} />}
      {ch > 0.01 && (
        <>
          <div style={{ position: "absolute", left: 460 + (1 - ch) * 500, top: 560 + Math.abs(Math.sin(frame * 0.5 + 1)) * -40, transform: "scaleX(-1)" }}><Sneaker w={360} look={[1, 0]} /></div>
          <div style={{ position: "absolute", left: 600 + (1 - ch) * 500, top: 120 + Math.abs(Math.sin(frame * 0.5 + 2)) * -30, ...stamp(1, 8, 80), background: WARN }}>SISA 2!</div>
          <div style={{ position: "absolute", left: 560 + (1 - ch) * 600, top: 320 + Math.abs(Math.sin(frame * 0.5 + 3)) * -30, width: 300, height: 190, background: CREAM, border: `6px solid ${INK}`, borderRadius: 26, boxShadow: `8px 8px 0 ${INK}`, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: 18, transform: `rotate(${Math.sin(frame / 3) * 6}deg)` }}>
            {Array.from({ length: 8 }, (_, i) => <div key={i} style={{ borderRadius: "50%", background: i < 6 ? LIME : "transparent", border: `4px solid ${INK}` }} />)}
          </div>
        </>
      )}
    </Stage>
  );
};

// ── 13. Seller's stall: the three trick stickers fly into the shop window one by one.
export const Shop: React.FC<{ at: number[] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const k = sp(0.02, 10);
  const icons = ["eye", "hourglass", "stamp"];
  return (
    <Stage>
      <Sfx name="p-slide" at={1} volume={0.4} />
      {at.map((a, i) => <Sfx key={i} name="p-boing" at={f(a)} volume={0.45} />)}
      <div style={{ position: "absolute", left: 100, top: 160, width: 760, ...grow(k) }}>
        <svg width={760} height={200} viewBox="0 0 380 100" style={{ display: "block" }}>
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${i * 63} 10 h63 v50 a31.5 31.5 0 0 1 -63 0 z`} fill={i % 2 ? CREAM : LIME} stroke={INK} strokeWidth={4} />)}
          <rect x={0} y={2} width={380} height={14} rx={6} fill={INK} />
        </svg>
        <div style={{ height: 470, marginTop: -40, background: "#fff", border: `7px solid ${INK}`, borderTop: "none", borderRadius: "0 0 30px 30px", boxShadow: `12px 12px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "space-evenly" }}>
          {icons.map((n, i) => {
            const s = sp(at[i], 8);
            const fly = interpolate(frame, [f(at[i]) - 10, f(at[i])], [1, 0], clamp);
            return (
              <div key={n} style={{ width: 190, height: 190, borderRadius: 40, background: LIME, border: `6px solid ${INK}`, boxShadow: `8px 8px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `translate(${fly * (i - 1) * 300}px, ${fly * 700}px) scale(${s}) rotate(${swing(frame, [f(at[i])], 12, 0.3, 14)}deg)` }}>
                <Icon name={n} size={110} color={INK} stroke={2.4} />
              </div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
};

// ── 14. Teaser: calendar flips 10.10 → 11.11 → 12.12, discount tags rain into an overflowing cart.
export const Twin: React.FC<{ flips: number[]; rain: number }> = ({ flips, rain }) => {
  const { frame, f, sp } = useT();
  const k = sp(0.02, 10);
  const dates = ["9.9", "10.10", "11.11", "12.12"];
  const idx = flips.filter((t) => frame >= f(t)).length;
  const lastFlip = idx ? f(flips[idx - 1]) : 0;
  const flipK = idx ? interpolate(frame - lastFlip, [0, 8], [90, 0], clamp) : 0;
  const R = f(rain);
  return (
    <Stage>
      {flips.map((t, i) => <Sfx key={i} name="p-zip" at={f(t)} volume={0.45} />)}
      <Sfx name="p-confetti" at={R} volume={0.5} />
      <Sfx name="p-yay" at={R + 6} volume={0.4} />
      <div style={{ position: "absolute", left: 230, top: 20, width: 500, ...grow(k) }}>
        <div style={{ height: 90, background: INK, borderRadius: "30px 30px 0 0", border: `7px solid ${INK}`, display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          {[0, 1].map((i) => <div key={i} style={{ width: 30, height: 30, borderRadius: 15, background: LIME }} />)}
        </div>
        <div style={{ height: 300, background: "#fff", border: `7px solid ${INK}`, borderTop: "none", borderRadius: "0 0 30px 30px", boxShadow: `12px 12px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", perspective: 800 }}>
          <div style={{ fontFamily: F.stamp, fontSize: 180, color: idx === 2 ? FOREST : INK, transform: `rotateX(${flipK}deg)` }}>{dates[idx]}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 250, top: 520, transform: squash(frame, R + 10, 0.12) }}>
        <svg width={460} height={372} viewBox="0 0 260 210">
          <path d="M6 20 H40 L70 140 H210 L236 50 H52" fill={CREAM} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <circle cx={88} cy={178} r={20} fill={LIME} stroke={INK} strokeWidth={7} /><circle cx={196} cy={178} r={20} fill={LIME} stroke={INK} strokeWidth={7} />
        </svg>
      </div>
      {frame >= R && Array.from({ length: 12 }, (_, i) => {
        const t = frame - R - i * 2;
        if (t < 0) return null;
        const x = 300 + random(`tw${i}`) * 340, land = 560 + random(`tl${i}`) * 80;
        const y = Math.min(land, 400 + t * t * 1.4);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: `rotate(${(random(`tr${i}`) - 0.5) * 80}deg)`, width: 120, height: 70, background: i % 2 ? LIME : WARN, border: `5px solid ${INK}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.stamp, fontSize: 40, color: INK }}>%</div>
        );
      })}
    </Stage>
  );
};
