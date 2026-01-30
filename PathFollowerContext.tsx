import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { applyEasing } from "./easing";
import { SegmentTracker } from "./PathSegment";
import { resolveScrollTarget, getScrollState } from "./useScrollContainer";
import {
  PathFollowerState,
  PathFollowerSubscriber,
  PathFollowerContextValue,
  PathFollowerProviderProps,
  DEFAULT_PATH_FOLLOWER_STATE,
} from "./pathFollowerTypes";

const PathFollowerContext = createContext<PathFollowerContextValue | null>(
  null,
);

/**
 * Hook that subscribes to path follower state changes.
 * Triggers re-renders when state changes.
 */
export function usePathFollower() {
  const context = useContext(PathFollowerContext);
  if (!context) {
    throw new Error(
      "usePathFollower must be used within a PathFollowerProvider",
    );
  }

  const [state, setState] = useState(context.getState());

  useEffect(() => {
    return context.subscribe((newState) => {
      setState(newState);
    });
  }, [context]);

  return {
    ...state,
    registerPath: context.registerPath,
    unregisterPath: context.unregisterPath,
    addSegment: context.addSegment,
    removeSegment: context.removeSegment,
    subscribeToSegment: context.subscribeToSegment,
    isSegmentActive: context.isSegmentActive,
    getActiveSegments: context.getActiveSegments,
  };
}

/**
 * Hook that returns the raw context value for ref-based subscriptions.
 * Use this for performance-critical animations to avoid React re-renders.
 */
export function usePathFollowerRef() {
  const context = useContext(PathFollowerContext);
  if (!context) {
    throw new Error(
      "usePathFollowerRef must be used within a PathFollowerProvider",
    );
  }
  return context;
}

/**
 * Provider that tracks scroll progress along an SVG path.
 */
export function PathFollowerProvider({
  children,
  easing = "linear",
  smoothing = 0.15,
  smooth = true,
  segments: initialSegments = [],
  scrollContainer,
}: PathFollowerProviderProps) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const smoothProgressRef = useRef(0);
  const lastProgressRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const subscribersRef = useRef<Set<PathFollowerSubscriber>>(new Set());
  const segmentTrackerRef = useRef(new SegmentTracker(initialSegments));
  const stateRef = useRef<PathFollowerState>({
    ...DEFAULT_PATH_FOLLOWER_STATE,
  });

  const notify = useCallback(() => {
    subscribersRef.current.forEach((cb) => cb(stateRef.current));
  }, []);

  const subscribe = useCallback((callback: PathFollowerSubscriber) => {
    subscribersRef.current.add(callback);
    callback(stateRef.current);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  const getState = useCallback(() => stateRef.current, []);

  const registerPath = useCallback(
    (pathElement: SVGPathElement, svgElement: SVGSVGElement) => {
      pathRef.current = pathElement;
      svgRef.current = svgElement;
    },
    [],
  );

  const unregisterPath = useCallback(() => {
    pathRef.current = null;
    svgRef.current = null;
  }, []);

  const addSegment = useCallback(
    (segment: Parameters<typeof segmentTrackerRef.current.addSegment>[0]) => {
      segmentTrackerRef.current.addSegment(segment);
    },
    [],
  );

  const removeSegment = useCallback((id: string) => {
    segmentTrackerRef.current.removeSegment(id);
  }, []);

  const subscribeToSegment = useCallback(
    (
      segmentId: string,
      callback: Parameters<typeof segmentTrackerRef.current.subscribe>[1],
    ) => {
      return segmentTrackerRef.current.subscribe(segmentId, callback);
    },
    [],
  );

  const isSegmentActive = useCallback((segmentId: string) => {
    return segmentTrackerRef.current.isActive(segmentId);
  }, []);

  const getActiveSegments = useCallback(() => {
    return segmentTrackerRef.current.getActiveSegments();
  }, []);

  useEffect(() => {
    let rafId: number;
    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;

      const path = pathRef.current;
      const svg = svgRef.current;
      const target = resolveScrollTarget(scrollContainer);

      if (path && svg && target) {
        const scrollState = getScrollState(target);
        const { scrollTop, scrollHeight, clientHeight, clientWidth } =
          scrollState;

        const maxScroll = scrollHeight - clientHeight;
        const rawProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;

        let progress: number;
        if (smooth) {
          smoothProgressRef.current +=
            (rawProgress - smoothProgressRef.current) * smoothing;
          progress = smoothProgressRef.current;
        } else {
          progress = rawProgress;
        }

        const easedProgress = applyEasing(progress, easing);

        const totalLength = path.getTotalLength();
        const pointAtLength = easedProgress * totalLength;
        const point = path.getPointAtLength(pointAtLength);

        const delta = Math.max(1, totalLength * 0.002);
        const p1 = path.getPointAtLength(Math.max(0, pointAtLength - delta));
        const p2 = path.getPointAtLength(
          Math.min(totalLength, pointAtLength + delta),
        );
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

        let screenX = 0;
        let screenY = 0;
        const ctm = svg.getScreenCTM();
        if (ctm) {
          const pt = svg.createSVGPoint();
          pt.x = point.x;
          pt.y = point.y;
          const screenPt = pt.matrixTransform(ctm);
          screenX = screenPt.x;
          screenY = screenPt.y;
        }

        const now = Date.now();
        const dt = (now - lastTimeRef.current) / 1000;
        const velocity =
          dt > 0 ? Math.abs(progress - lastProgressRef.current) / dt : 0;
        const direction: 1 | -1 = progress >= lastProgressRef.current ? 1 : -1;

        lastProgressRef.current = progress;
        lastTimeRef.current = now;

        segmentTrackerRef.current.update(progress);

        stateRef.current = {
          scrollProgress: progress,
          pathProgress: progress,
          easedProgress,
          position: { x: point.x, y: point.y },
          screenPosition: { x: screenX, y: screenY },
          angle,
          viewport: { width: clientWidth, height: clientHeight },
          direction,
          velocity,
        };

        notify();
      }

      rafId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
    };
  }, [easing, smoothing, smooth, notify, scrollContainer]);

  const contextValue = useRef<PathFollowerContextValue>({
    subscribe,
    getState,
    registerPath,
    unregisterPath,
    addSegment,
    removeSegment,
    subscribeToSegment,
    isSegmentActive,
    getActiveSegments,
  });

  return (
    <PathFollowerContext.Provider value={contextValue.current}>
      {children}
    </PathFollowerContext.Provider>
  );
}
