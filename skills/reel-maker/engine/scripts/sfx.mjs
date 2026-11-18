// One-time: builds layered SFX into public/sfx/ (run: node scripts/sfx.mjs).
// Layers = synthesized sub-bass/whoosh (ffmpeg) + CC0 Kenney sounds (via github.com/kapishdima/soundcn).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const RAW = "https://raw.githubusercontent.com/kapishdima/soundcn/main/assets/";
const CACHE = "scripts/.sfx-cache";
mkdirSync(CACHE, { recursive: true });
mkdirSync("public/sfx", { recursive: true });

const SYNTH = {
  sub: "aevalsrc='0.9*sin(2*PI*(32*t+(60/7)*(1-exp(-7*t))))*exp(-3*t)':s=44100:d=1.6",
  subShort: "aevalsrc='0.8*sin(2*PI*(45*t+(70/12)*(1-exp(-12*t))))*exp(-7*t)':s=44100:d=0.6",
  whoosh: "anoisesrc=color=brown:d=0.7:a=0.9:r=44100,volume='pow(sin(PI*t/0.7),3)':eval=frame,lowpass=f=1400,highpass=f=60",
  // 8-bit blips for the chat UI (square waves via sgn(sin)).
  coin: "aevalsrc='0.35*sgn(sin(2*PI*if(lt(t,0.08),988,1319)*t))*exp(-6*max(0,t-0.08))':s=44100:d=0.45",
  blip: "aevalsrc='0.3*sgn(sin(2*PI*(660+1200*t)*t))*exp(-25*t)':s=44100:d=0.15",
  ding: "aevalsrc='0.5*(sin(2*PI*1568*t)*exp(-8*t)+lt(0.09,t)*sin(2*PI*2093*(t-0.09))*exp(-6*max(0,t-0.09)))':s=44100:d=0.8",
  buzz: "aevalsrc='0.45*sin(2*PI*150*t)*sin(2*PI*175*t)*lt(mod(t,0.25),0.17)':s=44100:d=0.5",
  bell: "aevalsrc='0.4*(sin(2*PI*2637*t)+0.6*sin(2*PI*3520*t))*exp(-4*t)':s=44100:d=1.2",
  alarm: "aevalsrc='0.3*sgn(sin(2*PI*880*t))*lt(mod(t,0.2),0.1)':s=44100:d=0.6",
  print: "anoisesrc=d=0.6:a=0.5:r=44100,volume='lt(mod(t,0.05),0.025)':eval=frame,bandpass=f=3000:w=2000",
  error: "aevalsrc='0.35*sgn(sin(2*PI*if(lt(t,0.12),330,220)*t))*exp(-4*max(0,t-0.12))':s=44100:d=0.45",
  // Pop skin (cartoon set): slide whistles, boings, marimba, woodblock.
  boing: "aevalsrc='0.6*sin(2*PI*(170*t+70*(1-exp(-6*t)))+5*sin(2*PI*15*t)*exp(-3*t))*exp(-3.5*t)':s=44100:d=0.75",
  whistleUp: "aevalsrc='0.35*sin(2*PI*(500*t+1100*t*t))*sin(PI*t/0.4)':s=44100:d=0.4",
  whistleDown: "aevalsrc='0.35*sin(2*PI*(1900*t-1700*t*t))*sin(PI*t/0.28)':s=44100:d=0.28",
  marimba: "aevalsrc='0.45*(sin(2*PI*1047*t)*exp(-11*t)+gte(t,0.07)*sin(2*PI*1319*(t-0.07))*exp(-11*(t-0.07))+gte(t,0.14)*sin(2*PI*1568*(t-0.14))*exp(-8*(t-0.14)))':s=44100:d=0.8",
  marimbaUp: "aevalsrc='0.45*(sin(2*PI*784*t)*exp(-12*t)+gte(t,0.06)*sin(2*PI*1047*(t-0.06))*exp(-12*(t-0.06))+gte(t,0.12)*sin(2*PI*1319*(t-0.12))*exp(-12*(t-0.12))+gte(t,0.18)*sin(2*PI*2093*(t-0.18))*exp(-6*(t-0.18)))':s=44100:d=0.9",
  tick2: "aevalsrc='0.4*(sin(2*PI*1400*t)+0.3*sin(2*PI*4200*t))*exp(-45*t)':s=44100:d=0.12",
  wood: "aevalsrc='0.6*(sin(2*PI*880*t)*exp(-55*t)+0.5*sin(2*PI*1760*t)*exp(-80*t))':s=44100:d=0.15",
  bonk: "aevalsrc='0.7*sin(2*PI*(160*t+(250/20)*(1-exp(-20*t))))*exp(-18*t)':s=44100:d=0.3",
  bubble: "aevalsrc='0.45*sin(2*PI*(350*t+2600*t*t))*exp(-26*t)':s=44100:d=0.14",
  glock: "aevalsrc='0.45*(sin(2*PI*2093*t)*exp(-4*t)+0.4*sin(2*PI*4186*t)*exp(-7*t))':s=44100:d=0.9",
  sparkle: "aevalsrc='0.22*(sin(2*PI*2637*t)*exp(-9*t)+gte(t,0.05)*sin(2*PI*3136*(t-0.05))*exp(-9*(t-0.05))+gte(t,0.1)*sin(2*PI*3951*(t-0.1))*exp(-9*(t-0.1))+gte(t,0.15)*sin(2*PI*4699*(t-0.15))*exp(-8*(t-0.15)))':s=44100:d=0.7",
  popper: "anoisesrc=d=0.12:a=0.9:r=44100,volume='exp(-40*t)':eval=frame,highpass=f=900",
  buzzer: "aevalsrc='0.3*sgn(sin(2*PI*140*t))*lt(mod(t,0.2),0.15)':s=44100:d=0.4,lowpass=f=1600",
  siren: "aevalsrc='0.3*sgn(sin(2*PI*(700*t+120*sin(2*PI*5*t)/(2*PI*5)*30)))*exp(-1.5*t)':s=44100:d=0.7,lowpass=f=2500",
  heart: "aevalsrc='0.9*(sin(2*PI*55*t)*exp(-14*t)+gte(t,0.22)*sin(2*PI*50*(t-0.22))*exp(-14*(t-0.22)))':s=44100:d=0.6",
  trill: "aevalsrc='0.4*sin(2*PI*if(lt(mod(t,0.08),0.04),900,1200)*t)*lt(mod(t,0.04),0.025)*(1-t/0.6)':s=44100:d=0.6",
  ghost: "aevalsrc='0.35*sin(2*PI*(520*t-260*t*t)+6*sin(2*PI*6*t))*sin(PI*t/1.0)':s=44100:d=1.0",
  creak: "aevalsrc='0.25*sgn(sin(2*PI*(90*t+40*t*t)))*(0.5+0.5*sgn(sin(2*PI*28*t)))*sin(PI*t/0.6)':s=44100:d=0.6,lowpass=f=900",
  swish: "anoisesrc=color=pink:d=0.35:a=0.6:r=44100,volume='pow(sin(PI*t/0.35),2)':eval=frame,bandpass=f=2200:w=1800",
};

