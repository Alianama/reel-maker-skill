// Melikas visuals (kasir + pesan dari HP): messy paper orders, table QR → phone menu, store QRIS → lunas,
// sales report, launch countdown. Labels copied from the real Melikas UI. Timings are fractions of `dur` (frames).
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "./sfx";
import { C, F, cardShadow, clamp, enter, pop } from "./theme";
import { Icon } from "./Visuals";

const DANGER = "#B91C1C";
const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, p: (d = 0) => pop(frame, fps, d) };
};
const rupiah = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;
const stampStyle = (s: number, color: string): React.CSSProperties => ({
  transform: `rotate(-10deg) scale(${interpolate(s, [0, 1], [2.4, 1])})`, opacity: Math.min(1, s * 2.5),
  border: `9px solid ${color}`, color, fontFamily: F.stamp, padding: "4px 34px", borderRadius: 18, background: "#ffffffee", whiteSpace: "nowrap",
});

// Phone frame with a light app screen.
const Phone: React.FC<{ w?: number; h?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ w = 560, h = 1000, style, children }) => (
  <div style={{ width: w, height: h, background: C.ink, borderRadius: 70, padding: 18, boxShadow: cardShadow, ...style }}>
    <div style={{ position: "relative", height: "100%", borderRadius: 54, background: "#FAFAF9", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", top: 14, left: "50%", width: 150, height: 34, marginLeft: -75, borderRadius: 20, background: C.ink, zIndex: 5 }} />
      {children}
    </div>
  </div>
);

// Fake but stable QR pattern: seeded modules + three finder squares.
const QR: React.FC<{ size: number; seed: string }> = ({ size, seed }) => {
  const n = 25;
  const m = size / n;
  const finder = (x: number, y: number) => x < 7 && y < 7 ? true : x >= n - 7 && y < 7 ? true : x < 7 && y >= n - 7;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: "#fff" }}>
      {Array.from({ length: n * n }, (_, i) => {
        const x = i % n, y = Math.floor(i / n);
        return !finder(x, y) && random(`${seed}${i}`) > 0.5 ? <rect key={i} x={x * m} y={y * m} width={m + 0.5} height={m + 0.5} fill={C.ink} /> : null;
      })}
      {[[0, 0], [n - 7, 0], [0, n - 7]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x * m + m / 2} y={y * m + m / 2} width={6 * m} height={6 * m} fill="none" stroke={C.ink} strokeWidth={m} />
          <rect x={(x + 2) * m} y={(y + 2) * m} width={3 * m} height={3 * m} fill={C.ink} />
        </g>
      ))}
    </svg>
  );
};

// ── Hook: handwritten orders rain onto the counter, then the cash drawer comes up short.
export const Nota: React.FC<{ notes: string[]; diff: string; dur: number }> = ({ notes, diff, dur }) => {
  const { frame, p } = useT();
  const gap = Math.max(5, Math.round((dur * 0.55) / notes.length));
  const drops = notes.map((_, i) => 4 + i * gap);
  const bad = Math.round(dur * 0.62);
  const shake = frame >= bad && frame < bad + 14 ? Math.sin(frame * 3) * 10 : 0;
  return (
    <div style={{ width: 960, height: 1050, position: "relative", transform: `translateX(${shake}px)` }}>
      {drops.map((d, i) => <Sfx key={i} name={i % 2 ? "slide" : "pop"} at={d + 6} volume={0.35} />)}
      <Sfx name="error" at={bad} volume={0.55} />
      <Sfx name="stamp" at={bad + 2} volume={0.6} />
      {notes.map((t, i) => {
        const y = interpolate(frame, [drops[i], drops[i] + 9], [-900, 0], { ...clamp, easing: (x) => x * x });
        const rot = (random(`r${i}`) - 0.5) * 34;
        const x = 40 + random(`x${i}`) * 480;
        const top = 40 + (i % 5) * 150 + random(`y${i}`) * 50;
        return frame < drops[i] ? null : (
          <div key={i} style={{ position: "absolute", left: x, top, width: 400, padding: "26px 30px", background: i % 3 === 0 ? C.sticky : "#fff", border: `4px solid ${C.ink}`, boxShadow: cardShadow, transform: `translateY(${y}px) rotate(${rot}deg)`, fontFamily: F.mono, fontSize: 36, color: C.ink, lineHeight: 1.25 }}>
            {t}
          </div>
        );
      })}
      {frame >= bad && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 20, display: "flex", justifyContent: "center" }}>
          <div style={{ ...stampStyle(p(bad), DANGER), fontSize: 120 }}>{diff}</div>
        </div>
      )}
    </div>
  );
};

