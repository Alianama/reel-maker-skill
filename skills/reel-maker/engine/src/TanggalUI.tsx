// "Kenapa tanggal kembar bikin kalap" visuals. Timing props are seconds from the start of the visual (matched to the VO).
import { interpolate } from "remotion";
import { Store } from "./MarketUI";
import { Coin, Deco, Particles, Spark, float, grow, squash, stamp, swing, useT } from "./PriceUI";
import { Prod } from "./ShopUI";
import { Sfx } from "./sfx";
import { C, F, clamp } from "./theme";
import { Icon } from "./Visuals";

const ease = { ...clamp, easing: (x: number) => 1 - (1 - x) ** 3 };
const HOT = "#EF4444";
const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({ background: C.card, border: `7px solid ${C.ink}`, borderRadius: 30, boxShadow: `12px 12px 0 ${C.ink}`, ...extra });
const rp = (n: number) => `Rp${Math.round(n).toLocaleString("id-ID")}`;
export const TRICKS = [["timer", "#FDE047"], ["package", "#F472B6"], ["tag", "#5AA8F0"], ["truck", "#A3E635"]] as const;

// ── Hook: tear-off calendar flips 9.9 → 10.10 → 11.11, then shopping bags explode out.
export const Calendar: React.FC<{ flip: number[]; boom: number }> = ({ flip, boom }) => {
  const { frame, f, sp } = useT();
  const dates = ["9.9", "10.10", "11.11"];
  const shown = flip.filter((t) => frame >= f(t)).length;
  const bm = f(boom);
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="cal" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      <Sfx name="pop" at={6} volume={0.35} />
      {flip.map((t, i) => <Sfx key={i} name="slide" at={f(t)} volume={0.5} />)}
      {flip.map((t, i) => <Sfx key={`s${i}`} name="stamp" at={f(t) + 6} volume={0.3} />)}
      <Sfx name="boom" at={bm} volume={0.5} />
      <Sfx name="cash" at={bm + 2} volume={0.4} />
      <div style={{ position: "absolute", left: 200, top: 180, width: 560, transformOrigin: "50% 100%", transform: `${squash(frame, bm, 0.15)} rotate(${float(frame, 0, 2)}deg)`, ...grow(sp(0.05, 10), 100) }}>
        <div style={{ height: 120, background: HOT, border: `7px solid ${C.ink}`, borderRadius: "30px 30px 0 0", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          {[0, 1, 2].map((k) => <div key={k} style={{ width: 30, height: 70, background: C.card, border: `6px solid ${C.ink}`, borderRadius: 15, marginTop: -90 }} />)}
        </div>
        <div style={{ ...card({ borderRadius: "0 0 30px 30px", borderTop: "none" }), height: 440, position: "relative", overflow: "hidden" }}>
          {dates.map((d, i) => {
            if (i < shown - 1 || i > shown) return null;
            const flipT = i < shown ? interpolate(frame, [f(flip[i]), f(flip[i]) + 8], [0, 1], ease) : 0;
            return (
              <div key={i} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.stamp, fontSize: d.length > 4 ? 190 : 230, color: i === 2 ? HOT : C.ink, background: C.card, zIndex: 3 - i, transformOrigin: "50% 0", transform: `perspective(900px) rotateX(${flipT * 100}deg)`, opacity: 1 - flipT }}>{d}</div>
            );
          })}
        </div>
      </div>
      <Particles at={bm} n={16} seed="calB" x={480} y={420} speed={18} up={12} life={50} item={(i) => (i % 3 === 0 ? <Coin size={60} /> : <div style={{ transform: `rotate(${i * 25}deg)` }}><Icon name={i % 2 ? "shopping-bag" : "shopping-cart"} size={84} color={C.ink} stroke={2.4} /></div>)} />
    </div>
  );
};

