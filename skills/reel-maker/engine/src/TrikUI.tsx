// "3 trik marketing" visuals: warung queue, crowd = tasty shortcut, free sample guilt, story raises price,
// checkout pause, bank logos turning blue. Timing props are seconds from the start of the visual (matched to the VO).
import { interpolate, random } from "remotion";
import { Coin, Deco, GREY, Particles, Spark, float, grow, squash, stamp, swing, useT } from "./PriceUI";
import { Sfx } from "./sfx";
import { C, F, clamp } from "./theme";
import { Icon } from "./Visuals";

const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({ background: C.card, border: `6px solid ${C.ink}`, borderRadius: 30, boxShadow: `12px 12px 0 ${C.ink}`, ...extra });
const ease = { ...clamp, easing: (x: number) => 1 - (1 - x) ** 3 };

// Paper person: round head + body, lime when it is "you".
const Person: React.FC<{ you?: boolean; size?: number }> = ({ you, size = 90 }) => (
  <div style={{ width: size, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ width: size * 0.55, height: size * 0.55, borderRadius: "50%", background: you ? C.emBg : C.card, border: `5px solid ${C.ink}` }} />
    <div style={{ marginTop: -4, width: size, height: size * 0.6, borderRadius: `${size / 2}px ${size / 2}px 14px 14px`, background: you ? C.emBg : C.muted, border: `5px solid ${C.ink}` }} />
  </div>
);

const Stall: React.FC<{ busy?: boolean }> = ({ busy }) => (
  <div style={{ width: 380, position: "relative" }}>
    <div style={{ height: 90, display: "flex", border: `6px solid ${C.ink}`, borderRadius: "20px 20px 0 0", overflow: "hidden" }}>
      {Array.from({ length: 6 }, (_, i) => <div key={i} style={{ flex: 1, background: i % 2 ? C.card : busy ? C.emBg : GREY }} />)}
    </div>
    <div style={{ ...card({ borderRadius: "0 0 20px 20px", borderTop: "none", height: 170, display: "flex", alignItems: "center", justifyContent: "center" }) }}>
      <Icon name="soup" size={110} color={busy ? C.ink : GREY} stroke={2} />
    </div>
  </div>
);

