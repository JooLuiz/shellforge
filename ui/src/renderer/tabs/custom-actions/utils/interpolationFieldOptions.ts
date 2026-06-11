import {
  formatContextVariableOption,
  SYSTEM_VARIABLE_OPTION_LABEL,
  SYSTEM_VARIABLE_OPTION_VALUE,
} from "./interpolationTokenUtils";

export interface InterpolationFieldOption {
  label: string;
  value: string;
}

export function buildInterpolationFieldOptions(
  availableVariables: readonly string[],
): InterpolationFieldOption[] {
  const contextOptions = availableVariables.map((variableName) => ({
    label: formatContextVariableOption(variableName),
    value: formatContextVariableOption(variableName),
  }));

  return [
    {
      label: SYSTEM_VARIABLE_OPTION_LABEL,
      value: SYSTEM_VARIABLE_OPTION_VALUE,
    },
    ...contextOptions,
  ];
}
