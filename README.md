# @kerj/react-parallax-path

Scroll-driven parallax animations with SVG path following for React. Zero dependencies, lightweight, and framework-agnostic.

## Features

- 🎯 **Parallax Layers** - Speed-based parallax with X/Y/diagonal directions
- 🛤️ **SVG Path Following** - Elements follow complex SVG curves as you scroll
- 🎢 **Smooth Easing** - 10+ built-in easing functions + custom cubic bezier
- 📍 **Path Segments** - Define regions with enter/exit/progress events
- 🔄 **Auto-rotation** - Elements rotate to follow path tangent
- 📦 **Scroll Containers** - Works with window or custom scroll containers
- ⚡ **High Performance** - RAF-based updates with optional ref subscriptions

## Installation

```bash
npm install @kerj/react-parallax-path
# or
yarn add @kerj/react-parallax-path
```

## Quick Start

### Basic Parallax

```tsx
import { ParallaxProvider, ParallaxLayer } from "@kerj/react-parallax-path";

function App() {
  return (
    <ParallaxProvider>
      <div style={{ height: "300vh" }}>
        <ParallaxLayer speed={0.5}>
          <div>Slow layer (background feel)</div>
        </ParallaxLayer>

        <ParallaxLayer speed={1.5}>
          <div>Fast layer (foreground feel)</div>
        </ParallaxLayer>

        <ParallaxLayer speed={-0.5}>
          <div>Reverse direction</div>
        </ParallaxLayer>
      </div>
    </ParallaxProvider>
  );
}
```

### SVG Path Following

```tsx
import {
  PathFollowerProvider,
  ScrollingPath,
  FixedFollower,
} from "@kerj/react-parallax-path";

const MY_PATH = `
  M 200 0
  C 280 150, 300 300, 240 450
  C 180 550, 150 650, 180 750
`;

function App() {
  return (
    <PathFollowerProvider smooth smoothing={0.15}>
      <ScrollingPath path={MY_PATH} height="400vh" viewBox={[400, 800]} glow />

      <FixedFollower autoRotate>
        <div className="orb" />
      </FixedFollower>
    </PathFollowerProvider>
  );
}
```

## API Reference

### ParallaxProvider

Wraps your app to enable parallax effects.

```tsx
<ParallaxProvider
  throttle={0} // Throttle scroll updates (ms)
  smooth={false} // Enable smooth scroll behavior
  scrollContainer={ref} // Custom scroll container (RefObject)
>
  {children}
</ParallaxProvider>
```

### ParallaxLayer

A layer that moves at a different speed relative to scroll.

```tsx
<ParallaxLayer
  speed={0.5} // Speed multiplier (0.5 = half speed, 2 = double)
  direction="y" // "x", "y", or { x: 1, y: 0.5 }
  motionPath={pathData} // SVG path string, element, or function
  pathOffset={0} // Offset along path (0-1)
  autoRotate={false} // Rotate to follow path tangent
  scrollOffset={0} // Pixel offset for effect start
>
  {children}
</ParallaxLayer>
```

### PathFollowerProvider

Provides path-following context for scroll-synchronized animations.

```tsx
<PathFollowerProvider
  easing="smoothStep"    // Easing name or function
  smooth={true}          // Enable position smoothing
  smoothing={0.12}       // Smoothing factor (0-1, lower = smoother)
  segments={[...]}       // Path segment definitions
  scrollContainer={ref}  // Custom scroll container
>
  {children}
</PathFollowerProvider>
```

### ScrollingPath

Renders the visible SVG path.

```tsx
<ScrollingPath
  path={pathData} // SVG path data string
  height="500vh" // Scrollable height
  viewBox={[400, 2000]} // SVG viewBox dimensions
  stroke="url(#gradient)" // Stroke color or gradient
  strokeWidth={3} // Path stroke width
  glow={true} // Enable glow effect
  glowColor="#8b5cf6" // Custom glow color
  opacity={0.6} // Path opacity
  strokeDasharray="15 8" // Dash pattern
/>
```

### FixedFollower

Element that follows the path position.

```tsx
<FixedFollower
  autoRotate={true} // Rotate to match path direction
  rotationOffset={90} // Additional rotation offset (degrees)
>
  {children}
</FixedFollower>
```

### usePathFollower

Hook for accessing path state in components.

```tsx
const {
  scrollProgress, // Raw scroll progress (0-1)
  pathProgress, // Position along path (0-1)
  position, // { x, y } in SVG coords
  screenPosition, // { x, y } in screen pixels
  angle, // Tangent angle in degrees
  direction, // 1 (down) or -1 (up)
  velocity, // Scroll speed
  subscribeToSegment,
  isSegmentActive,
  getActiveSegments,
} = usePathFollower();
```

### usePathFollowerRef

High-performance hook using direct DOM updates.

```tsx
const elementRef = useRef(null);

usePathFollowerRef(elementRef, {
  onUpdate: (state) => {
    // Apply transforms directly to DOM
  },
});
```

### Path Segments

Define regions along the path with events.

```tsx
const segments = [
  { id: "intro", start: 0, end: 0.3, label: "Introduction" },
  { id: "main", start: 0.3, end: 0.7, label: "Main Content" },
  { id: "outro", start: 0.7, end: 1, label: "Outro" },
];

// Subscribe to events
const { subscribeToSegment } = usePathFollower();

useEffect(() => {
  return subscribeToSegment("intro", (event) => {
    if (event.type === "enter") console.log("Entered intro!");
    if (event.type === "exit") console.log("Left intro!");
    // event.segmentProgress = 0-1 within segment
  });
}, []);
```

### Easing Functions

Built-in easing options:

- `linear` - No easing
- `easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- `easeOutExpo`, `easeInOutExpo`
- `smoothStep`, `smootherStep`

Custom cubic bezier:

```tsx
import { cubicBezier } from '@kerj/react-parallax-path';

<PathFollowerProvider easing={cubicBezier(0.4, 0, 0.2, 1)}>
```

### Scroll Container Support

Use with custom scroll containers:

```tsx
const scrollRef = useRef(null);

<div ref={scrollRef} style={{ height: 400, overflowY: "auto" }}>
  <ParallaxProvider scrollContainer={scrollRef}>
    {/* content */}
  </ParallaxProvider>
</div>;
```

## Utility Exports

```tsx
import {
  // Core components
  ParallaxProvider,
  ParallaxLayer,
  PathFollowerProvider,
  ScrollingPath,
  FixedFollower,

  // Hooks
  useParallax,
  usePathFollower,
  usePathFollowerRef,
  useScrollContainer,

  // Utilities
  easings,
  cubicBezier,
  applyEasing,
  SegmentTracker,
  createSegmentPresets,
  normalizeDirection,
  clamp,

  // Types
  type PathFollowerState,
  type PathSegment,
  type SegmentEvent,
  type ParallaxConfig,
  type EasingName,
} from "@kerj/react-parallax-path";
```

## License

MIT
