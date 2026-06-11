/**
 * @vitest-environment happy-dom
 */
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider, readInitialLocale, useTranslation } from "./index";
import { LOCALE_STORAGE_KEY } from "../../shared/i18n";

describe("renderer i18n", () => {
  it("switches dictionaries when locale changes", () => {
    const windowApi = {
      locale: {
        sync: vi.fn(),
        onChanged: vi.fn(() => vi.fn()),
      },
    };
    window.api = windowApi as unknown as typeof window.api;

    const { result } = renderHook(() => useTranslation(), {
      wrapper: I18nProvider,
    });

    expect(result.current.t.tabs.custom).toContain("Custom");

    act(() => {
      result.current.setLocale("pt-BR");
    });

    expect(result.current.t.tabs.custom).toContain("Personalizadas");
    expect(document.documentElement.lang).toBe("pt-BR");
    expect(windowApi.locale.sync).toHaveBeenCalledWith("pt-BR");
  });

  it("applies locale changes from the preload bridge", () => {
    let localeChangedHandler: ((locale: "en" | "pt-BR") => void) | null = null;
    window.api = {
      locale: {
        sync: vi.fn(),
        onChanged: vi.fn((handler) => {
          localeChangedHandler = handler;
          return vi.fn();
        }),
      },
    } as unknown as typeof window.api;

    const { result } = renderHook(() => useTranslation(), {
      wrapper: I18nProvider,
    });

    act(() => {
      localeChangedHandler?.("pt-BR");
    });

    expect(result.current.locale).toBe("pt-BR");
  });

  it("reads the initial locale from storage", () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "pt-BR");
    expect(readInitialLocale()).toBe("pt-BR");
  });

  it("throws when useTranslation is used outside the provider", () => {
    expect(() => renderHook(() => useTranslation())).toThrow(
      "useTranslation must be used within I18nProvider",
    );
  });

  it("skips locale bridge subscription when preload locale API is unavailable", () => {
    window.api = undefined;

    expect(() =>
      renderHook(() => useTranslation(), {
        wrapper: I18nProvider,
      }),
    ).not.toThrow();
  });
});
