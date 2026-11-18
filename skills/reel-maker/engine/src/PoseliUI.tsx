// Poseli (jadwal posting) visuals, modelled on products/poseli/frontend: Tulis post, Posting ke, Jadwal Minggu/Daftar,
// status Menunggu/Tayang/Gagal, Post lagi, paket Gratis. Timing props are seconds from the start of the scene (matched to the VO).
import { interpolate, random } from "remotion";
import { Deco, Particles, Spark, float, squash, swing, useT } from "./PriceUI";
import { Sfx } from "./sfx";
import { C, F, cardShadow, clamp } from "./theme";
import { Icon } from "./Visuals";

const LIME = "#A3E635";
const OK = "#4D7C0F";
const LINE = "#E4E4DE";
const APPBG = "#F3F2EE";
const NIGHT = "#111827";
const STORE = "Toko Sekar";

const PL = {
  instagram: { icon: "instagram", name: "Instagram", max: "2.200" },
  facebook: { icon: "facebook", name: "Facebook", max: "63.206" },
  threads: { icon: "at-sign", name: "Threads", max: "500" },
  tiktok: { icon: "music", name: "TikTok", max: "4.000" },
  linkedin: { icon: "linkedin", name: "LinkedIn", max: "3.000" },
} as const;
type Pl = keyof typeof PL;

const Panel: React.FC<{ title: string; icon?: string; right?: React.ReactNode; style?: React.CSSProperties; children: React.ReactNode }> = ({ title, icon = "calendar-clock", right, style, children }) => (
  <div style={{ width: 920, background: APPBG, border: `4px solid ${C.ink}`, borderRadius: 30, boxShadow: cardShadow, overflow: "hidden", fontFamily: F.sans, color: C.ink, ...style }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 28px", background: "#fff", borderBottom: `3px solid ${LINE}`, fontWeight: 700, fontSize: 34 }}>
      <Icon name={icon} size={36} color={OK} stroke={2.2} />
      <span style={{ flex: 1 }}>{title}</span>
      {right}
    </div>
    {children}
  </div>
);
const Pill: React.FC<{ on?: boolean; lime?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ on, lime, children, style }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 999, fontWeight: 700, fontSize: 26, background: lime ? LIME : on ? C.ink : "#fff", color: on ? "#fff" : C.ink, border: `2px solid ${lime || on ? "transparent" : LINE}`, whiteSpace: "nowrap", ...style }}>{children}</span>
);
export const Status: React.FC<{ s: "wait" | "live" | "fail"; size?: number }> = ({ s, size = 24 }) => {
  const m = { wait: ["clock", "Menunggu", "#6B7280"], live: ["circle-check", "Tayang", OK], fail: ["circle-alert", "Gagal", "#DC2626"] }[s];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: size, color: m[2], background: "#fff", border: `2px solid ${LINE}`, borderRadius: 12, padding: "4px 12px", whiteSpace: "nowrap" }}>
      <Icon name={m[0]} size={size} color={m[2]} stroke={2.4} />
      {m[1]}
    </span>
  );
};
const Cursor: React.FC<{ x: number; y: number; tap?: number }> = ({ x, y, tap = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - tap * 0.25})`, transformOrigin: "top left", filter: "drop-shadow(3px 4px 0 #0003)", zIndex: 9 }}>
    <svg width={56} height={56} viewBox="0 0 24 24"><path d="M4 2 L4 19 L8.5 14.5 L11.5 21 L14 20 L11 13.5 L17 13.5 Z" fill="#fff" stroke={C.ink} strokeWidth={1.6} strokeLinejoin="round" /></svg>
  </div>
);
// Short 0→1→0 pulse around a tap moment.
const tapAt = (frame: number, at: number) => interpolate(frame - at, [-3, 0, 5], [0, 1, 0], clamp);
const Face: React.FC<{ size: number; awake: number; hue: string }> = ({ size, awake, hue }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: hue, border: `5px solid ${C.ink}`, position: "relative" }}>
    {[0.3, 0.62].map((x) => (
      <div key={x} style={{ position: "absolute", left: size * x, top: size * 0.4, width: size * 0.12, height: Math.max(4, size * 0.12 * awake), borderRadius: awake > 0.5 ? "50%" : 4, background: C.ink }} />
    ))}
    <div style={{ position: "absolute", left: size * 0.38, top: size * 0.66, width: size * 0.24, height: size * 0.08 + awake * size * 0.06, borderRadius: "0 0 20px 20px", background: C.ink }} />
  </div>
);
const HUES = ["#FDE68A", "#FBCFE8", "#BAE6FD"];
const PostImg: React.FC<{ h: number }> = ({ h }) => (
  <div style={{ height: h, borderRadius: 18, background: `linear-gradient(135deg, ${LIME}, #D9F99D 60%, #FEF3C7)`, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: F.stamp, fontSize: h * 0.26, color: C.ink }}>
    <Icon name="cake-slice" size={h * 0.36} color={C.ink} stroke={2} /> PROMO
  </div>
);

