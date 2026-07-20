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
        setTasks(storedTasks !== null ? JSON.parse(storedTasks) : INITIAL_TASKS);
        setCategories(
          storedCategories !== null
            ? JSON.parse(storedCategories)
            : INITIAL_CATEGORIES,
        );
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

  // Flip a task's done state by its id
  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  // Append a new task; id is a timestamp so it's always unique
  function addTask(task: TaskInput) {
    setTasks((prev) => [...prev, { ...task, id: Date.now(), done: false }]);
  }

  // Merge updated fields into the matching task, leaving id and done untouched
  function updateTask(id: number, updates: Partial<TaskInput>) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  }

  // filter returns every task except the one with the matching id — effectively deleting it
  function deleteTask(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  // sets done: true only on tasks due today
  function markAllDone(todayStr: string) {
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
