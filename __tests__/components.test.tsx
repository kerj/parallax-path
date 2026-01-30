import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { render } from "@testing-library/react";
import { ParallaxProvider, useParallax } from "../ParallaxContext";
import { ParallaxLayer } from "../ParallaxLayer";

// Test component to access context
function ContextConsumer() {
  const context = useParallax();
  return (
    <div data-testid="context-values">
      <span data-testid="viewport-height">{context.viewportHeight}</span>
      <span data-testid="scroll-y">{context.scrollY}</span>
    </div>
  );
}

describe("ParallaxProvider", () => {
  it("renders children", () => {
    const { getByTestId } = render(
      <ParallaxProvider>
        <div data-testid="child">Hello</div>
      </ParallaxProvider>,
    );

    expect(getByTestId("child")).toBeInTheDocument();
    expect(getByTestId("child")).toHaveTextContent("Hello");
  });

  it("provides context values", () => {
    const { getByTestId } = render(
      <ParallaxProvider>
        <ContextConsumer />
      </ParallaxProvider>,
    );

    expect(getByTestId("viewport-height")).toBeInTheDocument();
    expect(getByTestId("scroll-y")).toBeInTheDocument();
  });

  it("applies smooth scroll behavior when smooth prop is true", () => {
    const { container } = render(
      <ParallaxProvider smooth>
        <div>Content</div>
      </ParallaxProvider>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.scrollBehavior).toBe("smooth");
  });

  it("applies auto scroll behavior when smooth prop is false", () => {
    const { container } = render(
      <ParallaxProvider smooth={false}>
        <div>Content</div>
      </ParallaxProvider>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.scrollBehavior).toBe("auto");
  });
});

describe("useParallax", () => {
  it("throws error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<ContextConsumer />);
    }).toThrow("useParallax must be used within a ParallaxProvider");

    consoleSpy.mockRestore();
  });
});

describe("ParallaxLayer", () => {
  it("renders children", () => {
    const { getByTestId } = render(
      <ParallaxProvider>
        <ParallaxLayer>
          <span data-testid="layer-content">Layer Content</span>
        </ParallaxLayer>
      </ParallaxProvider>,
    );

    expect(getByTestId("layer-content")).toBeInTheDocument();
    expect(getByTestId("layer-content")).toHaveTextContent("Layer Content");
  });

  it("applies custom className", () => {
    const { getByText } = render(
      <ParallaxProvider>
        <ParallaxLayer className="custom-class">
          <span>Content</span>
        </ParallaxLayer>
      </ParallaxProvider>,
    );

    const layer = getByText("Content").parentElement;
    expect(layer).toHaveClass("custom-class");
  });

  it("applies custom style", () => {
    const { getByText } = render(
      <ParallaxProvider>
        <ParallaxLayer style={{ backgroundColor: "red" }}>
          <span>Content</span>
        </ParallaxLayer>
      </ParallaxProvider>,
    );

    const layer = getByText("Content").parentElement;
    expect(layer).toHaveStyle({ backgroundColor: "red" });
  });

  it("adds data-parallax-layer attribute", () => {
    const { getByText } = render(
      <ParallaxProvider>
        <ParallaxLayer id="test-layer">
          <span>Content</span>
        </ParallaxLayer>
      </ParallaxProvider>,
    );

    const layer = getByText("Content").parentElement;
    expect(layer).toHaveAttribute("data-parallax-layer", "test-layer");
  });

  it("applies transform and will-change styles", () => {
    const { getByText } = render(
      <ParallaxProvider>
        <ParallaxLayer>
          <span>Content</span>
        </ParallaxLayer>
      </ParallaxProvider>,
    );

    const layer = getByText("Content").parentElement;
    expect(layer).toHaveStyle({ willChange: "transform" });
  });

  it("renders multiple layers independently", () => {
    const { getByTestId } = render(
      <ParallaxProvider>
        <ParallaxLayer id="layer-1" speed={0.5}>
          <span data-testid="layer-1">Layer 1</span>
        </ParallaxLayer>
        <ParallaxLayer id="layer-2" speed={1.5}>
          <span data-testid="layer-2">Layer 2</span>
        </ParallaxLayer>
      </ParallaxProvider>,
    );

    expect(getByTestId("layer-1")).toBeInTheDocument();
    expect(getByTestId("layer-2")).toBeInTheDocument();

    const layer1 = getByTestId("layer-1").parentElement;
    const layer2 = getByTestId("layer-2").parentElement;

    expect(layer1).toHaveAttribute("data-parallax-layer", "layer-1");
    expect(layer2).toHaveAttribute("data-parallax-layer", "layer-2");
  });
});
