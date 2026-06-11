import { describe, expect, it } from "vitest";
import type { ActionEditorDraft } from "../types";
import {
  buildSelfInvocationTokens,
  collectShellCommandTexts,
  shellStepInvokesSelf,
  shellTextInvokesSelf,
} from "./shellSelfInvocationUtils";

function createDraft(
  overrides: Partial<ActionEditorDraft> = {},
): ActionEditorDraft {
  return {
    actionName: "MyAction",
    actionConfig: { steps: [] },
    customActionUi: { availableOnCLI: true, aliases: ["my-alias"] },
    ...overrides,
  };
}

describe("collectShellCommandTexts", () => {
  it("collects command and commands entries", () => {
    expect(
      collectShellCommandTexts({
        action: "shell",
        command: "echo one",
        commands: ["echo two", "echo three"],
      }),
    ).toEqual(["echo one", "echo two", "echo three"]);
  });
});

describe("buildSelfInvocationTokens", () => {
  it("includes action name and draft aliases when availableOnCLI", () => {
    const tokens = buildSelfInvocationTokens(createDraft(), {} as never);
    expect(tokens).toEqual(["MyAction", "my-alias"]);
  });

  it("includes only action name when not available on CLI", () => {
    const tokens = buildSelfInvocationTokens(
      createDraft({
        customActionUi: { availableOnCLI: false, aliases: ["my-alias"] },
      }),
      {} as never,
    );
    expect(tokens).toEqual(["MyAction"]);
  });
});

describe("shellTextInvokesSelf", () => {
  const tokens = ["MyAction", "my-alias"];

  it("detects bare CLI alias commands", () => {
    expect(shellTextInvokesSelf("my-alias", tokens)).toBe(true);
    expect(shellTextInvokesSelf("my-alias --arg.x=1", tokens)).toBe(true);
  });

  it("detects bare action name commands", () => {
    expect(shellTextInvokesSelf("MyAction", tokens)).toBe(true);
  });

  it("detects action-runner flag forms", () => {
    expect(shellTextInvokesSelf("action-runner --action=MyAction", tokens)).toBe(true);
    expect(shellTextInvokesSelf("action-runner -a my-alias", tokens)).toBe(true);
    expect(shellTextInvokesSelf("action-runner -a=MyAction", tokens)).toBe(true);
  });

  it("allows unrelated commands", () => {
    expect(shellTextInvokesSelf("echo ok", tokens)).toBe(false);
    expect(shellTextInvokesSelf("action-runner --action=otherAction", tokens)).toBe(false);
  });

  it("skips interpolation-only commands", () => {
    expect(shellTextInvokesSelf("{{context.dynamicCommand}}", tokens)).toBe(false);
    expect(shellTextInvokesSelf("{{env.RUN_CMD}}", tokens)).toBe(false);
  });
});

describe("shellStepInvokesSelf", () => {
  const tokens = ["MyAction", "my-alias"];

  it("detects self invocation in commands array", () => {
    expect(
      shellStepInvokesSelf(
        {
          action: "shell",
          commands: ["echo start", "my-alias"],
        },
        tokens,
      ),
    ).toBe(true);
  });
});
