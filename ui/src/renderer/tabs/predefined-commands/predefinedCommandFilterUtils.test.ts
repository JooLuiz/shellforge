import { describe, expect, it } from "vitest";
import { ensureAppConfig } from "../../../shared/defaults";
import {
  buildPredefinedCommandFilterContexts,
  filterPredefinedCommands,
} from "./predefinedCommandFilterUtils";

describe("predefinedCommandFilterUtils", () => {
  const config = ensureAppConfig({ actionRunner: {} });

  // Scenario: predefined tab category chips map to internal command metadata.
  // Expected: only unix-parity commands remain when that filter is active.
  it("filters commands by category", () => {
    const contexts = buildPredefinedCommandFilterContexts(config);
    const filteredContexts = filterPredefinedCommands(contexts, "", "unix-parity");

    expect(filteredContexts.every((context) => context.category === "unix-parity")).toBe(
      true
    );
    expect(filteredContexts.some((context) => context.commandKey === "touch")).toBe(true);
    expect(filteredContexts.some((context) => context.commandKey === "action-runner")).toBe(
      false
    );
  });

  // Scenario: tab header search should match labels, aliases, and categories.
  // Expected: searching for a label keeps only matching commands.
  it("filters commands by search query", () => {
    const contexts = buildPredefinedCommandFilterContexts(config);
    const filteredContexts = filterPredefinedCommands(contexts, "kill port", "all");

    expect(filteredContexts).toHaveLength(1);
    expect(filteredContexts[0]?.commandKey).toBe("kill-port");
  });
});
