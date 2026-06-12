import type { ActionConfig, ActionStep } from "../../../../shared/types";
import type { FieldType } from "../types";

export function isActionStep(value: unknown): value is ActionStep {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const typedValue = value as { action?: unknown };
  return typeof typedValue.action === "string";
}

export function cloneActionConfig(actionConfig: ActionConfig): ActionConfig {
  return JSON.parse(JSON.stringify(actionConfig)) as ActionConfig;
}

export function getActionSteps(actionConfig: ActionConfig): ActionStep[] {
  if (!Array.isArray(actionConfig.steps)) {
    return [];
  }
  return actionConfig.steps.filter(isActionStep).map((step) => ({ ...step }));
}

export function createEmptyStep(actionType: string): ActionStep {
  const baseStep: ActionStep = { action: actionType };
  switch (actionType) {
    case "navigate":
      return { ...baseStep, url: "" };
    case "type":
      return { ...baseStep, selector: "", value: "" };
    case "click":
      return { ...baseStep, selector: "" };
    case "wait":
      return { ...baseStep, ms: 1000 };
    case "waitForPageState":
      return { ...baseStep, selector: "" };
    case "forEachElement":
      return { ...baseStep, selector: "", steps: [] };
    case "forEach":
      return { ...baseStep, list: [], steps: [] };
    case "apiRequest":
      return { ...baseStep, method: "GET", url: "" };
    case "setVariable":
      return { ...baseStep, source: "", storeAs: "" };
    case "shell":
      return { ...baseStep, command: "" };
    case "getArguments":
      return { ...baseStep, required: [] };
    case "invokeAction":
      return { ...baseStep, name: "" };
    case "tryCatch":
      return { ...baseStep, try: [] };
    case "ifElse":
      return { ...baseStep, left: "", operator: "eq", right: "", then: [], else: [] };
    case "writeFile":
      return { ...baseStep, path: "", content: "" };
    default:
      return baseStep;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasConfiguredStorageObject(value: unknown): boolean {
  return isRecord(value) && Object.keys(value).length > 0;
}

function hasConfiguredCookies(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

export function formatSetWebStorageSummary(step: ActionStep): string {
  const storageTargets: string[] = [];

  if (hasConfiguredStorageObject(step.localStorage)) {
    storageTargets.push("localStorage");
  }
  if (hasConfiguredStorageObject(step.sessionStorage)) {
    storageTargets.push("sessionStorage");
  }
  if (hasConfiguredCookies(step.cookies)) {
    storageTargets.push("cookies");
  }

  if (storageTargets.length === 0) {
    return "";
  }
  if (storageTargets.length === 1) {
    return storageTargets[0];
  }
  if (storageTargets.length === 2) {
    return `${storageTargets[0]} and ${storageTargets[1]}`;
  }

  return `${storageTargets.slice(0, -1).join(", ")} and ${storageTargets[storageTargets.length - 1]}`;
}

export function summarizeStep(step: ActionStep): string {
  switch (step.action) {
    case "navigate":
      return `url: ${String(step.url ?? "")}`;
    case "type":
      return `value: ${String(step.value ?? "")}`;
    case "click":
      return `selector: ${String(step.selector ?? "")}`;
    case "wait":
      return `${String(step.ms ?? "")}ms`;
    case "waitForPageState":
      if (typeof step.selector === "string" && step.selector.length > 0) {
        return `selector: ${step.selector}`;
      }
      if (typeof step.urlContains === "string" && step.urlContains.length > 0) {
        return `urlContains: ${step.urlContains}`;
      }
      if (step.waitForLoading === true) {
        return "loading overlay";
      }
      return "page state";
    case "apiRequest":
      return `${String(step.method ?? "GET")} ${String(step.url ?? "")}`;
    case "shell":
      return String(step.command ?? "");
    case "setVariable":
      return `${String(step.source ?? "")} -> ${String(step.storeAs ?? "")}`;
    case "closeBrowser":
    case "getArguments":
      return "";
    case "setWebStorage":
      return formatSetWebStorageSummary(step);
    case "invokeAction":
      return `action: ${String(step.name ?? "")}`;
    case "forEachElement":
      return `selector: ${String(step.selector ?? "")}`;
    case "forEach":
      return Array.isArray(step.list)
        ? `list: ${step.list.length} item(s)`
        : `count: ${String(step.count ?? "")}`;
    case "tryCatch":
      return "try/catch block";
    case "ifElse":
      return `${String(step.operator ?? "eq")}: ${String(step.left ?? "")}`;
    case "writeFile":
      return `path: ${String(step.path ?? "")}`;
    default:
      return step.action;
  }
}

export function updateStepValue(
  step: ActionStep,
  key: string,
  fieldType: FieldType,
  rawValue: string,
): ActionStep {
  if (fieldType === "string" || fieldType === "select") {
    return { ...step, [key]: rawValue };
  }

  if (fieldType === "number") {
    const numericValue = Number(rawValue);
    return { ...step, [key]: Number.isNaN(numericValue) ? 0 : numericValue };
  }

  if (fieldType === "boolean") {
    return { ...step, [key]: rawValue === "true" };
  }

  if (fieldType === "stringArray") {
    const stringArray = rawValue
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    return { ...step, [key]: stringArray };
  }

  if (fieldType === "object") {
    try {
      const parsedObject = JSON.parse(rawValue) as unknown;
      if (
        typeof parsedObject === "object" &&
        parsedObject !== null &&
        !Array.isArray(parsedObject)
      ) {
        return { ...step, [key]: parsedObject };
      }
      return step;
    } catch {
      return step;
    }
  }

  try {
    return { ...step, [key]: JSON.parse(rawValue) as unknown };
  } catch {
    return step;
  }
}

export function parseLooseValue(rawValue: string): unknown {
  const trimmedValue = rawValue.trim();
  if (trimmedValue.length === 0) {
    return "";
  }
  try {
    return JSON.parse(trimmedValue) as unknown;
  } catch {
    return rawValue;
  }
}
