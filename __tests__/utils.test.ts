import { describe, it, expect } from "vitest";
import { normalizeDirection, clamp, linearEase, generateId } from "../utils";

describe("Utility Functions", () => {
  describe("normalizeDirection", () => {
    it('returns vertical vector for "y"', () => {
      expect(normalizeDirection("y")).toEqual({ x: 0, y: 1 });
    });

    it('returns horizontal vector for "x"', () => {
      expect(normalizeDirection("x")).toEqual({ x: 1, y: 0 });
    });

    it("returns object direction as-is", () => {
      const custom = { x: 0.5, y: 0.5 };
      expect(normalizeDirection(custom)).toEqual(custom);
    });

    it("defaults to vertical when undefined", () => {
      expect(normalizeDirection()).toEqual({ x: 0, y: 1 });
    });
  });

  describe("clamp", () => {
    it("clamps value below minimum", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("clamps value above maximum", () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("returns value within range unchanged", () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it("handles edge values", () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it("works with negative ranges", () => {
      expect(clamp(-15, -10, -5)).toBe(-10);
      expect(clamp(-3, -10, -5)).toBe(-5);
    });

    it("works with decimal values", () => {
      expect(clamp(0.5, 0, 1)).toBe(0.5);
      expect(clamp(1.5, 0, 1)).toBe(1);
    });
  });

  describe("linearEase", () => {
    it("returns input unchanged", () => {
      expect(linearEase(0)).toBe(0);
      expect(linearEase(0.5)).toBe(0.5);
      expect(linearEase(1)).toBe(1);
    });

    it("handles values outside 0-1 range", () => {
      expect(linearEase(-0.5)).toBe(-0.5);
      expect(linearEase(1.5)).toBe(1.5);
    });
  });

  describe("generateId", () => {
    it("generates string starting with parallax-", () => {
      const id = generateId();
      expect(id).toMatch(/^parallax-[a-z0-9]+$/);
    });

    it("generates unique IDs", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });
  });
});
