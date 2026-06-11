import { describe, expect, it, vi, beforeEach } from "vitest";
import { IPC_CHANNELS } from "./channels";

const ipcMainHandleMock = vi.fn();
const setApplicationMenuMock = vi.fn();
const sendMock = vi.fn();

vi.mock("electron", () => ({
  ipcMain: {
    handle: ipcMainHandleMock,
  },
  Menu: {
    buildFromTemplate: vi.fn(() => ({})),
    setApplicationMenu: setApplicationMenuMock,
  },
  shell: {
    openExternal: vi.fn(),
  },
}));

vi.mock("../applicationMenu", async () => {
  const actual = await vi.importActual<typeof import("../applicationMenu")>("../applicationMenu");
  return {
    ...actual,
    setApplicationMenu: setApplicationMenuMock,
    sendLocaleChanged: vi.fn(),
    sendAppCommand: vi.fn(),
  };
});

describe("locale IPC registration", () => {
  beforeEach(() => {
    ipcMainHandleMock.mockReset();
    setApplicationMenuMock.mockReset();
    sendMock.mockReset();
    vi.resetModules();
  });

  it("registers locale sync and get handlers", async () => {
    const { registerLocaleIpcHandlers } = await import("./locale");

    registerLocaleIpcHandlers(() => null);

    expect(ipcMainHandleMock).toHaveBeenCalledWith(
      IPC_CHANNELS.localeSync,
      expect.any(Function),
    );
    expect(ipcMainHandleMock).toHaveBeenCalledWith(
      IPC_CHANNELS.localeGet,
      expect.any(Function),
    );
    expect(setApplicationMenuMock).toHaveBeenCalled();
  });

  it("syncs locale through the registered handler", async () => {
    const { registerLocaleIpcHandlers, getCurrentApplicationLocale } = await import("./locale");

    registerLocaleIpcHandlers(() => null);

    const syncHandler = ipcMainHandleMock.mock.calls.find(
      ([channel]) => channel === IPC_CHANNELS.localeSync,
    )?.[1] as (event: unknown, locale: unknown) => void;

    syncHandler({}, "pt-BR");
    expect(getCurrentApplicationLocale()).toBe("pt-BR");
    expect(setApplicationMenuMock).toHaveBeenCalled();
  });

  it("rejects invalid locale values", async () => {
    const { registerLocaleIpcHandlers } = await import("./locale");

    registerLocaleIpcHandlers(() => null);

    const syncHandler = ipcMainHandleMock.mock.calls.find(
      ([channel]) => channel === IPC_CHANNELS.localeSync,
    )?.[1] as (event: unknown, locale: unknown) => void;

    expect(() => syncHandler({}, "invalid-locale")).toThrow("Invalid locale");
  });

  it("returns the current locale from localeGet", async () => {
    const { registerLocaleIpcHandlers } = await import("./locale");

    registerLocaleIpcHandlers(() => null);

    const getHandler = ipcMainHandleMock.mock.calls.find(
      ([channel]) => channel === IPC_CHANNELS.localeGet,
    )?.[1] as () => string;

    expect(getHandler()).toBe("en");
  });
});
