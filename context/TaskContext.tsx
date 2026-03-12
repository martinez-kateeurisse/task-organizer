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
  // updateTask replaces one task's fields by id, keeping id and done unchanged
  updateTask: (
    id: number,
    updates: {
      title: string;
      priority: Priority;
      category: Category;
      date: string;
    },
  ) => void;
  // deleteTask removes a task from the list entirely
  deleteTask: (id: number) => void;
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

  // Merge updated fields into the matching task, leaving id and done untouched
  function updateTask(
    id: number,
    updates: {
      title: string;
      priority: Priority;
      category: Category;
      date: string;
    },
  ) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  }

  // filter returns every task except the one with the matching id — effectively deleting it
  function deleteTask(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <TaskContext.Provider
      value={{ tasks, toggleTask, addTask, updateTask, deleteTask }}
    >
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
