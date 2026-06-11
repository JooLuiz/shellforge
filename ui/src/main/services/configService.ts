import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { ensureAppConfig } from "../../shared/defaults";
import type { ActionConfig, AppConfig } from "../../shared/types";
import { getRepoPaths } from "./repoPaths";

const require = createRequire(import.meta.url);

type NormalizeStepsFunction = (actionConfig: ActionConfig, actionName: string) => unknown;

let normalizeSteps: NormalizeStepsFunction | null = null;

function loadNormalizeStepsValidator(): NormalizeStepsFunction {
  if (normalizeSteps) {
    return normalizeSteps;
  }

  const { runtimeRoot } = getRepoPaths();
  const normalizeStepsPath = path.join(runtimeRoot, "commands", "action-runner", "normalizeSteps.js");
  const normalizeStepsModule = require(normalizeStepsPath) as {
    normalizeSteps: NormalizeStepsFunction;
  };

  normalizeSteps = normalizeStepsModule.normalizeSteps;
  return normalizeSteps;
}

function parseConfigFile(): Record<string, unknown> {
  const { configPath } = getRepoPaths();
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found at ${configPath}`);
  }

  const rawConfig = fs.readFileSync(configPath, "utf8");
  return JSON.parse(rawConfig) as Record<string, unknown>;
}

function validateActions(config: AppConfig): void {
  const validator = loadNormalizeStepsValidator();
  Object.entries(config.actionRunner).forEach(([actionName, actionConfig]) => {
    validator(actionConfig, actionName);
  });
}

export function readConfig(): AppConfig {
  const rawConfig = parseConfigFile();
  return ensureAppConfig(rawConfig);
}

export function writeConfig(config: AppConfig): void {
  validateActions(config);
  const { configPath } = getRepoPaths();
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}
