import { describe, expect, it, vi, beforeEach } from "vitest";

const { openExternalMock } = vi.hoisted(() => ({
  openExternalMock: vi.fn(),
}));

vi.mock("electron", () => ({
  shell: {
    openExternal: openExternalMock,
  },
}));

import { openExternalHttpUrl, shouldOpenExternalUrl } from "./openExternalUrl";

describe("shouldOpenExternalUrl", () => {
  it("allows http and https URLs", () => {
    expect(shouldOpenExternalUrl("https://shellforge.app.br")).toBe(true);
    expect(shouldOpenExternalUrl("http://example.com")).toBe(true);
    expect(shouldOpenExternalUrl("https://github.com/JooLuiz/shellforge")).toBe(true);
  });

  it("rejects non-http schemes and invalid URLs", () => {
    expect(shouldOpenExternalUrl("javascript:alert(1)")).toBe(false);
    expect(shouldOpenExternalUrl("file:///etc/passwd")).toBe(false);
    expect(shouldOpenExternalUrl("not-a-url")).toBe(false);
  });
});

describe("openExternalHttpUrl", () => {
  beforeEach(() => {
    openExternalMock.mockReset();
  });

  it("opens valid http and https URLs in the system browser", () => {
    openExternalHttpUrl("https://shellforge.app.br");
    openExternalHttpUrl("https://github.com/JooLuiz/shellforge");

    expect(openExternalMock).toHaveBeenCalledTimes(2);
    expect(openExternalMock).toHaveBeenCalledWith("https://shellforge.app.br");
    expect(openExternalMock).toHaveBeenCalledWith("https://github.com/JooLuiz/shellforge");
  });

  it("does not open unsafe or invalid URLs", () => {
    openExternalHttpUrl("javascript:alert(1)");
    openExternalHttpUrl("file:///tmp/test");
    openExternalHttpUrl("invalid-url");

    expect(openExternalMock).not.toHaveBeenCalled();
  });
});