// 1 · Hook: three people asleep; "post baru" notifications land on their blankets and nobody notices.
export const PoSleep: React.FC<{ dur: number }> = () => {
  const { frame, f, sp } = useT();
  const drops = [1.0, 1.6, 2.2];
  return (
    <div style={{ position: "relative", width: 940, height: 1000, borderRadius: 40, background: `linear-gradient(180deg, ${NIGHT}, #1F2937)`, overflow: "hidden", border: `4px solid ${C.ink}` }}>
      {drops.map((d, i) => <Sfx key={i} name="ding" at={f(d)} volume={0.35} />)}
      <Sfx name="p-ghost" at={f(4.9)} volume={0.4} />
      {Array.from({ length: 14 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: random(`st${i}`) * 900, top: random(`sy${i}`) * 380, opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 12 + i)) }}><Spark size={18 + random(`ss${i}`) * 16} color="#FEF9C3" /></div>
      ))}
      <div style={{ position: "absolute", right: 90, top: 70, transform: `rotate(${swing(frame, [0], 10)}deg)` }}><Icon name="moon" size={150} color="#FEF08A" stroke={1.6} /></div>
      {[0, 1, 2].map((i) => {
        const x = 40 + i * 300;
        const land = sp(drops[i]);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 470 + float(frame, i, 6) }}>
            {[0, 1, 2].map((k) => {
              const t = (frame + i * 17 + k * 22) % 66;
              return <div key={k} style={{ position: "absolute", left: 170 + t * 0.9, top: -40 - t * 2.4, fontFamily: F.stamp, fontSize: 40 + k * 10 + (frame > f(4.9) ? 18 : 0), color: "#E5E7EB", opacity: interpolate(t, [0, 10, 50, 66], [0, 1, 1, 0]) }}>z</div>;
            })}
            <div style={{ position: "absolute", left: 30, top: 0 }}><Face size={130} awake={0} hue={HUES[i]} /></div>
            <div style={{ position: "absolute", left: 0, top: 100, width: 270, height: 200, borderRadius: "40px 40px 18px 18px", background: ["#4D7C0F", "#65A30D", "#84CC16"][i], border: `5px solid ${C.ink}` }} />
            <div style={{ position: "absolute", left: 22, top: interpolate(land, [0, 1], [-600, 150]), width: 230, padding: "10px 14px", background: "#fff", borderRadius: 16, border: `3px solid ${C.ink}`, fontFamily: F.sans, fontWeight: 700, fontSize: 21, color: C.ink, opacity: frame > f(drops[i]) ? 1 - Math.min(0.55, (frame - f(drops[i] + 0.6)) / 40) : 0, transform: `rotate(${(i - 1) * 6}deg) ${frame > f(drops[i]) ? squash(frame, f(drops[i]) + 6) : ""}` }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name="bell" size={22} color={OK} stroke={2.4} />{STORE}</div>
              <div style={{ fontWeight: 500, color: "#6B7280" }}>baru saja posting</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 2 · Late post: clock ticks to 23.00, the post goes out, "Dilihat oleh" shows just one face: you.
export const PoLate: React.FC<{ at: [number, number, number]; dur: number }> = ({ at: [posted, seenRow, you] }) => {
  const { frame, f, sp } = useT();
  const mins = frame < f(0.25) ? "22.58" : frame < f(0.5) ? "22.59" : "23.00";
  const prog = interpolate(frame, [f(1), f(posted)], [0, 100], clamp);
  return (
    <div style={{ position: "relative", width: 940, height: 1000, display: "flex", justifyContent: "center" }}>
      <Sfx name="tick" at={0} volume={0.4} /><Sfx name="tick" at={f(0.25)} volume={0.4} /><Sfx name="stamp" at={f(0.5)} volume={0.4} />
      <Sfx name="whoosh" at={f(1)} volume={0.25} /><Sfx name="ding" at={f(posted)} volume={0.4} />
      <Sfx name="slide" at={f(seenRow)} volume={0.35} /><Sfx name="pop" at={f(you)} volume={0.5} /><Sfx name="p-bonk" at={f(you + 0.4)} volume={0.35} />
      <div style={{ width: 560, height: 980, borderRadius: 70, background: C.ink, padding: 18, boxShadow: cardShadow, transform: `rotate(${swing(frame, [0], 2)}deg)` }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 54, background: "#fff", overflow: "hidden", fontFamily: F.sans, color: C.ink }}>
          <div style={{ background: NIGHT, color: "#fff", textAlign: "center", padding: "36px 0 26px" }}>
            <div style={{ fontFamily: F.stamp, fontSize: 130, lineHeight: 1, transform: `scale(${1 + 0.15 * tapAt(frame, f(0.5))})` }}>{mins}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, alignItems: "center", fontSize: 26, opacity: 0.7, marginTop: 8 }}><Icon name="moon" size={26} color="#fff" /> Kamis malam</div>
          </div>
          <div style={{ padding: 26 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", fontWeight: 700, fontSize: 28, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: LIME, display: "grid", placeItems: "center" }}><Icon name="store" size={30} color={C.ink} /></div>
              {STORE}
            </div>
            <PostImg h={300} />
            <div style={{ fontSize: 26, margin: "16px 0" }}>Promo bolu pandan Jumat ini. Beli 2 gratis 1!</div>
            {frame < f(posted) ? (
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#6B7280" }}>
                Memposting…
                <div style={{ flex: 1, height: 14, borderRadius: 7, background: LINE, overflow: "hidden" }}><div style={{ width: `${prog}%`, height: "100%", background: LIME }} /></div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 26, fontWeight: 700, color: "#6B7280", opacity: Math.min(1, sp(seenRow) * 2) }}>
                <Icon name="eye" size={32} color="#6B7280" /> Dilihat oleh
                <div style={{ display: "flex", alignItems: "center", gap: 10, transform: `scale(${sp(you)})` }}>
                  <div style={{ width: 54, height: 54, borderRadius: "50%", background: LIME, border: `3px solid ${C.ink}`, display: "grid", placeItems: "center", color: C.ink, fontSize: 22 }}>K</div>
                  <span style={{ color: C.ink }}>kamu</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3 · Buried: other people's posts keep landing on top of the feed until yours slides out of sight.
export const PoBury: React.FC<{ at: number; dur: number }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const ins = Array.from({ length: 7 }, (_, i) => at + i * 0.42);
  const H = 250;
  const push = (from: number) => ins.reduce((a, t, i) => (i >= from ? a + sp(t, 14) * H : a), 0);
  const names = ["Kopi Senja", "Rani Bakery", "Distro 99", "Warung Ijo", "Batik Ayu", "Sepatu Lokal", "Es Teh Jumbo"];
  return (
    <div style={{ position: "relative", width: 940, height: 1000, display: "flex", justifyContent: "center" }}>
      {ins.map((t, i) => <Sfx key={i} name="slide" at={f(t)} volume={0.3} />)}
      <Sfx name="p-zip" at={f(ins[4])} volume={0.35} />
      <div style={{ width: 560, height: 980, borderRadius: 70, background: C.ink, padding: 18, boxShadow: cardShadow }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 54, background: APPBG, overflow: "hidden", fontFamily: F.sans }}>
          <div style={{ position: "absolute", left: 24, right: 24, top: 40 + push(0), height: H - 20, borderRadius: 22, background: "#fff", border: `5px solid ${LIME}`, padding: 16 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 700, fontSize: 24, color: C.ink, marginBottom: 10 }}><Icon name="store" size={26} color={OK} />{STORE}</div>
            <PostImg h={150} />
          </div>
          {ins.map((t, i) => (
            <div key={i} style={{ position: "absolute", left: 24, right: 24, top: 40 - H * (1 - sp(t, 14)) + push(i + 1), height: H - 20, borderRadius: 22, background: "#fff", border: `3px solid ${LINE}`, padding: 16, opacity: frame >= f(t) ? 1 : 0 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 700, fontSize: 24, color: "#6B7280", marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: ["#FDE68A", "#FBCFE8", "#BAE6FD", "#DDD6FE"][i % 4] }} />{names[i]}
              </div>
              <div style={{ height: 150, borderRadius: 18, background: ["#E5E7EB", "#F3F4F6"][i % 2] }} />
            </div>
          ))}
        </div>
      </div>
      {frame > f(ins[3]) && (
        <div style={{ position: "absolute", bottom: -10, left: "50%", transform: `translate(-50%, ${float(frame, 0, 12)}px) scale(${sp(ins[3])})`, width: 96, height: 96, borderRadius: "50%", background: LIME, border: `5px solid ${C.ink}`, display: "grid", placeItems: "center" }}>
          <Icon name="arrow-down" size={56} color={C.ink} stroke={3} />
        </div>
      )}
    </div>
  );
};

// 4 · Tulis post: text typed tonight, Kapan changes to tomorrow 12.00, Jadwalkan pressed → Menunggu.
export const PoCompose: React.FC<{ at: [number, number, number, number]; dur: number }> = ({ at: [typeAt, dayAt, timeAt, press] }) => {
  const { frame, f, sp } = useT();
  const text = "Promo bolu pandan Jumat ini. Beli 2 gratis 1!";
  const shown = Math.floor(interpolate(frame, [f(typeAt), f(typeAt + 1.6)], [0, text.length], clamp));
  const cur = frame < f(dayAt - 0.4) ? { x: 520, y: 330 } : frame < f(timeAt - 0.2) ? { x: 230, y: 610 } : frame < f(press - 0.5) ? { x: 470, y: 610 } : { x: 190, y: 760 };
  const k = Math.min(1, sp(frame < f(dayAt - 0.4) ? 0 : frame < f(timeAt - 0.2) ? dayAt - 0.4 : frame < f(press - 0.5) ? timeAt - 0.2 : press - 0.5, 16));
  const done = frame >= f(press);
  return (
    <div style={{ position: "relative", width: 940, height: 1000 }}>
      {Array.from({ length: 10 }, (_, i) => <Sfx key={i} name="type" at={f(typeAt) + i * 5} volume={0.25} />)}
      <Sfx name="blip" at={f(dayAt)} volume={0.4} /><Sfx name="blip" at={f(timeAt)} volume={0.4} />
      <Sfx name="tap" at={f(press)} volume={0.5} /><Sfx name="ding" at={f(press + 0.25)} volume={0.4} />
      <Panel title="Tulis post" icon="pen-line" style={{ position: "absolute", top: 40, transform: `translateY(${(1 - sp(0, 14)) * 120}px)` }}>
        <div style={{ padding: 30, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 26 }}>Teks</div>
          <div style={{ minHeight: 150, background: "#fff", borderRadius: 18, border: `3px solid ${frame < f(typeAt + 1.6) ? OK : LINE}`, padding: 20, fontSize: 32, lineHeight: 1.35 }}>
            {text.slice(0, shown)}{frame < f(typeAt + 1.8) && <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>|</span>}
          </div>
          <div><Pill><Icon name="feather" size={24} color={C.ink} />Tulis caption dengan AI</Pill></div>
          <div style={{ fontWeight: 700, fontSize: 26, marginTop: 6 }}>Kapan</div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Pill style={{ fontSize: 30, padding: "12px 24px", borderColor: frame >= f(dayAt) ? OK : LINE, transform: `scale(${1 + 0.12 * tapAt(frame, f(dayAt))})` }}><Icon name="calendar" size={28} color={C.ink} />{frame >= f(dayAt) ? "06/11/2026" : "05/11/2026"}</Pill>
            <Pill style={{ fontSize: 30, padding: "12px 24px", borderColor: frame >= f(timeAt) ? OK : LINE, transform: `scale(${1 + 0.12 * tapAt(frame, f(timeAt))})` }}><Icon name="clock" size={28} color={C.ink} />{frame >= f(timeAt) ? "12.00" : "23.07"}</Pill>
            <span style={{ fontSize: 22, color: "#6B7280" }}>Asia/Jakarta</span>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 10 }}>
            <Pill lime style={{ fontSize: 30, padding: "14px 28px", transform: `scale(${1 - 0.1 * tapAt(frame, f(press))})` }}><Icon name="clock" size={28} color={C.ink} />Jadwalkan</Pill>
            <Pill style={{ fontSize: 28, padding: "14px 24px" }}><Icon name="send" size={26} color={C.ink} />Posting sekarang</Pill>
          </div>
        </div>
      </Panel>
      <Cursor x={interpolate(k, [0, 1], [cur.x + 60, cur.x])} y={interpolate(k, [0, 1], [cur.y + 60, cur.y]) + 40} tap={tapAt(frame, f(press)) + tapAt(frame, f(dayAt)) + tapAt(frame, f(timeAt))} />
      {done && (
        <div style={{ position: "absolute", left: 80, right: 80, top: 860, display: "flex", alignItems: "center", gap: 18, background: "#fff", borderRadius: 22, border: `4px solid ${C.ink}`, padding: "16px 24px", fontFamily: F.sans, fontSize: 28, fontWeight: 700, color: C.ink, boxShadow: cardShadow, transform: `translateY(${(1 - sp(press + 0.25)) * 80}px) scale(${Math.min(1, sp(press + 0.25))})` }}>
          <span style={{ fontFamily: F.stamp, fontSize: 40 }}>Jum 12.00</span>
          <span style={{ flex: 1, fontWeight: 500, fontSize: 24, color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Promo bolu pandan…</span>
          <Status s="wait" />
        </div>
      )}
    </div>
  );
};

// 5 · Posting ke: accounts ticked one by one (synced to the VO), each adds its own character counter.
export const PoAccounts: React.FC<{ at: number[]; dur: number }> = ({ at }) => {
  const { frame, f, sp } = useT();
  const list: Pl[] = ["instagram", "facebook", "threads", "tiktok", "linkedin"];
  const cur = at.findIndex((t) => frame < f(t));
  const target = cur === -1 ? list.length - 1 : cur;
  const y = 150 + target * 104;
  return (
    <div style={{ position: "relative", width: 940, height: 1000 }}>
      {at.map((t, i) => <Sfx key={i} name="check" at={f(t)} volume={0.4} />)}
      {at.map((t, i) => <Sfx key={`c${i}`} name="pop" at={f(t + 0.15)} volume={0.3} />)}
      <Panel title="Posting ke" icon="send" right={<Pill lime>{at.filter((t) => frame >= f(t)).length} akun</Pill>} style={{ position: "absolute", top: 20, transform: `translateY(${(1 - sp(0, 14)) * 120}px)` }}>
        <div style={{ padding: "18px 30px", display: "flex", flexDirection: "column", gap: 12 }}>
          {list.map((p, i) => {
            const on = frame >= f(at[i]);
            return (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 22px", borderRadius: 20, background: on ? "#ECFCCB" : "#fff", border: `3px solid ${on ? OK : LINE}`, fontSize: 32, fontWeight: 700, transform: on ? squash(frame, f(at[i]), 0.12) : undefined }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, border: `3px solid ${on ? OK : "#9CA3AF"}`, background: on ? OK : "#fff", display: "grid", placeItems: "center" }}>{on && <Icon name="check" size={30} color="#fff" stroke={3.5} />}</div>
                <Icon name={PL[p].icon} size={40} color={C.ink} />
                <span style={{ flex: 1 }}>{PL[p].name}</span>
                <span style={{ fontWeight: 500, fontSize: 26, color: "#6B7280" }}>@tokosekar</span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "6px 30px 26px", display: "flex", flexWrap: "wrap", gap: "8px 22px", fontSize: 24, color: "#6B7280", minHeight: 100 }}>
          {list.map((p, i) => frame >= f(at[i]) && <span key={p} style={{ opacity: Math.min(1, sp(at[i] + 0.15) * 2) }}>{PL[p].name}: 46 / {PL[p].max}</span>)}
        </div>
      </Panel>
      <Cursor x={760} y={y + 60} tap={at.reduce((a, t) => a + tapAt(frame, f(t)), 0)} />
    </div>
  );
};

// 6 · Jadwal, tampilan Minggu: posts pop into the week, then one is dragged to another day and time.
export const PoWeek: React.FC<{ at: [number, number]; dur: number }> = ({ at: [fillEnd, drag] }) => {
  const { frame, f, sp } = useT();
  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const hours = ["09.00", "12.00", "16.00", "19.00"];
  const posts: [number, number, Pl][] = [[0, 1, "instagram"], [1, 3, "threads"], [2, 3, "facebook"], [3, 0, "linkedin"], [4, 1, "instagram"], [5, 2, "tiktok"], [6, 3, "threads"]];
  const CW = 112, RH = 150, X0 = 120, Y0 = 250;
  const dragged = 2;
  const d = interpolate(frame, [f(drag), f(drag + 0.6)], [0, 1], { ...clamp, easing: (t) => 1 - (1 - t) ** 3 });
  const lift = interpolate(frame, [f(drag) - 6, f(drag), f(drag + 0.6), f(drag + 0.6) + 6], [0, 1, 1, 0], clamp);
  const pos = (c: number, r: number) => ({ x: X0 + c * CW + 8, y: Y0 + r * RH + 12 });
  return (
    <div style={{ position: "relative", width: 940, height: 1000 }}>
      {posts.map((_, i) => <Sfx key={i} name="pop" at={f((i / posts.length) * fillEnd) + 4} volume={0.3} />)}
      <Sfx name="tap" at={f(drag) - 6} volume={0.4} /><Sfx name="whoosh" at={f(drag)} volume={0.35} /><Sfx name="p-thump" at={f(drag + 0.6)} volume={0.45} />
      <Panel title="Jadwal" right={<Pill lime><Icon name="pen-line" size={24} color={C.ink} />Tulis post</Pill>} style={{ position: "absolute", top: 20, height: 960, transform: `translateY(${(1 - sp(0, 14)) * 120}px)` }}>
        <div style={{ display: "flex", gap: 8, padding: "18px 26px" }}>
          <Pill on>Minggu</Pill><Pill>Bulan</Pill><Pill>Daftar</Pill>
          <span style={{ marginLeft: "auto", alignSelf: "center", fontWeight: 700, fontSize: 24 }}>9 Nov – 15 Nov 2026</span>
        </div>
        <div style={{ position: "relative" }}>
          {days.map((dd, i) => <div key={dd} style={{ position: "absolute", left: X0 + i * CW, top: 0, width: CW, textAlign: "center", fontSize: 22, color: "#6B7280" }}>{dd}<div style={{ fontWeight: 700, fontSize: 30, color: C.ink }}>{9 + i}</div></div>)}
          {hours.map((h, r) => <div key={h} style={{ position: "absolute", left: 20, top: 100 + r * RH, fontSize: 22, color: "#6B7280" }}>{h}</div>)}
          <div style={{ position: "absolute", left: X0, top: 90, width: CW * 7, height: RH * 4, display: "grid", gridTemplateColumns: `repeat(7, ${CW}px)`, gridTemplateRows: `repeat(4, ${RH}px)` }}>
            {Array.from({ length: 28 }, (_, i) => <div key={i} style={{ borderLeft: `2px solid ${LINE}`, borderTop: `2px solid ${LINE}`, background: "#FAFAF7" }} />)}
          </div>
        </div>
      </Panel>
      {posts.map(([c, r, p], i) => {
        const s = sp((i / posts.length) * fillEnd + 0.13, 11);
        const a = pos(c, r), b = pos(3, 1);
        const isD = i === dragged;
        const x = isD ? interpolate(d, [0, 1], [a.x, b.x]) : a.x;
        const y = isD ? interpolate(d, [0, 1], [a.y, b.y]) - lift * 20 : a.y;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y + 20, width: CW - 16, height: 112, borderRadius: 14, background: isD ? LIME : "#ECFCCB", border: `3px solid ${OK}`, padding: 8, fontFamily: F.sans, fontSize: 18, fontWeight: 700, color: C.ink, transform: `scale(${Math.min(1, s) * (1 + lift * 0.12)}) rotate(${lift * -5}deg)`, boxShadow: lift > 0 ? `0 ${16 * lift}px 24px #0003` : "none", zIndex: isD ? 5 : 1 }}>
            <Icon name={PL[p].icon} size={26} color={C.ink} />
            <div>{isD && d > 0.5 ? "12.00" : hours[r]}</div>
            <div style={{ fontWeight: 500, fontSize: 15, color: "#4B5563" }}>bolu pandan</div>
          </div>
        );
      })}
      {frame > f(drag) - 20 && (
        <Cursor x={interpolate(d, [0, 1], [pos(2, 3).x + 60, pos(3, 1).x + 60])} y={interpolate(d, [0, 1], [pos(2, 3).y + 80, pos(3, 1).y + 80]) - lift * 20} tap={lift * 0.6} />
      )}
      <Particles at={f(drag + 0.6)} n={8} seed="wk" x={pos(3, 1).x + 50} y={pos(3, 1).y + 70} speed={9} item={() => <Spark size={30} />} />
    </div>
  );
};

