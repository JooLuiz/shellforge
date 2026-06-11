// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { THEME_STORAGE_KEY } from "../theme/theme";
import { useTheme } from "./useTheme";

function ThemeProbe({
  onChange,
}: {
  onChange: (value: ReturnType<typeof useTheme>) => void;
}): null {
  onChange(useTheme());
  return null;
}

describe("useTheme", () => {
  let container: HTMLDivElement;
  let root: Root;
  let latestTheme: ReturnType<typeof useTheme> | null;

  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    latestTheme = null;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  function renderThemeProbe(): void {
    act(() => {
      root.render(
        createElement(ThemeProbe, {
          onChange: (value) => {
            latestTheme = value;
          },
        }),
      );
    });
  }

  it("sets dark theme on document and localStorage when setTheme is called", () => {
    renderThemeProbe();

    act(() => {
      latestTheme?.setTheme("dark");
    });

    expect(latestTheme?.theme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("sets light theme on document and localStorage when setTheme is called", () => {
    renderThemeProbe();

    act(() => {
      latestTheme?.setTheme("light");
    });

    expect(latestTheme?.theme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });
});
