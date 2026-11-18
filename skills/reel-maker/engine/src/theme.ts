import { loadFont as loadSans } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadStamp } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadPixel } from "@remotion/google-fonts/PixelifySans";
import { loadFont as loadPixelStamp } from "@remotion/google-fonts/Jersey10";
import { loadFont as loadPixelMono } from "@remotion/google-fonts/VT323";
import { loadFont as loadBrico } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadMarker } from "@remotion/google-fonts/CaveatBrush";
import { loadFont as loadLilita } from "@remotion/google-fonts/LilitaOne";
import { spring } from "remotion";
import type { Channel, Msg } from "./ChatUI";

const PAPER = {
  bg: "#F1EEE8",
  ink: "#141414",
  red: "#E5322D", // accent
  onRed: "#FFFFFF", // text/icons on the accent
  em: "#E5322D", // *emphasis* text
  emBg: "transparent",
  muted: "#9A958C",
  ghost: "#C9C3B8",
  card: "#FFFFFF",
  dark: "#1B1B1D",
  skin: "#E7B08A",
  jacket: "#75695F",
  folder: "#5AA8F0",
  folderDark: "#4F98DF",
  folder2: "#3E8FE0",
  screen: "linear-gradient(160deg, #2B2F7A, #8A4FB8 55%, #F08A6A)",
  tan: "#D9B27C",
  sticky: "#F6D84A",
};

// Voxel skin palette: lime / forest green / charcoal / cream.
const VOXEL: typeof PAPER = {
  bg: "#F7FEE7",
  ink: "#111827",
  red: "#84CC16",
  onRed: "#111827",
  em: "#365314",
  emBg: "#A3E635",
  muted: "#4D7C0F",
  ghost: "#BEDB8C",
  card: "#FAFAF9",
  dark: "#111827",
  skin: "#E7B08A",
  jacket: "#4D7C0F",
  folder: "#A3E635",
  folderDark: "#65A30D",
  folder2: "#84CC16",
  screen: "linear-gradient(160deg, #365314, #4D7C0F 55%, #A3E635)",
  tan: "#D9C79A",
  sticky: "#A3E635",
};

// Lime skin: paper look (normal fonts, soft shadows, paper texture) in the voxel/brand colours.
// Accent is forest green so text stays readable on cream; lime is used as highlight.
const LIME: typeof PAPER = { ...VOXEL, red: "#4D7C0F", onRed: "#FFFFFF", em: "#365314", emBg: "#A3E635", ghost: "#C5D9A4", card: "#FFFFFF", sticky: "#D9F99D", tan: "#E2EFC8" };

// Pop skin: flat sticker illustration (thick charcoal outlines, hard shadows) in the brand colours.
const POP: typeof PAPER = { ...LIME, red: "#365314", ghost: "#BFD79A", sticky: "#D9F99D" };

