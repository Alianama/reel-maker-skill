// "Kenapa marketplace banyak yang tutup" visuals. Timing props are seconds from the start of the visual (matched to the VO).
import { Img, interpolate, staticFile } from "remotion";
import { Coin, Deco, Particles, Spark, float, grow, squash, stamp, swing, useT } from "./PriceUI";
import { Prod } from "./ShopUI";
import { Sfx } from "./sfx";
import { C, F, clamp } from "./theme";
import { Icon } from "./Visuals";

const ease = { ...clamp, easing: (x: number) => 1 - (1 - x) ** 3 };
const FIRE = "#F97316";

// Storefront: name board, striped awning, window + door; `shut` 0..1 rolls the shutter down, `dim` greys it out.
export const Store: React.FC<{ name: string; logo?: string; color: string; w: number; shut?: number; dim?: number; lit?: boolean; children?: React.ReactNode }> = ({ name, logo, color, w, shut = 0, dim = 0, lit, children }) => {
  const { frame } = useT();
  const body = 330;
  return (
    <div style={{ width: w, position: "relative", filter: `grayscale(${dim}) brightness(${1 - dim * 0.25})` }}>
      <div style={{ height: 96, background: C.card, border: `6px solid ${C.ink}`, borderRadius: "22px 22px 0 0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.stamp, fontSize: name.length > 9 ? 44 : 54, color: C.ink, overflow: "hidden", padding: logo ? 8 : 0, boxShadow: lit ? `0 0 ${30 + Math.sin(frame / 4) * 12}px ${C.emBg}` : "none" }}>{logo ? <Img src={staticFile(logo)} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : name}</div>
      <div style={{ height: 70, borderLeft: `6px solid ${C.ink}`, borderRight: `6px solid ${C.ink}`, borderBottom: `6px solid ${C.ink}`, background: `repeating-linear-gradient(90deg, ${color} 0 44px, #fff 44px 88px)`, borderRadius: "0 0 26px 26px" }} />
      <div style={{ height: body, margin: "0 16px", background: "#FFFBEB", borderLeft: `6px solid ${C.ink}`, borderRight: `6px solid ${C.ink}`, borderBottom: `6px solid ${C.ink}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 22, top: 40, width: w * 0.42, height: 150, background: lit === false ? "#D1D5DB" : "#BAE6FD", border: `5px solid ${C.ink}`, borderRadius: 10 }} />
        <div style={{ position: "absolute", right: 26, bottom: 0, width: w * 0.28, height: 220, background: color, border: `5px solid ${C.ink}`, borderBottom: "none", borderRadius: "12px 12px 0 0" }} />
        {children}
        <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: body * shut, background: `repeating-linear-gradient(180deg, #9CA3AF 0 18px, #6B7280 18px 22px)`, borderBottom: shut > 0 ? `8px solid ${C.ink}` : "none" }} />
      </div>
    </div>
  );
};

type ShopDef = { name: string; logo?: string; color: string; close?: number; half?: boolean; sign?: string; signAt?: number; open?: boolean };

// ── Hook / roll call / ending: a row of storefronts; shutters slam down one by one, one keeps a blinking BUKA sign.
export const Lapak: React.FC<{ shops: ShopDef[]; ask?: number }> = ({ shops, ask }) => {
  const { frame, f, sp } = useT();
  const n = shops.length, gap = 26, w = n === 3 ? 296 : 400;
  const x0 = (960 - (n * w + (n - 1) * gap)) / 2;
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="lpk" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      <div style={{ position: "absolute", left: 20, right: 20, top: 868, height: 10, background: C.ink, borderRadius: 6 }} />
      {shops.map((s, i) => {
        const a = sp(0.05 + i * 0.12, 10);
        const c = s.close == null ? -1 : f(s.close);
        const shut = c < 0 ? 0 : interpolate(frame, [c, c + 10], [0, s.half ? 0.62 : 1], ease);
        const land = c + 10;
        const sa = s.signAt == null ? -1 : f(s.signAt);
        const x = x0 + i * (w + gap);
        return (
          <div key={i}>
            <Sfx name="pop" at={f(0.05 + i * 0.12) + 2} volume={0.35} />
            {c >= 0 && <><Sfx name="slide" at={c} volume={0.45} /><Sfx name="stamp" at={land} volume={0.55} /></>}
            {sa >= 0 && <Sfx name={s.open ? "check" : "ding"} at={sa} volume={0.5} />}
            <div style={{ position: "absolute", left: x, top: 868 - 520, transformOrigin: "50% 100%", transform: `${c >= 0 ? squash(frame, land, 0.1) : ""} rotate(${s.open ? Math.sin(frame / 9) * 1.2 : 0}deg)`, ...grow(a, 120) }}>
              <Store name={s.name} logo={s.logo} color={s.color} w={w} shut={shut} dim={c >= 0 && !s.half ? interpolate(frame, [land, land + 12], [0, 0.85], clamp) : 0} lit={s.open ? true : c >= 0 && frame > land ? false : undefined} />
              {c >= 0 && !s.half && frame >= land + 4 && (
                <div style={{ position: "absolute", left: 0, right: 0, top: 280, display: "flex", justifyContent: "center" }}>
                  <div style={stamp(sp((land + 4) / 30, 9), -10, w > 300 ? 72 : 56)}>TUTUP</div>
                </div>
              )}
              {sa >= 0 && frame >= sa && !s.open && (
                <div style={{ position: "absolute", left: w / 2 - 110, top: 380, width: 220, transformOrigin: "50% -40px", transform: `rotate(${swing(frame, [sa], 16)}deg)`, ...grow(sp(s.signAt!, 9), 30) }}>
                  <div style={{ background: C.emBg, border: `6px solid ${C.ink}`, borderRadius: 16, textAlign: "center", fontFamily: F.stamp, fontSize: 62, color: C.ink, boxShadow: `6px 6px 0 ${C.ink}` }}>{s.sign}</div>
                </div>
              )}
              {s.open && sa >= 0 && frame >= sa && (
                <div style={{ position: "absolute", left: w / 2 - 140, top: 250, width: 280, textAlign: "center", fontFamily: F.stamp, fontSize: 84, color: C.ink, background: C.emBg, border: `7px solid ${C.ink}`, borderRadius: 20, opacity: (frame - sa) % 18 < 13 ? 1 : 0.45, ...grow(sp(s.signAt!, 8), 20) }}>BUKA</div>
              )}
            </div>
            {s.open && sa >= 0 && <Particles at={sa + 2} n={14} seed={`lpk${i}`} x={x + w / 2} y={560} speed={14} item={(k) => (k % 3 ? <Spark size={40} /> : <Coin size={56} />)} />}
          </div>
        );
      })}
      {ask != null && frame >= f(ask) && (
        <>
          <Sfx name="beat" at={f(ask)} volume={0.5} />
          <div style={{ position: "absolute", left: 400, top: 40 + float(frame, 0, 14), fontFamily: F.stamp, fontSize: 260, lineHeight: 1, color: C.ink, WebkitTextStroke: `4px ${C.ink}`, textShadow: `10px 10px 0 ${C.emBg}`, transform: `rotate(${swing(frame, [f(ask)], 18)}deg)`, ...grow(sp(ask, 7), 60) }}>?</div>
        </>
      )}
    </div>
  );
};

const Bill: React.FC<{ burnt?: number }> = ({ burnt = 0 }) => (
  <div style={{ width: 170, height: 86, background: "#86EFAC", border: `5px solid ${C.ink}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", filter: `brightness(${1 - burnt * 0.7})` }}>
    <div style={{ width: 54, height: 54, borderRadius: "50%", border: `4px solid ${C.ink}`, fontFamily: F.stamp, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", background: "#DCFCE7" }}>Rp</div>
  </div>
);

const Flame: React.FC<{ s: number }> = ({ s }) => {
  const { frame } = useT();
  return (
    <svg width={380} height={460} viewBox="0 0 100 120" style={{ overflow: "visible", transformOrigin: "50% 100%", transform: `scale(${s * (1 + Math.sin(frame / 3) * 0.05)}, ${s * (1 + Math.cos(frame / 2.3) * 0.08)}) skewX(${Math.sin(frame / 5) * 5}deg)` }}>
      <path d="M50 2 C70 30 92 48 88 80 C85 104 68 118 50 118 C32 118 14 104 12 80 C10 56 30 44 34 22 C42 36 44 42 50 2Z" fill={FIRE} stroke={C.ink} strokeWidth={3} />
      <path d="M50 40 C62 58 72 70 70 88 C68 104 60 112 50 112 C40 112 32 104 30 90 C30 76 40 70 50 40Z" fill="#FDE047" stroke={C.ink} strokeWidth={2.5} />
    </svg>
  );
};

// ── 1. Burning money: a pile of bills catches fire, promo stickers slap on, an investor briefcase keeps feeding it.
export const Burn: React.FC<{ ignite: number; tags: { text: string; at: number }[]; investor: number }> = ({ ignite, tags, investor }) => {
  const { frame, f, sp } = useT();
  const ig = f(ignite), inv = f(investor);
  const fire = sp(ignite, 8);
  const pile = [[300, 760], [470, 760], [640, 760], [385, 690], [555, 690], [470, 620]];
  const flyN = 6;
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="brn" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      {pile.map((_, i) => <Sfx key={i} name="pop" at={4 + i * 3} volume={0.25} />)}
      <Sfx name="boom" at={ig} volume={0.45} />
      <Sfx name="punch" at={ig} volume={0.4} />
      {Array.from({ length: 6 }, (_, k) => <Sfx key={`t${k}`} name="tick" at={ig + 8 + k * 9} volume={0.12} />)}
      {tags.map((t, i) => <Sfx key={`g${i}`} name="stamp" at={f(t.at)} volume={0.45} />)}
      <Sfx name="cash" at={inv} volume={0.5} />
      {Array.from({ length: flyN }, (_, k) => <Sfx key={`c${k}`} name="coin" at={inv + 6 + k * 6} volume={0.3} />)}
      {frame >= ig && <div style={{ position: "absolute", left: 470 - 190, top: 800 - 460 }}><Flame s={fire} /></div>}
      {pile.map(([x, y], i) => {
        const burnt = interpolate(frame, [ig + i * 6, ig + i * 6 + 40], [0, 1], clamp);
        return <div key={i} style={{ position: "absolute", left: x - 85, top: y - 43, transform: `rotate(${(i % 2 ? 6 : -5) + float(frame, i, 2)}deg) scale(${1 - burnt * 0.35})`, ...grow(sp(0.13 + i * 0.1, 11), 60) }}><Bill burnt={burnt} /></div>;
      })}
      {frame >= ig && Array.from({ length: 10 }, (_, k) => <Particles key={k} at={ig + k * 10} n={4} seed={`emb${k}`} x={470} y={560} speed={6} up={14} g={0.3} life={34} item={(j) => <Spark size={j % 2 ? 26 : 34} color={j % 2 ? FIRE : "#FDE047"} />} />)}
      {tags.map((t, i) => {
        const s = sp(t.at, 8);
        if (frame < f(t.at)) return null;
        return (
          <div key={i} style={{ position: "absolute", left: i % 2 ? 560 : 40, top: i % 2 ? 330 : 250, transformOrigin: "50% 0", transform: `rotate(${(i % 2 ? 8 : -9) + swing(frame, [f(t.at)], 10)}deg) scale(${interpolate(s, [0, 1], [2.2, 1])})`, opacity: Math.min(1, s * 2) }}>
            <div style={{ fontFamily: F.stamp, fontSize: 64, padding: "10px 28px", background: C.emBg, color: C.ink, border: `7px solid ${C.ink}`, borderRadius: 20, boxShadow: `8px 8px 0 ${C.ink}`, whiteSpace: "nowrap" }}>{t.text}</div>
          </div>
        );
      })}
      {frame >= inv && (
        <>
          <div style={{ position: "absolute", left: 60, top: 470, transform: `rotate(${interpolate(frame, [inv, inv + 10], [0, 28], ease)}deg)`, ...grow(sp(investor, 9), 60) }}>
            <div style={{ width: 200, height: 140, background: "#92400E", border: `6px solid ${C.ink}`, borderRadius: 18, position: "relative", boxShadow: `8px 8px 0 ${C.ink}` }}>
              <div style={{ position: "absolute", left: 66, top: -34, width: 68, height: 34, border: `6px solid ${C.ink}`, borderBottom: "none", borderRadius: "14px 14px 0 0" }} />
              <div style={{ position: "absolute", left: 82, top: 50, width: 36, height: 26, background: "#FDE047", border: `4px solid ${C.ink}`, borderRadius: 6 }} />
            </div>
          </div>
          {Array.from({ length: flyN }, (_, k) => {
            const t = interpolate(frame, [inv + 6 + k * 6, inv + 26 + k * 6], [0, 1], clamp);
            if (t <= 0 || t >= 1) return null;
            return <div key={k} style={{ position: "absolute", left: 220 + t * 250, top: 500 - Math.sin(t * Math.PI) * 220 + t * 120, transform: `rotate(${t * 360}deg) scale(0.6)` }}><Bill /></div>;
          })}
        </>
      )}
    </div>
  );
};

const SHOP_COLORS = ["#5AA8F0", "#F4A261", "#F472B6"];
const Mini: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ width: 150, height: 130, background: C.card, border: `6px solid ${C.ink}`, borderRadius: 18, boxShadow: `6px 6px 0 ${C.ink}`, overflow: "hidden" }}>
    <div style={{ height: 38, background: `repeating-linear-gradient(90deg, ${color} 0 24px, #fff 24px 48px)`, borderBottom: `5px solid ${C.ink}` }} />
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}><Icon name="store" size={64} color={C.ink} stroke={2.2} /></div>
  </div>
);

// ── 2. Coin stacks drain; the thinnest one runs dry and its shop topples off.
export const Topple: React.FC<{ drain: number; fall: number }> = ({ drain, fall }) => {
  const { frame, f, sp } = useT();
  const init = [10, 7, 4], step = 7, base = 840, h = 32;
  const d = f(drain), fl = f(fall);
  const cnt = (i: number) => Math.max(init[i] - 4, init[i] - Math.max(0, Math.floor((frame - d) / step) + (frame >= d ? 1 : 0)));
  const xs = [190, 480, 770];
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="tpl" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      {[0, 1, 2].map((i) => <Sfx key={i} name="pop" at={4 + i * 4} volume={0.3} />)}
      {[0, 1, 2, 3].map((k) => <Sfx key={`k${k}`} name="coin" at={d + k * step} volume={0.35} />)}
      <Sfx name="error" at={fl - 4} volume={0.3} />
      <Sfx name="whoosh" at={fl} volume={0.5} />
      <Sfx name="punch" at={fl + 14} volume={0.55} />
      <div style={{ position: "absolute", left: 30, right: 30, top: base + 24, height: 10, background: C.ink, borderRadius: 6 }} />
      {xs.map((x, i) => {
        const c = cnt(i);
        const a = sp(0.05 + i * 0.12, 10);
        const top = base - c * h - 130;
        const tipping = i === 2 && frame >= fl;
        const t = frame - fl;
        const rot = tipping ? interpolate(t, [0, 12], [0, 100], ease) + Math.max(0, t - 12) * 6 : float(frame, i, 3);
        const dy = tipping ? Math.max(0, t - 6) ** 2 * 1.6 : 0;
        return (
          <div key={i} style={{ ...grow(a, 80) }}>
            {Array.from({ length: c }, (_, k) => (
              <div key={k} style={{ position: "absolute", left: x - 85, top: base - (k + 1) * h, width: 170, height: 46, borderRadius: "50%", background: C.emBg, border: `5px solid ${C.ink}`, boxShadow: "inset 0 -10px 0 #84CC16" }} />
            ))}
            {frame >= d && frame < d + 4 * step + 10 && <Particles at={d + Math.floor((frame - d) / step) * step} n={2} seed={`tp${i}${Math.floor((frame - d) / step)}`} x={x} y={top + 130} speed={10} up={12} life={20} item={() => <Coin size={46} />} />}
            <div style={{ position: "absolute", left: x - 75 + (tipping ? Math.min(t, 20) * 6 : 0), top: top + dy, transformOrigin: "100% 100%", transform: `rotate(${rot}deg)` }}><Mini color={SHOP_COLORS[i]} /></div>
          </div>
        );
      })}
      <Particles at={fl + 14} n={10} seed="dust" x={850} y={base} speed={9} up={8} g={0.4} life={30} item={() => <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#D6D3D1", border: `4px solid ${C.ink}` }} />} />
    </div>
  );
};

const Person: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ width: 56, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FDE7C8", border: `5px solid ${C.ink}` }} />
    <div style={{ width: 56, height: 58, marginTop: -4, borderRadius: "22px 22px 8px 8px", background: color, border: `5px solid ${C.ink}` }} />
  </div>
);

// ── 3. Crowd: shoppers flock to the busy shop, it grows; the quiet shop loses its last few and goes grey.
export const Crowd: React.FC<{ pick: number; grow: number; leave: number }> = ({ pick, grow: g, leave }) => {
  const { frame, f, sp } = useT();
  const pk = f(pick), gr = f(g), lv = f(leave);
  const cols = ["#5AA8F0", "#F4A261", "#F472B6", C.emBg, "#FDE047", "#A78BFA"];
  // [startX, startY, endX, endY, moveAt]
  const people = [
    ...Array.from({ length: 8 }, (_, i) => [130 + i * 95, 880 + (i % 2) * 20, 90 + (i % 4) * 75, 770 + Math.floor(i / 4) * 70, pk + i * 3]),
    ...Array.from({ length: 4 }, (_, i) => [-80, 880, 380 - (i % 2) * 60, 770 + Math.floor(i / 2) * 70 - 20, gr + i * 4]),
    ...Array.from({ length: 3 }, (_, i) => [640 + i * 80, 800, 460 - i * 70, 860, lv + 6 + i * 5]),
  ];
  const big = 1 + (frame >= gr ? (sp(g, 8) * 0.14) : 0);
  const quiet = interpolate(frame, [lv + 20, lv + 34], [0, 0.85], clamp);
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="crw" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      <Sfx name="pop" at={4} volume={0.3} />
      <Sfx name="pop" at={9} volume={0.3} />
      {[0, 1, 2, 3].map((k) => <Sfx key={k} name="tap" at={pk + k * 6} volume={0.3} />)}
      <Sfx name="coin" at={gr} volume={0.45} />
      <Sfx name="boom" at={gr + 2} volume={0.3} />
      <Sfx name="slide" at={lv + 6} volume={0.4} />
      <Sfx name="error" at={lv + 22} volume={0.35} />
      <div style={{ position: "absolute", left: 20, right: 20, top: 930, height: 10, background: C.ink, borderRadius: 6 }} />
      <div style={{ position: "absolute", left: 30, top: 900 - 520 * big, transformOrigin: "50% 100%", transform: `scale(${big})`, ...grow(sp(0.05, 10), 100) }}>
        <Store name="RAME" color={C.emBg} w={400} lit />
      </div>
      <div style={{ position: "absolute", left: 590, top: 900 - 520 * 0.82, transformOrigin: "0 0", transform: `scale(0.82) rotate(${quiet ? Math.sin(frame / 12) * 1 : 0}deg)`, ...grow(sp(0.2, 10), 100) }}>
        <Store name="SEPI" color="#D1D5DB" w={400} dim={quiet} lit={quiet ? false : undefined} />
      </div>
      <Particles at={gr + 2} n={14} seed="crwB" x={230} y={420} speed={14} item={(i) => (i % 2 ? <Spark size={40} /> : <Coin size={52} />)} />
      {people.map(([sx, sy, ex, ey, m], i) => {
        const t = interpolate(frame, [m, m + 22], [0, 1], ease);
        const walking = t > 0 && t < 1;
        const startShown = i < 8 || i >= 12 || frame >= m;
        if (!startShown) return null;
        const x = sx + (ex - sx) * t, y = sy + (ey - sy) * t - (walking ? Math.abs(Math.sin(frame / 2.5 + i)) * 18 : 0);
        return <div key={i} style={{ position: "absolute", left: x, top: y - 100, transform: `scaleX(${ex < sx && walking ? -1 : 1})`, opacity: i < 8 ? Math.min(1, sp(0.1 + i * 0.04, 12) * 2) : 1 }}><Person color={cols[i % cols.length]} /></div>;
      })}
    </div>
  );
};

// ── 4. Nobody searches any more: a search bar types, then goes grey, the magnifier drops, a cobweb grows.
export const Search: React.FC<{ typing: [number, number]; stop: number }> = ({ typing: type, stop }) => {
  const { frame, f, sp } = useT();
  const q = "sepatu putih";
  const n = Math.round(interpolate(frame, [f(type[0]), f(type[1])], [0, q.length], clamp));
  const st = f(stop);
  const dead = interpolate(frame, [st, st + 10], [0, 1], clamp);
  const drop = Math.max(0, frame - st) ** 2 * 1.4;
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="src" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      {Array.from({ length: q.length / 2 }, (_, k) => <Sfx key={k} name="type" at={f(type[0]) + Math.round((k * 2 * (f(type[1]) - f(type[0]))) / q.length)} volume={0.35} />)}
      {[0, 1, 2].map((k) => <Sfx key={`r${k}`} name="pop" at={f(type[1]) + 3 + k * 4} volume={0.3} />)}
      <Sfx name="error" at={st} volume={0.4} />
      <Sfx name="whoosh" at={st + 2} volume={0.35} />
      <Sfx name="punch" at={st + 18} volume={0.4} />
      <div style={{ position: "absolute", left: 50, top: 170, width: 860, filter: `grayscale(${dead})`, transform: `rotate(${dead * -3}deg) translateY(${dead * 30}px)`, ...grow(sp(0.05, 10), 80) }}>
        <div style={{ height: 130, background: C.card, border: `7px solid ${C.ink}`, borderRadius: 70, boxShadow: `10px 10px 0 ${C.ink}`, display: "flex", alignItems: "center", padding: "0 40px", gap: 26 }}>
          <div style={{ width: 70, transform: `translateY(${drop}px) rotate(${Math.min(drop, 200)}deg)` }}><Icon name="search" size={70} color={C.ink} stroke={2.6} /></div>
          <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 60, color: C.ink }}>{q.slice(0, n)}<span style={{ opacity: frame % 16 < 8 && !dead ? 1 : 0 }}>|</span></div>
        </div>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ marginTop: 30, height: 150, background: C.card, border: `6px solid ${C.ink}`, borderRadius: 26, display: "flex", alignItems: "center", gap: 26, padding: "0 26px", ...grow(sp(type[1] + 0.1 + k * 0.13, 11), 40) }}>
            <div style={{ width: 100, height: 100, borderRadius: 16, background: SHOP_COLORS[k], border: `5px solid ${C.ink}` }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 26, width: "80%", background: "#E5E7EB", borderRadius: 13 }} />
              <div style={{ height: 26, width: "45%", background: C.emBg, borderRadius: 13, marginTop: 18 }} />
            </div>
          </div>
        ))}
      </div>
      {frame >= st && (
        <svg width={300} height={300} viewBox="0 0 100 100" style={{ position: "absolute", right: 30, top: 140, transform: `scale(${sp(stop + 0.2, 12)})`, transformOrigin: "100% 0" }}>
          {[0, 22, 45, 68, 90].map((a) => <line key={a} x1={100} y1={0} x2={100 - Math.cos((a * Math.PI) / 180) * 100} y2={Math.sin((a * Math.PI) / 180) * 100} stroke={C.ink} strokeWidth={1.6} />)}
          {[30, 55, 80].map((r) => <path key={r} d={`M ${100 - r} 0 Q ${100 - r * 0.75} ${r * 0.3} ${100 - r * 0.7} ${r * 0.7} Q ${100 - r * 0.3} ${r * 0.75} 100 ${r}`} fill="none" stroke={C.ink} strokeWidth={1.6} />)}
        </svg>
      )}
    </div>
  );
};

