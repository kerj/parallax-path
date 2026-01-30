import { EasingName, EasingFunction } from "./easing";
import { PathSegment, SegmentEventCallback } from "./PathSegment";

export interface PathFollowerState {
  /** Raw scroll progress (0-1) */
  scrollProgress: number;
  /** Progress along the path (0-1) */
  pathProgress: number;
  /** Eased progress value (0-1) */
  easedProgress: number;
  /** Current position in SVG viewBox coordinates */
  position: { x: number; y: number };
  /** Current position in screen pixels (via CTM) */
  screenPosition: { x: number; y: number };
  /** Tangent angle in degrees */
  angle: number;
  /** Current viewport dimensions */
  viewport: { width: number; height: number };
  /** Scroll direction: 1 = down, -1 = up */
  direction: 1 | -1;
  /** Current scroll velocity */
  velocity: number;
}

export type PathFollowerSubscriber = (state: PathFollowerState) => void;

export interface PathFollowerContextValue {
  subscribe: (callback: PathFollowerSubscriber) => () => void;
  getState: () => PathFollowerState;
  registerPath: (
    pathElement: SVGPathElement,
    svgElement: SVGSVGElement,
    viewBoxHeight: number,
  ) => void;
  unregisterPath: () => void;
  addSegment: (segment: PathSegment) => void;
  removeSegment: (id: string) => void;
  subscribeToSegment: (
    segmentId: string,
    callback: SegmentEventCallback,
  ) => () => void;
  isSegmentActive: (segmentId: string) => boolean;
  getActiveSegments: () => PathSegment[];
}

export interface PathFollowerProviderProps {
  children: React.ReactNode;
  /** Easing function for path progress */
  easing?: EasingName | EasingFunction;
  /** Smoothing factor (0-1, lower = more smoothing) */
  smoothing?: number;
  /** Enable smooth interpolation */
  smooth?: boolean;
  /** Initial path segments */
  segments?: PathSegment[];
  /** Custom scroll container (defaults to window) */
  scrollContainer?: Window | HTMLElement | React.RefObject<HTMLElement | null>;
}

export const DEFAULT_PATH_FOLLOWER_STATE: PathFollowerState = {
  scrollProgress: 0,
  pathProgress: 0,
  easedProgress: 0,
  position: { x: 0, y: 0 },
  screenPosition: { x: 0, y: 0 },
  angle: 0,
  viewport: {
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  },
  direction: 1,
  velocity: 0,
};
