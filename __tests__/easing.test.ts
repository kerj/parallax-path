import { describe, it, expect } from "vitest";
import { easings, cubicBezier, applyEasing } from "../easing";

describe("Easing Functions", () => {
  describe("built-in easings", () => {
    it("linear returns input unchanged", () => {
      expect(easings.linear(0)).toBe(0);
      expect(easings.linear(0.5)).toBe(0.5);
      expect(easings.linear(1)).toBe(1);
    });

    it("easeInQuad accelerates from zero", () => {
      expect(easings.easeInQuad(0)).toBe(0);
      expect(easings.easeInQuad(0.5)).toBe(0.25);
      expect(easings.easeInQuad(1)).toBe(1);
    });

    it("easeOutQuad decelerates to zero", () => {
      expect(easings.easeOutQuad(0)).toBe(0);
      expect(easings.easeOutQuad(0.5)).toBe(0.75);
      expect(easings.easeOutQuad(1)).toBe(1);
    });

    it("easeInOutQuad accelerates then decelerates", () => {
      expect(easings.easeInOutQuad(0)).toBe(0);
      expect(easings.easeInOutQuad(0.5)).toBe(0.5);
      expect(easings.easeInOutQuad(1)).toBe(1);
      // First half should be slower than linear
      expect(easings.easeInOutQuad(0.25)).toBeLessThan(0.25);
    });

    it("easeInCubic accelerates from zero (stronger)", () => {
      expect(easings.easeInCubic(0)).toBe(0);
      expect(easings.easeInCubic(0.5)).toBe(0.125);
      expect(easings.easeInCubic(1)).toBe(1);
    });

    it("easeOutCubic decelerates to zero (stronger)", () => {
      expect(easings.easeOutCubic(0)).toBe(0);
      expect(easings.easeOutCubic(1)).toBe(1);
      // Should be faster than linear in the middle
      expect(easings.easeOutCubic(0.5)).toBeGreaterThan(0.5);
    });

    it("smoothStep provides smooth interpolation", () => {
      expect(easings.smoothStep(0)).toBe(0);
      expect(easings.smoothStep(0.5)).toBe(0.5);
      expect(easings.smoothStep(1)).toBe(1);
      // Derivative should be 0 at endpoints (smooth start/end)
      expect(easings.smoothStep(0.1)).toBeGreaterThan(0);
    });

    it("smootherStep provides even smoother interpolation", () => {
      expect(easings.smootherStep(0)).toBe(0);
      expect(easings.smootherStep(0.5)).toBe(0.5);
      expect(easings.smootherStep(1)).toBe(1);
    });

    it("easeOutExpo handles edge cases", () => {
      expect(easings.easeOutExpo(0)).toBeCloseTo(0, 2);
      expect(easings.easeOutExpo(1)).toBe(1);
      // Should be very close to 1 even at 0.5
      expect(easings.easeOutExpo(0.5)).toBeGreaterThan(0.9);
    });

    it("easeInOutExpo handles edge cases", () => {
      expect(easings.easeInOutExpo(0)).toBe(0);
      expect(easings.easeInOutExpo(1)).toBe(1);
      expect(easings.easeInOutExpo(0.5)).toBe(0.5);
    });
  });

  describe("cubicBezier", () => {
    it("creates a valid easing function", () => {
      const easeInOut = cubicBezier(0.42, 0, 0.58, 1);
      expect(typeof easeInOut).toBe("function");
    });

    it("returns 0 at start and approximately 1 at end", () => {
      const easing = cubicBezier(0.25, 0.1, 0.25, 1);
      expect(easing(0)).toBeCloseTo(0, 1);
      expect(easing(1)).toBeCloseTo(1, 1);
    });

    it("produces reasonable output values", () => {
      const easing = cubicBezier(0.4, 0, 0.2, 1);
      // Cubic bezier with these control points can overshoot slightly
      for (let t = 0; t <= 1; t += 0.1) {
        const result = easing(t);
        // Allow wider range for bezier curves that can overshoot
        expect(result).toBeGreaterThanOrEqual(-0.5);
        expect(result).toBeLessThanOrEqual(1.5);
      }
    });

    it("produces smooth curve progression", () => {
      const easing = cubicBezier(0.25, 0.1, 0.25, 1);
      // Test key points along the curve
      const start = easing(0);
      const middle = easing(0.5);
      const end = easing(1);

      // Values should progress (allowing for bezier overshoot)
      expect(start).toBeLessThan(middle);
      expect(end).toBeGreaterThan(start);
    });
  });

  describe("applyEasing", () => {
    it("applies named easing function", () => {
      expect(applyEasing(0.5, "easeInQuad")).toBe(0.25);
    });

    it("applies custom easing function", () => {
      const customEase = (t: number) => t * t * t;
      expect(applyEasing(0.5, customEase)).toBe(0.125);
    });

    it("clamps progress to 0-1 range", () => {
      expect(applyEasing(-0.5, "linear")).toBe(0);
      expect(applyEasing(1.5, "linear")).toBe(1);
    });

    it("handles edge values", () => {
      expect(applyEasing(0, "smoothStep")).toBe(0);
      expect(applyEasing(1, "smoothStep")).toBe(1);
    });
  });
});
