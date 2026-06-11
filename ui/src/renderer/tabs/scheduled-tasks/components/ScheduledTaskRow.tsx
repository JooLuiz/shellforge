import type { ScheduledTaskRecord } from "../../../../shared/types";
import { formatWeekdays } from "../utils";

interface ScheduledTaskRowProps {
  isToggling: boolean;
  onEdit: (task: ScheduledTaskRecord) => void;
  onRemove: (fileName: string) => Promise<void>;
  onToggle: (fileName: string, isEnabled: boolean) => Promise<void>;
  task: ScheduledTaskRecord;
}

export function ScheduledTaskRow({
  isToggling,
  onEdit,
  onRemove,
  onToggle,
  task,
}: ScheduledTaskRowProps): JSX.Element {
  return (
    <article className="list-row">
      <h3 className="list-row-title">{task.actionName}</h3>
      <div className="list-row-main scheduled-task-row-main">
        <div className="row-actions">
          <button
            type="button"
            className="button button-blue"
            onClick={() => onEdit(task)}
            disabled={Boolean(task.parseError)}
          >
            Edit
          </button>
          <button
            type="button"
            className="button button-red"
            onClick={() => void onRemove(task.fileName)}
          >
            Delete
          </button>
        </div>
        <div className="row-right-top scheduled-task-row-top-right">
          <label className="toggle" aria-label={`Toggle ${task.actionName}`}>
            <input
              type="checkbox"
              checked={task.isEnabled}
              disabled={isToggling}
              onChange={(event) =>
                void onToggle(task.fileName, event.target.checked)
              }
            />
            <span className="slider" />
          </label>
          <span className="status-text">
            Days: {formatWeekdays(task.weekdays)}
          </span>
        </div>
        <div className="scheduled-task-row-left-bottom">
          <p className="list-row-subtitle scheduled-task-row-subtitle">
            Command: <strong>{task.command || "Not parsed"}</strong>
          </p>
          {task.commandMetadata?.kind === "customActionAlias" ? (
            <p className="status-text scheduled-task-row-metadata">
              {[
                task.commandMetadata.verbose ? "Verbose" : null,
                task.commandMetadata.actionArgs
                  ? Object.entries(task.commandMetadata.actionArgs)
                      .map(([argName, argValue]) => `${argName}=${argValue}`)
                      .join(", ")
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
          {task.parseError ? (
            <div className="error-banner">{task.parseError}</div>
          ) : null}
        </div>
        <div className="row-right-bottom scheduled-task-row-bottom-right">
          <span className="status-text">
            Time: {task.triggerTimes.join(", ")}
          </span>
          {isToggling ? <span className="status-text">Applying...</span> : null}
        </div>
      </div>
    </article>
  );
}
