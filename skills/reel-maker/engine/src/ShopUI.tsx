// "Rahasia rak minimarket" visuals (episode 2 of the trik-harga series). Timing props are seconds from the start of the visual.
import { interpolate } from "remotion";
import { Coin, Deco, GREY, Particles, Spark, float, grow, squash, stamp, swing, useT } from "./PriceUI";
import { Sfx } from "./sfx";
import { C, F, clamp } from "./theme";
import { Icon } from "./Visuals";

type Kind = "milk" | "chips" | "soap" | "candy" | "box" | "bottle";
const COLORS: Record<Kind, string> = { milk: "#FFFFFF", chips: "#F4A261", soap: "#5AA8F0", candy: "#F472B6", box: "#FDE68A", bottle: "#A3E635" };

// Simple product drawings, all in one SVG language.
export const Prod: React.FC<{ kind: Kind; size?: number; color?: string }> = ({ kind, size = 90, color }) => {
  const c = color ?? COLORS[kind];
  const ink = { stroke: C.ink, strokeWidth: 4, strokeLinejoin: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
      {kind === "milk" && <><path d="M25 32 L35 10 H65 L75 32 V95 H25 Z" fill={c} {...ink} /><path d="M35 10 L50 32 L65 10" fill="none" {...ink} /><path d="M25 32 H75" {...ink} /><rect x={25} y={48} width={50} height={22} fill={C.emBg} {...ink} /></>}
      {kind === "chips" && <><path d="M20 12 Q50 2 80 12 L76 90 Q50 100 24 90 Z" fill={c} {...ink} /><circle cx={50} cy={50} r={15} fill="#FEF3C7" {...ink} /></>}
      {kind === "soap" && <><rect x={40} y={4} width={20} height={14} fill={GREY} {...ink} /><path d="M60 8 H78" {...ink} /><rect x={24} y={18} width={52} height={78} rx={14} fill={c} {...ink} /><circle cx={50} cy={56} r={10} fill="#fff" {...ink} /></>}
      {kind === "candy" && <><path d="M8 50 L24 36 V64 Z M92 50 L76 36 V64 Z" fill={c} {...ink} /><circle cx={50} cy={50} r={27} fill={c} {...ink} /><path d="M36 40 Q50 56 64 40" fill="none" stroke="#fff" strokeWidth={5} /></>}
      {kind === "box" && <><rect x={16} y={16} width={68} height={80} fill={c} {...ink} /><rect x={28} y={38} width={44} height={26} fill="#fff" {...ink} /></>}
      {kind === "bottle" && <><rect x={40} y={4} width={20} height={16} fill={C.ink} /><path d="M40 20 H60 L72 40 V96 H28 V40 Z" fill={c} {...ink} /><rect x={28} y={54} width={44} height={20} fill="#fff" {...ink} /></>}
    </svg>
  );
};

const Badge: React.FC<{ n: number; icon: string; s: number }> = ({ n, icon, s }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, background: C.emBg, border: `6px solid ${C.ink}`, borderRadius: 999, padding: "10px 30px 10px 20px", boxShadow: `8px 8px 0 ${C.ink}`, ...grow(s, 40) }}>
    <Icon name={icon} size={64} color={C.ink} stroke={2.4} />
    <span style={{ fontFamily: F.stamp, fontSize: 84, lineHeight: 1, color: C.ink }}>{n}</span>
  </div>
);

// ── 1. Hook: milk drops into the basket, then five more things pile in; the counter climbs.
export const Basket: React.FC<{ milk: number; drops: number[] }> = ({ milk, drops }) => {
  const { frame, f, sp } = useT();
  const kinds: Kind[] = ["chips", "soap", "candy", "box", "bottle"];
  const all = [milk, ...drops];
  const n = all.filter((t) => frame >= f(t) + 10).length;
  const lands = all.map((t) => f(t) + 10);
  const last = [...lands].reverse().find((l) => frame >= l) ?? -99;
  const spots = [[370, 200], [240, 210], [530, 200], [300, 110], [460, 100], [380, 20]];
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="bsk" w={960} h={960} />
      <Sfx name="whoosh" at={3} volume={0.4} />
      {all.map((t, i) => <Sfx key={i} name="whoosh" at={f(t)} volume={0.25} />)}
      {lands.map((l, i) => <Sfx key={`l${i}`} name={i ? "pop" : "punch"} at={l} volume={0.5} />)}
      {lands.slice(1).map((l, i) => <Sfx key={`c${i}`} name="tick" at={l + 2} volume={0.35} />)}
      <Sfx name="error" at={lands[lands.length - 1] + 6} volume={0.3} />
      {all.map((t, i) => {
        const d = sp(t, 11);
        if (frame < f(t)) return null;
        const [x, y] = spots[i];
        return <div key={i} style={{ position: "absolute", left: x, top: y + 230, transform: `translateY(${(1 - d) * -900}px) rotate(${(i % 2 ? 1 : -1) * (8 + float(frame, i, 4))}deg)` }}><Prod kind={i ? kinds[i - 1] : "milk"} size={i ? 150 : 190} /></div>;
      })}
      {/* basket */}
      <div style={{ position: "absolute", left: 180, top: 600, width: 600, transformOrigin: "50% 100%", transform: squash(frame, last, 0.12), ...grow(sp(0.05, 11), 80) }}>
        <svg width={600} height={300} viewBox="0 0 600 300">
          <path d="M150 60 Q300 -60 450 60" fill="none" stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
          <path d="M20 60 H580 L530 290 H70 Z" fill={C.red} stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
          {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={95 + k * 70} y={110} width={44} height={140} rx={10} fill={C.emBg} stroke={C.ink} strokeWidth={6} />)}
        </svg>
      </div>
      <div style={{ position: "absolute", right: 30, top: 40 }}><Badge n={n} icon="shopping-basket" s={sp(milk + 0.2, 10)} /></div>
      {lands.slice(1).map((l, i) => <Particles key={i} at={l} n={6} seed={`bk${i}`} x={spots[i + 1][0] + 75} y={spots[i + 1][1] + 300} speed={10} item={() => <Spark size={26} />} />)}
    </div>
  );
};

