/**
 * One wheel/trackpad gesture = one page, for the Pulse feed. Pure, so it is
 * unit-tested without a DOM (`src/lib/__tests__/wheelPaging.test.ts`); the
 * listener lives in `src/screens/Pulses.tsx`.
 *
 * Left to native scroll-snap, a trackpad drags the feed by any amount (two
 * Pulses half on screen until the fingers lift) and the momentum after a flick
 * can carry it past several. So the feed takes wheel input over: deltas add up
 * until they show intent (`WHEEL_PAGE_PX`), that fires ONE step, and the rest
 * of the same unbroken stream, momentum tail included, is swallowed. A pause
 * longer than `WHEEL_GESTURE_GAP_MS` (shared with pull-to-refresh) starts the
 * next gesture. Touch fires no wheel events, so phones keep the native swipe.
 */
import { startsNewGesture } from "./pullToRefresh";

/** Travel a gesture needs before it counts as "next" or "previous". */
export const WHEEL_PAGE_PX = 30;

/** Pixels per line, for devices that report lines (`deltaMode` 1, e.g. Firefox). */
export const WHEEL_LINE_PX = 40;

export type WheelPager = { travel: number; fired: boolean; lastAt: number | null };

export const IDLE_WHEEL: WheelPager = { travel: 0, fired: false, lastAt: null };

/** A wheel delta in pixels, whatever unit the device reported it in. */
export function wheelPixels(deltaY: number, deltaMode: number, pagePx: number): number {
  if (deltaMode === 1) return deltaY * WHEEL_LINE_PX;
  if (deltaMode === 2) return deltaY * pagePx;
  return deltaY;
}

/**
 * Fold one wheel event (`dy` px, positive = down) into the gesture. `step` is
 * the move to make now: 1 (next), -1 (previous), or 0 (not enough travel yet,
 * or this gesture has already moved).
 */
export function wheelPage(s: WheelPager, now: number, dy: number): { state: WheelPager; step: -1 | 0 | 1 } {
  const g = startsNewGesture(now, s.lastAt) ? IDLE_WHEEL : s;
  if (g.fired) return { state: { ...g, lastAt: now }, step: 0 };
  const travel = g.travel + dy;
  if (Math.abs(travel) < WHEEL_PAGE_PX) return { state: { travel, fired: false, lastAt: now }, step: 0 };
  return { state: { travel: 0, fired: true, lastAt: now }, step: travel > 0 ? 1 : -1 };
}

/** Keep a slide index inside [0, count - 1]. */
export function clampSlide(index: number, count: number): number {
  return Math.max(0, Math.min(index, count - 1));
}