const FONTS = {
  paper: {
    sans: loadSans("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily,
    serif: loadSerif("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily,
    stamp: loadStamp("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
    mono: loadMono("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  },
  pop: {
    sans: loadBrico("normal", { weights: ["700", "800"], subsets: ["latin"] }).fontFamily,
    serif: loadMarker("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
    stamp: loadLilita("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
    mono: loadMono("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  },
  voxel: {
    sans: loadPixel("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily,
    serif: loadPixel("normal", { weights: ["700"], subsets: ["latin"] }).fontFamily,
    stamp: loadPixelStamp("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
    mono: loadPixelMono("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  },
};

export type Skin = "paper" | "voxel" | "lime" | "pop";
// Skins drawn in the brand colours on a cream page (lime highlights).
export const brand = () => skin === "lime" || skin === "pop";

// Live bindings: every component reads the active skin's values.
// shortcut: module-level skin (set by <Reel> per render); fine while one render uses one style, switch to React context if mixing styles in one composition.
export let skin: Skin = "paper";
export let C = PAPER;
export let F = FONTS.paper;
export let cardShadow = "0 8px 0 #00000010, 0 18px 40px #0000001c";

// Hard pixel drop shadow for big display text in the voxel skin.
export const pixelShadow = (color = "#111827", d = 6) => (skin === "voxel" ? `${d}px ${d}px 0 ${color}` : "none");

export const setSkin = (s: Skin = "paper") => {
  skin = s;
  C = s === "voxel" ? VOXEL : s === "lime" ? LIME : s === "pop" ? POP : PAPER;
  F = s === "voxel" ? FONTS.voxel : s === "pop" ? FONTS.pop : FONTS.paper;
  cardShadow = s === "voxel" ? "8px 8px 0 #111827, inset -6px -6px 0 #0000001a, inset 6px 6px 0 #ffffff" : s === "pop" ? "10px 10px 0 #111827" : "0 8px 0 #00000010, 0 18px 40px #0000001c";
};

// Springy 0→1 pop used by every element entrance.
export const pop = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 170 } });

// Entrance look shared by all elements: fade + blur + rise + grow.
export const enter = (s: number, rise = 60, extra = ""): React.CSSProperties => ({
  opacity: Math.min(1, Math.max(0, s * 1.6)),
  filter: `blur(${Math.max(0, (1 - s) * 16)}px)`,
  transform: `translateY(${(1 - s) * rise}px) scale(${0.8 + 0.2 * s}) ${extra}`,
});

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const svgUrl = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
const noise = (freq: number, alpha: number, rgb = "0 0 0") =>
  svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${rgb.split(" ")[0]} 0 0 0 0 ${rgb.split(" ")[1]} 0 0 0 0 ${rgb.split(" ")[2]} 0 0 0 ${alpha} 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`);

type BgKind = "paper" | "cork" | "dark";
// Read at render time (after setSkin) so the lime skin gets its own colours.
export const bgStyle = (kind: BgKind): React.CSSProperties =>
  skin === "pop"
    ? { backgroundColor: kind === "paper" ? "#F7FEE7" : kind === "cork" ? "#365314" : "#111827" }
    : skin !== "lime"
    ? BG[kind]
    : kind === "paper"
      ? { backgroundColor: C.bg, backgroundImage: `${noise(0.85, 0.07)}, radial-gradient(#4D7C0F14 2px, transparent 2px), radial-gradient(ellipse at 50% 40%, transparent 55%, #36531422 100%)`, backgroundSize: "auto, 40px 40px, auto" }
      : kind === "cork"
        ? { backgroundColor: "#365314", backgroundImage: `${noise(0.85, 0.18)}, radial-gradient(#A3E63522 2px, transparent 2px), radial-gradient(ellipse at 50% 40%, transparent 40%, #00000066 100%)`, backgroundSize: "auto, 40px 40px, auto" }
        : { backgroundColor: "#111827", backgroundImage: `${noise(0.85, 0.12, "1 1 1")}, radial-gradient(#A3E63526 1.5px, transparent 1.5px)`, backgroundSize: "auto, 18px 18px" };

const BG: Record<BgKind, React.CSSProperties> = {
  paper: {
    backgroundColor: PAPER.bg,
    backgroundImage: `${noise(0.85, 0.09)}, radial-gradient(ellipse at 50% 40%, transparent 55%, #0000001a 100%)`,
  },
  cork: {
    backgroundColor: "#8C6A42",
    backgroundImage: `linear-gradient(#000000c0, transparent 28%, transparent 75%, #00000080), ${noise(1.3, 0.55, "0.15 0.08 0")}, ${noise(0.04, 0.35, "0.25 0.15 0.05")}`,
  },
  dark: {
    backgroundColor: "#151515",
    backgroundImage: `${noise(0.85, 0.12, "1 1 1")}, radial-gradient(#ffffff14 1.5px, transparent 1.5px)`,
    backgroundSize: "auto, 18px 18px",
  },
};

export type At = string | number;

export type Visual =
  | { type: "bigText"; text: string }
  | { type: "steps"; items: { title: string; icon?: string }[]; active?: number }
  | { type: "window"; title: string; lines: { text: string; tag?: string; warn?: boolean }[]; prompt?: string }
  | { type: "stat"; value: string; label: string; source?: string }
  | { type: "compare"; left: { title: string; items: string[] }; right: { title: string; items: string[] } }
  | { type: "cards"; items: { icon?: string; image?: string; label: string }[]; magnifier?: boolean }
  | { type: "cta"; keyword: string }
  | { type: "laptop"; image?: string; title?: string }
  | { type: "phone"; image?: string; title?: string; chip?: string }
  | { type: "browser"; url: string; title?: string; image?: string }
  | { type: "folder"; name: string; files?: { icon: string; label: string }[] }
  | { type: "envelope"; label: string; items?: string[] }
  | { type: "app"; icon: string; name: string; color?: string }
  | { type: "image"; src: string; caption?: string }
  | { type: "inbox"; items: { name: string; channel: Channel; text: string; unread?: number; status?: "bot" | "wait" | "agent" }[] }
  | { type: "chat"; contact: string; channel: Channel; messages: Msg[] }
  | { type: "lead"; name: string; channel?: Channel; score: number; intents?: string[]; fields?: { label: string; value: string }[] }
  | { type: "pipeline"; columns: string[]; deal: { title: string; value: string } }
  | { type: "notifs"; items: { channel: Channel; name: string; text: string }[]; total?: number }
  | { type: "pile"; files: string[]; total?: number }
  | { type: "upload"; base: string; files: { name: string; pages?: number; ocr?: boolean }[] }
  | { type: "ask"; question: string; answer: string; refuse?: boolean }
  | { type: "sources"; items: { title: string; page: number; score: number; cited?: boolean }[] }
  | { type: "docPage"; title: string; page: number; before?: string; mark: string; after?: string }
  | { type: "extract"; doc: string; fields: { label: string; value: string; ok?: boolean; note?: string }[] }
  | { type: "calc"; title?: string; rows: { label: string; value: string; op?: string }[]; result: { label: string; value: string } }
  | { type: "mentions"; topic: string; bars?: number[]; items: { source: "instagram" | "x" | "telegram" | "berita"; user: string; text: string; sentiment: "positif" | "netral" | "negatif" }[]; alert?: string }
  | { type: "flow"; nodes: { icon: string; label: string }[] }
  | { type: "define"; term: string; say?: string; meaning: string; example?: string }
  | { type: "night"; from: string; time: string; name: string; text: string }
  | { type: "lost"; shop: string }
  | { type: "upgrade"; name: string; from: string; tools: { label: string; icon: string }[] }
  | { type: "typo"; shop: string; typed: string; fixed: string }
  | { type: "catalog"; query: string; items: { name: string; color: string; price: number; stock: number }[]; pick: number; reply: string }
  | { type: "ship"; city: string; zip: string; cost: number }
  | { type: "receipt"; agree: string; id: string; rows: { label: string; value: string }[]; total: string }
  | { type: "pay"; total: string; methods: string[]; taps: number[] }
  | { type: "expire"; id: string; stock: [number, number] }
  | { type: "ticket"; complaint: string; id: string }
  | { type: "pass"; ask: string; agent: string }
  | { type: "shift" }
  | { type: "comment"; keyword: string; dm: string }
  | { type: "tag"; price: string; vs: string; diff: string; at: [number, number] }
  | { type: "scan"; at: [number, number] }
  | { type: "fade"; at: [number, number, number] }
  | { type: "menu"; items: { name: string; price: string }[]; at: [number, number, number, number] }
  | { type: "popcorn"; items: { label: string; price: string; size: number; at?: number }[]; decoy?: { cross: number; win: number; stamp: number; tag: string } }
  | { type: "follow"; name: string }
  | { type: "shelf"; at: [number, number] }
  | { type: "spend"; left: string; right: string }
  | { type: "puppet" }
  | { type: "basket"; milk: number; drops: number[] }
  | { type: "blueprint"; at: number }
  | { type: "magnet"; crown: number }
  | { type: "storeMap"; at: [number, number]; sign?: string }
  | { type: "walk"; at: [number, number, number, number, number, number] }
  | { type: "flip"; at: number }
  | { type: "backdoor"; at: [number, number, number, number] }
  | { type: "duo"; at: [number, number] }
  | { type: "gift" }
  | { type: "eyeLevel"; at: [number, number, number] }
  | { type: "phrase"; words: { w: string; at: number; line: number; hi?: boolean }[] }
  | { type: "kasir"; at: [number, number, number, number, number] }
  | { type: "list"; items: string[]; at: number }
  | { type: "series" }
  | { type: "calendar"; flip: number[]; boom: number }
  | { type: "cartFill"; adds: number[]; full: number }
  | { type: "hat"; pop: number }
  | { type: "flash"; sale: number; panic: number }
  | { type: "lowStock"; low: number; rush: number; doubt: number }
  | { type: "strike"; line: number; slam: number; rival: number }
  | { type: "ongkir"; show: number; short: number; add: number; done: number }
  | { type: "midnight"; ticks: number[]; clock: number; zero: number }
  | { type: "rivals"; at: [number, number, number] }
  | { type: "beach"; l: number; r: number; moves?: { who: "l" | "r"; to: number; at: [number, number] }[]; show?: [number, number]; reveal?: number; you?: boolean }
  | { type: "survey"; at: [number, number, number] }
  | { type: "piggy"; at: [number, number, number] }
  | { type: "hop"; at: [number, number, number, number] }
  | { type: "destination"; at: number }
  | { type: "thumb"; at: number }
  | { type: "toolkit"; fly: number; glow: number }
  | { type: "lapak"; shops: { name: string; logo?: string; color: string; close?: number; half?: boolean; sign?: string; signAt?: number; open?: boolean }[]; ask?: number }
  | { type: "burn"; ignite: number; tags: { text: string; at: number }[]; investor: number }
  | { type: "topple"; drain: number; fall: number }
  | { type: "crowd"; pick: number; grow: number; leave: number }
  | { type: "search"; typing: [number, number]; stop: number }
  | { type: "feed"; live: number; buy: number }
  | { type: "diskon"; at: number[]; empty: number }
  | { type: "spread"; at: number[] }
  | { type: "nota"; notes: string[]; diff: string }
  | { type: "qrOrder"; store: string; table: string; item: string; price: number; options: { group: string; choices: string[]; pick: number; extra?: number }[]; name: string }
  | { type: "qris"; store: string; total: number }
  | { type: "report"; omzet: number; bars: number[]; qris: number; best: string; sold: number }
  | { type: "countdown"; days: number }
  | { type: "meja"; you: string; them: string }
  | { type: "stalk"; tap: number; ads: number[] }
  | { type: "noClick"; at: number }
  | { type: "tagged"; open: number; pin: number; orbit: number }
  | { type: "crush"; seen: number[]; love: number; same: number; stampAt: number }
  | { type: "trio"; active: number }
  | { type: "stock"; two: number; panic: number }
  | { type: "scale"; loss: number; two: number; gain: number }
  | { type: "motive"; need: number; cross: number; ghost: number }
  | { type: "stampCard"; stamps?: number[]; think?: number }
  | { type: "study"; free: number; bars: number; equal: number }
  | { type: "chase"; look: number; chase: number }
  | { type: "shop"; at: number[] }
  | { type: "twin"; flips: number[]; rain: number }
  | { type: "queue"; at: [number, number] }
  | { type: "shortcut"; at: [number, number, number] }
  | { type: "sample"; at: [number, number, number] }
  | { type: "story"; from: number; to: number; at: [number, number] }
  | { type: "checkout"; total: string; at: [number, number] }
  | { type: "blue"; at: [number, number, number, number] }
  | { type: "banks"; at: number }
  | { type: "logos"; at: [number, number, number, number, number] }
  | { type: "skySea"; at: [number, number, number] }
  | { type: "blueBrain"; at: [number, number, number] }
  | { type: "sells"; at: number }
  | { type: "stranger"; at: [number, number] }
  | { type: "neon"; at: number }
  | { type: "cosmetic"; at: [number, number, number] }
  | { type: "bond" }
  | { type: "palette" }
  | { type: "poSleep" }
  | { type: "poLate"; at: [number, number, number] }
  | { type: "poBury"; at: number }
  | { type: "poCompose"; at: [number, number, number, number] }
  | { type: "poAccounts"; at: number[] }
  | { type: "poWeek"; at: [number, number] }
  | { type: "poRepost"; at: [number, number] }
  | { type: "poPlans"; at: [number, number, number, number] }
  | { type: "poMorning"; at: [number, number] };

export type Beat = { visual: Visual; at?: At; cross?: boolean };
export type Fx = { type: "burst" | "ring" | "x" | "check" | "note" | "punch"; at: At; text?: string; x?: number; y?: number };

export type Scene = {
  label?: string; // internal note only, not rendered
  text: string;
  bg?: BgKind;
  transition?: "zoom" | "whip" | "halftone";
  headline?: { text: string; num?: number; at?: At };
  visual?: Visual;
  beats?: Beat[];
  fx?: Fx[];
  audio?: string; // absent in silent reels (`"voice": false`)
  duration: number;
  amp?: number[];
  railStep?: number; // lights step N of the reel's `rail`
};
export type ReelData = { title: string; style?: Skin; music?: string; watermark?: string; rail?: string[]; scenes: Scene[] }; // music: file in public/, e.g. "music/chiptune.wav"
