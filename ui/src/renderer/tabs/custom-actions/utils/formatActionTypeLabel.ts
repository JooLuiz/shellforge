export function formatActionTypeLabel(actionType: string): string {
  const spaced = actionType.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.replace(/\b\w/g, (character) => character.toUpperCase());
}
