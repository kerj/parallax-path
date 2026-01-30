/**
 * Path segment definitions and event system
 */

export interface PathSegment {
  /** Unique identifier for this segment */
  id: string;
  /** Start progress (0-1) */
  start: number;
  /** End progress (0-1) */
  end: number;
  /** Optional label for debugging */
  label?: string;
  /** Custom data to pass to callbacks */
  data?: Record<string, unknown>;
}

export type SegmentEventType = "enter" | "exit" | "progress";

export interface SegmentEvent {
  type: SegmentEventType;
  segment: PathSegment;
  /** Current progress within this segment (0-1) */
  segmentProgress: number;
  /** Overall path progress (0-1) */
  pathProgress: number;
  /** Direction of travel: 1 for forward, -1 for backward */
  direction: 1 | -1;
}

export type SegmentEventCallback = (event: SegmentEvent) => void;

/**
 * Manages path segment tracking and event emission
 */
export class SegmentTracker {
  private segments: PathSegment[] = [];
  private activeSegments: Set<string> = new Set();
  private callbacks: Map<string, SegmentEventCallback[]> = new Map();
  private lastProgress: number = 0;

  constructor(segments: PathSegment[] = []) {
    this.segments = segments;
  }

  /**
   * Add a new segment to track
   */
  addSegment(segment: PathSegment): void {
    this.segments.push(segment);
    this.callbacks.set(segment.id, []);
  }

  /**
   * Remove a segment
   */
  removeSegment(id: string): void {
    this.segments = this.segments.filter((s) => s.id !== id);
    this.callbacks.delete(id);
    this.activeSegments.delete(id);
  }

  /**
   * Subscribe to events for a specific segment
   */
  subscribe(segmentId: string, callback: SegmentEventCallback): () => void {
    const callbacks = this.callbacks.get(segmentId) || [];
    callbacks.push(callback);
    this.callbacks.set(segmentId, callbacks);

    // Return unsubscribe function
    return () => {
      const cbs = this.callbacks.get(segmentId) || [];
      this.callbacks.set(
        segmentId,
        cbs.filter((cb) => cb !== callback),
      );
    };
  }

  /**
   * Subscribe to all segment events
   */
  subscribeAll(callback: SegmentEventCallback): () => void {
    const unsubscribes: (() => void)[] = [];
    for (const segment of this.segments) {
      unsubscribes.push(this.subscribe(segment.id, callback));
    }
    return () => unsubscribes.forEach((unsub) => unsub());
  }

  /**
   * Update with new progress and emit events
   */
  update(progress: number): void {
    const direction: 1 | -1 = progress >= this.lastProgress ? 1 : -1;

    for (const segment of this.segments) {
      const wasActive = this.activeSegments.has(segment.id);
      const isActive = progress >= segment.start && progress <= segment.end;

      if (isActive && !wasActive) {
        // Entered segment
        this.activeSegments.add(segment.id);
        this.emit(segment.id, {
          type: "enter",
          segment,
          segmentProgress: this.calcSegmentProgress(progress, segment),
          pathProgress: progress,
          direction,
        });
      } else if (!isActive && wasActive) {
        // Exited segment
        this.activeSegments.delete(segment.id);
        this.emit(segment.id, {
          type: "exit",
          segment,
          segmentProgress: direction === 1 ? 1 : 0,
          pathProgress: progress,
          direction,
        });
      } else if (isActive) {
        // Progress within segment
        this.emit(segment.id, {
          type: "progress",
          segment,
          segmentProgress: this.calcSegmentProgress(progress, segment),
          pathProgress: progress,
          direction,
        });
      }
    }

    this.lastProgress = progress;
  }

  /**
   * Get all currently active segments
   */
  getActiveSegments(): PathSegment[] {
    return this.segments.filter((s) => this.activeSegments.has(s.id));
  }

  /**
   * Check if a specific segment is active
   */
  isActive(segmentId: string): boolean {
    return this.activeSegments.has(segmentId);
  }

  private calcSegmentProgress(progress: number, segment: PathSegment): number {
    const range = segment.end - segment.start;
    if (range === 0) return 0;
    return Math.max(0, Math.min(1, (progress - segment.start) / range));
  }

  private emit(segmentId: string, event: SegmentEvent): void {
    const callbacks = this.callbacks.get(segmentId) || [];
    callbacks.forEach((cb) => cb(event));
  }
}

/**
 * Create common segment presets
 */
export const createSegmentPresets = {
  /** Divide path into equal segments */
  equal: (count: number, prefix = "segment"): PathSegment[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `${prefix}-${i}`,
      start: i / count,
      end: (i + 1) / count,
      label: `${prefix} ${i + 1}`,
    })),

  /** Create segments at specific progress points */
  waypoints: (points: number[], prefix = "waypoint"): PathSegment[] =>
    points.map((point, i) => ({
      id: `${prefix}-${i}`,
      start: Math.max(0, point - 0.05),
      end: Math.min(1, point + 0.05),
      label: `${prefix} ${i + 1}`,
    })),
};
