import { execFileSync } from "node:child_process";

export function getProfilePath(): string {
  const profilePath = execFileSync(
    "powershell",
    ["-NoProfile", "-Command", "$PROFILE.CurrentUserCurrentHost"],
    {
      encoding: "utf8",
    },
  ).trim();

  if (!profilePath) {
    throw new Error("Unable to resolve $PROFILE.CurrentUserCurrentHost");
  }

  return profilePath;
}