// 7 · Daftar: yesterday's post (Tayang) gets hearts, "Post lagi" is tapped and a copy lands next week as Menunggu.
export const PoRepost: React.FC<{ at: [number, number]; dur: number }> = ({ at: [hearts, tap] }) => {
  const { frame, f, sp } = useT();
  const copy = sp(tap + 0.2, 12);
  const Card: React.FC<{ day: string; s: "live" | "wait"; style?: React.CSSProperties; glow?: boolean }> = ({ day, s, style, glow }) => (
    <div style={{ background: "#fff", borderRadius: 22, border: `3px solid ${glow ? OK : LINE}`, padding: 22, ...style }}>
      <div style={{ fontWeight: 700, fontSize: 24, color: "#6B7280", marginBottom: 12 }}>{day}</div>
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ fontFamily: F.stamp, fontSize: 44 }}>12.00</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>Promo bolu pandan Jumat ini. Beli 2 gratis 1!</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(["instagram", "facebook"] as Pl[]).map((p) => (
              <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `2px solid ${LINE}`, borderRadius: 12, padding: "4px 10px", fontSize: 22 }}><Icon name={PL[p].icon} size={22} color={C.ink} />{PL[p].name}<Status s={s} size={20} /></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div style={{ position: "relative", width: 940, height: 1000 }}>
      {Array.from({ length: 6 }, (_, i) => <Sfx key={i} name="p-heart" at={f(hearts) + i * 4} volume={0.25} />)}
      <Sfx name="tap" at={f(tap)} volume={0.5} /><Sfx name="whip" at={f(tap + 0.2)} volume={0.35} /><Sfx name="coin" at={f(tap + 0.6)} volume={0.4} />
      <Panel title="Jadwal" right={<span style={{ display: "flex", gap: 8 }}><Pill>Minggu</Pill><Pill on>Daftar</Pill></span>} style={{ position: "absolute", top: 20, transform: `translateY(${(1 - sp(0, 14)) * 120}px)` }}>
        <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 18 }}>
          <Card day="Jumat, 13 November 2026" s="live" />
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: -6 }}>
            <Pill lime style={{ fontSize: 30, padding: "12px 26px", transform: `scale(${1 - 0.12 * tapAt(frame, f(tap)) + 0.06 * Math.max(0, Math.sin(frame / 5)) * (frame < f(tap) && frame > f(tap - 0.8) ? 1 : 0)})` }}><Icon name="repeat" size={28} color={C.ink} />Post lagi</Pill>
            <Pill style={{ fontSize: 26, color: "#DC2626" }}><Icon name="trash" size={24} color="#DC2626" />Hapus</Pill>
          </div>
          <div style={{ height: 300, opacity: Math.min(1, copy * 2), transform: `translateY(${(1 - copy) * -220}px) scale(${0.85 + 0.15 * Math.min(1, copy)})` }}>
            <Card day="Jumat, 20 November 2026" s="wait" glow />
          </div>
        </div>
      </Panel>
      <Cursor x={interpolate(sp(tap - 0.6, 16), [0, 1], [760, 520])} y={interpolate(sp(tap - 0.6, 16), [0, 1], [620, 440])} tap={tapAt(frame, f(tap))} />
      {Array.from({ length: 6 }, (_, i) => {
        const t = frame - f(hearts) - i * 4;
        if (t < 0 || t > 50) return null;
        return <div key={i} style={{ position: "absolute", left: 560 + random(`h${i}`) * 160, top: 300 - t * 4, opacity: interpolate(t, [0, 8, 40, 50], [0, 1, 1, 0]), transform: `scale(${0.8 + random(`hs${i}`) * 0.6}) rotate(${(random(`hr${i}`) - 0.5) * 30}deg)` }}><Icon name="heart" size={54} color="#EF4444" stroke={2.5} /></div>;
      })}
    </div>
  );
};