// ── 5. Phone feed: swipe, swipe, LIVE starts, yellow basket appears, cursor taps → CHECKOUT.
export const Feed: React.FC<{ live: number; buy: number }> = ({ live, buy }) => {
  const { frame, f, sp } = useT();
  const swipes = [0.25, 0.65, 1.05].filter((t) => t < live);
  const off = swipes.reduce((a, t) => a + sp(t, 14) * 760, 0);
  const lv = f(live), by = f(buy);
  const cards = [["#5AA8F0", "shirt"], ["#F472B6", "sparkles"], ["#FDE047", "footprints"], [C.emBg, "shopping-bag"]];
  const cart = sp(live + 0.5, 9);
  const btn = { x: 600, y: 760 };
  const k = interpolate(frame, [by - 14, by - 2], [0, 1], ease);
  const cx = 900 + (btn.x - 900) * k, cy = 960 + (btn.y - 960) * k;
  const press = interpolate(frame, [by - 2, by, by + 6], [1, 0.85, 1], clamp);
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="fed" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      {swipes.map((t, i) => <Sfx key={i} name="slide" at={f(t)} volume={0.4} />)}
      <Sfx name="ding" at={lv} volume={0.5} />
      {[0, 1, 2, 3].map((j) => <Sfx key={`h${j}`} name="pop" at={lv + 6 + j * 8} volume={0.25} />)}
      <Sfx name="blip" at={f(live + 0.5)} volume={0.4} />
      <Sfx name="tap" at={by} volume={0.6} />
      <Sfx name="cash" at={by + 3} volume={0.5} />
      <Sfx name="stamp" at={by + 8} volume={0.5} />
      <div style={{ position: "absolute", left: 230, top: 20, width: 500, height: 920, background: C.ink, borderRadius: 64, padding: 18, boxShadow: `14px 14px 0 ${C.emBg}`, ...grow(sp(0.02, 11), 100) }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 48, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: -off, width: "100%" }}>
            {cards.map(([bg, icon], i) => (
              <div key={i} style={{ height: 760, background: bg, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `6px solid ${C.ink}` }}>
                <div style={{ transform: `scale(${1 + Math.sin(frame / 8 + i) * 0.06})` }}><Icon name={icon} size={220} color={C.ink} stroke={1.8} /></div>
              </div>
            ))}
          </div>
          {frame >= lv && (
            <div style={{ position: "absolute", left: 26, top: 30, display: "flex", gap: 12, alignItems: "center", ...grow(sp(live, 8), 20) }}>
              <div style={{ background: "#EF4444", color: "#fff", fontFamily: F.stamp, fontSize: 42, padding: "4px 18px", borderRadius: 10, border: `4px solid ${C.ink}`, transform: `scale(${1 + Math.sin(frame / 4) * 0.06})` }}>LIVE</div>
              <div style={{ background: "#0008", color: "#fff", fontFamily: F.sans, fontWeight: 700, fontSize: 34, padding: "6px 16px", borderRadius: 10, display: "flex", gap: 8, alignItems: "center" }}><Icon name="eye" size={34} color="#fff" />{(1200 + Math.max(0, frame - lv) * 37).toLocaleString("id-ID")}</div>
            </div>
          )}
          {frame >= lv && (
            <div style={{ position: "absolute", left: 24, bottom: 40, width: 270, height: 110, background: C.card, border: `5px solid ${C.ink}`, borderRadius: 20, display: "flex", alignItems: "center", gap: 14, padding: "0 14px", ...grow(cart, 40) }}>
              <div style={{ width: 76, height: 76, borderRadius: 14, background: "#FDE047", border: `4px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="footprints" size={48} color={C.ink} /></div>
              <div style={{ fontFamily: F.stamp, fontSize: 38, color: C.ink }}>Rp89rb</div>
            </div>
          )}
          {frame >= lv && (
            <div style={{ position: "absolute", right: 30, bottom: 50, width: 110, height: 110, borderRadius: 26, background: "#FACC15", border: `6px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${press})`, ...grow(cart, 40) }}>
              <Icon name="shopping-cart" size={64} color={C.ink} stroke={2.4} />
            </div>
          )}
        </div>
      </div>
      {frame >= lv && Array.from({ length: 6 }, (_, j) => <Particles key={j} at={lv + 4 + j * 8} n={2} seed={`hrt${j}`} x={640} y={640} speed={3} up={10} g={0.05} life={36} item={() => <Icon name="heart" size={44} color="#EF4444" stroke={2.6} />} />)}
      {frame >= by - 14 && <div style={{ position: "absolute", left: cx - 10, top: cy - 6 }}><Icon name="mouse-pointer-2" size={90} color={C.ink} stroke={2.2} /></div>}
      <Particles at={by + 3} n={12} seed="buy" x={btn.x} y={btn.y} speed={13} item={(i) => (i % 2 ? <Coin size={56} /> : <Spark size={36} />)} />
      {frame >= by + 8 && <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", justifyContent: "center" }}><div style={stamp(sp((by + 8) / 30, 9), -8, 120)}>CHECKOUT</div></div>}
    </div>
  );
};

// ── 6. Discount trap: stickers keep slapping on the price, the profit bar beside it drains to zero.
export const Diskon: React.FC<{ at: number[]; empty: number }> = ({ at, empty }) => {
  const { frame, f, sp } = useT();
  const prices = ["Rp100rb", "Rp90rb", "Rp70rb", "Rp40rb"];
  const cuts = ["-10%", "-30%", "-60%"];
  const idx = at.filter((t) => frame >= f(t)).length;
  const levels = [1, 0.7, 0.38, 0.12];
  const em = f(empty);
  const lvl = frame >= em ? interpolate(frame, [em, em + 12], [levels[idx], 0], clamp) : interpolate(frame, [f(at[idx - 1] ?? 0), f(at[idx - 1] ?? 0) + 10], [levels[Math.max(0, idx - 1)], levels[idx]], clamp);
  const barC = lvl < 0.3 ? "#EF4444" : C.emBg;
  const shake = frame >= em ? Math.sin(frame * 1.8) * Math.max(0, 14 - (frame - em) * 0.4) : 0;
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="dsk" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      <Sfx name="pop" at={5} volume={0.3} />
      {at.map((t, i) => <Sfx key={i} name="stamp" at={f(t)} volume={0.5} />)}
      {at.map((t, i) => <Sfx key={`t${i}`} name="tick" at={f(t) + 6} volume={0.3} />)}
      <Sfx name="error" at={em} volume={0.45} />
      <div style={{ position: "absolute", left: 60, top: 300, ...grow(sp(0.05, 10), 80) }}><Prod kind="box" size={380} /></div>
      <div style={{ position: "absolute", left: 120, top: 150, transformOrigin: "50% 0", transform: `rotate(${swing(frame, at.map(f), 10) - 4}deg)`, ...grow(sp(0.15, 9), 40) }}>
        <div style={{ fontFamily: F.stamp, fontSize: 80, padding: "8px 30px", background: C.card, color: C.ink, border: `7px solid ${C.ink}`, borderRadius: 18, boxShadow: `8px 8px 0 ${C.ink}` }}>{prices[idx]}</div>
      </div>
      {at.map((t, i) => frame >= f(t) && (
        <div key={i} style={{ position: "absolute", left: [40, 260, 130][i], top: [470, 560, 680][i] }}>
          <div style={{ ...stamp(sp(t, 8), [-14, 10, -6][i], 78), background: "#FDE047" }}>{cuts[i]}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 640, top: 140, width: 240, transform: `translateX(${shake}px)`, ...grow(sp(0.25, 10), 80) }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><Icon name="piggy-bank" size={140} color={C.ink} stroke={2} /></div>
        <div style={{ height: 560, border: `7px solid ${C.ink}`, borderRadius: 30, background: C.card, position: "relative", overflow: "hidden", boxShadow: `10px 10px 0 ${C.ink}` }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${lvl * 100}%`, background: barC, borderTop: lvl > 0.01 ? `6px solid ${C.ink}` : "none" }} />
        </div>
      </div>
    </div>
  );
};

