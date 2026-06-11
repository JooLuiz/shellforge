export function validateBrowserProfileKey(profileKey: string): string | null {
  const trimmedProfileKey = profileKey.trim();
  if (trimmedProfileKey.length === 0) {
    return null;
  }

  if (trimmedProfileKey.includes("/") || trimmedProfileKey.includes("\\")) {
    return 'Use only a profile key (for example "clockify"), not a path.';
  }

  if (trimmedProfileKey === "..") {
    return '".." is not allowed.';
  }

  return null;
}
