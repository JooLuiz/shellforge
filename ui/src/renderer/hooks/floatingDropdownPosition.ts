export interface FloatingDropdownPosition {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
}

interface ComputeFloatingDropdownPositionInput {
  anchorRect: DOMRect;
  viewportPadding?: number;
  preferredMaxHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
}

export function computeFloatingDropdownPosition({
  anchorRect,
  viewportPadding = 8,
  preferredMaxHeight = 280,
  viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024,
  viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768,
}: ComputeFloatingDropdownPositionInput): FloatingDropdownPosition {
  const width = anchorRect.width;
  const spaceBelow = viewportHeight - anchorRect.bottom - viewportPadding;
  const spaceAbove = anchorRect.top - viewportPadding;
  const openUpward = spaceBelow < preferredMaxHeight && spaceAbove > spaceBelow;
  const availableSpace = openUpward ? spaceAbove : spaceBelow;
  const maxHeight = Math.max(120, Math.min(preferredMaxHeight, availableSpace));
  const top = openUpward
    ? Math.max(viewportPadding, anchorRect.top - maxHeight - 2)
    : Math.min(viewportHeight - viewportPadding - maxHeight, anchorRect.bottom + 2);

  return {
    left: Math.max(viewportPadding, Math.min(anchorRect.left, viewportWidth - width - viewportPadding)),
    top,
    width,
    maxHeight,
  };
}