// ── 2. A store floor plan draws itself, then the DIRANCANG stamp hits.
export const Blueprint: React.FC<{ at: number }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const draw = (a: number, b: number) => interpolate(frame, [f(a), f(b)], [1, 0], clamp);
  const pen = interpolate(frame, [6, f(at) - 4], [0, 1], clamp);
  const lines = ["M60 60 H840 V840 H560 M400 840 H60 Z", "M200 220 H300 V700 H200 Z", "M400 220 H500 V700 H400 Z", "M600 220 H700 V700 H600 Z", "M560 60 V130 H840"];
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Sfx name="slide" at={3} volume={0.4} />
      {lines.map((_, i) => <Sfx key={i} name="tick" at={8 + i * 14} volume={0.3} />)}
      {Array.from({ length: 10 }, (_, i) => <Sfx key={`p${i}`} name="type" at={10 + i * 6} volume={0.3} />)}
      <Sfx name="stamp" at={f(at)} volume={0.75} />
      <div style={{ position: "absolute", left: 30, top: 30, width: 900, height: 900, borderRadius: 30, border: `8px solid ${C.ink}`, boxShadow: `14px 14px 0 ${C.ink}`, background: `${C.em}`, backgroundImage: "linear-gradient(#ffffff22 2px, transparent 2px), linear-gradient(90deg, #ffffff22 2px, transparent 2px)", backgroundSize: "60px 60px", overflow: "hidden", ...grow(sp(0, 11), 80) }}>
        <svg width={900} height={900}>
          {lines.map((d, i) => <path key={i} d={d} fill="none" stroke="#F7FEE7" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={draw(0.2 + i * 0.4, 0.8 + i * 0.4)} />)}
          <path d="M440 870 V720" stroke={C.emBg} strokeWidth={10} strokeDasharray="20 16" strokeLinecap="round" opacity={1 - draw(2, 2.6)} />
        </svg>
        <div style={{ position: "absolute", left: 600, top: 70, opacity: 1 - draw(1.8, 2.2), display: "flex", gap: 12 }}>{[0, 1, 2].map((k) => <Prod key={k} kind="milk" size={70} />)}</div>
      </div>
      <div style={{ position: "absolute", left: 60 + pen * 700, top: 120 + Math.sin(pen * 20) * 120 + pen * 400, transform: `rotate(-30deg)`, opacity: frame < f(at) ? 1 : 0 }}><Icon name="pencil" size={110} color={C.emBg} stroke={2.5} /></div>
      <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center" }}><div style={stamp(sp(at, 12), -10, 130)}>DIRANCANG</div></div>
    </div>
  );
};

