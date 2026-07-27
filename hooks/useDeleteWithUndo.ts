import { Task } from "../constants/data";
import { useTasks } from "../context/TaskContext";
import { useToast } from "../context/ToastContext";

// ─── DELETE WITH UNDO ─────────────────────────────────────────────────────────
// Deletes immediately and offers an undo, replacing the old confirm dialog.
// The task object and its position are captured before removal so restoring
// puts it back exactly where it was.

const MAX_TITLE = 28;

export function useDeleteWithUndo() {
  const { tasks, deleteTask, restoreTask } = useTasks();
  const { showToast } = useToast();

  return function remove(task: Task) {
    const index = tasks.findIndex((t) => t.id === task.id);
    deleteTask(task.id);

    const title =
      task.title.length > MAX_TITLE
        ? `${task.title.slice(0, MAX_TITLE).trimEnd()}…`
        : task.title;

    showToast(`“${title}” deleted`, {
      label: "Undo",
      onPress: () => restoreTask(task, index === -1 ? tasks.length : index),
    });
  };
}
