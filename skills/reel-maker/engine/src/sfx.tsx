import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { skin } from "./theme";

// Effect name → file in public/sfx (built by scripts/sfx.mjs).
const FILE: Record<string, string> = { zoom: "whoosh", burst: "boom" };
// Pop skin: cartoon sound set (files public/sfx/p-*.wav); unlisted names keep the default sound.
const POP_FILE: Record<string, string> = { zoom: "p-swoosh", whoosh: "p-swoosh", whip: "p-zip", halftone: "p-wipe", beat: "p-boing", stamp: "p-thump", tick: "p-tick", burst: "p-confetti", boom: "p-confetti", ring: "p-chime", x: "p-buzzer", check: "p-yay", punch: "p-bonk", pop: "p-bubble", slide: "p-slide", tap: "p-tap", ding: "p-ding" };

// Plays public/sfx/<name>.wav, optionally `at` frames into the current sequence.
export const Sfx: React.FC<{ name: string; at?: number; volume?: number }> = ({ name, at = 0, volume = 0.5 }) => {
  const a = <Audio src={staticFile(`sfx/${(skin === "pop" && POP_FILE[name]) || FILE[name] || name}.wav`)} volume={volume} />;
  return at > 0 ? <Sequence from={Math.round(at)} layout="none">{a}</Sequence> : a;
};
