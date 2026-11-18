import { Check, X, icons } from "lucide-react";
import * as Px from "pixelarticons/react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Ask, DocPage, Pile, Sources, Upload } from "./BrainUI";
import { Chat, Inbox, Lead, Notifs, Pipeline } from "./ChatUI";
import { Calc, Define, Extract, Flow, Mentions } from "./MoreUI";
import { Catalog, Comment, Expire, Lost, Night, Pass, Pay, Receipt, Ship, Shift, Ticket, Typo, Upgrade } from "./SellUI";
import { Fade, Follow, Menu, Popcorn, Puppet, Scan, Shelf, Spend, Tag } from "./PriceUI";
import { Backdoor, Basket, Blueprint, Duo, EyeLevel, Flip, Gift, Kasir, List, Magnet, Phrase, Series, StoreMap, Walk } from "./ShopUI";
import { Chase, Crush, Motive, NoClick, Scale, Shop, StampCard, Stalk, Stock, Study, Tagged, Trio, Twin } from "./ChaseUI";
import { Countdown, Nota, Meja, Qris, QrOrder, Report } from "./KasUI";
import { Blue, Checkout, Queue, Sample, Shortcut, Story } from "./TrikUI";
import { Banks, BlueBrain, Bond, Cosmetic, Logos, Neon, Palette, Sells, SkySea, Stranger } from "./BankUI";
import { PoAccounts, PoBury, PoCompose, PoLate, PoMorning, PoPlans, PoRepost, PoSleep, PoWeek } from "./PoseliUI";
import { Burn, Crowd, Diskon, Feed, Lapak, Search, Spread, Topple } from "./MarketUI";
import { Calendar, CartFill, Flash, Hat, LowStock, Midnight, Ongkir, Strike, Toolkit } from "./TanggalUI";
import { Beach, Destination, Hop, Piggy, Rivals, Survey, Thumb } from "./SebelahUI";
import { Sfx } from "./sfx";
import { Em } from "./text";
import { C, F, Visual, cardShadow, clamp, enter, pixelShadow, pop, skin } from "./theme";

type Props = { visual: Visual; dur: number };

