// "Kenapa Indomaret & Alfamart selalu sebelahan" visuals: rival storefronts, Hotelling beach (ice-cream carts that
// slide and steal customers), location survey, piggyback opening, buyer hopping next door, corner as destination, endless scroll.
// Timing props are seconds from the start of the visual (matched to the VO).
import { Img, interpolate, random, staticFile } from "remotion";
import { Sfx } from "./sfx";
import { C, F, clamp } from "./theme";
import { Icon } from "./Visuals";
import { Deco, Particles, Spark, float, grow, squash, stamp, swing, useT } from "./PriceUI";

const LOGO = { i: "img/minimarket/indomaret.png", a: "img/minimarket/alfamart.png" };
const BLUE = "#5AA8F0";
const ease = { ...clamp, easing: (x: number) => x * x * (3 - 2 * x) };

// Storefront: logo signboard, glass front with door, little awning stripes.
const Store: React.FC<{ logo: string; w?: number; lit?: boolean }> = ({ logo, w = 400, lit }) => (
  <div style={{ width: w, background: C.card, border: `6px solid ${C.ink}`, borderRadius: 18, boxShadow: `10px 10px 0 ${C.ink}`, overflow: "hidden" }}>
    <Img src={staticFile(logo)} style={{ display: "block", width: "100%", height: w * 0.36, objectFit: "cover", borderBottom: `6px solid ${C.ink}` }} />
    <div style={{ display: "flex", height: w * 0.08 }}>{Array.from({ length: 8 }, (_, i) => <div key={i} style={{ flex: 1, background: i % 2 ? "#fff" : C.red }} />)}</div>
    <div style={{ display: "flex", gap: w * 0.04, padding: w * 0.05, height: w * 0.5, borderTop: `5px solid ${C.ink}` }}>
      <div style={{ flex: 1, background: lit ? "#FEF9C3" : "#DBEAFE", border: `5px solid ${C.ink}`, borderRadius: 8 }} />
      <div style={{ width: w * 0.3, background: "#BFDBFE", border: `5px solid ${C.ink}`, borderRadius: 8 }} />
      <div style={{ flex: 1, background: lit ? "#FEF9C3" : "#DBEAFE", border: `5px solid ${C.ink}`, borderRadius: 8 }} />
    </div>
  </div>
);
const Person: React.FC<{ color: string; size?: number }> = ({ color, size = 60 }) => (
  <div style={{ width: size, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ width: size * 0.55, height: size * 0.55, borderRadius: "50%", background: C.skin, border: `4px solid ${C.ink}` }} />
    <div style={{ width: size, height: size * 0.7, marginTop: -4, borderRadius: `${size / 2}px ${size / 2}px 10px 10px`, background: color, border: `4px solid ${C.ink}` }} />
  </div>
);

// ── 1. Hook: Indomaret drops, Alfamart drops, they slam side by side, "VS" sparks between them.
export const Rivals: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const [a1, a2, a3] = at.map(f);
  const gap = interpolate(sp(at[1], 11), [0, 1], [140, 0]);
  const dropI = sp(0.15, 10), dropA = sp(at[0], 10);
  const shake = frame >= a2 && frame < a2 + 10 ? Math.sin(frame * 3) * 8 : 0;
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="riv" w={960} h={960} />
      <Sfx name="whoosh" at={3} volume={0.4} />
      <Sfx name="punch" at={10} volume={0.45} />
      <Sfx name="whoosh" at={a1 - 6} volume={0.4} />
      <Sfx name="punch" at={a1 + 6} volume={0.5} />
      <Sfx name="whip" at={a2 - 3} volume={0.5} />
      <Sfx name="boom" at={a2 + 4} volume={0.35} />
      <Sfx name="stamp" at={a3} volume={0.7} />
      <Sfx name="buzz" at={a3 + 4} volume={0.25} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, height: 10, background: C.ink, borderRadius: 5 }} />
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", justifyContent: "center", gap, transform: `translateX(${shake}px)` }}>
        <div style={{ transform: `translateY(${(1 - dropI) * -900}px) ${squash(frame, 12)} rotate(${swing(frame, [12, a2 + 4], 3)}deg)`, transformOrigin: "50% 100%" }}><Store logo={LOGO.i} w={420} /></div>
        <div style={{ opacity: frame >= a1 - 8 ? 1 : 0, transform: `translateY(${(1 - dropA) * -900}px) ${squash(frame, a1 + 7)} rotate(${-swing(frame, [a1 + 7, a2 + 4], 3)}deg)`, transformOrigin: "50% 100%" }}><Store logo={LOGO.a} w={420} /></div>
      </div>
      <Particles at={a2 + 4} n={14} seed="rivS" x={480} y={420} speed={14} item={() => <Spark size={34} />} />
      <div style={{ position: "absolute", top: 90, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ ...stamp(sp(at[2], 10), -6, 120), transform: `${stamp(sp(at[2], 10), -6, 120).transform} translateY(${float(frame, 0, 6)}px)` }}>VS</div>
      </div>
    </div>
  );
};

