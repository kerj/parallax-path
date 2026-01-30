import { describe, it, expect } from "vitest";
import { DEFAULT_PATH_FOLLOWER_STATE } from "../pathFollowerTypes";

describe("pathFollowerTypes", () => {
  describe("DEFAULT_PATH_FOLLOWER_STATE", () => {
    it("has correct initial values", () => {
      expect(DEFAULT_PATH_FOLLOWER_STATE.scrollProgress).toBe(0);
      expect(DEFAULT_PATH_FOLLOWER_STATE.pathProgress).toBe(0);
      expect(DEFAULT_PATH_FOLLOWER_STATE.easedProgress).toBe(0);
      expect(DEFAULT_PATH_FOLLOWER_STATE.position).toEqual({ x: 0, y: 0 });
      expect(DEFAULT_PATH_FOLLOWER_STATE.screenPosition).toEqual({
        x: 0,
        y: 0,
      });
      expect(DEFAULT_PATH_FOLLOWER_STATE.angle).toBe(0);
      expect(DEFAULT_PATH_FOLLOWER_STATE.direction).toBe(1);
      expect(DEFAULT_PATH_FOLLOWER_STATE.velocity).toBe(0);
    });

    it("has viewport dimensions", () => {
      expect(DEFAULT_PATH_FOLLOWER_STATE.viewport).toHaveProperty("width");
      expect(DEFAULT_PATH_FOLLOWER_STATE.viewport).toHaveProperty("height");
    });

    it("is immutable reference", () => {
      const state1 = DEFAULT_PATH_FOLLOWER_STATE;
      const state2 = DEFAULT_PATH_FOLLOWER_STATE;
      expect(state1).toBe(state2);
    });
  });
});
