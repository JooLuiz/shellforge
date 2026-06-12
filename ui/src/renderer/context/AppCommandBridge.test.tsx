/**
 * @vitest-environment happy-dom
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  AppCommandBridgeProvider,
  useAppCommandBridge,
} from "./AppCommandBridge";

function BridgeConsumer(): JSX.Element {
  const bridge = useAppCommandBridge();
  return (
    <>
      <button type="button" onClick={() => bridge.requestCustomActionCreate()}>
        trigger-custom-create
      </button>
      <button type="button" onClick={() => bridge.requestScheduledTaskCreate()}>
        trigger-task-create
      </button>
    </>
  );
}

describe("AppCommandBridge", () => {
  beforeEach(() => {
    window.api = {
      app: {
        onNewCustomAction: vi.fn(() => vi.fn()),
        onNewScheduledTask: vi.fn(() => vi.fn()),
      },
    } as unknown as typeof window.api;
  });

  it("invokes registered custom action create handlers", () => {
    const createHandler = vi.fn();

    render(
      <AppCommandBridgeProvider>
        <BridgeRegistrar kind="custom" register={createHandler} />
        <BridgeConsumer />
      </AppCommandBridgeProvider>,
    );

    screen.getByRole("button", { name: "trigger-custom-create" }).click();
    expect(createHandler).toHaveBeenCalledTimes(1);
  });

  it("invokes registered scheduled task create handlers", () => {
    const createHandler = vi.fn();

    render(
      <AppCommandBridgeProvider>
        <BridgeRegistrar kind="scheduled" register={createHandler} />
        <BridgeConsumer />
      </AppCommandBridgeProvider>,
    );

    screen.getByRole("button", { name: "trigger-task-create" }).click();
    expect(createHandler).toHaveBeenCalledTimes(1);
  });

  it("subscribes to preload app commands when window.api is available", () => {
    render(
      <AppCommandBridgeProvider>
        <span>bridge-ready</span>
      </AppCommandBridgeProvider>,
    );

    expect(window.api?.app?.onNewCustomAction).toHaveBeenCalled();
    expect(window.api?.app?.onNewScheduledTask).toHaveBeenCalled();
  });

  it("throws when used outside the provider", () => {
    expect(() => render(<BridgeConsumer />)).toThrow(
      "useAppCommandBridge must be used within AppCommandBridgeProvider",
    );
  });
});

function BridgeRegistrar({
  kind,
  register,
}: {
  kind: "custom" | "scheduled";
  register: () => void;
}): JSX.Element | null {
  const bridge = useAppCommandBridge();

  if (kind === "custom") {
    bridge.registerCustomActionCreate(register);
  } else {
    bridge.registerScheduledTaskCreate(register);
  }

  return null;
}