// ── "Just browsing" → cart fills: eyes drift over, then items slide into the cart list and the badge counts up.
export const CartFill: React.FC<{ adds: number[]; full: number }> = ({ adds, full }) => {
  const { frame, f, sp } = useT();
  const kinds = ["chips", "soap", "candy", "box", "bottle"] as const;
  const prices = [25000, 48000, 15000, 89000, 32000];
  const n = adds.filter((t) => frame >= f(t)).length;
  const total = adds.reduce((a, t, i) => a + prices[i] * interpolate(frame, [f(t), f(t) + 8], [0, 1], clamp), 0);
  const fl = f(full);
  const browse = interpolate(frame, [f(adds[0]) - 6, f(adds[0])], [1, 0], clamp);
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="crt" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      <Sfx name="slide" at={10} volume={0.3} />
      <Sfx name="slide" at={24} volume={0.3} />
      {adds.map((t, i) => <Sfx key={i} name="pop" at={f(t)} volume={0.45} />)}
      {adds.map((t, i) => <Sfx key={`c${i}`} name="coin" at={f(t) + 4} volume={0.25} />)}
      <Sfx name="alarm" at={fl} volume={0.3} />
      <Sfx name="stamp" at={fl + 2} volume={0.45} />
      <div style={{ position: "absolute", left: 90, top: 30, width: 780, ...card({ padding: 30 }), ...grow(sp(0.03, 10), 80) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
          <div style={{ position: "relative", transform: `rotate(${swing(frame, adds.map(f), 12)}deg)` }}>
            <Icon name="shopping-cart" size={80} color={C.ink} stroke={2.4} />
            {n > 0 && <div style={{ position: "absolute", right: -22, top: -18, minWidth: 54, height: 54, borderRadius: 27, background: HOT, color: "#fff", border: `4px solid ${C.ink}`, fontFamily: F.stamp, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px", transform: `scale(${1 + Math.max(0, 1 - (frame - f(adds[n - 1])) / 8) * 0.4})` }}>{frame >= fl ? "99+" : n}</div>}
          </div>
          <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 56, color: C.ink }}>Keranjang</div>
        </div>
        <div style={{ height: 600, position: "relative" }}>
          {adds.map((t, i) => frame >= f(t) && (
            <div key={i} style={{ height: 110, marginBottom: 10, display: "flex", alignItems: "center", gap: 22, borderBottom: `4px dashed ${C.ghost}`, transform: `translateX(${(1 - sp(t, 11)) * 800}px)` }}>
              <Prod kind={kinds[i]} size={90} />
              <div style={{ flex: 1, height: 26, background: "#E5E7EB", borderRadius: 13 }} />
              <div style={{ fontFamily: F.stamp, fontSize: 44, color: C.ink }}>{rp(prices[i])}</div>
            </div>
          ))}
          {browse > 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 30, opacity: browse }}>
              {[0, 1].map((k) => <div key={k} style={{ transform: `translate(${Math.sin(frame / 8) * 60}px, ${float(frame, k, 8)}px)` }}><Icon name="eye" size={150} color={C.ink} stroke={2} /></div>)}
            </div>
          )}
        </div>
        <div style={{ borderTop: `6px solid ${C.ink}`, paddingTop: 20, display: "flex", justifyContent: "space-between", fontFamily: F.stamp, fontSize: 56, color: C.ink }}>
          <span>Total</span><span style={{ color: frame >= fl ? HOT : C.ink }}>{rp(total)}</span>
        </div>
      </div>
      {frame >= fl && <div style={{ position: "absolute", left: 0, right: 0, top: 400, display: "flex", justifyContent: "center" }}><div style={stamp(sp(full, 8), -9, 130)}>PENUH!</div></div>}
    </div>
  );
};