// name → layers [source, delayMs, volume]; source is a SYNTH key or a Kenney file path.
const RECIPES = {
  whoosh: { reverb: true, layers: [["whoosh", 0, 1], ["subShort", 250, 0.7]] },
  whip: { layers: [["swish", 0, 1], ["subShort", 120, 0.6]] },
  halftone: { reverb: true, layers: [["whoosh", 0, 0.9], ["kenney_interface-sounds/glitch_003.ogg", 150, 0.5], ["sub", 330, 0.9], ["kenney_impact-sounds/impactPunch_heavy_000.ogg", 330, 0.6]] },
  boom: { reverb: true, layers: [["sub", 0, 1], ["kenney_impact-sounds/impactPunch_heavy_001.ogg", 0, 0.8], ["swish", 0, 0.3]] },
  ring: { reverb: true, layers: [["kenney_interface-sounds/glass_001.ogg", 0, 0.7], ["subShort", 0, 0.5]] },
  x: { layers: [["kenney_interface-sounds/scratch_002.ogg", 0, 0.9], ["kenney_impact-sounds/impactSoft_heavy_002.ogg", 120, 0.8], ["subShort", 120, 0.5]] },
  check: { reverb: true, layers: [["kenney_interface-sounds/confirmation_002.ogg", 0, 0.8], ["subShort", 0, 0.5]] },
  note: { layers: [["kenney_interface-sounds/drop_002.ogg", 0, 0.8], ["kenney_impact-sounds/impactPlank_medium_000.ogg", 0, 0.4], ["swish", 0, 0.3]] },
  stamp: { reverb: true, layers: [["kenney_impact-sounds/impactPunch_medium_001.ogg", 0, 0.9], ["sub", 0, 0.8]] },
  tick: { layers: [["kenney_interface-sounds/tick_001.ogg", 0, 0.6]] },
  beat: { layers: [["kenney_interface-sounds/maximize_004.ogg", 0, 0.5], ["whoosh", 0, 0.6], ["subShort", 200, 0.4]] },
  pop: { layers: [["kenney_interface-sounds/pluck_001.ogg", 0, 0.8], ["blip", 0, 0.4]] },
  ding: { reverb: true, layers: [["ding", 0, 0.7], ["kenney_interface-sounds/bong_001.ogg", 0, 0.4]] },
  type: { layers: [["kenney_interface-sounds/click_002.ogg", 0, 0.5]] },
  slide: { layers: [["swish", 0, 0.5], ["kenney_interface-sounds/select_002.ogg", 0, 0.6]] },
  blip: { layers: [["blip", 0, 0.6]] },
  coin: { reverb: true, layers: [["coin", 0, 0.7], ["kenney_interface-sounds/confirmation_001.ogg", 0, 0.3]] },
  takeover: { reverb: true, layers: [["kenney_interface-sounds/maximize_006.ogg", 0, 0.7], ["kenney_interface-sounds/switch_002.ogg", 0, 0.5], ["subShort", 0, 0.5]] },
  tap: { layers: [["kenney_interface-sounds/click_002.ogg", 0, 0.8], ["subShort", 0, 0.35]] },
  buzz: { layers: [["buzz", 0, 0.8]] },
  cash: { reverb: true, layers: [["coin", 0, 0.6], ["bell", 80, 0.6]] },
  alarm: { layers: [["alarm", 0, 0.8]] },
  print: { layers: [["print", 0, 0.6]] },
  error: { layers: [["error", 0, 0.7], ["subShort", 0, 0.5]] },
  punch: { layers: [["subShort", 0, 0.8], ["kenney_impact-sounds/impactSoft_medium_000.ogg", 0, 0.5]] },
};

