// Core parallax components
export {
  ParallaxProvider,
  useParallax,
  ParallaxContext,
} from "./ParallaxContext";
export { ParallaxLayer } from "./ParallaxLayer";

// Path follower system for full-screen path animations
export {
  PathFollowerProvider,
  usePathFollower,
  usePathFollowerRef,
} from "./PathFollowerContext";
export { ScrollingPath } from "./ScrollingPath";
export { FixedFollower } from "./FixedFollower";

// Scroll container utilities
export {
  resolveScrollTarget,
  getScrollState,
  useScrollContainer,
} from "./useScrollContainer";
export type { ScrollContainerRef, ScrollState } from "./useScrollContainer";

// Path follower types
export type {
  PathFollowerState,
  PathFollowerSubscriber,
  PathFollowerContextValue,
  PathFollowerProviderProps,
} from "./pathFollowerTypes";
export { DEFAULT_PATH_FOLLOWER_STATE } from "./pathFollowerTypes";

// Easing utilities
export { easings, cubicBezier, applyEasing } from "./easing";
export type { EasingName, EasingFunction } from "./easing";

// Path segment utilities
export { SegmentTracker, createSegmentPresets } from "./PathSegment";
export type {
  PathSegment,
  SegmentEvent,
  SegmentEventType,
  SegmentEventCallback,
} from "./PathSegment";

// Type exports
export type {
  ParallaxConfig,
  ParallaxDirection,
  ParallaxLayerProps,
  ParallaxContextValue,
  MotionPathSource,
  MotionPathFunction,
} from "./types";

// Utility exports
export {
  normalizeDirection,
  getPointOnPath,
  getPathTangent,
  getElementProgress,
  linearEase,
  clamp,
  parseSVGPath,
} from "./utils";