// ── 2-4. Hotelling beach: two carts, customers coloured by the nearer cart, counters update, carts can turn into stores.
type Move = { who: "l" | "r"; to: number; at: [number, number] };
const N = 16;
const custX = Array.from({ length: N }, (_, i) => 0.04 + (i / (N - 1)) * 0.92);
export const Beach: React.FC<{ l: number; r: number; moves?: Move[]; show?: [number, number]; reveal?: number; you?: boolean; dur: number }> = ({ l, r, moves = [], show, reveal, you, dur }) => {
  const { frame, f, sp } = useT();
  const posAt = (fr: number) => {
    let pl = l, pr = r;
    for (const m of moves) {
      const k = interpolate(fr, [f(m.at[0]), f(m.at[1])], [0, 1], ease);
      if (m.who === "l") pl += (m.to - pl) * k; else pr += (m.to - pr) * k;
    }
    return [pl, pr];
  };
  const share = (fr: number) => { const [pl, pr] = posAt(fr); return custX.filter((x) => Math.abs(x - pl) <= Math.abs(x - pr)).length; };
  const [pl, pr] = posAt(frame);
  const nl = share(frame);
  const revK = reveal === undefined ? 0 : interpolate(frame, [f(reveal) - 4, f(reveal) + 10], [0, 1], ease);
  const W = 900, X0 = 30, SAND = 600;
  // a coin blip whenever a customer switches side
  const flips: number[] = [];
  for (let fr = 1; fr < dur; fr++) if (share(fr) !== share(fr - 1)) flips.push(fr);
  const rev = reveal === undefined ? 0 : sp(reveal, 11);
  const appear = (k: 0 | 1) => (show ? sp(show[k], 9) : 1);
  const cart = (x: number, color: string, k: 0 | 1, logo: string, count: number, moving: boolean) => (
    <div style={{ position: "absolute", left: X0 + x * W, top: SAND - 20, transform: `translate(-50%,-100%) scale(${appear(k)})`, transformOrigin: "50% 100%" }}>
      <div style={{ position: "absolute", left: "50%", bottom: "100%", marginBottom: 14, transform: `translateX(-50%) scale(${1 + (flips.some((t) => frame >= t && frame < t + 8) ? 0.12 : 0)})`, background: color, border: `5px solid ${C.ink}`, borderRadius: 40, padding: "2px 26px", fontFamily: F.stamp, fontSize: 64, color: C.ink, boxShadow: `5px 5px 0 ${C.ink}`, whiteSpace: "nowrap" }}>
        {you && k === 0 ? `KAMU ${count}` : count}
      </div>
      <div style={{ opacity: 1 - rev, transform: `translateY(${moving ? Math.abs(Math.sin(frame / 3)) * -8 : 0}px) rotate(${moving ? Math.sin(frame / 2) * 4 : 0}deg)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 230, height: 115, borderRadius: "115px 115px 0 0", background: `repeating-linear-gradient(90deg, ${color} 0 38px, #fff 38px 76px)`, border: `6px solid ${C.ink}` }} />
        <div style={{ width: 8, height: 40, background: C.ink }} />
        <div style={{ width: 190, height: 120, background: C.card, border: `6px solid ${C.ink}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `6px 6px 0 ${C.ink}` }}><Icon name="ice-cream-cone" size={80} color={C.ink} stroke={2.2} /></div>
        <div style={{ display: "flex", gap: 90, marginTop: -14 }}>{[0, 1].map((w) => <div key={w} style={{ width: 44, height: 44, borderRadius: "50%", background: C.ink, border: `6px solid ${C.card}` }} />)}</div>
      </div>
      {rev > 0 && <div style={{ position: "absolute", left: "50%", bottom: 0, transform: `translateX(-50%) scale(${rev})`, transformOrigin: "50% 100%" }}><Store logo={logo} w={280} /></div>}
    </div>
  );
  const moving = (who: "l" | "r") => moves.some((m) => m.who === who && frame > f(m.at[0]) && frame < f(m.at[1]));
  return (
    <div style={{ width: 960, height: 960, position: "relative", overflow: "hidden", borderRadius: 30, border: `6px solid ${C.ink}`, background: "#E0F2FE" }}>
      {show && <><Sfx name="pop" at={f(show[0])} volume={0.5} /><Sfx name="pop" at={f(show[1])} volume={0.5} /></>}
      {!show && <Sfx name="slide" at={3} volume={0.35} />}
      {moves.map((m, i) => <Sfx key={i} name="whoosh" at={f(m.at[0])} volume={0.35} />)}
      {moves.flatMap((m, i) => Array.from({ length: Math.floor((f(m.at[1]) - f(m.at[0])) / 5) }, (_, k) => <Sfx key={`${i}t${k}`} name="tick" at={f(m.at[0]) + k * 5} volume={0.2} />))}
      {flips.slice(0, 10).map((t) => <Sfx key={`c${t}`} name="coin" at={t} volume={0.35} />)}
      {reveal !== undefined && <><Sfx name="whip" at={f(reveal) - 3} volume={0.5} /><Sfx name="punch" at={f(reveal) + 6} volume={0.5} /></>}
      {/* sun + sea + sand */}
      <div style={{ position: "absolute", right: 70, top: 50, transform: `rotate(${frame * 1.5}deg)` }}><Icon name="sun" size={140} color="#F59E0B" stroke={2.5} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, height: 120, background: `repeating-linear-gradient(90deg, #7DD3FC 0 60px, #93C5FD 60px 120px)`, backgroundPositionX: frame * 2, borderTop: `6px solid ${C.ink}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, bottom: 0, background: "#FDE68A", borderTop: `6px solid ${C.ink}` }} />
      {/* customers on the sand, a thin line to the cart they'd walk to */}
      <svg width={960} height={960} style={{ position: "absolute", left: 0, top: 0 }}>
        {custX.map((x, i) => {
          const left = Math.abs(x - pl) <= Math.abs(x - pr);
          const cy = 780 + (i % 2) * 90;
          return <line key={i} x1={X0 + x * W} y1={cy - 40} x2={X0 + (left ? pl : pr) * W} y2={SAND - 10} stroke={C.ink} strokeOpacity={0.18} strokeWidth={4} strokeDasharray="10 10" />;
        })}
      </svg>
      {custX.map((x, i) => {
        const left = Math.abs(x - pl) <= Math.abs(x - pr);
        return (
          <div key={i} style={{ position: "absolute", left: X0 + x * W, top: 700 + (i % 2) * 90, transform: `translateX(-50%) translateY(${float(frame, i, 5)}px)` }}>
            <Person color={left ? C.emBg : BLUE} size={52} />
          </div>
        );
      })}
      {/* stores need more room than carts: spread them apart as they appear */}
      {cart(pl + (0.32 - pl) * revK, C.emBg, 0, LOGO.i, nl, moving("l"))}
      {cart(pr + (0.68 - pr) * revK, BLUE, 1, LOGO.a, N - nl, moving("r"))}
      {reveal !== undefined && <Particles at={f(reveal) + 6} n={14} seed="bchR" x={X0 + ((pl + pr) / 2) * W} y={380} speed={13} item={() => <Spark size={32} />} />}
    </div>
  );
};

// ── 5. Location survey: houses pop up, people walk the road, a clock spins; the clipboard ticks each check.
export const Survey: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const [crowd, houses, clock] = at.map(f);
  const rows = [{ icon: "users", t: crowd }, { icon: "house", t: houses }, { icon: "clock", t: clock }];
  const hs = [[90, 90], [250, 60], [410, 100], [90, 470], [260, 500], [430, 460]];
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Sfx name="slide" at={3} volume={0.35} />
      {hs.map((_, i) => <Sfx key={i} name="pop" at={houses - 8 + i * 3} volume={0.3} />)}
      {[0, 6, 12, 18].map((k) => <Sfx key={k} name="tap" at={crowd + k} volume={0.25} />)}
      {[0, 4, 8, 12, 16].map((k) => <Sfx key={`k${k}`} name="tick" at={clock + k} volume={0.3} />)}
      {rows.map((r, i) => <Sfx key={`c${i}`} name="check" at={r.t + 6} volume={0.45} />)}
      {/* neighbourhood map */}
      <div style={{ position: "absolute", left: 20, top: 40, width: 600, height: 640, background: "#ECFCCB", border: `6px solid ${C.ink}`, borderRadius: 26, overflow: "hidden", boxShadow: `12px 12px 0 ${C.ink}`, ...grow(sp(0.05, 11), 60) }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 280, height: 110, background: "#D1D5DB", borderTop: `6px solid ${C.ink}`, borderBottom: `6px solid ${C.ink}` }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 46, height: 8, background: `repeating-linear-gradient(90deg, #fff 0 40px, transparent 40px 80px)`, backgroundPositionX: -frame * 3 }} />
        </div>
        {hs.map(([x, y], i) => {
          const s = sp(at[1] - 0.27 + i * 0.1, 9);
          return <div key={i} style={{ position: "absolute", left: x, top: y, transform: `scale(${s}) rotate(${swing(frame, [houses - 8 + i * 3 + 8], 6)}deg)` }}><div style={{ background: C.card, border: `5px solid ${C.ink}`, borderRadius: 14, padding: 10 }}><Icon name="house" size={70} color={C.ink} stroke={2.2} /></div></div>;
        })}
        {frame >= crowd - 4 && Array.from({ length: 6 }, (_, i) => {
          const x = ((frame - crowd) * (3 + (i % 3)) + random(`sv${i}`) * 600) % 700 - 60;
          return <div key={i} style={{ position: "absolute", left: i % 2 ? 600 - x : x, top: 285 + (i % 2) * 40, transform: `translateY(${Math.abs(Math.sin(frame / 3 + i)) * -6}px) scale(${sp(at[0] + i * 0.05, 10)})` }}><Person color={[C.emBg, BLUE, "#F472B6"][i % 3]} size={38} /></div>;
        })}
        {frame >= clock - 4 && <div style={{ position: "absolute", right: 24, bottom: 24, transform: `scale(${sp(at[2], 9)}) rotate(${(frame - clock) * 12}deg)` }}><div style={{ background: C.emBg, borderRadius: "50%", border: `5px solid ${C.ink}`, padding: 10 }}><Icon name="clock" size={80} color={C.ink} stroke={2.4} /></div></div>}
      </div>
      {/* clipboard */}
      <div style={{ position: "absolute", left: 560, top: 300, width: 380, background: C.card, border: `6px solid ${C.ink}`, borderRadius: 24, boxShadow: `12px 12px 0 ${C.ink}`, padding: "60px 30px 30px", transform: `rotate(${4 + swing(frame, rows.map((r) => r.t + 6), 3)}deg)`, ...grow(sp(0.3, 10), 80) }}>
        <div style={{ position: "absolute", top: -26, left: 120, width: 140, height: 50, background: C.ink, borderRadius: 14 }} />
        {rows.map((r, i) => {
          const done = sp(r.t / 30 + 0.2, 9);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, padding: "16px 0", borderBottom: i < 2 ? `4px dashed ${C.ghost}` : "none" }}>
              <div style={{ width: 80, height: 80, border: `6px solid ${C.ink}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: frame >= r.t + 6 ? C.emBg : C.card }}>
                <div style={{ transform: `scale(${done})` }}><Icon name="check" size={60} color={C.ink} stroke={4} /></div>
              </div>
              <Icon name={r.icon} size={90} color={frame >= r.t ? C.ink : C.ghost} stroke={2.2} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── 6. Piggyback: Indomaret stands with a finished survey; Alfamart drops into the lot next door, "RISET GRATIS".
export const Piggy: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const [done, drop, free] = at.map(f);
  const d = sp(at[1], 10);
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="pig" w={960} h={960} />
      <Sfx name="slide" at={3} volume={0.35} />
      <Sfx name="ding" at={done} volume={0.5} />
      <Sfx name="check" at={done + 3} volume={0.4} />
      <Sfx name="whoosh" at={drop - 8} volume={0.45} />
      <Sfx name="punch" at={drop + 6} volume={0.6} />
      <Sfx name="stamp" at={free} volume={0.7} />
      <Sfx name="coin" at={free + 4} volume={0.5} />
      <Sfx name="cash" at={free + 8} volume={0.35} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, height: 10, background: C.ink, borderRadius: 5 }} />
      <div style={{ position: "absolute", left: 40, top: 300, ...grow(sp(0.05, 11), 60) }}><Store logo={LOGO.i} w={420} lit /></div>
      {/* finished survey floating over the first store */}
      <div style={{ position: "absolute", left: 300, top: 120, transform: `scale(${sp(at[0], 9)}) rotate(${-8 + float(frame, 1, 4)}deg)` }}>
        <div style={{ background: C.card, border: `6px solid ${C.ink}`, borderRadius: 20, padding: 20, boxShadow: `8px 8px 0 ${C.ink}`, display: "flex", gap: 10 }}>
          <Icon name="clipboard-check" size={100} color={C.ink} stroke={2.2} />
        </div>
      </div>
      {/* empty lot, then the rival drops in */}
      <div style={{ position: "absolute", left: 500, top: 330, width: 420, height: 370, border: `6px dashed ${C.ghost}`, borderRadius: 18, opacity: 1 - d }} />
      {frame >= drop - 10 && <div style={{ position: "absolute", left: 500, top: 300, transform: `translateY(${(1 - d) * -900}px) ${squash(frame, drop + 7)}`, transformOrigin: "50% 100%" }}><Store logo={LOGO.a} w={420} lit /></div>}
      <Particles at={drop + 6} n={10} seed="pigD" x={710} y={690} speed={10} up={14} item={() => <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.ghost }} />} />
      <Particles at={free + 4} n={12} seed="pigC" x={480} y={820} speed={13} item={(i) => (i % 2 ? <Spark size={34} /> : <div style={{ width: 50, height: 50, borderRadius: "50%", background: C.emBg, border: `5px solid ${C.ink}` }} />)} />
      <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", justifyContent: "center" }}><div style={stamp(sp(at[2], 11), -5, 96)}>RISET GRATIS</div></div>
    </div>
  );
};

// ── 7. Buyer's side: a queue grows at one store, the last person hops next door, price tags drop, a magnifier compares.
export const Hop: React.FC<{ at: [number, number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const [queue, hop, tags, comp] = at.map(f);
  const qn = 5;
  const hk = interpolate(frame, [hop, hop + 16], [0, 1], clamp);
  const mx = frame < comp ? 250 : interpolate(frame, [comp, comp + 12, comp + 24], [250, 710, 710], ease);
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Sfx name="slide" at={3} volume={0.35} />
      {Array.from({ length: qn }, (_, i) => <Sfx key={i} name="pop" at={queue + i * 4} volume={0.35} />)}
      <Sfx name="whoosh" at={hop} volume={0.45} />
      <Sfx name="pop" at={hop + 16} volume={0.55} />
      <Sfx name="ding" at={tags} volume={0.45} />
      <Sfx name="ding" at={tags + 5} volume={0.45} />
      <Sfx name="slide" at={comp} volume={0.4} />
      <Sfx name="check" at={comp + 14} volume={0.5} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, height: 10, background: C.ink, borderRadius: 5 }} />
      <div style={{ position: "absolute", left: 40, top: 190, ...grow(sp(0.05, 11), 60) }}><Store logo={LOGO.i} w={400} /></div>
      <div style={{ position: "absolute", left: 520, top: 190, ...grow(sp(0.15, 11), 60) }}><Store logo={LOGO.a} w={400} /></div>
      {/* queue in front of the first store, snaking down */}
      {Array.from({ length: qn }, (_, i) => {
        const last = i === qn - 1;
        const s = sp(at[0] + i * 0.13, 9);
        const bx = 120 + (i % 3) * 110, by = 590 + Math.floor(i / 3) * 140;
        const x = last ? interpolate(hk, [0, 1], [bx, 680]) : bx;
        const y = last ? interpolate(hk, [0, 1], [by, 590]) - Math.sin(hk * Math.PI) * 220 : by;
        return <div key={i} style={{ position: "absolute", left: x, top: y, transform: `scale(${s}) translateY(${float(frame, i, 4)}px) ${last && frame >= hop + 16 ? squash(frame, hop + 16) : ""}` }}><Person color={last ? C.emBg : [BLUE, "#F472B6", "#FDE047"][i % 3]} size={80} /></div>;
      })}
      {/* price tags */}
      {[{ x: 120, p: "12rb" }, { x: 600, p: "10rb" }].map((t, i) => (
        <div key={i} style={{ position: "absolute", left: t.x, top: 40, transformOrigin: "50% 0", transform: `rotate(${swing(frame, [tags + i * 5], 14)}deg) translateY(${(1 - sp(at[2] + i * 0.17, 9)) * -300}px)` }}>
          <div style={{ background: i ? C.emBg : C.card, border: `6px solid ${C.ink}`, borderRadius: 18, padding: "4px 30px", fontFamily: F.stamp, fontSize: 80, color: C.ink, boxShadow: `8px 8px 0 ${C.ink}` }}>{t.p}</div>
        </div>
      ))}
      {frame >= comp - 4 && <div style={{ position: "absolute", left: mx, top: 650, transform: `scale(${sp(at[3], 10)}) rotate(${Math.sin(frame / 6) * 8}deg)` }}><Icon name="search" size={170} color={C.ink} stroke={2.6} /></div>}
    </div>
  );
};

// ── 8. Destination: top-down map, people keep streaming to the corner with both stores, a map pin drops on it.
export const Destination: React.FC<{ at: number; dur: number }> = ({ at, dur }) => {
  const { frame, f, sp } = useT();
  const pin = f(at);
  const CX = 640, CY = 420;
  const starts = [[-40, 520], [1000, 560], [200, 1000], [520, 1000], [-40, 200], [1000, 160], [820, 1000], [-40, 860]];
  return (
    <div style={{ width: 960, height: 960, position: "relative", overflow: "hidden", borderRadius: 30, border: `6px solid ${C.ink}`, background: "#ECFCCB" }}>
      <Sfx name="slide" at={3} volume={0.35} />
      {Array.from({ length: Math.floor(dur / 10) }, (_, i) => <Sfx key={i} name="tap" at={6 + i * 10} volume={0.18} />)}
      <Sfx name="whoosh" at={pin - 8} volume={0.4} />
      <Sfx name="stamp" at={pin + 4} volume={0.6} />
      <Sfx name="ring" at={pin + 8} volume={0.4} />
      {/* roads */}
      <div style={{ position: "absolute", left: 0, right: 0, top: CY + 120, height: 110, background: "#D1D5DB", borderTop: `6px solid ${C.ink}`, borderBottom: `6px solid ${C.ink}` }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: CX - 230, width: 110, background: "#D1D5DB", borderLeft: `6px solid ${C.ink}`, borderRight: `6px solid ${C.ink}` }} />
      {/* the corner */}
      <div style={{ position: "absolute", left: CX - 100, top: CY - 210, display: "flex", gap: 14, transform: `scale(${sp(0.05, 11)})` }}>
        <Store logo={LOGO.i} w={190} />
        <Store logo={LOGO.a} w={190} />
      </div>
      {/* people streaming in, looping */}
      {starts.map(([sx, sy], i) => {
        const period = 70 + (i % 3) * 15;
        const k = ((frame + i * 23) % period) / period;
        const x = interpolate(k, [0, 1], [sx, CX]), y = interpolate(k, [0, 1], [sy, CY + 120]);
        return <div key={i} style={{ position: "absolute", left: x, top: y, opacity: interpolate(k, [0, 0.1, 0.85, 1], [0, 1, 1, 0]), transform: `translate(-50%,-50%) translateY(${Math.abs(Math.sin(frame / 3 + i)) * -6}px)` }}><Person color={[C.emBg, BLUE, "#F472B6", "#FDE047"][i % 4]} size={46} /></div>;
      })}
      {frame >= pin - 8 && (
        <div style={{ position: "absolute", left: CX - 10, top: CY - 400, transform: `translate(-50%,0) translateY(${(1 - sp(at, 9)) * -500}px) ${squash(frame, pin + 4)}`, transformOrigin: "50% 100%" }}>
          <Icon name="map-pin" size={200} color={C.ink} stroke={2.4} />
        </div>
      )}
      {frame >= pin + 4 && [0, 1, 2].map((r) => {
        const t = ((frame - pin - 4 + r * 14) % 42) / 42;
        return <div key={r} style={{ position: "absolute", left: CX - 10 - 180, top: CY - 180 + 60, width: 360, height: 360, borderRadius: "50%", border: `8px solid ${C.emBg}`, transform: `scale(${0.3 + t})`, opacity: 1 - t }} />;
      })}
    </div>
  );
};

// ── 9. Teaser: a phone feed that never ends, the thumb keeps flicking, a "?" bounces.
export const Thumb: React.FC<{ at: number }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const q = f(at);
  const flick = 14;
  const n = Math.floor(frame / flick);
  const k = interpolate(frame % flick, [0, 8], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const off = (n + k) * 300;
  const cols = [C.emBg, BLUE, "#F472B6", "#FDE047", "#A78BFA"];
  const icons = ["play", "heart", "shopping-bag", "image", "sun"];
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="thb" w={960} h={960} />
      {Array.from({ length: Math.floor(120 / flick) }, (_, i) => <Sfx key={i} name="whoosh" at={2 + i * flick} volume={0.18} />)}
      <Sfx name="beat" at={q} volume={0.5} />
      <Sfx name="pop" at={q + 4} volume={0.5} />
      <div style={{ position: "absolute", left: 260, top: 20, width: 440, height: 900, background: C.ink, borderRadius: 60, padding: 20, ...grow(sp(0.05, 11), 80) }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 44, overflow: "hidden", background: C.card, position: "relative" }}>
          {Array.from({ length: 5 }, (_, j) => {
            const i = n + j - 1;
            const y = i * 300 - off + 20;
            return <div key={i} style={{ position: "absolute", left: 20, right: 20, top: y, height: 280, borderRadius: 26, background: cols[((i % 5) + 5) % 5], border: `5px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={icons[((i % 5) + 5) % 5]} size={110} color={C.ink} stroke={2.2} /></div>;
          })}
        </div>
      </div>
      {/* thumb flicking up */}
      <div style={{ position: "absolute", left: 560, top: interpolate(frame % flick, [0, 8, flick], [720, 480, 720], clamp), transform: "rotate(-15deg)" }}><Icon name="pointer" size={170} color={C.ink} stroke={2.2} /></div>
      {frame >= q - 3 && <div style={{ position: "absolute", left: 90, top: 260, fontFamily: F.stamp, fontSize: 260, color: C.ink, WebkitTextStroke: `6px ${C.ink}`, textShadow: `10px 10px 0 ${C.emBg}`, transform: `scale(${sp(at, 8)}) rotate(${swing(frame, [q + 4], 16)}deg) translateY(${float(frame, 2, 10)}px)` }}>?</div>}
    </div>
  );
};
