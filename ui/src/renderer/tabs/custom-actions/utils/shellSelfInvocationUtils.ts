import type { ActionStep } from "../../../../shared/types";
import type { ActionEditorDraft } from "../types";

const INTERPOLATION_ONLY_REGEX = /^\{\{\s*(context|env)\.[^}]+\s*\}\}$/;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isInterpolationOnlyCommand(commandText: string): boolean {
  return INTERPOLATION_ONLY_REGEX.test(commandText.trim());
}

function dedupeTokensCaseInsensitive(tokens: string[]): string[] {
  const seenLowercase = new Set<string>();
  const dedupedTokens: string[] = [];

  tokens.forEach((token) => {
    const trimmedToken = token.trim();
    if (trimmedToken.length === 0) {
      return;
    }

    const lowercaseToken = trimmedToken.toLowerCase();
    if (seenLowercase.has(lowercaseToken)) {
      return;
    }

    seenLowercase.add(lowercaseToken);
    dedupedTokens.push(trimmedToken);
  });

  return dedupedTokens;
}

export function collectShellCommandTexts(step: ActionStep): string[] {
  const shellTexts: string[] = [];

  if (typeof step.command === "string") {
    shellTexts.push(step.command);
  }

  if (Array.isArray(step.commands)) {
    step.commands
      .filter((entry): entry is string => typeof entry === "string")
      .forEach((entry) => shellTexts.push(entry));
  }

  return shellTexts;
}

export function buildSelfInvocationTokens(draft: ActionEditorDraft): string[] {
  const actionName = draft.actionName.trim();
  const tokens: string[] = [];

  if (actionName.length > 0) {
    tokens.push(actionName);
  }

  if (draft.customActionUi.availableOnCLI) {
    draft.customActionUi.aliases
      .filter((alias) => typeof alias === "string" && alias.trim().length > 0)
      .forEach((alias) => tokens.push(alias.trim()));

    if (actionName.length > 0) {
      tokens.push(actionName);
    }
  }

  return dedupeTokensCaseInsensitive(tokens);
}

function tokenMatchesFlagPattern(commandText: string, token: string): boolean {
  const escapedToken = escapeRegExp(token);
  const flagPatterns = [
    new RegExp(`--action\\s*=\\s*${escapedToken}\\b`, "i"),
    new RegExp(`--action\\s+${escapedToken}\\b`, "i"),
    new RegExp(`action\\s*=\\s*${escapedToken}\\b`, "i"),
    new RegExp(`-a\\s*=\\s*${escapedToken}\\b`, "i"),
    new RegExp(`-a\\s+${escapedToken}\\b`, "i"),
  ];

  return flagPatterns.some((pattern) => pattern.test(commandText));
}

function tokenMatchesStandalone(commandText: string, token: string): boolean {
  const escapedToken = escapeRegExp(token);
  const standalonePattern = new RegExp(`(^|[\\s;&|])${escapedToken}(\\b|$)`, "i");
  return standalonePattern.test(commandText);
}

export function shellTextInvokesSelf(commandText: string, tokens: string[]): boolean {
  const trimmedCommand = commandText.trim();
  if (trimmedCommand.length === 0 || isInterpolationOnlyCommand(trimmedCommand)) {
    return false;
  }

  return tokens.some(
    (token) =>
      tokenMatchesFlagPattern(trimmedCommand, token) ||
      tokenMatchesStandalone(trimmedCommand, token),
  );
}

export function shellStepInvokesSelf(step: ActionStep, tokens: string[]): boolean {
  return collectShellCommandTexts(step).some((commandText) =>
    shellTextInvokesSelf(commandText, tokens),
  );
}
