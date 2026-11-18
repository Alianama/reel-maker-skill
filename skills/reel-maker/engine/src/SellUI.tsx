// "Bot jualan sampai lunas" visuals: the Melichat sales agent from first chat to payment, plus hook/handoff/CTA scenes.
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "./sfx";
import { C, F, cardShadow, clamp, enter, pop } from "./theme";
import { Icon } from "./Visuals";

const DANGER = "#B91C1C";
const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, p: (d = 0) => pop(frame, fps, d) };
};
const panel = (): React.CSSProperties => ({ background: C.card, border: `5px solid ${C.ink}`, boxShadow: cardShadow, borderRadius: 30, overflow: "hidden" });
const ease = (x: number) => 1 - (1 - x) ** 3;
const prog = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: ease });
const rupiah = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;

// Knitted bag drawn in SVG (no product photo needed).
export const Bag: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M30 38 C30 12 70 12 70 38" stroke={C.ink} strokeWidth={6} fill="none" />
    <path d="M18 36 H82 L76 90 H24 Z" fill={color} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    {[48, 60, 72].map((y) => <path key={y} d={`M24 ${y} Q32 ${y - 5} 40 ${y} T56 ${y} T72 ${y} T80 ${y}`} stroke="#00000030" strokeWidth={3} fill="none" />)}
  </svg>
);

const Bubble: React.FC<{ text: string; me?: boolean; s: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ text, me, s, style, children }) => (
  <div style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: 700, background: me ? C.red : "#fff", color: me ? "#fff" : C.ink, border: `4px solid ${C.ink}`, borderRadius: 26, padding: "16px 24px", fontFamily: F.sans, fontWeight: 500, fontSize: 34, lineHeight: 1.2, transformOrigin: me ? "100% 100%" : "0 100%", ...enter(s, 30), ...style }}>
    {children}
    {text}
  </div>
);

// Hook, part 1: 01.59 flips to 02.00, the phone buzzes with a question, the admin sleeps.
export const Night: React.FC<{ from: string; time: string; name: string; text: string; dur: number }> = ({ from, time, name, text, dur }) => {
  const { frame, p } = useT();
  const flip = 14;
  const k = Math.abs(interpolate(frame, [flip - 4, flip, flip + 4], [1, 0, 1], clamp));
  const buzz = [26, 48, 70].some((b) => frame >= b && frame < b + 14);
  return (
    <div style={{ width: 960, height: 1100, position: "relative", ...enter(p(1), 60) }}>
      <Sfx name="tick" at={2} volume={0.4} />
      <Sfx name="punch" at={flip} volume={0.5} />
      {[26, 48, 70].map((b) => <Sfx key={b} name="buzz" at={b} volume={0.55} />)}
      <Sfx name="ding" at={28} volume={0.4} />
      {[0, 1, 2, 3].map((i) => <Sfx key={`z${i}`} name="pop" at={40 + i * 30} volume={0.15} />)}
      <div style={{ position: "absolute", right: 10, top: 0, transform: `rotate(${Math.sin(frame / 20) * 8}deg) scale(${p(6)})` }}><Icon name="moon" size={140} color={C.emBg} /></div>
      <div style={{ textAlign: "center", fontFamily: F.stamp, fontSize: 260, lineHeight: 1, color: "#fff", transform: `scaleY(${k})`, textShadow: `0 0 40px ${C.emBg}66` }}>{frame < flip ? from : time}</div>
      <div style={{ position: "absolute", left: 30, top: 330, width: 450, height: 720, background: "#0B0F19", border: `6px solid ${C.emBg}`, borderRadius: 60, padding: 16, transform: `rotate(${-6 + (buzz ? Math.sin(frame * 2.4) * 2.5 : 0)}deg) scale(${p(8)})`, boxShadow: buzz ? `0 0 60px ${C.emBg}88` : "0 30px 50px #0008" }}>
        <div style={{ height: "100%", borderRadius: 46, background: "linear-gradient(170deg, #1F2937, #111827)", padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontFamily: F.stamp, fontSize: 90, color: "#ffffffcc", textAlign: "center", marginTop: 20 }}>{time}</div>
          {frame >= 26 && (
            <div style={{ background: "#ffffffee", borderRadius: 24, padding: "16px 18px", display: "flex", gap: 14, alignItems: "center", ...enter(p(26), 40) }}>
              <Icon name="message-circle" size={46} color={C.red} />
              <div style={{ fontFamily: F.sans, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 26, color: C.ink }}>{name}</div>
                <div style={{ fontSize: 26, color: "#333" }}>{text}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ position: "absolute", right: 30, top: 520, textAlign: "center", ...enter(p(10), 40) }}>
        <Icon name="bed-double" size={300} color="#ffffff66" stroke={1.4} />
        {[0, 1, 2].map((i) => {
          const ph = ((frame + i * 18) % 54) / 54;
          return <div key={i} style={{ position: "absolute", right: 40 - ph * 60, top: 40 - ph * 260, fontFamily: F.stamp, fontSize: 60 + ph * 50, color: C.emBg, opacity: Math.sin(ph * Math.PI) }}>Z</div>;
        })}
      </div>
    </div>
  );
};