export const VisualView: React.FC<Props> = ({ visual, dur }) => {
  switch (visual.type) {
    case "bigText": return <BigText {...visual} />;
    case "poSleep": return <PoSleep dur={dur} />;
    case "poLate": return <PoLate {...visual} dur={dur} />;
    case "poBury": return <PoBury {...visual} dur={dur} />;
    case "poCompose": return <PoCompose {...visual} dur={dur} />;
    case "poAccounts": return <PoAccounts {...visual} dur={dur} />;
    case "poWeek": return <PoWeek {...visual} dur={dur} />;
    case "poRepost": return <PoRepost {...visual} dur={dur} />;
    case "poPlans": return <PoPlans {...visual} dur={dur} />;
    case "poMorning": return <PoMorning {...visual} dur={dur} />;
    case "steps": return <Steps {...visual} />;
    case "window": return <Window {...visual} dur={dur} />;
    case "stat": return <Stat {...visual} />;
    case "compare": return <Compare {...visual} />;
    case "cards": return <Cards {...visual} />;
    case "cta": return <Cta {...visual} />;
    case "laptop": return <Laptop {...visual} />;
    case "phone": return <Phone {...visual} />;
    case "browser": return <Browser {...visual} />;
    case "folder": return <Folder {...visual} />;
    case "envelope": return <Envelope {...visual} dur={dur} />;
    case "app": return <App {...visual} />;
    case "image": return <Photo {...visual} />;
    case "inbox": return <Inbox {...visual} dur={dur} />;
    case "chat": return <Chat {...visual} dur={dur} />;
    case "lead": return <Lead {...visual} dur={dur} />;
    case "pipeline": return <Pipeline {...visual} dur={dur} />;
    case "notifs": return <Notifs {...visual} dur={dur} />;
    case "pile": return <Pile {...visual} dur={dur} />;
    case "upload": return <Upload {...visual} dur={dur} />;
    case "ask": return <Ask {...visual} dur={dur} />;
    case "sources": return <Sources {...visual} dur={dur} />;
    case "docPage": return <DocPage {...visual} dur={dur} />;
    case "extract": return <Extract {...visual} dur={dur} />;
    case "calc": return <Calc {...visual} dur={dur} />;
    case "mentions": return <Mentions {...visual} dur={dur} />;
    case "flow": return <Flow {...visual} dur={dur} />;
    case "define": return <Define {...visual} dur={dur} />;
    case "night": return <Night {...visual} dur={dur} />;
    case "lost": return <Lost {...visual} dur={dur} />;
    case "upgrade": return <Upgrade {...visual} dur={dur} />;
    case "typo": return <Typo {...visual} dur={dur} />;
    case "catalog": return <Catalog {...visual} dur={dur} />;
    case "ship": return <Ship {...visual} dur={dur} />;
    case "receipt": return <Receipt {...visual} dur={dur} />;
    case "pay": return <Pay {...visual} dur={dur} />;
    case "expire": return <Expire {...visual} dur={dur} />;
    case "ticket": return <Ticket {...visual} dur={dur} />;
    case "pass": return <Pass {...visual} dur={dur} />;
    case "shift": return <Shift dur={dur} />;
    case "comment": return <Comment {...visual} dur={dur} />;
    case "tag": return <Tag {...visual} />;
    case "scan": return <Scan {...visual} />;
    case "fade": return <Fade {...visual} />;
    case "menu": return <Menu {...visual} />;
    case "popcorn": return <Popcorn {...visual} dur={dur} />;
    case "puppet": return <Puppet />;
    case "basket": return <Basket {...visual} />;
    case "blueprint": return <Blueprint {...visual} />;
    case "magnet": return <Magnet {...visual} dur={dur} />;
    case "storeMap": return <StoreMap {...visual} />;
    case "walk": return <Walk {...visual} dur={dur} />;
    case "flip": return <Flip {...visual} />;
    case "backdoor": return <Backdoor {...visual} />;
    case "duo": return <Duo {...visual} />;
    case "gift": return <Gift />;
    case "eyeLevel": return <EyeLevel {...visual} />;
    case "phrase": return <Phrase {...visual} />;
    case "kasir": return <Kasir {...visual} />;
    case "list": return <List {...visual} />;
    case "series": return <Series />;
    case "calendar": return <Calendar {...visual} />;
    case "cartFill": return <CartFill {...visual} />;
    case "hat": return <Hat {...visual} />;
    case "flash": return <Flash {...visual} />;
    case "lowStock": return <LowStock {...visual} />;
    case "strike": return <Strike {...visual} />;
    case "ongkir": return <Ongkir {...visual} />;
    case "midnight": return <Midnight {...visual} />;
    case "rivals": return <Rivals {...visual} />;
    case "beach": return <Beach {...visual} dur={dur} />;
    case "survey": return <Survey {...visual} />;
    case "piggy": return <Piggy {...visual} />;
    case "hop": return <Hop {...visual} />;
    case "destination": return <Destination {...visual} dur={dur} />;
    case "thumb": return <Thumb {...visual} />;
    case "toolkit": return <Toolkit {...visual} />;
    case "lapak": return <Lapak {...visual} />;
    case "burn": return <Burn {...visual} />;
    case "topple": return <Topple {...visual} />;
    case "crowd": return <Crowd {...visual} />;
    case "search": return <Search {...visual} />;
    case "feed": return <Feed {...visual} />;
    case "diskon": return <Diskon {...visual} />;
    case "spread": return <Spread {...visual} />;
    case "follow": return <Follow {...visual} dur={dur} />;
    case "stalk": return <Stalk {...visual} />;
    case "noClick": return <NoClick {...visual} />;
    case "tagged": return <Tagged {...visual} />;
    case "crush": return <Crush {...visual} />;
    case "trio": return <Trio {...visual} />;
    case "stock": return <Stock {...visual} />;
    case "scale": return <Scale {...visual} />;
    case "motive": return <Motive {...visual} />;
    case "stampCard": return <StampCard {...visual} />;
    case "study": return <Study {...visual} />;
    case "chase": return <Chase {...visual} />;
    case "shop": return <Shop {...visual} />;
    case "twin": return <Twin {...visual} />;
    case "queue": return <Queue {...visual} />;
    case "shortcut": return <Shortcut {...visual} />;
    case "sample": return <Sample {...visual} />;
    case "story": return <Story {...visual} />;
    case "checkout": return <Checkout {...visual} />;
    case "blue": return <Blue {...visual} />;
    case "banks": return <Banks {...visual} />;
    case "logos": return <Logos {...visual} />;
    case "skySea": return <SkySea {...visual} />;
    case "blueBrain": return <BlueBrain {...visual} />;
    case "sells": return <Sells {...visual} />;
    case "stranger": return <Stranger {...visual} />;
    case "neon": return <Neon {...visual} />;
    case "cosmetic": return <Cosmetic {...visual} />;
    case "bond": return <Bond dur={dur} />;
    case "palette": return <Palette />;
    case "shelf": return <Shelf {...visual} />;
    case "spend": return <Spend {...visual} dur={dur} />;
    case "meja": return <Meja {...visual} dur={dur} />;
    case "nota": return <Nota {...visual} dur={dur} />;
    case "qrOrder": return <QrOrder {...visual} dur={dur} />;
    case "qris": return <Qris {...visual} dur={dur} />;
    case "report": return <Report {...visual} dur={dur} />;
    case "countdown": return <Countdown {...visual} dur={dur} />;
  }
};

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, p: (delay = 0) => pop(frame, fps, delay) };
};

