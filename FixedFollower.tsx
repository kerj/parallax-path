import React, { useRef, useEffect, useCallback } from "react";
import { usePathFollower } from "./PathFollowerContext";

type VerticalAnchor = "top" | "center" | "bottom" | number;

interface FixedFollowerProps {
  children: React.ReactNode;
  /** Whether to rotate based on path tangent */
  autoRotate?: boolean;
  /** Rotation offset in degrees */
  rotationOffset?: number;
  /** Y offset in pixels from the calculated position */
  offsetY?: number;
  /** X offset in pixels from the calculated position */
  offsetX?: number;
  /** Additional className */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * A fixed-position element that follows the SVG path exactly, including loops.
 * The SVG viewport moves to keep the current path section visible.
 */
export function FixedFollower({
  children,
  autoRotate = true,
  rotationOffset = 90,
  offsetX = 0,
  offsetY = 0,
  className = "",
  style,
}: FixedFollowerProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { screenPosition, angle } = usePathFollower();

  // Direct DOM update - bypasses React render cycle for smooth animation
  const updatePosition = useCallback(() => {
    const el = elementRef.current;
    if (!el) return;

    // Follow screen coordinates from CTM transformation
    const finalX = screenPosition.x + offsetX;
    const finalY = screenPosition.y + offsetY;

    const rotation = autoRotate ? angle + rotationOffset : 0;

    el.style.transform = `translate3d(${finalX}px, ${finalY}px, 0) translate(-50%, -50%) rotate(${rotation}deg)`;
  }, [screenPosition, angle, offsetX, offsetY, autoRotate, rotationOffset]);

  // Update on every context change
  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 30,
        pointerEvents: "none",
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
