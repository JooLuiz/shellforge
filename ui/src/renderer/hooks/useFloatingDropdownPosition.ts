import { useLayoutEffect, useState } from "react";

import {
  computeFloatingDropdownPosition,
  type FloatingDropdownPosition,
} from "./floatingDropdownPosition";

export function useFloatingDropdownPosition(
  anchorElement: HTMLElement | null,
  isOpen: boolean,
): FloatingDropdownPosition | null {
  const [position, setPosition] = useState<FloatingDropdownPosition | null>(null);

  useLayoutEffect(() => {
    if (!isOpen || !anchorElement) {
      setPosition(null);
      return;
    }

    const updatePosition = (): void => {
      const anchorRect = anchorElement.getBoundingClientRect();
      setPosition(computeFloatingDropdownPosition({ anchorRect }));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorElement, isOpen]);

  return position;
}
