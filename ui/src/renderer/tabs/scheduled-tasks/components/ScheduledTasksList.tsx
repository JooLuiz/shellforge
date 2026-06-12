import type { ScheduledTaskRecord } from "../../../../shared/types";
import { ScheduledTaskRow } from "./ScheduledTaskRow";

interface ScheduledTasksListProps {
  onEditTask: (task: ScheduledTaskRecord) => void;
  onRequestRemoveTask: (fileName: string, displayName: string) => void;
  onToggleTask: (fileName: string, isEnabled: boolean) => Promise<void>;
  tasks: ScheduledTaskRecord[];
  togglingTaskNames: string[];
}

export function ScheduledTasksList({
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
          onEdit={onEditTask}
          onRequestRemove={onRequestRemoveTask}
          onToggle={onToggleTask}
        />
      ))}
    </>
  );
}
