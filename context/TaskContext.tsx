import { createContext, ReactNode, useContext, useState } from "react";
import { Category, INITIAL_TASKS, Priority, Task } from "../constants/data";

// ─── CONTEXT TYPE ─────────────────────────────────────────────────────────────
// Describes all the data and actions that every screen can access.
interface TaskContextType {
  tasks: Task[];
  toggleTask: (id: number) => void;
  addTask: (task: {
    title: string;
    priority: Priority;
    category: Category;
    date: string;
  }) => void;
}

// createContext sets up the "pipe" — screens read from it, TaskProvider writes to it
const TaskContext = createContext<TaskContextType | null>(null);

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
// Wrap the tab navigator with this so all tab screens share the same task list.
export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  // Flip a task's done state by its id
  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  // Append a new task; id is a timestamp so it's always unique
  function addTask(task: {
    title: string;
    priority: Priority;
    category: Category;
    date: string;
  }) {
    setTasks((prev) => [...prev, { ...task, id: Date.now(), done: false }]);
  }

  return (
    <TaskContext.Provider value={{ tasks, toggleTask, addTask }}>
      {children}
    </TaskContext.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
// Call useTasks() inside any screen to get tasks + actions without prop-drilling.
export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used inside TaskProvider");
  return ctx;
}
