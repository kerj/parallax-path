import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  SegmentTracker,
  createSegmentPresets,
  PathSegment,
  SegmentEvent,
} from "../PathSegment";

describe("SegmentTracker", () => {
  let tracker: SegmentTracker;
  const testSegments: PathSegment[] = [
    { id: "intro", start: 0, end: 0.3, label: "Introduction" },
    { id: "main", start: 0.3, end: 0.7, label: "Main Content" },
    { id: "outro", start: 0.7, end: 1, label: "Outro" },
  ];

  beforeEach(() => {
    tracker = new SegmentTracker(testSegments);
  });

  describe("initialization", () => {
    it("creates tracker with segments", () => {
      expect(tracker.getActiveSegments()).toHaveLength(0);
    });

    it("creates empty tracker without segments", () => {
      const emptyTracker = new SegmentTracker();
      expect(emptyTracker.getActiveSegments()).toHaveLength(0);
    });
  });

  describe("segment management", () => {
    it("adds new segment", () => {
      tracker.addSegment({ id: "new", start: 0.5, end: 0.6 });
      tracker.update(0.55);
      expect(tracker.isActive("new")).toBe(true);
    });

    it("removes segment", () => {
      tracker.update(0.5);
      expect(tracker.isActive("main")).toBe(true);
      tracker.removeSegment("main");
      tracker.update(0.5);
      expect(tracker.isActive("main")).toBe(false);
    });
  });

  describe("update and events", () => {
    it("emits enter event when entering segment", () => {
      const callback = vi.fn();
      tracker.subscribe("intro", callback);

      tracker.update(0.1);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "enter",
          segment: expect.objectContaining({ id: "intro" }),
          direction: 1,
        }),
      );
    });

    it("emits exit event when leaving segment", () => {
      const callback = vi.fn();
      tracker.subscribe("intro", callback);

      tracker.update(0.1); // Enter
      callback.mockClear();
      tracker.update(0.4); // Exit

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "exit",
          segment: expect.objectContaining({ id: "intro" }),
        }),
      );
    });

    it("emits progress event while in segment", () => {
      const callback = vi.fn();
      tracker.subscribe("intro", callback);

      tracker.update(0.1);
      callback.mockClear();
      tracker.update(0.2);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "progress",
          segment: expect.objectContaining({ id: "intro" }),
        }),
      );
    });

    it("calculates correct segment progress", () => {
      const callback = vi.fn();
      tracker.subscribe("intro", callback);

      // Intro goes from 0 to 0.3, so 0.15 should be 50%
      tracker.update(0.15);

      const event = callback.mock.calls[0][0] as SegmentEvent;
      expect(event.segmentProgress).toBeCloseTo(0.5, 1);
    });

    it("detects scroll direction", () => {
      const callback = vi.fn();
      tracker.subscribe("main", callback);

      tracker.update(0.5);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ direction: 1 }),
      );

      callback.mockClear();
      tracker.update(0.4);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ direction: -1 }),
      );
    });
  });

  describe("subscription", () => {
    it("unsubscribes correctly", () => {
      const callback = vi.fn();
      const unsubscribe = tracker.subscribe("intro", callback);

      tracker.update(0.1);
      expect(callback).toHaveBeenCalled();

      callback.mockClear();
      unsubscribe();
      tracker.update(0.2);

      expect(callback).not.toHaveBeenCalled();
    });

    it("subscribeAll subscribes to all segments", () => {
      const callback = vi.fn();
      tracker.subscribeAll(callback);

      tracker.update(0.5);

      // Should receive events for intro exit and main enter
      expect(callback.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    it("subscribeAll unsubscribes all", () => {
      const callback = vi.fn();
      const unsubscribe = tracker.subscribeAll(callback);

      unsubscribe();
      tracker.update(0.5);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("isActive and getActiveSegments", () => {
    it("isActive returns correct status", () => {
      expect(tracker.isActive("intro")).toBe(false);
      tracker.update(0.1);
      expect(tracker.isActive("intro")).toBe(true);
      expect(tracker.isActive("main")).toBe(false);
    });

    it("getActiveSegments returns all active segments", () => {
      tracker.update(0.3); // At boundary of intro and main
      const active = tracker.getActiveSegments();
      expect(active.map((s) => s.id)).toContain("intro");
      expect(active.map((s) => s.id)).toContain("main");
    });

    it("handles overlapping segments", () => {
      const overlapping = new SegmentTracker([
        { id: "a", start: 0, end: 0.6 },
        { id: "b", start: 0.4, end: 1 },
      ]);

      overlapping.update(0.5);
      expect(overlapping.isActive("a")).toBe(true);
      expect(overlapping.isActive("b")).toBe(true);
    });
  });
});

describe("createSegmentPresets", () => {
  describe("equal", () => {
    it("creates equal segments", () => {
      const segments = createSegmentPresets.equal(4);

      expect(segments).toHaveLength(4);
      expect(segments[0]).toEqual({
        id: "segment-0",
        start: 0,
        end: 0.25,
        label: "segment 1",
      });
      expect(segments[3]).toEqual({
        id: "segment-3",
        start: 0.75,
        end: 1,
        label: "segment 4",
      });
    });

    it("uses custom prefix", () => {
      const segments = createSegmentPresets.equal(2, "section");
      expect(segments[0].id).toBe("section-0");
      expect(segments[0].label).toBe("section 1");
    });
  });

  describe("waypoints", () => {
    it("creates waypoint segments around points", () => {
      const segments = createSegmentPresets.waypoints([0.25, 0.5, 0.75]);

      expect(segments).toHaveLength(3);
      expect(segments[0].start).toBe(0.2);
      expect(segments[0].end).toBe(0.3);
    });

    it("clamps to valid range", () => {
      const segments = createSegmentPresets.waypoints([0, 1]);

      expect(segments[0].start).toBe(0);
      expect(segments[1].end).toBe(1);
    });

    it("uses custom prefix", () => {
      const segments = createSegmentPresets.waypoints([0.5], "marker");
      expect(segments[0].id).toBe("marker-0");
    });
  });
});
