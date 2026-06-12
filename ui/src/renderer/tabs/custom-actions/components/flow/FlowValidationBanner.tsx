import type { FlowValidationBannerItem } from "../../utils/flowValidationUtils";

interface FlowValidationBannerProps {
  items: FlowValidationBannerItem[];
}

export function FlowValidationBanner({ items }: FlowValidationBannerProps): JSX.Element | null {
  if (items.length === 0) {
    return null;
  }

  const hasErrors = items.some((item) => item.severity === "error");

  return (
    <div
      className={
        hasErrors ? "flow-validation-banner flow-validation-banner--error" : "flow-validation-banner flow-validation-banner--warning"
      }
    >
      <strong>{hasErrors ? "Validation errors" : "Validation warnings"}</strong>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.message}</li>
        ))}
      </ul>
    </div>
  );
}