// ── 1. Hook: left warung fills with a queue, the right one stays empty; "you" walks in and joins; a "?" pops on the bowl.
export const Queue: React.FC<{ at: [number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const join = f(at[0]), doubt = f(at[1]);
  const spots = [0, 1, 2, 3];
  const walk = interpolate(frame, [join - 14, join + 4], [0, 1], ease);
  const you = { x: interpolate(walk, [0, 1], [1000, 120]), y: 340 + 4 * 112 };
  const q = sp(at[1], 8);
  return (
    <div style={{ width: 960, height: 900, position: "relative" }}>
      <Deco seed="que" w={960} h={900} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      {spots.map((i) => <Sfx key={i} name="pop" at={f(0.3 + i * 0.35)} volume={0.4} />)}
      <Sfx name="slide" at={join - 14} volume={0.4} />
      <Sfx name="pop" at={join + 4} volume={0.5} />
      <Sfx name="buzz" at={doubt} volume={0.4} />
      <Sfx name="ding" at={doubt + 4} volume={0.3} />
      <div style={{ position: "absolute", left: 40, top: 0, transform: `translateY(${(1 - sp(0.05, 11)) * -600}px)` }}><Stall busy /></div>
      <div style={{ position: "absolute", left: 540, top: 0, transform: `translateY(${(1 - sp(0.2, 11)) * -600}px) rotate(${Math.sin(frame / 30) * 1.5}deg)` }}><Stall /></div>
      {/* empty warung: the seller dozes */}
      {[0, 1, 2].map((k) => {
        const t = (frame + k * 25) % 75;
        return <div key={k} style={{ position: "absolute", left: 760 + t * 1.2, top: 200 - t * 2, fontFamily: F.stamp, fontSize: 40 + k * 8, color: GREY, opacity: 1 - t / 75 }}>z</div>;
      })}
      {spots.map((i) => (
        <div key={i} style={{ position: "absolute", left: 160 + (i % 2) * 40, top: 340 + i * 112, ...grow(sp(0.3 + i * 0.35, 9), 60) }}>
          <div style={{ transform: `translateY(${Math.abs(Math.sin(frame / 7 + i)) * -8}px)` }}><Person /></div>
        </div>
      ))}
      {frame >= join - 14 && (
        <div style={{ position: "absolute", left: you.x, top: you.y, transform: frame < join + 4 ? `translateY(${Math.abs(Math.sin(frame / 2.5)) * -18}px)` : squash(frame, join + 4) }}><Person you size={100} /></div>
      )}
      {frame >= doubt && (
        <div style={{ position: "absolute", left: 300, top: 60, width: 150, height: 150, borderRadius: "50%", ...card({ borderRadius: "50%" }), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.stamp, fontSize: 120, color: C.em, transform: `scale(${q}) rotate(${swing(frame, [doubt], 14)}deg)` }}>?</div>
      )}
      <div style={{ position: "absolute", left: 430, top: 560, ...stamp(sp(at[1] + 0.6, 12), 5, 50) }}>BELUM TENTU ENAK</div>
    </div>
  );
};

// ── 2. Lazy brain shortcut: brain dozes, then RAME = ENAK snaps together.
export const Shortcut: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const parts = [
    { icon: "users", s: sp(at[0], 9) },
    { icon: "equal", s: sp(at[1], 9), plain: true },
    { icon: "star", s: sp(at[2], 9) },
  ];
  return (
    <div style={{ width: 960, height: 900, position: "relative" }}>
      <Deco seed="sho" w={960} h={900} />
      <Sfx name="whoosh" at={2} volume={0.4} />
      <Sfx name="pop" at={f(at[0])} volume={0.5} />
      <Sfx name="blip" at={f(at[1])} volume={0.5} />
      <Sfx name="ding" at={f(at[2])} volume={0.5} />
      <Particles at={f(at[2]) + 4} n={10} seed="shoS" x={790} y={600} speed={12} item={() => <Spark size={34} />} />
      <div style={{ position: "absolute", left: 330, top: 40 + float(frame, 0, 12), ...grow(sp(0.05, 10)) }}>
        <div style={{ width: 300, height: 300, borderRadius: "50%", ...card({ borderRadius: "50%", background: C.emBg }), display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(frame / 18) * 8}deg)` }}>
          <Icon name="brain" size={190} color={C.ink} stroke={2} />
        </div>
      </div>
      {[0, 1, 2].map((k) => {
        const t = (frame + k * 22) % 66;
        return <div key={k} style={{ position: "absolute", left: 640 + t * 1.4, top: 90 - t * 1.6, fontFamily: F.stamp, fontSize: 48 + k * 10, color: C.em, opacity: frame < f(at[0]) ? 1 - t / 66 : 0 }}>z</div>;
      })}
      <div style={{ position: "absolute", top: 480, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 40 }}>
        {parts.map((p, i) => (
          <div key={i} style={{ ...grow(p.s, 80) }}>
            {p.plain ? <Icon name={p.icon} size={150} color={C.ink} stroke={3} /> : (
              <div style={{ width: 260, height: 260, ...card(), display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${(i - 1) * 4 + Math.sin(frame / 12 + i) * 3}deg)` }}>
                <Icon name={p.icon} size={160} color={C.ink} stroke={2} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 3. Free sample: tray slides in, a hand takes a piece, the guilt meter fills, DISENGAJA stamp.