// Lucide icon by kebab-case name (https://lucide.dev/icons), e.g. "graduation-cap".
export const Icon: React.FC<{ name: string; size: number; color?: string; stroke?: number }> = ({ name, size, color = C.ink, stroke = 1.75 }) => {
  const key = name.replace(/(^|-)(\w)/g, (_m: string, _d: string, c: string) => c.toUpperCase()) as keyof typeof icons;
  const Cmp = icons[key];
  // Voxel skin prefers pixel icons (https://pixelarticons.com); either style falls back to the other set.
  const Pix = (Px as unknown as Record<string, React.FC<React.SVGProps<SVGSVGElement>> | undefined>)[key];
  if (Pix && (skin === "voxel" || !Cmp)) return <Pix width={size} height={size} style={{ color }} shapeRendering="crispEdges" />;
  if (!Cmp) throw new Error(`Unknown icon "${name}" — see https://lucide.dev/icons or https://pixelarticons.com`);
  return <Cmp size={size} color={color} strokeWidth={stroke} />;
};

// Local path in public/ or a full URL.
const src = (s: string) => (s.startsWith("http") ? s : staticFile(s));

// Slow Ken Burns zoom on photos.
const KenBurns: React.FC<{ image: string; style?: React.CSSProperties }> = ({ image, style }) => {
  const { frame } = useT();
  return <Img src={src(image)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.05 + frame * 0.0016})`, ...style }} />;
};

const BigText: React.FC<{ text: string }> = ({ text }) => {
  const { p } = useT();
  const s = p(4);
  const words = text.includes("*") ? text : text.replace(/^(\S+)/, "*$1*");
  return (
    <div style={{ textAlign: "center", transform: `scale(${interpolate(s, [0, 1], [1.7, 1])}) rotate(-3deg)`, opacity: Math.min(1, s * 2), filter: `blur(${Math.max(0, (1 - s) * 10)}px)` }}>
      <Sfx name="stamp" at={6} volume={0.5} />
      <div style={{ fontFamily: F.stamp, fontSize: 200, lineHeight: 0.95, textTransform: "uppercase" }}>
        {words.split(/\s+/).map((w, i) => (
          <span key={i} style={{ color: w.includes("*") ? C.red : "inherit", textShadow: pixelShadow("#111827", 10) }}>{w.replace(/\*/g, "")} </span>
        ))}
      </div>
    </div>
  );
};

export const NumBadge: React.FC<{ n: number | string; red?: boolean; size?: number; dots?: number }> = ({ n, red, size = 92, dots }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.2, background: red ? C.red : C.ink, color: red ? C.onRed : "#fff", fontFamily: F.stamp, fontSize: size * 0.66, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 6px 0 #0002", lineHeight: 1 }}>
    {n}
    {dots !== undefined && (
      <div style={{ display: "flex", gap: size * 0.04, marginTop: size * 0.04 }}>
        {Array.from({ length: 5 }, (_, i) => <div key={i} style={{ width: size * 0.07, height: size * 0.07, borderRadius: size, background: i < dots ? (i === dots - 1 ? C.red : "#fff") : "#ffffff40" }} />)}
      </div>
    )}
  </div>
);

const Steps: React.FC<{ items: { title: string; icon?: string }[]; active?: number }> = ({ items, active }) => {
  const { p } = useT();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 26, justifyContent: "center", width: 960 }}>
      {items.map((_, i) => <Sfx key={i} name="blip" at={3 + i * 4} volume={0.4} />)}
      {items.map((it, i) => {
        const s = p(3 + i * 4);
        const on = i === active;
        const e = enter(s, 60, `scale(${on ? 1.05 : 1}) rotate(${on ? -1.5 : 0}deg)`);
        return (
          <div key={i} style={{ width: items.length > 3 ? 450 : 860, display: "flex", alignItems: "center", gap: 26, padding: 24, background: C.card, borderRadius: 26, boxShadow: cardShadow, border: `5px solid ${on ? C.red : "transparent"}`, ...e, opacity: active === undefined || on ? e.opacity : Number(e.opacity) * 0.45 }}>
            <NumBadge n={i + 1} red={on} />
            <div style={{ flex: 1, fontFamily: F.sans, fontWeight: 700, fontSize: 52, color: C.ink, letterSpacing: -1 }}>{it.title}</div>
            {it.icon && <Icon name={it.icon} size={56} color={on ? C.red : C.muted} />}
          </div>
        );
      })}
    </div>
  );
};

const Window: React.FC<{ title: string; lines: { text: string; tag?: string; warn?: boolean }[]; prompt?: string; dur: number }> = ({ title, lines, prompt, dur }) => {
  const { frame, p } = useT();
  const step = (dur * 0.7) / Math.max(lines.length, 1);
  const typed = prompt ? prompt.slice(0, Math.floor(Math.max(0, frame - 8) * 1.2)) : "";
  return (
    <div style={{ width: 920, background: C.dark, borderRadius: 26, boxShadow: "0 30px 60px #0005", overflow: "hidden", ...enter(p(2), 80, "rotate(-1deg)") }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 26px", borderBottom: "1px solid #ffffff14" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
        <div style={{ fontFamily: F.sans, fontWeight: 700, color: "#fff", fontSize: 26, marginLeft: 14 }}>{title}</div>
      </div>
      {lines.map((_, i) => <Sfx key={i} name="pop" at={10 + i * step} volume={0.4} />)}
      {lines.map((l, i) => !l.warn && <Sfx key={`c${i}`} name="blip" at={10 + (i + 1) * step} volume={0.3} />)}
      {prompt && Array.from({ length: Math.ceil(prompt.length / 1.2 / 4) }, (_, i) => <Sfx key={`t${i}`} name="type" at={8 + i * 4} volume={0.25} />)}
      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        {lines.map((l, i) => {
          const at = 10 + i * step;
          if (frame < at) return null;
          const done = frame > at + step || (i === lines.length - 1 && frame > at + 20);
          const ls = p(at);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 18px", borderRadius: 14, background: l.warn ? "#E5322D33" : "#ffffff08", opacity: ls, transform: `translateX(${(1 - ls) * -40}px)` }}>
              <div style={{ width: 38, height: 38, borderRadius: 19, background: done && !l.warn ? "#fff" : C.red, color: done && !l.warn ? C.dark : "#fff", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.sans, fontWeight: 700, transform: `rotate(${done ? 0 : frame * 8}deg)` }}>{l.warn ? "!" : done ? <Check size={24} strokeWidth={3} /> : "✳"}</div>
              <div style={{ fontFamily: F.sans, fontWeight: 500, color: "#fff", fontSize: 34, flex: 1 }}>{l.text}</div>
              {l.tag && <div style={{ fontFamily: F.mono, fontSize: 20, color: "#fff", background: l.warn ? C.red : "#ffffff22", padding: "4px 12px", borderRadius: 8 }}>{l.tag}</div>}
            </div>
          );
        })}
        {prompt && (
          <div style={{ marginTop: 10, border: "1px solid #ffffff2a", borderRadius: 16, padding: "18px 22px", fontFamily: F.mono, fontSize: 26, color: "#ddd" }}>
            <span style={{ color: C.red }}>▸ </span>{typed}<span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>▌</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Stat: React.FC<{ value: string; label: string; source?: string }> = ({ value, label, source }) => {
  const { p, frame } = useT();
  const s = p(3);
  const m = value.match(/^(\d+)(%|x|\+)?$/);
  const shown = m ? `${Math.round(Number(m[1]) * Math.min(s, 1))}${m[2] ?? ""}` : value;
  return (
    <div style={{ textAlign: "center", ...enter(s, 0) }}>
      <Sfx name="coin" at={14} volume={0.45} />
      <div style={{ fontFamily: F.stamp, fontSize: 290, color: C.red, lineHeight: 1, textShadow: pixelShadow("#111827", 12), transform: `rotate(${Math.sin(frame / 12) * 1.5}deg)` }}>{shown}</div>
      <div style={{ display: "inline-block", fontFamily: F.sans, fontWeight: 700, fontSize: 50, color: C.ink, marginTop: 10, background: C.card, padding: "10px 26px", borderRadius: 14, boxShadow: cardShadow }}>{label}</div>
      {source && <div style={{ fontFamily: F.sans, fontSize: 24, color: C.muted, marginTop: 18 }}>{source}</div>}
    </div>
  );
};

const Compare: React.FC<{ left: { title: string; items: string[] }; right: { title: string; items: string[] } }> = ({ left, right }) => {
  const { p } = useT();
  const col = (c: { title: string; items: string[] }, good: boolean, delay: number) => (
    <div style={{ width: 440, background: C.card, borderRadius: 26, padding: 32, boxShadow: cardShadow, border: `5px solid ${good ? C.red : "transparent"}`, ...enter(p(delay), 70, `rotate(${good ? 2 : -2}deg)`) }}>
      <div style={{ fontFamily: good ? F.serif : F.sans, fontWeight: 700, fontSize: good ? 60 : 50, color: good ? C.red : C.muted, marginBottom: 20 }}>{c.title}</div>
      {c.items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", fontFamily: F.sans, fontWeight: 500, fontSize: 34, color: good ? C.ink : C.muted, margin: "14px 0", textDecoration: good ? "none" : "line-through", textDecorationColor: C.red, ...enter(p(delay + 6 + i * 5), 20) }}>
          {good ? <Check size={34} color={C.red} strokeWidth={3} /> : <X size={34} color={C.muted} strokeWidth={3} />}{it}
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
      <Sfx name="slide" at={2} volume={0.4} />
      <Sfx name="slide" at={14} volume={0.4} />
      {left.items.map((_, i) => <Sfx key={`l${i}`} name="tick" at={8 + i * 5} volume={0.4} />)}
      {right.items.map((_, i) => <Sfx key={`r${i}`} name="blip" at={20 + i * 5} volume={0.4} />)}
      {col(left, false, 2)}{col(right, true, 14)}
    </div>
  );
};

// Pinned polaroids; with `magnifier` a loupe drifts over them (hook on cork board).
const Cards: React.FC<{ items: { icon?: string; image?: string; label: string }[]; magnifier?: boolean }> = ({ items, magnifier }) => {
  const { p, frame } = useT();
  return (
    <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "center", width: 940 }}>
      {items.map((_, i) => <Sfx key={i} name="note" at={2 + i * 4} volume={0.3} />)}
      {items.map((it, i) => {
        const rot = [-6, 4, -3, 7, -5][i % 5];
        return (
          <div key={i} style={{ position: "relative", width: 260, padding: "16px 16px 8px", background: "#FBFAF6", boxShadow: "0 16px 26px #0005", ...enter(p(2 + i * 4), -80, `rotate(${rot + Math.sin((frame + i * 20) / 25)}deg)`) }}>
            <div style={{ position: "absolute", top: -12, left: 118, width: 26, height: 26, borderRadius: 13, background: C.red, boxShadow: "0 4px 4px #0006", zIndex: 1 }} />
            <div style={{ height: 230, background: "#E6E1D8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, overflow: "hidden" }}>
              {it.image ? <KenBurns image={it.image} /> : it.icon && <Icon name={it.icon} size={110} />}
            </div>
            <div style={{ fontFamily: F.serif, fontSize: 40, textAlign: "center", color: C.ink, marginTop: 4 }}>{it.label}</div>
          </div>
        );
      })}
      {magnifier && <Magnifier />}
    </div>
  );
};

const Magnifier: React.FC = () => {
  const { frame } = useT();
  const x = 470 + Math.sin(frame / 22) * 300;
  const y = 260 + Math.sin(frame / 15) * 180;
  return (
    <div style={{ position: "absolute", left: x - 90, top: y - 90, width: 180, height: 180, borderRadius: 90, border: "16px solid #B8892E", background: "radial-gradient(circle at 35% 30%, #ffffff66, #ffffff10 60%)", boxShadow: "0 18px 30px #0006, inset 0 0 20px #0004", backdropFilter: "blur(0px) saturate(1.3)" }}>
      <div style={{ position: "absolute", left: 150, top: 150, width: 120, height: 34, borderRadius: 17, background: "#2A2A2A", transform: "rotate(45deg)", transformOrigin: "0 50%" }} />
    </div>
  );
};

const Cta: React.FC<{ keyword: string }> = ({ keyword }) => {
  const { frame, p } = useT();
  const s = p(3);
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <div style={{ textAlign: "center", ...enter(s, 0, `scale(${pulse})`) }}>
      <Sfx name="coin" at={6} volume={0.5} />
      <div style={{ display: "inline-flex", alignItems: "center", gap: 26, background: C.card, padding: "34px 54px", borderRadius: 40, boxShadow: cardShadow, border: `6px solid ${C.ink}` }}>
        <span style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 64, color: C.ink }}>Komen</span>
        <span style={{ fontFamily: F.stamp, fontSize: 150, color: C.red, lineHeight: 1, textShadow: pixelShadow("#111827", 8) }}>"{keyword}"</span>
      </div>
    </div>
  );
};

const MiniApp: React.FC<{ title: string; scale?: number }> = ({ title, scale = 1 }) => {
  const { frame } = useT();
  return (
    <div style={{ width: 520 * scale, background: "#1E1E20ee", borderRadius: 18 * scale, padding: 30 * scale, textAlign: "center", boxShadow: "0 20px 40px #0006" }}>
      <div style={{ color: C.red, fontSize: 50 * scale, transform: `rotate(${frame * 3}deg)`, display: "inline-block" }}>✳</div>
      <div style={{ fontFamily: F.sans, color: "#fff", fontSize: 30 * scale, marginTop: 10 * scale }}>{title}</div>
      <div style={{ marginTop: 22 * scale, border: "1px solid #ffffff30", borderRadius: 12 * scale, height: 46 * scale }} />
    </div>
  );
};

const Laptop: React.FC<{ image?: string; title?: string }> = ({ image, title }) => {
  const { p } = useT();
  return (
    <div style={{ width: 900, ...enter(p(2), 90) }}>
      <div style={{ margin: "0 auto", width: 780, height: 490, background: "#0E0E10", borderRadius: "30px 30px 0 0", padding: 18, boxShadow: "0 30px 50px #0004" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 8, overflow: "hidden", background: C.screen, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {image && <div style={{ position: "absolute", inset: 0 }}><KenBurns image={image} /></div>}
          {title && <div style={{ position: "relative" }}><MiniApp title={title} /></div>}
          <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, background: "#ffffff40", padding: 8, borderRadius: 14 }}>
            {["#5AA8F0", "#F5A623", "#7ED321", "#E5322D", "#BD10E0", "#fff"].map((c) => <div key={c} style={{ width: 30, height: 30, borderRadius: 8, background: c }} />)}
          </div>
        </div>
      </div>
      <div style={{ height: 36, background: "linear-gradient(#E3E3E6, #A9A9AE)", borderRadius: "0 0 50px 50px", boxShadow: "0 20px 30px #0003" }}>
        <div style={{ margin: "0 auto", width: 140, height: 12, background: "#9a9aa0", borderRadius: "0 0 10px 10px" }} />
      </div>
    </div>
  );
};

const Phone: React.FC<{ image?: string; title?: string; chip?: string }> = ({ image, title, chip }) => {
  const { p, frame } = useT();
  return (
    <div style={{ width: 430, height: 860, background: "#0E0E10", borderRadius: 70, padding: 16, boxShadow: "0 40px 60px #0005", ...enter(p(2), 120, `rotate(${-3 + Math.sin(frame / 20)}deg)`) }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 56, overflow: "hidden", background: "#ddd" }}>
        {image && <KenBurns image={image} />}
        <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", width: 130, height: 36, borderRadius: 18, background: "#000" }} />
        {title && (
          <div style={{ position: "absolute", top: 80, left: 24, right: 24, background: "#fffffff0", borderRadius: 22, padding: "18px 22px", fontFamily: F.sans, fontWeight: 700, fontSize: 40, lineHeight: 1.1, ...enter(p(10), 30) }}>
            <Em text={title} size={40} />
          </div>
        )}
        {chip && <Sfx name="stamp" at={18} volume={0.4} />}
        {chip && <div style={{ position: "absolute", bottom: 40, left: 24, background: C.red, color: C.onRed, fontFamily: F.stamp, fontSize: 54, padding: "6px 20px", borderRadius: 12, transform: `rotate(-4deg) scale(${p(18)})` }}>{chip}</div>}
      </div>
    </div>
  );
};

const Browser: React.FC<{ url: string; title?: string; image?: string }> = ({ url, title, image }) => {
  const { p, frame } = useT();
  const typed = url.slice(0, Math.floor(Math.max(0, frame - 6) / 1.5));
  return (
    <div style={{ width: 920, borderRadius: 22, overflow: "hidden", background: "#fff", boxShadow: "0 30px 60px #0004", ...enter(p(2), 80) }}>
      <div style={{ background: "#ECEAE6", padding: "16px 22px", display: "flex", alignItems: "center", gap: 14 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
        <div style={{ flex: 1, marginLeft: 16, background: "#fff", borderRadius: 12, padding: "10px 18px", fontFamily: F.mono, fontSize: 24, color: "#555" }}>🔒 {typed}<span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>|</span></div>
      </div>
      <div style={{ position: "relative", height: 470, display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF9F6" }}>
        {image && <div style={{ position: "absolute", inset: 0 }}><KenBurns image={image} /></div>}
        {title && <div style={{ position: "relative", fontFamily: F.serif, fontSize: 64, color: C.ink, textAlign: "center", padding: "0 50px", ...enter(p(16), 20) }}>{title}</div>}
      </div>
    </div>
  );
};

const Folder: React.FC<{ name: string; files?: { icon: string; label: string }[] }> = ({ name, files = [] }) => {
  const { p } = useT();
  return (
    <div style={{ position: "relative", width: 760, height: 560, ...enter(p(2), 80) }}>
      {files.map((_, i) => <Sfx key={i} name="pop" at={14 + i * 6} volume={0.4} />)}
      <div style={{ position: "absolute", top: 40, left: 0, width: 280, height: 90, background: C.folderDark, borderRadius: "26px 26px 0 0" }} />
      <div style={{ position: "absolute", top: 80, left: 0, right: 0, height: 480, background: C.folderDark, borderRadius: 26 }} />
      {files.map((f, i) => {
        const s = p(14 + i * 6);
        const x = (i - (files.length - 1) / 2) * 175;
        return (
          <div key={i} style={{ position: "absolute", left: 380 + x - 80, top: 150 - s * 150, width: 160, height: 200, background: "#fff", borderRadius: 14, boxShadow: cardShadow, transform: `rotate(${(i - 1.5) * 6 * s}deg)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, opacity: Math.min(1, s * 2) }}>
            <Icon name={f.icon} size={72} color={C.red} />
            <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 24, color: C.ink }}>{f.label}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 170, left: 0, right: 0, height: 390, background: `linear-gradient(${C.folder}, ${C.folder2})`, borderRadius: 26, boxShadow: "0 30px 40px #0003, inset 0 2px 0 #ffffff70", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "16px 32px", fontFamily: F.sans, fontWeight: 700, fontSize: 46, color: C.ink, boxShadow: "0 6px 0 #0002", display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ width: 40, height: 30, background: C.folder, borderRadius: 6 }} />{name}
        </div>
      </div>
    </div>
  );
};

