/**
 * Easing functions for smooth path progress curves
 */

export type EasingFunction = (t: number) => number;

export const easings = {
  /** Linear - no easing */
  linear: (t: number): number => t,

  /** Ease In Quad - accelerate from zero */
  easeInQuad: (t: number): number => t * t,

  /** Ease Out Quad - decelerate to zero */
  easeOutQuad: (t: number): number => t * (2 - t),

  /** Ease In Out Quad - accelerate until halfway, then decelerate */
  easeInOutQuad: (t: number): number =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  /** Ease In Cubic - accelerate from zero (stronger) */
  easeInCubic: (t: number): number => t * t * t,

  /** Ease Out Cubic - decelerate to zero (stronger) */
  easeOutCubic: (t: number): number => --t * t * t + 1,

  /** Ease In Out Cubic - accelerate/decelerate (stronger) */
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  /** Ease Out Expo - exponential deceleration */
  easeOutExpo: (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),

  /** Ease In Out Expo - exponential acceleration/deceleration */
  easeInOutExpo: (t: number): number =>
    t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? Math.pow(2, 20 * t - 10) / 2
          : (2 - Math.pow(2, -20 * t + 10)) / 2,

  /** Smooth step - classic smooth interpolation */
  smoothStep: (t: number): number => t * t * (3 - 2 * t),

  /** Smoother step - even smoother (Ken Perlin's) */
  smootherStep: (t: number): number => t * t * t * (t * (t * 6 - 15) + 10),
} as const;

export type EasingName = keyof typeof easings;

/**
 * Create a custom cubic bezier easing function
 */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): EasingFunction {
  // Newton-Raphson iteration for solving bezier
  const sampleCurveX = (t: number) =>
    ((1 - 3 * x2 + 3 * x1) * t + (3 * x2 - 6 * x1)) * t + 3 * x1 * t;
  const sampleCurveY = (t: number) =>
    ((1 - 3 * y2 + 3 * y1) * t + (3 * y2 - 6 * y1)) * t + 3 * y1 * t;
  const sampleCurveDerivativeX = (t: number) =>
    3 * (1 - 3 * x2 + 3 * x1) * t * t + 2 * (3 * x2 - 6 * x1) * t + 3 * x1;

  const solveCurveX = (x: number): number => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const xEst = sampleCurveX(t) - x;
      if (Math.abs(xEst) < 0.001) return t;
      const d = sampleCurveDerivativeX(t);
      if (Math.abs(d) < 0.000001) break;
      t -= xEst / d;
    }
    return t;
  };

  return (x: number) => sampleCurveY(solveCurveX(x));
}

/**
 * Apply easing to a progress value
 */
export function applyEasing(
  progress: number,
  easing: EasingName | EasingFunction,
): number {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const easingFn = typeof easing === "function" ? easing : easings[easing];
  return easingFn(clampedProgress);
}
