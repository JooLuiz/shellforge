import { describe, expect, it } from "vitest";
import { ensureAppConfig } from "../../shared/defaults";
import {
  buildProfileBlock,
  findManagedBlock,
  mergeManagedBlock,
  PROFILE_BLOCK_BEGIN,
  PROFILE_BLOCK_END,
} from "./profileBlockCore";

describe("profileBlock", () => {
  it("replaces only managed block section", () => {
    const profileBefore = [
      "Set-Location C:\\workspace",
      "",
      PROFILE_BLOCK_BEGIN,
      "old managed content",
      PROFILE_BLOCK_END,
      "",
      "Write-Host 'User content'",
      "",
    ].join("\r\n");

    const merged = mergeManagedBlock(profileBefore, `${PROFILE_BLOCK_BEGIN}\r\nnew-block\r\n${PROFILE_BLOCK_END}\r\n`);

    expect(merged).toContain("Set-Location C:\\workspace");
    expect(merged).toContain("new-block");
    expect(merged).toContain("Write-Host 'User content'");
  });

  it("builds aliases and function entries", () => {
    const baseConfig = ensureAppConfig({
      actionRunner: {
        "bater-ponto": {
          steps: [],
        },
      },
    });

    baseConfig.ui.predefinedCommands["action-runner"].enabled = true;
    baseConfig.ui.predefinedCommands["action-runner"].alias = "action-runner";
    baseConfig.ui.predefinedCommands.touch.enabled = true;
    baseConfig.ui.customActions["bater-ponto"] = {
      availableOnCLI: true,
      aliases: ["bater-ponto", "bp"],
    };

    const block = buildProfileBlock(baseConfig, {
      reinitialize: "C:\\repo\\reinitialize\\reinitialize.bat",
      touch: "C:\\repo\\touch\\touch.bat",
      "action-runner": "C:\\repo\\action-runner\\action-runner.bat",
    });

    expect(block).toContain("New-Alias -Name touch");
    expect(block).toContain("Function bater-ponto");
    expect(block).toContain("Set-Alias -Name bp -Value bater-ponto");
    expect(findManagedBlock(block)).not.toBeNull();
  });
});