const Envelope: React.FC<{ label: string; items?: string[]; dur: number }> = ({ label, items = [], dur }) => {
  const { p, frame, fps } = useT();
  const openAt = Math.round(dur * 0.45);
  const open = interpolate(frame, [openAt, openAt + 10], [0, 1], clamp);
  return (
    <div style={{ position: "relative", width: 640, height: 420, ...enter(p(2), 80, `rotate(${Math.sin(frame / 8) * 2 * (1 - open)}deg)`) }}>
      <Sfx name="slide" at={openAt} volume={0.5} />
      {items.map((_, i) => <Sfx key={`e${i}`} name="pop" at={openAt + 4 + i * 3} volume={0.4} />)}
      {["?", "?", "?", "?"].map((q, i) => (
        <div key={i} style={{ position: "absolute", left: [-60, 650, -20, 600][i], top: [-60 + Math.sin(frame / 10 + i) * 14, 0 + Math.cos(frame / 9 + i) * 14, 330, 380][i], fontFamily: F.mono, fontSize: 60, color: C.ghost }}>{q}</div>
      ))}
      {items.map((it, i) => {
        const s = pop(frame, fps, openAt + 4 + i * 3);
        const x = (i - (items.length - 1) / 2) * 120;
        return <div key={i} style={{ position: "absolute", left: 270 + x * s, top: 40 - s * 200, transform: `rotate(${(i - (items.length - 1) / 2) * 10 * s}deg)`, opacity: Math.min(1, s * 2), zIndex: 0 }}><NumBadge n={it} size={100} /></div>;
      })}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${C.tan}, #C99D62)`, borderRadius: 14, boxShadow: "0 24px 40px #0004" }} />
      <svg width={640} height={420} style={{ position: "absolute", inset: 0 }}>
        <path d="M0 420 L320 210 L640 420" fill="#C99D62" stroke="#B88B52" strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: 0, top: 0, width: 640, height: 260, transformOrigin: "50% 0", transform: `perspective(900px) rotateX(${open * 170}deg)` }}>
        <svg width={640} height={260}><path d="M0 0 L320 250 L640 0 Z" fill="#E4C08C" stroke="#B88B52" strokeWidth={3} /></svg>
      </div>
      <div style={{ position: "absolute", left: 285, top: 205, width: 70, height: 70, borderRadius: 35, background: "radial-gradient(circle at 35% 35%, #F0544F, #A51A16)", boxShadow: "0 4px 8px #0004", opacity: 1 - open, transform: `scale(${1 + open})` }} />
      <div style={{ position: "absolute", left: 200, top: 290, background: "#fff", padding: "6px 26px", fontFamily: F.stamp, fontSize: 70, color: C.red, transform: "rotate(-4deg)", boxShadow: "0 6px 10px #0003" }}>{label}</div>
    </div>
  );
};

