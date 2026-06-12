import { describe, expect, it } from "vitest";
import { ensureAppConfig } from "../../../../shared/defaults";
import { filterCustomActionNames } from "./customActionSearch";

describe("filterCustomActionNames", () => {
  const config = ensureAppConfig({
    actionRunner: {
      "clockify-login": { steps: [] },
      "send-message": { steps: [] },
    },
    ui: {
      customActions: {
        "clockify-login": { availableOnCLI: true, aliases: ["clockify", "login"] },
        "send-message": { availableOnCLI: false, aliases: ["send-message"] },
      },
    },
  });

  // Scenario: custom actions tab search by alias.
  // Expected: alias matches return the parent action even when action name differs.
  it("matches action aliases during search", () => {
    const filteredActionNames = filterCustomActionNames(
      ["clockify-login", "send-message"],
      config,
      "clockify"
    );

    expect(filteredActionNames).toEqual(["clockify-login"]);
  });

  it("returns all actions when the search query is empty", () => {
    expect(filterCustomActionNames(["clockify-login", "send-message"], config, "  ")).toEqual([
      "clockify-login",
      "send-message",
    ]);
  });

  it("matches action names when no custom ui metadata exists", () => {
    const sparseConfig = ensureAppConfig({
      actionRunner: {
        "orphan-action": { steps: [] },
      },
    });

    expect(filterCustomActionNames(["orphan-action"], sparseConfig, "orphan")).toEqual([
      "orphan-action",
    ]);
  });
});
