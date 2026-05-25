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
    case "forEachElement":
      return { ...baseStep, selector: "", steps: [] };
    case "apiRequest":
      return { ...baseStep, method: "GET", url: "" };
    case "extractVariable":
      return { ...baseStep, source: "", storeAs: "" };
    case "shell":
      return { ...baseStep, command: "" };
    case "getArguments":
      return { ...baseStep, required: [] };
    case "invokeAction":
      return { ...baseStep, name: "" };
    case "tryCatch":
      return { ...baseStep, try: [] };
    case "writeFile":
      return { ...baseStep, path: "", content: "" };
    default:
      return baseStep;
  }
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
      return `wait: ${String(step.ms ?? step.selector ?? step.urlContains ?? "")}`;
    case "apiRequest":
      return `${String(step.method ?? "GET")} ${String(step.url ?? "")}`;
    case "shell":
      return String(step.command ?? "");
    case "extractVariable":
      return `${String(step.source ?? "")} -> ${String(step.storeAs ?? "")}`;
    case "getArguments":
      return `required: ${Array.isArray(step.required) ? step.required.length : 0}`;
    case "invokeAction":
      return `name: ${String(step.name ?? "")}`;
    case "forEachElement":
      return `selector: ${String(step.selector ?? "")}`;
    case "tryCatch":
      return "try/catch block";
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
  if (fieldType === "string") {
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

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
