import React, { useRef, useEffect, useId, useState, useCallback } from "react";
import { useParallax } from "./ParallaxContext";
import { ParallaxLayerProps } from "./types";
import { resolveScrollTarget } from "./useScrollContainer";
import {
  normalizeDirection,
  getPointOnPath,
  getPathTangent,
  linearEase,
  clamp,
} from "./utils";

export function ParallaxLayer({
  children,
  className,
  style,
  speed = 0.5,
  direction = "y",
  motionPath,
  pathOffset = 0,
  pathEase = linearEase,
  autoRotate = false,
  scrollOffset = 0,
  id: customId,
}: ParallaxLayerProps) {
  const generatedId = useId();
  const id = customId || generatedId;
  const elementRef = useRef<HTMLDivElement>(null);
  const initialOffsetRef = useRef<{ offsetTop: number; height: number } | null>(
    null,
  );
  const {
    scrollY,
    viewportHeight,
    scrollContainerRef,
    registerLayer,
    unregisterLayer,
  } = useParallax();
  const [transform, setTransform] = useState({ x: 0, y: 0, rotate: 0 });
  const [isReady, setIsReady] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Capture initial position on first render
  useEffect(() => {
    const captureInitialPosition = () => {
      if (elementRef.current && !initialOffsetRef.current) {
        const container = resolveScrollTarget(scrollContainerRef);

        if (container && container !== window) {
          // For scroll containers: calculate offset relative to container
          const containerEl = container as HTMLElement;
          const containerRect = containerEl.getBoundingClientRect();
          const elementRect = elementRef.current.getBoundingClientRect();

          // Element's position relative to the container's scrollable content
          const offsetTop =
            elementRect.top - containerRect.top + containerEl.scrollTop;

          initialOffsetRef.current = {
            offsetTop,
            height: elementRect.height,
          };
        } else {
          // For window: use document-relative position
          const rect = elementRef.current.getBoundingClientRect();
          initialOffsetRef.current = {
            offsetTop: rect.top + window.scrollY,
            height: rect.height,
          };
        }
        setIsReady(true);
      }
    };

    // Capture immediately and also after a brief delay for layout stability
    captureInitialPosition();
    const timeout = setTimeout(captureInitialPosition, 100);

    return () => clearTimeout(timeout);
  }, [scrollContainerRef]);

  // Register layer on mount
  useEffect(() => {
    if (elementRef.current) {
      registerLayer(id, elementRef.current, {
        speed,
        direction,
        motionPath,
        pathOffset,
        pathEase,
        autoRotate,
        scrollOffset,
      });
    }

    return () => {
      unregisterLayer(id);
    };
  }, [
    id,
    speed,
    direction,
    motionPath,
    pathOffset,
    pathEase,
    autoRotate,
    scrollOffset,
    registerLayer,
    unregisterLayer,
  ]);

  // Calculate transform using RAF for smooth updates
  const updateTransform = useCallback(() => {
    if (!isReady || !initialOffsetRef.current) return;

    const currentScrollY = scrollY;
    const { offsetTop, height: elementHeight } = initialOffsetRef.current;
    const adjustedTop = offsetTop - scrollOffset;

    // Element visibility range within the scrollable area
    const start = adjustedTop - viewportHeight;
    const end = adjustedTop + elementHeight;
    const range = end - start;

    const progress =
      range === 0 ? 0.5 : clamp((currentScrollY - start) / range, 0, 1);

    // If using motion path
    if (motionPath) {
      const easedProgress = pathEase(progress);
      const pathProgress = clamp(easedProgress + pathOffset, 0, 1);

      const point = getPointOnPath(motionPath, pathProgress);
      const rotate = autoRotate ? getPathTangent(motionPath, pathProgress) : 0;

      setTransform({
        x: point.x * speed,
        y: point.y * speed,
        rotate,
      });
      return;
    }

    // Standard parallax based on direction
    const dir = normalizeDirection(direction);
    const offset = (progress - 0.5) * viewportHeight * speed;

    setTransform({
      x: offset * dir.x,
      y: offset * dir.y,
      rotate: 0,
    });
  }, [
    scrollY,
    isReady,
    viewportHeight,
    speed,
    direction,
    motionPath,
    pathOffset,
    pathEase,
    autoRotate,
    scrollOffset,
  ]);

  // Update transform whenever scrollY changes
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateTransform);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scrollY, updateTransform]);

  const { x, y, rotate } = transform;
  let transformString = `translate3d(${x}px, ${y}px, 0)`;
  if (rotate !== 0) {
    transformString += ` rotate(${rotate}deg)`;
  }

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        ...style,
        transform: transformString,
        willChange: "transform",
      }}
      data-parallax-layer={id}
    >
      {children}
    </div>
  );
}
