// More UI mockups: Melidoc extraction + calculation, Melisense mention dashboard, flow diagram, glossary card.
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "./sfx";
import { C, F, cardShadow, clamp, enter, pop } from "./theme";
import { Icon } from "./Visuals";

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, p: (d = 0) => pop(frame, fps, d) };
};
const panelStyle = (): React.CSSProperties => ({ background: C.card, border: `4px solid ${C.ink}`, boxShadow: cardShadow, borderRadius: 28, overflow: "hidden" });
const Badge: React.FC<{ children: React.ReactNode; tone?: "ok" | "bad" | "plain"; style?: React.CSSProperties }> = ({ children, tone = "plain", style }) => (
  <span style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 24, padding: "5px 16px", borderRadius: 20, whiteSpace: "nowrap", background: tone === "ok" ? C.emBg : tone === "bad" ? C.ink : "transparent", color: tone === "bad" ? "#fff" : C.ink, border: `3px solid ${tone === "ok" ? C.emBg : tone === "bad" ? C.ink : C.ghost}`, ...style }}>{children}</span>
);
const Head: React.FC<{ icon: string; title: string; right?: React.ReactNode }> = ({ icon, title, right }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 28px", borderBottom: `3px solid ${C.ghost}`, fontFamily: F.sans, fontWeight: 700, fontSize: 36, color: C.ink }}>
    <div style={{ width: 56, height: 56, borderRadius: 16, background: C.emBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={34} color={C.ink} stroke={2.2} /></div>
    <span style={{ flex: 1 }}>{title}</span>
    {right}
  </div>
);

// Melidoc: a scan beam reads the document, then fields fill in one by one with a pass/fail check each.
export const Extract: React.FC<{ doc: string; fields: { label: string; value: string; ok?: boolean; note?: string }[]; dur: number }> = ({ doc, fields, dur }) => {
  const { frame, p } = useT();
  const scanEnd = Math.min(30, dur * 0.2);
  const step = (dur * 0.6 - scanEnd) / fields.length;
  const at = (i: number) => scanEnd + 4 + i * step;
  const done = frame > at(fields.length - 1) + 12;
  const failed = fields.some((f) => f.ok === false);
  return (
    <div style={{ width: 920, ...panelStyle(), ...enter(p(2), 80) }}>
      <Sfx name="whoosh" at={4} volume={0.3} />
      {fields.map((f, i) => <Sfx key={i} name="type" at={at(i)} volume={0.3} />)}
      {fields.map((f, i) => f.ok !== undefined && <Sfx key={`c${i}`} name={f.ok ? "check" : "x"} at={at(i) + 10} volume={0.35} />)}
      <Sfx name={failed ? "punch" : "coin"} at={at(fields.length - 1) + 12} volume={0.45} />
      <Head icon="scan-text" title={doc} right={done ? <span style={{ transform: `scale(${p(at(fields.length - 1) + 12)})` }}><Badge tone={failed ? "bad" : "ok"}>{failed ? "Perlu review" : "Siap disetujui"}</Badge></span> : <Badge>Membaca…</Badge>} />
      <div style={{ position: "relative", margin: "22px 28px 8px", height: 150, borderRadius: 14, background: "#F9FAFB", border: `3px solid ${C.ghost}`, overflow: "hidden", padding: "18px 24px" }}>
        {[0.5, 0.8, 0.65, 0.9, 0.4].map((w, i) => <div key={i} style={{ height: 12, width: `${w * 100}%`, background: "#E5E7EB", borderRadius: 6, marginBottom: 14 }} />)}
        <div style={{ position: "absolute", left: 0, right: 0, top: `${interpolate(frame, [4, scanEnd], [0, 100], clamp)}%`, height: 8, background: C.emBg, boxShadow: `0 0 30px 12px ${C.emBg}`, opacity: frame < scanEnd ? 1 : 0 }} />
      </div>
      <div style={{ padding: "8px 28px 24px" }}>
        {fields.map((f, i) => {
          if (frame < at(i)) return null;
          const typed = f.value.slice(0, Math.floor((frame - at(i)) * 1.6));
          const checked = f.ok !== undefined && frame > at(i) + 10;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: `2px solid ${C.ghost}`, fontFamily: F.sans, ...enter(p(at(i)), 20) }}>
              <span style={{ width: 230, fontSize: 26, color: C.muted }}>{f.label}</span>
              <span style={{ flex: 1, fontSize: 32, fontWeight: 700, color: C.ink }}>{typed}</span>
              {checked && (
                <span style={{ display: "flex", alignItems: "center", gap: 8, transform: `scale(${p(at(i) + 10)})` }}>
                  {f.note && <span style={{ fontSize: 22, color: f.ok ? C.muted : C.ink, fontWeight: 700 }}>{f.note}</span>}
                  <span style={{ width: 44, height: 44, borderRadius: 22, background: f.ok ? C.emBg : C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name={f.ok ? "check" : "x"} size={28} color={f.ok ? C.ink : "#fff"} stroke={3} />
                  </span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Receipt-style calculation: rows print one by one, the result gets stamped.
export const Calc: React.FC<{ title?: string; rows: { label: string; value: string; op?: string }[]; result: { label: string; value: string }; dur: number }> = ({ title, rows, result, dur }) => {
  const { frame, p } = useT();
  const step = (dur * 0.55) / (rows.length + 1);
  const resAt = 6 + rows.length * step + 6;
  return (
    <div style={{ width: 860, ...panelStyle(), ...enter(p(2), 80, "rotate(-1deg)") }}>
      {rows.map((_, i) => <Sfx key={i} name="tick" at={6 + i * step} volume={0.45} />)}
      <Sfx name="stamp" at={resAt} volume={0.5} />
      {title && <Head icon="calculator" title={title} />}
      <div style={{ padding: "18px 36px 30px", fontFamily: F.sans }}>
        {rows.map((r, i) => {
          const s = p(6 + i * step);
          if (s <= 0) return null;
          return (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "16px 0", borderBottom: `3px dashed ${C.ghost}`, ...enter(s, 20) }}>
              <span style={{ width: 50, fontFamily: F.mono, fontSize: 40, fontWeight: 700, color: C.red }}>{r.op ?? ""}</span>
              <span style={{ flex: 1, fontSize: 32, color: C.muted }}>{r.label}</span>
              <span style={{ fontFamily: F.mono, fontSize: 38, fontWeight: 700, color: C.ink }}>{r.value}</span>
            </div>
          );
        })}
        {frame > resAt && (
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 22, padding: "20px 24px", borderRadius: 18, background: C.emBg, transform: `scale(${interpolate(p(resAt), [0, 1], [1.6, 1])}) rotate(-2deg)`, opacity: Math.min(1, p(resAt) * 2) }}>
            <span style={{ flex: 1, fontSize: 34, fontWeight: 700, color: C.ink }}>{result.label}</span>
            <span style={{ fontFamily: F.stamp, fontSize: 64, color: C.ink }}>{result.value}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const SRC: Record<string, string> = { instagram: "instagram", x: "at-sign", telegram: "send", berita: "newspaper" };
const TONE = { positif: "ok", netral: "plain", negatif: "bad" } as const;

// Melisense: daily mention bars (last one can spike), sentiment split, streaming mentions, optional alert banner.
export const Mentions: React.FC<{ topic: string; bars?: number[]; items: { source: "instagram" | "x" | "telegram" | "berita"; user: string; text: string; sentiment: "positif" | "netral" | "negatif" }[]; alert?: string; dur: number }> = ({ topic, bars = [3, 4, 3, 5, 4, 4, 5], items, alert, dur }) => {
  const { frame, p } = useT();
  const max = Math.max(...bars);
  const step = (dur * 0.5) / items.length;
  const itemAt = (i: number) => 24 + i * step;
  const alertAt = itemAt(items.length - 1) + 14;
  const seen = items.filter((_, i) => frame >= itemAt(i));
  const share = (s: string) => (seen.length ? seen.filter((x) => x.sentiment === s).length / seen.length : 0);
  return (
    <div style={{ width: 920, ...panelStyle(), ...enter(p(2), 80) }}>
      {bars.map((_, i) => <Sfx key={i} name="blip" at={6 + i * 2} volume={0.25} />)}
      {items.map((it, i) => <Sfx key={`m${i}`} name={it.sentiment === "negatif" ? "x" : "pop"} at={itemAt(i)} volume={0.35} />)}
      {alert && <Sfx name="ding" at={alertAt} volume={0.55} />}
      {alert && <Sfx name="boom" at={alertAt} volume={0.35} />}
      <Head icon="radar" title={`Pemantauan: ${topic}`} right={<Badge>7 hari</Badge>} />
      <div style={{ padding: "20px 28px 6px", display: "flex", alignItems: "flex-end", gap: 14, height: 190 }}>
        {bars.map((b, i) => {
          const h = interpolate(frame, [6 + i * 2, 20 + i * 2], [0, b / max], clamp);
          const spike = i === bars.length - 1 && b > max * 0.8 && alert;
          return <div key={i} style={{ flex: 1, height: `${h * 100}%`, borderRadius: "10px 10px 0 0", background: spike ? C.ink : C.red, opacity: spike ? 1 : 0.85 }} />;
        })}
      </div>
      <div style={{ padding: "0 28px", fontFamily: F.sans, fontSize: 22, color: C.muted }}>Mention per hari</div>
      <div style={{ display: "flex", height: 26, margin: "16px 28px", borderRadius: 13, overflow: "hidden", background: C.ghost }}>
        <div style={{ width: `${share("positif") * 100}%`, background: C.emBg }} />
        <div style={{ width: `${share("netral") * 100}%`, background: "#D1D5DB" }} />
        <div style={{ width: `${share("negatif") * 100}%`, background: C.ink }} />
      </div>
      <div style={{ display: "flex", gap: 10, padding: "0 28px 12px" }}>
        <Badge tone="ok">Positif {Math.round(share("positif") * 100)}%</Badge>
        <Badge>Netral {Math.round(share("netral") * 100)}%</Badge>
        <Badge tone="bad">Negatif {Math.round(share("negatif") * 100)}%</Badge>
      </div>
      {items.map((it, i) => {
        if (frame < itemAt(i)) return null;
        return (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "center", padding: "16px 28px", borderTop: `2px solid ${C.ghost}`, fontFamily: F.sans, ...enter(p(itemAt(i)), 30) }}>
            <Icon name={SRC[it.source]} size={40} color={C.muted} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 26, color: C.ink }}>{it.user}</div>
              <div style={{ fontSize: 28, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.text}</div>
            </div>
            <Badge tone={TONE[it.sentiment]}>{it.sentiment}</Badge>
          </div>
        );
      })}
      {alert && frame > alertAt && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: 20, padding: "18px 22px", borderRadius: 18, background: C.ink, color: "#fff", fontFamily: F.sans, fontWeight: 700, fontSize: 30, transform: `scale(${p(alertAt)}) rotate(${Math.sin(frame / 2) * (frame < alertAt + 12 ? 2 : 0)}deg)` }}>
          <Icon name="siren" size={44} color={C.emBg} /> {alert}
        </div>
      )}
    </div>
  );
};

// Flow diagram: nodes appear top-to-bottom in a zigzag, connectors draw, a packet travels the path.
export const Flow: React.FC<{ nodes: { icon: string; label: string }[]; dur: number }> = ({ nodes, dur }) => {
  const { frame, p } = useT();
  const step = (dur * 0.7) / nodes.length;
  const pos = (i: number) => ({ x: i % 2 ? 560 : 80, y: i * (980 / nodes.length) });
  const k = interpolate(frame, [6, 6 + (nodes.length - 1) * step], [0, nodes.length - 1], clamp);
  const a = pos(Math.floor(k));
  const b = pos(Math.min(nodes.length - 1, Math.floor(k) + 1));
  const f = k - Math.floor(k);
  return (
    <div style={{ position: "relative", width: 900, height: 1000 }}>
      {nodes.map((_, i) => <Sfx key={i} name="pop" at={6 + i * step} volume={0.4} />)}
      {nodes.slice(1).map((_, i) => <Sfx key={`w${i}`} name="whip" at={6 + i * step + step * 0.3} volume={0.25} />)}
      <svg width={900} height={1000} style={{ position: "absolute", inset: 0 }}>
        {nodes.slice(1).map((_, i) => {
          const s = pos(i), e = pos(i + 1);
          const len = interpolate(frame, [6 + i * step, 6 + (i + 1) * step], [0, 1], clamp);
          return <line key={i} x1={s.x + 130} y1={s.y + 80} x2={s.x + 130 + (e.x - s.x) * len} y2={s.y + 80 + (e.y - s.y) * len} stroke={C.red} strokeWidth={10} strokeDasharray="22 14" strokeLinecap="round" />;
        })}
      </svg>
      {nodes.map((n, i) => {
        const s = p(6 + i * step);
        const { x, y } = pos(i);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 260, padding: "18px 14px", borderRadius: 26, background: C.card, border: `4px solid ${C.ink}`, boxShadow: cardShadow, textAlign: "center", fontFamily: F.sans, fontWeight: 700, fontSize: 30, color: C.ink, ...enter(s, 40) }}>
            <div style={{ width: 78, height: 78, margin: "0 auto 8px", borderRadius: 22, background: k >= i - 0.05 ? C.emBg : C.ghost, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={n.icon} size={46} color={C.ink} stroke={2} /></div>
            {n.label}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: a.x + 130 + (b.x - a.x) * f - 22, top: a.y + 80 + (b.y - a.y) * f - 22, width: 44, height: 44, borderRadius: 22, background: C.ink, border: `6px solid ${C.emBg}`, opacity: frame > 6 && k < nodes.length - 1 ? 1 : 0 }} />
    </div>
  );
};

// Glossary card: term stamps in, pronunciation, meaning types out, example pops.
export const Define: React.FC<{ term: string; say?: string; meaning: string; example?: string; dur: number }> = ({ term, say, meaning, example, dur }) => {
  const { frame, p } = useT();
  const typeAt = 18;
  const exAt = Math.min(dur - 20, typeAt + meaning.length / 1.5 + 8);
  return (
    <div style={{ width: 900, padding: "40px 44px", ...panelStyle(), ...enter(p(2), 80, "rotate(-1deg)") }}>
      <Sfx name="stamp" at={6} volume={0.5} />
      {Array.from({ length: Math.ceil(meaning.length / 1.5 / 5) }, (_, i) => <Sfx key={i} name="type" at={typeAt + i * 5} volume={0.2} />)}
      {example && <Sfx name="pop" at={exAt} volume={0.45} />}
      <div style={{ display: "flex", alignItems: "baseline", gap: 20, flexWrap: "wrap" }}>
        <span style={{ fontFamily: F.stamp, fontSize: 130, lineHeight: 1, color: C.ink, background: C.emBg, padding: "0 18px", transform: `scale(${interpolate(p(6), [0, 1], [1.8, 1])})`, display: "inline-block" }}>{term}</span>
        {say && <span style={{ fontFamily: F.mono, fontSize: 34, color: C.muted }}>/{say}/</span>}
      </div>
      <div style={{ fontFamily: F.sans, fontSize: 40, lineHeight: 1.35, color: C.ink, marginTop: 30, minHeight: 160 }}>{meaning.slice(0, Math.floor(Math.max(0, frame - typeAt) * 1.5))}</div>
      {example && frame > exAt && (
        <div style={{ marginTop: 24, padding: "18px 22px", borderLeft: `10px solid ${C.red}`, background: `${C.emBg}33`, borderRadius: 14, fontFamily: F.serif, fontStyle: "italic", fontSize: 38, color: C.ink, ...enter(p(exAt), 20) }}>{example}</div>
      )}
    </div>
  );
};
