import { useMemo } from "react";
import type { MouseEvent } from "react";
import { useModalEscapeClose } from "./useModalEscapeClose";

interface UseModalDismissOptions {
  enabled?: boolean;
  useCapture?: boolean;
}

interface ModalDismissBindings {
  backdropProps: {
    onMouseDown: () => void;
  };
  panelProps: {
    onMouseDown: (event: MouseEvent<HTMLElement>) => void;
  };
}

export function useModalDismiss(
  onClose: () => void,
  options: UseModalDismissOptions = {},
): ModalDismissBindings {
  const { enabled = true, useCapture = false } = options;

  useModalEscapeClose(onClose, enabled, useCapture);

  return useMemo(
    () => ({
      backdropProps: {
        onMouseDown: () => {
          if (enabled) {
            onClose();
          }
        },
      },
      panelProps: {
        onMouseDown: (event: MouseEvent<HTMLElement>) => {
          event.stopPropagation();
        },
      },
    }),
    [enabled, onClose],
  );
}
