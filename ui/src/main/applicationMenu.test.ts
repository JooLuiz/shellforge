import { describe, expect, it, vi } from "vitest";

const { setApplicationMenuMock } = vi.hoisted(() => ({
  setApplicationMenuMock: vi.fn(),
}));

vi.mock("electron", () => ({
  Menu: {
    buildFromTemplate: vi.fn((template: unknown) => ({ template })),
    setApplicationMenu: setApplicationMenuMock,
  },
  shell: {
    openExternal: vi.fn(),
  },
}));

import {
  buildApplicationMenu,
  sendAppCommand,
  sendLocaleChanged,
  setApplicationMenu,
} from "./applicationMenu";
import { IPC_CHANNELS } from "./ipc/channels";

describe("applicationMenu", () => {
  it("builds localized menu templates for English and Portuguese", () => {
    const handlers = {
      onNewCustomAction: vi.fn(),
      onNewScheduledTask: vi.fn(),
      onSetLocale: vi.fn(),
    };

    const englishMenu = buildApplicationMenu("en", handlers) as { template: Array<{ label?: string }> };
    const portugueseMenu = buildApplicationMenu("pt-BR", handlers) as { template: Array<{ label?: string }> };

    expect(englishMenu.template[0]?.label).toBe("File");
    expect(portugueseMenu.template[0]?.label).toBe("Arquivo");
  });

  it("invokes menu handlers and forwards IPC commands", () => {
    const handlers = {
      onNewCustomAction: vi.fn(),
      onNewScheduledTask: vi.fn(),
      onSetLocale: vi.fn(),
    };
    const menu = buildApplicationMenu("en", handlers) as {
      template: Array<{
        submenu?: Array<{ click?: () => void }>;
      }>;
    };

    menu.template[0]?.submenu?.[0]?.click?.();
    menu.template[0]?.submenu?.[1]?.click?.();
    menu.template[1]?.submenu?.[0]?.submenu?.[1]?.click?.();

    expect(handlers.onNewCustomAction).toHaveBeenCalled();
    expect(handlers.onNewScheduledTask).toHaveBeenCalled();
    expect(handlers.onSetLocale).toHaveBeenCalledWith("pt-BR");

    const webContents = { send: vi.fn() };
    const browserWindow = { webContents } as unknown as import("electron").BrowserWindow;

    sendLocaleChanged(browserWindow, "pt-BR");
    sendAppCommand(browserWindow, IPC_CHANNELS.appNewCustomAction);
    setApplicationMenu("en", handlers);

    expect(webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.localeChanged, "pt-BR");
    expect(webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.appNewCustomAction);
    expect(setApplicationMenuMock).toHaveBeenCalled();
  });
});