const App: React.FC<{ icon: string; name: string; color?: string }> = ({ icon, name, color = "#D97757" }) => {
  const { p, frame } = useT();
  const s = p(2);
  const line = interpolate(frame, [14, 24], [0, 1], clamp);
  return (
    <div style={{ textAlign: "center", ...enter(s, 0, `rotate(${(1 - s) * -20}deg)`) }}>
      <Sfx name="pop" at={3} volume={0.5} />
      <Sfx name="blip" at={14} volume={0.35} />
      <div style={{ width: 320, height: 320, borderRadius: 76, margin: "0 auto", background: `linear-gradient(160deg, ${color}, ${color}cc)`, boxShadow: `0 30px 50px ${color}66, inset 0 4px 0 #ffffff60`, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${Math.sin(frame / 12) * 8}px)` }}><Icon name={icon} size={170} color="#fff" stroke={1.5} /></div>
      <div style={{ position: "relative", display: "inline-block", marginTop: 34, fontFamily: F.sans, fontWeight: 700, fontSize: 60, color: C.ink }}>
        <Em text={name} size={60} />
        <div style={{ position: "absolute", left: 0, bottom: -6, height: 8, width: `${line * 100}%`, background: C.red, borderRadius: 4 }} />
      </div>
    </div>
  );
};

const Photo: React.FC<{ src: string; caption?: string }> = ({ src: image, caption }) => {
  const { p, frame } = useT();
  return (
    <div style={{ position: "relative", width: 640, padding: "22px 22px 12px", background: "#FBFAF6", boxShadow: "0 30px 50px #0004", ...enter(p(2), 80, `rotate(${-3 + Math.sin(frame / 25)}deg)`) }}>
      <div style={{ position: "absolute", top: -20, left: 250, width: 140, height: 44, background: "#ffffffaa", transform: "rotate(-4deg)", boxShadow: "0 2px 4px #0001" }} />
      <div style={{ height: 560, overflow: "hidden", background: "#ddd" }}><KenBurns image={image} /></div>
      {caption && <div style={{ fontFamily: F.serif, fontSize: 52, textAlign: "center", color: C.ink, marginTop: 6 }}>{caption}</div>}
    </div>
  );
};
