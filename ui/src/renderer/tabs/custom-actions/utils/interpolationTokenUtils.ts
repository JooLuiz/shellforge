export interface ActiveContextToken {
  tokenStart: number;
  partialName: string;
}

const ACTIVE_CONTEXT_TOKEN_REGEX = /\{\{\s*context\.([a-zA-Z0-9_.-]*)$/;

export function findActiveContextToken(textBeforeCursor: string): ActiveContextToken | null {
  const match = textBeforeCursor.match(ACTIVE_CONTEXT_TOKEN_REGEX);
  if (!match || match.index === undefined) {
    return null;
  }

  return {
    tokenStart: match.index,
    partialName: match[1] ?? "",
  };
}

export function filterVariablesByPartialName(
  availableVariables: readonly string[],
  partialName: string,
): string[] {
  const normalizedPartialName = partialName.toLowerCase();
  return availableVariables.filter((variableName) =>
    variableName.toLowerCase().startsWith(normalizedPartialName),
  );
}

export function applyContextTokenCompletion(
  fullValue: string,
  tokenStart: number,
  cursorPosition: number,
  selectedVariable: string,
): { nextValue: string; nextCursor: number } {
  const prefix = fullValue.slice(0, tokenStart);
  const suffix = fullValue.slice(cursorPosition);
  const completedToken = `{{context.${selectedVariable}}}`;
  const nextValue = `${prefix}${completedToken}${suffix}`;
  const nextCursor = prefix.length + completedToken.length;

  return { nextValue, nextCursor };
}

export function formatContextVariableOption(variableName: string): string {
  return `{{context.${variableName}}}`;
}

export const SYSTEM_VARIABLE_OPTION_VALUE = "{{env.}}";
export const SYSTEM_VARIABLE_OPTION_LABEL = "System variable";
