// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createElement, type MouseEvent } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useModalDismiss } from "./useModalDismiss";

function createKeyboardEvent(
  key: string,
  options: { defaultPrevented?: boolean } = {},
): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key, bubbles: true });

  if (options.defaultPrevented) {
    Object.defineProperty(event, "defaultPrevented", {
      value: true,
      configurable: true,
    });
  }

  return event;
}

describe("useModalDismiss", () => {
  let container: HTMLDivElement;
  let root: Root;
  let keydownListeners: Array<(event: KeyboardEvent) => void>;
  let latestBindings: ReturnType<typeof useModalDismiss> | null;

  beforeEach(() => {
    keydownListeners = [];
    latestBindings = null;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    vi.spyOn(window, "addEventListener").mockImplementation((type, listener, _options) => {
      if (type === "keydown" && typeof listener === "function") {
        keydownListeners.push(listener as (event: KeyboardEvent) => void);
      }
    });

    vi.spyOn(window, "removeEventListener").mockImplementation((type, listener, _options) => {
      if (type === "keydown" && typeof listener === "function") {
        keydownListeners = keydownListeners.filter((registeredListener) => registeredListener !== listener);
      }
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  function mountHook(onClose: () => void, options?: { enabled?: boolean; useCapture?: boolean }): void {
    act(() => {
      root.render(
        createElement(() => {
          latestBindings = useModalDismiss(onClose, options);
          return null;
        }),
      );
    });
  }

  it("calls onClose when backdrop receives mousedown", () => {
    const onClose = vi.fn();
    mountHook(onClose);

    act(() => {
      latestBindings?.backdropProps.onMouseDown();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when panel mousedown is handled", () => {
    const onClose = vi.fn();
    mountHook(onClose);

    const mouseEvent = {
      stopPropagation: vi.fn(),
    } as unknown as MouseEvent<HTMLElement>;

    act(() => {
      latestBindings?.panelProps.onMouseDown(mouseEvent);
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(mouseEvent.stopPropagation).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    mountHook(onClose);

    act(() => {
      keydownListeners[0]?.(createKeyboardEvent("Escape"));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when Escape was consumed by an inner handler", () => {
    const onClose = vi.fn();
    mountHook(onClose);

    act(() => {
      keydownListeners[0]?.(createKeyboardEvent("Escape", { defaultPrevented: true }));
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not register listeners when disabled", () => {
    const onClose = vi.fn();
    mountHook(onClose, { enabled: false });

    expect(keydownListeners).toHaveLength(0);

    act(() => {
      latestBindings?.backdropProps.onMouseDown();
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
