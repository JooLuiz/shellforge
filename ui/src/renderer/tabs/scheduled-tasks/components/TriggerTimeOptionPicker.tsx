import PrettyIcons from "js-pretty-icons";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

import { useFloatingDropdownPosition } from "../../../hooks/useFloatingDropdownPosition";

interface TriggerTimeOptionPickerProps {
  ariaLabel: string;
  isOpen: boolean;
  onChange: (nextValue: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  options: readonly string[];
  value: string;
}

export function TriggerTimeOptionPicker({
  ariaLabel,
  isOpen,
  onChange,
  onOpenChange,
  options,
  value,
}: TriggerTimeOptionPickerProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    setTriggerElement(triggerRef.current);
  }, []);

  const floatingPosition = useFloatingDropdownPosition(triggerElement, isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleDocumentMouseDown = (event: MouseEvent): void => {
      const targetNode = event.target as Node;
      if (rootRef.current?.contains(targetNode) || listRef.current?.contains(targetNode)) {
        return;
      }
      onOpenChange(false);
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [isOpen, onOpenChange]);

  const handleOptionSelect = (optionValue: string): void => {
    onChange(optionValue);
    onOpenChange(false);
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (isOpen && event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onOpenChange(false);
    }
  };

  const dropdownList = isOpen && floatingPosition ? (
    <ul
      ref={listRef}
      className="trigger-time-option-picker-list trigger-time-option-picker-list--floating"
      role="listbox"
      aria-label={ariaLabel}
      style={{
        left: `${floatingPosition.left}px`,
        top: `${floatingPosition.top}px`,
        width: `${floatingPosition.width}px`,
        maxHeight: `${floatingPosition.maxHeight}px`,
      }}
    >
      {options.map((optionValue) => (
        <li key={optionValue}>
          <button
            type="button"
            role="option"
            aria-selected={optionValue === value}
            className="scheduled-task-command-picker-option"
            onMouseDown={(event) => {
              event.preventDefault();
              handleOptionSelect(optionValue);
            }}
          >
            {optionValue}
          </button>
        </li>
      ))}
    </ul>
  ) : null;

  return (
    <div className="trigger-time-option-picker" ref={rootRef}>
      <div className="field-select-wrap">
        <button
          ref={triggerRef}
          type="button"
          className="field-select-control trigger-time-option-picker-trigger"
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          onClick={() => onOpenChange(!isOpen)}
          onKeyDown={handleTriggerKeyDown}
        >
          {value}
        </button>
        <span className="field-select-chevron" aria-hidden="true">
          <PrettyIcons icon="chevron-down" width={18} height={18} color="currentColor" />
        </span>
      </div>
      {dropdownList ? createPortal(dropdownList, document.body) : null}
    </div>
  );
}
