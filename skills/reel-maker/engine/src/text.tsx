import { At, C, F } from "./theme";

export type Word = { w: string; em: boolean; start: number };

// Split "*marked*" words; emphasis may span several words and be followed by punctuation.
export const splitEm = (text: string) => {
  let em = false;
  return text.split(/\s+/).filter(Boolean).map((tok) => {
    const opens = tok.startsWith("*");
    if (opens) em = true;
    const w = { w: tok.replace(/\*/g, ""), em };
    if (/\*[^\p{L}\p{N}*]*$/u.test(tok) && (tok.length > 1 || !opens)) em = false;
    return w;
  });
};

// Word start times: spread by length over the voiced frames (amp), so pauses at commas are respected.
export const parseWords = (text: string, speech: number, fps: number, amp?: number[]): Word[] => {
  const raw = splitEm(text);
  const total = raw.reduce((a, r) => a + r.w.length + 2, 0);
  const voiced = (amp ?? []).map((a, i) => (a > 0.06 ? i : -1)).filter((i) => i >= 0 && i < speech * fps);
  let acc = 0;
  return raw.map((r) => {
    const p = acc / total;
    acc += r.w.length + 2;
    const start = voiced.length > 10 ? voiced[Math.floor(p * voiced.length)] / fps : p * speech;
    return { ...r, start };
  });
};

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");

// `at` is seconds, or the first spoken word containing that text.
export const timeOf = (at: At | undefined, words: Word[]) => {
  if (at === undefined) return 0;
  if (typeof at === "number") return at;
  const hit = words.find((w) => norm(w.w).includes(norm(at)));
  return hit ? hit.start : 0;
};

// Inline text with *emphasis* in red serif italic.
export const Em: React.FC<{ text: string; size: number; color?: string }> = ({ text, size, color = C.ink }) => (
  <>
    {splitEm(text).map((w, i) => (
      <span key={i} style={{ fontFamily: w.em ? F.serif : "inherit", color: w.em ? C.red : color, fontSize: w.em ? size * 1.12 : size, fontWeight: w.em ? 400 : undefined }}>
        {w.w}{" "}
      </span>
    ))}
  </>
);
