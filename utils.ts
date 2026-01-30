import {
  MotionPathSource,
  MotionPathFunction,
  ParallaxDirection,
} from "./types";

/**
 * Parse an SVG path string into a callable function
 */
export function parseSVGPath(pathData: string): MotionPathFunction {
  // Create a temporary SVG path element to use browser's path parsing
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  svg.appendChild(path);
  document.body.appendChild(svg);

  const totalLength = path.getTotalLength();

  const fn: MotionPathFunction = (t: number) => {
    const clampedT = Math.max(0, Math.min(1, t));
    const point = path.getPointAtLength(clampedT * totalLength);
    return { x: point.x, y: point.y };
  };

  // Cleanup
  document.body.removeChild(svg);

  return fn;
}

/**
 * Get point on path from any MotionPathSource
 */
export function getPointOnPath(
  source: MotionPathSource,
  t: number,
): { x: number; y: number } {
  if (typeof source === "function") {
    return source(t);
  }

  if (typeof source === "string") {
    const fn = parseSVGPath(source);
    return fn(t);
  }

  // SVGPathElement
  const totalLength = source.getTotalLength();
  const clampedT = Math.max(0, Math.min(1, t));
  const point = source.getPointAtLength(clampedT * totalLength);
  return { x: point.x, y: point.y };
}

/**
 * Calculate tangent angle at a point on the path for autoRotate
 */
export function getPathTangent(
  source: MotionPathSource,
  t: number,
  delta: number = 0.001,
): number {
  const p1 = getPointOnPath(source, Math.max(0, t - delta));
  const p2 = getPointOnPath(source, Math.min(1, t + delta));
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
}

/**
 * Normalize direction to {x, y} vector
 */
export function normalizeDirection(direction: ParallaxDirection = "y"): {
  x: number;
  y: number;
} {
  if (typeof direction === "string") {
    return direction === "x" ? { x: 1, y: 0 } : { x: 0, y: 1 };
  }
  return direction;
}

/**
 * Linear easing (default)
 */
export const linearEase = (t: number): number => t;

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate element's visibility progress in viewport
 * Returns 0 when element enters viewport, 1 when it exits
 */
export function getElementProgress(
  element: HTMLElement,
  scrollY: number,
  viewportHeight: number,
  offset: number = 0,
): number {
  const rect = element.getBoundingClientRect();
  const elementTop = rect.top + scrollY - offset;
  const elementHeight = rect.height;

  // Calculate when element is in view
  const start = elementTop - viewportHeight;
  const end = elementTop + elementHeight;
  const range = end - start;

  if (range === 0) return 0;

  return clamp((scrollY - start) / range, 0, 1);
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `parallax-${Math.random().toString(36).substr(2, 9)}`;
}
