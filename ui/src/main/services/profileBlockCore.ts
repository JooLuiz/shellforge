import type { AppConfig, PredefinedCommandKey } from "../../shared/types";

export const PROFILE_BLOCK_BEGIN = "# === windows-custom-commands:BEGIN (managed - do not edit) ===";
export const PROFILE_BLOCK_END = "# === windows-custom-commands:END ===";

export interface CommandExecutablePaths {
  reinitialize: string;
  touch: string;
  "action-runner": string;
}

function quotePathForPowershell(pathValue: string): string {
  return pathValue.replace(/'/g, "''");
}

function toPowerShellFunction(actionName: string, functionAlias: string, actionRunnerAlias: string): string {
  return [
    `Function ${functionAlias} {`,
    "    param (",
    "        [string[]]$ExtraArgs",
    "    )",
    `    $actionRunnerCommand = "${actionRunnerAlias}"`,
    `    $actionRunnerCommand += " --action=${actionName}"`,
    "    foreach ($arg in $ExtraArgs) {",
    "        if ($arg.StartsWith(\"--\")) {",
    "            $actionRunnerCommand += \" $arg\"",
    "        } elseif ($arg.StartsWith(\"-\")) {",
    "            $actionRunnerCommand += \" $arg\"",
    "        } else {",
    "            $actionRunnerCommand += \" '$arg'\"",
    "        }",
    "    }",
    "    Invoke-Expression $actionRunnerCommand",
    "}",
  ].join("\r\n");
}

export function findManagedBlock(profileContent: string): { startIndex: number; endIndex: number } | null {
  const startIndex = profileContent.indexOf(PROFILE_BLOCK_BEGIN);
  const endIndex = profileContent.indexOf(PROFILE_BLOCK_END);

  if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
    return null;
  }

  return {
    startIndex,
    endIndex: endIndex + PROFILE_BLOCK_END.length,
  };
}

export function buildProfileBlock(
  config: AppConfig,
  commandExecutablePaths: CommandExecutablePaths
): string {
  const commandKeys: PredefinedCommandKey[] = ["reinitialize", "touch", "action-runner"];
  const blockLines: string[] = [PROFILE_BLOCK_BEGIN];

  commandKeys.forEach((commandKey) => {
    const commandConfig = config.ui.predefinedCommands[commandKey];
    if (!commandConfig.enabled) {
      return;
    }

    const commandPath = commandExecutablePaths[commandKey];
    blockLines.push(
      `New-Alias -Name ${commandConfig.alias} -Value '${quotePathForPowershell(commandPath)}'`
    );
  });

  const actionRunnerAlias = config.ui.predefinedCommands["action-runner"].alias;
  if (config.ui.predefinedCommands["action-runner"].enabled) {
    Object.entries(config.ui.customActions).forEach(([actionName, customConfig]) => {
      if (!customConfig.availableOnCLI) {
        return;
      }

      const [primaryAlias, ...secondaryAliases] = customConfig.aliases;
      if (!primaryAlias) {
        return;
      }

      blockLines.push("");
      blockLines.push(toPowerShellFunction(actionName, primaryAlias, actionRunnerAlias));

      secondaryAliases.forEach((aliasName) => {
        blockLines.push(`Set-Alias -Name ${aliasName} -Value ${primaryAlias}`);
      });
    });
  }

  blockLines.push(PROFILE_BLOCK_END);
  return `${blockLines.join("\r\n")}\r\n`;
}

export function mergeManagedBlock(profileContent: string, managedBlock: string): string {
  const blockRange = findManagedBlock(profileContent);
  if (!blockRange) {
    const prefix = profileContent.trim().length > 0 ? `${profileContent.trimEnd()}\r\n\r\n` : "";
    return `${prefix}${managedBlock}`;
  }

  const updatedProfile = [
    profileContent.slice(0, blockRange.startIndex).replace(/\s*$/, ""),
    "",
    managedBlock.trimEnd(),
    "",
    profileContent.slice(blockRange.endIndex).replace(/^\s*/, ""),
  ]
    .filter((segment) => segment.length > 0)
    .join("\r\n");

  return `${updatedProfile}\r\n`;
}
