// Story poster (1080x1920 still): launch countdown for the four products. No date on purpose; `days` = days left on posting day.
// Render: npx remotion still Poster out/poster/countdown-h29.png --props='{"days":29}'
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, F, bgStyle, cardShadow, setSkin } from "./theme";
import { Icon } from "./Visuals";

export type PosterProps = { days: number };

const PRODUCTS = [
  { name: "doc", icon: "file-text", text: "Baca invoice & faktur otomatis" },
  { name: "brain", icon: "brain", text: "Tanya jawab dari dokumen kantor" },
  { name: "chat", icon: "message-circle", text: "Balas chat pelanggan\n24 jam nonstop" },
  { name: "kas", icon: "store", text: "Kasir & pesan dari HP" },
];

export const Poster: React.FC<PosterProps> = ({ days }) => {
  setSkin("lime");
  return (
    // Content kept inside y 230–1600: Instagram covers the top (profile bar) and bottom (reply box).
    <AbsoluteFill style={{ ...bgStyle("paper"), alignItems: "center", paddingTop: 230, fontFamily: F.sans, color: C.ink }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Img src={staticFile("img/almeli-logo.png")} style={{ width: 96, height: 96 }} />
        <span style={{ fontWeight: 700, fontSize: 46, letterSpacing: 1 }}>@almelilabs</span>
      </div>

      <div style={{ marginTop: 50, fontFamily: F.stamp, fontSize: 132, lineHeight: 1, textAlign: "center" }}>
        SEGERA <span style={{ background: C.emBg, padding: "0 18px", border: `7px solid ${C.ink}`, boxShadow: `8px 8px 0 ${C.ink}`, display: "inline-block", transform: "rotate(-3deg)" }}>RILIS</span>
      </div>

      <div style={{ marginTop: 60, display: "flex", alignItems: "center", gap: 34 }}>
        <div style={{ width: 360, height: 380, borderRadius: 44, background: C.ink, border: `8px solid ${C.emBg}`, boxShadow: `0 0 80px ${C.emBg}99`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <span style={{ fontFamily: F.stamp, fontSize: 300, color: C.emBg, lineHeight: 1 }}>{String(days).padStart(2, "0")}</span>
          <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 6, background: "#000a" }} />
        </div>
        <div style={{ fontFamily: F.stamp, fontSize: 110, lineHeight: 0.95 }}>
          HARI<br />LAGI
        </div>
      </div>

      <div style={{ marginTop: 70, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, width: 960 }}>
        {PRODUCTS.map((p) => (
          <div key={p.name} style={{ background: C.card, border: `5px solid ${C.ink}`, borderRadius: 30, boxShadow: cardShadow, padding: "26px 26px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 76, height: 76, borderRadius: 22, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={p.icon} size={46} color="#fff" stroke={2.2} />
              </div>
              <span style={{ fontSize: 50, fontWeight: 500 }}>Meli<b style={{ color: C.red }}>{p.name}</b></span>
            </div>
            <div style={{ fontSize: 32, lineHeight: 1.25, color: "#3F3F46", whiteSpace: "pre-line" }}>{p.text}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 56, display: "flex", alignItems: "center", gap: 16, padding: "18px 36px", borderRadius: 999, background: C.emBg, border: `5px solid ${C.ink}`, fontWeight: 700, fontSize: 36 }}>
        <Icon name="bell-ring" size={44} color={C.ink} stroke={2.4} />
        Follow @almelilabs, jangan sampai ketinggalan
      </div>
    </AbsoluteFill>
  );
};
