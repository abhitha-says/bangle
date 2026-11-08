/**
 * The story's score. One number, scroll progress p ∈ [0, 1], determines
 * everything on screen. Every function here is pure, so scrolling back up
 * plays the story in reverse with no state to unwind.
 *
 * No three.js in this file: the page can lay out text and colour before the
 * 3D engine has loaded.
 */
import { STORY_BANGLES } from "./bangles";

export const SEGMENTS = [
  ["iris", 7], // the film is seen through an emerald bangle as the camera pulls back
  ["settle", 6], // the film gives way to champagne; the ring lies down
  ["build", 24], // six more bangles arrive and stack
  ["float", 8], // Scene A: beauty in every detail
  ["separate", 10], // Scene B: exploded view
  ["orbit", 14], // Scene C: curved choreography
  ["reassemble", 9], // Scene D: back to one stack
  ["closeup", 7], // the stones, up close
  ["tunnel", 9], // through the bore of the stack…
  ["worn", 6], // …onto her wrist
] as const;

export type SegmentName = (typeof SEGMENTS)[number][0];

const TOTAL = SEGMENTS.reduce((n, [, w]) => n + w, 0);
const BOUNDS: Record<SegmentName, [number, number]> = (() => {
  const out = {} as Record<SegmentName, [number, number]>;
  let acc = 0;
  for (const [name, w] of SEGMENTS) {
    out[name] = [acc / TOTAL, (acc + w) / TOTAL];
    acc += w;
  }
  return out;
})();

export const bounds = (s: SegmentName) => BOUNDS[s];

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
export const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeIn = (t: number) => Math.pow(clamp01(t), 3);

/** Local progress of p inside a segment (0 before, 1 after). */
export function local(p: number, s: SegmentName, from = 0, to = 1) {
  const [a, b] = BOUNDS[s];
  const t = (p - a) / (b - a);
  return clamp01((t - from) / (to - from));
}

/** Local progress across a run of segments. */
export function span(p: number, first: SegmentName, last: SegmentName) {
  const a = BOUNDS[first][0];
  const b = BOUNDS[last][1];
  return clamp01((p - a) / (b - a));
}

/** Arrival window of bangle k (1…6) within the build segment. */
export function arrival(p: number, k: number) {
  const n = STORY_BANGLES.length - 1;
  const step = 1 / n;
  const start = (k - 1) * step * 0.92;
  return local(p, "build", start, Math.min(1, start + step * 1.25));
}

/* ------------------------------------------------------------------ */
/* Room colour: bands that rise from below, as in a printed lookbook.  */
/* ------------------------------------------------------------------ */

export const ROOM_BASE = "#efe6d8";

export interface Band {
  color: string;
  /** 0 = below the screen, 1 = fully risen. */
  rise: number;
}

export function bands(p: number): Band[] {
  const out: Band[] = [];
  out.push({ color: STORY_BANGLES[0].wash, rise: easeInOut(local(p, "settle", 0.45, 1)) });
  for (let k = 1; k < STORY_BANGLES.length; k++) {
    out.push({ color: STORY_BANGLES[k].wash, rise: easeInOut(arrival(p, k) * 1.15) });
  }
  out.push({ color: "#eadcc8", rise: easeInOut(local(p, "float", 0, 0.45)) });
  out.push({ color: "#2b0c16", rise: easeInOut(local(p, "separate", 0, 0.4)) });
  out.push({ color: "#f1e8da", rise: easeInOut(local(p, "reassemble", 0.15, 0.6)) });
  return out;
}

/** Is the room dark (for text colour) at p? */
export const roomIsDark = (p: number) => local(p, "separate", 0, 0.3) > 0.5 && local(p, "reassemble", 0.15, 0.45) < 0.5;

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

export interface Chapter {
  id: string;
  numeral: string;
  label: string;
  /** Visible window: [segment, from, to] in and out. */
  in: [SegmentName, number, number];
  out: [SegmentName, number, number];
  dark?: boolean;
}

export const CHAPTERS: Chapter[] = [
  { id: "discovery", numeral: "I", label: "Discovery", in: ["settle", 0.5, 1], out: ["float", 0, 0.3] },
  { id: "beauty", numeral: "II", label: "Beauty", in: ["float", 0.25, 0.55], out: ["float", 0.88, 1] },
  { id: "craft", numeral: "III", label: "Craftsmanship", in: ["separate", 0.15, 0.45], out: ["separate", 0.85, 1], dark: true },
  { id: "movement", numeral: "IV", label: "Movement", in: ["orbit", 0.1, 0.35], out: ["orbit", 0.8, 1], dark: true },
  { id: "layered", numeral: "V", label: "Adornment", in: ["reassemble", 0.35, 0.7], out: ["closeup", 0.05, 0.35] },
  { id: "remember", numeral: "V", label: "Adornment", in: ["closeup", 0.3, 0.6], out: ["tunnel", 0.05, 0.3] },
  { id: "worn", numeral: "V", label: "Adornment", in: ["tunnel", 0.7, 1], out: ["worn", 0.92, 1] },
];

/** 0 → hidden below, 1 → shown, 2 → gone above. Smooth in between. */
export function chapterPhase(p: number, c: Chapter) {
  const i = local(p, c.in[0], c.in[1], c.in[2]);
  const o = local(p, c.out[0], c.out[1], c.out[2]);
  return easeOut(i) + easeIn(o);
}

/** Which rail stop is current (0…4). */
export function railIndex(p: number) {
  if (p < bounds("float")[0]) return 0;
  if (p < bounds("separate")[0]) return 1;
  if (p < bounds("orbit")[0]) return 2;
  if (p < bounds("reassemble")[0]) return 3;
  return 4;
}

/** How many bangles have landed (fractional while one is arriving). */
export function landed(p: number) {
  if (p < bounds("settle")[1]) return local(p, "settle", 0.6, 1);
  let n = 1;
  for (let k = 1; k < STORY_BANGLES.length; k++) n += easeOut(arrival(p, k));
  return n;
}

/** Hero film opacity (under the mask) and finale film opacity. */
export const heroOpacity = (p: number) => 1 - smooth(local(p, "settle", 0, 0.45));
export const wristOpacity = (p: number) => smooth(local(p, "tunnel", 0.42, 0.62));

/** Exploded-view labels. */
export const labelsVisible = (p: number) => easeOut(local(p, "separate", 0.45, 0.8)) * (1 - easeIn(local(p, "orbit", 0, 0.25)));
