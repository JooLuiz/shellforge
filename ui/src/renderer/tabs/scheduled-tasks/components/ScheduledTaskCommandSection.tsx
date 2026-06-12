import type { ActionArgumentSchema } from "../../../../shared/actionArgumentSchema";
import type { ScheduledCommandDraft } from "../../../../shared/scheduledTaskCommand";
import {
  composeScheduledTaskCommand,
  getCommandInputValue,
} from "../../../../shared/scheduledTaskCommand";
import { getCommandInputFieldUpdate } from "../utils/scheduledTaskCommandDraft";
import { ScheduledTaskCommandField } from "./ScheduledTaskCommandField";
import {
  ScheduledTaskActionArgsEditor,
  ScheduledTaskCommandPreview,
  ScheduledTaskVerboseToggle,
} from "./ScheduledTaskCommandParts";

interface ScheduledTaskCommandSectionProps {
  argumentSchema: ActionArgumentSchema | null;
  commandDraft: ScheduledCommandDraft;
  commandOptions: readonly string[];
  onChange: (nextDraft: ScheduledCommandDraft) => void;
}

export function ScheduledTaskCommandSection({
  argumentSchema,
  commandDraft,
  commandOptions,
  onChange,
}: ScheduledTaskCommandSectionProps): JSX.Element {
  const commandInput = getCommandInputValue(commandDraft);
  const composedCommand = composeScheduledTaskCommand(commandDraft);

  return (
    <div className="scheduled-task-command-section">
      <div className="field-block scheduled-task-command-row">
        <span>Command</span>
        <div className="scheduled-task-command-row-controls">
          <ScheduledTaskCommandField
            value={commandInput}
            commandOptions={commandOptions}
            onChange={(nextInput) =>
              onChange({
                ...commandDraft,
                ...getCommandInputFieldUpdate(commandDraft, nextInput),
              })
            }
          />
          <ScheduledTaskVerboseToggle
            checked={commandDraft.verbose}
            onChange={(verbose) =>
              onChange({
                ...commandDraft,
                verbose,
              })
            }
          />
        </div>
      </div>

      {argumentSchema ? (
        <ScheduledTaskActionArgsEditor
          actionArgs={commandDraft.actionArgs}
          requiredArgNames={argumentSchema.required}
          optionalArgNames={argumentSchema.optional}
          onChange={(actionArgs) =>
            onChange({
              ...commandDraft,
              actionArgs,
            })
          }
        />
      ) : null}

      <ScheduledTaskCommandPreview command={composedCommand.command} />
    </div>
  );
}