export const Sample: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const take = f(at[0]), guilt = f(at[1]), set = f(at[2]);
  const tray = sp(0.05, 11);
  const grab = interpolate(frame, [take - 10, take, take + 14], [0, 1, 0], clamp);
  const meter = interpolate(frame, [guilt, guilt + 30], [0, 1], ease);
  return (
    <div style={{ width: 960, height: 900, position: "relative" }}>
      <Deco seed="sam" w={960} h={900} />
      <Sfx name="slide" at={2} volume={0.4} />
      <Sfx name="tap" at={take} volume={0.6} />
      <Sfx name="pop" at={take + 2} volume={0.4} />
      {[0, 6, 12, 18, 24].map((k) => <Sfx key={k} name="tick" at={guilt + k} volume={0.3} />)}
      <Sfx name="alarm" at={guilt + 28} volume={0.25} />
      <Sfx name="stamp" at={set} volume={0.7} />
      {/* tray of toothpick samples */}
      <div style={{ position: "absolute", left: 120, top: 120, width: 720, height: 250, transform: `translateX(${(1 - tray) * -1100}px)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 110, borderRadius: "50%", background: C.card, border: `6px solid ${C.ink}`, boxShadow: `0 12px 0 ${C.ink}` }} />
        {[0, 1, 2, 3, 4].map((i) => {
          const gone = i === 2 && frame >= take;
          return (
            <div key={i} style={{ position: "absolute", left: 90 + i * 120, top: 40 + (i % 2) * 20, opacity: gone ? 0 : 1, transform: `translateY(${float(frame, i, 4)}px)` }}>
              <div style={{ margin: "0 auto", width: 6, height: 70, background: C.ink }} />
              <div style={{ width: 70, height: 60, marginTop: -6, borderRadius: 14, background: C.emBg, border: `5px solid ${C.ink}` }} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 250, top: -110, ...stamp(sp(0.4, 12), -6, 60) }}>GRATIS</div>
      </div>
      {/* hand reaching from below */}
      <div style={{ position: "absolute", left: 370, top: interpolate(grab, [0, 1], [760, 210]), opacity: frame >= take - 10 && frame <= take + 14 ? 1 : 0 }}>
        <Icon name="hand" size={180} color={C.ink} stroke={2} />
      </div>
      {/* guilt meter */}
      <div style={{ position: "absolute", left: 120, top: 500, width: 720, ...grow(sp(at[1], 10), 40) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", ...card({ borderRadius: "50%" }), display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(frame / 3) * meter * 6}deg)` }}>
            <Icon name={meter > 0.6 ? "face-slightly-frowning" : "face-neutral"} size={84} color={C.ink} stroke={2} />
          </div>
          <div style={{ flex: 1, height: 70, ...card({ borderRadius: 35, padding: 0, overflow: "hidden" }) }}>
            <div style={{ width: `${meter * 100}%`, height: "100%", background: `repeating-linear-gradient(-45deg, ${C.em}, ${C.em} 18px, ${C.emBg} 18px, ${C.emBg} 36px)` }} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 690, left: 0, right: 0, display: "flex", justifyContent: "center" }}><div style={stamp(sp(at[2], 12), -5, 84)}>DISENGAJA</div></div>
    </div>
  );
};

