import { describe, expect, it } from "vitest";
import type { ActionEditorDraft, AppConfig } from "../../../../shared/types";
import {
  isInsideIfElseBranch,
  validateActionEditorDraft,
} from "./actionEditorValidation";

function createBaseConfig(): AppConfig {
  return {
    actionRunner: {
      childAction: {
        steps: [
          {
            action: "getArguments",
            required: ["user"],
          },
        ],
      },
      recursiveAction: {
        steps: [
          {
            action: "ifElse",
            left: "{{context.shouldRetry}}",
            operator: "exists",
            then: [
              {
                action: "invokeAction",
                name: "recursiveAction",
                args: {},
              },
            ],
            else: [],
          },
        ],
      },
      MyAction: {
        steps: [{ action: "shell", command: "echo ok" }],
      },
    },
    ui: {
      predefinedCommands: {
        reinitialize: { enabled: true, alias: "reinitialize" },
        touch: { enabled: true, alias: "touch" },
        "action-runner": { enabled: true, alias: "action-runner" },
      },
      customActions: {
        MyAction: {
          availableOnCLI: true,
          aliases: ["my-alias"],
        },
      },
    },
  };
}

function createDraft(steps: ActionEditorDraft["actionConfig"]["steps"]): ActionEditorDraft {
  return {
    actionName: "MyAction",
    actionConfig: { steps },
    customActionUi: { availableOnCLI: true, aliases: ["my-alias"] },
  };
}

describe("isInsideIfElseBranch", () => {
  it("returns true for steps nested under ifElse then lane", () => {
    const steps = [
      {
        action: "ifElse",
        left: "{{context.flag}}",
        operator: "exists",
        then: [{ action: "shell", command: "echo" }],
        else: [],
      },
    ];

    const inside = isInsideIfElseBranch(
      [
        { arrayKey: "steps", stepIndex: 0 },
        { arrayKey: "then", stepIndex: 0 },
      ],
      steps,
    );

    expect(inside).toBe(true);
  });

  it("returns false for top-level steps", () => {
    const steps = [{ action: "shell", command: "echo" }];
    const inside = isInsideIfElseBranch([{ arrayKey: "steps", stepIndex: 0 }], steps);
    expect(inside).toBe(false);
  });
});

describe("validateActionEditorDraft", () => {
  it("blocks direct self invokeAction outside ifElse", () => {
    const draft = createDraft([
      { action: "invokeAction", name: "MyAction", args: {} },
    ]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.message.includes("cannot invoke itself"))).toBe(true);
    expect(issues.find((issue) => issue.message.includes("cannot invoke itself"))?.fieldKey).toBe(
      "name",
    );
  });

  it("allows self invokeAction inside ifElse then branch", () => {
    const draft = createDraft([
      {
        action: "ifElse",
        left: "{{context.flag}}",
        operator: "exists",
        then: [{ action: "invokeAction", name: "MyAction", args: {} }],
        else: [],
      },
    ]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.message.includes("cannot invoke itself"))).toBe(false);
  });

  it("blocks self invokeAction inside tryCatch", () => {
    const draft = createDraft([
      {
        action: "tryCatch",
        try: [{ action: "invokeAction", name: "MyAction", args: {} }],
      },
    ]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.message.includes("cannot invoke itself"))).toBe(true);
  });

  it("blocks shell self invocation via CLI alias outside ifElse", () => {
    const draft = createDraft([
      { action: "shell", command: "action-runner --action=my-alias" },
    ]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.message.includes("Shell command cannot invoke"))).toBe(
      true,
    );
    expect(
      issues.find((issue) => issue.message.includes("Shell command cannot invoke"))?.fieldKey,
    ).toBe("command");
  });

  it("blocks bare CLI alias shell command outside ifElse", () => {
    const draft = createDraft([{ action: "shell", command: "my-alias" }]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.message.includes("Shell command cannot invoke"))).toBe(
      true,
    );
  });

  it("blocks bare action name shell command outside ifElse", () => {
    const draft = createDraft([{ action: "shell", command: "MyAction" }]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.message.includes("Shell command cannot invoke"))).toBe(
      true,
    );
  });

  it("blocks self invocation in shell commands array outside ifElse", () => {
    const draft = createDraft([
      { action: "shell", commands: ["echo start", "my-alias"] },
    ]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.message.includes("Shell command cannot invoke"))).toBe(
      true,
    );
  });

  it("blocks action-runner short flag shell self invocation outside ifElse", () => {
    const draft = createDraft([
      { action: "shell", command: "action-runner -a MyAction" },
    ]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.message.includes("Shell command cannot invoke"))).toBe(
      true,
    );
  });

  it("allows shell self invocation inside ifElse else branch", () => {
    const draft = createDraft([
      {
        action: "ifElse",
        left: "{{context.flag}}",
        operator: "exists",
        then: [],
        else: [{ action: "shell", command: "my-alias" }],
      },
    ]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.message.includes("Shell command cannot invoke"))).toBe(
      false,
    );
  });

  it("allows unrelated shell commands", () => {
    const draft = createDraft([
      { action: "shell", command: "echo ok" },
      { action: "shell", command: "action-runner --action=otherAction" },
      { action: "shell", command: "{{context.dynamicCommand}}" },
    ]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.message.includes("Shell command cannot invoke"))).toBe(
      false,
    );
  });

  it("requires invokeAction args for child required arguments", () => {
    const draft = createDraft([
      { action: "invokeAction", name: "childAction", args: {} },
    ]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.message.includes('requires arg "user"'))).toBe(true);
    expect(issues.find((issue) => issue.message.includes('requires arg "user"'))?.fieldKey).toBe(
      "args.user",
    );
  });

  it("rejects object fields with empty string values", () => {
    const draft = createDraft([
      {
        action: "invokeAction",
        name: "childAction",
        args: { user: "" },
      },
    ]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.message.includes("must have a value"))).toBe(true);
  });

  it("rejects invalid ifElse left operand", () => {
    const draft = createDraft([
      {
        action: "ifElse",
        left: "plain-text",
        operator: "eq",
        right: "1",
        then: [],
        else: [],
      },
    ]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.message.includes("Compare value"))).toBe(true);
    expect(issues.find((issue) => issue.message.includes("Compare value"))?.fieldKey).toBe("left");
  });

  it("rejects invalid ifElse operators and missing compare-against values", () => {
    const draft = createDraft([
      {
        action: "ifElse",
        left: "{{context.flag}}",
        operator: "invalid-operator",
        right: "",
        then: [],
        else: [],
      },
      {
        action: "ifElse",
        left: "{{context.flag}}",
        operator: "eq",
        right: "   ",
        then: [],
        else: [],
      },
    ]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.fieldKey === "operator")).toBe(true);
    expect(issues.some((issue) => issue.fieldKey === "right")).toBe(true);
  });

  it("rejects object fields with empty keys", () => {
    const draft = createDraft([
      {
        action: "setWebStorage",
        localStorage: { "": "value" },
      },
    ]);
    const issues = validateActionEditorDraft(draft, createBaseConfig());

    expect(issues.some((issue) => issue.message.includes("non-empty key"))).toBe(true);
  });
});