// Hook, part 2: the buyer's bag flies into the shop next door, which stamps it sold.
export const Lost: React.FC<{ shop: string; dur: number }> = ({ shop }) => {
  const { frame, p } = useT();
  const fly = prog(frame, 6, 26);
  const st = p(30);
  return (
    <div style={{ width: 900, height: 980, position: "relative", ...enter(p(1), 60) }}>
      <Sfx name="whoosh" at={6} volume={0.5} />
      <Sfx name="cash" at={26} volume={0.6} />
      <Sfx name="stamp" at={30} volume={0.7} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 120, height: 760, background: C.card, border: `6px solid ${C.ink}`, borderRadius: 20, boxShadow: cardShadow }}>
        <div style={{ height: 150, background: `repeating-linear-gradient(90deg, ${C.emBg} 0 80px, #fff 80px 160px)`, borderBottom: `6px solid ${C.ink}`, borderRadius: "14px 14px 0 0" }} />
        <div style={{ margin: "30px auto 0", width: 520, padding: "14px 0", background: C.ink, color: "#fff", fontFamily: F.stamp, fontSize: 64, textAlign: "center", borderRadius: 12 }}>{shop}</div>
        <div style={{ position: "absolute", left: 60, bottom: 0, width: 300, height: 380, border: `6px solid ${C.ink}`, borderBottom: "none", background: `${C.emBg}44` }} />
        <div style={{ position: "absolute", right: 60, bottom: 120, width: 260, height: 220, border: `6px solid ${C.ink}`, background: "#E0F2FE" }} />
      </div>
      <div style={{ position: "absolute", left: interpolate(fly, [0, 1], [-400, 150]), top: interpolate(fly, [0, 0.5, 1], [700, 380, 560]), transform: `rotate(${(1 - fly) * -40}deg) scale(${1 - fly * 0.3})` }}>
        <Bag color="#E9D8B4" size={240} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 420, transform: `rotate(-12deg) scale(${interpolate(st, [0, 1], [2.4, 1])})`, opacity: Math.min(1, st * 2), border: `10px solid ${DANGER}`, color: DANGER, fontFamily: F.stamp, fontSize: 120, padding: "0 30px", borderRadius: 16, background: "#ffffffcc" }}>TERJUAL</div>
    </div>
  );
};

