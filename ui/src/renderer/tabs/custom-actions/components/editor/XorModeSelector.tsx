interface XorOption {
  key: string;
  label: string;
}

interface XorModeSelectorProps {
  label: string;
  options: XorOption[];
  activeKey: string;
  onSelect: (selectedKey: string) => void;
}

export function XorModeSelector({
  label,
  options,
  activeKey,
  onSelect,
}: XorModeSelectorProps): JSX.Element {
  return (
    <div className="field-block">
      <span className="xor-mode-label">{label}</span>
      <div className="xor-mode-group" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`xor-mode-button${option.key === activeKey ? " xor-mode-button--active" : ""}`}
            aria-pressed={option.key === activeKey}
            onClick={() => {
              if (option.key !== activeKey) {
                onSelect(option.key);
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
