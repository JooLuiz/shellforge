import { PREDEFINED_COMMAND_CATEGORY_LABELS } from "../../../shared/predefinedCommandsRegistry";
import type { PredefinedCommandFilterCategory } from "./predefinedCommandFilterUtils";

interface PredefinedCommandFiltersProps {
  activeCategory: PredefinedCommandFilterCategory;
  onCategoryChange: (nextCategory: PredefinedCommandFilterCategory) => void;
}

const FILTER_OPTIONS: Array<{ id: PredefinedCommandFilterCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "core", label: PREDEFINED_COMMAND_CATEGORY_LABELS.core },
  {
    id: "shell-lifecycle",
    label: PREDEFINED_COMMAND_CATEGORY_LABELS["shell-lifecycle"],
  },
  { id: "unix-parity", label: PREDEFINED_COMMAND_CATEGORY_LABELS["unix-parity"] },
  {
    id: "windows-utilities",
    label: PREDEFINED_COMMAND_CATEGORY_LABELS["windows-utilities"],
  },
];

export function PredefinedCommandFilters({
  activeCategory,
  onCategoryChange,
}: PredefinedCommandFiltersProps): JSX.Element {
  return (
    <div className="predefined-command-filters" role="toolbar" aria-label="Predefined command filters">
      {FILTER_OPTIONS.map((filterOption) => (
        <button
          key={filterOption.id}
          type="button"
          className={
            activeCategory === filterOption.id
              ? "filter-chip active"
              : "filter-chip"
          }
          onClick={() => onCategoryChange(filterOption.id)}
        >
          {filterOption.label}
        </button>
      ))}
    </div>
  );
}
