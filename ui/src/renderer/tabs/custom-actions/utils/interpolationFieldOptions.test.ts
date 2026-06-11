import { describe, expect, it } from "vitest";
import { buildInterpolationFieldOptions } from "./interpolationFieldOptions";
import {
  SYSTEM_VARIABLE_OPTION_LABEL,
  SYSTEM_VARIABLE_OPTION_VALUE,
} from "./interpolationTokenUtils";

describe("interpolationFieldOptions", () => {
  it("builds system variable option first followed by context variables", () => {
    const options = buildInterpolationFieldOptions(["token", "userId"]);

    expect(options).toEqual([
      {
        label: SYSTEM_VARIABLE_OPTION_LABEL,
        value: SYSTEM_VARIABLE_OPTION_VALUE,
      },
      {
        label: "{{context.token}}",
        value: "{{context.token}}",
      },
      {
        label: "{{context.userId}}",
        value: "{{context.userId}}",
      },
    ]);
  });

  it("returns only the system variable option when no context variables exist", () => {
    expect(buildInterpolationFieldOptions([])).toEqual([
      {
        label: SYSTEM_VARIABLE_OPTION_LABEL,
        value: SYSTEM_VARIABLE_OPTION_VALUE,
      },
    ]);
  });
});