// ── 4. Milk is the magnet: shoppers stream in from every side; a crown lands on the milk.
export const Magnet: React.FC<{ crown: number; dur: number }> = ({ crown, dur }) => {
  const { frame, f, sp } = useT();
  const n = 9;
  const pulse = 1 + Math.sin(frame / 6) * 0.04;
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="mag" w={960} h={960} />
      <Sfx name="pop" at={3} volume={0.5} />
      {Array.from({ length: n }, (_, i) => <Sfx key={i} name="slide" at={10 + i * ((dur * 0.55) / n)} volume={0.22} />)}
      {Array.from({ length: n }, (_, i) => <Sfx key={`b${i}`} name="blip" at={24 + i * ((dur * 0.55) / n)} volume={0.25} />)}
      <Sfx name="ding" at={f(crown)} volume={0.55} />
      <Sfx name="stamp" at={f(crown) + 6} volume={0.4} />
      {[0, 1, 2].map((k) => { const t = ((frame + k * 25) % 75) / 75; return <div key={k} style={{ position: "absolute", left: 480 - 120 - t * 300, top: 480 - 120 - t * 300, width: 240 + t * 600, height: 240 + t * 600, borderRadius: "50%", border: `6px solid ${C.emBg}`, opacity: 1 - t }} />; })}
      {Array.from({ length: n }, (_, i) => {
        const t0 = 10 + i * ((dur * 0.55) / n);
        const k = interpolate(frame, [t0, t0 + 16], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
        if (k <= 0) return null;
        const a = (i / n) * Math.PI * 2 + 0.3;
        const r = interpolate(k, [0, 1], [700, 300]);
        return (
          <div key={i} style={{ position: "absolute", left: 480 + Math.cos(a) * r - 55, top: 480 + Math.sin(a) * r - 55, width: 110, height: 110, borderRadius: "50%", background: C.card, border: `5px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `6px 6px 0 ${C.ink}`, transform: `translateY(${Math.abs(Math.sin(frame / 4 + i)) * -10}px)` }}>
            <Icon name="user-round" size={66} color={i % 3 ? C.ink : C.red} stroke={2.4} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 480 - 130, top: 480 - 150, transform: `scale(${pulse})`, filter: `drop-shadow(0 0 40px ${C.emBg})` }}><Prod kind="milk" size={260} /></div>
      <div style={{ position: "absolute", left: 480 - 80, top: 150, ...grow(sp(crown, 8), -200) }}><Icon name="crown" size={160} color={C.ink} stroke={2.2} /></div>
      <Particles at={f(crown) + 4} n={12} seed="magC" x={480} y={230} speed={14} item={() => <Spark size={32} />} />
    </div>
  );
};

// ── 5 / 14. Top-down floor plan: the route snakes past every aisle to the milk fridge; products wiggle as the cart passes.
const ROUTE = [[160, 880], [160, 200], [390, 200], [390, 820], [610, 820], [610, 200], [830, 200], [830, 150]];
const SEG = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]));
const TOTAL = SEG.reduce((a, b) => a + b, 0);
const along = (k: number) => {
  let d = k * TOTAL;
  for (let i = 0; i < SEG.length; i++) {
    if (d <= SEG[i]) { const t = d / SEG[i]; return [ROUTE[i][0] + (ROUTE[i + 1][0] - ROUTE[i][0]) * t, ROUTE[i][1] + (ROUTE[i + 1][1] - ROUTE[i][1]) * t]; }
    d -= SEG[i];
  }
  return ROUTE[ROUTE.length - 1];
};
export const StoreMap: React.FC<{ at: [number, number]; sign?: string }> = ({ at, sign }) => {
  const { frame, f, sp } = useT();
  const k = interpolate(frame, [f(at[0]), f(at[1])], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const [cx, cy] = along(k);
  const aisles = [250, 470, 690];
  const kinds: Kind[] = ["chips", "soap", "candy", "box", "bottle"];
  const done = frame >= f(at[1]);
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Sfx name="slide" at={3} volume={0.4} />
      {Array.from({ length: 12 }, (_, i) => <Sfx key={i} name="tick" at={f(at[0]) + i * ((f(at[1]) - f(at[0])) / 12)} volume={0.25} />)}
      {[0.2, 0.45, 0.7].map((p, i) => <Sfx key={`w${i}`} name="pop" at={f(at[0]) + p * (f(at[1]) - f(at[0]))} volume={0.3} />)}
      <Sfx name="ding" at={f(at[1])} volume={0.5} />
      <div style={{ position: "absolute", left: 30, top: 30, width: 900, height: 900, background: C.card, border: `8px solid ${C.ink}`, borderRadius: 28, boxShadow: `14px 14px 0 ${C.ink}`, ...grow(sp(0, 11), 80) }}>
        {/* fridge strip at the back */}
        <div style={{ position: "absolute", left: 640, top: 20, width: 240, height: 100, background: "#ECFCCB", border: `5px solid ${C.ink}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: done ? `0 0 ${40 + Math.sin(frame / 5) * 15}px ${C.emBg}` : "none" }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ transform: `rotate(${done ? Math.sin(frame / 3 + i) * 8 : 0}deg)` }}><Prod kind="milk" size={70} /></div>)}
        </div>
        {aisles.map((x, a) => (
          <div key={a} style={{ position: "absolute", left: x - 50, top: 220, width: 100, height: 480, background: "#F3F4F6", border: `5px solid ${C.ink}`, borderRadius: 12, display: "flex", flexDirection: "column", justifyContent: "space-around", alignItems: "center" }}>
            {[0, 1, 2, 3].map((r) => {
              const py = 220 + 60 + r * 120;
              const near = Math.hypot(cx - 30 - x, cy - 30 - py) < 150;
              return <div key={r} style={{ transform: `rotate(${near ? Math.sin(frame / 2) * 14 : 0}deg) scale(${near ? 1.15 : 1})` }}><Prod kind={kinds[(a + r) % 5]} size={70} /></div>;
            })}
          </div>
        ))}
        {/* door */}
        <div style={{ position: "absolute", left: 90, bottom: -8, width: 150, height: 16, background: C.emBg, border: `4px solid ${C.ink}` }} />
        <svg width={900} height={900} style={{ position: "absolute", left: -30, top: -30 }}>
          <polyline points={ROUTE.map((p) => p.join(",")).join(" ")} fill="none" stroke={C.red} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${k} 1`} />
        </svg>
        {sign && <div style={{ position: "absolute", left: 30, top: 30, background: C.ink, color: C.emBg, fontFamily: F.stamp, fontSize: 64, padding: "4px 26px", borderRadius: 14, transform: `rotate(${swing(frame, [6], 8)}deg)`, transformOrigin: "50% 0" }}>{sign}</div>}
      </div>
      {frame >= f(at[0]) - 3 && <div style={{ position: "absolute", left: cx - 50, top: cy - 50, width: 100, height: 100, borderRadius: "50%", background: C.emBg, border: `6px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + Math.abs(Math.sin(frame / 3)) * 0.08})` }}><Icon name="shopping-cart" size={60} color={C.ink} stroke={2.5} /></div>}
      <Particles at={f(at[1])} n={12} seed="mapD" x={790} y={110} speed={13} item={() => <Spark size={30} />} />
    </div>
  );
};

// ── 6. Side-scrolling walk: the cart rolls past the snack shelf (PROMO!) and the soap shelf; items keep hopping in.
export const Walk: React.FC<{ at: [number, number, number, number, number, number]; dur: number }> = ({ at, dur }) => {
  const { frame, f, sp } = useT();
  const [snack, promo, soap, abis, step, godaan] = at.map(f);
  const scroll = interpolate(frame, [0, snack, promo + 12, soap, abis + 12, dur], [0, 700, 700, 1500, 1500, 2700], clamp);
  const cartX = 200;
  const shelves: { x: number; kind: Kind }[] = [{ x: 900, kind: "chips" }, { x: 1700, kind: "soap" }, { x: 2300, kind: "candy" }, { x: 2700, kind: "box" }, { x: 3100, kind: "bottle" }];
  const jumps: { t: number; kind: Kind }[] = [{ t: promo + 6, kind: "chips" }, { t: abis, kind: "soap" }, { t: step, kind: "candy" }, { t: step + 10, kind: "box" }, { t: godaan, kind: "bottle" }];
  const inCart = jumps.filter((j) => frame >= j.t + 14).length;
  const lastLand = [...jumps].reverse().find((j) => frame >= j.t + 14);
  const rolling = frame < snack || (frame > promo + 12 && frame < soap) || frame > abis + 12;
  return (
    <div style={{ width: 960, height: 960, position: "relative", overflow: "hidden", borderRadius: 30 }}>
      <Sfx name="whoosh" at={2} volume={0.4} />
      {Array.from({ length: Math.floor(dur / 9) }, (_, i) => i * 9).filter((t) => t < snack || (t > promo + 12 && t < soap) || t > abis + 12).map((t) => <Sfx key={t} name="tick" at={t} volume={0.15} />)}
      <Sfx name="alarm" at={promo} volume={0.25} />
      <Sfx name="ding" at={abis - 4} volume={0.4} />
      {jumps.map((j, i) => <Sfx key={`j${i}`} name="whoosh" at={j.t} volume={0.25} />)}
      {jumps.map((j, i) => <Sfx key={`l${i}`} name="pop" at={j.t + 14} volume={0.5} />)}
      {jumps.map((j, i) => <Sfx key={`c${i}`} name="coin" at={j.t + 16} volume={0.25} />)}
      {/* floor */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, height: 200, background: `repeating-linear-gradient(90deg, #E5E7EB 0 120px, #F3F4F6 120px 240px)`, backgroundPositionX: -scroll, borderTop: `6px solid ${C.ink}` }} />
      {shelves.map((s, i) => {
        const x = s.x - scroll;
        if (x < -400 || x > 1300) return null;
        const promoTag = i === 0 && frame >= promo;
        return (
          <div key={i} style={{ position: "absolute", left: x - 170, top: 150, width: 340, height: 610, background: C.card, border: `6px solid ${C.ink}`, borderRadius: 16, boxShadow: `10px 10px 0 ${C.ink}`, display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "20px 10px" }}>
            {[0, 1, 2].map((r) => <div key={r} style={{ display: "flex", justifyContent: "space-around", borderBottom: `6px solid ${C.ink}`, paddingBottom: 8 }}>{[0, 1, 2].map((k) => <div key={k} style={{ transform: `translateY(${Math.max(0, Math.sin(frame / 5 + r + k)) * -6}px)` }}><Prod kind={s.kind} size={80} /></div>)}</div>)}
            {promoTag && <div style={{ position: "absolute", top: -60, right: -40, transformOrigin: "50% 0", transform: `rotate(${swing(frame, [promo], 20) + 8}deg)`, ...grow(sp(promo / 30, 8), 40) }}><div style={{ background: C.emBg, border: `6px solid ${C.ink}`, borderRadius: 16, padding: "4px 24px", fontFamily: F.stamp, fontSize: 72, boxShadow: `6px 6px 0 ${C.ink}` }}>PROMO!</div></div>}
          </div>
        );
      })}
      {jumps.map((j, i) => {
        const t = interpolate(frame, [j.t, j.t + 14], [0, 1], clamp);
        if (t <= 0 || t >= 1) return null;
        return <div key={i} style={{ position: "absolute", left: interpolate(t, [0, 1], [cartX + 330, cartX + 40]), top: interpolate(t, [0, 1], [380, 620]) - Math.sin(t * Math.PI) * 260, transform: `rotate(${t * 360}deg)` }}><Prod kind={j.kind} size={110} /></div>;
      })}
      {/* cart */}
      <div style={{ position: "absolute", left: cartX - 100, top: 560, transform: `${lastLand ? squash(frame, lastLand.t + 14, 0.15) : ""} translateY(${rolling ? Math.abs(Math.sin(frame / 3)) * -6 : 0}px)`, transformOrigin: "50% 100%" }}>
        <div style={{ position: "absolute", left: 60, top: -40 - inCart * 6, display: "flex", flexWrap: "wrap", width: 220, gap: 0 }}>{jumps.slice(0, inCart).map((j, i) => <div key={i} style={{ marginTop: -30, transform: `rotate(${(i % 2 ? 12 : -10)}deg)` }}><Prod kind={j.kind} size={80} /></div>)}</div>
        <Icon name="shopping-cart" size={260} color={C.ink} stroke={2.2} />
      </div>
      <div style={{ position: "absolute", right: 30, top: 30 }}><Badge n={inCart} icon="shopping-bag" s={sp(0.2, 10)} /></div>
      {jumps.map((j, i) => <Particles key={i} at={j.t + 14} n={6} seed={`wk${i}`} x={cartX + 60} y={600} speed={10} item={() => <Spark size={26} />} />)}
    </div>
  );
};