Object.assign(RECIPES, {
  "p-swoosh": { layers: [["swish", 0, 1.2], ["whistleUp", 0, 0.9]] },
  "p-zip": { layers: [["whistleDown", 0, 1.1], ["swish", 0, 0.9]] },
  "p-wipe": { reverb: true, layers: [["whistleUp", 0, 1.0], ["swish", 60, 0.9], ["bonk", 300, 0.6], ["sparkle", 330, 0.6]] },
  "p-boing": { layers: [["boing", 0, 0.7]] },
  "p-thump": { reverb: true, layers: [["bonk", 0, 0.8], ["kenney_impact-sounds/impactPunch_medium_001.ogg", 0, 0.5], ["subShort", 0, 0.5]] },
  "p-tick": { layers: [["tick2", 0, 0.7]] },
  "p-confetti": { reverb: true, layers: [["popper", 0, 0.8], ["subShort", 0, 0.6], ["sparkle", 60, 0.8]] },
  "p-chime": { reverb: true, layers: [["marimba", 0, 1.4]] },
  "p-buzzer": { layers: [["buzzer", 0, 0.8], ["bonk", 0, 0.4]] },
  "p-yay": { reverb: true, layers: [["marimbaUp", 0, 1.3], ["sparkle", 200, 0.4]] },
  "p-bonk": { layers: [["bonk", 0, 0.8]] },
  "p-bubble": { layers: [["bubble", 0, 0.8]] },
  "p-slide": { layers: [["whistleUp", 0, 0.8], ["swish", 0, 0.6]] },
  "p-tap": { layers: [["wood", 0, 0.8]] },
  "p-ding": { reverb: true, layers: [["glock", 0, 1.6]] },
  "p-siren": { layers: [["siren", 0, 1.4]] },
  "p-heart": { layers: [["heart", 0, 0.9]] },
  "p-run": { layers: [["trill", 0, 0.7]] },
  "p-ghost": { reverb: true, layers: [["ghost", 0, 1.8]] },
  "p-creak": { layers: [["creak", 0, 0.7], ["bonk", 450, 0.5]] },
});

const fetchKenney = async (path) => {
  const file = `${CACHE}/${path.replace("/", "__")}`;
  if (!existsSync(file)) {
    const res = await fetch(RAW + path);
    if (!res.ok) throw new Error(`download ${path}: ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return file;
};

const only = process.argv[2]; // e.g. "p-" rebuilds only the pop set
for (const [name, { layers, reverb }] of Object.entries(RECIPES)) {
  if (only && !name.startsWith(only)) continue;
  const args = ["-v", "error", "-y"];
  for (const [src] of layers) {
    if (SYNTH[src]) args.push("-f", "lavfi", "-i", SYNTH[src]);
    else args.push("-i", await fetchKenney(src));
  }
  const chains = layers.map(([, delay, vol], i) => `[${i}]aresample=44100,aformat=channel_layouts=stereo,volume=${vol},adelay=${delay}|${delay}[a${i}]`);
  const mix = `${layers.map((_, i) => `[a${i}]`).join("")}amix=inputs=${layers.length}:normalize=0${reverb ? ",aecho=0.8:0.5:60|130:0.25|0.15" : ""},alimiter=limit=0.9`;
  execFileSync("ffmpeg", [...args, "-filter_complex", `${chains.join(";")};${mix}`, `public/sfx/${name}.wav`]);
  console.log(`🔊 public/sfx/${name}.wav`);
}