// ── Buyer scans the table QR, picks options on the phone menu, types a name, taps pay.
export const QrOrder: React.FC<{ store: string; table: string; item: string; price: number; options: { group: string; choices: string[]; pick: number; extra?: number }[]; name: string; dur: number }> = ({ store, table, item, price, options, name, dur }) => {
  const { frame, p } = useT();
  const scanEnd = Math.round(dur * 0.22);
  const optAt = options.map((_, i) => Math.round(dur * (0.36 + i * 0.13)));
  const nameAt = Math.round(dur * (0.36 + options.length * 0.13));
  const payAt = Math.round(dur * 0.86);
  const total = price + options.reduce((a, o) => a + (o.extra ?? 0), 0);
  const typed = name.slice(0, Math.max(0, Math.floor((frame - nameAt) / 3)));
  const scanning = frame < scanEnd;
  const line = interpolate(frame, [8, scanEnd - 4], [0, 1], clamp);
  const chip = (on: boolean): React.CSSProperties => ({ padding: "10px 22px", borderRadius: 999, border: `3px solid ${on ? C.red : "#D6D3D1"}`, background: on ? `${C.emBg}55` : "#fff", fontWeight: on ? 700 : 500, fontSize: 28, color: C.ink });
  return (
    <div style={{ width: 960, height: 1050, position: "relative", display: "flex", justifyContent: "center" }}>
      <Sfx name="whoosh" at={2} volume={0.4} />
      <Sfx name="blip" at={scanEnd - 4} volume={0.6} />
      <Sfx name="pop" at={scanEnd + 2} volume={0.45} />
      {optAt.map((a, i) => <Sfx key={i} name="tap" at={a + 8} volume={0.55} />)}
      {name.split("").map((_, i) => <Sfx key={`k${i}`} name="type" at={nameAt + i * 3} volume={0.3} />)}
      <Sfx name="tap" at={payAt} volume={0.6} />
      <Sfx name="ding" at={payAt + 4} volume={0.45} />
      {scanning ? (
        <div style={{ marginTop: 60, display: "flex", flexDirection: "column", alignItems: "center", ...enter(p(1), 60) }}>
          <div style={{ position: "relative", background: "#fff", border: `6px solid ${C.ink}`, borderRadius: 30, padding: 40, boxShadow: cardShadow, textAlign: "center" }}>
            <div style={{ fontFamily: F.stamp, fontSize: 80, color: C.ink, lineHeight: 1, marginBottom: 24 }}>MEJA {table}</div>
            <QR size={460} seed="meja" />
            <div style={{ position: "absolute", left: 30, right: 30, top: 140 + line * 460, height: 10, background: C.emBg, boxShadow: `0 0 40px ${C.emBg}` }} />
          </div>
        </div>
      ) : (
        <Phone style={{ ...enter(p(scanEnd), 80) }}>
          <div style={{ padding: "70px 34px 20px", background: C.red, color: "#fff", fontFamily: F.sans }}>
            <div style={{ fontWeight: 700, fontSize: 40 }}>{store}</div>
            <div style={{ fontSize: 26, opacity: 0.85 }}>Meja {table}</div>
          </div>
          <div style={{ padding: "26px 30px", display: "flex", flexDirection: "column", gap: 22, fontFamily: F.sans, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 36, color: C.ink, ...enter(p(scanEnd + 6), 30) }}>
              <span>{item}</span><span>{rupiah(price)}</span>
            </div>
            {options.map((o, i) => (
              <div key={i} style={{ ...enter(p(optAt[i]), 30) }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#78716C", marginBottom: 10 }}>{o.group}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {o.choices.map((c, j) => {
                    const on = j === o.pick && frame >= optAt[i] + 8;
                    return <div key={j} style={{ ...chip(on), transform: `scale(${on && frame < optAt[i] + 13 ? 0.9 : 1})` }}>{c}</div>;
                  })}
                </div>
              </div>
            ))}
            {frame >= nameAt - 4 && (
              <div style={{ ...enter(p(nameAt - 4), 30) }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#78716C", marginBottom: 10 }}>Nama Anda</div>
                <div style={{ border: `3px solid ${C.red}`, borderRadius: 16, padding: "14px 20px", fontSize: 32, color: C.ink, background: "#fff" }}>
                  {typed}<span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>|</span>
                </div>
              </div>
            )}
            <div style={{ marginTop: "auto", borderRadius: 18, padding: "22px 0", textAlign: "center", fontWeight: 700, fontSize: 32, color: "#fff", background: C.ink, transform: `scale(${frame >= payAt && frame < payAt + 6 ? 0.94 : 1})`, boxShadow: frame >= payAt ? `0 0 0 8px ${C.emBg}` : "none", ...enter(p(nameAt + 6), 30) }}>
              Bayar {rupiah(total)} dengan QRIS
            </div>
          </div>
        </Phone>
      )}
      {frame >= payAt - 12 && frame < payAt + 10 && (
        <div style={{ position: "absolute", left: 600, top: 880, transform: `scale(${frame >= payAt && frame < payAt + 5 ? 0.85 : 1}) rotate(-15deg)`, filter: "drop-shadow(0 8px 6px #0004)" }}>
          <Icon name="pointer" size={120} color={C.ink} stroke={2} />
        </div>
      )}
    </div>
  );
};

