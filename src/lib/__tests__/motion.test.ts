import { describe, it, expect } from "vitest";
import {
  parallaxTravel, parallaxProgress, parallaxOffset, isOverDarkSection, isInsideDarkZone, NAV_SWAP_LINE,
  rangeProgress, drawProgress, dashOffset, revealProgress, wordOpacity, imageParallaxY, fadeThrough, toggleState, smoothToward,
  springStep, springSettled, snapFrame, CURSOR_SPRINGS, type SpringConfig, dropStretch, blobRadii, blobPath,
  pointerOffset, revealStagger, WHEEL, wheelRotation, wheelCenterProgress, cardTilt,
} from "../motion";

describe("wheelRotation (services wheel)", () => {
  const vh = 900, track = (WHEEL.trackVh / 100) * vh, n = 4; // the real track: 220vh
  it("starts the pin with the first card peeking in at the right", () => {
    expect(wheelRotation(0, track, vh, n)).toBeCloseTo(WHEEL.enter);
    expect(WHEEL.enter).toBeGreaterThan(WHEEL.step); // only the first card is on stage
  });
  it("ends the pin with the last card just left of centre", () => {
    const w = wheelRotation(-(track - vh), track, vh, n);
    expect(w + (n - 1) * WHEEL.step).toBeCloseTo(-WHEEL.exit);
  });
  it("turns at a constant rate before, during and after the pin", () => {
    const a = wheelRotation(450, track, vh, n), b = wheelRotation(0, track, vh, n), c = wheelRotation(-450, track, vh, n);
    expect(a - b).toBeCloseTo(b - c);
    expect(a).toBeGreaterThan(b); // scrolling down turns the wheel left (angles fall)
  });
  it("is linear in scroll: ~6°/100px at a 900px viewport", () => {
    const perPx = wheelRotation(0, track, vh, n) - wheelRotation(-1, track, vh, n);
    expect(perPx * 100).toBeGreaterThan(5);
    expect(perPx * 100).toBeLessThan(7);
  });
  it("survives a degenerate track", () => {
    expect(Number.isFinite(wheelRotation(-100, vh, vh, n))).toBe(true);
  });
});

describe("wheelCenterProgress", () => {
  it("is the pinned progress where card i sits upright at the top", () => {
    const vh = 900, track = (WHEEL.trackVh / 100) * vh, n = 4;
    for (let i = 0; i < n; i++) {
      const q = wheelCenterProgress(i, n);
      const w = wheelRotation(-q * (track - vh), track, vh, n);
      expect(w + i * WHEEL.step).toBeCloseTo(0);
      expect(q).toBeGreaterThan(0);
      expect(q).toBeLessThan(1);
    }
  });
});

describe("cardTilt", () => {
  const card = { cx: 500, cy: 400, w: 360, h: 480 };
  const tilt = (x: number, y: number, angle = 0) => cardTilt(x, y, card.cx, card.cy, card.w, card.h, angle, 20);
  it("is flat with the pointer at the centre", () => {
    const t = tilt(500, 400);
    expect(t.x).toBeCloseTo(0);
    expect(t.y).toBeCloseTo(0);
  });
  it("brings the corner under the pointer toward the viewer", () => {
    const br = tilt(500 + 180, 400 + 240); // bottom-right edge
    expect(br.x).toBeCloseTo(20); // rotateX > 0: bottom edge comes forward
    expect(br.y).toBeCloseTo(-20); // rotateY < 0: right edge comes forward
    const tl = tilt(500 - 90, 400 - 120); // halfway to the top-left corner
    expect(tl.x).toBeCloseTo(-10);
    expect(tl.y).toBeCloseTo(10);
  });
  it("clamps outside the card", () => {
    const t = tilt(5000, -5000);
    expect(t.x).toBeCloseTo(-20);
    expect(t.y).toBeCloseTo(-20);
  });
  it("measures the pointer in the card's own (rotated) frame", () => {
    // card turned 90° clockwise: its top edge now faces the screen's right
    const t = tilt(500 + 240, 400, 90);
    expect(t.x).toBeCloseTo(-20); // top edge comes forward
    expect(t.y).toBeCloseTo(0);
    // and a small wheel angle barely changes the answer
    const s = tilt(500 + 180, 400, 8);
    expect(s.y).toBeLessThan(-19);
  });
});

describe("parallaxTravel", () => {
  it("is 320 on desktop, 160 on tablet, 0 on phones", () => {
    expect(parallaxTravel(1440)).toBe(320);
    expect(parallaxTravel(1200)).toBe(320);
    expect(parallaxTravel(1199)).toBe(160);
    expect(parallaxTravel(810)).toBe(160);
    expect(parallaxTravel(809)).toBe(0);
    expect(parallaxTravel(390)).toBe(0);
  });
});