// Bot card installs an update, then its new sales tools pop in one by one.
export const Upgrade: React.FC<{ name: string; from: string; tools: { label: string; icon: string }[]; dur: number }> = ({ name, from, tools, dur }) => {
  const { frame, p } = useT();
  const done = Math.round(dur * 0.32);
  const pct = Math.round(100 * prog(frame, 8, done));
  const step = (dur * 0.5) / tools.length;
  const toolAt = (i: number) => done + 8 + i * step;
  const glow = frame > done ? 0.5 + 0.5 * Math.sin(frame / 5) : 0;
  return (
    <div style={{ width: 940, ...panel(), padding: 34, display: "flex", flexDirection: "column", gap: 26, boxShadow: `${cardShadow}, 0 0 ${60 + glow * 60}px ${C.emBg}${frame > done ? "cc" : "00"}`, ...enter(p(2), 80) }}>
      {Array.from({ length: 10 }, (_, i) => <Sfx key={i} name="blip" at={8 + ((done - 8) * i) / 10} volume={0.25} />)}
      <Sfx name="check" at={done} volume={0.55} />
      {tools.map((_, i) => <Sfx key={`t${i}`} name="pop" at={toolAt(i)} volume={0.45} />)}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ width: 120, height: 120, borderRadius: 60, background: C.emBg, border: `5px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${frame > done ? Math.sin(frame / 4) * 8 : 0}deg)` }}><Icon name="bot" size={76} color={C.ink} /></div>
        <div style={{ flex: 1, fontFamily: F.sans, fontWeight: 700, fontSize: 52, color: C.ink }}>{name}</div>
        <div style={{ fontFamily: F.stamp, fontSize: 80, color: pct === 100 ? C.red : C.muted }}>{pct}%</div>
      </div>
      <div style={{ height: 34, borderRadius: 17, background: C.ghost, overflow: "hidden", border: `4px solid ${C.ink}` }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `repeating-linear-gradient(45deg, ${C.emBg} 0 22px, #BEF264 22px 44px)`, backgroundPositionX: frame * 3 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: F.sans, fontSize: 38, fontWeight: 700, color: C.muted }}>
        <Icon name="message-square" size={44} color={C.muted} /> {from}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {tools.map((t, i) => {
          const s = p(toolAt(i));
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 22px", borderRadius: 22, background: C.red, color: "#fff", fontFamily: F.sans, fontWeight: 700, fontSize: 36, ...enter(s, 40, `rotate(${(1 - s) * (i % 2 ? 10 : -10)}deg)`) }}>
              <Icon name={t.icon} size={46} color={C.emBg} /> {t.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Buyer types a message full of typos on her phone; Melichat reads each typo as the right word.
export const Typo: React.FC<{ shop: string; typed: string; fixed: string; dur: number }> = ({ shop, typed, fixed, dur }) => {
  const { frame, p } = useT();
  const t0 = Math.round(dur * 0.28);
  const sent = t0 + Math.ceil(typed.length * 1.4) + 4;
  const fix0 = Math.round(dur * 0.66);
  const a = typed.split(" ");
  const b = fixed.split(" ");
  const wrong = a.map((w, i) => w !== b[i]);
  const order = wrong.map((w, i) => (w ? i : -1)).filter((i) => i >= 0);
  const fixAt = (i: number) => fix0 + order.indexOf(i) * 7;
  const shown = typed.slice(0, Math.max(0, Math.floor((frame - t0) / 1.4)));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
      {Array.from({ length: Math.ceil(typed.length / 3) }, (_, i) => <Sfx key={i} name="type" at={t0 + i * 4.2} volume={0.3} />)}
      <Sfx name="tap" at={sent - 2} volume={0.5} />
      <Sfx name="ding" at={sent} volume={0.45} />
      <Sfx name="slide" at={sent + 10} volume={0.4} />
      {order.map((i) => <Sfx key={`f${i}`} name="blip" at={fixAt(i)} volume={0.45} />)}
      <Sfx name="check" at={fixAt(order[order.length - 1]) + 6} volume={0.5} />
      <div style={{ width: 640, height: 700, background: C.ink, borderRadius: 64, padding: 16, boxShadow: "0 30px 50px #0004", ...enter(p(2), 100, `rotate(${-2 + Math.sin(frame / 25)}deg)`) }}>
        <div style={{ height: "100%", borderRadius: 50, overflow: "hidden", background: "#F7FEE7", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "26px 26px 18px", background: C.red, color: "#fff", fontFamily: F.sans, fontWeight: 700, fontSize: 34 }}>
            <Icon name="store" size={44} color={C.emBg} /> {shop}
          </div>
          <div style={{ flex: 1, padding: 22, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            {frame >= sent && <Bubble me text={typed} s={p(sent)} style={{ background: C.emBg, color: C.ink, fontSize: 32 }} />}
          </div>
          <div style={{ margin: 18, padding: "16px 22px", borderRadius: 40, background: "#fff", border: `3px solid ${C.ghost}`, fontFamily: F.sans, fontSize: 30, color: C.ink, minHeight: 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{frame < sent ? shown : ""}{frame < sent && frame % 16 < 8 ? "|" : ""}</span>
            <Icon name="send" size={36} color={C.red} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, width: 980, padding: 22, ...panel(), ...enter(p(sent + 10), 40) }}>
        <Icon name="scan-search" size={56} color={C.red} />
        {a.map((w, i) => {
          const on = wrong[i] && frame >= fixAt(i);
          const k = wrong[i] ? p(fixAt(i)) : 0;
          return (
            <span key={i} style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 40, padding: "2px 12px", borderRadius: 12, color: C.ink, background: on ? C.emBg : wrong[i] ? "#FEE2E2" : "transparent", textDecoration: wrong[i] && !on ? `wavy underline ${DANGER}` : "none", transform: `scale(${1 + Math.sin(k * Math.PI) * 0.3})`, display: "inline-block" }}>
              {on ? b[i] : w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Catalog search: scanner hops across products, lands on the match, then the bot replies with its photo.
export const Catalog: React.FC<{ query: string; items: { name: string; color: string; price: number; stock: number }[]; pick: number; reply: string; dur: number }> = ({ query, items, pick, reply, dur }) => {
  const { frame, p } = useT();
  const hops = [0, 1, 2, 3, 4, 5].slice(0, items.length).concat(pick);
  const h0 = 14;
  const hEnd = Math.round(dur * 0.4);
  const hopLen = (hEnd - h0) / (hops.length - 1);
  const hi = Math.min(hops.length - 1, Math.max(0, Math.floor((frame - h0) / hopLen)));
  const cell = hops[hi];
  const landed = frame >= hEnd;
  const replyAt = Math.round(dur * 0.66);
  const sel = items[pick];
  return (
    <div style={{ width: 960, position: "relative", ...enter(p(2), 80) }}>
      {Array.from({ length: Math.ceil(query.length / 2) }, (_, i) => <Sfx key={`q${i}`} name="type" at={4 + i * 3} volume={0.3} />)}
      {hops.slice(1).map((_, i) => <Sfx key={i} name="slide" at={h0 + (i + 1) * hopLen} volume={0.3} />)}
      <Sfx name="ring" at={hEnd} volume={0.5} />
      <Sfx name="coin" at={hEnd + 8} volume={0.5} />
      <Sfx name="whoosh" at={replyAt - 6} volume={0.4} />
      <Sfx name="pop" at={replyAt} volume={0.5} />
      <div style={{ ...panel(), padding: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", borderRadius: 40, border: `4px solid ${C.ink}`, fontFamily: F.sans, fontSize: 36, color: C.ink, marginBottom: 22 }}>
          <Icon name="search" size={40} color={C.red} />
          {query.slice(0, Math.max(0, Math.floor((frame - 4) / 1.5)))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {items.map((it, i) => {
            const isPick = landed && i === pick;
            const s = p(6 + i * 2);
            return (
              <div key={i} style={{ position: "relative", padding: 14, borderRadius: 22, background: isPick ? `${C.emBg}55` : "#F7FEE7", border: `5px solid ${i === cell || isPick ? C.red : "transparent"}`, textAlign: "center", fontFamily: F.sans, opacity: landed && !isPick ? 0.45 : 1, ...enter(s, 30, `scale(${isPick ? 1 + 0.08 * p(hEnd) : 1})`) }}>
                <Bag color={it.color} size={150} />
                <div style={{ fontWeight: 700, fontSize: 26, color: C.ink, lineHeight: 1.1 }}>{it.name}</div>
                <div style={{ fontSize: 24, color: C.muted }}>{rupiah(it.price)}</div>
                {isPick && <div style={{ position: "absolute", top: -18, right: -14, padding: "6px 14px", borderRadius: 20, background: C.red, color: "#fff", fontWeight: 700, fontSize: 26, transform: `scale(${p(hEnd + 8)})` }}>Stok {it.stock}</div>}
              </div>
            );
          })}
        </div>
      </div>
      {frame >= replyAt && (
        <div style={{ position: "absolute", left: 120, right: 0, bottom: -150, display: "flex", flexDirection: "column" }}>
          <Bubble me s={p(replyAt)} text={reply} style={{ fontSize: 32, boxShadow: cardShadow }}>
            <div style={{ display: "flex", justifyContent: "center", background: "#F7FEE7", borderRadius: 16, marginBottom: 12 }}><Bag color={sel.color} size={170} /></div>
          </Bubble>
        </div>
      )}
    </div>
  );
};

// Shipping: short chat (asks the postcode once), a truck drives the route, the fee counts up.
export const Ship: React.FC<{ city: string; zip: string; cost: number; dur: number }> = ({ city, zip, cost, dur }) => {
  const { frame, p } = useT();
  const ask = Math.round(dur * 0.3);
  const ans = Math.round(dur * 0.48);
  const r0 = Math.round(dur * 0.55);
  const r1 = Math.round(dur * 0.8);
  const t = prog(frame, r0, r1);
  const bez = (a: number, c: number, b: number) => (1 - t) ** 2 * a + 2 * (1 - t) * t * c + t * t * b;
  const fee = cost * prog(frame, r1 - 6, r1 + 8);
  return (
    <div style={{ width: 940, display: "flex", flexDirection: "column", gap: 18, ...enter(p(2), 80) }}>
      <Sfx name="ding" at={4} volume={0.4} />
      <Sfx name="pop" at={ask} volume={0.45} />
      <Sfx name="stamp" at={ask + 8} volume={0.4} />
      <Sfx name="ding" at={ans} volume={0.4} />
      <Sfx name="whoosh" at={r0} volume={0.45} />
      {Array.from({ length: 6 }, (_, i) => <Sfx key={i} name="blip" at={r1 - 6 + i * 2.5} volume={0.25} />)}
      <Sfx name="cash" at={r1 + 8} volume={0.55} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 300 }}>
        <Bubble text={`Kirim ke ${city} ya kak`} s={p(4)} style={{ fontSize: 30 }} />
        {frame >= ask && (
          <div style={{ alignSelf: "flex-end", position: "relative" }}>
            <Bubble me text="Boleh kode posnya, kak?" s={p(ask)} style={{ fontSize: 30 }} />
            <div style={{ position: "absolute", left: -60, top: -20, width: 90, height: 90, borderRadius: 45, background: C.emBg, border: `4px solid ${C.ink}`, fontFamily: F.stamp, fontSize: 50, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${p(ask + 8)}) rotate(-12deg)` }}>1×</div>
          </div>
        )}
        {frame >= ans && <Bubble text={zip} s={p(ans)} style={{ fontSize: 30 }} />}
      </div>
      <div style={{ position: "relative", height: 470, ...panel(), backgroundImage: `linear-gradient(${C.ghost}66 2px, transparent 2px), linear-gradient(90deg, ${C.ghost}66 2px, transparent 2px)`, backgroundSize: "60px 60px" }}>
        <svg width={930} height={460} style={{ position: "absolute" }}>
          <path d="M150 360 Q330 40 780 120" stroke={C.ghost} strokeWidth={14} strokeDasharray="4 22" strokeLinecap="round" fill="none" />
          <path d="M150 360 Q330 40 780 120" stroke={C.red} strokeWidth={14} strokeLinecap="round" fill="none" strokeDasharray={760} strokeDashoffset={760 * (1 - t)} />
        </svg>
        <div style={{ position: "absolute", left: 100, top: 300, transform: `scale(${p(6)})` }}><Icon name="store" size={100} color={C.ink} /></div>
        <div style={{ position: "absolute", left: 735, top: 30, textAlign: "center", transform: `scale(${p(8)}) translateY(${t >= 1 ? Math.sin(frame / 4) * 6 : 0}px)` }}>
          <Icon name="map-pin" size={100} color={C.red} />
          <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 28, color: C.ink }}>{city}</div>
        </div>
        {frame >= r0 && <div style={{ position: "absolute", left: bez(150, 330, 780) - 50, top: bez(360, 40, 120) - 60, padding: 8, background: C.emBg, borderRadius: 18, border: `4px solid ${C.ink}` }}><Icon name="truck" size={70} color={C.ink} /></div>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 30px", borderRadius: 26, background: C.ink, color: "#fff", fontFamily: F.sans, fontWeight: 700, fontSize: 40, opacity: frame >= r1 - 6 ? 1 : 0.35 }}>
        <span>Ongkir</span>
        <span style={{ fontFamily: F.stamp, fontSize: 64, color: C.emBg }}>{rupiah(fee)}</span>
      </div>
    </div>
  );
};

// Order summary printed from a receipt printer, then checked.
export const Receipt: React.FC<{ agree: string; id: string; rows: { label: string; value: string }[]; total: string; dur: number }> = ({ agree, id, rows, total, dur }) => {
  const { frame, p } = useT();
  const p0 = 16;
  const p1 = Math.round(dur * 0.78);
  const out = prog(frame, p0, p1);
  const H = 250 + rows.length * 74;
  const okAt = p1 + 4;
  return (
    <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", ...enter(p(2), 80) }}>
      <Sfx name="ding" at={3} volume={0.4} />
      {Array.from({ length: Math.floor((p1 - p0) / 8) }, (_, i) => <Sfx key={i} name="print" at={p0 + i * 8} volume={0.35} />)}
      <Sfx name="check" at={okAt} volume={0.55} />
      <Sfx name="cash" at={okAt + 4} volume={0.45} />
      <Bubble text={agree} s={p(3)} style={{ alignSelf: "flex-start", marginBottom: 26, fontSize: 32 }} />
      <div style={{ width: 800, height: 130, background: C.ink, borderRadius: 30, position: "relative", zIndex: 2, boxShadow: cardShadow }}>
        <div style={{ position: "absolute", left: 60, bottom: 26, width: 680, height: 16, borderRadius: 8, background: "#000" }} />
        <div style={{ position: "absolute", right: 40, top: 30, width: 26, height: 26, borderRadius: 13, background: frame % 10 < 5 && out < 1 ? C.emBg : "#365314" }} />
        <Icon name="printer" size={60} color={C.emBg} />
      </div>
      <div style={{ width: 680, height: H, overflow: "hidden", marginTop: -34 }}>
        <div style={{ position: "relative", height: H, background: "#fff", padding: "54px 40px 30px", fontFamily: F.mono, fontSize: 34, color: C.ink, transform: `translateY(${(out - 1) * H}px)`, clipPath: "polygon(0 0,100% 0,100% calc(100% - 18px),95% 100%,90% calc(100% - 18px),85% 100%,80% calc(100% - 18px),75% 100%,70% calc(100% - 18px),65% 100%,60% calc(100% - 18px),55% 100%,50% calc(100% - 18px),45% 100%,40% calc(100% - 18px),35% 100%,30% calc(100% - 18px),25% 100%,20% calc(100% - 18px),15% 100%,10% calc(100% - 18px),5% 100%,0 calc(100% - 18px))", boxShadow: "inset 0 30px 30px -20px #0003" }}>
          <div style={{ textAlign: "center", fontWeight: 700, marginBottom: 16 }}>{id}</div>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "3px dashed #0002" }}><span>{r.label}</span><span>{r.value}</span></div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, marginRight: 120, padding: "12px 14px", background: C.emBg, fontWeight: 700, fontSize: 40 }}><span>Total</span><span>{total}</span></div>
          <div style={{ position: "absolute", right: 16, bottom: 30, width: 100, height: 100, borderRadius: 50, background: C.red, border: "6px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${p(okAt)}) rotate(${(1 - p(okAt)) * -90}deg)`, boxShadow: cardShadow }}><Icon name="check" size={70} color="#fff" stroke={3} /></div>
        </div>
      </div>
    </div>
  );
};

// Payment buttons in the chat; a finger taps along the methods as they are named.
export const Pay: React.FC<{ total: string; methods: string[]; taps: number[]; dur: number }> = ({ total, methods, taps, dur }) => {
  const { frame, p } = useT();
  const tapF = taps.map((x) => Math.round(x * dur));
  const cur = tapF.reduce((c, f, i) => (frame >= f ? i : c), -1);
  const rowY = (i: number) => 330 + i * 118;
  const next = cur + 1 < tapF.length ? cur + 1 : cur;
  const from = cur < 0 ? 1100 : rowY(cur) + 40;
  const to = rowY(Math.max(0, next)) + 40;
  const y = cur < 0 ? interpolate(frame, [tapF[0] - 10, tapF[0]], [from, to], clamp) : cur + 1 < tapF.length ? interpolate(frame, [tapF[next] - 8, tapF[next]], [from, to], clamp) : from;
  const press = tapF.some((f) => frame >= f && frame < f + 5);
  const icons = ["qr-code", "landmark", "store", "store", "wallet"];
  return (
    <div style={{ width: 900, height: 1000, position: "relative", ...enter(p(2), 80) }}>
      <Sfx name="pop" at={4} volume={0.45} />
      {methods.map((_, i) => <Sfx key={i} name="blip" at={12 + i * 4} volume={0.35} />)}
      {tapF.map((f, i) => <Sfx key={`t${i}`} name="tap" at={f} volume={0.6} />)}
      <Bubble me s={p(4)} text={`Total ${total}. Mau bayar pakai apa, kak?`} style={{ position: "absolute", right: 0, top: 0, maxWidth: 800, fontSize: 36 }} />
      {methods.map((m, i) => {
        const on = i === cur;
        const s = p(12 + i * 4);
        return (
          <div key={i} style={{ position: "absolute", left: 60, right: 0, top: rowY(i), height: 100, display: "flex", alignItems: "center", gap: 22, padding: "0 30px", borderRadius: 26, border: `5px solid ${C.ink}`, background: on ? C.emBg : C.card, boxShadow: on ? `0 0 50px ${C.emBg}` : cardShadow, fontFamily: F.sans, fontWeight: 700, fontSize: 42, color: C.ink, ...enter(s, 40, `scale(${on && press ? 0.95 : on ? 1.04 : 1})`) }}>
            <Icon name={icons[i] ?? "wallet"} size={52} color={on ? C.ink : C.red} />
            <span style={{ flex: 1 }}>{m}</span>
            {i <= cur && <Icon name="circle-check" size={46} color={C.red} />}
          </div>
        );
      })}
      {frame >= tapF[0] - 12 && (
        <div style={{ position: "absolute", left: 700, top: y, transform: `scale(${press ? 0.85 : 1}) rotate(-15deg)`, filter: "drop-shadow(0 8px 6px #0004)" }}>
          <Icon name="pointer" size={120} color={C.ink} stroke={2} />
        </div>
      )}
    </div>
  );
};

// Unpaid order: an hour runs out on a ring, the order is cancelled, the item goes back on the shelf.
export const Expire: React.FC<{ id: string; stock: [number, number]; dur: number }> = ({ id, stock, dur }) => {
  const { frame, p } = useT();
  const c0 = 6;
  const c1 = Math.round(dur * 0.42);
  const k = interpolate(frame, [c0, c1], [0, 1], { ...clamp, easing: (x) => x * x });
  const left = Math.round(3600 * (1 - k));
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const cancel = Math.round(dur * 0.5);
  const back = Math.round(dur * 0.7);
  const boxK = prog(frame, back, back + 14);
  const R = 190;
  const over = frame >= c1;
  return (
    <div style={{ width: 920, display: "flex", flexDirection: "column", alignItems: "center", gap: 30, ...enter(p(2), 80) }}>
      {Array.from({ length: 14 }, (_, i) => <Sfx key={i} name="tick" at={c0 + (c1 - c0) * Math.sqrt(i / 14)} volume={0.35} />)}
      <Sfx name="alarm" at={c1} volume={0.5} />
      <Sfx name="error" at={cancel} volume={0.55} />
      <Sfx name="stamp" at={cancel + 2} volume={0.5} />
      <Sfx name="whoosh" at={back} volume={0.4} />
      <Sfx name="coin" at={back + 14} volume={0.5} />
      <div style={{ position: "relative", width: 2 * R + 40, height: 2 * R + 40, transform: `rotate(${over && frame < c1 + 12 ? Math.sin(frame * 2) * 4 : 0}deg)` }}>
        <svg width={2 * R + 40} height={2 * R + 40}>
          <circle cx={R + 20} cy={R + 20} r={R} stroke={C.ghost} strokeWidth={30} fill={C.card} />
          <circle cx={R + 20} cy={R + 20} r={R} stroke={over ? DANGER : C.red} strokeWidth={30} fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * R} strokeDashoffset={2 * Math.PI * R * k} transform={`rotate(-90 ${R + 20} ${R + 20})`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: F.stamp, fontSize: 120, color: over ? DANGER : C.ink }}>
          <Icon name="timer" size={64} color={over ? DANGER : C.muted} />
          {mm}:{ss}
        </div>
      </div>
      <div style={{ position: "relative", width: 860, display: "flex", alignItems: "center", gap: 22, padding: 26, ...panel(), opacity: frame >= cancel ? 0.85 : 1 }}>
        <Bag color="#E9D8B4" size={110} />
        <div style={{ flex: 1, fontFamily: F.sans }}>
          <div style={{ fontWeight: 700, fontSize: 38, color: C.ink }}>{id}</div>
          <div style={{ fontSize: 30, color: frame >= cancel ? DANGER : C.muted, fontWeight: 700 }}>{frame >= cancel ? "Dibatalkan" : "Menunggu pembayaran"}</div>
        </div>
        {frame >= cancel && <div style={{ position: "absolute", right: 30, top: 10, transform: `rotate(-10deg) scale(${interpolate(p(cancel), [0, 1], [2.2, 1])})`, border: `8px solid ${DANGER}`, color: DANGER, fontFamily: F.stamp, fontSize: 80, padding: "0 20px", borderRadius: 14, background: "#fff" }}>BATAL</div>}
      </div>
      <div style={{ width: 860, display: "flex", alignItems: "center", gap: 24, padding: "20px 30px", borderRadius: 26, background: C.ink, color: "#fff", fontFamily: F.sans, fontWeight: 700, fontSize: 40, opacity: frame >= back - 4 ? 1 : 0.3, position: "relative" }}>
        <Icon name="package" size={56} color={C.emBg} />
        <span style={{ flex: 1 }}>Stok Tas Rajut Krem</span>
        <span style={{ fontFamily: F.stamp, fontSize: 80, color: C.emBg, display: "inline-block", transform: `scale(${1 + Math.sin(prog(frame, back + 12, back + 22) * Math.PI) * 0.4})` }}>{frame >= back + 14 ? stock[1] : stock[0]}</span>
        {frame >= back && boxK < 1 && <div style={{ position: "absolute", right: 60, top: interpolate(boxK, [0, 1], [-260, 0]), opacity: 1 - boxK }}><Icon name="package" size={70} color={C.emBg} /></div>}
      </div>
    </div>
  );
};

// A complaint turns into a support ticket.
export const Ticket: React.FC<{ complaint: string; id: string; dur: number }> = ({ complaint, id, dur }) => {
  const { frame, p } = useT();
  const tk = Math.round(dur * 0.35);
  return (
    <div style={{ width: 900, display: "flex", flexDirection: "column", gap: 30, ...enter(p(2), 80) }}>
      <Sfx name="ding" at={3} volume={0.45} />
      <Sfx name="print" at={tk - 4} volume={0.4} />
      <Sfx name="stamp" at={tk + 4} volume={0.5} />
      <Bubble text={complaint} s={p(3)} />
      {frame >= tk && (
        <div style={{ alignSelf: "flex-end", width: 640, ...panel(), padding: 30, fontFamily: F.sans, ...enter(p(tk), 60, `rotate(${(1 - p(tk)) * 15 + 2}deg)`), borderStyle: "dashed" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontWeight: 700, fontSize: 44, color: C.ink }}><Icon name="ticket" size={60} color={C.red} /> {id}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            {["Keluhan", "Baru"].map((x, i) => <span key={x} style={{ padding: "6px 18px", borderRadius: 20, background: i ? C.emBg : C.ink, color: i ? C.ink : "#fff", fontWeight: 700, fontSize: 30, transform: `scale(${p(tk + 6 + i * 4)})`, display: "inline-block" }}>{x}</span>)}
          </div>
        </div>
      )}
    </div>
  );
};

// Handoff: a chat token arcs from the bot to a teammate; the status flips to a person.
export const Pass: React.FC<{ ask: string; agent: string; dur: number }> = ({ ask, agent, dur }) => {
  const { frame, p } = useT();
  const a0 = Math.round(dur * 0.4);
  const a1 = Math.round(dur * 0.62);
  const t = prog(frame, a0, a1);
  const done = frame >= a1;
  const Who: React.FC<{ icon: string; label: string; on: boolean; s: number }> = ({ icon, label, on, s }) => (
    <div style={{ width: 300, textAlign: "center", ...enter(s, 40) }}>
      <div style={{ margin: "0 auto", width: 200, height: 200, borderRadius: 100, background: on ? C.emBg : C.card, border: `6px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: on ? `0 0 60px ${C.emBg}` : cardShadow }}><Icon name={icon} size={110} color={C.ink} /></div>
      <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 38, color: C.ink, marginTop: 14 }}>{label}</div>
    </div>
  );
  return (
    <div style={{ width: 920, display: "flex", flexDirection: "column", gap: 40, ...enter(p(2), 80) }}>
      <Sfx name="ding" at={3} volume={0.45} />
      <Sfx name="whoosh" at={a0} volume={0.5} />
      <Sfx name="takeover" at={a1} volume={0.6} />
      <Sfx name="check" at={a1 + 8} volume={0.4} />
      <Bubble text={ask} s={p(3)} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", height: 300 }}>
        <Who icon="bot" label="Bot" on={!done} s={p(6)} />
        <Who icon="headset" label={agent} on={done} s={p(9)} />
        {frame >= a0 && !done && (
          <div style={{ position: "absolute", left: 110 + t * 600, top: 40 - Math.sin(t * Math.PI) * 180, width: 100, height: 100, borderRadius: 50, background: C.red, border: `5px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${t * 360}deg)` }}><Icon name="message-circle" size={56} color="#fff" /></div>
        )}
      </div>
      <div style={{ alignSelf: "center", padding: "14px 34px", borderRadius: 40, fontFamily: F.sans, fontWeight: 700, fontSize: 40, background: done ? C.ink : C.red, color: "#fff", transform: `scale(${done ? 1 + Math.sin(prog(frame, a1, a1 + 10) * Math.PI) * 0.15 : 1})` }}>{done ? "Ditangani orang" : "Bot"}</div>
    </div>
  );
};

// Night shift vs day shift: the bot minds the shop while the admin sleeps; by day the team closes the big deal.
export const Shift: React.FC<{ dur: number }> = ({ dur }) => {
  const { frame, p } = useT();
  const day = Math.round(dur * 0.55);
  const orders = [0.18, 0.28, 0.38, 0.46].map((x) => Math.round(x * dur));
  const card: React.CSSProperties = { position: "relative", width: 920, height: 480, borderRadius: 34, border: `6px solid ${C.ink}`, overflow: "hidden", boxShadow: cardShadow };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {orders.map((f, i) => <Sfx key={i} name="cash" at={f} volume={0.3} />)}
      <Sfx name="whip" at={day - 4} volume={0.5} />
      <Sfx name="ring" at={day + 10} volume={0.45} />
      <Sfx name="coin" at={day + 18} volume={0.5} />
      <div style={{ ...card, background: "linear-gradient(180deg, #0B0F19, #1F2937)", ...enter(p(2), 60) }}>
        <div style={{ position: "absolute", left: 40, top: 30 }}><Icon name="moon" size={90} color={C.emBg} /></div>
        {Array.from({ length: 12 }, (_, i) => <div key={i} style={{ position: "absolute", left: random(`sx${i}`) * 900, top: random(`sy${i}`) * 200, width: 6, height: 6, borderRadius: 3, background: "#fff", opacity: 0.3 + 0.7 * Math.abs(Math.sin(frame / 8 + i)) }} />)}
        <div style={{ position: "absolute", left: 60, bottom: 40 }}>
          <Icon name="bed-double" size={220} color="#ffffff66" stroke={1.4} />
          <div style={{ position: "absolute", right: -10, top: -30 - ((frame % 40) / 40) * 60, fontFamily: F.stamp, fontSize: 70, color: C.emBg, opacity: Math.sin(((frame % 40) / 40) * Math.PI) }}>Z</div>
        </div>
        <div style={{ position: "absolute", right: 70, bottom: 40, width: 330, height: 330, borderRadius: 24, background: C.emBg, border: `6px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(frame / 6) * 3}deg)` }}>
          <Icon name="bot" size={200} color={C.ink} />
        </div>
        {orders.map((f, i) => frame >= f && (
          <div key={i} style={{ position: "absolute", right: 60 + (i % 2) * 220, top: 40 + (i % 2) * 30, transform: `translateY(${-prog(frame, f, f + 20) * 30}px) scale(${p(f)})`, opacity: interpolate(frame, [f + 20, f + 30], [1, 0.35], clamp) }}><Icon name="shopping-bag" size={80} color="#fff" /></div>
        ))}
      </div>
      <div style={{ ...card, background: "linear-gradient(180deg, #FEF9C3, #F7FEE7)", transform: `translateX(${(1 - prog(frame, day - 4, day + 6)) * 1100}px)` }}>
        <div style={{ position: "absolute", right: 40, top: 30, transform: `rotate(${frame * 2}deg)` }}><Icon name="sun" size={110} color="#CA8A04" /></div>
        <div style={{ position: "absolute", left: 60, bottom: 60, display: "flex", gap: 30, alignItems: "flex-end" }}>
          <Icon name="users" size={200} color={C.ink} />
          <div style={{ transform: `scale(${p(day + 10)}) rotate(${Math.sin(frame / 5) * 6}deg)` }}><Icon name="handshake" size={180} color={C.red} /></div>
          <div style={{ transform: `scale(${p(day + 18)}) translateY(${Math.sin(frame / 6) * 8}px)` }}><Icon name="trophy" size={160} color="#CA8A04" /></div>
        </div>
      </div>
    </div>
  );
};

// CTA: the keyword is typed into a comment box and posted, then a DM with the link arrives.
export const Comment: React.FC<{ keyword: string; dm: string; dur: number }> = ({ keyword, dm, dur }) => {
  const { frame, p } = useT();
  const t0 = Math.round(dur * 0.36);
  const sent = t0 + keyword.length * 2 + 6;
  const dmAt = Math.round(dur * 0.78);
  const ghost = (w: number) => <div style={{ height: 22, width: w, borderRadius: 11, background: C.ghost }} />;
  return (
    <div style={{ width: 920, position: "relative", ...enter(p(2), 80) }}>
      {keyword.split("").map((_, i) => <Sfx key={i} name="type" at={t0 + i * 2} volume={0.35} />)}
      <Sfx name="tap" at={sent - 2} volume={0.5} />
      <Sfx name="pop" at={sent} volume={0.5} />
      <Sfx name="ring" at={sent + 8} volume={0.35} />
      <Sfx name="buzz" at={dmAt - 2} volume={0.4} />
      <Sfx name="ding" at={dmAt} volume={0.5} />
      <div style={{ ...panel(), padding: 30, display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 40, color: C.ink, textAlign: "center" }}>Komentar</div>
        {[0, 1].map((i) => (
          <div key={i} style={{ display: "flex", gap: 18, alignItems: "center", opacity: 0.6 }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: C.ghost }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{ghost(180)}{ghost(420 - i * 90)}</div>
          </div>
        ))}
        {frame >= sent && (
          <div style={{ display: "flex", gap: 18, alignItems: "center", padding: 14, borderRadius: 20, background: `${C.emBg}55`, ...enter(p(sent), 30) }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: C.red, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="user" size={40} color="#fff" /></div>
            <div style={{ flex: 1, fontFamily: F.stamp, fontSize: 64, color: C.ink }}>{keyword}</div>
            <div style={{ transform: `scale(${1 + Math.sin(prog(frame, sent + 8, sent + 18) * Math.PI) * 0.6})` }}><Icon name="heart" size={56} color={frame >= sent + 8 ? DANGER : C.muted} /></div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 26px", borderRadius: 40, border: `4px solid ${C.ink}`, fontFamily: F.stamp, fontSize: 52, color: C.ink, minHeight: 60 }}>
          <span style={{ flex: 1 }}>{frame < sent ? keyword.slice(0, Math.max(0, Math.floor((frame - t0) / 2))) : ""}{frame < sent && frame % 16 < 8 ? "|" : ""}</span>
          <div style={{ transform: `scale(${frame >= sent - 4 && frame < sent ? 0.8 : 1})` }}><Icon name="send" size={46} color={C.red} /></div>
        </div>
      </div>
      {frame >= dmAt && (
        <div style={{ position: "absolute", left: 30, right: 30, top: -190, display: "flex", gap: 18, alignItems: "center", padding: "20px 26px", borderRadius: 28, background: C.ink, color: "#fff", fontFamily: F.sans, boxShadow: cardShadow, transform: `translateY(${(1 - p(dmAt)) * -200}px)`, opacity: Math.min(1, p(dmAt) * 2) }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: C.emBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="message-circle" size={48} color={C.ink} /></div>
          <div><div style={{ fontWeight: 700, fontSize: 32 }}>Melichat</div><div style={{ fontSize: 30, opacity: 0.85 }}>{dm}</div></div>
        </div>
      )}
    </div>
  );
};

// Order journey rail at the bottom of the frame: the scene's step lights up, earlier steps are checked.
export const Rail: React.FC<{ steps: string[]; active: number }> = ({ steps, active }) => {
  const { frame, p } = useT();
  const fill = interpolate(frame, [4, 14], [Math.max(0, active - 1), active], { ...clamp, easing: ease }) / (steps.length - 1);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, bottom: 70, height: 130 }}>
      <Sfx name="check" at={14} volume={0.3} />
      <div style={{ position: "absolute", left: 40, right: 40, top: 34, height: 10, borderRadius: 5, background: "#0000001f" }} />
      <div style={{ position: "absolute", left: 40, top: 34, height: 10, borderRadius: 5, width: `calc((100% - 80px) * ${fill})`, background: C.red }} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
        {steps.map((s, i) => {
          const on = i === active;
          const k = on ? p(12) : 1;
          return (
            <div key={i} style={{ width: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 78, height: 78, borderRadius: 39, border: `5px solid ${C.ink}`, background: i < active ? C.red : on && k > 0.3 ? C.emBg : C.card, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${on ? 0.8 + 0.4 * k - (k > 0.9 ? 0.1 * Math.sin(frame / 5) : 0) : 0.85})` }}>
                {i < active ? <Icon name="check" size={40} color="#fff" stroke={3} /> : <span style={{ fontFamily: F.stamp, fontSize: 40, color: C.ink }}>{i + 1}</span>}
              </div>
              <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 26, color: on ? C.ink : C.muted, whiteSpace: "nowrap" }}>{s}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
