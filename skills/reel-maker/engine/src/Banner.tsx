// YouTube channel banner (2560x1440 still), built in layers that reveal more the wider the screen:
// mobile 1546x423 = logo + tagline · tablet 1855x423 = mascots peek in · desktop 2560x423 = mascots whole · TV 2560x1440 = the whole "lab".
// Render: npx remotion still Banner out/banner/youtube-banner.png
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, F, bgStyle, setSkin } from "./theme";
import { Icon } from "./Visuals";

const W = 2560, H = 1440;
// Centered zones from YouTube's banner guide.
export const ZONES = { mobile: [1546, 423], tablet: [1855, 423], desktop: [2560, 423], tv: [2560, 1440] } as const;
const BAND_TOP = (H - 423) / 2; // 508.5

const card = (rot: number): React.CSSProperties => ({ position: "absolute", background: C.card, border: `7px solid ${C.ink}`, borderRadius: 32, boxShadow: `14px 14px 0 ${C.ink}`, transform: `rotate(${rot}deg)`, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 });
const Blob: React.FC<{ x: number; y: number; s: number; ring?: boolean }> = ({ x, y, s, ring }) => (
  <div style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: ring ? "transparent" : `${C.emBg}66`, border: ring ? `10px solid ${C.emBg}99` : "none" }} />
);

export const Banner: React.FC = () => {
  setSkin("lime");
  return (
    <AbsoluteFill style={{ ...bgStyle("paper"), width: W, height: H, overflow: "hidden", fontFamily: F.sans, color: C.ink }}>
      {[[120, 90, 160], [2280, 140, 120, 1], [900, 1180, 140], [1700, 60, 90, 1], [2350, 1150, 180], [60, 1200, 110, 1], [1250, 1300, 70], [600, 380, 60, 1], [1950, 1010, 70]].map(([x, y, s, r], i) => <Blob key={i} x={x} y={y} s={s} ring={!!r} />)}

      {/* ── TV only (above the band): the content series, as reel cards on a string */}
      <div style={{ position: "absolute", left: 140, right: 140, top: 120, height: 10, background: C.ink, borderRadius: 5 }} />
      <div style={{ ...card(-6), left: 230, top: 190, padding: "20px 44px" }}>
        <span style={{ fontFamily: F.stamp, fontSize: 120 }}><span style={{ fontSize: 60 }}>Rp</span>9.900</span>
      </div>
      <div style={{ ...card(4), left: 820, top: 170, padding: "34px 40px" }}>
        <Icon name="store" size={120} color={C.ink} stroke={2.2} />
        <span style={{ fontFamily: F.stamp, fontSize: 90, background: C.emBg, border: `6px solid ${C.ink}`, borderRadius: 18, padding: "0 20px" }}>VS</span>
        <Icon name="store" size={120} color={C.ink} stroke={2.2} />
      </div>
      <div style={{ ...card(-3), left: 1430, top: 200, padding: "26px 44px", borderRadius: "40px 40px 40px 8px" }}>
        <span style={{ fontWeight: 700, fontSize: 70 }}>kak, ready?</span>
      </div>
      <div style={{ ...card(7), left: 2040, top: 170, width: 230, height: 260, background: C.ink, borderColor: C.ink }}>
        <span style={{ fontFamily: F.stamp, fontSize: 200, color: C.emBg }}>?</span>
      </div>

      {/* ── the 423px band every device sees */}
      <div style={{ position: "absolute", left: 0, right: 0, top: BAND_TOP, height: 423, background: C.ink, borderTop: `10px solid ${C.ink}`, borderBottom: `10px solid ${C.ink}` }}>
        <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(-45deg, transparent 0 60px, #ffffff08 60px 120px)` }} />
      </div>
      {/* mobile-safe core 1546 wide: logo plate + tagline */}
      <div style={{ position: "absolute", left: (W - 1546) / 2 + 40, width: 1546 - 80, top: BAND_TOP + 50, height: 323, display: "flex", alignItems: "center", gap: 50 }}>
        <div style={{ height: 210, width: 470, background: "#fff", borderRadius: 40, border: `8px solid ${C.emBg}`, display: "flex", alignItems: "flex-start", justifyContent: "center", overflow: "hidden", flexShrink: 0, transform: "rotate(-2deg)" }}>
          <Img src={staticFile("img/brand/almeli-logo.png")} style={{ width: 560, marginTop: -72, flexShrink: 0 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontFamily: F.stamp, fontSize: 104, lineHeight: 1, color: "#fff" }}>
            TRIK JUALAN <span style={{ color: C.emBg }}>&</span> AI
          </div>
          <div style={{ fontFamily: F.stamp, fontSize: 104, lineHeight: 1 }}>
            <span style={{ background: C.emBg, color: C.ink, padding: "0 22px", borderRadius: 16, display: "inline-block", transform: "rotate(-2deg)" }}>DIBONGKAR SINGKAT</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontWeight: 700, fontSize: 44, color: "#fff", marginTop: 6 }}>
            <Icon name="circle-play" size={56} color={C.emBg} stroke={2.2} /> @almelilabs
          </div>
        </div>
      </div>
      {/* tablet edge (352 px each side) shows the mascots peeking in; desktop shows them whole */}
      <Img src={staticFile("img/brand/mascot-chameleon-laptop.png")} style={{ position: "absolute", left: 40, top: BAND_TOP - 60, width: 520, transform: "rotate(4deg)" }} />
      <Img src={staticFile("img/brand/mascot-penguin-waving.png")} style={{ position: "absolute", left: W - 560, top: BAND_TOP - 70, width: 520, transform: "scaleX(-1) rotate(4deg)" }} />

      {/* ── TV only (below the band): the products behind the channel */}
      <div style={{ position: "absolute", left: 0, right: 0, top: BAND_TOP + 423 + 110, display: "flex", justifyContent: "center", gap: 46 }}>
        {[["Melichat", "message-circle", "Balas chat 24 jam"], ["Melikas", "store", "Kasir & pesan dari HP"], ["Melidoc", "file-text", "Baca invoice otomatis"], ["Melibrain", "brain", "Tanya dokumen kantor"]].map(([name, icon, text], i) => (
          <div key={name} style={{ ...card(i % 2 ? 2 : -2), position: "relative", padding: "28px 38px", justifyContent: "flex-start" }}>
            <div style={{ width: 110, height: 110, borderRadius: 28, background: C.red, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={64} color="#fff" stroke={2.2} /></div>
            <div>
              <div style={{ fontSize: 58, fontWeight: 700 }}>{name}</div>
              <div style={{ fontSize: 34, color: "#3F3F46" }}>{text}</div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
