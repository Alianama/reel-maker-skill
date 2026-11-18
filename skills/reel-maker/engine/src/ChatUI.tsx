// Chat-app UI mockups (inbox, thread, lead panel, pipeline, notification flood), modelled on the Melichat app.
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, cardShadow, clamp, enter, pixelShadow, pop } from "./theme";
import { Sfx } from "./sfx";
import { Icon } from "./Visuals";

export type Channel = "whatsapp" | "instagram" | "telegram" | "messenger" | "website";
const CH: Record<Channel, string> = { whatsapp: "whatsapp", instagram: "instagram", telegram: "telegram", messenger: "message", website: "globe" };
export type Msg = { from: "customer" | "bot" | "agent" | "note" | "event"; text: string; name?: string; buttons?: string[]; order?: { title: string; price: string } };

const initials = (n: string) => n.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, p: (d = 0) => pop(frame, fps, d) };
};
// Function so it reads the active skin at render time.
const panelStyle = (): React.CSSProperties => ({ background: C.card, border: `5px solid ${C.ink}`, boxShadow: cardShadow, borderRadius: 26, overflow: "hidden" });
const Bar: React.FC<{ title: string; right?: React.ReactNode }> = ({ title, right }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 26px", background: C.ink, color: "#fff", fontFamily: F.sans, fontWeight: 700, fontSize: 34 }}>
    <Icon name="message" size={40} color={C.emBg === "transparent" ? C.red : C.emBg} />
    <span style={{ flex: 1 }}>{title}</span>
    {right}
  </div>
);
const Pill: React.FC<{ children: React.ReactNode; on?: boolean; style?: React.CSSProperties }> = ({ children, on, style }) => (
  <span style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 24, padding: "4px 14px", borderRadius: 20, background: on ? C.red : "transparent", color: on ? C.onRed : C.muted, border: `3px solid ${on ? C.red : C.ghost}`, whiteSpace: "nowrap", ...style }}>{children}</span>
);
const Avatar: React.FC<{ name: string; channel?: Channel; size?: number }> = ({ name, channel, size = 84 }) => (
  <div style={{ position: "relative", width: size, height: size, flexShrink: 0, borderRadius: size / 2, background: C.ghost, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.sans, fontWeight: 700, fontSize: size * 0.36, color: C.ink }}>
    {initials(name)}
    {channel && (
      <div style={{ position: "absolute", right: -8, bottom: -8, width: size * 0.48, height: size * 0.48, borderRadius: size, background: C.card, border: `3px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={CH[channel]} size={size * 0.32} color={C.muted} />
      </div>
    )}
  </div>
);

// Conversation list filling up; header counters follow the rows that have arrived.
export const Inbox: React.FC<{ items: { name: string; channel: Channel; text: string; unread?: number; status?: "bot" | "wait" | "agent" }[]; dur: number }> = ({ items, dur }) => {
  const { frame, p } = useT();
  const step = Math.min(16, (dur * 0.6) / items.length);
  const shown = items.filter((_, i) => frame >= 6 + i * step);
  const count = (s: string) => shown.filter((it) => (it.status ?? "bot") === s).length;
  return (
    <div style={{ width: 940, ...panelStyle(), ...enter(p(2), 80) }}>
      {items.map((it, i) => <Sfx key={i} name={it.unread ? "ding" : "slide"} at={6 + i * step} volume={0.4} />)}
      <Bar title="Inbox" right={<Icon name="search" size={34} color="#fff" />} />
      <div style={{ display: "flex", gap: 10, padding: "16px 22px", borderBottom: `3px solid ${C.ghost}` }}>
        <Pill on>{count("bot")} oleh bot</Pill>
        <Pill on={count("wait") > 0} style={count("wait") ? { background: C.ink, borderColor: C.ink, color: "#fff" } : undefined}>{count("wait")} menunggu agen</Pill>
        <Pill>{count("agent")} ditangani</Pill>
      </div>
      {items.map((it, i) => {
        const s = p(6 + i * step);
        if (s <= 0) return null;
        return (
          <div key={i} style={{ display: "flex", gap: 22, alignItems: "center", padding: "20px 24px", borderBottom: `2px solid ${C.ghost}`, background: i === items.length - 1 && s > 0.5 ? `${C.red}22` : undefined, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * -120}px)` }}>
            <Avatar name={it.name} channel={it.channel} />
            <div style={{ flex: 1, minWidth: 0, fontFamily: F.sans }}>
              <div style={{ fontWeight: 700, fontSize: 36, color: C.ink }}>{it.name}</div>
              <div style={{ fontSize: 28, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.text}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: it.status === "wait" ? C.ink : C.muted, marginTop: 2 }}>{it.status === "wait" ? "Menunggu agen" : it.status === "agent" ? "Ditangani orang" : "Bot"}</div>
            </div>
            {!!it.unread && <div style={{ minWidth: 52, height: 52, borderRadius: 26, background: C.red, color: C.onRed, fontFamily: F.sans, fontWeight: 700, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${p(10 + i * step)})` }}>{it.unread}</div>}
          </div>
        );
      })}
    </div>
  );
};

const Typing: React.FC = () => {
  const { frame } = useT();
  return (
    <div style={{ display: "flex", gap: 10, padding: "22px 26px" }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: C.onRed, opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 5 + i)) }} />)}
    </div>
  );
};

// One thread: messages arrive in turn (bot/agent "typing" first); an event flips the status to a person.
export const Chat: React.FC<{ contact: string; channel: Channel; messages: Msg[]; dur: number }> = ({ contact, channel, messages, dur }) => {
  const { frame, p } = useT();
  const step = (dur * 0.85 - 6) / messages.length;
  const startOf = (i: number) => 6 + i * step;
  const typing = (m: Msg) => (m.from === "bot" || m.from === "agent" ? Math.min(12, step * 0.5) : 0);
  const shown = messages.filter((m, i) => frame >= startOf(i) + typing(m));
  const human = shown.some((m) => m.from === "event" || m.from === "agent");
  return (
    <div style={{ width: 940, height: 1000, display: "flex", flexDirection: "column", ...panelStyle(), ...enter(p(2), 80) }}>
      {messages.map((m, i) => {
        const at = startOf(i);
        const t0 = at + typing(m);
        const sound = { customer: "ding", bot: "pop", agent: "pop", note: "note", event: "takeover" }[m.from];
        return (
          <span key={i}>
            {typing(m) > 0 && [0, 4, 8].map((d) => <Sfx key={d} name="type" at={at + d} volume={0.3} />)}
            <Sfx name={sound} at={t0} volume={0.45} />
            {m.buttons?.map((_, j) => <Sfx key={j} name="blip" at={t0 + 4 + j * 3} volume={0.3} />)}
            {m.order && <Sfx name="coin" at={t0 + 8} volume={0.45} />}
          </span>
        );
      })}
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 24px", borderBottom: `4px solid ${C.ink}` }}>
        <Avatar name={contact} channel={channel} size={76} />
        <div style={{ flex: 1, fontFamily: F.sans }}>
          <div style={{ fontWeight: 700, fontSize: 36, color: C.ink }}>{contact}</div>
          <div style={{ fontSize: 24, color: C.muted, textTransform: "capitalize" }}>{channel}</div>
        </div>
        <Pill on={!human} style={human ? { background: C.ink, borderColor: C.ink, color: "#fff" } : undefined}>{human ? "Ditangani orang" : "Bot"}</Pill>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 18, padding: 24, overflow: "hidden" }}>
        {messages.map((m, i) => {
          const at = startOf(i);
          if (frame < at) return null;
          const t0 = at + typing(m);
          const s = p(t0);
          const right = m.from === "bot" || m.from === "agent";
          if (m.from === "event")
            return <div key={i} style={{ alignSelf: "center", fontFamily: F.sans, fontWeight: 700, fontSize: 26, color: "#fff", background: C.ink, padding: "8px 22px", borderRadius: 30, transform: `scale(${s})` }}>{m.text}</div>;
          const bg = m.from === "note" ? C.sticky : right ? (m.from === "agent" ? C.ink : C.red) : "#fff";
          const fg = m.from === "agent" ? "#fff" : right ? C.onRed : C.ink;
          return (
            <div key={i} style={{ alignSelf: right || m.from === "note" ? "flex-end" : "flex-start", maxWidth: 680, display: "flex", flexDirection: "column", alignItems: right ? "flex-end" : "flex-start", gap: 6 }}>
              <div style={{ background: bg, color: fg, border: `4px solid ${C.ink}`, borderRadius: 24, fontFamily: F.sans, fontWeight: 500, fontSize: 32, lineHeight: 1.2, ...(frame < t0 ? {} : { padding: "18px 24px", ...enter(s, 30) }), borderStyle: m.from === "note" ? "dashed" : "solid" }}>
                {frame < t0 ? <Typing /> : m.text}
                {frame >= t0 && m.order && (
                  <div style={{ marginTop: 14, background: C.card, color: C.ink, border: `3px solid ${C.ink}`, borderRadius: 16, padding: "12px 18px", display: "flex", gap: 14, alignItems: "center" }}>
                    <Icon name="shopping-cart" size={40} color={C.muted} />
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 28 }}>{m.order.title}</div><div style={{ fontSize: 26, color: C.muted }}>{m.order.price}</div></div>
                    <Pill on>Bayar</Pill>
                  </div>
                )}
              </div>
              {frame >= t0 && m.buttons && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {m.buttons.map((b, j) => <span key={j} style={{ transform: `scale(${p(t0 + 4 + j * 3)})` }}><Pill style={{ fontSize: 26, background: C.card, color: C.ink, borderColor: C.ink }}>{b}</Pill></span>)}
                </div>
              )}
              {frame >= t0 && <div style={{ fontFamily: F.sans, fontSize: 20, color: C.muted }}>{m.from === "note" ? "Catatan internal" : m.from === "customer" ? contact : m.name ?? "Bot"}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Lead panel: score counts up on a block bar, intents pop, collected answers fill in.
export const Lead: React.FC<{ name: string; channel?: Channel; score: number; intents?: string[]; fields?: { label: string; value: string }[]; dur: number }> = ({ name, channel, score, intents = [], fields = [], dur }) => {
  const { frame, p } = useT();
  const step = (dur * 0.5) / Math.max(1, fields.length);
  const shown = Math.round(score * interpolate(frame, [10, 10 + dur * 0.6], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 2 }));
  return (
    <div style={{ width: 900, ...panelStyle(), ...enter(p(2), 80) }}>
      {Array.from({ length: Math.ceil(score / 5) }, (_, i) => <Sfx key={i} name="blip" at={10 + dur * 0.6 * (1 - Math.sqrt(1 - (i * 5) / score))} volume={0.18} />)}
      <Sfx name="coin" at={10 + dur * 0.6} volume={0.5} />
      {intents.map((_, i) => <Sfx key={`i${i}`} name="pop" at={16 + i * 6} volume={0.4} />)}
      {fields.map((_, i) => <Sfx key={`f${i}`} name="type" at={14 + i * step} volume={0.35} />)}
      <Bar title="Detail lead" />
      <div style={{ padding: 30, display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <Avatar name={name} channel={channel} size={90} />
          <div style={{ flex: 1, fontFamily: F.sans, fontWeight: 700, fontSize: 42, color: C.ink }}>{name}</div>
          <div style={{ fontFamily: F.stamp, fontSize: 120, lineHeight: 0.9, color: C.ink, textShadow: pixelShadow("#A3E635", 6) }}>{shown}<span style={{ fontSize: 50, color: C.muted }}>/100</span></div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: 20 }, (_, i) => <div key={i} style={{ flex: 1, height: 40, background: i < shown / 5 ? (i >= 15 ? C.ink : C.red) : C.ghost, transform: `scaleY(${i < shown / 5 && i >= shown / 5 - 1 ? 1.25 : 1})` }} />)}
        </div>
        {intents.length > 0 && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {intents.map((it, i) => <span key={i} style={{ transform: `scale(${p(16 + i * 6)})` }}><Pill on style={{ fontSize: 30 }}>{it}</Pill></span>)}
          </div>
        )}
        {fields.length > 0 && (
          <div style={{ border: `3px solid ${C.ghost}` }}>
            <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 24, color: C.muted, padding: "10px 18px", borderBottom: `3px solid ${C.ghost}` }}>Dikumpulkan bot</div>
            {fields.map((f, i) => {
              const at = 14 + i * step;
              const typed = f.value.slice(0, Math.max(0, Math.floor((frame - at) * 1.5)));
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 20, padding: "14px 18px", borderBottom: i < fields.length - 1 ? `2px solid ${C.ghost}` : undefined, fontFamily: F.sans, fontSize: 30 }}>
                  <span style={{ color: C.muted }}>{f.label}</span>
                  <span style={{ fontWeight: 700, color: C.ink }}>{typed || "-"}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Kanban columns; the highlighted deal hops one column at a time to the last one.
export const Pipeline: React.FC<{ columns: string[]; deal: { title: string; value: string }; dur: number }> = ({ columns, deal, dur }) => {
  const { frame, p } = useT();
  const w = 900 / columns.length;
  const hop = (dur * 0.75) / Math.max(1, columns.length - 1);
  const pos = interpolate(frame, columns.map((_, i) => 10 + i * hop), columns.map((_, i) => i), { ...clamp, easing: (x) => x });
  const k = Math.floor(pos);
  const frac = pos - k;
  const eased = frac < 0.6 ? 0 : (frac - 0.6) / 0.4;
  const x = (k + eased) * w;
  const lift = Math.sin(eased * Math.PI) * 90;
  const last = pos >= columns.length - 1;
  return (
    <div style={{ position: "relative", width: 940, height: 760, ...enter(p(2), 80) }}>
      {columns.slice(1).map((_, i) => <Sfx key={i} name="whip" at={10 + i * hop + hop * 0.6} volume={0.45} />)}
      {columns.slice(1).map((_, i) => <Sfx key={`l${i}`} name={i === columns.length - 2 ? "coin" : "punch"} at={10 + (i + 1) * hop} volume={0.35} />)}
      <div style={{ display: "flex", gap: 12, height: "100%" }}>
        {columns.map((c, i) => (
          <div key={i} style={{ flex: 1, background: i === columns.length - 1 ? `${C.red}33` : C.card, border: `4px solid ${C.ink}`, padding: 12, display: "flex", flexDirection: "column", gap: 12, ...enter(p(3 + i * 3), 40) }}>
            <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 26, color: C.ink, textAlign: "center" }}>{c}</div>
            {[0, 1].map((j) => <div key={j} style={{ height: 90, background: C.ghost, opacity: 0.5 }} />)}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: x + 6, top: 300 - lift, width: w - 12, padding: 14, background: last ? C.red : "#fff", border: `4px solid ${C.ink}`, boxShadow: cardShadow, fontFamily: F.sans, transform: `rotate(${eased > 0 && eased < 1 ? 6 : 0}deg) scale(${p(8)})` }}>
        <div style={{ fontWeight: 700, fontSize: 26, color: C.ink }}>{deal.title}</div>
        <div style={{ fontSize: 24, color: C.ink, marginTop: 6 }}>{deal.value}</div>
      </div>
    </div>
  );
};

// Notification flood on a phone lock screen: cards pile up faster and faster, counter climbs.
export const Notifs: React.FC<{ items: { channel: Channel; name: string; text: string }[]; total?: number; dur: number }> = ({ items, total = 99, dur }) => {
  const { frame, p } = useT();
  const n = Math.floor(interpolate(frame, [4, dur * 0.8], [0, 14], { ...clamp, easing: (x) => x * x }));
  const count = Math.round(interpolate(frame, [4, dur * 0.8], [1, total], clamp));
  return (
    <div style={{ position: "relative", width: 560, height: 1000, background: "#0E0E10", borderRadius: 70, padding: 18, boxShadow: "0 40px 60px #0005", ...enter(p(2), 120, `rotate(${-3 + Math.sin(frame / 3) * (n > 8 ? 1.5 : 0)}deg)`) }}>
      {Array.from({ length: 14 }, (_, i) => <Sfx key={i} name="ding" at={4 + Math.sqrt((i + 1) / 14) * dur * 0.8} volume={0.22 + i * 0.015} />)}
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 54, overflow: "hidden", background: C.screen }}>
        <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", fontFamily: F.stamp, fontSize: 130, color: "#fff", opacity: 0.85 }}>02.14</div>
        {Array.from({ length: n }, (_, i) => {
          const it = items[i % items.length];
          const s = p(4 + Math.sqrt((i + 1) / 14) * dur * 0.8);
          return (
            <div key={i} style={{ position: "absolute", left: 20 + (random(`nx${i}`) - 0.5) * 30, right: 20 - (random(`nx${i}`) - 0.5) * 30, top: 260 + (i % 7) * 95 + Math.floor(i / 7) * 40, display: "flex", gap: 14, alignItems: "center", padding: "14px 18px", background: "#ffffffee", borderRadius: 22, border: `3px solid ${C.ink}`, transform: `rotate(${(random(`nr${i}`) - 0.5) * 8}deg) scale(${s})`, fontFamily: F.sans }}>
              <Icon name={CH[it.channel]} size={44} color={C.ink} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 24, color: C.ink }}>{it.name}</div>
                <div style={{ fontSize: 22, color: "#444", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: -30, right: -40, minWidth: 150, height: 110, padding: "0 20px", borderRadius: 60, background: C.red, color: C.onRed, border: `5px solid ${C.ink}`, fontFamily: F.stamp, fontSize: 80, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + Math.sin(frame / 3) * 0.05})` }}>{count >= total ? `${total}+` : count}</div>
    </div>
  );
};
