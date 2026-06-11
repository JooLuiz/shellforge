import type { ReactFlowInstance } from "reactflow";

const DEFAULT_PAN_SPEED = 0.5;

interface ShiftScrollPanOptions {
  panSpeed?: number;
}

function normalizeWheelDelta(event: WheelEvent): number {
  return event.deltaY * (event.deltaMode === 1 ? 20 : 1);
}

export function attachShiftScrollPan(
  reactFlowInstance: ReactFlowInstance,
  paneElement: Element,
  options: ShiftScrollPanOptions = {},
): () => void {
  const panSpeed = options.panSpeed ?? DEFAULT_PAN_SPEED;

  const handleWheel = (event: WheelEvent): void => {
    if (!event.shiftKey) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const viewport = reactFlowInstance.getViewport();
    const normalizedDelta = normalizeWheelDelta(event);
    const verticalDelta = (normalizedDelta / viewport.zoom) * panSpeed;

    void reactFlowInstance.setViewport(
      {
        x: viewport.x,
        y: viewport.y - verticalDelta,
        zoom: viewport.zoom,
      },
      { duration: 0 },
    );
  };

  paneElement.addEventListener("wheel", handleWheel, { capture: true, passive: false });

  return () => {
    paneElement.removeEventListener("wheel", handleWheel, { capture: true });
  };
}