// ── 4. Story: a plain mug with a cheap tag; a story card unfolds, the price counter rolls up.
export const Story: React.FC<{ from: number; to: number; at: [number, number] }> = ({ from, to, at }) => {
  const { frame, f, sp } = useT();
  const tell = f(at[0]), up = f(at[1]);
  const roll = interpolate(frame, [up, up + 20], [0, 1], ease);
  const price = Math.round(interpolate(roll, [0, 1], [from, to]) / 1000) * 1000;
  const open = sp(at[0], 12);
  return (
    <div style={{ width: 960, height: 900, position: "relative" }}>
      <Deco seed="sto" w={960} h={900} />
      <Sfx name="pop" at={3} volume={0.4} />
      <Sfx name="slide" at={tell} volume={0.45} />
      <Sfx name="type" at={tell + 6} volume={0.3} />
      {[0, 4, 8, 12, 16].map((k) => <Sfx key={k} name="tick" at={up + k} volume={0.3} />)}
      <Sfx name="cash" at={up + 20} volume={0.55} />
      <Particles at={up + 20} n={10} seed="stoC" x={700} y={620} speed={13} item={() => <Coin size={60} />} />
      <div style={{ position: "absolute", left: 60, top: 80, width: 380, height: 420, ...card(), display: "flex", alignItems: "center", justifyContent: "center", ...grow(sp(0.05, 10), 60) }}>
        <div style={{ transform: `rotate(${Math.sin(frame / 16) * 4}deg)` }}><Icon name="coffee" size={230} color={C.ink} stroke={1.6} /></div>
      </div>
      {/* story card unfolding from the mug */}
      <div style={{ position: "absolute", left: 480, top: 60, width: 420, height: 460, ...card({ background: C.sticky }), transformOrigin: "0 50%", transform: `scaleX(${Math.max(0, open)}) rotate(${3 + Math.sin(frame / 20) * 1.5}deg)`, opacity: frame >= tell ? 1 : 0, padding: 36, boxSizing: "border-box" }}>
        <Icon name="scroll-text" size={90} color={C.ink} stroke={2} />
        {[0.95, 0.8, 0.9, 0.6].map((w, i) => (
          <div key={i} style={{ marginTop: 28, height: 22, borderRadius: 11, background: C.ink, opacity: 0.8, width: `${w * 100 * interpolate(frame, [tell + 6 + i * 5, tell + 14 + i * 5], [0, 1], clamp)}%` }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 140, right: 140, top: 580, ...card({ background: roll >= 1 ? C.emBg : C.card }), padding: "18px 0", textAlign: "center", fontFamily: F.stamp, fontSize: 120, color: C.ink, transform: `scale(${1 + Math.max(0, Math.sin(roll * Math.PI)) * 0.08}) ${roll >= 1 ? squash(frame, up + 20, 0.15) : ""}` }}>
        <span style={{ fontSize: 56 }}>Rp </span>{price.toLocaleString("id-ID")}
      </div>
      <div style={{ position: "absolute", right: 90, top: 520, opacity: roll, transform: `translateY(${(1 - roll) * 40}px)` }}><Icon name="trending-up" size={120} color={C.em} stroke={3} /></div>
    </div>
  );
};

// ── 5. Checkout: cart total, the cursor heads for "Bayar" and freezes; two choices drop in: butuh vs kena trik.
export const Checkout: React.FC<{ total: string; at: [number, number] }> = ({ total, at }) => {
  const { frame, f, sp } = useT();
  const stop = f(at[0]), ask = f(at[1]);
  const go = interpolate(frame, [4, stop], [0, 1], ease);
  const cx = interpolate(go, [0, 1], [880, 560]), cy = interpolate(go, [0, 1], [820, 430]);
  const shake = frame > stop && frame < ask ? Math.sin(frame * 1.3) * 6 : 0;
  return (
    <div style={{ width: 960, height: 900, position: "relative" }}>
      <Sfx name="slide" at={2} volume={0.4} />
      <Sfx name="buzz" at={stop} volume={0.35} />
      <Sfx name="pop" at={ask} volume={0.5} />
      <Sfx name="pop" at={ask + 8} volume={0.5} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 30, ...card(), padding: 40, ...grow(sp(0.05, 10), 80) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Icon name="shopping-cart" size={90} color={C.ink} stroke={2} />
          <div style={{ fontFamily: F.stamp, fontSize: 84, color: C.ink }}>{total}</div>
        </div>
        <div style={{ marginTop: 34, padding: "22px 0", textAlign: "center", borderRadius: 22, background: C.red, color: "#fff", border: `5px solid ${C.ink}`, fontFamily: F.sans, fontWeight: 700, fontSize: 54, transform: `translateX(${shake}px)` }}>Bayar</div>
      </div>
      <div style={{ position: "absolute", top: 540, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40 }}>
        {[{ icon: "check", l: "BUTUH" }, { icon: "x", l: "KENA TRIK" }].map((b, i) => {
          const s = sp(at[1] + i * 0.27, 9);
          return (
            <div key={i} style={{ width: 360, padding: "30px 0", ...card({ background: i ? C.emBg : C.card }), display: "flex", flexDirection: "column", alignItems: "center", gap: 10, ...grow(s, 80), rotate: `${(i ? 4 : -4) + swing(frame, [ask + i * 8], 6)}deg` }}>
              <Icon name={b.icon} size={100} color={C.ink} stroke={3} />
              <div style={{ fontFamily: F.stamp, fontSize: 56, color: C.ink }}>{b.l}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: cx - 10, top: cy - 6 }}><Icon name="mouse-pointer-2" size={90} color={C.ink} stroke={2.2} /></div>
    </div>
  );
};

// ── 6. Teaser: three blank bank logos turn blue one by one, a "?" bounces.
const BLUE = "#2563EB";
export const Blue: React.FC<{ at: [number, number, number, number] }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const shapes = ["landmark", "building", "piggy-bank"];
  return (
    <div style={{ width: 960, height: 900, position: "relative" }}>
      <Deco seed="blu" w={960} h={900} />
      {shapes.map((_, i) => <Sfx key={i} name="pop" at={f(at[i])} volume={0.5} />)}
      <Sfx name="ding" at={f(at[3])} volume={0.5} />
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 36 }}>
        {shapes.map((s, i) => {
          const on = interpolate(frame, [f(at[i]), f(at[i]) + 6], [0, 1], clamp);
          return (
            <div key={i} style={{ width: 260, height: 260, ...card({ borderRadius: "50%", background: on > 0.5 ? BLUE : C.card }), display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${float(frame, i * 2, 10)}px) scale(${1 + Math.sin(on * Math.PI) * 0.18})`, ...(frame < 4 ? { opacity: 0 } : {}) }}>
              <Icon name={s} size={140} color={on > 0.5 ? "#fff" : GREY} stroke={2} />
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 480, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: F.stamp, fontSize: 300, color: BLUE, WebkitTextStroke: `8px ${C.ink}`, transform: `scale(${sp(at[3], 7)}) translateY(${-Math.abs(Math.sin((frame - f(at[3])) / 6)) * 30}px) rotate(${random("q") * 10 - 5}deg)` }}>?</div>
      </div>
    </div>
  );
};
