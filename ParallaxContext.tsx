import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { ParallaxContextValue, ParallaxConfig } from "./types";
import {
  ScrollContainerRef,
  resolveScrollTarget,
  getScrollState,
} from "./useScrollContainer";

const ParallaxContext = createContext<ParallaxContextValue | null>(null);

interface LayerRegistration {
  element: HTMLElement;
  config: ParallaxConfig;
}

interface ParallaxProviderProps {
  children: React.ReactNode;
  /** Throttle scroll updates (ms). Lower = smoother but more CPU. Default: 0 (no throttle) */
  throttle?: number;
  /** Use smooth scrolling behavior */
  smooth?: boolean;
  /** Custom scroll container (defaults to window) */
  scrollContainer?: ScrollContainerRef;
}

export function ParallaxProvider({
  children,
  throttle = 0,
  smooth = false,
  scrollContainer,
}: ParallaxProviderProps) {
  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 0,
  );
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  const layersRef = useRef<Map<string, LayerRegistration>>(new Map());
  const rafRef = useRef<number | null>(null);
  const lastScrollRef = useRef<number>(0);

  const updateScroll = useCallback(() => {
    const target = resolveScrollTarget(scrollContainer);
    if (!target) return;

    const now = performance.now();

    if (throttle > 0 && now - lastScrollRef.current < throttle) {
      rafRef.current = requestAnimationFrame(updateScroll);
      return;
    }

    lastScrollRef.current = now;

    const state = getScrollState(target);
    setScrollY(state.scrollTop);
    setScrollX(state.scrollLeft);
  }, [throttle, scrollContainer]);

  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(updateScroll);
  }, [updateScroll]);

  const registerLayer = useCallback(
    (id: string, element: HTMLElement, config: ParallaxConfig) => {
      layersRef.current.set(id, { element, config });
    },
    [],
  );

  const updateViewport = useCallback(() => {
    const target = resolveScrollTarget(scrollContainer);
    if (!target) return;

    const state = getScrollState(target);
    setViewportHeight(state.clientHeight);
    setViewportWidth(state.clientWidth);
  }, [scrollContainer]);

  const unregisterLayer = useCallback((id: string) => {
    layersRef.current.delete(id);
  }, []);

  useEffect(() => {
    const target = resolveScrollTarget(scrollContainer);
    if (!target) return;

    updateScroll();
    updateViewport();

    target.addEventListener("scroll", handleScroll, { passive: true });

    if (target === window) {
      window.addEventListener("resize", updateViewport, { passive: true });
    } else {
      const resizeObserver = new ResizeObserver(updateViewport);
      resizeObserver.observe(target as HTMLElement);

      return () => {
        target.removeEventListener("scroll", handleScroll);
        resizeObserver.disconnect();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }

    return () => {
      target.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateViewport);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll, updateViewport, updateScroll, scrollContainer]);

  const value: ParallaxContextValue = {
    scrollY,
    scrollX,
    viewportHeight,
    viewportWidth,
    scrollContainerRef: scrollContainer,
    registerLayer,
    unregisterLayer,
  };

  return (
    <ParallaxContext.Provider value={value}>
      <div style={{ scrollBehavior: smooth ? "smooth" : "auto" }}>
        {children}
      </div>
    </ParallaxContext.Provider>
  );
}

export function useParallax(): ParallaxContextValue {
  const context = useContext(ParallaxContext);
  if (!context) {
    throw new Error("useParallax must be used within a ParallaxProvider");
  }
  return context;
}

export { ParallaxContext };
