import { describe, it, expect } from "vitest";
import { WHEEL_GESTURE_GAP_MS } from "../pullToRefresh";
import {
  WHEEL_PAGE_PX,
  WHEEL_LINE_PX,
  IDLE_WHEEL,
  wheelPixels,
  wheelPage,
  clampSlide,
  type WheelPager,
} from "../wheelPaging";

/** Feed a run of [time, dy] events through the pager; returns every step taken. */
function run(events: [number, number][], start: WheelPager = IDLE_WHEEL) {
  let s = start;
  const steps: number[] = [];
  for (const [t, dy] of events) {
    const r = wheelPage(s, t, dy);
    s = r.state;
    steps.push(r.step);
  }
  return { steps, state: s };
}

describe("wheelPixels", () => {
  it("passes pixel deltas through", () => {
    expect(wheelPixels(100, 0, 800)).toBe(100);
  });
  it("converts lines and pages", () => {
    expect(wheelPixels(3, 1, 800)).toBe(3 * WHEEL_LINE_PX);
    expect(wheelPixels(-1, 2, 800)).toBe(-800);
  });
});

describe("wheelPage", () => {
  it("moves one Pulse on a single mouse notch", () => {
    expect(run([[0, 100]]).steps).toEqual([1]);
    expect(run([[0, -100]]).steps).toEqual([-1]);
  });

  it("adds small trackpad deltas up until they show intent", () => {
    const small = WHEEL_PAGE_PX / 3;
    expect(run([[0, small], [16, small], [32, small]]).steps).toEqual([0, 0, 1]);
  });

  it("swallows the rest of the gesture, momentum tail included", () => {
    const tail: [number, number][] = Array.from({ length: 60 }, (_, i) => [16 * (i + 1), 80]);
    const { steps } = run([[0, 120], ...tail]);
    expect(steps.filter((x) => x !== 0)).toEqual([1]);
  });

  it("moves again on a new gesture after a pause", () => {
    const gap = WHEEL_GESTURE_GAP_MS + 1;
    expect(run([[0, 100], [16, 100], [16 + gap, 100]]).steps).toEqual([1, 0, 1]);
  });

  it("does not move when the travel nets out below the threshold", () => {
    expect(run([[0, 20], [16, -15], [32, 20]]).steps).toEqual([0, 0, 0]);
  });

  it("starts the count over after a pause, so leftovers never add up", () => {
    const gap = WHEEL_GESTURE_GAP_MS + 1;
    expect(run([[0, 20], [gap, 20]]).steps).toEqual([0, 0]);
  });
});

describe("clampSlide", () => {
  it("keeps the index on a real slide", () => {
    expect(clampSlide(-1, 5)).toBe(0);
    expect(clampSlide(5, 5)).toBe(4);
    expect(clampSlide(2, 5)).toBe(2);
  });
});
