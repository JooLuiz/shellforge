import { shell } from "electron";

export function shouldOpenExternalUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

export function openExternalHttpUrl(url: string): void {
  if (!shouldOpenExternalUrl(url)) {
    return;
  }

  void shell.openExternal(url);
}
