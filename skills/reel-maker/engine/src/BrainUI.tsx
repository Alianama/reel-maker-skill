// Knowledge-base UI mockups (file pile, upload, ask, sources, document page), modelled on the Melibrain app.
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "./sfx";
import { C, F, cardShadow, clamp, enter, pop } from "./theme";
import { Icon } from "./Visuals";

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, p: (d = 0) => pop(frame, fps, d) };
};
const panelStyle = (): React.CSSProperties => ({ background: C.card, border: `4px solid ${C.ink}`, boxShadow: cardShadow, borderRadius: 28, overflow: "hidden" });
const ext = (name: string) => name.split(".").pop()!.toUpperCase();
const Ext: React.FC<{ name: string; size?: number }> = ({ name, size = 64 }) => (
  <div style={{ width: size, height: size * 1.2, flexShrink: 0, borderRadius: 10, background: ext(name) === "PDF" ? C.red : C.ink, color: "#fff", fontFamily: F.sans, fontWeight: 700, fontSize: size * 0.28, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: size * 0.14 }}>{ext(name)}</div>
);
const Badge: React.FC<{ children: React.ReactNode; on?: boolean; style?: React.CSSProperties }> = ({ children, on, style }) => (
  <span style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 24, padding: "5px 16px", borderRadius: 20, background: on ? C.emBg : "transparent", color: C.ink, border: `3px solid ${on ? C.emBg : C.ghost}`, whiteSpace: "nowrap", ...style }}>{children}</span>
);
const Head: React.FC<{ icon: string; title: string; right?: React.ReactNode }> = ({ icon, title, right }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 28px", borderBottom: `3px solid ${C.ghost}`, fontFamily: F.sans, fontWeight: 700, fontSize: 36, color: C.ink }}>
    <div style={{ width: 56, height: 56, borderRadius: 16, background: C.emBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={34} color={C.ink} stroke={2.2} /></div>
    <span style={{ flex: 1 }}>{title}</span>
    {right}
  </div>
);

// Hook: files rain down into a messy heap while a search timer keeps running.
export const Pile: React.FC<{ files: string[]; total?: number; dur: number }> = ({ files, total = 248, dur }) => {
  const { frame, p } = useT();
  const n = 16;
  const drop = (i: number) => 4 + (i / n) * dur * 0.65;
  const mins = Math.floor(interpolate(frame, [0, dur], [0, 32], clamp));
  return (
    <div style={{ position: "relative", width: 940, height: 1000 }}>
      {Array.from({ length: n }, (_, i) => <Sfx key={i} name="note" at={drop(i)} volume={0.22} />)}
      {Array.from({ length: 8 }, (_, i) => <Sfx key={`t${i}`} name="tick" at={(i * dur) / 8} volume={0.3} />)}
      {Array.from({ length: n }, (_, i) => {
        const s = p(drop(i));
        if (s <= 0) return null;
        const x = 120 + random(`px${i}`) * 520;
        const y = 820 - Math.floor(i / 4) * 120 - random(`py${i}`) * 50;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: interpolate(s, [0, 1], [-300, y]), width: 300, display: "flex", gap: 14, alignItems: "center", padding: 14, background: C.card, borderRadius: 16, boxShadow: cardShadow, transform: `rotate(${(random(`pr${i}`) - 0.5) * 40}deg)`, fontFamily: F.sans, fontWeight: 700, fontSize: 22, color: C.ink }}>
            <Ext name={files[i % files.length]} size={46} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{files[i % files.length]}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 40, left: 70, right: 70, display: "flex", alignItems: "center", gap: 18, padding: "22px 28px", background: C.card, borderRadius: 40, boxShadow: cardShadow, border: `4px solid ${C.ink}`, fontFamily: F.sans, fontSize: 34, color: C.muted, ...enter(p(2), -60) }}>
        <Icon name="search" size={42} color={C.ink} />
        <span style={{ flex: 1 }}>cari aturan cuti…</span>
        <span style={{ fontFamily: F.mono, fontSize: 40, fontWeight: 700, color: "#fff", background: C.red, padding: "4px 16px", borderRadius: 12 }}>{String(mins).padStart(2, "0")}:{String((frame * 7) % 60).padStart(2, "0")}</span>
      </div>
      <div style={{ position: "absolute", top: 170, right: 70, fontFamily: F.stamp, fontSize: 64, color: C.ink, background: C.emBg, padding: "2px 20px", borderRadius: 12, transform: `rotate(4deg) scale(${p(10)})` }}>{Math.round(interpolate(frame, [4, dur * 0.7], [12, total], clamp))} FILE</div>
    </div>
  );
};

// Upload into a knowledge base: files slide in, "Membaca" spins, then "Siap" with page count.
export const Upload: React.FC<{ base: string; files: { name: string; pages?: number; ocr?: boolean }[]; dur: number }> = ({ base, files, dur }) => {
  const { frame, p } = useT();
  const step = (dur * 0.55) / files.length;
  const readFor = Math.min(24, step * 1.4);
  return (
    <div style={{ width: 920, ...panelStyle(), ...enter(p(2), 80) }}>
      {files.map((_, i) => <Sfx key={i} name="whip" at={8 + i * step} volume={0.3} />)}
      {files.map((_, i) => <Sfx key={`r${i}`} name="check" at={8 + i * step + readFor} volume={0.3} />)}
      <Head icon="book-open" title={base} right={<Badge>{files.filter((_, i) => frame > 8 + i * step + readFor).length} dokumen</Badge>} />
      <div style={{ margin: 24, padding: "22px 20px", border: `4px dashed ${C.muted}`, borderRadius: 22, textAlign: "center", fontFamily: F.sans, color: C.muted }}>
        <Icon name="upload" size={48} color={C.red} />
        <div style={{ fontWeight: 700, fontSize: 32, color: C.ink, marginTop: 6 }}>Unggah dokumen</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
          {["PDF", "DOCX", "TXT", "MD", "CSV", "JSON", "HTML"].map((x, i) => <span key={x} style={{ transform: `scale(${p(6 + i * 2)})` }}><Badge style={{ fontSize: 20, padding: "3px 10px" }}>{x}</Badge></span>)}
        </div>
        <div style={{ fontSize: 22, marginTop: 10 }}>maks 20 MB per file</div>
      </div>
      {files.map((f, i) => {
        const at = 8 + i * step;
        const s = p(at);
        if (s <= 0) return null;
        const ready = frame > at + readFor;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 28px", borderTop: `2px solid ${C.ghost}`, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * -80}px)` }}>
            <Ext name={f.name} size={58} />
            <div style={{ flex: 1, fontFamily: F.sans }}>
              <div style={{ fontWeight: 700, fontSize: 32, color: C.ink }}>{f.name}</div>
              <div style={{ fontSize: 24, color: C.muted }}>{ready ? `${f.pages ?? 1} halaman${f.ocr ? " · OCR" : ""}` : "Membaca…"}</div>
            </div>
            {ready ? (
              <span style={{ transform: `scale(${p(at + readFor)})` }}><Badge on>Siap</Badge></span>
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: 20, border: `6px solid ${C.ghost}`, borderTopColor: C.red, transform: `rotate(${frame * 18}deg)` }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Answer text with [n] markers rendered as citation chips.
const Cited: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const { p } = useT();
  return (
    <>
      {text.split(/(\[\d+\])/).map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/);
        return m ? (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 40, height: 40, margin: "0 4px", borderRadius: 10, background: C.emBg, color: C.ink, fontWeight: 700, fontSize: 24, verticalAlign: "middle", transform: `scale(${p(at)})` }}>{m[1]}</span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
};

// Ask: question typed → "Mencari di dokumen…" → answer streams in with citation chips (or a polite "not in the documents").
export const Ask: React.FC<{ question: string; answer: string; refuse?: boolean; dur: number }> = ({ question, answer, refuse, dur }) => {
  const { frame, p } = useT();
  const typeEnd = 8 + question.length / 1.4;
  const searchEnd = typeEnd + Math.min(26, dur * 0.18);
  const plain = answer.replace(/\[\d+\]/g, "");
  const shown = Math.floor(interpolate(frame, [searchEnd, Math.min(dur - 20, searchEnd + plain.length / 1.2)], [0, answer.length], clamp));
  // Cut the answer by characters but never inside a [n] marker.
  const cut = answer.slice(0, shown).replace(/\[\d*$/, "");
  const markers = [...answer.matchAll(/\[\d+\]/g)];
  return (
    <div style={{ width: 920, ...panelStyle(), ...enter(p(2), 80) }}>
      {Array.from({ length: Math.ceil((typeEnd - 8) / 4) }, (_, i) => <Sfx key={i} name="type" at={8 + i * 4} volume={0.25} />)}
      <Sfx name="blip" at={typeEnd} volume={0.4} />
      <Sfx name="whoosh" at={typeEnd + 2} volume={0.25} />
      <Sfx name={refuse ? "x" : "ding"} at={searchEnd} volume={0.4} />
      {!refuse && markers.map((m, i) => <Sfx key={`m${i}`} name="pop" at={interpolate(m.index!, [0, answer.length], [searchEnd, Math.min(dur - 20, searchEnd + plain.length / 1.2)])} volume={0.4} />)}
      <Head icon="brain" title="Tanya basis pengetahuan" />
      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "18px 22px", border: `3px solid ${frame < typeEnd ? C.red : C.ghost}`, borderRadius: 20, fontFamily: F.sans, fontSize: 34, color: C.ink }}>
          <span style={{ flex: 1 }}>{question.slice(0, Math.floor(Math.max(0, frame - 8) * 1.4))}{frame < typeEnd && <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>|</span>}</span>
          <span style={{ fontWeight: 700, fontSize: 28, color: "#fff", background: C.red, padding: "10px 22px", borderRadius: 14, transform: `scale(${frame > typeEnd && frame < typeEnd + 6 ? 0.9 : 1})` }}>Tanya</span>
        </div>
        {frame > typeEnd && frame < searchEnd && (
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: F.sans, fontSize: 30, color: C.muted }}>
            <Icon name="file-search" size={40} color={C.red} />
            Mencari di dokumen…
            <div style={{ flex: 1, height: 12, borderRadius: 6, background: C.ghost, overflow: "hidden" }}>
              <div style={{ width: `${interpolate(frame, [typeEnd, searchEnd], [5, 100], clamp)}%`, height: "100%", background: C.red }} />
            </div>
          </div>
        )}
        {frame >= searchEnd && (
          <div style={{ padding: "24px 26px", borderRadius: 22, background: refuse ? "#F3F4F6" : `${C.emBg}33`, borderLeft: `10px solid ${refuse ? C.muted : C.red}`, fontFamily: F.sans, fontSize: 36, lineHeight: 1.45, color: C.ink, ...enter(p(searchEnd), 20) }}>
            {refuse && <Icon name="circle-off" size={40} color={C.muted} />} <Cited text={cut} at={searchEnd} />
          </div>
        )}
      </div>
    </div>
  );
};

// Sources list: each source pops with its relevance bar; cited ones get a badge.
export const Sources: React.FC<{ items: { title: string; page: number; score: number; cited?: boolean }[]; dur: number }> = ({ items, dur }) => {
  const { frame, p } = useT();
  const step = Math.min(14, (dur * 0.5) / items.length);
  return (
    <div style={{ width: 920, ...panelStyle(), ...enter(p(2), 80) }}>
      {items.map((it, i) => <Sfx key={i} name={it.cited ? "pop" : "slide"} at={6 + i * step} volume={0.4} />)}
      {items.map((it, i) => it.cited && <Sfx key={`c${i}`} name="coin" at={6 + i * step + 20} volume={0.3} />)}
      <Head icon="quote" title="Sumber" right={<Badge on>{items.filter((i) => i.cited).length} dikutip</Badge>} />
      {items.map((it, i) => {
        const s = p(6 + i * step);
        const fill = interpolate(frame, [8 + i * step, 26 + i * step], [0, it.score], clamp);
        return (
          <div key={i} style={{ display: "flex", gap: 20, alignItems: "center", padding: "20px 28px", borderTop: i ? `2px solid ${C.ghost}` : undefined, background: it.cited && s > 0.5 ? `${C.emBg}22` : undefined, ...enter(s, 40) }}>
            <div style={{ width: 54, height: 54, borderRadius: 14, background: it.cited ? C.emBg : C.ghost, fontFamily: F.sans, fontWeight: 700, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0, fontFamily: F.sans }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 32, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.title}</span>
                {it.cited && <span style={{ transform: `scale(${p(26 + i * step)})` }}><Badge on style={{ fontSize: 20 }}>Dikutip</Badge></span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, fontSize: 24, color: C.muted }}>
                <span>halaman {it.page}</span>
                <div style={{ flex: 1, height: 12, borderRadius: 6, background: C.ghost, overflow: "hidden" }}><div style={{ width: `${fill * 100}%`, height: "100%", background: C.red }} /></div>
                <span style={{ fontWeight: 700, color: C.ink }}>{Math.round(fill * 100)}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Document page preview: page slides up, a highlighter sweeps over the matching sentence.
export const DocPage: React.FC<{ title: string; page: number; before?: string; mark: string; after?: string; dur: number }> = ({ title, page, before = "", mark, after = "", dur }) => {
  const { frame, p } = useT();
  const markAt = Math.min(24, dur * 0.3);
  const sweep = interpolate(frame, [markAt, markAt + 16], [0, 100], clamp);
  return (
    <div style={{ width: 860, ...panelStyle(), ...enter(p(2), 120, "rotate(-1.5deg)") }}>
      <Sfx name="slide" at={markAt} volume={0.4} />
      <Sfx name="ring" at={markAt + 16} volume={0.35} />
      <Head icon="file-text" title={title} right={<Badge on>Halaman {page}</Badge>} />
      <div style={{ padding: "34px 44px", fontFamily: F.sans, fontSize: 32, lineHeight: 1.6, color: "#6B7280" }}>
        {[0.9, 0.75, 0.95].map((w, i) => <div key={i} style={{ height: 16, width: `${w * 100}%`, background: "#E5E7EB", borderRadius: 8, margin: "12px 0" }} />)}
        <p style={{ margin: "26px 0" }}>
          {before}{" "}
          <mark style={{ color: C.ink, fontWeight: 700, padding: "2px 6px", background: `linear-gradient(90deg, ${C.emBg} ${sweep}%, transparent ${sweep}%)` }}>{mark}</mark>{" "}
          {after}
        </p>
        {[0.85, 0.6].map((w, i) => <div key={i} style={{ height: 16, width: `${w * 100}%`, background: "#E5E7EB", borderRadius: 8, margin: "12px 0" }} />)}
      </div>
    </div>
  );
};