// ── Store's own QRIS with the exact amount → bank notification → cashier marks it paid.
export const Qris: React.FC<{ store: string; total: number; dur: number }> = ({ store, total, dur }) => {
  const { frame, p } = useT();
  const bankAt = Math.round(dur * 0.42);
  const tapAt = Math.round(dur * 0.7);
  const lunas = tapAt + 6;
  const notifY = interpolate(p(bankAt), [0, 1], [-260, 0]);
  return (
    <div style={{ width: 960, height: 1050, position: "relative", display: "flex", justifyContent: "center" }}>
      <Sfx name="pop" at={3} volume={0.45} />
      <Sfx name="blip" at={12} volume={0.35} />
      <Sfx name="buzz" at={bankAt} volume={0.5} />
      <Sfx name="coin" at={bankAt + 3} volume={0.55} />
      <Sfx name="tap" at={tapAt} volume={0.6} />
      <Sfx name="stamp" at={lunas} volume={0.6} />
      <Sfx name="cash" at={lunas + 4} volume={0.45} />
      <Phone h={1000} style={{ ...enter(p(1), 80) }}>
        <div style={{ padding: "80px 34px 0", textAlign: "center", fontFamily: F.sans, color: C.ink }}>
          <div style={{ fontWeight: 700, fontSize: 34 }}>{store}</div>
          <div style={{ fontSize: 26, color: "#78716C", marginTop: 6 }}>Pindai dengan aplikasi bank atau e-wallet apa pun</div>
          <div style={{ margin: "28px auto 0", width: 400, padding: 18, border: `4px solid ${C.ink}`, borderRadius: 22, background: "#fff", ...enter(p(8), 30) }}>
            <div style={{ fontFamily: F.stamp, fontSize: 54, lineHeight: 1, marginBottom: 12 }}>QRIS</div>
            <QR size={360} seed="qris" />
          </div>
          <div style={{ fontFamily: F.stamp, fontSize: 92, marginTop: 22, ...enter(p(12), 30) }}>{rupiah(total)}</div>
          <div style={{ fontSize: 26, color: C.red, fontWeight: 700 }}>Nominal sudah ada di dalam kode.</div>
        </div>
      </Phone>
      {frame >= bankAt && (
        <div style={{ position: "absolute", top: 40, left: 120, right: 120, background: "#ffffffF2", border: `4px solid ${C.ink}`, borderRadius: 30, padding: "20px 26px", display: "flex", alignItems: "center", gap: 20, boxShadow: cardShadow, transform: `translateY(${notifY}px)`, fontFamily: F.sans }}>
          <div style={{ width: 70, height: 70, borderRadius: 18, background: C.red, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="landmark" size={44} color="#fff" /></div>
          <div style={{ color: C.ink }}>
            <div style={{ fontWeight: 700, fontSize: 30 }}>Uang masuk ke rekening toko</div>
            <div style={{ fontSize: 34, fontWeight: 700, color: C.red }}>+{rupiah(total)}</div>
          </div>
        </div>
      )}
      {frame >= tapAt - 14 && (
        <div style={{ position: "absolute", bottom: -30, left: 90, right: 90, borderRadius: 24, padding: "26px 0", textAlign: "center", background: C.red, color: "#fff", fontFamily: F.sans, fontWeight: 700, fontSize: 36, border: `4px solid ${C.ink}`, boxShadow: cardShadow, transform: `scale(${frame >= tapAt && frame < tapAt + 6 ? 0.94 : 1})`, ...enter(p(tapAt - 14), 40) }}>
          Uang sudah masuk: tandai lunas
        </div>
      )}
      {frame >= lunas && (
        <div style={{ position: "absolute", top: 420, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ ...stampStyle(p(lunas), C.red), fontSize: 150 }}>LUNAS</div>
        </div>
      )}
    </div>
  );
};

// ── Report: omzet counts up, daily bars grow, QRIS vs tunai split, best seller.
export const Report: React.FC<{ omzet: number; bars: number[]; qris: number; best: string; sold: number; dur: number }> = ({ omzet, bars, qris, best, sold, dur }) => {
  const { frame, p } = useT();
  const countEnd = Math.round(dur * 0.35);
  const n = interpolate(frame, [6, countEnd], [0, omzet], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const barAt = (i: number) => Math.round(dur * 0.2) + i * 4;
  const splitAt = Math.round(dur * 0.5);
  const bestAt = Math.round(dur * 0.68);
  const max = Math.max(...bars);
  const card: React.CSSProperties = { background: C.card, border: `5px solid ${C.ink}`, borderRadius: 30, boxShadow: cardShadow, padding: "26px 32px", fontFamily: F.sans, color: C.ink };
  return (
    <div style={{ width: 940, display: "flex", flexDirection: "column", gap: 24 }}>
      {Array.from({ length: 8 }, (_, i) => <Sfx key={i} name="tick" at={6 + i * Math.round((countEnd - 6) / 8)} volume={0.25} />)}
      <Sfx name="coin" at={countEnd} volume={0.5} />
      {bars.map((_, i) => <Sfx key={`b${i}`} name="blip" at={barAt(i)} volume={0.25} />)}
      <Sfx name="slide" at={splitAt} volume={0.45} />
      <Sfx name="ding" at={bestAt} volume={0.5} />
      <div style={{ ...card, ...enter(p(1), 50) }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#78716C" }}>Omzet</div>
        <div style={{ fontFamily: F.stamp, fontSize: 110, lineHeight: 1.05 }}>{rupiah(n)}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 220, marginTop: 18 }}>
          {bars.map((b, i) => (
            <div key={i} style={{ flex: 1, height: `${(b / max) * 100 * interpolate(p(barAt(i)), [0, 1], [0, 1], clamp)}%`, background: i === bars.length - 1 ? C.emBg : C.red, border: `4px solid ${C.ink}`, borderRadius: "12px 12px 0 0" }} />
          ))}
        </div>
      </div>
      <div style={{ ...card, ...enter(p(splitAt), 50) }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 700 }}><span>Dibayar QRIS {qris}%</span><span>Tunai {100 - qris}%</span></div>
        <div style={{ display: "flex", height: 46, marginTop: 14, borderRadius: 23, overflow: "hidden", border: `4px solid ${C.ink}` }}>
          <div style={{ width: `${qris * interpolate(frame, [splitAt, splitAt + 16], [0, 1], clamp)}%`, background: C.red }} />
          <div style={{ flex: 1, background: C.sticky }} />
        </div>
      </div>
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 24, ...enter(p(bestAt), 50) }}>
        <div style={{ width: 90, height: 90, borderRadius: 24, background: C.emBg, border: `4px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(frame / 8) * 6}deg)` }}><Icon name="crown" size={56} color={C.ink} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#78716C" }}>Paling laku</div>
          <div style={{ fontSize: 42, fontWeight: 700 }}>{best}</div>
        </div>
        <div style={{ fontFamily: F.stamp, fontSize: 54 }}>{sold} terjual</div>
      </div>
    </div>
  );
};

