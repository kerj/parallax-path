import { useCallback, useRef, useEffect } from "react";

export type ScrollContainerRef =
  | Window
  | HTMLElement
  | React.RefObject<HTMLElement | null>;

export interface ScrollState {
  scrollTop: number;
  scrollLeft: number;
  scrollHeight: number;
  clientHeight: number;
  clientWidth: number;
}

/**
 * Resolves a ScrollContainerRef to the actual scroll target element.
 */
export function resolveScrollTarget(
  scrollContainer: ScrollContainerRef | undefined,
): Window | HTMLElement | null {
  if (!scrollContainer) return window;
  if ("current" in scrollContainer) return scrollContainer.current;
  return scrollContainer;
}

/**
 * Gets the current scroll state from a scroll target.
 */
export function getScrollState(
  target: Window | HTMLElement | null,
): ScrollState {
  if (!target) {
    return {
      scrollTop: 0,
      scrollLeft: 0,
      scrollHeight: 0,
      clientHeight: 0,
      clientWidth: 0,
    };
  }

  if (target === window) {
    return {
      scrollTop: window.scrollY,
      scrollLeft: window.scrollX,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: window.innerHeight,
      clientWidth: window.innerWidth,
    };
  }

  const el = target as HTMLElement;
  return {
    scrollTop: el.scrollTop,
    scrollLeft: el.scrollLeft,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    clientWidth: el.clientWidth,
  };
}

interface UseScrollContainerOptions {
  scrollContainer?: ScrollContainerRef;
  onScroll?: (state: ScrollState) => void;
  onResize?: (state: ScrollState) => void;
  throttle?: number;
}

/**
 * Hook that manages scroll and resize event subscriptions for a scroll container.
 * Returns helpers to get the current scroll state.
 */
export function useScrollContainer({
  scrollContainer,
  onScroll,
  onResize,
  throttle = 0,
}: UseScrollContainerOptions) {
  const lastScrollTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const getTarget = useCallback(() => {
    return resolveScrollTarget(scrollContainer);
  }, [scrollContainer]);

  const getState = useCallback(() => {
    return getScrollState(getTarget());
  }, [getTarget]);

  useEffect(() => {
    const target = getTarget();
    if (!target) return;

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const now = performance.now();

        if (throttle > 0 && now - lastScrollTimeRef.current < throttle) {
          rafRef.current = requestAnimationFrame(() => handleScroll());
          return;
        }

        lastScrollTimeRef.current = now;
        onScroll?.(getScrollState(target));
      });
    };

    const handleResize = () => {
      onResize?.(getScrollState(target));
    };

    // Initial call
    onScroll?.(getScrollState(target));
    onResize?.(getScrollState(target));

    target.addEventListener("scroll", handleScroll, { passive: true });

    if (target === window) {
      window.addEventListener("resize", handleResize, { passive: true });
    } else {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(target as HTMLElement);

      return () => {
        target.removeEventListener("scroll", handleScroll);
        resizeObserver.disconnect();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }

    return () => {
      target.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [getTarget, onScroll, onResize, throttle]);

  return { getTarget, getState };
}