describe("parallaxProgress", () => {
  const vh = 900, h = 1300;
  it("is 0 while the layer top is at or below the viewport bottom", () => {
    expect(parallaxProgress(vh, h, vh)).toBe(0);
    expect(parallaxProgress(vh + 500, h, vh)).toBe(0);
  });
  it("is 1 once the layer bottom reaches the viewport bottom", () => {
    expect(parallaxProgress(vh - h, h, vh)).toBe(1);
    expect(parallaxProgress(vh - h - 200, h, vh)).toBe(1);
  });
  it("is linear in between", () => {
    expect(parallaxProgress(vh - h / 2, h, vh)).toBeCloseTo(0.5);
    expect(parallaxProgress(vh - h / 4, h, vh)).toBeCloseTo(0.25);
  });
  it("is 0 for an empty layer instead of dividing by zero", () => {
    expect(parallaxProgress(100, 0, vh)).toBe(0);
    expect(parallaxProgress(100, NaN, vh)).toBe(0);
  });
});

describe("parallaxOffset", () => {
  it("scales progress by the travel distance", () => {
    expect(parallaxOffset(900 - 650, 1300, 900, 320)).toBe(160);
    expect(parallaxOffset(-400, 1300, 900, 320)).toBe(320);
    expect(parallaxOffset(2000, 1300, 900, 320)).toBe(0);
  });
  it("never moves on phones (travel 0)", () => {
    expect(parallaxOffset(0, 1300, 900, 0)).toBe(0);
  });
});

describe("isOverDarkSection", () => {
  it("switches once the section top reaches the nav line", () => {
    expect(isOverDarkSection(NAV_SWAP_LINE + 1)).toBe(false);
    expect(isOverDarkSection(NAV_SWAP_LINE)).toBe(true);
    expect(isOverDarkSection(-300)).toBe(true);
  });
});

describe("isInsideDarkZone", () => {
  it("is true only while the zone spans the nav line", () => {
    expect(isInsideDarkZone(0, 900)).toBe(true);
    expect(isInsideDarkZone(-500, NAV_SWAP_LINE + 1)).toBe(true);
    expect(isInsideDarkZone(-500, NAV_SWAP_LINE)).toBe(false);
    expect(isInsideDarkZone(NAV_SWAP_LINE + 1, 900)).toBe(false);
  });
});

describe("rangeProgress", () => {
  it("maps linearly and clamps, in either direction", () => {
    expect(rangeProgress(5, 0, 10)).toBe(0.5);
    expect(rangeProgress(-5, 0, 10)).toBe(0);
    expect(rangeProgress(50, 0, 10)).toBe(1);
    expect(rangeProgress(900, 900, 0)).toBe(0);
    expect(rangeProgress(225, 900, 0)).toBe(0.75);
  });
  it("treats an empty range as a step", () => {
    expect(rangeProgress(3, 4, 4)).toBe(0);
    expect(rangeProgress(4, 4, 4)).toBe(1);
  });
});

describe("drawProgress (top 50% → bottom 50%)", () => {
  const vh = 900, h = 1140;
  it("is already part-drawn when the element starts above mid-screen (hero at load)", () => {
    // reference measurement: a 1140px thread at the very top is ~40% drawn on load
    expect(drawProgress(0, h, vh)).toBeCloseTo(450 / 1140, 5);
  });
  it("is 0 until the top reaches mid-screen and 1 once the bottom does", () => {
    expect(drawProgress(450, h, vh)).toBe(0);
    expect(drawProgress(800, h, vh)).toBe(0);
    expect(drawProgress(450 - h, h, vh)).toBe(1);
  });
  it("supports other start/end lines", () => {
    expect(drawProgress(900, 1000, vh, 1, 0)).toBe(0);
    expect(drawProgress(-1000, 1000, vh, 1, 0)).toBe(1);
  });
});

describe("dashOffset", () => {
  it("hides the path at 0 and shows it fully at 1", () => {
    expect(dashOffset(1000, 0)).toBe(1000);
    expect(dashOffset(1000, 0.25)).toBe(750);
    expect(dashOffset(1000, 1)).toBe(0);
    expect(dashOffset(1000, 2)).toBe(0);
  });
});

describe("revealProgress + wordOpacity", () => {
  it("runs from the viewport bottom to 25% from the top", () => {
    expect(revealProgress(900, 900)).toBe(0);
    expect(revealProgress(225, 900)).toBe(1);
    expect(revealProgress(562.5, 900)).toBeCloseTo(0.5);
  });
  it("lights words one slice at a time between min and max opacity", () => {
    expect(wordOpacity(0, 0, 4)).toBeCloseTo(0.2);
    expect(wordOpacity(0.125, 0, 4)).toBeCloseTo(0.6);
    expect(wordOpacity(0.25, 0, 4)).toBeCloseTo(1);
    expect(wordOpacity(0.25, 1, 4)).toBeCloseTo(0.2);
    expect(wordOpacity(1, 3, 4)).toBeCloseTo(1);
    expect(wordOpacity(0.5, 0, 0)).toBe(1);
  });
});

