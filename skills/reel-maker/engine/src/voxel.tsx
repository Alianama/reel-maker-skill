import { random, useCurrentFrame, useVideoConfig } from "remotion";

// ---------- pixel textures ----------

type Pal = Record<string, string>;
const cache = new Map<string, string>();

const shade = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2, "0");
  return `#${ch(n >> 16)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
};

// Rows of palette chars ('.' = transparent) → crisp SVG data URI, with slight per-pixel shade noise.
export const tex = (rows: string[], pal: Pal, noise = 0.06) => {
  const id = JSON.stringify([rows, pal, noise]);
  const hit = cache.get(id);
  if (hit) return hit;
  if (rows.some((r) => r.length !== rows[0].length)) throw new Error(`Ragged texture rows: ${rows.join("|")}`);
  let rects = "";
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (!pal[ch]) return;
      const f = 1 + (random(`${id.length}-${x}-${y}`) - 0.5) * 2 * noise;
      rects += `<rect x='${x}' y='${y}' width='1.03' height='1.03' fill='${shade(pal[ch], f)}'/>`;
    }),
  );
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${rows[0].length} ${rows.length}' preserveAspectRatio='none' shape-rendering='crispEdges'>${rects}</svg>`;
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  cache.set(id, url);
  return url;
};

const grid = (w: number, h: number, fn: (x: number, y: number) => string) =>
  Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => fn(x, y)).join(""));

const rnd = (k: string) => random(k);

// ---------- 3D box ----------

type Faces = { front: string; back?: string; left?: string; right?: string; top?: string; bottom?: string };

const Face: React.FC<{ bg: string; w: number; h: number; left: number; top: number; t: string; dim: number }> = ({ bg, w, h, left, top, t, dim }) => (
  <div style={{ position: "absolute", left, top, width: w, height: h, transform: t, backgroundImage: `linear-gradient(rgba(0,0,0,${dim}), rgba(0,0,0,${dim})), ${bg}`, backgroundSize: "100% 100%", backfaceVisibility: "hidden" }} />
);

export const Box: React.FC<{ w: number; h: number; d: number; faces: Faces; style?: React.CSSProperties }> = ({ w, h, d, faces, style }) => {
  const side = faces.right ?? faces.back ?? faces.front;
  return (
    <div style={{ position: "absolute", width: w, height: h, transformStyle: "preserve-3d", ...style }}>
      <Face bg={faces.front} w={w} h={h} left={0} top={0} t={`translateZ(${d / 2}px)`} dim={0} />
      <Face bg={faces.back ?? faces.front} w={w} h={h} left={0} top={0} t={`rotateY(180deg) translateZ(${d / 2}px)`} dim={0.25} />
      <Face bg={side} w={d} h={h} left={(w - d) / 2} top={0} t={`rotateY(90deg) translateZ(${w / 2}px)`} dim={0.14} />
      <Face bg={faces.left ?? side} w={d} h={h} left={(w - d) / 2} top={0} t={`rotateY(-90deg) translateZ(${w / 2}px)`} dim={0.2} />
      <Face bg={faces.top ?? side} w={w} h={d} left={0} top={(h - d) / 2} t={`rotateX(90deg) translateZ(${h / 2}px)`} dim={0} />
      <Face bg={faces.bottom ?? faces.top ?? side} w={w} h={d} left={0} top={(h - d) / 2} t={`rotateX(-90deg) translateZ(${h / 2}px)`} dim={0.35} />
    </div>
  );
};

// ---------- block textures (palette: lime / forest / charcoal / cream) ----------

const LIME: Pal = { a: "#A3E635", b: "#84CC16", f: "#4D7C0F", F: "#365314", c: "#F7FEE7", C: "#ECFCCB", w: "#FAFAF9", k: "#111827", K: "#1F2937" };
const T = {
  grassTop: () => tex(grid(16, 16, (x, y) => (rnd(`gt${x}${y}`) > 0.5 ? "a" : "b")), LIME),
  grassSide: () => tex(grid(16, 16, (x, y) => (y < 3 + Math.floor(rnd(`gd${x}`) * 3) ? (rnd(`gs${x}${y}`) > 0.4 ? "a" : "b") : rnd(`gf${x}${y}`) > 0.5 ? "f" : "F")), LIME),
  cream: () => tex(grid(16, 16, (x, y) => (rnd(`cr${x}${y}`) > 0.6 ? "C" : rnd(`cw${x}${y}`) > 0.5 ? "w" : "c")), LIME),
  ore: () => tex(grid(16, 16, (x, y) => (rnd(`og${Math.floor(x / 2)}${Math.floor(y / 2)}`) > 0.88 ? "a" : rnd(`ok${x}${y}`) > 0.5 ? "k" : "K")), LIME),
};

const Cube: React.FC<{ kind: "grass" | "cream" | "ore"; size: number; style?: React.CSSProperties }> = ({ kind, size, style }) => {
  const faces: Faces =
    kind === "grass" ? { front: T.grassSide(), top: T.grassTop(), bottom: T.grassSide() } : kind === "cream" ? { front: T.cream() } : { front: T.ore() };
  return <Box w={size} h={size} d={size} faces={faces} style={style} />;
};

const CLOUD = ["...wwww.....", ".wwwwwwww...", "wwwwwwwwwwww", ".wwwwwwwwww.", "..CCCCCCC..."];

// Voxel world background: sky + pixel clouds/stars + floating 3D blocks + grass ground.
export const VoxelBg: React.FC<{ kind: "paper" | "cork" | "dark" }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const night = kind !== "paper";
  const sky = kind === "paper" ? "linear-gradient(#FAFAF9, #F7FEE7 55%, #ECFCCB)" : kind === "cork" ? "linear-gradient(#111827, #1F2937)" : "linear-gradient(#000000, #111827)";
  const line = night ? "#A3E63514" : "#4D7C0F12";
  const cubes = [
    { kind: "grass" as const, x: 40, y: 620, s: 80 },
    { kind: night ? ("ore" as const) : ("cream" as const), x: 960, y: 820, s: 96 },
    { kind: "grass" as const, x: 30, y: 1330, s: 64 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: sky, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${line} 2px, transparent 2px), linear-gradient(90deg, ${line} 2px, transparent 2px)`, backgroundSize: "60px 60px" }} />
      {!night &&
        [0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", top: 260 + i * 330, left: ((i * 430 + frame * (0.6 + i * 0.25)) % (width + 400)) - 300, width: 300, height: 125, backgroundImage: tex(CLOUD, { w: "#FFFFFF", C: "#D9F99D" }, 0), backgroundSize: "100% 100%", opacity: 0.9 }} />
        ))}
      {night &&
        Array.from({ length: 34 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: rnd(`sx${i}`) * width, top: rnd(`sy${i}`) * 1500, width: 10, height: 10, background: i % 3 ? "#A3E635" : "#F7FEE7", opacity: 0.35 + 0.65 * Math.abs(Math.sin(frame / 12 + i)) }} />
        ))}
      {cubes.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: c.x, top: c.y + Math.sin(frame / 20 + i) * 14, perspective: 900 }}>
          <Cube kind={c.kind} size={c.s} style={{ transform: `rotateX(-24deg) rotateY(${frame * (1 + i * 0.4) + i * 40}deg)` }} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 100, backgroundImage: T.grassSide(), backgroundSize: "100px 100px", filter: night ? "brightness(0.55)" : undefined }} />
    </div>
  );
};
