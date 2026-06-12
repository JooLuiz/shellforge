import { describe, expect, it } from "vitest";

import { collectActionArgumentSchema } from "./actionArgumentSchema";
import type { ActionConfig } from "./types";

describe("collectActionArgumentSchema", () => {
  it("collects required, optional, and defaults from getArguments steps", () => {
    const actionConfig: ActionConfig = {
      steps: [
        {
          action: "getArguments",
          required: ["taskId"],
          optional: ["retries"],
          defaults: { retries: "3", envName: "dev" },
        },
      ],
    };

    expect(collectActionArgumentSchema(actionConfig)).toEqual({
      required: ["taskId"],
      optional: ["retries"],
      defaults: { retries: "3", envName: "dev" },
    });
  });

  it("walks nested step arrays", () => {
    const actionConfig: ActionConfig = {
      steps: [
        {
          action: "tryCatch",
          try: [
            {
              action: "getArguments",
              required: ["message"],
            },
          ],
        },
      ],
    };

    expect(collectActionArgumentSchema(actionConfig).required).toEqual(["message"]);
  });
});
