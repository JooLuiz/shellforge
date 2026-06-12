const RUNTIME_PLACEHOLDER_REGEX = /^\{\{\s*(context|env)\.[^}]+\s*\}\}$/;

export function isValidIfElseLeftOperand(value: string): boolean {
  const trimmedValue = value.trim();
  return RUNTIME_PLACEHOLDER_REGEX.test(trimmedValue);
}