// ── "There's a trick": a magician hat bounces and four trick cards pop out and fan.
export const Hat: React.FC<{ pop: number }> = ({ pop }) => {
  const { frame, f, sp } = useT();
  const p = f(pop);
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="hat" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      <Sfx name="beat" at={8} volume={0.35} />
      {TRICKS.map((_, i) => <Sfx key={i} name="pop" at={p + i * 4} volume={0.45} />)}
      <Sfx name="ring" at={p + 16} volume={0.35} />
      {TRICKS.map(([icon, bg], i) => {
        const s = sp(pop + i * 0.13, 9);
        const a = (i - 1.5) * 26;
        return (
          <div key={i} style={{ position: "absolute", left: 480 - 95, top: 560 - 150, width: 190, height: 250, ...card({ borderRadius: 26, background: bg }), display: "flex", alignItems: "center", justifyContent: "center", transformOrigin: "50% 160%", transform: `translateY(${(1 - s) * 200 - s * 120}px) rotate(${a * s + float(frame, i, 2)}deg) scale(${0.3 + s * 0.7})`, opacity: frame >= p + i * 4 ? 1 : 0 }}>
            <Icon name={icon} size={110} color={C.ink} stroke={2.2} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 480 - 220, top: 560, width: 440, transformOrigin: "50% 100%", transform: `${squash(frame, p, 0.2)} rotate(${swing(frame, [8, p], 6)}deg)`, ...grow(sp(0.05, 9), 120) }}>
        <svg width={440} height={330} viewBox="0 0 440 330" style={{ overflow: "visible" }}>
          <ellipse cx={220} cy={70} rx={210} ry={50} fill={C.ink} />
          <path d="M70 70 L90 300 Q220 340 350 300 L370 70 Z" fill={C.ink} />
          <path d="M84 230 Q220 262 356 230 L352 270 Q220 300 88 270 Z" fill={HOT} />
          <ellipse cx={220} cy={70} rx={150} ry={30} fill="#374151" />
        </svg>
      </div>
      <Particles at={p} n={12} seed="hatS" x={480} y={600} speed={12} up={14} item={() => <Spark size={40} />} />
    </div>
  );
};

const Digit: React.FC<{ v: string; hot: boolean }> = ({ v, hot }) => (
  <div style={{ width: 150, height: 170, background: hot ? HOT : C.ink, color: "#fff", borderRadius: 22, border: `6px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.stamp, fontSize: 120 }}>{v}</div>
);

// ── 1. Ticking clock: a clock spins, turns into a FLASH SALE countdown; the brain starts panicking.
export const Flash: React.FC<{ sale: number; panic: number }> = ({ sale, panic }) => {
  const { frame, f, sp } = useT();
  const sl = f(sale), pn = f(panic);
  const left = Math.max(0, 300 - Math.max(0, frame - sl) * 2);
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  const hot = frame % 16 < 8;
  const clockOut = interpolate(frame, [sl - 4, sl + 4], [1, 0], clamp);
  const shake = frame >= pn ? Math.sin(frame * 2.2) * 10 : 0;
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="fls" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      {Array.from({ length: Math.ceil(sl / 8) }, (_, k) => <Sfx key={k} name="tick" at={4 + k * 8} volume={0.3} />)}
      <Sfx name="whoosh" at={sl - 4} volume={0.4} />
      <Sfx name="punch" at={sl} volume={0.45} />
      {Array.from({ length: 12 }, (_, k) => <Sfx key={`b${k}`} name="beat" at={sl + 6 + k * 10} volume={0.18} />)}
      <Sfx name="alarm" at={pn} volume={0.4} />
      {clockOut > 0 && (
        <div style={{ position: "absolute", left: 230, top: 160, width: 500, height: 500, borderRadius: "50%", ...card({ borderRadius: "50%" }), transform: `scale(${clockOut * sp(0.05, 9)})` }}>
          {[0, 1].map((h) => <div key={h} style={{ position: "absolute", left: 242, top: h ? 90 : 140, width: 16, height: h ? 160 : 110, background: h ? HOT : C.ink, borderRadius: 8, transformOrigin: "50% 100%", transform: `rotate(${frame * (h ? 24 : 4)}deg)` }} />)}
          <div style={{ position: "absolute", left: 225, top: 225, width: 50, height: 50, borderRadius: "50%", background: C.ink }} />
        </div>
      )}
      {frame >= sl && (
        <div style={{ position: "absolute", left: 70, top: 60, width: 820, boxSizing: "border-box", ...card({ padding: 30, background: HOT }), ...grow(sp(sale, 8), 60) }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: F.stamp, fontSize: 96, color: "#fff", WebkitTextStroke: `3px ${C.ink}` }}>
            <Icon name="zap" size={96} color="#FDE047" stroke={2.6} />FLASH SALE
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 24 }}>
            <Digit v={mm[0]} hot={false} /><Digit v={mm[1]} hot={false} />
            <div style={{ fontFamily: F.stamp, fontSize: 110, color: C.ink }}>:</div>
            <Digit v={ss[0]} hot={hot} /><Digit v={ss[1]} hot={hot} />
          </div>
        </div>
      )}
      {frame >= sl && (
        <div style={{ position: "absolute", left: 330, top: 560, transform: `translateX(${shake}px)`, ...grow(sp(sale + 0.3, 9), 60) }}>
          <div style={{ width: 300, height: 300, borderRadius: "50%", background: "#FBCFE8", border: `7px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: frame >= pn ? `0 0 0 ${10 + Math.sin(frame / 2) * 8}px ${HOT}88` : "none" }}>
            <Icon name="brain" size={200} color={C.ink} stroke={1.8} />
          </div>
        </div>
      )}
      {frame >= pn && Array.from({ length: 5 }, (_, k) => <Particles key={k} at={pn + k * 9} n={3} seed={`sw${k}`} x={480} y={600} speed={9} up={6} g={0.7} life={26} item={() => <div style={{ width: 28, height: 40, background: "#7DD3FC", border: `4px solid ${C.ink}`, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }} />} />)}
    </div>
  );
};