// ── 7. Plot twist: the "TRIK" card flips over to "BUKAN CUMA TRIK".
export const Flip: React.FC<{ at: number }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const flip = interpolate(sp(at, 12), [0, 1], [0, 180]);
  const tilt = Math.sin(frame / 12) * 6;
  const face = (back: boolean): React.CSSProperties => ({ position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: 40, border: `8px solid ${C.ink}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: F.stamp, transform: back ? "rotateY(180deg)" : undefined });
  return (
    <div style={{ width: 960, height: 960, position: "relative", perspective: 1600 }}>
      <Sfx name="whoosh" at={3} volume={0.4} />
      <Sfx name="punch" at={10} volume={0.35} />
      <Sfx name="whip" at={f(at)} volume={0.55} />
      <Sfx name="boom" at={f(at) + 8} volume={0.5} />
      <div style={{ position: "absolute", left: 200, top: 120, width: 560, height: 720, transformStyle: "preserve-3d", transform: `rotateY(${flip + tilt}deg) translateY(${float(frame, 0, 12)}px)`, ...{ opacity: Math.min(1, sp(0.05, 10) * 2) } }}>
        <div style={{ ...face(false), background: C.card, boxShadow: `16px 16px 0 ${C.emBg}` }}>
          <Icon name="wand-sparkles" size={170} color={C.ink} stroke={2} />
          <div style={{ fontSize: 210, color: C.ink, lineHeight: 1, marginTop: 20 }}>TRIK</div>
        </div>
        <div style={{ ...face(true), background: C.emBg, boxShadow: `16px 16px 0 ${C.card}` }}>
          <div style={{ fontSize: 120, color: C.ink, lineHeight: 1 }}>BUKAN</div>
          <div style={{ fontSize: 120, color: C.ink, lineHeight: 1 }}>CUMA</div>
          <div style={{ fontSize: 200, color: C.em, lineHeight: 1 }}>TRIK</div>
        </div>
      </div>
      <Particles at={f(at) + 8} n={14} seed="flp" x={480} y={480} speed={16} item={() => <Spark size={36} />} />
    </div>
  );
};

// ── 8. Back of the store: a weight drops on the heavy fridge, the plug zaps, a truck backs up, cold boxes rush in.
export const Backdoor: React.FC<{ at: [number, number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const [berat, listrik, datang, cepat] = at.map(f);
  const w = sp(at[0], 9);
  const zap = frame >= listrik && Math.floor(frame / 3) % 2 === 0;
  const truck = interpolate(frame, [datang - 6, datang + 14], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const boxes = [0, 1, 2];
  return (
    <div style={{ width: 960, height: 960, position: "relative", overflow: "hidden" }}>
      <Deco seed="bdr" w={960} h={960} n={5} />
      <Sfx name="whoosh" at={berat - 8} volume={0.35} />
      <Sfx name="punch" at={berat + 6} volume={0.6} />
      <Sfx name="buzz" at={listrik} volume={0.35} />
      <Sfx name="buzz" at={listrik + 14} volume={0.25} />
      <Sfx name="slide" at={datang - 6} volume={0.45} />
      <Sfx name="alarm" at={datang + 14} volume={0.15} />
      {boxes.map((i) => <Sfx key={i} name="whoosh" at={cepat + i * 6} volume={0.3} />)}
      {boxes.map((i) => <Sfx key={`b${i}`} name="pop" at={cepat + i * 6 + 14} volume={0.4} />)}
      <Sfx name="check" at={cepat + 30} volume={0.4} />
      {/* back wall with door */}
      <div style={{ position: "absolute", left: 0, top: 120, width: 700, height: 640, background: C.card, border: `8px solid ${C.ink}`, borderRadius: "24px 0 0 24px", ...grow(sp(0, 11), 60) }}>
        <div style={{ position: "absolute", right: -8, top: 230, width: 30, height: 400, background: C.emBg, border: `6px solid ${C.ink}` }} />
      </div>
      {/* fridge */}
      <div style={{ position: "absolute", left: 80, top: 250, width: 320, height: 500, background: "#ECFCCB", border: `8px solid ${C.ink}`, borderRadius: 20, boxShadow: `10px 10px 0 ${C.ink}`, transformOrigin: "50% 100%", transform: squash(frame, berat + 6, 0.12), display: "flex", flexWrap: "wrap", alignContent: "flex-end", justifyContent: "center", gap: 8, padding: 20 }}>
        {Array.from({ length: 3 + boxes.filter((i) => frame >= cepat + i * 6 + 14).length }, (_, i) => <Prod key={i} kind="milk" size={80} />)}
        <div style={{ position: "absolute", left: 20, top: 20 }}><Icon name="thermometer-snowflake" size={80} color={C.em} stroke={2.4} /></div>
      </div>
      <div style={{ position: "absolute", left: 150, top: 100 + (1 - w) * -500 }}><Icon name="weight" size={180} color={C.ink} stroke={2.2} /></div>
      {/* plug + zap */}
      <div style={{ position: "absolute", left: 410, top: 600, ...grow(sp(at[1], 9), 30) }}>
        <Icon name="plug-zap" size={120} color={C.ink} stroke={2.2} />
        {zap && <div style={{ position: "absolute", left: 70, top: -80 }}><Icon name="zap" size={110} color={C.emBg} stroke={2.6} /></div>}
      </div>
      {/* truck outside the back door */}
      <div style={{ position: "absolute", left: interpolate(truck, [0, 1], [1100, 690]), top: 470, transform: `scaleX(-1) translateY(${Math.abs(Math.sin(frame / 3)) * (truck < 1 ? -6 : 0)}px)` }}><Icon name="truck" size={270} color={C.ink} stroke={2} /></div>
      {boxes.map((i) => {
        const t = interpolate(frame, [cepat + i * 6, cepat + i * 6 + 14], [0, 1], clamp);
        if (t <= 0 || t >= 1) return null;
        return (
          <div key={i} style={{ position: "absolute", left: interpolate(t, [0, 1], [760, 220]), top: interpolate(t, [0, 1], [560, 480]) - Math.sin(t * Math.PI) * 120, width: 110, height: 90, background: "#fff", border: `5px solid ${C.ink}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${t * 20}deg)` }}>
            <Icon name="snowflake" size={60} color={C.em} stroke={2.6} />
            {[0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", right: 110 + k * 26, top: 20 + k * 18, width: 22, height: 6, borderRadius: 3, background: C.ink, opacity: 0.6 }} />)}
          </div>
        );
      })}
      <Particles at={berat + 6} n={8} seed="bdW" x={240} y={250} speed={10} item={() => <Spark size={26} />} />
    </div>
  );
};

// ── 9. Two stickers slam in: PRAKTIS + UNTUNG.
export const Duo: React.FC<{ at: [number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const sticker = (s: number, icon: string, label: string, x: number, rot: number, land: number, hot: boolean) => (
    <div style={{ position: "absolute", left: x, top: 290 + float(frame, x, 10), width: 400, height: 400, borderRadius: "50%", background: hot ? C.emBg : C.card, border: `10px solid ${C.ink}`, boxShadow: `14px 14px 0 ${C.ink}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [2.4, 1])}) ${squash(frame, land, 0.15)}`, opacity: Math.min(1, s * 2.5) }}>
      <Icon name={icon} size={150} color={C.ink} stroke={2.2} />
      <div style={{ fontFamily: F.stamp, fontSize: 90, color: C.ink, lineHeight: 1.1 }}>{label}</div>
    </div>
  );
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="duo" w={960} h={960} />
      <Sfx name="stamp" at={f(at[0])} volume={0.6} />
      <Sfx name="stamp" at={f(at[1])} volume={0.6} />
      {[0, 4, 8, 12].map((k) => <Sfx key={k} name="coin" at={f(at[1]) + 6 + k} volume={0.3} />)}
      <Sfx name="pop" at={4} volume={0.45} />
      <div style={{ position: "absolute", left: 480 - 110, top: 40 + float(frame, 3, 10), filter: `drop-shadow(0 0 30px ${C.emBg})`, ...grow(sp(0.1, 9), 60) }}><Prod kind="milk" size={220} /></div>
      <div style={{ position: "absolute", left: 480 - 60, top: 700, transform: `translateY(${Math.sin(frame / 5) * 12}px)`, ...grow(sp(0.4, 9), 40) }}><Icon name="door-open" size={120} color={C.ink} stroke={2.2} /></div>
      {sticker(sp(at[0], 12), "wrench", "PRAKTIS", 20, -8, f(at[0]) + 6, false)}
      {sticker(sp(at[1], 12), "hand-coins", "UNTUNG", 540, 7, f(at[1]) + 6, true)}
      <div style={{ position: "absolute", left: 430, top: 400, fontFamily: F.stamp, fontSize: 150, color: C.ink, ...grow(sp(at[1] - 0.2, 8), 30) }}>+</div>
      <Particles at={f(at[0]) + 4} n={8} seed="duA" x={220} y={450} speed={12} item={() => <Spark size={30} />} />
      {frame >= f(at[1]) && Array.from({ length: 10 }, (_, i) => { const t = frame - f(at[1]) - i * 2; if (t < 0) return null; return <div key={i} style={{ position: "absolute", left: 560 + ((i * 97) % 360), top: -100 + t * t * 0.8, transform: `rotateY(${t * 25}deg)` }}><Coin size={64} /></div>; })}
    </div>
  );
};

// ── 10a. Bonus gift box pops open.
export const Gift: React.FC = () => {
  const { frame, sp } = useT();
  const lid = sp(0.5, 8);
  return (
    <div style={{ width: 960, height: 900, position: "relative" }}>
      <Sfx name="pop" at={3} volume={0.45} />
      <Sfx name="boom" at={15} volume={0.45} />
      <div style={{ position: "absolute", left: 280, top: 380, width: 400, height: 340, background: C.emBg, border: `10px solid ${C.ink}`, borderRadius: 20, boxShadow: `14px 14px 0 ${C.ink}`, ...grow(sp(0, 10), 60) }}>
        <div style={{ position: "absolute", left: 170, top: 0, bottom: 0, width: 60, background: C.red }} />
      </div>
      <div style={{ position: "absolute", left: 250, top: 300, width: 460, height: 100, background: C.emBg, border: `10px solid ${C.ink}`, borderRadius: 16, transform: `translate(${lid * 120}px, ${lid * -260}px) rotate(${lid * 35}deg)` }}>
        <div style={{ position: "absolute", left: 190, top: 0, bottom: 0, width: 60, background: C.red }} />
      </div>
      <Particles at={15} n={16} seed="gft" x={480} y={380} speed={16} up={14} item={(i) => (i % 3 ? <Spark size={36} /> : <Coin size={54} />)} />
      <div style={{ position: "absolute", left: 420, top: 180 + float(frame, 0, 8), ...grow(sp(0.7, 8), 80) }}><Icon name="sparkles" size={120} color={C.ink} stroke={2.2} /></div>
    </div>
  );
};

// ── 10b. Eye-level shelf: the eye line sweeps across, eye-level goods get a tall coin stack, the bottom shelf gets MURAH.
export const EyeLevel: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const sweep = interpolate(frame, [f(at[0]), f(at[0]) + 14], [0, 1], clamp);
  const rows: { kinds: Kind[]; y: number }[] = [{ kinds: ["box", "chips", "box"], y: 140 }, { kinds: ["bottle", "soap", "bottle"], y: 390 }, { kinds: ["chips", "box", "soap"], y: 640 }];
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Sfx name="slide" at={3} volume={0.4} />
      <Sfx name="slide" at={f(at[0])} volume={0.5} />
      <Sfx name="ring" at={f(at[0]) + 4} volume={0.4} />
      {[0, 4, 8].map((k) => <Sfx key={k} name="coin" at={f(at[1]) + k} volume={0.4} />)}
      <Sfx name="stamp" at={f(at[2])} volume={0.55} />
      <div style={{ position: "absolute", left: 170, top: 60, width: 760, height: 860, background: C.card, border: `8px solid ${C.ink}`, borderRadius: 20, boxShadow: `14px 14px 0 ${C.ink}`, ...grow(sp(0, 11), 80) }} />
      {rows.map((r, ri) => (
        <div key={ri}>
          <div style={{ position: "absolute", left: 170, top: r.y + 190, width: 760, height: 14, background: C.ink }} />
          {r.kinds.map((k, i) => {
            const eye = ri === 1;
            const s = sp(0.1 + ri * 0.12 + i * 0.05, 9);
            return (
              <div key={i} style={{ position: "absolute", left: 230 + i * 230, top: r.y + (eye ? 10 : 40), ...grow(s, 60), transform: `${grow(s, 60).transform} scale(${eye && frame >= f(at[1]) ? 1.12 + Math.sin(frame / 6 + i) * 0.03 : 1})` }}>
                <Prod kind={k} size={eye ? 180 : 150} />
              </div>
            );
          })}
        </div>
      ))}
      {/* eye + eye line */}
      <div style={{ position: "absolute", left: 10, top: 420, width: 150, height: 150, borderRadius: "50%", background: C.emBg, border: `6px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", ...grow(sp(at[0] - 0.3, 9), 30) }}><Icon name="eye" size={96} color={C.ink} stroke={2.4} /></div>
      <div style={{ position: "absolute", left: 160, top: 490, height: 10, width: sweep * 770, backgroundImage: `repeating-linear-gradient(90deg, ${C.red} 0 30px, transparent 30px 50px)` }} />
      {/* coin stacks = pricier, no numbers */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 340 + i * 230, top: 330 }}>
          {[0, 1, 2].map((c) => <div key={c} style={{ position: "absolute", top: -c * 30, ...grow(sp(at[1] + i * 0.08 + c * 0.06, 8), 40) }}><Coin size={64} /></div>)}
        </div>
      ))}
      <div style={{ position: "absolute", left: 300, top: 820 }}><div style={stamp(sp(at[2], 12), -5, 90)}>MURAH</div></div>
      <Particles at={f(at[1])} n={10} seed="eyM" x={560} y={430} speed={12} item={() => <Spark size={28} />} />
    </div>
  );
};