// ── Launch countdown: digits roll in, then the seconds tick down live. No date shown on purpose.
export const Countdown: React.FC<{ days: number; dur: number }> = ({ days, dur }) => {
  const { frame, fps, p } = useT();
  const roll = 24;
  const left = 23 * 3600 + 59 * 60 + 59 - Math.max(0, Math.floor((frame - roll) / fps));
  const shownDays = frame < roll ? Math.round(interpolate(frame, [4, roll], [99, days], clamp)) : days;
  const parts: [number, string][] = [[shownDays, "HARI"], [Math.floor(left / 3600), "JAM"], [Math.floor(left / 60) % 60, "MENIT"], [left % 60, "DETIK"]];
  const ticks = Array.from({ length: Math.floor((dur - roll) / fps) + 1 }, (_, i) => roll + i * fps);
  const flip = (frame - roll) % fps;
  return (
    <div style={{ width: 980, display: "flex", flexDirection: "column", alignItems: "center", gap: 50 }}>
      {Array.from({ length: 10 }, (_, i) => <Sfx key={`r${i}`} name="tick" at={4 + i * 2} volume={0.3} />)}
      <Sfx name="boom" at={roll} volume={0.55} />
      {ticks.map((t) => <Sfx key={t} name="tick" at={t} volume={0.4} />)}
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "18px 40px", borderRadius: 999, background: C.emBg, border: `5px solid ${C.ink}`, boxShadow: cardShadow, ...enter(p(1), 40) }}>
        <Icon name="store" size={70} color={C.ink} stroke={2.2} />
        <span style={{ fontFamily: F.stamp, fontSize: 80, color: C.ink, lineHeight: 1 }}>MELIKAS</span>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        {parts.map(([v, l], i) => {
          const live = i === 3 && frame >= roll && flip < 6;
          return (
            <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, ...enter(p(3 + i * 3), 60) }}>
              <div style={{ width: 220, height: 260, borderRadius: 30, background: C.ink, border: `5px solid ${C.emBg}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", boxShadow: i === 0 && frame >= roll ? `0 0 60px ${C.emBg}` : cardShadow }}>
                <span style={{ fontFamily: F.stamp, fontSize: 170, color: i === 0 ? C.emBg : "#fff", lineHeight: 1, transform: `scaleY(${live ? interpolate(flip, [0, 3, 6], [0.2, 1.1, 1]) : 1})` }}>{String(v).padStart(2, "0")}</span>
                <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 4, background: "#000a" }} />
              </div>
              <span style={{ fontFamily: F.stamp, fontSize: 40, color: C.ink }}>{l}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// ── Hook: you arrived first, but the next table gets served first. Clock runs, the bowl goes to them.
export const Meja: React.FC<{ you: string; them: string; dur: number }> = ({ you, them, dur }) => {
  const { frame, fps, p } = useT();
  const serve = Math.round(dur * 0.55);
  const huh = serve + 14;
  const mins = Math.min(35, Math.floor(interpolate(frame, [0, serve], [0, 35], clamp)));
  const bowlX = interpolate(p(serve), [0, 1], [-700, 0]);
  const table = (label: string, mine: boolean) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div style={{ width: 360, height: 360, borderRadius: "50%", background: C.tan, border: `6px solid ${C.ink}`, boxShadow: cardShadow, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {mine ? (
          <div style={{ transform: `rotate(${Math.floor(frame / fps) * 180}deg)` }}><Icon name="hourglass" size={150} color={C.ink} /></div>
        ) : frame >= serve && (
          <div style={{ transform: `translateX(${bowlX}px)`, width: 210, height: 210, borderRadius: "50%", background: "#fff", border: `6px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="soup" size={130} color={C.red} /></div>
        )}
      </div>
      <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 40, color: "#fff", textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line" }}>{label}</div>
    </div>
  );
  return (
    <div style={{ width: 960, height: 1000, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 70 }}>
      {Array.from({ length: 6 }, (_, i) => <Sfx key={i} name="tick" at={4 + i * Math.round(serve / 6)} volume={0.35} />)}
      <Sfx name="whoosh" at={serve - 2} volume={0.5} />
      <Sfx name="ding" at={serve + 6} volume={0.5} />
      <Sfx name="error" at={huh} volume={0.5} />
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 36px", borderRadius: 999, background: C.emBg, border: `5px solid ${C.ink}`, ...enter(p(1), 40) }}>
        <Icon name="clock" size={64} color={C.ink} stroke={2.2} />
        <span style={{ fontFamily: F.stamp, fontSize: 80, color: C.ink, lineHeight: 1 }}>+{mins} MENIT</span>
      </div>
      <div style={{ display: "flex", gap: 80, ...enter(p(4), 60) }}>
        {table(you, true)}
        {table(them, false)}
      </div>
      {frame >= huh && <div style={{ position: "absolute", left: 60, top: 300, ...stampStyle(p(huh), DANGER), fontSize: 130 }}>LHO?!</div>}
    </div>
  );
};
