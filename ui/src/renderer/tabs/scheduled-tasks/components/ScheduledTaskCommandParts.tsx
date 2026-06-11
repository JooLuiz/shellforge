import type { ReactNode } from "react";

interface ScheduledTaskVerboseToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ScheduledTaskVerboseToggle({
  checked,
  onChange,
}: ScheduledTaskVerboseToggleProps): JSX.Element {
  return (
    <label className="scheduled-task-verbose-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>Verbose (-v)</span>
    </label>
  );
}

interface ScheduledTaskCommandPreviewProps {
  command: string;
}

export function ScheduledTaskCommandPreview({
  command,
}: ScheduledTaskCommandPreviewProps): JSX.Element {
  return (
    <div className="field-block scheduled-task-command-preview">
      <span>Command preview</span>
      <pre className="code-block scheduled-task-command-preview-code">
        <code>{command || "—"}</code>
      </pre>
    </div>
  );
}

interface ScheduledTaskActionArgsEditorProps {
  actionArgs: Record<string, string>;
  requiredArgNames: readonly string[];
  optionalArgNames: readonly string[];
  onChange: (nextActionArgs: Record<string, string>) => void;
}

export function ScheduledTaskActionArgsEditor({
  actionArgs,
  requiredArgNames,
  optionalArgNames,
  onChange,
}: ScheduledTaskActionArgsEditorProps): JSX.Element {
  const requiredSet = new Set(requiredArgNames);
  const knownOptionalNames = optionalArgNames.filter((argName) => !requiredSet.has(argName));

  const renderArgField = (argName: string, isRequired: boolean): ReactNode => (
    <label key={argName} className="field-block scheduled-task-arg-field">
      <span>
        {argName}
        {isRequired ? " *" : ""}
      </span>
      <input
        value={actionArgs[argName] ?? ""}
        onChange={(event) =>
          onChange({
            ...actionArgs,
            [argName]: event.target.value,
          })
        }
      />
    </label>
  );

  return (
    <div className="scheduled-task-action-args">
      {requiredArgNames.map((argName) => renderArgField(argName, true))}
      {knownOptionalNames.map((argName) => renderArgField(argName, false))}
    </div>
  );
}
