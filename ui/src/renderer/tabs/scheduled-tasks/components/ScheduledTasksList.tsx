import type { ScheduledTaskRecord } from "../../../../shared/types";
import { ScheduledTaskRow } from "./ScheduledTaskRow";

interface ScheduledTasksListProps {
  onEditTask: (task: ScheduledTaskRecord) => void;
  onRemoveTask: (fileName: string) => Promise<void>;
  onToggleTask: (fileName: string, isEnabled: boolean) => Promise<void>;
  tasks: ScheduledTaskRecord[];
  togglingTaskNames: string[];
}

export function ScheduledTasksList({
  onEditTask,
  onRemoveTask,
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
          onRemove={onRemoveTask}
          onToggle={onToggleTask}
        />
      ))}
    </>
  );
}