describe("imageParallaxY", () => {
  const vh = 900, h = 560;
  it("slides from -intensity (entering) to 0 (leaving)", () => {
    expect(imageParallaxY(vh, h, vh, 200)).toBe(-200);
    expect(imageParallaxY(-h, h, vh, 200)).toBe(0);
    expect(imageParallaxY((vh - h) / 2, h, vh, 200)).toBe(-100);
  });
});

describe("fadeThrough", () => {
  const vh = 900;
  it("fades in as the enter edge rises and out as the exit edge does", () => {
    expect(fadeThrough(900, 5000, vh)).toBe(0);
    expect(fadeThrough(450, 5000, vh)).toBe(0.5);
    expect(fadeThrough(-100, 5000, vh)).toBe(1);
    expect(fadeThrough(-3000, 450, vh)).toBe(0.5);
    expect(fadeThrough(-3000, -10, vh)).toBe(0);
  });
});

describe("toggleState", () => {
  const vh = 900;
  it("goes start → off → on as the markers cross mid-screen", () => {
    expect(toggleState(600, 1300, vh)).toBe("start");
    expect(toggleState(450, 1150, vh)).toBe("off");
    expect(toggleState(-250, 450, vh)).toBe("on");
    expect(toggleState(-2000, -1300, vh)).toBe("on");
  });
});

describe("smoothToward", () => {
  it("approaches the target without overshooting and is frame-rate independent", () => {
    const a = smoothToward(0, 1, 16, 150);
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThan(1);
    let two = smoothToward(0, 1, 8, 150);
    two = smoothToward(two, 1, 8, 150);
    expect(two).toBeCloseTo(a, 10);
    expect(smoothToward(0.4, 1, 10000, 150)).toBeCloseTo(1, 6);
    expect(smoothToward(0.4, 1, 16, 0)).toBe(1);
  });
});

describe("springStep", () => {
  // Step response sampled at 60fps; returns every frame's value.
  const run = (cfg: SpringConfig, ms: number, frame = 16) => {
    let s = { value: 0, velocity: 0 };
    const out: number[] = [];
    for (let t = 0; t < ms; t += frame) { s = springStep(s, 1, frame, cfg); out.push(s.value); }
    return out;
  };

  it("follow spring (220/26/0.6) glides in without overshoot — ~92% after 256ms", () => {
    const out = run(CURSOR_SPRINGS.follow, 640);
    expect(out[15]).toBeGreaterThan(0.9);   // analytic: 0.918
    expect(out[15]).toBeLessThan(0.94);
    expect(Math.max(...out)).toBeLessThanOrEqual(1);
    expect(out[out.length - 1]).toBeGreaterThan(0.995);
  });

  it("shape spring (380/26) overshoots ~6% near 216ms, then settles", () => {
    const out = run(CURSOR_SPRINGS.shape, 1200);
    const peak = Math.max(...out);
    expect(peak).toBeGreaterThan(1.05);       // analytic: 1.060
    expect(peak).toBeLessThan(1.07);
    const peakMs = (out.indexOf(peak) + 1) * 16;
    expect(peakMs).toBeGreaterThanOrEqual(192);
    expect(peakMs).toBeLessThanOrEqual(240);
    expect(out[out.length - 1]).toBeCloseTo(1, 2);
  });

  it("is stable for long frames and a no-op for dt 0", () => {
    const s = springStep({ value: 0, velocity: 0 }, 1, 10_000, CURSOR_SPRINGS.shape);
    expect(Number.isFinite(s.value)).toBe(true);
    expect(s.value).toBeGreaterThan(0);
    expect(s.value).toBeLessThan(1.2);
    expect(springStep({ value: 3, velocity: 2 }, 9, 0, CURSOR_SPRINGS.follow)).toEqual({ value: 3, velocity: 2 });
  });
});

describe("springSettled", () => {
  it("needs both position and speed within the rest delta", () => {
    expect(springSettled({ value: 1, velocity: 0 }, 1, 0.01)).toBe(true);
    expect(springSettled({ value: 0.995, velocity: 0.05 }, 1, 0.01)).toBe(true);
    expect(springSettled({ value: 0.9, velocity: 0 }, 1, 0.01)).toBe(false);
    expect(springSettled({ value: 1, velocity: 5 }, 1, 0.01)).toBe(false);
  });
});

