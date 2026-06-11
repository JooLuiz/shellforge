// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { createElement } from "react";
import {
  createModalEscapeKeyHandler,
  useModalEscapeClose,
} from "./useModalEscapeClose";

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

describe("createModalEscapeKeyHandler", () => {
  it("calls onClose when Escape is pressed and defaultPrevented is false", () => {
    const onClose = vi.fn();
    const handler = createModalEscapeKeyHandler(onClose);

    handler(createKeyboardEvent("Escape"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when Escape defaultPrevented is true", () => {
    const onClose = vi.fn();
    const handler = createModalEscapeKeyHandler(onClose);

    handler(createKeyboardEvent("Escape", { defaultPrevented: true }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("ignores non-Escape keys", () => {
    const onClose = vi.fn();
    const handler = createModalEscapeKeyHandler(onClose);

    handler(createKeyboardEvent("Enter"));
    handler(createKeyboardEvent("Tab"));

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("useModalEscapeClose", () => {
  let container: HTMLDivElement;
  let root: Root;
  let keydownListeners: Array<(event: KeyboardEvent) => void>;

  beforeEach(() => {
    keydownListeners = [];
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

  function mountHook(onClose: () => void, enabled = true): void {
    act(() => {
      root.render(
        createElement(() => {
          useModalEscapeClose(onClose, enabled);
          return null;
        }),
      );
    });
  }

  it("registers a keydown listener that closes the modal on Escape", () => {
    const onClose = vi.fn();
    mountHook(onClose);

    expect(keydownListeners).toHaveLength(1);

    act(() => {
      keydownListeners[0]?.(createKeyboardEvent("Escape"));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when Escape was consumed by an inner handler", () => {
    const onClose = vi.fn();
    mountHook(onClose);

    act(() => {
      keydownListeners[0]?.(createKeyboardEvent("Escape", { defaultPrevented: true }));
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("removes the keydown listener on unmount", () => {
    const onClose = vi.fn();
    mountHook(onClose);

    expect(keydownListeners).toHaveLength(1);

    act(() => {
      root.unmount();
    });

    expect(keydownListeners).toHaveLength(0);
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
      false,
    );
  });

  it("does not register a listener when disabled", () => {
    const onClose = vi.fn();
    mountHook(onClose, false);

    expect(keydownListeners).toHaveLength(0);
    expect(window.addEventListener).not.toHaveBeenCalled();
  });
});
