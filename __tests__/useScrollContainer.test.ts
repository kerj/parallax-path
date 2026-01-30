import { describe, it, expect } from "vitest";
import { resolveScrollTarget, getScrollState } from "../useScrollContainer";

describe("useScrollContainer utilities", () => {
  describe("resolveScrollTarget", () => {
    it("returns window when undefined", () => {
      expect(resolveScrollTarget(undefined)).toBe(window);
    });

    it("returns window when passed directly", () => {
      expect(resolveScrollTarget(window)).toBe(window);
    });

    it("returns HTMLElement when passed directly", () => {
      const div = document.createElement("div");
      expect(resolveScrollTarget(div)).toBe(div);
    });

    it("unwraps RefObject to element", () => {
      const div = document.createElement("div");
      const ref = { current: div };
      expect(resolveScrollTarget(ref)).toBe(div);
    });

    it("returns null for RefObject with null current", () => {
      const ref = { current: null };
      expect(resolveScrollTarget(ref)).toBe(null);
    });
  });

  describe("getScrollState", () => {
    it("returns zeros for null target", () => {
      const state = getScrollState(null);
      expect(state).toEqual({
        scrollTop: 0,
        scrollLeft: 0,
        scrollHeight: 0,
        clientHeight: 0,
        clientWidth: 0,
      });
    });

    it("returns window scroll state", () => {
      const state = getScrollState(window);
      expect(state).toHaveProperty("scrollTop");
      expect(state).toHaveProperty("scrollLeft");
      expect(state).toHaveProperty("scrollHeight");
      expect(state).toHaveProperty("clientHeight");
      expect(state).toHaveProperty("clientWidth");
    });

    it("returns element scroll state", () => {
      const div = document.createElement("div");
      Object.defineProperties(div, {
        scrollTop: { value: 100, writable: true },
        scrollLeft: { value: 50, writable: true },
        scrollHeight: { value: 1000, writable: true },
        clientHeight: { value: 500, writable: true },
        clientWidth: { value: 300, writable: true },
      });

      const state = getScrollState(div);
      expect(state).toEqual({
        scrollTop: 100,
        scrollLeft: 50,
        scrollHeight: 1000,
        clientHeight: 500,
        clientWidth: 300,
      });
    });
  });
});
