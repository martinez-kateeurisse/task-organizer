import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Category,
  INITIAL_CATEGORIES,
  INITIAL_TASKS,
  Task,
  TaskInput,
} from "../constants/data";
import {
  allTasksDone,
  taskDeleted,
  taskRestored,
  taskToggled,
} from "../utils/haptics";
import { cancelTaskReminder, syncTaskReminder } from "../utils/notifications";

// ─── CONTEXT TYPE ─────────────────────────────────────────────────────────────
// Describes all the data and actions that every screen can access.
interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  loading: boolean;
  toggleTask: (id: number) => void;
  addTask: (task: TaskInput) => void;
  updateTask: (id: number, updates: Partial<TaskInput>) => void;
  deleteTask: (id: number) => void;
  restoreTask: (task: Task, index: number) => void;
  markAllDone: (todayStr: string) => void;
  addCategory: (name: string, color: string) => void;
  updateCategory: (
    id: number,
    updates: { name?: string; color?: string },
  ) => void;
  deleteCategory: (id: number) => void;
}

// createContext sets up the "pipe" — screens read from it, TaskProvider writes to it
const TaskContext = createContext<TaskContextType | null>(null);

// The keys used to store and retrieve data in AsyncStorage
const STORAGE_KEY = "taskly:tasks";
const CATEGORIES_KEY = "taskly:categories";

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Load ──────────────────────────────────────────────────────────────────
  // Runs once when the app first opens: reads tasks and categories together
  // so screens can assume both exist once loading is false.
  // If nothing is saved yet (first launch), falls back to the defaults.
  useEffect(() => {
    async function loadAll() {
      try {
        const [storedTasks, storedCategories] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(CATEGORIES_KEY),
        ]);
        const loadedTasks: Task[] =
          storedTasks !== null ? JSON.parse(storedTasks) : INITIAL_TASKS;
        setTasks(loadedTasks);
        setCategories(
          storedCategories !== null
            ? JSON.parse(storedCategories)
            : INITIAL_CATEGORIES,
        );
        // Notifications live in the OS, not in storage, so they can drift while
        // the app is closed. Re-syncing on launch makes the schedule match.
        loadedTasks.forEach((t) => syncTaskReminder(t));
      } catch {
        setTasks(INITIAL_TASKS);
        setCategories(INITIAL_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  // useEffect with [tasks] runs every time the tasks array changes.
  // It writes the latest list to AsyncStorage so it survives app restarts.
  useEffect(() => {
    async function saveTasks() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch {
        // storage write failed — silently ignore for now
      }
    }
    // Only save once the initial load has run (avoids overwriting storage with []).
    // Guarding on loading (not tasks.length) so deleting the last task still persists.
    if (!loading) saveTasks();
  }, [tasks, loading]);

  // Same pattern for categories
  useEffect(() => {
    async function saveCategories() {
      try {
        await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      } catch {
        // storage write failed — silently ignore for now
      }
    }
    if (!loading) saveCategories();
  }, [categories, loading]);

  // Every mutation below re-syncs the OS notification for the affected tasks.
  // syncTaskReminder is idempotent and decides for itself whether a reminder is
  // still warranted, so callers just hand it the task's new state.

  // Flip a task's done state by its id.
  // Completing a task cancels its reminder; un-completing restores it.
  function toggleTask(id: number) {
    const target = tasks.find((t) => t.id === id);
    if (target) {
      syncTaskReminder({ ...target, done: !target.done });
      taskToggled(!target.done);
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  // Append a new task; id is a timestamp so it's always unique
  function addTask(task: TaskInput) {
    const created: Task = { ...task, id: Date.now(), done: false };
    setTasks((prev) => [...prev, created]);
    syncTaskReminder(created);
  }

  // Merge updated fields into the matching task, leaving id and done untouched
  function updateTask(id: number, updates: Partial<TaskInput>) {
    const target = tasks.find((t) => t.id === id);
    if (target) syncTaskReminder({ ...target, ...updates });
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  }

  // filter returns every task except the one with the matching id — effectively deleting it
  function deleteTask(id: number) {
    cancelTaskReminder(id);
    taskDeleted();
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  // Undo counterpart to deleteTask. Re-inserting at the original index keeps the
  // list from visibly reshuffling, and the reminder is rescheduled because
  // deleteTask cancelled it in the OS.
  function restoreTask(task: Task, index: number) {
    syncTaskReminder(task);
    taskRestored();
    setTasks((prev) => {
      if (prev.some((t) => t.id === task.id)) return prev;
      const next = [...prev];
      next.splice(Math.min(index, next.length), 0, task);
      return next;
    });
  }

  // sets done: true only on tasks due today
  function markAllDone(todayStr: string) {
    const pending = tasks.filter((t) => t.date === todayStr && !t.done);
    pending.forEach((t) => syncTaskReminder({ ...t, done: true }));
    if (pending.length > 0) allTasksDone();
    setTasks((prev) =>
      prev.map((t) => (t.date === todayStr ? { ...t, done: true } : t)),
    );
  }

  function addCategory(name: string, color: string) {
    setCategories((prev) => [...prev, { id: Date.now(), name, color }]);
  }

  // Renaming cascades to tasks, since tasks reference categories by name
  function updateCategory(
    id: number,
    updates: { name?: string; color?: string },
  ) {
    const old = categories.find((c) => c.id === id);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
    if (old && updates.name && updates.name !== old.name) {
      const newName = updates.name;
      setTasks((prev) =>
        prev.map((t) =>
          t.category === old.name ? { ...t, category: newName } : t,
        ),
      );
    }
  }

  // Tasks in the deleted category move to the first remaining one.
  // The last category can't be deleted — every task needs a home.
  function deleteCategory(id: number) {
    const victim = categories.find((c) => c.id === id);
    const fallback = categories.find((c) => c.id !== id);
    if (!victim || !fallback) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) =>
      prev.map((t) =>
        t.category === victim.name ? { ...t, category: fallback.name } : t,
      ),
    );
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        loading,
        toggleTask,
        addTask,
        updateTask,
        deleteTask,
        restoreTask,
        markAllDone,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
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
