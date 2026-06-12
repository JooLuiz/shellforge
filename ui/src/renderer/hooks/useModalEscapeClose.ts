import { useEffect } from "react";

export function createModalEscapeKeyHandler(onClose: () => void): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || event.defaultPrevented) {
      return;
    }

    event.preventDefault();
    onClose();
  };
}

export function useModalEscapeClose(
  onClose: () => void,
  enabled = true,
  useCapture = false,
): void {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleKeyDown = createModalEscapeKeyHandler(onClose);
    window.addEventListener("keydown", handleKeyDown, useCapture);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, useCapture);
    };
  }, [onClose, enabled, useCapture]);
}
