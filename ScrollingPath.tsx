import React, { useEffect, useRef, useState } from "react";
import { usePathFollower } from "./PathFollowerContext";

interface ScrollingPathProps {
  /** SVG path data string */
  path: string;
  /** Height of the scrollable container (e.g., "500vh") */
  height: string;
  /** Top offset (e.g., "20vh" or "20%") */
  topOffset?: string;
  /** ViewBox dimensions [width, height] */
  viewBox?: [number, number];
  /** Path stroke color or gradient ID */
  stroke?: string;
  /** Path stroke width */
  strokeWidth?: number;
  /** Whether to show a glow effect */
  glow?: boolean;
  /** Glow color */
  glowColor?: string;
  /** Path opacity */
  opacity?: number;
  /** Dash array for dashed lines */
  strokeDasharray?: string;
  /** Additional className for the container */
  className?: string;
  /** Children to render inside the SVG (e.g., markers, decorations) */
  children?: React.ReactNode;
}

export function ScrollingPath({
  path,
  height,
  topOffset = "0",
  viewBox = [400, 2000],
  stroke = "url(#pathGradient)",
  strokeWidth = 3,
  glow = true,
  glowColor,
  opacity = 0.6,
  strokeDasharray = "15 8",
  className = "",
  children,
}: ScrollingPathProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { registerPath, unregisterPath, scrollProgress } = usePathFollower();
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setViewportSize({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Register path after SVG is rendered and mounted
  useEffect(() => {
    if (isMounted && pathRef.current && svgRef.current) {
      registerPath(pathRef.current, svgRef.current, viewBox[1]);
    }
    return () => unregisterPath();
  }, [isMounted, registerPath, unregisterPath, viewBox]);

  // Calculate dynamic viewBox with responsive scaling
  const viewBoxHeight = viewBox[1];
  const windowHeight = 400; // Show ~400 units at a time
  const viewBoxY = Math.max(
    0,
    Math.min(
      viewBoxHeight - windowHeight,
      scrollProgress * viewBoxHeight - windowHeight / 2,
    ),
  );

  // Scale viewBox width based on viewport aspect ratio
  const aspectRatio = viewportSize.width / viewportSize.height;
  const scaledViewBoxWidth = windowHeight * aspectRatio;
  const viewBoxX = (viewBox[0] - scaledViewBoxWidth) / 2; // Center horizontally
  const dynamicViewBox = `${viewBoxX} ${viewBoxY} ${scaledViewBoxWidth} ${windowHeight}`;

  const svgStyle: React.CSSProperties = {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100vh",
    width: "100%",
    pointerEvents: "none",
    zIndex: 10,
  };

  return (
    <svg
      ref={svgRef}
      className={className}
      style={svgStyle}
      viewBox={dynamicViewBox}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffb81c" />
          <stop offset="30%" stopColor="#c45c26" />
          <stop offset="60%" stopColor="#860038" />
          <stop offset="100%" stopColor="#5b7b8c" />
        </linearGradient>
        <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background glow path */}
      {glow && (
        <path
          d={path}
          fill="none"
          stroke={glowColor || stroke}
          strokeWidth={strokeWidth * 2.5}
          strokeLinecap="round"
          opacity={0.15}
          filter="url(#pathGlow)"
        />
      )}

      {/* Main visible path */}
      <path
        ref={pathRef}
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
        opacity={opacity}
      />

      {children}
    </svg>
  );
}
