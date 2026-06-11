import type { FlowBreadcrumbSegment } from "../../types";

interface FlowScopeBreadcrumbProps {
  segments: FlowBreadcrumbSegment[];
  onNavigate: (containerPath: FlowBreadcrumbSegment["containerPath"]) => void;
}

export function FlowScopeBreadcrumb({
  segments,
  onNavigate,
}: FlowScopeBreadcrumbProps): JSX.Element | null {
  if (segments.length <= 1) {
    return null;
  }

  return (
    <nav className="flow-scope-breadcrumb" aria-label="Flow scope breadcrumb">
      {segments.map((segment, segmentIndex) => {
        const isActive = segmentIndex === segments.length - 1;

        return (
          <span key={`${segment.label}-${segmentIndex}`} className="flow-scope-breadcrumb-item">
            {segmentIndex > 0 ? (
              <span className="flow-scope-breadcrumb-separator" aria-hidden>
                &gt;
              </span>
            ) : null}
            {isActive ? (
              <span className="flow-scope-breadcrumb-segment flow-scope-breadcrumb-segment--active">
                {segment.label}
              </span>
            ) : (
              <button
                type="button"
                className="flow-scope-breadcrumb-segment"
                onClick={() => onNavigate(segment.containerPath)}
              >
                {segment.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