// ── 7. Don't keep everything in one basket: products fly out of one basket into several channels.
export const Spread: React.FC<{ at: number[] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const chans = [["store", 150, 170], ["camera", 380, 90], ["message-circle", 610, 90], ["globe", 820, 170]] as const;
  const kinds = ["chips", "soap", "candy", "bottle"] as const;
  const bx = 480, by = 700;
  return (
    <div style={{ width: 960, height: 960, position: "relative" }}>
      <Deco seed="spr" w={960} h={960} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      <Sfx name="pop" at={5} volume={0.35} />
      {at.flatMap((t, i) => [<Sfx key={`a${i}`} name="pop" at={f(t)} volume={0.4} />, <Sfx key={`b${i}`} name="whoosh" at={f(t) + 2} volume={0.25} />, <Sfx key={`c${i}`} name="coin" at={f(t) + 14} volume={0.35} />])}
      {chans.map(([icon, x, y], i) => frame >= f(at[i]) && (
        <div key={i} style={{ position: "absolute", left: x - 85, top: y, width: 170, height: 170, borderRadius: 34, background: i % 2 ? C.emBg : C.card, border: `7px solid ${C.ink}`, boxShadow: `8px 8px 0 ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `${squash(frame, f(at[i]) + 14, 0.2)} translateY(${float(frame, i, 6)}px)`, ...grow(sp(at[i], 8), 40) }}>
          <Icon name={icon} size={96} color={C.ink} stroke={2.2} />
        </div>
      ))}
      {kinds.map((k, i) => {
        const t = interpolate(frame, [f(at[i]) + 2, f(at[i]) + 14], [0, 1], ease);
        const [, x, y] = chans[i];
        const px = bx + (x - bx) * t, py = by - 120 + (y + 200 - (by - 120)) * t - Math.sin(t * Math.PI) * 160;
        if (t >= 1) return null;
        return <div key={i} style={{ position: "absolute", left: px - 60 + (i - 1.5) * 50 * (1 - t), top: py - 60, transform: `rotate(${t * 300 + (i - 1.5) * 10}deg)` }}><Prod kind={k} size={120} /></div>;
      })}
      <div style={{ position: "absolute", left: bx - 230, top: by, width: 460, transformOrigin: "50% 100%", transform: `rotate(${swing(frame, [6, ...at.map(f)], 6)}deg)`, ...grow(sp(0.05, 10), 80) }}>
        <svg width={460} height={230} viewBox="0 0 460 230">
          <path d="M20 40 H440 L400 220 H60 Z" fill="#D9A066" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
          {[0, 1, 2].map((r) => <path key={r} d={`M${40 + r * 6} ${90 + r * 45} H${420 - r * 6}`} stroke={C.ink} strokeWidth={5} />)}
        </svg>
      </div>
    </div>
  );
};