// ── 2. Low stock: the stock bar drains to "Sisa 3", rival cursors rush in, then a "?" doubt bubble.
export const LowStock: React.FC<{ low: number; rush: number; doubt: number }> = ({ low, rush, doubt }) => {
  const { frame, f, sp } = useT();
  const lw = f(low), rs = f(rush), db = f(doubt);
  const lvl = interpolate(frame, [6, lw], [0.75, 0.08], ease);
  const blink = frame >= lw && frame % 14 < 9;
  const cursors = [[-60, 120], [1000, 200], [-40, 760], [1000, 820], [480, 1050]];
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="stk" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      <Sfx name="slide" at={8} volume={0.3} />
      {Array.from({ length: 5 }, (_, k) => <Sfx key={k} name="tick" at={8 + Math.round(((lw - 8) * k) / 5)} volume={0.25} />)}
      <Sfx name="buzz" at={lw} volume={0.4} />
      {cursors.map((_, i) => <Sfx key={`c${i}`} name="tap" at={rs + i * 4 + 10} volume={0.3} />)}
      <Sfx name="beat" at={db} volume={0.4} />
      <div style={{ position: "absolute", left: 230, top: 120, width: 500, ...card({ padding: 30 }), filter: frame >= db ? `grayscale(${interpolate(frame, [db, db + 10], [0, 0.6], clamp)})` : "none", ...grow(sp(0.03, 10), 80) }}>
        <div style={{ height: 340, background: "#FEF3C7", borderRadius: 20, border: `5px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `rotate(${float(frame, 0, 4)}deg)` }}><Prod kind="bottle" size={250} /></div>
        </div>
        <div style={{ marginTop: 26, height: 56, borderRadius: 28, border: `6px solid ${C.ink}`, overflow: "hidden", background: "#F3F4F6" }}>
          <div style={{ width: `${lvl * 100}%`, height: "100%", background: frame >= lw ? HOT : "#F97316" }} />
        </div>
        <div style={{ marginTop: 18, fontFamily: F.stamp, fontSize: 72, color: blink ? HOT : C.ink, textAlign: "center", transform: `scale(${frame >= lw ? 1 + Math.sin(frame / 3) * 0.04 : 1})` }}>
          {frame >= lw ? "Sisa 3!" : `Sisa ${Math.round(3 + lvl * 60)}`}
        </div>
      </div>
      {cursors.map(([sx, sy], i) => {
        const t = interpolate(frame, [rs + i * 4, rs + i * 4 + 12], [0, 1], ease);
        if (t <= 0) return null;
        const tx = 430 + (i % 3) * 50, ty = 380 + Math.floor(i / 2) * 40;
        return <div key={i} style={{ position: "absolute", left: sx + (tx - sx) * t, top: sy + (ty - sy) * t, transform: `rotate(${(i - 2) * 12}deg)` }}><Icon name="mouse-pointer-2" size={80} color={C.ink} stroke={2.2} /></div>;
      })}
      {frame >= db && (
        <div style={{ position: "absolute", left: 640, top: 40, ...grow(sp(doubt, 8), 40), transform: `${grow(sp(doubt, 8), 40).transform} rotate(${swing(frame, [db], 12)}deg)` }}>
          <div style={{ width: 230, height: 190, ...card({ borderRadius: "50%" }), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.stamp, fontSize: 140, color: C.ink }}>?</div>
        </div>
      )}
    </div>
  );
};

// ── 3. Strike-through price: Rp100.000 gets crossed, Rp50.000 slams on; then the shop next door's Rp45.000 slides in.
export const Strike: React.FC<{ line: number; slam: number; rival: number }> = ({ line, slam, rival }) => {
  const { frame, f, sp } = useT();
  const ln = interpolate(frame, [f(line), f(line) + 10], [0, 1], ease);
  const rv = f(rival);
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="str" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      <Sfx name="pop" at={6} volume={0.35} />
      <Sfx name="x" at={f(line)} volume={0.4} />
      <Sfx name="stamp" at={f(slam)} volume={0.55} />
      <Sfx name="coin" at={f(slam) + 4} volume={0.35} />
      <Sfx name="slide" at={rv} volume={0.45} />
      <Sfx name="ding" at={rv + 10} volume={0.4} />
      <div style={{ position: "absolute", left: 90, top: 90, transformOrigin: "50% 0", transform: `rotate(${-5 + swing(frame, [f(slam), rv], 8)}deg)`, ...grow(sp(0.05, 9), 60) }}>
        <div style={{ ...card({ padding: "40px 60px", borderRadius: 40 }), position: "relative" }}>
          <div style={{ fontFamily: F.stamp, fontSize: 150, color: frame >= f(line) ? "#9CA3AF" : C.ink, position: "relative" }}>
            Rp100.000
            <div style={{ position: "absolute", left: -10, top: "52%", width: `${ln * 104}%`, height: 22, background: HOT, borderRadius: 11, transform: "rotate(-4deg)" }} />
          </div>
        </div>
      </div>
      {frame >= f(slam) && (
        <div style={{ position: "absolute", left: 240, top: 390 }}>
          <div style={{ ...stamp(sp(slam, 8), -6, 170), background: "#FDE047" }}>Rp50.000</div>
        </div>
      )}
      <Particles at={f(slam) + 2} n={10} seed="strC" x={480} y={500} speed={12} item={(i) => (i % 2 ? <Coin size={54} /> : <Spark size={36} />)} />
      {frame >= rv && (
        <div style={{ position: "absolute", left: 300, top: 700, transform: `translateX(${(1 - sp(rival, 11)) * 900}px) rotate(4deg)`, display: "flex", alignItems: "center", gap: 20, ...card({ padding: "20px 34px", background: C.emBg }) }}>
          <Icon name="store" size={80} color={C.ink} stroke={2.2} />
          <div style={{ fontFamily: F.stamp, fontSize: 100, color: C.ink }}>Rp45.000</div>
        </div>
      )}
    </div>
  );
};

// ── 4. Free-shipping minimum: progress bar stalls short, one more item gets thrown in, the truck drives off.
export const Ongkir: React.FC<{ show: number; short: number; add: number; done: number }> = ({ show, short, add, done }) => {
  const { frame, f, sp } = useT();
  const sh = f(show), st = f(short), ad = f(add), dn = f(done);
  const lvl = frame < ad ? interpolate(frame, [sh + 6, sh + 30], [0, 0.85], ease) : interpolate(frame, [ad + 6, dn], [0.85, 1], ease);
  const amt = 100000 * lvl;
  const shake = frame >= st && frame < ad ? Math.sin(frame * 1.6) * 8 : 0;
  const drive = frame >= dn ? Math.max(0, frame - dn - 4) ** 2 * 1.2 : 0;
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="ong" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      <Sfx name="pop" at={sh} volume={0.4} />
      {[0, 1, 2, 3].map((k) => <Sfx key={k} name="tick" at={sh + 8 + k * 6} volume={0.25} />)}
      <Sfx name="buzz" at={st} volume={0.4} />
      <Sfx name="whoosh" at={ad} volume={0.4} />
      <Sfx name="pop" at={ad + 8} volume={0.45} />
      <Sfx name="check" at={dn} volume={0.5} />
      <Sfx name="whoosh" at={dn + 6} volume={0.4} />
      <div style={{ position: "absolute", left: 40, top: 220, width: 880, ...card({ padding: 40 }), transform: `translateX(${shake}px)`, ...grow(sp(0.05, 10), 60) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: F.stamp, fontSize: 64, color: C.ink }}>
          <span>{rp(amt)}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 12, color: frame >= dn ? "#4D7C0F" : C.ink }}>/ Rp100.000</span>
        </div>
        <div style={{ marginTop: 26, height: 80, borderRadius: 40, border: `7px solid ${C.ink}`, background: "#F3F4F6", overflow: "hidden" }}>
          <div style={{ width: `${lvl * 100}%`, height: "100%", background: frame >= dn ? "#84CC16" : frame >= st ? "#F97316" : C.emBg, borderRight: lvl > 0.01 && lvl < 1 ? `6px solid ${C.ink}` : "none" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 640 + drive, top: 520, transform: `translateY(${frame >= dn ? Math.abs(Math.sin(frame / 2)) * -10 : float(frame, 0, 4)}px)`, ...grow(sp(show, 9), 40) }}>
        <div style={{ ...card({ padding: 24, borderRadius: 34, background: frame >= dn ? C.emBg : C.card }) }}><Icon name="truck" size={150} color={C.ink} stroke={2} /></div>
      </div>
      {frame >= ad && (
        <div style={{ position: "absolute", left: interpolate(frame, [ad, ad + 8], [-200, 200], ease), top: interpolate(frame, [ad, ad + 4, ad + 8], [700, 460, 330], ease), transform: `rotate(${Math.min(frame - ad, 8) * 40}deg) scale(${frame > ad + 8 ? 0 : 1})` }}><Prod kind="candy" size={140} /></div>
      )}
      <Particles at={dn} n={14} seed="ongC" x={480} y={360} speed={14} item={(i) => (i % 2 ? <Spark size={40} /> : <Coin size={52} />)} />
    </div>
  );
};

// ── Buyer tip: a shopping list ticks off, a clock rolls 23:58 → 00:00.
export const Midnight: React.FC<{ ticks: number[]; clock: number; zero: number }> = ({ ticks, clock, zero }) => {
  const { frame, f, sp } = useT();
  const items = ["Sabun cuci", "Kaos kaki", "Charger"];
  const ck = f(clock), zr = f(zero);
  const time = frame >= zr ? "00:00" : frame >= (ck + zr) / 2 ? "23:59" : "23:58";
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="mid" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      <Sfx name="slide" at={6} volume={0.35} />
      {ticks.map((t, i) => <Sfx key={i} name="check" at={f(t)} volume={0.4} />)}
      <Sfx name="pop" at={ck} volume={0.4} />
      <Sfx name="tick" at={Math.round((ck + zr) / 2)} volume={0.4} />
      <Sfx name="ding" at={zr} volume={0.5} />
      <div style={{ position: "absolute", left: 70, top: 120, width: 560, ...card({ padding: "40px 40px 30px", background: "#FEF9C3" }), transform: `rotate(-3deg)`, ...grow(sp(0.05, 10), 80) }}>
        {items.map((it, i) => {
          const on = frame >= f(ticks[i]);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, height: 120, borderBottom: `4px solid ${C.ink}22` }}>
              <div style={{ width: 70, height: 70, border: `6px solid ${C.ink}`, borderRadius: 14, background: on ? C.emBg : C.card, display: "flex", alignItems: "center", justifyContent: "center", transform: on ? squash(frame, f(ticks[i]), 0.3) : "" }}>
                {on && <Icon name="check" size={56} color={C.ink} stroke={4} />}
              </div>
              <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 56, color: C.ink, textDecoration: on ? "line-through" : "none" }}>{it}</div>
            </div>
          );
        })}
      </div>
      {frame >= ck && (
        <div style={{ position: "absolute", left: 400, top: 560, ...card({ padding: "26px 40px", background: C.ink }), transform: `rotate(5deg) ${frame >= zr ? squash(frame, zr, 0.2) : ""}`, ...grow(sp(clock, 9), 60) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Icon name="moon" size={90} color="#FDE047" stroke={2.4} />
            <div style={{ fontFamily: F.stamp, fontSize: 130, color: frame >= zr ? C.emBg : "#fff" }}>{time}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Seller twist: the four trick cards fly into "your shop", which lights up.
export const Toolkit: React.FC<{ fly: number; glow: number }> = ({ fly, glow }) => {
  const { frame, f, sp } = useT();
  const fl = f(fly), gl = f(glow);
  const from = [[60, 80], [800, 80], [60, 560], [800, 560]];
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="tlk" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      {TRICKS.map((_, i) => <Sfx key={i} name="pop" at={6 + i * 3} volume={0.3} />)}
      {TRICKS.map((_, i) => <Sfx key={`w${i}`} name="whoosh" at={fl + i * 5} volume={0.25} />)}
      {TRICKS.map((_, i) => <Sfx key={`c${i}`} name="coin" at={fl + i * 5 + 12} volume={0.35} />)}
      <Sfx name="boom" at={gl} volume={0.4} />
      <Sfx name="cash" at={gl + 2} volume={0.45} />
      <div style={{ position: "absolute", left: 280, top: 380, transformOrigin: "50% 100%", transform: `${squash(frame, gl, 0.15)}`, ...grow(sp(0.1, 10), 100) }}>
        <Store name="TOKO KAMU" color={C.emBg} w={400} lit={frame >= gl} />
      </div>
      {TRICKS.map(([icon, bg], i) => {
        const t = interpolate(frame, [fl + i * 5, fl + i * 5 + 12], [0, 1], ease);
        if (t >= 1) return null;
        const [sx, sy] = from[i];
        const x = sx + (440 - sx) * t, y = sy + (620 - sy) * t;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 120, height: 150, ...card({ borderRadius: 20, background: bg, boxShadow: `6px 6px 0 ${C.ink}`, borderWidth: 5 }), display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - t * 0.6}) rotate(${t * 180 + float(frame, i, 4)}deg)`, ...(t === 0 ? grow(sp(0.2 + i * 0.1, 9), 30) : {}) }}>
            <Icon name={icon} size={70} color={C.ink} stroke={2.2} />
          </div>
        );
      })}
      <Particles at={gl} n={16} seed="tlkG" x={480} y={560} speed={15} item={(i) => (i % 2 ? <Spark size={44} /> : <Coin size={56} />)} />
    </div>
  );
};
