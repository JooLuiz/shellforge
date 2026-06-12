import type { ScheduledTaskRecord } from "../../../../shared/types";
import { ScheduledTaskRow } from "./ScheduledTaskRow";

interface ScheduledTasksListProps {
  canManageTasks: boolean;
  onEditTask: (task: ScheduledTaskRecord) => void;
  onRequestRemoveTask: (fileName: string, displayName: string) => void;
  onToggleTask: (fileName: string, isEnabled: boolean) => Promise<void>;
  tasks: ScheduledTaskRecord[];
  togglingTaskNames: string[];
  invalidActionNameMessage: string;
}

export function ScheduledTasksList({
  canManageTasks,
  invalidActionNameMessage,
  onEditTask,
  onRequestRemoveTask,
  onToggleTask,
  tasks,
  togglingTaskNames,
}: ScheduledTasksListProps): JSX.Element {
  return (
    <>
      {tasks.map((task) => (
        <ScheduledTaskRow
          key={task.fileName}
          task={task}
          isToggling={togglingTaskNames.includes(task.fileName)}
          canManageTasks={canManageTasks}
          invalidActionNameMessage={invalidActionNameMessage}
          onEdit={onEditTask}
          onRequestRemove={onRequestRemoveTask}
          onToggle={onToggleTask}
        />
      ))}
    </>
  );
}