// 8 · Paket Gratis, honest limits, with a Beta stamp.
export const PoPlans: React.FC<{ at: [number, number, number, number]; dur: number }> = ({ at: [beta, a, b, c] }) => {
  const { frame, f, sp } = useT();
  const rows: [number, string, string][] = [[a, "users", "3 akun"], [b, "calendar-days", "30 post / bulan"], [c, "image", "Foto dan teks"]];
  return (
    <div style={{ position: "relative", width: 940, height: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Deco seed="plan" w={900} h={950} n={6} />
      <Sfx name="stamp" at={f(beta)} volume={0.5} />
      {rows.map(([t], i) => <Sfx key={i} name="check" at={f(t)} volume={0.45} />)}
      <div style={{ width: 760, background: "#fff", borderRadius: 36, border: `5px solid ${C.ink}`, boxShadow: cardShadow, padding: 44, fontFamily: F.sans, color: C.ink, transform: `translateY(${(1 - sp(0, 12)) * 150}px) rotate(${swing(frame, [0], 2)}deg)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Icon name="calendar-clock" size={56} color={OK} stroke={2.2} />
          <span style={{ fontWeight: 700, fontSize: 52, flex: 1 }}>Poseli</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 40, marginTop: 30, color: "#6B7280" }}>Paket Gratis</div>
        <div style={{ fontFamily: F.stamp, fontSize: 130, lineHeight: 1.1 }}>Rp0</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
          {rows.map(([t, icon, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 44, fontWeight: 700, opacity: Math.min(1, sp(t) * 2), transform: `translateX(${(1 - Math.min(1, sp(t))) * -60}px)` }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: LIME, display: "grid", placeItems: "center" }}><Icon name={icon} size={38} color={C.ink} stroke={2.2} /></div>
              {label}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", right: 70, top: 150, fontFamily: F.stamp, fontSize: 90, border: `8px solid ${C.ink}`, background: LIME, color: C.ink, padding: "0 30px", borderRadius: 18, boxShadow: `10px 10px 0 ${C.ink}`, opacity: Math.min(1, sp(beta) * 2.5), transform: `rotate(10deg) scale(${interpolate(Math.min(1, sp(beta)), [0, 1], [2.4, 1])})` }}>BETA</div>
    </div>
  );
};

// 9 · Callback: the sleepers wake up to a sunny 12.00 and the scheduled post flips from Menunggu to Tayang.
export const PoMorning: React.FC<{ at: [number, number]; dur: number }> = ({ at: [live, wake] }) => {
  const { frame, f, sp } = useT();
  return (
    <div style={{ position: "relative", width: 940, height: 1000, borderRadius: 40, background: "linear-gradient(180deg, #FEF9C3, #ECFCCB)", overflow: "hidden", border: `4px solid ${C.ink}` }}>
      <Sfx name="p-chime" at={4} volume={0.35} /><Sfx name="ding" at={f(live)} volume={0.45} />
      {[0, 1, 2].map((i) => <Sfx key={i} name="pop" at={f(wake - 0.6) + i * 6} volume={0.35} />)}
      <Sfx name="p-yay" at={f(wake)} volume={0.35} />
      <div style={{ position: "absolute", left: 600, top: interpolate(sp(0, 20), [0, 1], [500, 60]), transform: `rotate(${frame * 0.8}deg)` }}><Icon name="sun" size={240} color="#F59E0B" stroke={1.6} /></div>
      <div style={{ position: "absolute", left: 60, top: 90, fontFamily: F.stamp, fontSize: 150, color: C.ink, transform: `scale(${Math.min(1, sp(0.1))})` }}>12.00</div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 330, background: "#fff", borderRadius: 26, border: `4px solid ${C.ink}`, padding: 22, fontFamily: F.sans, boxShadow: cardShadow, transform: `translateY(${(1 - Math.min(1, sp(0.2))) * 100}px) ${frame > f(live) ? squash(frame, f(live), 0.1) : ""}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 700, fontSize: 28, color: C.ink }}>
          <Icon name="store" size={30} color={OK} />{STORE}
          <span style={{ marginLeft: "auto" }}><Status s={frame >= f(live) ? "live" : "wait"} size={28} /></span>
        </div>
        <div style={{ fontSize: 26, margin: "10px 0 0", color: C.ink }}>Promo bolu pandan Jumat ini. Beli 2 gratis 1!</div>
      </div>
      {[0, 1, 2].map((i) => {
        const s = sp(wake - 0.6 + i * 0.2, 10);
        return (
          <div key={i} style={{ position: "absolute", left: 90 + i * 280, top: 700 - Math.min(1, s) * 60 + float(frame, i, 6), transform: `scale(${Math.min(1.1, s)})` }}>
            <Face size={150} awake={Math.min(1, s)} hue={HUES[i]} />
            {frame > f(wake) && <div style={{ position: "absolute", left: 100, top: -50, transform: `scale(${sp(wake + i * 0.1)})` }}><Icon name="heart" size={56} color="#EF4444" stroke={2.5} /></div>}
          </div>
        );
      })}
      <Particles at={f(wake)} n={14} seed="mrn" x={470} y={680} speed={12} item={() => <Spark size={34} />} />
    </div>
  );
};
