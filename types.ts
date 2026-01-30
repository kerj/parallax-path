import { ScrollContainerRef } from "./useScrollContainer";

// Motion path can be an SVG path string, DOM element, or function
export type MotionPathFunction = (t: number) => { x: number; y: number };

export type MotionPathSource =
  | string // SVG path data: "M 0 0 C 200 100 400 100 600 0"
  | SVGPathElement // DOM path element
  | MotionPathFunction; // Custom function (t: number) => { x: number; y: number }

export type ParallaxDirection = "x" | "y" | { x: number; y: number };

export interface ParallaxConfig {
  /** Speed multiplier. 1 = normal scroll, 0.5 = half speed, 2 = double speed, negative = reverse */
  speed?: number;
  /** Direction of parallax movement */
  direction?: ParallaxDirection;
  /** Optional motion path for non-linear movement */
  motionPath?: MotionPathSource;
  /** Offset along the motion path (0-1) */
  pathOffset?: number;
  /** Custom easing function for path progress */
  pathEase?: (t: number) => number;
  /** Auto-rotate element to follow path tangent */
  autoRotate?: boolean;
  /** Offset in pixels to adjust when effect starts */
  scrollOffset?: number;
}

export interface ParallaxContextValue {
  scrollY: number;
  scrollX: number;
  viewportHeight: number;
  viewportWidth: number;
  scrollContainerRef: ScrollContainerRef | undefined;
  registerLayer: (
    id: string,
    element: HTMLElement,
    config: ParallaxConfig,
  ) => void;
  unregisterLayer: (id: string) => void;
}

export interface ParallaxLayerProps extends ParallaxConfig {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Unique identifier for the layer */
  id?: string;
}