// ── 11. Words drop in one by one and bounce; `hi` words get the lime highlight.
export const Phrase: React.FC<{ words: { w: string; at: number; line: number; hi?: boolean }[] }> = ({ words }) => {
  const { frame, f, sp } = useT();
  const lines = [...new Set(words.map((w) => w.line))];
  return (
    <div style={{ width: 960, height: 760, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <Deco seed="phr" w={960} h={760} />
      {words.map((w, i) => <Sfx key={i} name={w.hi ? "stamp" : "punch"} at={f(w.at)} volume={w.hi ? 0.6 : 0.4} />)}
      <Sfx name="pop" at={4} volume={0.45} />
      <div style={{ transform: `rotate(${Math.sin(frame / 8) * 8}deg)`, ...grow(sp(0.1, 8), 60) }}><Icon name="quote" size={200} color={C.red} stroke={2.4} /></div>
      {lines.map((l) => (
        <div key={l} style={{ display: "flex", gap: 30 }}>
          {words.filter((w) => w.line === l).map((w, i) => {
            const s = sp(w.at, 12);
            return (
              <span key={i} style={{ display: "inline-block", fontFamily: F.stamp, fontSize: 150, lineHeight: 1, color: C.ink, background: w.hi ? C.emBg : "transparent", padding: w.hi ? "0 24px" : 0, border: w.hi ? `8px solid ${C.ink}` : "none", borderRadius: 18, boxShadow: w.hi ? `10px 10px 0 ${C.ink}` : "none", opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * -160}px) rotate(${Math.sin(frame / 9 + i) * 3}deg) ${squash(frame, f(w.at) + 8, 0.2)}` }}>{w.w}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ── 12. Checkout: the queue inches forward, the kid stares at the candy rack, candy hops into the cart.
export const Kasir: React.FC<{ at: [number, number, number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const [permen, kasir, antre, anak, bosan] = at.map(f);
  const inch = (k: number) => Math.floor(Math.max(0, frame - antre) / 20) * 14 + k;
  const grab = interpolate(frame, [bosan, bosan + 14], [0, 1], clamp);
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="ksr" w={960} h={960} />
      <Sfx name="pop" at={permen} volume={0.45} />
      {[0, 3, 6, 9].map((k) => <Sfx key={k} name="pop" at={permen + 4 + k} volume={0.25} />)}
      <Sfx name="print" at={kasir} volume={0.4} />
      <Sfx name="ding" at={kasir + 10} volume={0.35} />
      {[0, 20, 40].map((k) => <Sfx key={`q${k}`} name="slide" at={antre + k} volume={0.2} />)}
      <Sfx name="note" at={anak + 6} volume={0.4} />
      <Sfx name="whoosh" at={bosan} volume={0.35} />
      <Sfx name="coin" at={bosan + 14} volume={0.5} />
      {/* counter + register */}
      <div style={{ position: "absolute", left: 560, top: 520, width: 380, height: 260, background: C.card, border: `8px solid ${C.ink}`, borderRadius: 20, boxShadow: `12px 12px 0 ${C.ink}`, ...grow(sp(at[1], 10), 60) }}>
        <div style={{ position: "absolute", left: 120, top: -150, width: 180, height: 150, background: C.dark, border: `6px solid ${C.ink}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: C.emBg, fontFamily: F.stamp, fontSize: 60 }}>{frame >= kasir + 10 ? "Rp" : ""}</div>
      </div>
      {/* candy rack right by the counter */}
      <div style={{ position: "absolute", left: 380, top: 380 + float(frame, 2, 4), width: 170, background: C.emBg, border: `6px solid ${C.ink}`, borderRadius: 16, padding: 10, display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", boxShadow: frame >= anak ? `0 0 ${40 + Math.sin(frame / 4) * 15}px ${C.emBg}` : "none", ...grow(sp(at[0], 9), 60) }}>
        {Array.from({ length: 6 }, (_, i) => <div key={i} style={{ transform: `rotate(${Math.sin(frame / 5 + i) * 12}deg)` }}><Prod kind="candy" size={70} color={["#F472B6", "#FDE68A", "#5AA8F0"][i % 3]} /></div>)}
      </div>
      {/* queue */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 20 + i * 150 + inch(0), top: 560 + Math.abs(Math.sin(frame / 7 + i)) * -6, ...grow(sp(0.1 + i * 0.12, 10), 60) }}>
          <Icon name="user-round" size={150} color={i === 2 ? C.red : C.ink} stroke={2.2} />
        </div>
      ))}
      {/* kid + thought bubble */}
      <div style={{ position: "absolute", left: 300 + inch(0), top: 780, ...grow(sp(at[3], 9), 50) }}>
        <Icon name="baby" size={120} color={C.ink} stroke={2.4} />
        <div style={{ position: "absolute", left: 60, top: -170, width: 150, height: 130, borderRadius: "50%", background: C.card, border: `5px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", ...grow(sp(at[3] + 0.3, 8), 30) }}><Prod kind="candy" size={80} /></div>
      </div>
      {grab > 0 && grab < 1 && <div style={{ position: "absolute", left: interpolate(grab, [0, 1], [450, 330]), top: interpolate(grab, [0, 1], [420, 760]) - Math.sin(grab * Math.PI) * 120, transform: `rotate(${grab * 360}deg)` }}><Prod kind="candy" size={80} /></div>}
      <Particles at={bosan + 14} n={8} seed="ksC" x={360} y={780} speed={10} item={() => <Spark size={26} />} />
    </div>
  );
};

// ── 13. Shopping list: items get written, then all checked off with a stamp.
export const List: React.FC<{ items: string[]; at: number }> = ({ items, at }) => {
  const { frame, f, sp } = useT();
  const write = (i: number) => interpolate(frame, [8 + i * 14, 20 + i * 14], [0, 1], clamp);
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="lst" w={960} h={960} />
      <Sfx name="slide" at={3} volume={0.4} />
      {items.map((_, i) => Array.from({ length: 4 }, (_, k) => <Sfx key={`${i}${k}`} name="type" at={8 + i * 14 + k * 3} volume={0.35} />))}
      {items.map((_, i) => <Sfx key={`c${i}`} name="check" at={f(at) + i * 5} volume={0.35} />)}
      <div style={{ position: "absolute", left: 180, top: 80, width: 600, height: 780, background: "#FEFCE8", border: `8px solid ${C.ink}`, borderRadius: 16, boxShadow: `14px 14px 0 ${C.ink}`, transform: `rotate(${-3 + Math.sin(frame / 15) * 1.5}deg)`, backgroundImage: `repeating-linear-gradient(transparent 0 118px, ${C.emBg}88 118px 124px)`, backgroundPositionY: 60, ...grow(sp(0, 10), 80) }}>
        <div style={{ position: "absolute", left: 60, top: -30, display: "flex", gap: 50 }}>{[0, 1, 2, 3, 4].map((k) => <div key={k} style={{ width: 26, height: 60, borderRadius: 13, background: GREY, border: `5px solid ${C.ink}` }} />)}</div>
        {items.map((it, i) => (
          <div key={i} style={{ position: "absolute", left: 60, top: 140 + i * 160, display: "flex", alignItems: "center", gap: 30 }}>
            <div style={{ width: 80, height: 80, borderRadius: 14, border: `6px solid ${C.ink}`, background: frame >= f(at) + i * 5 ? C.emBg : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {frame >= f(at) + i * 5 && <div style={grow(sp(at + i * 0.17, 8), 0)}><Icon name="check" size={64} color={C.ink} stroke={3.5} /></div>}
            </div>
            <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 84, color: C.ink, clipPath: `inset(0 ${100 - write(i) * 100}% 0 0)` }}>{it}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 560, top: 140 + Math.min(items.length - 1, Math.floor(Math.max(0, frame - 8) / 14)) * 160 + 120, opacity: frame < 8 + items.length * 14 ? 1 : 0, transform: `rotate(${Math.sin(frame) * 10}deg)` }}><Icon name="pen-line" size={110} color={C.ink} stroke={2.4} /></div>
      <Particles at={f(at) + items.length * 5} n={10} seed="lsD" x={480} y={300} speed={12} item={() => <Spark size={28} />} />
    </div>
  );
};

// ── 15. Series card: EP 1 and EP 2 get ticked, EP 3 bounces as a question mark.
export const Series: React.FC = () => {
  const { frame, sp } = useT();
  const eps = [{ n: 1, done: true }, { n: 2, done: true }, { n: 3, done: false }];
  return (
    <div style={{ width: 960, height: 860, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
      <Deco seed="ser" w={960} h={860} />
      {eps.map((_, i) => <Sfx key={i} name={i < 2 ? "check" : "boom"} at={8 + i * 12} volume={i < 2 ? 0.4 : 0.35} />)}
      {eps.map((e, i) => {
        const s = sp(0.2 + i * 0.4, 9);
        return (
          <div key={i} style={{ width: 800, display: "flex", alignItems: "center", gap: 30, padding: "24px 36px", background: e.done ? C.card : C.emBg, border: `7px solid ${C.ink}`, borderRadius: 26, boxShadow: `10px 10px 0 ${C.ink}`, ...grow(s, 60), transform: `${grow(s, 60).transform} rotate(${e.done ? 0 : Math.sin(frame / 6) * 3}deg)` }}>
            <span style={{ fontFamily: F.stamp, fontSize: 96, color: C.ink, flex: 1 }}>EPISODE {e.n}</span>
            {e.done ? <Icon name="circle-check" size={96} color={C.red} stroke={2.6} /> : <span style={{ fontFamily: F.stamp, fontSize: 120, color: C.ink, transform: `translateY(${Math.abs(Math.sin(frame / 5)) * -14}px)` }}>?</span>}
          </div>
        );
      })}
    </div>
  );
};

