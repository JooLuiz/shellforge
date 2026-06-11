import { describe, expect, it } from "vitest";

import { computeFloatingDropdownPosition } from "./floatingDropdownPosition";

describe("computeFloatingDropdownPosition", () => {
  it("positions the dropdown below the anchor by default", () => {
    const position = computeFloatingDropdownPosition({
      anchorRect: {
        bottom: 200,
        top: 160,
        left: 40,
        width: 120,
        right: 160,
        height: 40,
        x: 40,
        y: 160,
        toJSON: () => ({}),
      },
      viewportPadding: 8,
      preferredMaxHeight: 280,
      viewportWidth: 1024,
      viewportHeight: 768,
    });

    expect(position.left).toBe(40);
    expect(position.top).toBe(202);
    expect(position.width).toBe(120);
    expect(position.maxHeight).toBeGreaterThan(0);
  });

  it("opens upward when there is more space above the anchor", () => {
    const position = computeFloatingDropdownPosition({
      anchorRect: {
        bottom: 740,
        top: 700,
        left: 40,
        width: 120,
        right: 160,
        height: 40,
        x: 40,
        y: 700,
        toJSON: () => ({}),
      },
      viewportPadding: 8,
      preferredMaxHeight: 280,
      viewportWidth: 1024,
      viewportHeight: 768,
    });

    expect(position.top).toBeLessThan(700);
  });

  it("clamps the dropdown within the viewport width", () => {
    const position = computeFloatingDropdownPosition({
      anchorRect: {
        bottom: 200,
        top: 160,
        left: 980,
        width: 120,
        right: 1100,
        height: 40,
        x: 980,
        y: 160,
        toJSON: () => ({}),
      },
      viewportPadding: 8,
      preferredMaxHeight: 280,
      viewportWidth: 1024,
      viewportHeight: 768,
    });

    expect(position.left).toBe(896);
  });
});
