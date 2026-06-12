/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { computeFloatingDropdownPosition } from "./floatingDropdownPosition";

describe("computeFloatingDropdownPosition (node defaults)", () => {
  it("uses fallback viewport dimensions when window is unavailable", () => {
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
    });

    expect(position.top).toBe(202);
    expect(position.maxHeight).toBeGreaterThan(0);
  });
});