describe("snapFrame", () => {
  it("wraps the element 5px out on every side, centered on it", () => {
    // reference measurement: a 43.875×14 nav label → 53.875×24 frame, radius 5
    const f = snapFrame({ left: 384, top: 58, width: 43.875, height: 14 }, 0);
    expect(f.x).toBeCloseTo(405.94, 2);
    expect(f.y).toBe(65);
    expect(f.w).toBeCloseTo(53.875, 3);
    expect(f.h).toBe(24);
    expect(f.r).toBe(5);
  });

  it("keeps rounded corners concentric and caps pills at half the height", () => {
    expect(snapFrame({ left: 0, top: 0, width: 600, height: 80 }, 16).r).toBe(21);
    expect(snapFrame({ left: 0, top: 0, width: 180, height: 40 }, 999).r).toBe(25);
  });
});

describe("dropStretch", () => {
  it("is 0 at rest and grows with speed, easing toward a 0.35 cap", () => {
    expect(dropStretch(0)).toBe(0);
    expect(dropStretch(-50)).toBe(0);
    const a = dropStretch(500), b = dropStretch(1500), c = dropStretch(5000);
    expect(a).toBeGreaterThan(0.05);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
    expect(c).toBeLessThan(0.35);
    expect(dropStretch(1e9)).toBeLessThanOrEqual(0.35);
  });
});

describe("CURSOR_SPRINGS.wobble", () => {
  it("lets the drop jiggle once it stops (clear overshoot past rest)", () => {
    let s = { value: 0.25, velocity: 0 };
    let min = Infinity;
    for (let t = 0; t < 800; t += 16) { s = springStep(s, 0, 16, CURSOR_SPRINGS.wobble); min = Math.min(min, s.value); }
    expect(min).toBeLessThan(-0.02);
    expect(Math.abs(s.value)).toBeLessThan(0.01);
  });
});

describe("blobRadii", () => {
  it("gives one radius factor per point, within 1 ± amp, and a circle at amp 0", () => {
    for (const t of [0, 0.7, 3.1, 42]) {
      const k = blobRadii(t, 0.2, 7);
      expect(k).toHaveLength(7);
      k.forEach((m) => { expect(m).toBeGreaterThanOrEqual(0.8 - 1e-9); expect(m).toBeLessThanOrEqual(1.2 + 1e-9); });
    }
    expect(blobRadii(5, 0, 7).every((m) => m === 1)).toBe(true);
  });

  it("is irregular (points differ) and keeps changing over time", () => {
    const a = blobRadii(1, 0.2), b = blobRadii(1.5, 0.2);
    expect(Math.max(...a) - Math.min(...a)).toBeGreaterThan(0.05);
    expect(a.some((m, i) => Math.abs(m - b[i]) > 0.01)).toBe(true);
  });
});

describe("blobPath", () => {
  it("is a closed smooth path, deterministic for a given time", () => {
    const d = blobPath(2, 0.15);
    expect(d.startsWith("M")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    expect(d.match(/Q/g)).toHaveLength(7);
    expect(blobPath(2, 0.15)).toBe(d);
    expect(blobPath(2.4, 0.15)).not.toBe(d);
  });

  it("stays within radius × (1 + amp) of the center", () => {
    const nums = blobPath(7.3, 0.2, 20).match(/-?\d+(\.\d+)?/g)!.map(Number);
    for (let i = 0; i < nums.length; i += 2) expect(Math.hypot(nums[i], nums[i + 1])).toBeLessThanOrEqual(20 * 1.2 + 0.01);
  });
});

describe("pointerOffset", () => {
  it("maps the pointer to -1..1 from the viewport center, clamped", () => {
    expect(pointerOffset(720, 450, 1440, 900)).toEqual({ x: 0, y: 0 });
    expect(pointerOffset(0, 0, 1440, 900)).toEqual({ x: -1, y: -1 });
    expect(pointerOffset(1440, 900, 1440, 900)).toEqual({ x: 1, y: 1 });
    expect(pointerOffset(1080, 225, 1440, 900)).toEqual({ x: 0.5, y: -0.5 });
    expect(pointerOffset(-50, 2000, 1440, 900)).toEqual({ x: -1, y: 1 });
    expect(pointerOffset(10, 10, 0, 0)).toEqual({ x: 0, y: 0 });
  });
});

describe("revealStagger", () => {
  it("staggers elements entering together, capped so long lists never lag", () => {
    expect(revealStagger(0)).toBe(0);
    expect(revealStagger(1)).toBeCloseTo(0.07, 5);
    expect(revealStagger(3)).toBeCloseTo(0.21, 5);
    expect(revealStagger(50)).toBeCloseTo(revealStagger(7), 5);
    expect(revealStagger(50)).toBeLessThanOrEqual(0.5);
  });
});
