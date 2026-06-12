import PrettyIcons from "js-pretty-icons";
import type { SelectHTMLAttributes } from "react";

type FieldSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function FieldSelect({ className, children, ...selectProps }: FieldSelectProps): JSX.Element {
  const selectClassName = ["field-select-control", className].filter(Boolean).join(" ");

  return (
    <div className="field-select-wrap">
      <select className={selectClassName} {...selectProps}>
        {children}
      </select>
      <span className="field-select-chevron" aria-hidden="true">
        <PrettyIcons icon="chevron-down" width={18} height={18} color="currentColor" />
      </span>
    </div>
  );
}
